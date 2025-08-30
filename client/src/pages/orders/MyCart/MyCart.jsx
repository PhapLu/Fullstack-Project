import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../store/cart/CartContext.jsx";
import { vnd } from "../../../utils/currency.js";
import styles from "./MyCart.module.scss"; // switched to CSS module

export default function MyCart() {
    const { items, setQty, removeItem, clear, subtotal, addItem } = useCart();
    const [coupon, setCoupon] = useState("");

    const delivery = items.length ? 30000 : 0;
    const discount = coupon.trim() ? 50000 : 0;
    const total = Math.max(0, subtotal + delivery - discount);

    return (
        <div className="container py-4">
            <h2 className="mb-3">My Cart ({items.length})</h2>
            <div className="row gy-4">
                {/* LEFT */}
                <div className="col-lg-8">
                    {items.length === 0 ? (
                        <div className="alert alert-info">
                            Your cart is empty.
                        </div>
                    ) : (
                        <div className="vstack gap-3">
                            {items.map((p) => (
                                <div
                                    key={p.id}
                                    className={`card p-3 shadow-sm rounded-4 border-0 ${styles["hover-card"]}`}
                                >
                                    <div className="d-flex gap-3 align-items-center">
                                        <Link
                                            to={`/products/${p.id}`}
                                            className={styles["product-link"]}
                                            aria-label={`View ${p.name}`}
                                        >
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className={`rounded ${styles["product-thumb"]}`}
                                                style={{
                                                    width: 96,
                                                    height: 96,
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </Link>

                                        <div className="flex-grow-1">
                                            <Link
                                                to={`/products/${p.id}`}
                                                className={
                                                    styles["product-link"]
                                                }
                                            >
                                                <div
                                                    className={`fw-semibold ${styles["product-title"]}`}
                                                >
                                                    {p.name}
                                                </div>
                                            </Link>
                                            {p.classification && (
                                                <div className="text-muted small">
                                                    {p.classification}
                                                </div>
                                            )}
                                            <div className="mt-2 fw-semibold">
                                                {vnd(p.price)}
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                className={`btn btn-outline-secondary btn-sm ${styles["btn-qty"]}`}
                                                onClick={() =>
                                                    setQty(
                                                        p.id,
                                                        Math.max(
                                                            1,
                                                            (p.qty || 1) - 1
                                                        )
                                                    )
                                                }
                                                disabled={p.qty <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className="px-2">
                                                {p.qty}
                                            </span>
                                            <button
                                                className={`btn btn-outline-secondary btn-sm ${styles["btn-qty"]}`}
                                                onClick={() =>
                                                    setQty(
                                                        p.id,
                                                        Math.min(
                                                            (p.qty || 1) + 1,
                                                            p.stock || Infinity
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    p.stock && p.qty >= p.stock
                                                }
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm ms-2"
                                                onClick={() => removeItem(p.id)}
                                                title="Remove item"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>

                                    {p.stock && p.qty >= p.stock && (
                                        <div className="text-danger small mt-2">
                                            Out of stock limit.
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={clear}
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div className="col-lg-4">
                    {/* Coupon box — inline input + button */}
                    <div
                        className={`card p-3 mb-3 shadow-sm rounded-4 border-0 ${styles["hover-card"]}`}
                    >
                        <div className="fw-semibold mb-2">Coupon</div>

                        <div className={styles["coupon-row"]}>
                            <input
                                className={`form-control ${styles["coupon-input"]}`}
                                placeholder="Coupon code"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                aria-label="Coupon code"
                            />
                            <button
                                type="button"
                                className={`btn btn-primary fw-semibold ${styles["coupon-btn"]}`}
                            >
                                Apply now
                            </button>
                        </div>

                        {coupon && (
                            <div className="small text-success mt-2">
                                Mock: −{vnd(50000)}
                            </div>
                        )}
                    </div>

                    {/* Order summary */}
                    <div
                        className={`card p-3 shadow-sm rounded-4 border-0 ${styles["hover-card"]}`}
                    >
                        <div className="fw-semibold mb-3">
                            Your Order ({items.length} items)
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Subtotal</span>
                            <span>{vnd(subtotal)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between">
                            <span>Delivery:</span>
                            <span>{vnd(delivery)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between fw-bold">
                            <span>Total Payable:</span>
                            <span>{vnd(total)}</span>
                        </div>
                        <button
                            className="btn btn-primary w-100 mt-3"
                            onClick={() => {
                                window.location.href =
                                    "https://example.com/checkout";
                            }}
                        >
                            Proceed to checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
