"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product, SizeOption } from "@/lib/types";
import AdminButton from "./AdminButton";
import AdminModal from "./AdminModal";
import AdminToast, { type ToastMessage } from "./AdminToast";
import ConfirmDialog from "./ConfirmDialog";
import ImageUploader from "./ImageUploader";

const DEFAULT_SIZES: SizeOption[] = [
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
].map((label) => ({ label, sku: "" }));

function ProductForm({
  editing,
  saving,
  onSubmit,
  onCancel,
  onError,
}: {
  editing: Product | null;
  saving: boolean;
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    images: string[],
    sizes: SizeOption[]
  ) => void;
  onCancel: () => void;
  onError: (message: string) => void;
}) {
  const [images, setImages] = useState<string[]>(editing?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [sizes, setSizes] = useState<SizeOption[]>(
    editing?.sizes?.length ? editing.sizes : DEFAULT_SIZES
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (uploadingImages) {
      onError("Please wait — images are still uploading.");
      return;
    }
    if (images.length === 0) {
      onError("Please upload at least one product image.");
      return;
    }
    const cleaned = sizes
      .map((s) => ({ label: s.label.trim(), sku: s.sku.trim() }))
      .filter((s) => s.label);
    if (cleaned.length === 0) {
      onError("Please add at least one size.");
      return;
    }
    onSubmit(e, images, cleaned);
  }

  function updateSize(index: number, field: "label" | "sku", value: string) {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function addSize() {
    setSizes((prev) => [...prev, { label: "", sku: "" }]);
  }

  function removeSize(index: number) {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form id="product-form" className="admin-form admin-form-grid" onSubmit={handleSubmit}>
      <div className="admin-form-full">
        <label htmlFor="name">Product Name</label>
        <input
          id="name"
          name="name"
          required
          placeholder="e.g. Modern Men's Stylish Cargo Pants (Pack of 3)"
          defaultValue={editing?.name || ""}
        />
      </div>

      <div className="admin-form-full">
        <label htmlFor="description">Description (HTML)</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="<h3>WHY YOU'LL LOVE IT</h3><ul><li>Premium cotton blend</li></ul>"
          defaultValue={editing?.description || ""}
        />
        <span className="admin-field-hint">Supports HTML for product page sections</span>
      </div>

      <div>
        <label htmlFor="price">Selling Price (₹)</label>
        <input
          id="price"
          name="price"
          type="number"
          min={1}
          required
          defaultValue={editing?.price || 999}
        />
      </div>
      <div>
        <label htmlFor="compare_price">Compare Price (₹)</label>
        <input
          id="compare_price"
          name="compare_price"
          type="number"
          min={0}
          defaultValue={editing?.compare_price || 2499}
        />
      </div>

      <div className="admin-form-full">
        <label>Product Images</label>
        <ImageUploader
          value={images}
          onChange={setImages}
          onUploadingChange={setUploadingImages}
          disabled={saving}
        />
        <span className="admin-field-hint">
          First image is the main product photo. Drag & drop or click to upload — files go to Hostinger via FTP.
        </span>
      </div>

      <div className="admin-form-full">
        <label htmlFor="sku">Base Product SKU</label>
        <input
          id="sku"
          name="sku"
          placeholder="Fallback SKU if size SKU is empty"
          defaultValue={editing?.sku || ""}
        />
        <span className="admin-field-hint">
          Used for Shipeaso when a size-specific SKU is not set.
        </span>
      </div>

      <div className="admin-form-full">
        <label>Sizes &amp; SKUs</label>
        <div className="admin-size-sku-list">
          <div className="admin-size-sku-header">
            <span>Size</span>
            <span>SKU (Shipeaso)</span>
            <span />
          </div>
          {sizes.map((row, index) => (
            <div key={index} className="admin-size-sku-row">
              <input
                type="text"
                value={row.label}
                onChange={(e) => updateSize(index, "label", e.target.value)}
                placeholder="e.g. 32"
                required
                aria-label={`Size label ${index + 1}`}
              />
              <input
                type="text"
                value={row.sku}
                onChange={(e) => updateSize(index, "sku", e.target.value)}
                placeholder="e.g. CARGO-32"
                aria-label={`Size SKU ${index + 1}`}
              />
              <AdminButton
                type="button"
                variant="ghost"
                className="admin-btn-icon admin-btn-icon-danger"
                onClick={() => removeSize(index)}
                disabled={sizes.length <= 1}
                title="Remove size"
              >
                <Trash2 size={16} />
              </AdminButton>
            </div>
          ))}
        </div>
        <AdminButton type="button" variant="outline" onClick={addSize} className="admin-add-size-btn">
          <Plus size={16} />
          Add Size
        </AdminButton>
      </div>

      <div>
        <label htmlFor="quantity">Stock Quantity</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={0}
          defaultValue={editing?.quantity || 999}
        />
      </div>
      <div>
        <label htmlFor="stock_status">Stock Status</label>
        <select name="stock_status" id="stock_status" defaultValue={editing?.stock_status || "In Stock"}>
          <option>In Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>
      <div>
        <label htmlFor="category">Category</label>
        <input id="category" name="category" defaultValue={editing?.category || "Bottom Wear"} />
      </div>

      <div className="admin-form-full">
        <label className="admin-checkbox-label">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={editing?.featured ?? true}
          />
          <span>Show on homepage (featured)</span>
        </label>
      </div>

      <div className="admin-form-full admin-modal-footer-actions">
        <AdminButton type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </AdminButton>
        {editing && (
          <Link
            href={`/product/${editing.id}`}
            className="admin-btn admin-btn-outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            Preview
          </Link>
        )}
        <AdminButton
          type="submit"
          loading={saving || uploadingImages}
          loadingLabel={
            uploadingImages
              ? "Uploading images…"
              : saving
                ? editing
                  ? "Updating..."
                  : "Adding..."
                : undefined
          }
          form="product-form"
        >
          {editing ? "Update Product" : "Add Product"}
        </AdminButton>
      </div>
    </form>
  );
}

export default function ProductsManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const closeModal = useCallback(() => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  }, [saving]);

  async function refresh() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  async function onSubmit(
    e: FormEvent<HTMLFormElement>,
    images: string[],
    sizes: SizeOption[]
  ) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      name: fd.get("name"),
      description: fd.get("description"),
      price: Number(fd.get("price")),
      compare_price: Number(fd.get("compare_price")),
      images,
      sku: String(fd.get("sku") || "").trim() || null,
      sizes,
      quantity: Number(fd.get("quantity")),
      stock_status: fd.get("stock_status"),
      category: fd.get("category"),
      featured: fd.get("featured") === "on",
    };

    try {
      const res = editing
        ? await fetch(`/api/products/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }

      setToast({
        type: "success",
        text: editing ? "Product updated successfully." : "Product added successfully.",
      });
      setModalOpen(false);
      setEditing(null);
      await refresh();
      router.refresh();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);

    const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) {
      setToast({ type: "error", text: "Failed to delete product." });
    } else {
      setToast({ type: "success", text: "Product deleted successfully." });
      if (editing?.id === deleteTarget.id) closeModal();
      await refresh();
      router.refresh();
    }

    setDeletingId(null);
    setDeleteTarget(null);
  }

  return (
    <>
      <AdminToast message={toast} onClose={() => setToast(null)} />

      <div className="admin-toolbar">
        <div>
          <p className="admin-toolbar-sub">Manage your store catalog</p>
        </div>
        <AdminButton onClick={openAdd}>
          <Plus size={18} />
          Add Product
        </AdminButton>
      </div>

      <div className="admin-card admin-card-table">
        <div className="admin-table-scroll">
        <table className="admin-table admin-products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty-state">
                    <p>No products yet</p>
                    <span>Click &quot;Add Product&quot; to create your first listing.</span>
                  </div>
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin-product-cell">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0]}
                        alt=""
                        width={48}
                        height={48}
                        className="admin-product-thumb"
                      />
                    ) : (
                      <div className="admin-product-thumb admin-product-thumb-empty" />
                    )}
                    <div>
                      <span className="admin-product-name">{p.name}</span>
                      {p.featured && <span className="admin-tag">Featured</span>}
                    </div>
                  </div>
                </td>
                <td className="admin-sku-cell">
                  {p.sku || <span className="admin-muted-text">—</span>}
                </td>
                <td>
                  <strong>₹{p.price}</strong>
                  {p.compare_price > p.price && (
                    <span className="admin-compare-price">₹{p.compare_price}</span>
                  )}
                </td>
                <td>{p.category}</td>
                <td>
                  <span
                    className={`admin-badge ${p.stock_status === "In Stock" ? "confirmed" : "cancelled"}`}
                  >
                    {p.stock_status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <Link
                      href={`/product/${p.id}`}
                      className="admin-btn admin-btn-ghost admin-btn-icon"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on site"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    <AdminButton
                      variant="ghost"
                      className="admin-btn-icon"
                      onClick={() => openEdit(p)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </AdminButton>
                    <AdminButton
                      variant="ghost"
                      className="admin-btn-icon admin-btn-icon-danger"
                      loading={deletingId === p.id}
                      loadingLabel=""
                      onClick={() => setDeleteTarget(p)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Product" : "Add New Product"}
        subtitle={
          editing
            ? "Update product details — changes reflect on the storefront instantly."
            : "Fill in the details below to list a new product."
        }
        size="xl"
      >
        <ProductForm
          key={editing?.id || "new"}
          editing={editing}
          saving={saving}
          onSubmit={onSubmit}
          onCancel={closeModal}
          onError={(text) => setToast({ type: "error", text })}
        />
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => !deletingId && setDeleteTarget(null)}
      />
    </>
  );
}
