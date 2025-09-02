import React from "react";
import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";
import { getImageUrl } from "../../../utils/imageUrl";

const formatPrice = (n, currency = "USD") =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

export default function ProductCard({ p, onDelete }) {
  const cover = p.media?.images?.[0] || p.images?.[0] || p.thumbnail || null;

  const id = p._id || p.id;
  const title = p.basic?.title || p.title || "Untitled product";
  const description =
    p.basic?.description || p.description || p.desc || "No description.";
  const price = p.pricing?.price ?? p.price ?? null;
  const currency = p.pricing?.currency ?? p.currency ?? "USD";
  const stock = p.inventory?.stock ?? p.stock ?? 0;

  // optional rating
  const ratingValue = p.rating?.average ?? p.reviews?.avg ?? p.rating ?? null;
  const ratingCount = p.rating?.count ?? p.reviews?.count ?? null;

  return (
    <article className={styles.card}>
      {/* Image / media */}
      <div
        className={`${styles["card-media"]} ${cover ? styles["has-img"] : ""}`}
      >
        {cover ? (
          <img
            className={styles["card-img"]}
            src={getImageUrl(cover)}
            alt={title}
          />
        ) : (
          <span className={styles["media-badge"]}>{title}</span>
        )}
        {onDelete && (
          <button
            className={styles["delete-btn"]}
            onClick={onDelete}
            title="Delete"
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles["card-body"]}>
        {/* Block 1: Info */}
        <div className={styles.info}>
          <div className={styles.title}>{title}</div>
          <p className={styles.desc}>{description}</p>
        </div>

        {/* Block 2: Price + Stock */}
        <div className={styles.metaRow}>
          <span className={styles.price}>{formatPrice(price, currency)}</span>
          <span className={styles.stock}>
            {stock > 0 ? `In stock: ${stock}` : "Out of stock"}
          </span>
        </div>

        {/* Block 3: Rating  */}
        <div className={styles.ratingRow}>
          <a className={styles.ratingLink} href={`/product/${id}#reviews`}>
            {ratingCount
              ? `${ratingCount} reviews`
              : ratingValue
              ? `Rating: ${ratingValue}/5`
              : "Rating →"}
          </a>
        </div>
      </div>
    </article>
  );
}
