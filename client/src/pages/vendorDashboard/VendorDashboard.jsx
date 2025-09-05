import React, { useMemo, useState } from "react";
import styles from "./VendorDashboard.module.scss";
import { usd } from "../../utils/currency";

const ORDERS = [
  {
    id: "ORD001",
    product: "Wireless Earbuds",
    customer: "Alice",
    price: 45,
    payment: "Prepaid",
    deliveryDate: "2025-08-22",
    status: "delivering",
    items: [{ name: "Wireless Earbuds", qty: 1, price: 45 }],
    address: "123 Market St, San Jose, CA",
  },
  {
    id: "ORD002",
    product: "Phone Case",
    customer: "Bob",
    price: 20,
    payment: "Cash",
    deliveryDate: "2025-08-21",
    status: "delivered",
    items: [{ name: "Phone Case", qty: 1, price: 20 }],
    address: "88 King Rd, Seattle, WA",
  },
  {
    id: "ORD003",
    product: "Laptop Stand",
    customer: "Clara",
    price: 75,
    payment: "Prepaid",
    deliveryDate: "2025-08-19",
    status: "paid_prepaid",
    items: [{ name: "Laptop Stand", qty: 1, price: 75 }],
    address: "12 Green Ave, Austin, TX",
  },
  {
    id: "ORD004",
    product: "Headphones",
    customer: "David",
    price: 100,
    payment: "Cash",
    deliveryDate: "2025-08-20",
    status: "paid_cash",
    items: [{ name: "Headphones", qty: 1, price: 100 }],
    address: "901 Beach Dr, Miami, FL",
  },
  {
    id: "ORD005",
    product: "Smart Watch",
    customer: "Elena",
    price: 120,
    payment: "Prepaid",
    deliveryDate: "2025-08-18",
    status: "complaint",
    items: [{ name: "Smart Watch", qty: 1, price: 120 }],
    address: "45 River St, Boston, MA",
  },
];

/* ================= Status → Badge ================= */
const statusMeta = {
  delivering: { text: "Delivering", cls: "badgeDelivering" },
  delivered: { text: "Delivered", cls: "badgeDelivered" },
  paid_prepaid: { text: "Paid (Prepaid)", cls: "badgePaid" },
  paid_cash: { text: "Paid (Cash)", cls: "badgeCash" },
  complaint: { text: "Complaint", cls: "badgeComplaint" },
};
function StatusBadge({ status }) {
  const m = statusMeta[status] || { text: status, cls: "badgeNeutral" };
  return <span className={`${styles.badge} ${styles[m.cls]}`}>{m.text}</span>;
}

/* ================= KPI Row ================= */
function StatsRow({ orders }) {
  const values = orders.map((o) => o.price || 0);
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
  { key: "new", label: "New Requests" },
  { key: "delivered", label: "Delivered" },
  { key: "payments", label: "Payments" },
  { key: "feedback", label: "Customer Feedback" },
  { key: "complaints", label: "Complaints" },
];

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState({});

  const counts = useMemo(
    () => ({
      all: ORDERS.length,
      new: ORDERS.filter((o) => o.status === "delivering").length,
      delivered: ORDERS.filter((o) => o.status === "delivered").length,
      payments: ORDERS.filter(
        (o) => o.status === "paid_prepaid" || o.status === "paid_cash"
      ).length,
      feedback: ORDERS.filter((o) => o.status === "delivered").length, // demo
      complaints: ORDERS.filter((o) => o.status === "complaint").length,
    }),
    []
  );

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "all":
        return ORDERS;
      case "new":
        return ORDERS.filter((o) => o.status === "delivering");
      case "delivered":
        return ORDERS.filter((o) => o.status === "delivered");
      case "payments":
        return ORDERS.filter(
          (o) => o.status === "paid_prepaid" || o.status === "paid_cash"
        );
      case "feedback":
        return ORDERS.filter((o) => o.status === "delivered");
      case "complaints":
        return ORDERS.filter((o) => o.status === "complaint");
      default:
        return ORDERS;
    }
  }, [activeTab]);

  const toggleRow = (id) => setExpanded((m) => ({ ...m, [id]: !m[id] }));

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Order Management</h2>

      {/* Top KPI row with equal cards */}
      <StatsRow orders={ORDERS} />

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
              <th>Product</th>
              <th>Customer</th>
              <th>Price</th>
              <th>Payment</th>
              <th>Delivery Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <React.Fragment key={o.id}>
                <tr>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td>{o.id}</td>
                  <td>{o.product}</td>
                  <td>{o.customer}</td>
                  <td>{usd(o.price)}</td>
                  <td>{o.payment}</td>
                  <td>{o.deliveryDate}</td>
                  <td className={styles.actions}>
                    <button
                      className={styles.linkBtn}
                      onClick={() => toggleRow(o.id)}
                    >
                      {expanded[o.id] ? "Hide Details" : "View Details"}
                    </button>
                    <a href="/" className={styles.linkBtn}>
                      Message Customer
                    </a>
                  </td>
                </tr>

                {expanded[o.id] && (
                  <tr className={styles.detailsRow}>
                    <td colSpan={8}>
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
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
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
