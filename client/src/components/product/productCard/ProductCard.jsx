import React from "react";
import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";
import { getImageUrl } from "../../../utils/imageUrl";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const formatPrice = (n, currency = "USD") =>
    n == null
        ? "—"
        : new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
          }).format(n);

export default function ProductCard({ product, onDelete }) {
    const cover = product.images?.[0] || null;

    const id = product._id;
    const title = product.title || "Untitled product";
    const description = product.description || "No description.";
    const price = product.price ?? null;
    const currency = product.currency ?? "USD";
    const stock = product.stock ?? 0;

    // optional rating
    const ratingValue =
        product.rating?.average ??
        product.reviews?.avg ??
        product.rating ??
        null;
    const ratingCount = product.rating?.count ?? product.reviews?.count ?? null;

    function formatStock(stock) {
        if (stock >= 1000) {
            const k = Math.floor(stock / 1000);
            return `${k}k+`;
        }
        return stock.toString();
    }

    return (
        <Link to={`/product/${product._id}`} className={styles.card}>
            {onDelete && (
                <button
                    type="button"
                    className={styles["delete-btn"]}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    title="Delete"
                >
                    <FontAwesomeIcon icon={faXmark} size="sm" />{" "}
                    {/* size: "sm", "lg", "xl" */}
                </button>
            )}

            <div
                className={`${styles["card-media"]} ${
                    cover ? styles["has-img"] : ""
                }`}
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
            </div>

            <div className={styles["card-body"]}>
                {/* Block 1: Info */}
                <div className={styles.info}>
                    <div className={styles.title}>{title}</div>
                    <p className={styles.desc}>{description}</p>
                </div>

                {/* Block 2: Price + Stock */}
                <div className={styles.metaRow}>
                    <span className={styles.price}>
                        {formatPrice(price, currency)}
                    </span>
                    <span className={styles.stock}>
                        {stock > 0
                            ? `In stock: ${formatStock(stock)}`
                            : "Out of stock"}
                    </span>
                </div>
            </div>
        </Link>
    );
}
