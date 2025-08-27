import React, { useMemo, useState } from "react";
import styles from "./VendorDashboard.module.scss";

/* ================= Utilities ================= */
const usd = (n) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/* ================= Mock Orders ================= */
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
  delivering:   { text: "Delivering",      cls: "badgeDelivering" },
  delivered:    { text: "Delivered",       cls: "badgeDelivered" },
  paid_prepaid: { text: "Paid (Prepaid)",  cls: "badgePaid" },
  paid_cash:    { text: "Paid (Cash)",     cls: "badgeCash" },
  complaint:    { text: "Complaint",       cls: "badgeComplaint" },
};
function StatusBadge({ status }) {
  const m = statusMeta[status] || { text: status, cls: "badgeNeutral" };
  return <span className={`${styles.badge} ${styles[m.cls]}`}>{m.text}</span>;
}

/* ================= Tiny SVG Pie (no libs) ================= */
function PieChart({ data, size = 180, donut = 46 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size / 2;

  let acc = 0;
  const arcs = data.map((d) => {
    const start = (acc / total) * 2 * Math.PI;
    acc += d.value;
    const end = (acc / total) * 2 * Math.PI;

    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;

    const path = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    return { path, color: d.color, label: d.label, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <div className={styles.pieWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill={a.color} />
        ))}
        <circle cx={cx} cy={cy} r={r - donut} fill="#fff" />
      </svg>

      <ul className={styles.pieLegend}>
        {arcs.map((a, i) => (
          <li key={i}>
            <span style={{ background: a.color }} />
            <em>{a.label}</em>
            <b>{a.pct}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================= Wallet Card ================= */
function WalletCard() {
  const [editing, setEditing] = useState(false);
  const [bank, setBank] = useState("USAA ••••••992");
  const [holder, setHolder] = useState("JOHN VENDOR");

  const [range, setRange] = useState("12m");
  const [showPie, setShowPie] = useState(false);

  // Mock revenue breakdown per range
  const revenueByRange = {
    "1m":  [{ label: "Prepaid", value: 6200, color: "#3b82f6" }, { label: "Cash", value: 2400, color: "#8b5cf6" }, { label: "Returns", value: 200, color: "#f43f5e" }],
    "3m":  [{ label: "Prepaid", value: 12600, color: "#3b82f6" },{ label: "Cash", value: 7800, color: "#8b5cf6" }, { label: "Returns", value: 600, color: "#f43f5e" }],
    "6m":  [{ label: "Prepaid", value: 21000, color: "#3b82f6" },{ label: "Cash", value: 11000, color: "#8b5cf6"},{ label: "Returns", value: 900, color: "#f43f5e" }],
    "9m":  [{ label: "Prepaid", value: 27800, color: "#3b82f6" },{ label: "Cash", value: 15000, color: "#8b5cf6"},{ label: "Returns", value: 1100, color: "#f43f5e" }],
    "12m": [{ label: "Prepaid", value: 33120, color: "#3b82f6" },{ label: "Cash", value: 20120, color: "#8b5cf6"},{ label: "Returns", value: 1200, color: "#f43f5e" }],
  };

  return (
    <div className={`${styles.card} ${styles.cardFill}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitle}>Vendor Wallet</div>

        {/* Edit / Save-Cancel */}
        {!editing ? (
          <button className={styles.iconBtn} onClick={() => setEditing(true)} title="Edit bank info">✎</button>
        ) : (
          <div className={styles.inlineActions}>
            <button className={`${styles.btn} ${styles.ghost}`} onClick={() => setEditing(false)}>Cancel</button>
            <button className={styles.btn} onClick={() => setEditing(false)}>Save</button>
          </div>
        )}
      </div>

      {/* Range + Chart toggle */}
      <div className={styles.range}>
        Range:
        {["1m","3m","6m","9m","12m"].map((r) => (
          <button
            key={r}
            className={`${styles.rangeBtn} ${range === r ? styles.rangeActive : ""}`}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
        <button
          className={`${styles.chipBtn} ${showPie ? styles.chipActive : ""}`}
          onClick={() => setShowPie((v) => !v)}
          title="Toggle total revenue chart"
        >
          Total revenue (chart)
        </button>
      </div>

      {/* Content area: chart or list */}
      {showPie ? (
        <div className={styles.pieArea}>
          <PieChart data={revenueByRange[range]} />
        </div>
      ) : (
        <ul className={styles.walletList}>
          <li><span>Total revenue</span><b>{usd(23120)}</b></li>
          <li><span>Balance</span><b>{usd(12450)}</b></li>
          <li><span>Pending disbursement</span><b>{usd(0)}</b></li>
          <li>
            <span>Bank - Account No.</span>
            {!editing ? <b>{bank}</b> : (
              <input className={styles.input} value={bank} onChange={(e)=>setBank(e.target.value)} />
            )}
          </li>
          <li>
            <span>Account holder</span>
            {!editing ? <b>{holder}</b> : (
              <input className={styles.input} value={holder} onChange={(e)=>setHolder(e.target.value)} />
            )}
          </li>
        </ul>
      )}
    </div>
  );
}

/* ================= KPI Row ================= */
function StatsRow({ orders }) {
  const total = orders.length;
  const direct = total;  // demo
  const hub = 0;
  const values = orders.map(o => o.price || 0);
  const max = values.length ? Math.max(...values) : 0;
  const min = values.length ? Math.min(...values) : 0;
  const avg = values.length ? Math.round(values.reduce((s,n)=>s+n,0)/values.length) : 0;

  return (
    <div className={styles.cards}>
      <div className={`${styles.card} ${styles.cardFill}`}>
        <div className={styles.cardHead}>
          <div className={styles.cardTitle}>Orders</div>
          <div className={styles.cardCount}>{total}</div>
        </div>
        <div className={styles.kv}><span>Direct</span><span>{direct} <small>/ {total}</small></span></div>
        <div className={styles.kv}><span>Commission Hub</span><span>{hub}</span></div>
      </div>

      <div className={`${styles.card} ${styles.cardFill}`}>
        <div className={styles.cardTitle}>Order Value</div>
        <div className={styles.kv}><span>Highest</span><span>{usd(max)}</span></div>
        <div className={styles.kv}><span>Lowest</span><span>{usd(min)}</span></div>
        <div className={styles.kv}><span>Average</span><span>{usd(avg)}</span></div>
      </div>

      <WalletCard />

      <div className={`${styles.card} ${styles.cardFill}`}>
        <div className={styles.cardTitle}>Disbursement Requests</div>
        <div className={styles.tableMini}>
          <div className={styles.kv}>
            <span>Status</span><span>Amount</span><span>Time</span>
          </div>
          <div className={styles.kv}>No request yet</div>
        </div>
      </div>
    </div>
  );
}

/* ================= Main Page ================= */
const TABS = [
  { key: "all",        label: "All" },
  { key: "new",        label: "New Requests" },
  { key: "delivered",  label: "Delivered" }, 
  { key: "payments",   label: "Payments" },  
  { key: "feedback",   label: "Customer Feedback" }, 
  { key: "complaints", label: "Complaints" },  
];

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState({});

  const counts = useMemo(() => ({
    all:        ORDERS.length,
    new:        ORDERS.filter(o => o.status === "delivering").length,
    delivered:  ORDERS.filter(o => o.status === "delivered").length,
    payments:   ORDERS.filter(o => o.status === "paid_prepaid" || o.status === "paid_cash").length,
    feedback:   ORDERS.filter(o => o.status === "delivered").length, // demo
    complaints: ORDERS.filter(o => o.status === "complaint").length,
  }), []);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "all":        return ORDERS;
      case "new":        return ORDERS.filter(o => o.status === "delivering");
      case "delivered":  return ORDERS.filter(o => o.status === "delivered");
      case "payments":   return ORDERS.filter(o => o.status === "paid_prepaid" || o.status === "paid_cash");
      case "feedback":   return ORDERS.filter(o => o.status === "delivered");
      case "complaints": return ORDERS.filter(o => o.status === "complaint");
      default:           return ORDERS;
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
            className={`${styles.tab} ${activeTab === t.key ? styles.active : ""}`}
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
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.id}</td>
                  <td>{o.product}</td>
                  <td>{o.customer}</td>
                  <td>{usd(o.price)}</td>
                  <td>{o.payment}</td>
                  <td>{o.deliveryDate}</td>
                  <td className={styles.actions}>
                    <button className={styles.linkBtn} onClick={() => toggleRow(o.id)}>
                      {expanded[o.id] ? "Hide Details" : "View Details"}
                    </button>
                    <a href="/" className={styles.linkBtn}>Message Customer</a>
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
                          <div className={styles.detailsTitle}>Shipping Address</div>
                          <p>{o.address}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className={styles.emptyRow}>No orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
