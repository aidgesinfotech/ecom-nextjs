"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { Hash, Loader2, Lock, MapPin, Phone, User, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import OrderThankYou, { type OrderConfirmation } from "./OrderThankYou";
import "@/styles/checkout.css";

function formatDisplayOrderId(orderId: number) {
  return orderId.toString(16).toUpperCase().padStart(8, "0").slice(-8);
}

const CHECKOUT_STATES = [
  "Andhra Pradesh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Himachal Pradesh",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Tamil Nadu",
  "Telangana",
  "Uttarakhand",
  "West Bengal",
];

interface Props {
  product: Product;
  size: string;
  quantity: number;
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({
  product,
  size,
  quantity,
  open,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(480);

  useEffect(() => {
    if (!open) return;
    setConfirmedOrder(null);
    setError("");
    setLoading(false);
    setTimer(480);
    document.body.style.overflow = "hidden";
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => {
      document.body.style.overflow = "";
      clearInterval(interval);
    };
  }, [open]);

  if (!open) return null;

  const total = product.price * quantity;
  const mins = Math.floor(timer / 60);
  const secs = timer % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  function digitsOnly(value: string, maxLen: number) {
    return value.replace(/\D/g, "").slice(0, maxLen);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || confirmedOrder) return;
    setError("");
    const fd = new FormData(e.currentTarget);

    const firstName = (fd.get("firstName") as string).trim();
    const lastName = (fd.get("lastName") as string).trim();
    const address = (fd.get("address") as string).trim();
    const landmark = (fd.get("landmark") as string).trim();
    const phone = digitsOnly((fd.get("phone") as string) || "", 10);
    const pincode = digitsOnly((fd.get("pincode") as string) || "", 6);

    if (address.length < 14) {
      setError("Please enter a complete address (minimum 14 characters).");
      return;
    }

    if (landmark && landmark.length < 4) {
      setError("Landmark must be at least 4 characters if provided.");
      return;
    }

    if (phone.length !== 10) {
      setError("Please enter a valid 10 digit mobile number.");
      return;
    }

    if (pincode.length !== 6) {
      setError("Please enter a valid 6 digit pincode.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: product.id,
        product_name: product.name,
        size,
        quantity,
        customer_name: `${firstName} ${lastName}`.trim(),
        phone,
        email: null,
        address,
        landmark: landmark || null,
        city: (fd.get("city") as string).trim(),
        state: fd.get("state"),
        pincode,
        payment_method: "COD",
        total,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const fullAddress = landmark ? `${address}, ${landmark}` : address;
      const placedAt = new Date();

      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Purchase", {
          value: total,
          currency: "INR",
          content_name: product.name,
          order_id: String(data.order_id),
        });
      }

      setConfirmedOrder({
        orderId: data.order_id,
        displayId: formatDisplayOrderId(data.order_id),
        customerName: `${firstName} ${lastName}`.trim(),
        phone,
        address: fullAddress,
        city: (fd.get("city") as string).trim(),
        state: fd.get("state") as string,
        pincode,
        product,
        size,
        quantity,
        total,
        placedAt,
      });
    } else {
      const data = await res.json();
      setError(data.error || "Order failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="checkout-modal-overlay"
      onClick={loading || confirmedOrder ? undefined : onClose}
      role="presentation"
    >
      <div
        className={`checkout-modal ${confirmedOrder ? "thankyou-mode" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {!confirmedOrder && (
          <div className="checkout-modal-header">
            <h2 id="checkout-title">CASH ON DELIVERY</h2>
            <button type="button" className="checkout-close-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="checkout-modal-content">
          {confirmedOrder ? (
            <OrderThankYou order={confirmedOrder} onClose={onClose} />
          ) : (
            <>
              <div className="checkout-product-summary">
                <div className="checkout-image-wrap">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="checkout-product-image"
                    />
                  )}
                  <span className="checkout-qty-badge">{quantity}</span>
                </div>
                <div className="checkout-product-details">
                  <div className="checkout-product-name">{product.name}</div>
                  <div className="checkout-product-size">{size}</div>
                </div>
                <div className="checkout-product-price">{formatPrice(total)}</div>
              </div>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Shipping</span>
                  <span className="free">Free</span>
                </div>
                <div className="checkout-total-row grand-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="checkout-form-title">
                Enter Your Complete Details For Fast Express Delivery
              </div>

              <form onSubmit={handleSubmit} aria-busy={loading}>
                <div className="checkout-form-group">
                  <div className="checkout-form-label">
                    <span>
                      First Name<span className="required">*</span>
                    </span>
                  </div>
                  <div className="checkout-input-wrapper">
                    <div className="checkout-input-icon">
                      <User size={18} aria-hidden />
                    </div>
                    <input
                      className="checkout-input"
                      name="firstName"
                      placeholder="In English Language Only"
                      required
                      type="text"
                    />
                  </div>
                </div>

                <div className="checkout-form-group">
                  <div className="checkout-form-label">
                    <span>Last Name</span>
                  </div>
                  <div className="checkout-input-wrapper">
                    <div className="checkout-input-icon">
                      <User size={18} aria-hidden />
                    </div>
                    <input
                      className="checkout-input"
                      name="lastName"
                      placeholder="In English Language Only"
                      type="text"
                    />
                  </div>
                </div>

                <div className="checkout-form-group">
                  <div className="checkout-form-label">
                    <span>
                      Active Mobile Number<span className="required">*</span>
                    </span>
                  </div>
                  <div className="checkout-input-wrapper">
                    <div className="checkout-input-icon">
                      <Phone size={18} aria-hidden />
                    </div>
                    <input
                      className="checkout-input"
                      name="phone"
                      placeholder="Enter 10 Digits Mobile Number"
                      required
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      type="tel"
                      onInput={(e) => {
                        e.currentTarget.value = digitsOnly(e.currentTarget.value, 10);
                      }}
                    />
                  </div>
                </div>

                <div className="checkout-form-group">
                  <div className="checkout-form-label">
                    <span>
                      Complete Full Address<span className="required">*</span>
                    </span>
                  </div>
                  <div className="checkout-input-wrapper">
                    <div className="checkout-input-icon">
                      <MapPin size={18} aria-hidden />
                    </div>
                    <input
                      className="checkout-input"
                      name="address"
                      placeholder="House No. / Building Name / Street / Area"
                      required
                      minLength={14}
                      type="text"
                    />
                  </div>
                </div>

                <div className="checkout-form-group">
                  <div className="checkout-form-label">
                    <span>Landmark</span>
                  </div>
                  <div className="checkout-input-wrapper">
                    <div className="checkout-input-icon">
                      <MapPin size={18} aria-hidden />
                    </div>
                    <input
                      className="checkout-input"
                      name="landmark"
                      placeholder="Nearby Landmark (Optional)"
                      minLength={4}
                      type="text"
                    />
                  </div>
                </div>

                <div className="checkout-form-group">
                  <div className="checkout-form-label">
                    <span>
                      Pincode<span className="required">*</span>
                    </span>
                  </div>
                  <div className="checkout-input-wrapper">
                    <div className="checkout-input-icon">
                      <Hash size={18} aria-hidden />
                    </div>
                    <input
                      className="checkout-input"
                      name="pincode"
                      placeholder="Enter 6 Digit Pincode"
                      required
                      inputMode="numeric"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      type="text"
                      onInput={(e) => {
                        e.currentTarget.value = digitsOnly(e.currentTarget.value, 6);
                      }}
                    />
                  </div>
                </div>

                <div className="checkout-form-group">
                  <div className="checkout-form-label">
                    <span>
                      State<span className="required">*</span>
                    </span>
                  </div>
                  <select name="state" className="checkout-select" required defaultValue="">
                    <option value="">State</option>
                    {CHECKOUT_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="checkout-form-group">
                  <div className="checkout-form-label">
                    <span>
                      City<span className="required">*</span>
                    </span>
                  </div>
                  <div className="checkout-input-wrapper">
                    <div className="checkout-input-icon">
                      <MapPin size={18} aria-hidden />
                    </div>
                    <input
                      className="checkout-input"
                      name="city"
                      placeholder="Enter Your City"
                      required
                      type="text"
                    />
                  </div>
                </div>

                {error && <div className="checkout-error">{error}</div>}

                <button
                  type="submit"
                  className={`checkout-submit-btn ${loading ? "is-loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="checkout-btn-spinner" aria-hidden />
                      PLACING ORDER...
                    </>
                  ) : (
                    <>
                      <Lock size={18} className="lock-icon" aria-hidden />
                      {`COMPLETE ORDER- ${formatPrice(total)}`}
                    </>
                  )}
                </button>

                <div className="sale-timer-box">
                  Hurry! sale ends in
                  <br />
                  <span className="time">{timeStr}</span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
