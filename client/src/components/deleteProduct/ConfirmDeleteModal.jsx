import React, { useState } from "react";
import styles from "./ConfirmDeleteModal.module.scss";
import { apiUtils } from "../../utils/newRequest";

export default function ConfirmDeleteModal({
  open,
  product,
  onCancel,
  onDeleted,
  setProducts,
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  const handleDelete = async (id) => {
    if (!product?._id) {
      setErr("Missing product id.");
      return;
    }
    try {
      setLoading(true);
      setErr("");
      setProducts((prev) => {
        return prev.filter((p) => p._id !== id); 
      });
      const res = await apiUtils.delete(`/product/deleteProduct/${id}`);
      onDeleted?.(id);
      console.log(res);
      if (res.data.status === 200) {
        onCancel?.();
      }
    } catch (e) {
      setErr(e?.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onCancel} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <h3 id="delete-title">Delete product</h3>
        <p>
          You are about to delete:{" "}
          <b>{product?.title || product?.name || "—"}</b>
        </p>

        {err ? (
          <div className={styles.error} aria-live="assertive">
            {err}
          </div>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => handleDelete(product._id)}
            disabled={loading}
            className={styles.btnDelete}
          >
            {loading ? "Loading…" : "DELETE"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={styles.btnCancel}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
