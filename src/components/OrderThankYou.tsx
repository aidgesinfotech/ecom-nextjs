"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Clock,
  Hash,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import "@/styles/order-thankyou.css";

export interface OrderConfirmation {
  orderId: number;
  displayId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  product: Product;
  size: string;
  quantity: number;
  total: number;
  placedAt: Date;
}

function formatOrderDate(d: Date) {
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function addBusinessDays(start: Date, days: number) {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

export default function OrderThankYou({
  order,
  onClose,
}: {
  order: OrderConfirmation;
  onClose: () => void;
}) {
  const firstName = order.customerName.split(" ")[0] || order.customerName;
  const estDelivery = addBusinessDays(order.placedAt, 7);

  return (
    <div className="order-thankyou">
      <div className="order-thankyou-hero">
        <div className="order-thankyou-check">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        <h1>Order Confirmed! 🎉</h1>
        <p>
          Thank you, <strong>{firstName}</strong>! Your order has been placed successfully and
          will be delivered to you soon.
        </p>
        <div className="order-id-badge">
          # Order ID: <strong>{order.displayId}</strong>
        </div>
      </div>

      <div className="order-thankyou-body">
        <div className="order-status-card">
          <h2>Order Status</h2>
          <div className="order-status-track">
            <div className="order-status-step active">
              <div className="order-status-dot">
                <Check size={14} />
              </div>
              <div className="order-status-label">Order Placed</div>
              <div className="order-status-sub">{formatOrderDate(order.placedAt)}</div>
            </div>
            <div className="order-status-line active" />
            <div className="order-status-step active current">
              <div className="order-status-dot">
                <Package size={14} />
              </div>
              <div className="order-status-label">Processing</div>
              <div className="order-status-sub">Our team is preparing your order</div>
            </div>
            <div className="order-status-line" />
            <div className="order-status-step">
              <div className="order-status-dot muted">
                <Truck size={14} />
              </div>
              <div className="order-status-label">Out for Delivery</div>
              <div className="order-status-sub">
                Est. by{" "}
                {estDelivery.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="order-status-line" />
            <div className="order-status-step">
              <div className="order-status-dot muted">
                <Check size={14} />
              </div>
              <div className="order-status-label">Delivered</div>
              <div className="order-status-sub">Pay on delivery (COD)</div>
            </div>
          </div>
        </div>

        <div className="order-thankyou-grid">
          <div className="order-card">
            <h3>
              <ShoppingBag size={18} /> Items Ordered
            </h3>
            <div className="order-item-row">
              {order.product.images[0] && (
                <Image
                  src={order.product.images[0]}
                  alt=""
                  width={56}
                  height={56}
                  className="order-item-img"
                />
              )}
              <div className="order-item-info">
                <p className="order-item-name">{order.product.name}</p>
                <div className="order-item-tags">
                  <span>Size: {order.size}</span>
                  <span>Qty: {order.quantity}</span>
                </div>
              </div>
              <div className="order-item-price">{formatPrice(order.total)}</div>
            </div>
            <div className="order-item-totals">
              <div className="order-item-total-row">
                <span>Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="order-item-total-row">
                <span>Shipping</span>
                <span className="free">FREE</span>
              </div>
              <div className="order-item-total-row grand">
                <span>Total (COD)</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="order-side-col">
            <div className="order-card">
              <h3>
                <MapPin size={18} /> Delivery Address
              </h3>
              <div className="order-address-grid">
                <div className="order-address-item">
                  <User size={14} />
                  <div>
                    <span className="order-address-label">NAME</span>
                    <p>{order.customerName}</p>
                  </div>
                </div>
                <div className="order-address-item">
                  <Phone size={14} />
                  <div>
                    <span className="order-address-label">PHONE</span>
                    <p>{order.phone}</p>
                  </div>
                </div>
                <div className="order-address-item">
                  <MapPin size={14} />
                  <div>
                    <span className="order-address-label">ADDRESS</span>
                    <p>{order.address}</p>
                  </div>
                </div>
                <div className="order-address-item">
                  <Hash size={14} />
                  <div>
                    <span className="order-address-label">CITY / STATE / PIN</span>
                    <p>
                      {order.city}, {order.state} – {order.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-card order-delivery-meta">
              <div className="order-meta-row">
                <Clock size={16} />
                <div>
                  <span>Estimated Delivery</span>
                  <strong>3–7 Business Days</strong>
                </div>
              </div>
              <div className="order-meta-row">
                <Truck size={16} />
                <div>
                  <span>Payment</span>
                  <strong>Cash on Delivery</strong>
                </div>
              </div>
            </div>

            <div className="order-note-box">
              <Phone size={16} />
              <p>
                Our team may call you to confirm your order. Please keep your phone reachable.
              </p>
            </div>
          </div>
        </div>

        <Link href="/" className="order-continue-btn" onClick={onClose}>
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
