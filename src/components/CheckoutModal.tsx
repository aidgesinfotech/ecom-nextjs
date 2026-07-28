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

type CheckoutField =
  | "firstName"
  | "phone"
  | "address"
  | "landmark"
  | "pincode"
  | "state"
  | "city";

type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

interface Props {
  product: Product;
  size: string;
  quantity: number;
  open: boolean;
  onClose: () => void;
}

function digitsOnly(value: string, maxLen: number) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

function validateCheckoutFields(fd: FormData): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};

  const firstName = (fd.get("firstName") as string).trim();
  const address = (fd.get("address") as string).trim();
  const landmark = (fd.get("landmark") as string).trim();
  const phone = digitsOnly((fd.get("phone") as string) || "", 10);
  const pincode = digitsOnly((fd.get("pincode") as string) || "", 6);
  const state = (fd.get("state") as string) || "";
  const city = (fd.get("city") as string).trim();

  if (!firstName) {
    errors.firstName = "Please enter your first name.";
  }

  if (!phone) {
    errors.phone = "please enter full 10 digit mobile no.";
  } else if (phone.length !== 10) {
    errors.phone = "please enter full 10 digit mobile no.";
  }

  if (!address) {
    errors.address = "Please enter your complete address.";
  } else if (address.length < 14) {
    errors.address = "Please enter a complete address (minimum 14 characters).";
  }

  if (landmark && landmark.length < 4) {
    errors.landmark = "Landmark must be at least 4 characters if provided.";
  }

  if (!pincode) {
    errors.pincode = "please enter valid 6 digit area pincode";
  } else if (pincode.length !== 6) {
    errors.pincode = "please enter valid 6 digit area pincode";
  }

  if (!state) {
    errors.state = "Please select your state.";
  }

  if (!city) {
    errors.city = "Please enter your city.";
  }

  return errors;
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
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(480);

  useEffect(() => {
    if (!open) return;
    setConfirmedOrder(null);
    setFieldErrors({});
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

  function clearFieldError(field: CheckoutField) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || confirmedOrder) return;

    const fd = new FormData(e.currentTarget);
    const errors = validateCheckoutFields(fd);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("");
      return;
    }

    setFieldErrors({});
    setError("");

    const firstName = (fd.get("firstName") as string).trim();
    const lastName = (fd.get("lastName") as string).trim();
    const address = (fd.get("address") as string).trim();
    const landmark = (fd.get("landmark") as string).trim();
    const phone = digitsOnly((fd.get("phone") as string) || "", 10);
    const pincode = digitsOnly((fd.get("pincode") as string) || "", 6);

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
      setLoading(false);
    } else {
      const data = await res.json();
      const errorMsg = data.error || "Order failed. Please try again.";
      if (res.status === 409) {
        setFieldErrors({ phone: errorMsg });
        setError("");
      } else {
        setError(errorMsg);
      }
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

              <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
                <div className="checkout-form-field">
                  <div className="checkout-form-group">
                    <div className="checkout-form-label">
                      <span>
                        First Name<span className="required">*</span>
                      </span>
                    </div>
                    <div
                      className={`checkout-input-wrapper ${fieldErrors.firstName ? "has-error" : ""}`}
                    >
                      <div className="checkout-input-icon">
                        <User size={18} aria-hidden />
                      </div>
                      <input
                        className="checkout-input"
                        name="firstName"
                        placeholder="In English Language Only"
                        type="text"
                        onInput={() => clearFieldError("firstName")}
                      />
                    </div>
                  </div>
                  {fieldErrors.firstName && (
                    <p className="checkout-field-error" role="alert">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div className="checkout-form-field">
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
                </div>

                <div className="checkout-form-field">
                  <div className="checkout-form-group">
                    <div className="checkout-form-label">
                      <span>
                        Active Mobile Number<span className="required">*</span>
                      </span>
                    </div>
                    <div
                      className={`checkout-input-wrapper ${fieldErrors.phone ? "has-error" : ""}`}
                    >
                      <div className="checkout-input-icon">
                        <Phone size={18} aria-hidden />
                      </div>
                      <input
                        className="checkout-input"
                        name="phone"
                        placeholder="Enter 10 Digits Mobile Number"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        type="tel"
                        onInput={(e) => {
                          e.currentTarget.value = digitsOnly(e.currentTarget.value, 10);
                          clearFieldError("phone");
                        }}
                      />
                    </div>
                  </div>
                  {fieldErrors.phone && (
                    <p className="checkout-field-error" role="alert">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div className="checkout-form-field">
                  <div className="checkout-form-group">
                    <div className="checkout-form-label">
                      <span>
                        Complete Full Address<span className="required">*</span>
                      </span>
                    </div>
                    <div
                      className={`checkout-input-wrapper ${fieldErrors.address ? "has-error" : ""}`}
                    >
                      <div className="checkout-input-icon">
                        <MapPin size={18} aria-hidden />
                      </div>
                      <input
                        className="checkout-input"
                        name="address"
                        placeholder="House No. / Building Name / Street / Area"
                        type="text"
                        onInput={() => clearFieldError("address")}
                      />
                    </div>
                  </div>
                  {fieldErrors.address && (
                    <p className="checkout-field-error" role="alert">
                      {fieldErrors.address}
                    </p>
                  )}
                </div>

                <div className="checkout-form-field">
                  <div className="checkout-form-group">
                    <div className="checkout-form-label">
                      <span>Landmark</span>
                    </div>
                    <div
                      className={`checkout-input-wrapper ${fieldErrors.landmark ? "has-error" : ""}`}
                    >
                      <div className="checkout-input-icon">
                        <MapPin size={18} aria-hidden />
                      </div>
                      <input
                        className="checkout-input"
                        name="landmark"
                        placeholder="Nearby Landmark (Optional)"
                        type="text"
                        onInput={() => clearFieldError("landmark")}
                      />
                    </div>
                  </div>
                  {fieldErrors.landmark && (
                    <p className="checkout-field-error" role="alert">
                      {fieldErrors.landmark}
                    </p>
                  )}
                </div>

                <div className="checkout-form-field">
                  <div className="checkout-form-group">
                    <div className="checkout-form-label">
                      <span>
                        Pincode<span className="required">*</span>
                      </span>
                    </div>
                    <div
                      className={`checkout-input-wrapper ${fieldErrors.pincode ? "has-error" : ""}`}
                    >
                      <div className="checkout-input-icon">
                        <Hash size={18} aria-hidden />
                      </div>
                      <input
                        className="checkout-input"
                        name="pincode"
                        placeholder="Enter 6 Digit Pincode"
                        inputMode="numeric"
                        maxLength={6}
                        type="text"
                        onInput={(e) => {
                          e.currentTarget.value = digitsOnly(e.currentTarget.value, 6);
                          clearFieldError("pincode");
                        }}
                      />
                    </div>
                  </div>
                  {fieldErrors.pincode && (
                    <p className="checkout-field-error" role="alert">
                      {fieldErrors.pincode}
                    </p>
                  )}
                </div>

                <div className="checkout-form-field">
                  <div className="checkout-form-group">
                    <div className="checkout-form-label">
                      <span>
                        State<span className="required">*</span>
                      </span>
                    </div>
                    <select
                      name="state"
                      className={`checkout-select ${fieldErrors.state ? "has-error" : ""}`}
                      defaultValue=""
                      onChange={() => clearFieldError("state")}
                    >
                      <option value="">State</option>
                      {CHECKOUT_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.state && (
                    <p className="checkout-field-error" role="alert">
                      {fieldErrors.state}
                    </p>
                  )}
                </div>

                <div className="checkout-form-field">
                  <div className="checkout-form-group">
                    <div className="checkout-form-label">
                      <span>
                        City<span className="required">*</span>
                      </span>
                    </div>
                    <div
                      className={`checkout-input-wrapper ${fieldErrors.city ? "has-error" : ""}`}
                    >
                      <div className="checkout-input-icon">
                        <MapPin size={18} aria-hidden />
                      </div>
                      <input
                        className="checkout-input"
                        name="city"
                        placeholder="Enter Your City"
                        type="text"
                        onInput={() => clearFieldError("city")}
                      />
                    </div>
                  </div>
                  {fieldErrors.city && (
                    <p className="checkout-field-error" role="alert">
                      {fieldErrors.city}
                    </p>
                  )}
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
