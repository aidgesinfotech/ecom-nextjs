import crypto from "crypto";
import { getSiteConfig } from "./site-config";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface PurchaseEventInput {
  orderId: number;
  total: number;
  currency?: string;
  customerName: string;
  phone: string;
  email?: string | null;
  productName: string;
}

/** Fire-and-forget Meta Conversions API Purchase event (server-side only). */
export async function sendMetaPurchaseEvent(input: PurchaseEventInput): Promise<void> {
  try {
    const config = await getSiteConfig();
    const pixelId = config.metaPixelId.trim();
    const token = config.metaCapiAccessToken.trim();
    if (!pixelId || !token) return;

    const [firstName] = input.customerName.trim().split(/\s+/);
    const eventTime = Math.floor(Date.now() / 1000);

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: eventTime,
          event_id: `order_${input.orderId}`,
          action_source: "website",
          user_data: {
            ph: [sha256(input.phone.replace(/\D/g, ""))],
            fn: firstName ? [sha256(firstName)] : undefined,
            em: input.email ? [sha256(input.email)] : undefined,
          },
          custom_data: {
            currency: input.currency || "INR",
            value: input.total,
            content_name: input.productName,
            order_id: String(input.orderId),
          },
        },
      ],
      access_token: token,
    };

    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Meta CAPI error:", text);
    }
  } catch (err) {
    console.error("Meta CAPI failed:", err);
  }
}
