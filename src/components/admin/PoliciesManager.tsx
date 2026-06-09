"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Policies } from "@/lib/policy-defaults";
import { POLICY_PAGES } from "@/lib/policy-defaults";
import AdminButton from "./AdminButton";
import AdminToast, { type ToastMessage } from "./AdminToast";

export default function PoliciesManager({ initialPolicies }: { initialPolicies: Policies }) {
  const router = useRouter();
  const [policies, setPolicies] = useState<Policies>(initialPolicies);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policies),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setPolicies(data.policies);
      setToast({ type: "success", text: "Policy pages saved successfully." });
      router.refresh();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save policies.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <form className="admin-form admin-policies-form" onSubmit={onSubmit}>
        {POLICY_PAGES.map((page) => (
          <section key={page.slug} className="admin-card admin-policy-section">
            <div className="admin-policy-section-head">
              <h2>{page.title}</h2>
              <a href={page.href} target="_blank" rel="noopener noreferrer" className="admin-policy-preview">
                Preview →
              </a>
            </div>
            <p className="admin-section-desc">
              HTML allowed — same as product descriptions. URL: <code>{page.href}</code>
            </p>
            <textarea
              rows={12}
              value={policies[page.field]}
              onChange={(e) =>
                setPolicies((prev) => ({ ...prev, [page.field]: e.target.value }))
              }
              className="admin-policy-textarea"
              required
            />
          </section>
        ))}

        <div className="admin-form-actions">
          <AdminButton type="submit" loading={saving}>
            Save All Policies
          </AdminButton>
        </div>
      </form>
    </>
  );
}
