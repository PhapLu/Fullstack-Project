import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "../../utils/api";
import styles from "./AdminUsers.module.scss";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      if (USE_MOCK) {
        let list = [
          { _id: "u_admin", username: "admin", role: "admin", isBlocked: false },
          { _id: "u_v1", username: "shop_anna", role: "vendor", isBlocked: false, businessName: "Anna Store" },
          { _id: "u_v2", username: "shop_bob", role: "vendor", isBlocked: true,  businessName: "Bob Mart" },
          { _id: "u_c1", username: "alice", role: "customer", isBlocked: false },
          { _id: "u_s1", username: "shipper_hcm_1", role: "shipper", isBlocked: false }
        ];
        if (role) list = list.filter(u => u.role === role);
        if (q) list = list.filter(u => u.username.toLowerCase().includes(q.toLowerCase()));
        setRows(list);
        setTotal(list.length);
      } else {
        const d = await apiGet("/admin/users", { page, role, q });
        setRows(d.rows || []);
        setTotal(d.total || 0);
      }
    } catch (e) {
      console.error(e);
    }
  }, [page, role, q]);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = async (id, isBlocked) => {
    if (USE_MOCK) {
      setRows(rs => rs.map(u => (u._id === id ? { ...u, isBlocked: !isBlocked } : u)));
      return;
    }
    await apiPatch(`/admin/users/${id}/${isBlocked ? "unblock" : "block"}`);
    load();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <select value={role} onChange={e => { setPage(1); setRole(e.target.value); }}>
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="shipper">Shipper</option>
            <option value="admin">Admin</option>
          </select>
          <input
            placeholder="Search username..."
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value); }}
          />
        </div>
        <div className={styles.meta}>Total: {total}</div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.left}>Username</th>
              <th>Role</th>
              <th>Blocked</th>
              <th className={styles.left}>Extra</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map(u => (
              <tr key={u._id}>
                <td className={styles.left}>
                  <div className={styles.userCell}>
                    <div className={styles.avatar} aria-hidden />
                    <div>
                      <div className={styles.username}>{u.username}</div>
                      <div className={styles.subMeta}>ID: {u._id}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.center}>
                  <span className={`${styles.badge} ${styles["role-" + u.role]}`}>{u.role}</span>
                </td>
                <td className={styles.center}>
                  {u.isBlocked ? <span className={`${styles.badge} ${styles.badgeDanger}`}>Yes</span>
                               : <span className={`${styles.badge} ${styles.badgeOk}`}>No</span>}
                </td>
                <td className={styles.left}>
                  {/* Hiển thị thông tin phụ theo role */}
                  {u.role === "vendor" && <span>Shop: <b>{u.businessName || "-"}</b></span>}
                  {u.role !== "vendor" && <span className={styles.dim}>—</span>}
                </td>
                <td className={styles.center}>
                  <button
                    className={styles.linkBtn}
                    onClick={() => toggleBlock(u._id, u.isBlocked)}
                  >
                    {u.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={5} className={styles.center}>No users</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
