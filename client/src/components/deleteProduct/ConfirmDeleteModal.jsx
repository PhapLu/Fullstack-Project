import React from "react";
import styles from "./ConfirmDeleteModal.module.scss";

export default function ConfirmDeleteModal({
  open,
  product,
  onCancel,
  onConfirm,
  loading = false,
  error = "",
}) {
  if (!open) return null;

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

        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.actions}>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={styles.btnDelete}
          >
            {loading ? "Loading…" : "DELETE"}
          </button>

          <button
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
