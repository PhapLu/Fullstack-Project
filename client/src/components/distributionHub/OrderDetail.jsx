import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../pages/distributionHub/DistributionHub.module.scss";
import { FaMapMarkerAlt } from "react-icons/fa";
import { STATUS_FLOW, labelOf } from "./HubUtil.js";
import { apiUtils } from "../../utils/newRequest";
import { usd } from "../../utils/currency.js";
import { getImageUrl } from "../../utils/imageUrl.js";

export default function OrderDetail({
  role = "shipper",
  order,
  onAdvance,
  onDeliver,
  onCancel,
}) {
  const navigate = useNavigate();
  const onBack = () => {
    navigate(-1);
  };
  const { orderId } = useParams();
  const [detail, setDetail] = useState(order || null);
  const [loading, setLoading] = useState(!order);
  const [err, setErr] = useState("");

  // Always fetch full order detail for orderId
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const response = await apiUtils.get(`/order/readOrder/${orderId}`);
        if (alive) setDetail(response.data.metadata.order);
        console.log(response.data.metadata.order);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || "Failed to load order");
      } finally {
        if (alive) setLoading(false);
      }
    };
    if (orderId) load();
    return () => {
      alive = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className={styles.container} style={{ padding: 16 }}>
        Loading…
      </div>
    );
  }
  if (err) {
    return (
      <div
        className={styles.container}
        style={{ padding: 16, color: "#b91c1c" }}
      >
        {err}
        <div style={{ marginTop: 12 }}>
          <button className={styles.actions_mark} onClick={onBack}>
            ⟵ Back
          </button>
        </div>
      </div>
    );
  }
  if (!detail) {
    return (
      <div className={styles.container} style={{ padding: 16 }}>
        <h3>Order not found</h3>
        <button className={styles.actions_mark} onClick={onBack}>
          ⟵ Back
        </button>
      </div>
    );
  }

  const items = Array.isArray(detail.items) ? detail.items : [];
  const subtotal = detail.pricing.subtotal;
  const shippingFee = parseFloat(detail.pricing.shippingFee);
  const total = subtotal + shippingFee;

  return (
    <section className={`${styles.hub} ${styles.container}`}>
      <header className={styles.hub__head}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className={styles.actions_mark} onClick={onBack}>
            ⟵ Back
          </button>
          <h1 style={{ margin: 0 }}>
            ORDER DETAIL <span className={styles.loc}>#{detail._id}</span>
          </h1>
        </div>
        <p className="pt-3">
          Detailed information for shipment and delivery tracking.
        </p>
      </header>

      <article className={styles["order-card"]}>
        <div className={styles["order-card__top"]}>
          <div className={styles.route}>
            <FaMapMarkerAlt className={styles.pin} />
            <div className={styles.route__text}>
              <div>
                To: <span>{detail.deliveryInformationId.address}</span>
              </div>
            </div>
          </div>
          <div className={`${styles["status-badge"]} ${styles[detail.status]}`}>
            {labelOf(detail.status)}
          </div>
        </div>

        <div className={styles.customer}>
          <div className="col-4">
            <strong>Customer:</strong> {detail.deliveryInformationId.name}
          </div>
          <div className="col-4">
            <strong>Phone:</strong> {detail.deliveryInformationId.phoneNumber}
          </div>
          <div className="col-4">
            <strong>Placed:</strong>{" "}
            {new Date(detail.placedAt).toLocaleString()}
          </div>
        </div>

        <ul className={styles.items}>
          {items.map((it, idx) => (
            <li key={idx} className={styles.item}>
              <img src={getImageUrl(it.productId.images[0])} alt={it.name} />
              <div className={styles.item__meta}>
                <div className={styles.item__name}>{it.productId.title}</div>
                <div className={styles.item__qty}>x{it.quantity}</div>
              </div>
              <div
                className={styles.item__price}
                style={{
                  fontWeight: 700,
                }}
              >
                {usd(it.productId.price * (it.quantity ?? 1))}
              </div>
            </li>
          ))}
        </ul>

        <div style={{ paddingTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Status timeline
          </div>
          <div className={styles.timeline}>
            {STATUS_FLOW.map((s, i) => {
              const activeIdx = STATUS_FLOW.indexOf(detail.status);
              const done = activeIdx >= i;
              return (
                <div
                  key={s}
                  className={`${styles.step} ${done ? styles.done : ""}`}
                >
                  <span>{labelOf(s)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ paddingTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Payment Details
          </div>
          <div className={styles.summary}>
            <div>
              <span>Subtotal</span>
              <b>{usd(subtotal)}</b>
            </div>
            <div>
              <span>Shipping Fee</span>
              <b>{usd(shippingFee)}</b>
            </div>
            <hr />
            <div>
              <span>Total</span>
              <b className="fs-2" style={{ color: "var(--primary-color)" }}>
                {usd(total)}
              </b>
            </div>
          </div>
        </div>

        {role == !"shipper" && (
          <div className={styles["order-card__bottom"]}>
            <div className={styles.when}>
              Order #{detail._id} • {labelOf(detail.status)}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.actions_mark}
                onClick={onAdvance}
                disabled={
                  detail.status === "delivered" || detail.status === "cancelled"
                }
                title="Advance to next status"
              >
                Advance status
              </button>
              <button
                className={styles.actions_mark}
                onClick={onDeliver}
                disabled={
                  detail.status === "delivered" || detail.status === "cancelled"
                }
              >
                Mark delivered
              </button>
              <button
                className={styles.actions_cancel}
                onClick={onCancel}
                disabled={detail.status === "delivered"}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
