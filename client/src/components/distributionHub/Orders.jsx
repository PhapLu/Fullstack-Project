// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Tran Bao Tran
// ID: S3975175

import React, { useMemo, useState } from "react";
import styles from "../../pages/distributionHub/DistributionHub.module.scss";
import { FaMapMarkerAlt } from "react-icons/fa";
import { STATUS_FLOW, labelOf } from "./HubUtil.js";
import { getImageUrl } from "../../utils/imageUrl";
import { usd } from "../../utils/currency.js";
import { useNavigate } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest.js";

export default function Orders({
  hub,
  role = "shipper",
  orders = [],
  setOrders,
}) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

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
      if (sort === "newest") return new Date(b.placedAt) - new Date(a.placedAt);
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
        return STATUS_FLOW.indexOf(a.status) - STATUS_FLOW.indexOf(b.status);
      return 0;
    });
    return list;
  }, [orders, filter, q, sort]);

  const handleSubmit = async (order, nextStatus) => {
    try {
      const { data } = await apiUtils.patch(
        `/order/updateOrderStatus/${order._id}`,
        { status: nextStatus }
      );
      // BE returns the updated order (adjust path if yours differs)
      const updated = data?.metadata?.order;

      setOrders?.((prev) =>
        Array.isArray(prev)
          ? prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o))
          : prev
      );
    } catch (err) {
      console.error("Failed to update order status", err);
    }
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
              <div
                className={`${styles["status-badge"]} ${styles[order.status]}`}
              >
                {labelOf(order.status)}
              </div>
            </div>

            <div className={styles.customer}>
              <div>
                <strong>Customer:</strong> {order.deliveryInformationId.name}
              </div>
              <div>
                <strong>Phone:</strong>{" "}
                {order.deliveryInformationId.phoneNumber}
              </div>
              <div>
                <strong>Order #</strong> {order._id}
              </div>
              <div>
                <strong>Placed:</strong>{" "}
                {new Date(order.placedAt).toLocaleString()}
              </div>
            </div>

            <ul className={styles.items}>
              {(order.items || []).map((item, idx) => (
                <li key={idx} className={styles.item}>
                  <img
                    src={getImageUrl(item.productId.images[0])}
                    alt={item.name}
                  />
                  <div className={styles.item__meta}>
                    <div className={styles.item__name}>{item.title}</div>
                    <div className={styles.item__qty}>x{item.quantity}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.price}>
              <span>Price</span>
              <strong>
                {usd(order.status === "paid" ? 0 : order.pricing.total ?? 0)}
              </strong>
            </div>

            <div className={styles["order-card__bottom"]}>
              <div className={styles.actions}>
                <button
                  className={styles.actions_mark}
                  onClick={() => navigate(`/order/${order._id}`)}
                >
                  View detail
                </button>

                {role === "shipper" && (
                  <>
                    <button
                      className={styles.actions_mark}
                      onClick={() => handleSubmit(order, "delivered")}
                      disabled={
                        order.status === "delivered" ||
                        order.status === "cancelled"
                      }
                    >
                      Mark delivered
                    </button>
                    <button
                      className={styles.actions_cancel}
                      onClick={() => handleSubmit(order, "cancelled")}
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
