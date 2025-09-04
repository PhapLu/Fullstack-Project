import { useEffect, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";

export default function OrdersLayout() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await apiUtils.get("/order/readOrders");
      console.log(response.data.metadata.orders);
      setOrders(response.data.metadata.orders);
    };
    fetchOrders();
  }, []);

  return (
    <div className="orders-layout container py-4">
      <h3 className="fw-bold mb-4">My Orders</h3>

      {/* Orders List */}
      {orders.map((order) => (
        <div key={order.id} className="card mb-3 shadow-sm">
          <div className="card-body">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="card-title mb-0">Order ID: {order.id}</h6>
              <span
                className={`badge ${
                  order.status === "delivered"
                    ? "bg-success"
                    : order.status === "cancelled"
                    ? "bg-danger"
                    : order.status === "out_for_delivery"
                    ? "bg-warning text-dark"
                    : "bg-secondary"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Address + Date */}
            <p className="mb-1">
              <strong>Address:</strong> {order.shippingAddress}
            </p>
            <p className="mb-2">
              <strong>Placed At:</strong>{" "}
              {new Date(order.placedAt).toLocaleString()}
            </p>

            {/* Items */}
            <ul className="list-group list-group-flush">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${item.priceAtPurchase.toLocaleString()}</span>
                </li>
              ))}
            </ul>

            {/* Total */}
            <div className="d-flex justify-content-end mt-2">
              <strong>
                Total: $
                {order.items
                  .reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0)
                  .toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      ))}

      {/* Nested Routes */}
      <main className="orders-main">
        <Outlet />
      </main>
    </div>
  );
}
