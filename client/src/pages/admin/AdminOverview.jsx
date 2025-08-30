import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../utils/api";
import styles from "./AdminOverview.module.scss";

const USE_MOCK = true;

export default function AdminOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (USE_MOCK) {
      setData({
        users: { total: 7, vendors: 2, customers: 2, shippers: 2 },
        products: { total: 4 },
        ordersByStatus: [{ _id: "active", count: 1 }, { _id: "delivered", count: 1 }],
        revenue7d: [
          { _id: "2025-08-27", revenue: 109.9, orders: 1 },
          { _id: "2025-08-29", revenue: 59.0, orders: 1 }
        ],
        topVendors: [
          { vendorId: "u_v1", vendorName: "Anna Store", revenue: 88.9, items: 3 },
          { vendorId: "u_v2", vendorName: "Bob Mart", revenue: 59.0, items: 1 }
        ]
      });
    } else {
      apiGet("/admin/overview").then(setData);
    }
  }, []);

  const revenueMax = useMemo(() => {
    if (!data?.revenue7d?.length) return 1;
    return Math.max(1, ...data.revenue7d.map(r => r.revenue));
  }, [data]);

  if (!data) return <div>Loading...</div>;

  const { users, products, ordersByStatus, revenue7d, topVendors } = data;
  const status = (s) => ordersByStatus.find(x => x._id === s)?.count || 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Users</div>
          <div className={styles.cardValue}>{users.total}</div>
          <div className={styles.cardSub}>
            V:{users.vendors} / C:{users.customers} / S:{users.shippers}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Products</div>
          <div className={styles.cardValue}>{products.total}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Orders Active</div>
          <div className={styles.cardValue}>{status("active")}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Orders Delivered</div>
          <div className={styles.cardValue}>{status("delivered")}</div>
        </div>
      </div>

      <div className={styles.block}>
        <h3>Revenue by day</h3>
        <ul className={styles.bars}>
          {revenue7d.map(r => {
            const percent = Math.max(1, (r.revenue / revenueMax) * 100); // đảm bảo >0%
            return (
              <li key={r._id} className={styles.row}>
                <span className={styles.label}>
                  {r._id} – ${r.revenue.toFixed(2)} ({r.orders})
                </span>
                <div className={styles.track}>
                  <div className={styles.fill} style={{ width: `${percent}%` }}>
                    <span className={styles.pct}>{percent.toFixed(0)}%</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.block}>
        <h3>Top Vendors</h3>
        <ol className={styles.rank}>
          {topVendors.map(v => (
            <li key={v.vendorId}>
              <span>{v.vendorName}</span>
              <span>${v.revenue.toFixed(2)} / {v.items} items</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
