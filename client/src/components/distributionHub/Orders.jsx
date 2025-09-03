import React, { useMemo, useState } from "react";
import styles from "../../pages/distributionHub/DistributionHub.module.scss";
import { FaMapMarkerAlt } from "react-icons/fa";
import { fmt, STATUS_FLOW, labelOf } from "./HubUtil.js";
import { getImageUrl } from "../../utils/imageUrl";

export default function Orders({
    hub,
    role = "shipper",
    orders = [],
    onOpenOrder,
    onAdvance,
    onDeliver,
    onCancel,
}) {
    const [filter, setFilter] = useState("all");
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("newest");
    const [toast, setToast] = useState("");

    const filtered = useMemo(() => {
        let list = Array.isArray(orders) ? [...orders] : [];
        if (q.trim()) {
            const t = q.trim().toLowerCase();
            list = list.filter(
                (o) =>
                    String(o.id).toLowerCase().includes(t) ||
                    o.customerName?.toLowerCase().includes(t) ||
                    o.to?.toLowerCase().includes(t)
            );
        }
        if (filter !== "all") list = list.filter((o) => o.status === filter);
        list.sort((a, b) => {
            if (sort === "newest")
                return new Date(b.placedAt) - new Date(a.placedAt);
            if (sort === "price_desc")
                return (
                    (b.total ?? b.value ?? b.price ?? 0) -
                    (a.total ?? a.value ?? a.price ?? 0)
                );
            if (sort === "price_asc")
                return (
                    (a.total ?? a.value ?? a.price ?? 0) -
                    (b.total ?? b.value ?? b.price ?? 0)
                );
            if (sort === "status")
                return (
                    STATUS_FLOW.indexOf(a.status) -
                    STATUS_FLOW.indexOf(b.status)
                );
            return 0;
        });
        return list;
    }, [orders, filter, q, sort]);

    const show = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 1600);
    };

    return (
        <section className={`${styles.hub} ${styles.container}`}>
            <header className={styles.hub__head}>
                <h1>
                    Distribution Hub:{" "}
                    <span className={styles.loc}>{hub?.name ?? "—"}</span>
                </h1>
                <p>
                    {hub?.address ||
                        "See all active orders assigned to you and update the current status."}
                </p>
            </header>

            <div className={styles.controls}>
                <input
                    className={styles.searchbar}
                    placeholder="Search by order id, customer, address…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />

                <div className={styles.filters}>
                    {[
                        ["all", "All"],
                        ["active", "Active"],
                        ["at_hub", "At hub"],
                        ["out_for_delivery", "Out for delivery"],
                        ["delivered", "Delivered"],
                        ["cancelled", "Cancelled"],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            className={`${styles.chip} ${
                                filter === key ? styles["chip--active"] : ""
                            }`}
                            onClick={() => setFilter(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <select
                    className={styles.sorter}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="newest">Newest</option>
                    <option value="price_desc">Price: high → low</option>
                    <option value="price_asc">Price: low → high</option>
                    <option value="status">Status</option>
                </select>
            </div>

            {toast && <div className={styles.toast}>{toast}</div>}

            <div className={styles.hub__grid}>
                {filtered.map((order) => (
                    <article className={styles["order-card"]} key={order.id}>
                        <div className={styles["order-card__top"]}>
                            <div className={styles.route}>
                                <FaMapMarkerAlt className={styles.pin} />
                                <div className={styles.route__text}>
                                    <div>
                                        To: <span>{order.deliveryInformationId.address}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.price}>
                                <span>Value</span>
                                <strong>
                                    {fmt(order.pricing.total ?? 0)}
                                </strong>
                            </div>
                            <div
                                className={`${styles["status-badge"]} ${
                                    styles[order.status]
                                }`}
                            >
                                {labelOf(order.status)}
                            </div>
                        </div>

                        <div className={styles.customer}>
                            <div>
                                <strong>Customer:</strong> {order.deliveryInformationId.name}
                            </div>
                            <div>
                                <strong>Phone:</strong> {order.deliveryInformationId.phoneNumber}
                            </div>
                            <div>
                                <strong>Order #</strong> {order._id}
                            </div>
                        </div>

                        <ul className={styles.items}>
                            {(order.items || []).map((item, idx) => (
                                <li key={idx} className={styles.item}>
                                    <img src={getImageUrl(item.productId.images[0])} alt={item.name} />
                                    <div className={styles.item__meta}>
                                        <div className={styles.item__name}>
                                            {item.title}
                                        </div>
                                        <div className={styles.item__qty}>
                                            x{item.quantity}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className={styles["order-card__bottom"]}>
                            <div className={styles.when}>
                                Placed: {new Date(order.placedAt).toLocaleString()}
                            </div>
                            <div className={styles.actions}>
                                <button
                                    className={styles.actions_mark}
                                    onClick={() => onOpenOrder?.(order.id)}
                                >
                                    View detail
                                </button>

                                {role === "shipper" && (
                                    <>
                                        <button
                                            className={styles.actions_mark}
                                            onClick={() => {
                                                onAdvance?.(order.id);
                                                show(
                                                    `↪️ Order ${order.id} advanced`
                                                );
                                            }}
                                            disabled={
                                                order.status === "delivered" ||
                                                order.status === "cancelled"
                                            }
                                            title="Advance to next status"
                                        >
                                            Advance status
                                        </button>
                                        <button
                                            className={styles.actions_mark}
                                            onClick={() => {
                                                onDeliver?.(order.id);
                                                show(
                                                    `Order ${order.id} marked delivered`
                                                );
                                            }}
                                            disabled={
                                                order.status === "delivered" ||
                                                order.status === "cancelled"
                                            }
                                        >
                                            Mark delivered
                                        </button>
                                        <button
                                            className={styles.actions_cancel}
                                            onClick={() => onCancel?.(order.id)}
                                            disabled={
                                                order.status === "delivered" ||
                                                order.status === "cancelled"
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
