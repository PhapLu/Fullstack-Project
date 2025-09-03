// src/components/CheckoutPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { decryptState } from "../../utils/checkoutState.js";
import { useCart } from "../../store/cart/CartContext.jsx";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlices";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { items: cartItems } = useCart(); // fallback if no token
    const [items, setItems] = useState([]);
    const [pricing, setPricing] = useState({
        subtotal: 0,
        shippingFee: 16500,
        shippingDiscount: 16500,
        voucher: 0,
        total: 0,
    });
    const [meta, setMeta] = useState({ currency: "VND" });

    const reduxUser = useSelector(selectUser);
    const [customer, setCustomer] = useState({
        name: reduxUser?.name ?? "",
        email: reduxUser?.email ?? "",
        phone: reduxUser?.phone ?? "",
        address: reduxUser?.address ?? "",
        country: reduxUser?.country ?? "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [payment, setPayment] = useState("cash");

    useEffect(() => {
        setCustomer((prev) => ({
            name: prev.name || reduxUser?.name || "",
            email: prev.email || reduxUser?.email || "",
            phone: prev.phone || reduxUser?.phone || "",
            address: prev.address || reduxUser?.address || "",
            country: prev.country || reduxUser?.country || "",
        }));
    }, [reduxUser]);

    // parse & decrypt ?state
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("state");
        (async () => {
            if (!token) {
                // fallback: hydrate from current cart
                const fallbackItems = cartItems.map((i) => ({
                    productId: i.id,
                    name: i.name,
                    quantity: i.qty,
                    priceAtPurchase: i.price,
                    image: i.image,
                }));
                const subtotal = fallbackItems.reduce(
                    (s, it) => s + it.priceAtPurchase * it.quantity,
                    0
                );
                const shippingFee = 16500;
                const shippingDiscount = 16500;
                const voucher = 0;
                const total =
                    subtotal + shippingFee - shippingDiscount - voucher;
                setItems(fallbackItems);
                setPricing({
                    subtotal,
                    shippingFee,
                    shippingDiscount,
                    voucher,
                    total,
                });
                return;
            }
            try {
                const data = await decryptState(token);
                // normalize to the structure this UI expects
                const normItems = (data.items || []).map((it) => ({
                    productId: it.id,
                    name: it.name,
                    quantity: it.qty,
                    priceAtPurchase: it.price,
                    image: it.image,
                }));
                const p = data.pricing || {};
                setItems(normItems);
                setPricing({
                    subtotal:
                        p.subtotal ??
                        normItems.reduce(
                            (s, i) => s + i.priceAtPurchase * i.quantity,
                            0
                        ),
                    shippingFee: p.delivery ?? 16500,
                    shippingDiscount: p.discount ?? 0,
                    voucher: p.voucher ?? 0,
                    total: p.total ?? 0,
                });
                setMeta({ currency: data.currency || "VND", ts: data.ts });
                const tokenCustomer = data.customer || {};
                setCustomer({
                    name: tokenCustomer.name ?? reduxUser?.name ?? "",
                    email: tokenCustomer.email ?? reduxUser?.email ?? "",
                    phone: tokenCustomer.phone ?? reduxUser?.phone ?? "",
                    address: tokenCustomer.address ?? reduxUser?.address ?? "",
                    country: tokenCustomer.country ?? reduxUser?.country ?? "",
                });
            } catch (e) {
                console.error("Bad checkout token, falling back to cart", e);
                navigate("/cart");
            }
        })();
    }, [location.search]);

    const formatUSD = (n) => n.toLocaleString("en-US");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({ ...prev, [name]: value }));
    };

    const handlePurchase = () => {
        if (
            !customer.name.trim() ||
            !customer.phone.trim() ||
            !customer.address.trim()
        ) {
            return alert("Please fill in complete delivery information.");
        }
        if (isEditing) {
            return alert("You are editing, click Save before purchasing.");
        }

        navigate(`/order-success?id=temp_${Date.now()}`, {
            state: {
                customer,
                payment,
                items,
                pricing,
                placedAt: new Date().toISOString(),
            },
        });
    };

    return (
        <div className="container py-4">
            <h3 className="fw-bold mb-4">Checkout</h3>

            {/* Customer Info */}
            <div className="card mb-3 shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h4 className="fw-bold mb-0">Customer Information</h4>
                        <button
                            className="btn btn-sm btn-link text-primary p-0"
                            onClick={() => setIsEditing((v) => !v)}
                            style={{ fontSize: "12px" }}
                        >
                            {isEditing ? "Save" : "Edit"}
                        </button>
                    </div>

                    {!isEditing ? (
                        <div className="lh-lg fs-7">
                            {" "}
                            <div className="mb-2">
                                <span className="fw-bold me-2">Name:</span>
                                <span>{customer?.name}</span>
                            </div>
                            <div className="mb-2">
                                <span className="fw-bold me-2">Phone:</span>
                                <span>{customer?.phone}</span>
                            </div>
                            <div className="mb-0">
                                <span className="fw-bold me-2">Address:</span>
                                <span>{customer?.address}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold fs-7">
                                    Name
                                </label>
                                <input
                                    name="name"
                                    className="form-control form-control-lg fs-7"
                                    value={customer?.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold fs-7">
                                    Phone
                                </label>
                                <input
                                    name="phone"
                                    className="form-control form-control-lg fs-7"
                                    value={customer.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-semibold fs-7">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    rows={3}
                                    className="form-control form-control-lg fs-7"
                                    value={customer.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products */}
            <div className="card mb-3 shadow-sm">
                <div className="card-body">
                    <h4 className="fw-bold mb-0 mb-3">Your Items</h4>
                    {items.map((item) => (
                        <div
                            key={item?.productId}
                            className="d-flex justify-content-between align-items-center mb-3"
                        >
                            <img
                                src={
                                    item?.image ||
                                    "https://via.placeholder.com/80"
                                }
                                alt={item?.name}
                                style={{
                                    width: 80,
                                    height: 80,
                                    objectFit: "cover",
                                }}
                                className="rounded"
                            />
                            <div className="flex-grow-1 ms-3">
                                <p className="mb-1 fw-semibold">{item?.name}</p>
                                <div className="text-danger fw-bold">
                                    ${formatUSD(item?.priceAtPurchase)}
                                </div>
                            </div>
                            <span>x{item?.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Method */}
            <div className="card mb-3 shadow-sm">
                <div className="card-body">
                    <h4 className="fw-bold mb-3">Payment Method</h4>
                    {["cash", "card"].map((m) => (
                        <div className="form-check mb-2" key={m}>
                            <input
                                type="radio"
                                id={`pay-${m}`}
                                className="form-check-input"
                                value={m}
                                checked={payment === m}
                                onChange={(e) => setPayment(e.target.value)}
                            />
                            <label
                                className="form-check-label"
                                htmlFor={`pay-${m}`}
                            >
                                {m === "cash"
                                    ? "Cash on Delivery"
                                    : "Credit / Debit Card"}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Details */}
            <div className="card mb-3 shadow-sm">
                <div className="card-body lh-lg">
                    <h4 className="fw-bold mb-2">Payment Details</h4>
                    <div className="d-flex justify-content-between">
                        <span>Subtotal</span>
                        <span>${formatUSD(pricing.subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span>Shipping Fee</span>
                        <span>${formatUSD(pricing.shippingFee)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span>Shipping Discount</span>
                        <span>-${formatUSD(pricing.shippingDiscount)}</span>
                    </div>
                    <hr />
                    <div
                        className="d-flex justify-content-between"
                        style={{ fontSize: "18px" }}
                    >
                        <strong>Total</strong>
                        <strong className="text-danger">
                            ${formatUSD(pricing.total)}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
                <button
                    className="btn btn-outline-secondary px-4 py-3 fw-bold rounded-pill"
                    style={{ fontSize: "12px" }}
                    onClick={() => navigate("/cart")}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-primary px-4 py-3 fw-bold rounded-pill"
                    style={{ fontSize: "12px" }}
                    onClick={handlePurchase}
                    disabled={isEditing}
                >
                    Purchase
                </button>
            </div>
        </div>
    );
}
