import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../store/cart/CartContext.jsx";
import { usd } from "../../../utils/currency.js";
import styles from "./MyCart.module.scss"; // switched to CSS module
import {
    buildCheckoutPayload,
    encryptState,
    startCheckout,
} from "../../../utils/checkoutState.js";
import { selectUser } from "../../../store/slices/authSlices.js";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function MyCart() {
    const navigate = useNavigate();
    const { items, removeItem, clear, subtotal, addItem } = useCart();
    const [qty, setQty] = useState(1);
    const delivery = items.length ? 2 : 0;
    const total = Math.max(0, subtotal + delivery);
    const user = useSelector(selectUser);

    const dec = () => setQty((q) => Math.max(1, q - 1));
    const inc = () => setQty((q) => q + 1);

    const goCheckout = async () => {
        const itemsForPayload = items.map(
            ({ id, qty, price, name, image }) => ({
                id,
                qty,
                price,
                name,
                image,
            })
        );
        const payload = buildCheckoutPayload({
            items: itemsForPayload,
            currency: "USD",
        });
        await startCheckout(navigate, payload);
    };

    return (
        <div className="container py-4">
            <h3 className="mb-3">My Cart ({items.length})</h3>
            <div className="row gy-4">
                {/* LEFT */}
                <div className="row-lg-7">
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
                                            to={`/product/${p.id}`}
                                            className={styles["product-link"]}
                                            aria-label={`View ${p.name}`}
                                        >
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className={`rounded ${styles[""]}`}
                                                style={{
                                                    width: 96,
                                                    height: 96,
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </Link>

                                        <div className="flex-grow-1">
                                            <Link
                                                to={`/product/${p.id}`}
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
                                                {usd(p.price)}
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-2">
                                            {/* Amount row */}
                                            <div className={styles.amountRow}>
                                                <div
                                                    className={styles.stepper}
                                                    role="group"
                                                    aria-label="Quantity"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={dec}
                                                        aria-label="Decrease"
                                                        className="left"
                                                    >
                                                        –
                                                    </button>
                                                    <input
                                                        className={styles.qty}
                                                        value={p.qty}
                                                        readOnly
                                                        aria-live="polite"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={inc}
                                                        aria-label="Increase"
                                                        className="right"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                className="btn text-danger fs-3 ms-2"
                                                onClick={() => removeItem(p.id)}
                                                title="Remove item"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
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
                                    className="btn btn-outline-primary btn-lg"
                                    onClick={clear}
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div className="col-lg-12">
                    {/* Order summary */}
                    <div
                        className={`card p-5 border-0 ${styles["hover-card"]}`}
                    >
                        <h3 className="fw-semibold mb-3">
                            Your Order ({items.length} items)
                        </h3>
                        <div className="d-flex justify-content-between">
                            <span>Subtotal</span>
                            <span>{usd(subtotal)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between">
                            <span>Delivery:</span>
                            <span>{usd(delivery)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between fw-bold fs-3">
                            <span>Total Payable:</span>
                            <span className="text-primary">{usd(total)}</span>
                        </div>
                        <button
                            className={`btn btn-primary fs-4 w-100 mt-3 ${styles["checkout"]}`}
                            onClick={goCheckout}
                        >
                            Proceed to checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
