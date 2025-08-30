import React from "react";
import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";

export default function ProductCard({ p, onDelete }) {
    return (
        <article className={styles.card}>
            <div
                className={`${styles["card-media"]} ${
                    p.image ? styles["has-img"] : ""
                }`}
            >
                {p.image ? (
                    <img
                        className={styles["card-img"]}
                        src={p.image}
                        alt={p.title}
                    />
                ) : (
                    <span className={styles["media-badge"]}>{p.title}</span>
                )}
                <button
                    className={styles["delete-btn"]}
                    onClick={onDelete}
                    title="Delete"
                >
                    ✕
                </button>
            </div>
            <div className={styles["card-body"]}>
                <div className={styles.title}>{p.title}</div>
                <p className={styles.desc}>{p.desc}</p>
                <a className={styles.rating} href="#rating">
                    Rating →
                </a>
            </div>
        </article>
    );}
