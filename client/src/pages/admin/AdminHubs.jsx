import { useEffect, useState } from "react";
import styles from "./AdminHubs.module.scss";
import { apiUtils } from "../../utils/newRequest";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export default function AdminHubs() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await apiUtils.get("/adminDashboard/readHubs");

      // Accept either axios response shape or plain object
      const body = res?.data ?? res;
      const payload = body?.metadata ?? body;

      // Expect { hubs: [{ _id, name, address }, ...] }
      const hubs = Array.isArray(payload?.hubs) ? payload.hubs : [];
      setRows(
        hubs.map((h) => ({
          _id: h._id ?? h.id,
          name: h.name ?? "",
          address: h.address ?? "",
        }))
      );
    } catch (err) {
      console.error("Failed to load hubs:", err?.response?.data || err);
      setRows([]);
    }
  }

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    try {
      const res = await apiUtils.post("/distributionHub/createDistributionHub", {
        name,
        address,
      });
      const data = res.data.metadata.distributionHub;
      setRows((prev) => [
        ...prev,
        {
          _id: data._id ?? data.id,
          name: data.name ?? "",
          address: data.address ?? "",
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  function update(id, data) {
    // TODO: PATCH /adminDashboard/updateHub/:id
  }

  function remove(id) {
    // TODO: DELETE /adminDashboard/deleteHub/:id
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
        <button
          onClick={() => {
            onSave(v);
            setEdit(false);
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            setV(value);
            setEdit(false);
          }}
        >
          Cancel
        </button>
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
