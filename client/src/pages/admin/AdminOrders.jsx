import { useEffect, useState, useCallback } from "react";
import { apiGet } from "../../utils/api";
import styles from "./AdminOrders.module.scss";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [hubId, setHubId] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      if (USE_MOCK) {
        let list = [
          { _id: "o1", status: "delivered", hubId: { _id: "hub_hcm", name: "Ho Chi Minh" }, customerId: { username: "alice", address: "1 Main" }, total: 109.9, updatedAt: new Date().toISOString() },
          { _id: "o2", status: "active",    hubId: { _id: "hub_dn",  name: "Da Nang" },     customerId: { username: "charlie", address: "2 Main" }, total: 36.0,    updatedAt: new Date().toISOString() },
          { _id: "o3", status: "canceled",  hubId: { _id: "hub_hn",  name: "Hanoi" },       customerId: { username: "alice", address: "1 Main" }, total: 59.0,     updatedAt: new Date().toISOString() }
        ];
        if (status) list = list.filter(o => o.status === status);
        if (hubId) list = list.filter(o => o.hubId?._id === hubId);
        if (q) list = list.filter(o => o._id === q);
        setRows(list); setTotal(list.length);
      } else {
        const d = await apiGet("/admin/orders", { page, status, hubId, q });
        setRows(d.rows || []); setTotal(d.total || 0);
      }
    } catch (e) { console.error(e); }
  }, [page, status, hubId, q]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        <select value={status} onChange={e => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="delivered">Delivered</option>
          <option value="canceled">Canceled</option>
        </select>
        <input placeholder="Filter by hubId (hub_hcm,...)" value={hubId} onChange={e => { setPage(1); setHubId(e.target.value); }} />
        <input placeholder="Search by order _id..." value={q} onChange={e => { setPage(1); setQ(e.target.value); }} />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Order</th><th>Status</th><th>Hub</th><th>Customer</th><th>Total</th><th>Updated</th></tr>
          </thead>
          <tbody>
            {(rows || []).map(o => (
              <tr key={o._id}>
                <td>{o._id}</td>
                <td className={styles.center}>{o.status}</td>
                <td>{o.hubId?.name || "-"}</td>
                <td>{o.customerId?.username} ({o.customerId?.address})</td>
                <td className={styles.center}>${o.total.toFixed(2)}</td>
                <td>{new Date(o.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && <tr><td colSpan={6} className={styles.center}>No orders</td></tr>}
          </tbody>
        </table>
      </div>

      <div className={styles.meta}>Total: {total}</div>
    </div>
  );
}
