import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { decryptState } from "../../utils/checkoutState.js";
import { useCart } from "../../store/cart/CartContext.jsx";
import { apiUtils } from "../../utils/newRequest";
import styles from "./CheckoutPage.module.scss";
import { getImageUrl } from "../../utils/imageUrl.js";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { items: cartItems } = useCart();

    const [items, setItems] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [pricing, setPricing] = useState({
        subtotal: 0,
        shippingFee: 2,
        shippingDiscount: 0,
        total: 0,
    });
    const [meta, setMeta] = useState({ currency: "USD" });
    const [submitting, setSubmitting] = useState(false);

    // Delivery infos
    const [deliveryInfos, setDeliveryInfos] = useState([]);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
    const selectedDelivery = useMemo(
        () =>
            Array.isArray(deliveryInfos)
                ? deliveryInfos.find(
                      (d) => String(d._id) === String(selectedDeliveryId)
                  ) || null
                : null,
        [deliveryInfos, selectedDeliveryId]
    );

    // Create/delete UI state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [createInputs, setCreateInputs] = useState({
        name: "",
        phoneNumber: "",
        address: "",
        isDefault: false,
    });

    // Create new address
    const onCreateSubmit = async (e) => {
        e.preventDefault();
        console.log(createInputs);
        if (
            !createInputs.name.trim() ||
            !createInputs.phoneNumber.trim() ||
            !createInputs.address.trim()
        ) {
            alert("Please fill in at least: Full name, Phone number, Address.");
            return;
        }
        setCreating(true);
        try {
            const res = await apiUtils.post(
                "/deliveryInformation/createDeliveryInformation",
                createInputs
            );
            const created = res?.data || null;
            await fetchDeliveryInfos(false);
            if (created?._id) setSelectedDeliveryId(String(created._id));
            setCreateInputs({
                name: "",
                phoneNumber: "",
                address: "",
                isDefault: false,
            });
            setShowCreateForm(false);
        } catch (err) {
            console.error("Create delivery information failed", err);
            alert(
                err?.response?.data?.message ||
                    "Unable to create address. Try again later."
            );
        } finally {
            setCreating(false);
        }
    };

    // Delete address
    const onDelete = async (id) => {
        if (!window.confirm("Delete this address?")) return;
        setDeletingId(String(id));
        try {
            await apiUtils.delete(
                `/deliveryInformation/deleteDeliveryInformation/${id}`
            );
            await fetchDeliveryInfos(false);
        } catch (err) {
            console.error("Delete delivery information failed", err);
            alert(
                err?.response?.data?.message ||
                    "Unable to delete address. Try again later."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const [isEditing] = useState(false); // keeps UI parity for now
    const [payment, setPayment] = useState("cash");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("state");
        (async () => {
            if (!token) {
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
                const shippingFee = 2.0;
                const total = subtotal + shippingFee;
                console.log(subtotal);
                console.log(shippingFee);
                console.log(total);
                setItems(fallbackItems);
                setPricing({
                    subtotal,
                    shippingFee,
                    total,
                });
                return;
            }
            try {
                const data = await decryptState(token);
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
                    total:
                        p.total ??
                        (p.subtotal ??
                            normItems.reduce(
                                (s, i) => s + i.priceAtPurchase * i.quantity,
                                0
                            )) + (p.delivery ?? 16500),
                });
                setMeta({ currency: data.currency || "USD", ts: data.ts });

                if (data.deliveryInformationId) {
                    setSelectedDeliveryId(String(data.deliveryInformationId));
                }
            } catch (e) {
                console.error("Bad checkout token, falling back to cart", e);
                navigate("/cart");
            }
        })();
    }, [location.search, cartItems, navigate]);

    useEffect(() => {
        const fetchHubs = async () => {
            try {
                const response = await apiUtils.get(
                    "/distributionHub/readDistributionHubs"
                );
                setHubs(response?.data?.metadata.distributionHubs || []);
            } catch (error) {
                console.error("Error fetching distribution hubs:", error);
            }
        };
        fetchHubs();
    }, []);

    // Fetch delivery infos
    const fetchDeliveryInfos = async (preserveSelection = true) => {
        try {
            const res = await apiUtils.get(
                "/deliveryInformation/readDeliveryInformations"
            );
            const list = res?.data?.metadata?.deliveryInformations || [];
            const arr = Array.isArray(list) ? list : [];
            console.log(arr);
            setDeliveryInfos(arr);

            if (arr.length > 0) {
                if (
                    preserveSelection &&
                    selectedDeliveryId &&
                    arr.some(
                        (d) => String(d._id) === String(selectedDeliveryId)
                    )
                ) {
                    return;
                }
                const defaultItem = arr.find((d) => d.isDefault) || arr[0];
                setSelectedDeliveryId(String(defaultItem._id));
            }
        } catch (err) {
            console.error("Failed to load delivery informations", err);
            setDeliveryInfos([]);
        }
    };

    useEffect(() => {
        fetchDeliveryInfos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatUSD = (n) =>
        Number(n || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const handleCashPurchase = async () => {
        if (!selectedDelivery)
            return alert("Please choose a delivery address.");

        let orderId = null;
        setSubmitting(true);
        try {
            const response = await apiUtils.post("/order/createOrder", {
                deliveryInformation: selectedDelivery,
                payment,
                items,
                pricing,
                distributionHubId: selectedDelivery.distributionHubId,
            });

            if (response.data?.metadata?.order) {
                orderId = response.data.metadata.order._id;
                navigate(`/payment-success?id=temp_${Date.now()}`, {
                    state: {
                        orderId,
                        deliveryInformation: selectedDelivery,
                        payment,
                        items,
                        pricing,
                        placedAt: new Date().toISOString(),
                    },
                });
            } else {
                throw new Error("Order was not returned by the server.");
            }
        } catch (error) {
            console.error("Order creation failed", error);
            alert(
                error?.response?.data?.message ||
                    "Order creation failed. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCardPurchase = async () => {
        if (!selectedDelivery)
            return alert("Please choose a delivery address.");
        if (!selectedDelivery.distributionHubId)
            return alert("Please choose a distribution hub.");

        setSubmitting(true);
        try {
            // Optional: pass return/cancel for gateway to bounce back
            const res = await apiUtils.post(
                "/order/createOrderAndGeneratePaymentUrl",
                {
                    deliveryInformation: selectedDelivery,
                    payment: "credit_card",
                    items,
                    pricing,
                    distributionHubId: selectedDelivery.distributionHubId,
                    returnUrl: `${window.location.origin}/payment-return`,
                    cancelUrl: `${window.location.origin}/payment-cancel`,
                }
            );
            const paymentUrl = res?.data?.metadata?.paymentUrl;
            if (!paymentUrl)
                throw new Error("No payment URL returned from server.");
            window.location.assign(paymentUrl);
        } catch (error) {
            console.error("Card payment init failed", error);
            alert(
                error?.response?.data?.message ||
                    "We couldn't start your card payment. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handlePurchase = () => {
        if (payment === "card") return handleCardPurchase();
        return handleCashPurchase();
    };

    return (
        <div className="container py-4">
            <h3 className="fw-bold mb-4">Checkout</h3>

            {/* Delivery Informations */}
            <div className="card mb-3 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="fw-bold mb-0">Delivery Information</h4>
                        <button
                            className={`btn btn-lg fs-5 btn-outline-primary ${styles["fw-500"]}`}
                            onClick={() => setShowCreateForm((v) => !v)}
                        >
                            {showCreateForm ? "Close" : "+ New Address"}
                        </button>
                    </div>

                    {showCreateForm && (
                        <form
                            onSubmit={onCreateSubmit}
                            className="border rounded p-3 mb-3"
                        >
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fs-7 fw-semibold">
                                        Full name *
                                    </label>
                                    <input
                                        className="form-control form-control-lg"
                                        value={createInputs.name}
                                        onChange={(e) =>
                                            setCreateInputs({
                                                ...createInputs,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fs-7 fw-semibold">
                                        Phone *
                                    </label>
                                    <input
                                        className="form-control form-control-lg"
                                        value={createInputs.phoneNumber}
                                        onChange={(e) =>
                                            setCreateInputs({
                                                ...createInputs,
                                                phoneNumber: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fs-7 fw-semibold">
                                        Address *
                                    </label>
                                    <input
                                        className="form-control form-control-lg"
                                        value={createInputs.address}
                                        onChange={(e) =>
                                            setCreateInputs({
                                                ...createInputs,
                                                address: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-12">
                                    <select
                                        name="distributionHub"
                                        required
                                        className="form-select form-select-lg rounded-3"
                                        value={
                                            createInputs.distributionHubId ?? ""
                                        }
                                        onChange={(e) =>
                                            setCreateInputs({
                                                ...createInputs,
                                                distributionHubId:
                                                    e.target.value,
                                            })
                                        }
                                    >
                                        <option value="" disabled>
                                            Please choose your distribution hub
                                        </option>
                                        {hubs?.map((h) => (
                                            <option key={h._id} value={h._id}>
                                                {h?.title || h.name || h._id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-12">
                                    <div className="form-check">
                                        <input
                                            id="isDefault"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={createInputs.isDefault}
                                            onChange={(e) =>
                                                setCreateInputs({
                                                    ...createInputs,
                                                    isDefault: e.target.checked,
                                                })
                                            }
                                        />
                                        <label
                                            className="form-check-label mt-1"
                                            htmlFor="isDefault"
                                        >
                                            Set as default
                                        </label>
                                    </div>
                                </div>

                                <div className="col-12 d-flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={creating}
                                    >
                                        {creating
                                            ? "Saving..."
                                            : "Save Address"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-lg"
                                        onClick={() => setShowCreateForm(false)}
                                        disabled={creating}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {deliveryInfos.length === 0 ? (
                        <div className="alert alert-warning mb-0 fs-7">
                            You have no saved addresses. Please create one.
                        </div>
                    ) : (
                        <div className="list-group">
                            {deliveryInfos.map((d) => (
                                <div
                                    key={d._id}
                                    className="list-group-item d-flex align-items-start justify-content-between gap-5"
                                >
                                    <label
                                        htmlFor={`delivery-${d._id}`}
                                        className="d-flex gap-3 flex-grow-1 mt-2 mb-2"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <input
                                            type="radio"
                                            id={`delivery-${d._id}`}
                                            className="form-check-input mt-1"
                                            name="delivery"
                                            value={String(d._id)}
                                            checked={
                                                String(selectedDeliveryId) ===
                                                String(d._id)
                                            }
                                            onChange={(e) =>
                                                setSelectedDeliveryId(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <div>
                                            <div className="fw-bold">
                                                {d.name || d.name}{" "}
                                                {d.isDefault && (
                                                    <span className="badge bg-secondary ms-2">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-muted fs-7 mt-2">
                                                {d.phoneNumber}
                                            </div>
                                            <div className="fs-7 mt-2">
                                                {d.address || ""}
                                            </div>
                                        </div>
                                    </label>

                                    <button
                                        type="button"
                                        className={`btn fs-5 btn-md btn-outline-danger ${styles["fw-500"]}`}
                                        onClick={() => onDelete(d._id)}
                                        disabled={deletingId === String(d._id)}
                                    >
                                        {deletingId === String(d._id)
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>
                                </div>
                            ))}
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
                                src={getImageUrl(item?.image)}
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
                                <div className="text-primary fw-bold">
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
                        <div
                            className="form-check mb-2 d-flex align-items-center gap-2"
                            key={m}
                        >
                            <input
                                type="radio"
                                id={`pay-${m}`}
                                className="form-check-input mt-0"
                                value={m}
                                checked={payment === m}
                                onChange={(e) => setPayment(e.target.value)}
                            />
                            <label
                                className="form-check-label mb-0"
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
                    className="btn btn-lg btn-primary px-3 py-3 fw-bold rounded"
                    style={{ fontSize: "12px" }}
                    onClick={handlePurchase}
                    disabled={
                        submitting || isEditing || deliveryInfos.length === 0
                    }
                >
                    {submitting ? "Processing..." : "Purchase"}
                </button>
            </div>
        </div>
    );
}
