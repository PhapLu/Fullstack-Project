import React, { useEffect, useMemo, useState } from "react";
import styles from "./VendorDashboard.module.scss";
import { usd } from "../../utils/currency";
import { apiUtils } from "../../utils/newRequest";
import { Link } from "react-router-dom";


/* ================= Status → Badge ================= */
// Match your Order.status enum: placed, paid, at_hub, out_for_delivery, delivered, cancelled
const statusMeta = {
  placed: { text: "Placed", cls: "badgeNeutral" },
  paid: { text: "Paid", cls: "badgePaid" },
  at_hub: { text: "At Hub", cls: "badgeNeutral" },
  out_for_delivery: { text: "Out for delivery", cls: "badgeDelivering" },
  delivered: { text: "Delivered", cls: "badgeDelivered" },
  cancelled: { text: "Cancelled", cls: "badgeComplaint" }, // reuse a red style
};

function StatusBadge({ status }) {
  const m = statusMeta[status] || { text: status, cls: "badgeNeutral" };
  return <span className={`${styles.badge} ${styles[m.cls]}`}>{m.text}</span>;
}

/* ================= Helpers ================= */
const fmtDate = (d) => {
  if (!d) return "—";
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString();
  } catch {
    return "—";
  }
};

const joinDefined = (parts, sep = ", ") =>
  parts
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(sep);

/* ================= KPI Row ================= */
function StatsRow({ orders }) {
  // Use pricing.total as order value
  const values = orders.map((o) => o?.pricing?.total || 0);
  const max = values.length ? Math.max(...values) : 0;
  const min = values.length ? Math.min(...values) : 0;
  const avg = values.length
    ? Math.round(values.reduce((s, n) => s + n, 0) / values.length)
    : 0;

  return (
    <div className={styles.cards}>
      <div className={`${styles.card} ${styles.cardFill}`}>
        <div className={styles.cardTitle}>Order Value</div>
        <div className={styles.kv}>
          <span>Highest</span>
          <span>{usd(max)}</span>
        </div>
        <div className={styles.kv}>
          <span>Lowest</span>
          <span>{usd(min)}</span>
        </div>
        <div className={styles.kv}>
          <span>Average</span>
          <span>{usd(avg)}</span>
        </div>
      </div>
    </div>
  );
}

/* ================= Main Page ================= */
const TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New Requests" }, // placed
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "paid", label: "Paid" }, // status === 'paid'
  { key: "cancelled", label: "Cancelled" },
];

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [orders, setOrders] = useState([]);

  // Fetch orders (make sure your backend populates needed refs)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiUtils.get("/vendorDashboard/readVendorOrders");
        const raw = res?.data?.metadata?.orders ?? [];
        console.log(raw);
        setOrders(raw);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, []);

  // Count chips by status
  const counts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === "placed").length,
      out_for_delivery: orders.filter((o) => o.status === "out_for_delivery")
        .length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      paid: orders.filter((o) => o.status === "paid").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  // Filtered list per tab
  const filtered = useMemo(() => {
    switch (activeTab) {
      case "all":
        return orders;
      case "new":
        return orders.filter((o) => o.status === "placed");
      case "out_for_delivery":
        return orders.filter((o) => o.status === "out_for_delivery");
      case "delivered":
        return orders.filter((o) => o.status === "delivered");
      case "paid":
        return orders.filter((o) => o.status === "paid");
      case "cancelled":
        return orders.filter((o) => o.status === "cancelled");
      default:
        return orders;
    }
  }, [activeTab, orders]);

  const toggleRow = (id) => setExpanded((m) => ({ ...m, [id]: !m[id] }));

  // Build a UI row from a real Order
  const asRow = (o) => {
    const items = Array.isArray(o?.items) ? o.items : [];

    // product titles
    const productNames =
      items
        .map((it) => it?.productId?.title || "(Unknown product)")
        .join(", ") || "—";

    // customer: prefer backend-projected `customer.name`; fallbacks provided
    const customerName =
      o?.deliveryInformationId?.name || // DeliveryInformation.name (recipient)
      o?.customer?.name || // from backend $project
      o?.customerId?.customerProfile?.name || // only if you populate customerId elsewhere
      o?.customerId?.username ||
      "—";

    // DeliveryInformation: address
    const di = o?.deliveryInformationId || {};
    const address = di?.address || "—";

    const payment =
      (o?.paymentType === "cash" && "Cash on Delivery") ||
      (o?.paymentType === "credit_card" && "Credit Card") ||
      o?.paymentType ||
      "—";

    return {
      _id: o?._id,
      status: o?.status,
      productNames,
      customerName,
      priceTotal: o?.pricing?.total ?? 0,
      payment,
      placedAt: o?.placedAt,
      deliveredAt: o?.deliveredAt,
      address,
      items: items.map((it) => ({
        name: it?.productId?.title || "(Unknown product)", // title here
        qty: it?.quantity ?? 0,
        price: it?.priceAtPurchase ?? 0,
      })),
    };
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Order Management</h2>

      {/* Top KPI row with equal cards */}
      <StatsRow orders={orders} />

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${
              activeTab === t.key ? styles.active : ""
            }`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            <span className={styles.countChip}>{counts[t.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Order ID</th>
              <th>Products</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Placed</th>
              <th>Delivered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const o = asRow(order);
              return (
                <React.Fragment key={o._id}>
                  <tr>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td>{o._id}</td>
                    <td>{o.productNames}</td>
                    <td>{o.customerName}</td>
                    <td>{usd(o.priceTotal)}</td>
                    <td>{o.payment}</td>
                    <td>{fmtDate(o.placedAt)}</td>
                    <td>{fmtDate(o.deliveredAt)}</td>
                    <td className={styles.actions}>
                      {expanded[o._id] ? (
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => toggleRow(o._id)}
                        >
                          Hide Details
                        </button>
                      ) : (
                        <Link
                          to={`/order/${o._id}`} // <- change base path if needed
                          className={styles.linkBtn}
                        >
                          View Details
                        </Link>
                      )}

                      <a href="/" className={styles.linkBtn}>
                        Message Customer
                      </a>
                    </td>
                  </tr>

                  {expanded[o._id] && (
                    <tr className={styles.detailsRow}>
                      <td colSpan={9}>
                        <div className={styles.details}>
                          <div>
                            <div className={styles.detailsTitle}>Items</div>
                            <ul className={styles.items}>
                              {o.items.map((it, idx) => (
                                <li key={idx}>
                                  {it.name} × {it.qty} — <b>{usd(it.price)}</b>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className={styles.detailsTitle}>
                              Shipping Address
                            </div>
                            <p>{o.address}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.emptyRow}>
                  No orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
