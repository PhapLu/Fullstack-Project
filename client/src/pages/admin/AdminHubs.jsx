// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Khanh Huyen
// ID: S4026707

import { useEffect, useState } from "react";
import styles from "./AdminHubs.module.scss";
import { apiUtils } from "../../utils/newRequest";

export default function AdminHubs() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  // NEW: trạng thái edit theo dòng
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", address: "" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await apiUtils.get("/adminDashboard/readHubs");
      const body = res?.data ?? res;
      const payload = body?.metadata ?? body;
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
      const res = await apiUtils.post(
        "/distributionHub/createDistributionHub",
        { name, address }
      );
      const data = res.data.metadata.distributionHub;
      setRows((prev) => [
        ...prev,
        {
          _id: data._id ?? data.id,
          name: data.name ?? "",
          address: data.address ?? "",
        },
      ]);
      setName("");
      setAddress("");
    } catch (error) {
      console.log(error);
    }
  };

  async function update(id, patch) {
    try {
      const res = await apiUtils.patch(
        `/adminDashboard/updateHub/${id}`,
        patch
      );
      const hub =
        res?.data?.metadata?.hub || res?.data?.metadata?.distributionHub || {};
      setRows((prev) =>
        prev.map((h) =>
          h._id === id
            ? {
                ...h,
                name: hub.name ?? patch.name ?? h.name,
                address: hub.address ?? patch.address ?? h.address,
              }
            : h
        )
      );
    } catch (e) {
      console.log("Update failed:", e?.response?.data || e);
    }
  }

  async function remove(id) {
    try {
      await apiUtils.delete(`/adminDashboard/deleteHub/${id}`);
      setRows((prev) => prev.filter((h) => h._id !== id));
    } catch (e) {
      console.log("Delete failed:", e?.response?.data || e);
    }
  }

  const startEdit = (h) => {
    setEditingId(h._id);
    setDraft({ name: h.name, address: h.address });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ name: "", address: "" });
  };
  const saveEdit = async (id) => {
    await update(id, { name: draft.name, address: draft.address });
    cancelEdit();
  };

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
            {(rows || []).map((h) => {
              const isEdit = editingId === h._id;
              return (
                <tr key={h._id}>
                  <td>
                    {isEdit ? (
                      <input
                        className={styles.inlineInput}
                        value={draft.name}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, name: e.target.value }))
                        }
                      />
                    ) : (
                      h.name
                    )}
                  </td>
                  <td>
                    {isEdit ? (
                      <input
                        className={styles.inlineInput}
                        value={draft.address}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, address: e.target.value }))
                        }
                      />
                    ) : (
                      h.address
                    )}
                  </td>
                  <td className={styles.center}>
                    {isEdit ? (
                      <>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnSave}`}
                          onClick={() => saveEdit(h._id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnCancel}`}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => startEdit(h)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.danger}
                          type="button"
                          onClick={() => remove(h._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
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
