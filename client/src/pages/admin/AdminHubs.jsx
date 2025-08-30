import { useEffect, useState } from "react";
import styles from "./AdminHubs.module.scss";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export default function AdminHubs() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    load();
  }, []);

  function load() {
    if (USE_MOCK) {
      setRows([
        { _id: "hub_hcm", name: "Ho Chi Minh", address: "HCMC" },
        { _id: "hub_dn", name: "Da Nang", address: "Da Nang" },
        { _id: "hub_hn", name: "Hanoi", address: "Hanoi" },
      ]);
      return;
    }
    // TODO: gọi API thật nếu cần
  }

  function add(e) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    if (USE_MOCK) {
      const _id = "hub_" + Math.random().toString(36).slice(2, 8);
      setRows((rs) => [...rs, { _id, name: name.trim(), address: address.trim() }]);
      setName("");
      setAddress("");
      return;
    }
  }

  function update(id, data) {
    if (USE_MOCK) {
      setRows((rs) => rs.map((h) => (h._id === id ? { ...h, ...data } : h)));
      return;
    }
  }

  function remove(id) {
    if (USE_MOCK) {
      setRows((rs) => rs.filter((h) => h._id !== id));
      return;
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={add}>
        <input
          placeholder="Hub name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button type="submit">Add Hub</button>
      </form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th className={styles.center}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((h) => (
              <tr key={h._id}>
                <td>
                  <InlineEdit
                    value={h.name}
                    onSave={(v) => update(h._id, { name: v })}
                  />
                </td>
                <td>
                  <InlineEdit
                    value={h.address}
                    onSave={(v) => update(h._id, { address: v })}
                  />
                </td>
                <td className={styles.center}>
                  <button
                    className={styles.danger}
                    type="button"
                    onClick={() => remove(h._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr>
                <td colSpan={3} className={styles.center}>
                  No hubs
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlineEdit({ value, onSave }) {
  const [v, setV] = useState(value);
  const [edit, setEdit] = useState(false);

  if (edit) {
    return (
      <span>
        <input value={v} onChange={(e) => setV(e.target.value)} />
        <button onClick={() => { onSave(v); setEdit(false); }}>Save</button>
        <button onClick={() => { setV(value); setEdit(false); }}>Cancel</button>
      </span>
    );
  }
  return (
    <span>
      {value}{" "}
      <button
        className={styles.linkBtn}
        type="button"
        onClick={() => setEdit(true)}
      >
        Edit
      </button>
    </span>
  );
}
