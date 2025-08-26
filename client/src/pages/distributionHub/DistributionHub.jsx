import React, { useMemo, useState } from "react";
import styles from "./DistributionHub.module.scss";
import { FaMapMarkerAlt } from "react-icons/fa";

const fmt = (n) =>
  n.toLocaleString("en-VN", { style: "currency", currency: "VND" });

const mockOrders = [
  {
    id: "A001",
    from: "Bloomart DC – District 1",
    to: "123 Nguyen Trai, District 5, HCMC",
    customerName: "Nguyen Van A",
    customerPhone: "0912 345 678",
    items: [
      { name: "Colored Contact Lenses", qty: 2, image: "https://via.placeholder.com/64?text=L" },
    ],
    price: 235000,
    status: "active",
    placedAt: "2025-08-24T09:30:00Z",
  },
  {
    id: "A002",
    from: "Bloomart DC – District 1",
    to: "56 Le Loi, District 1, HCMC",
    customerName: "Tran Thi B",
    customerPhone: "0905 123 456",
    items: [{ name: "Wireless Earbuds", qty: 1, image: "https://via.placeholder.com/64?text=E" }],
    price: 119000,
    status: "at_hub",
    placedAt: "2025-08-24T10:05:00Z",
  },
  {
    id: "A003",
    from: "Bloomart DC – Thu Duc",
    to: "78 Tran Hung Dao, District 3, HCMC",
    customerName: "Le Van C",
    customerPhone: "0938 123 123",
    items: [
      { name: "Bluetooth Speaker", qty: 1, image: "https://via.placeholder.com/64?text=S" },
      { name: "Phone Case", qty: 2, image: "https://via.placeholder.com/64?text=C" },
    ],
    price: 80000,
    status: "out_for_delivery",
    placedAt: "2025-08-24T08:45:00Z",
  },
  {
    id: "A004",
    from: "Bloomart DC – Thu Duc",
    to: "22 Pham Van Dong, Thu Duc City",
    customerName: "Pham Thi D",
    customerPhone: "0977 456 321",
    items: [{ name: "Pack of T-Shirts", qty: 3, image: "https://via.placeholder.com/64?text=T" }],
    price: 152000,
    status: "delivered",
    placedAt: "2025-08-23T16:20:00Z",
  },
  {
    id: "A005",
    from: "Bloomart DC – District 7",
    to: "99 Nguyen Van Linh, District 7, HCMC",
    customerName: "Hoang Van E",
    customerPhone: "0987 456 123",
    items: [{ name: "Gaming Mouse", qty: 1, image: "https://via.placeholder.com/64?text=M" }],
    price: 67000,
    status: "cancelled",
    placedAt: "2025-08-23T12:10:00Z",
  },
  {
    id: "A006",
    from: "Bloomart DC – District 5",
    to: "12 Vo Van Kiet, District 5, HCMC",
    customerName: "Nguyen Thi F",
    customerPhone: "0911 002 200",
    items: [{ name: "Makeup Kit", qty: 1, image: "https://via.placeholder.com/64?text=MK" }],
    price: 123000,
    status: "active",
    placedAt: "2025-08-24T11:40:00Z",
  },
];

const STATUS_FLOW = ["active", "at_hub", "out_for_delivery", "delivered"];
const labelOf = (s) =>
  s === "active"
    ? "Active"
    : s === "at_hub"
    ? "At hub"
    : s === "out_for_delivery"
    ? "Out for delivery"
    : s === "delivered"
    ? "Delivered"
    : "Cancelled";

export default function DistributionHub() {
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    let list = [...orders];

    // search
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(t) ||
          o.customerName.toLowerCase().includes(t) ||
          o.to.toLowerCase().includes(t)
      );
    }

    // filter
    if (filter !== "all") list = list.filter((o) => o.status === filter);

    // sort
    list.sort((a, b) => {
      if (sort === "newest")
        return new Date(b.placedAt) - new Date(a.placedAt);
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "status")
        return STATUS_FLOW.indexOf(a.status) - STATUS_FLOW.indexOf(b.status);
      return 0;
    });

    return list;
  }, [orders, filter, q, sort]);

  const markDelivered = (id) => {
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status: "delivered" } : o))
    );
    show(`Order ${id} marked delivered`);
  };

  const advanceStatus = (id) => {
    setOrders((list) =>
      list.map((o) => {
        if (o.id !== id) return o;
        const i = STATUS_FLOW.indexOf(o.status);
        if (i === -1 || i === STATUS_FLOW.length - 1) return o; // delivered/cancelled stays
        return { ...o, status: STATUS_FLOW[i + 1] };
      })
    );
    show(`↪️ Order ${id} advanced`);
  };

  const cancelOrder = (id) => {
    const ok = window.confirm(`Cancel order ${id}?`);
    if (!ok) return;
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o))
    );
    show(`Order ${id} cancelled`);
  };

  const show = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <section className={`${styles.hub} ${styles.container}`}>
      <header className={styles.hub__head}>
        <h1>
          DISTRIBUTION HUB: <span className={styles.loc}>Location</span>
        </h1>
        <p>See all active orders assigned to you and update the current status.</p>
      </header>

      {/* controls */}
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
              className={`${styles.chip} ${filter === key ? styles["chip--active"] : ""}`}
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
        {filtered.map((o) => (
          <article className={styles["order-card"]} key={o.id}>
            {/* header line */}
            <div className={styles["order-card__top"]}>
              <div className={styles.route}>
                <FaMapMarkerAlt className={styles.pin} />
                <div className={styles.route__text}>
                  <div className={styles.from}>
                    From: <p>{o.from}</p>
                  </div>
                  <div>
                    To: <span>{o.to}</span>
                  </div>
                </div>
              </div>

              <div className={styles.price}>
                <span>Value</span>
                <strong>{fmt(o.price)}</strong>
              </div>

              <div className={`${styles["status-badge"]} ${styles[o.status]}`}>
                {labelOf(o.status)}
              </div>
            </div>

            {/* customer + items */}
            <div className={styles.customer}>
              <div><strong>Customer:</strong> {o.customerName}</div>
              <div><strong>Phone:</strong> {o.customerPhone}</div>
              <div><strong>Order #</strong> {o.id}</div>
            </div>

            <ul className={styles.items}>
              {o.items.map((it, idx) => (
                <li key={idx} className={styles.item}>
                  <img src={it.image} alt={it.name} />
                  <div className={styles.item__meta}>
                    <div className={styles.item__name}>{it.name}</div>
                    <div className={styles.item__qty}>x{it.qty}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* footer actions */}
            <div className={styles["order-card__bottom"]}>
              <div className={styles.when}>
                Placed: {new Date(o.placedAt).toLocaleString()}
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.actions_mark}
                  onClick={() => advanceStatus(o.id)}
                  disabled={o.status === "delivered" || o.status === "cancelled"}
                  title="Advance to next status"
                >
                  Advance status
                </button>

                <button
                  className={styles.actions_mark}
                  onClick={() => markDelivered(o.id)}
                  disabled={o.status === "delivered" || o.status === "cancelled"}
                >
                  Mark delivered
                </button>

                <button
                  className={styles.actions_cancel}
                  onClick={() => cancelOrder(o.id)}
                  disabled={o.status === "delivered" || o.status === "cancelled"}
                >
                  Cancel
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
