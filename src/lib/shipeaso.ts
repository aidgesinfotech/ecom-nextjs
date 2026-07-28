import { isShipeasoSuccess } from "./shipeaso-status";
import { getOrderById, saveShipeasoResponse, type OrderRow } from "./orders";
import { parseSizes } from "./format";
import pool from "./db";
import type { SizeOption } from "./types";
import type { RowDataPacket } from "mysql2";

export {
  getShipeasoSyncStatus,
  isShipeasoSuccess,
  parseShipeasoResponse,
  type ShipeasoSyncStatus,
} from "./shipeaso-status";

const DEFAULT_API_URL =
  "https://superadmin.shipeaso.com/api/order/non-shopify-create-orders";

export interface ShipeasoPayload {
  order_id: string;
  shop_domain: string;
  customer_email: string;
  customer_name: string;
  customer_mobileno: string;
  address_line_one: string;
  address_line_two: string;
  pincode: string;
  city: string;
  state: string;
  payment_type: "COD" | "PREPAID";
  line_items: Array<{
    sku_code: string;
    price: string;
    quantity: number;
    total_discount: number;
  }>;
}

function getShopDomain(): string {
  return process.env.SHOP_DOMAIN || "afulfillf.store";
}

function getApiUrl(): string {
  return process.env.SHIPEASO_API_URL || DEFAULT_API_URL;
}

export function resolveSku(
  productSku: string | null | undefined,
  sizes: SizeOption[],
  selectedSize: string,
  productId: string
): string {
  const match = sizes.find(
    (s) => s.label.toLowerCase() === selectedSize.trim().toLowerCase()
  );
  if (match?.sku?.trim()) return match.sku.trim();
  if (productSku?.trim()) return productSku.trim();
  return String(productId);
}

async function getProductSkuData(productId: string): Promise<{
  sku: string | null;
  sizes: SizeOption[];
}> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT sku, sizes FROM products WHERE id = ? LIMIT 1",
      [productId]
    );
    if (!rows[0]) return { sku: null, sizes: [] };
    return {
      sku: rows[0].sku ? String(rows[0].sku) : null,
      sizes: parseSizes(rows[0].sizes),
    };
  } catch {
    return { sku: null, sizes: [] };
  }
}

function splitAddress(fullAddress: string): {
  line1: string;
  line2: string;
} {
  const parts = fullAddress.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return { line1: fullAddress.trim(), line2: "" };
  }
  return {
    line1: parts[0],
    line2: parts.slice(1).join(", "),
  };
}

export async function pushOrderToShipeaso(orderId: number): Promise<OrderRow | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const log = (msg: string, data?: unknown) => {
    console.log(
      `[Shipeaso][Order ${orderId}] ${msg}`,
      data !== undefined ? JSON.stringify(data) : ""
    );
  };

  const productData = await getProductSkuData(order.product_id);
  const skuCode = resolveSku(
    productData.sku,
    productData.sizes,
    order.size,
    order.product_id
  );

  const { line1, line2 } = splitAddress(order.address || "");
  const orderIdForApi =
    order.order_number || `ORD-${order.id}-${Date.now()}`;

  const payload: ShipeasoPayload = {
    order_id: orderIdForApi,
    shop_domain: getShopDomain(),
    customer_email: order.email || "",
    customer_name: order.customer_name || "Customer",
    customer_mobileno: order.phone || "",
    address_line_one: line1,
    address_line_two: line2 || order.city || "",
    pincode: String(order.pincode || ""),
    city: order.city || "",
    state: order.state || "",
    payment_type:
      (order.payment_method || "COD").toUpperCase() === "COD"
        ? "COD"
        : "PREPAID",
    line_items: [
      {
        sku_code: skuCode,
        price: String(order.total ?? 0),
        quantity: order.quantity || 1,
        total_discount: 0,
      },
    ],
  };

  log("Sending payload", payload);

  try {
    const res = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    let responseData: unknown;
    const text = await res.text();
    try {
      responseData = JSON.parse(text);
    } catch {
      responseData = { raw: text, status: res.status };
    }

    if (!res.ok) {
      log("HTTP error", { status: res.status, data: responseData });
      await saveShipeasoResponse(
        orderId,
        JSON.stringify({
          request: payload,
          error: { status: res.status, data: responseData },
        }),
        skuCode
      );
    } else {
      const wrapped = JSON.stringify({ request: payload, response: responseData });
      if (!isShipeasoSuccess(wrapped)) {
        log("API returned non-success body", responseData);
        await saveShipeasoResponse(
          orderId,
          JSON.stringify({
            request: payload,
            response: responseData,
            error: { message: "Shipeaso response indicated failure", data: responseData },
          }),
          skuCode
        );
      } else {
        log("SUCCESS", responseData);
        await saveShipeasoResponse(orderId, wrapped, skuCode);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("ERROR", { message });
    try {
      await saveShipeasoResponse(
        orderId,
        JSON.stringify({ request: payload, error: { message } }),
        skuCode
      );
    } catch {
      /* ignore save failure */
    }
  }

  return getOrderById(orderId);
}
