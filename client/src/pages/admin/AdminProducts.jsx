import { useEffect, useState, useCallback } from "react";
import { apiGet, apiDelete } from "../../utils/api";
import styles from "./AdminProducts.module.scss";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export default function AdminProducts() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      if (USE_MOCK) {
        let list = [
          { _id: "p1", name: "Red Sneakers", price: 49.9, vendorId: { _id: "u_v1", businessName: "Anna Store" }, createdAt: new Date().toISOString() },
          { _id: "p2", name: "Blue T-shirt", price: 19.5, vendorId: { _id: "u_v1", businessName: "Anna Store" }, createdAt: new Date().toISOString() },
          { _id: "p3", name: "Wireless Mouse", price: 12.0, vendorId: { _id: "u_v2", businessName: "Bob Mart" },  createdAt: new Date().toISOString() },
          { _id: "p4", name: "Mechanical Keyboard", price: 59.0, vendorId: { _id: "u_v2", businessName: "Bob Mart" }, createdAt: new Date().toISOString() },
        ];
        if (q) list = list.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
        if (vendorId) list = list.filter(p => p.vendorId?._id === vendorId);
        setRows(list); setTotal(list.length);
      } else {
        const d = await apiGet("/admin/products", { page, q, vendorId });
        setRows(d.rows || []); setTotal(d.total || 0);
      }
    } catch (e) { console.error(e); }
  }, [page, q, vendorId]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (USE_MOCK) {
      setRows(prev => prev.filter(p => p._id !== id));
      setTotal(t => Math.max(0, t - 1));
      return;
    }
    await apiDelete(`/admin/products/${id}`);
    load();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            placeholder="Search product name..."
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value); }}
          />
          <input
            placeholder="Filter by vendorId (u_v1, u_v2, ...)"
            value={vendorId}
            onChange={e => { setPage(1); setVendorId(e.target.value); }}
          />
        </div>
        <div className={styles.meta}>Total: {total}</div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.left}>Name</th>
              <th>Price</th>
              <th className={styles.left}>Vendor</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map(p => (
              <tr key={p._id}>
                <td className={styles.left}>{p.name}</td>
                <td className={styles.center}>${p.price.toFixed(2)}</td>
                <td className={styles.left}>{p.vendorId?.businessName || p.vendorId?.username || "-"}</td>
                <td className={styles.center}>{new Date(p.createdAt).toLocaleString()}</td>
                <td className={styles.center}>
                  <button className={styles.danger} onClick={() => remove(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={5} className={styles.center}>No products</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
