import { useMemo, useState } from "react";
import api from "../../utils/api";

export default function OrderTester() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5173";
  const ORDER_EP =
    import.meta.env.VITE_ORDER_ENDPOINT ||
    "/api/orders"; // đổi nếu BE khác: vd '/orders/create'

  const endpoint = useMemo(() => `${API_BASE.replace(/\/$/, "")}${ORDER_EP}`, [API_BASE, ORDER_EP]);

  const [items, setItems] = useState([
    // mẫu ban đầu để test nhanh
    { productId: "p001", name: "Sample A", price: 100_000, qty: 1 },
    { productId: "p002", name: "Sample B", price: 150_000, qty: 2 },
  ]);
  const [form, setForm] = useState({
    customerId: "demo-user-01",
    fullName: "Nguyen Van A",
    phone: "0900000000",
    address: "702 Nguyen Van Linh, Dist 7, HCMC",
    paymentMethod: "COD",
    hubMode: "random", // 'random' | 'manual'
    hubName: "",
  });
  const [resp, setResp] = useState(null);
  const [loading, setLoading] = useState(false);
  const hubs = ["HCM-1", "HCM-2", "HN-1", "DN-1"];

  const total = useMemo(
    () => items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0),
    [items]
  );

  function updateItem(idx, patch) {
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function removeItem(idx) {
    setItems((arr) => arr.filter((_, i) => i !== idx));
  }
  function addItem() {
    setItems((arr) => [
      ...arr,
      { productId: `p${String(arr.length + 1).padStart(3, "0")}`, name: "New Item", price: 0, qty: 1 },
    ]);
  }
  function clearCart() {
    setItems([]);
  }

  async function placeOrder() {
    if (!items.length) return alert("Cart trống!");

    const distributionHub =
      form.hubMode === "manual"
        ? form.hubName || hubs[0]
        : hubs[Math.floor(Math.random() * hubs.length)];

    // payload phổ biến – điều chỉnh key cho khớp BE nếu cần
    const payload = {
      customerId: form.customerId,
      items: items.map(({ productId, name, price, qty }) => ({
        productId,
        name,
        price: Number(price),
        qty: Number(qty),
        lineTotal: Number(price) * Number(qty),
      })),
      totalAmount: total,
      shipTo: {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
      },
      paymentMethod: form.paymentMethod, // COD | CARD | BANK
      distributionHub, // BE có thể bỏ qua nếu tự random ở server
    };

    setLoading(true);
    setResp(null);
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Bật nếu BE dùng cookie/session:
        // credentials: "include",
        body: JSON.stringify(payload),
      });

      const text = await r.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!r.ok) {
        setResp({ ok: false, status: r.status, data });
        alert(`Order thất bại (${r.status}). Xem chi tiết ở panel bên dưới.`);
      } else {
        setResp({ ok: true, status: r.status, data });
        // thường theo yêu cầu: order xong → clear cart
        setItems([]);
      }
    } catch (e) {
      setResp({ ok: false, error: String(e) });
      alert("Không kết nối được server. Kiểm tra BE hoặc CORS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <h2 style={{ marginBottom: 16 }}>Order Tester</h2>

      <section style={styles.card}>
        <div style={styles.rowBetween}>
          <h3>Cart Items</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.btn} onClick={addItem}>+ Add item</button>
            <button style={styles.btnGhost} onClick={clearCart}>Clear</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th style={{ textAlign: "right" }}>Price (₫)</th>
                <th style={{ textAlign: "right" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Line total (₫)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 16, opacity: 0.7 }}>Trống</td></tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <input style={styles.input} value={it.productId}
                        onChange={(e) => updateItem(idx, { productId: e.target.value })} />
                    </td>
                    <td>
                      <input style={styles.input} value={it.name}
                        onChange={(e) => updateItem(idx, { name: e.target.value })} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <input style={{ ...styles.input, textAlign: "right" }} type="number" min="0" value={it.price}
                        onChange={(e) => updateItem(idx, { price: Number(e.target.value) })} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <input style={{ ...styles.input, textAlign: "right" }} type="number" min="1" value={it.qty}
                        onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {(Number(it.price) * Number(it.qty)).toLocaleString("vi-VN")}
                    </td>
                    <td>
                      <button style={styles.btnDanger} onClick={() => removeItem(idx)}>Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>Total:</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>
                  {total.toLocaleString("vi-VN")}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section style={styles.card}>
        <h3>Customer & Shipping</h3>
        <div style={styles.grid2}>
          <label>Customer ID
            <input style={styles.input} value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
          </label>
          <label>Full name
            <input style={styles.input} value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </label>
          <label>Phone
            <input style={styles.input} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>Address
            <input style={styles.input} value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label>Payment
            <select style={styles.input}
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="COD">COD</option>
              <option value="CARD">Card</option>
              <option value="BANK">Bank Transfer</option>
            </select>
          </label>

          <div>
            <div style={{ marginBottom: 6, fontWeight: 600 }}>Distribution Hub</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <label style={styles.radio}>
                <input type="radio" name="hub" checked={form.hubMode === "random"}
                  onChange={() => setForm({ ...form, hubMode: "random" })} />
                Random (FE)
              </label>
              <label style={styles.radio}>
                <input type="radio" name="hub" checked={form.hubMode === "manual"}
                  onChange={() => setForm({ ...form, hubMode: "manual" })} />
                Manual:
              </label>
              <input style={{ ...styles.input, width: 160 }} disabled={form.hubMode !== "manual"}
                placeholder="VD: HCM-1"
                value={form.hubName}
                onChange={(e) => setForm({ ...form, hubName: e.target.value })} />
            </div>
            <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
              Danh sách mặc định: {hubs.join(", ")}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <button style={styles.btnPrimary} disabled={loading} onClick={placeOrder}>
            {loading ? "Ordering..." : "Place Order"}
          </button>
          <code style={{ fontSize: 12, opacity: 0.8 }}>POST {endpoint}</code>
        </div>
      </section>

      <section style={styles.card}>
        <h3>Response</h3>
        <pre style={styles.pre}>
{JSON.stringify(resp, null, 2)}
        </pre>
      </section>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1080, margin: "24px auto", padding: "0 16px", fontFamily: "Inter, system-ui, Arial" },
  card: { border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fff" },
  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  table: { width: "100%", borderCollapse: "collapse" },
  input: { padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, width: "100%" },
  btn: { padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, background: "#fafafa", cursor: "pointer" },
  btnGhost: { padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, background: "transparent", cursor: "pointer" },
  btnDanger: { padding: "6px 10px", border: "1px solid #f3caca", borderRadius: 8, background: "#ffe9e9", cursor: "pointer" },
  btnPrimary: { padding: "10px 14px", border: "1px solid #3b82f6", borderRadius: 10, background: "#3b82f6", color: "#fff", cursor: "pointer" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  pre: { background: "#0b1020", color: "#cde2ff", padding: 12, borderRadius: 8, overflowX: "auto", minHeight: 80 },
  radio: { display: "inline-flex", alignItems: "center", gap: 6 },
};
