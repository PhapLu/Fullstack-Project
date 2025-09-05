import { useEffect, useMemo, useState } from "react";
import styles from "./AdminOverview.module.scss";
import { apiUtils } from "../../utils/newRequest";

export default function AdminOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await apiUtils.get("/adminDashboard/readOverview");
        const overviewData = res.data.metadata.adminDashboard;
        console.log(overviewData);

        if (!alive) return;

        // ---- normalize backend payload into existing UI shape ----
        const users = overviewData?.users ?? {
          total: 0,
          vendors: 0,
          customers: 0,
          shippers: 0,
        };

        const products = {
          total:
            overviewData?.products?.total ?? overviewData?.productsTotal ?? 0,
        };

        const ordersByStatus = Array.isArray(overviewData?.ordersByStatus)
          ? overviewData.ordersByStatus
          : [
              { _id: "active", count: overviewData?.orders?.active ?? 0 },
              { _id: "delivered", count: overviewData?.orders?.delivered ?? 0 },
            ];

        const revenueSrc =
          overviewData?.revenue7d ||
          overviewData?.revenueByDay ||
          overviewData?.revenue ||
          [];
        const revenue7d = revenueSrc.map((r) => ({
          _id: r._id || r.date,
          revenue: r.revenue ?? r.total ?? 0,
          orders: r.orders ?? r.count ?? 0,
        }));

        const topVendors = (overviewData?.topVendors || []).map((v) => ({
          vendorId: v.vendorId ?? v._id ?? v.id,
          vendorName: v.vendorName ?? v.name ?? "Unknown",
          revenue: v.revenue ?? v.total ?? 0,
          items: v.items ?? v.count ?? 0,
        }));

        setData({ users, products, ordersByStatus, revenue7d, topVendors });
      } catch (err) {
        console.error("Failed to load admin overview:", err);
        setData({
          users: { total: 0, vendors: 0, customers: 0, shippers: 0 },
          products: { total: 0 },
          ordersByStatus: [
            { _id: "active", count: 0 },
            { _id: "delivered", count: 0 },
          ],
          revenue7d: [],
          topVendors: [],
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const revenueMax = useMemo(() => {
    if (!data?.revenue7d?.length) return 1;
    return Math.max(1, ...data.revenue7d.map((r) => r.revenue));
  }, [data]);

  if (!data) return <div>Loading...</div>;

  const { users, products, ordersByStatus, revenue7d, topVendors } = data;
  const status = (s) => ordersByStatus.find((x) => x._id === s)?.count || 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Users</div>
          <div className={styles.cardValue}>{users.total}</div>
          <div className={styles.cardSub}>
            V:{users.vendors} / C:{users.customers} / S:
            {users.shippers}
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
          {revenue7d.map((r) => {
            const percent = Math.max(1, (r.revenue / revenueMax) * 100);
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
          {topVendors.map((v) => (
            <li key={v.vendorId}>
              <span>{v.vendorName}</span>
              <span>
                ${v.revenue.toFixed(2)} / {v.items} items
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
