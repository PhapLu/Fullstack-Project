import { useEffect, useState } from "react";
import api from "../../utils/api"; // helper

export default function ShipperOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { orders } = await http("/orders/shipper");
        setOrders(orders);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const { order } = await http(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: { status },
      });
      setOrders(prev => prev.map(o => o._id === order._id ? order : o));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p>Loading orders…</p>;
  if (err) return <p className="error">{err}</p>;

  return (
    <div className="page">
      <h1>Shipper Orders</h1>
      {!orders.length && <p>No active orders.</p>}
      {orders.map(o => (
        <div key={o._id} className="order-card">
          <h3>Order {o._id}</h3>
          <p>Status: {o.status}</p>
          <p>Address: {o.shippingAddress}</p>
          <ul>
            {o.items.map(it => (
              <li key={it.productId}>
                {it.quantity} × {it.productName || it.productId} – {it.priceAtPurchase}₫
              </li>
            ))}
          </ul>
          <div className="actions">
            <button onClick={() => updateStatus(o._id, "delivered")}>Deliver</button>
            <button onClick={() => updateStatus(o._id, "cancelled")}>Cancel</button>
          </div>
        </div>
      ))}
    </div>
  );
}
