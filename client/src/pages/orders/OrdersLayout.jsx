import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";

export default function OrdersLayout() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await apiUtils.get("/order/readOrders");
      setOrders(res.data?.metadata?.orders || []);
    };
    fetchOrders();
  }, []);

  const buildAddress = (order) => {
    // Ưu tiên địa chỉ giao hàng từ deliveryInformationId
    const di = order?.deliveryInformationId || {};
    const diAddr =
      di.address ||
      [di.street, di.ward, di.district, di.city].filter(Boolean).join(", ");
    // Fallback: địa chỉ hub nếu có
    const hubAddr = order?.distributionHubId?.address;
    return diAddr || hubAddr || "—";
  };

  const placedAt = (order) =>
    new Date(
      order?.placedAt || order?.createdAt || Date.now()
    ).toLocaleString();

  const orderTotal = (order) =>
    (order?.items || []).reduce(
      (sum, i) =>
        sum + Number(i.priceAtPurchase || 0) * Number(i.quantity || 0),
      0
    );

  return (
    <div className="orders-layout container py-4">
      <h3 className="fw-bold mb-4">My Orders</h3>

      {orders.map((order) => (
        <div key={order._id} className="card mb-3 shadow-sm">
          <div className="card-body">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="card-title mb-0">Order ID: {order._id}</h6>
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
                {(order.status || "").replace(/_/g, " ")}
              </span>
            </div>

            {/* Address + Date */}
            <p className="mb-1">
              <strong>Address:</strong> {buildAddress(order)}
            </p>
            <p className="mb-2">
              <strong>Placed At:</strong> {placedAt(order)}
            </p>

            {/* Items */}
            <ul className="list-group list-group-flush">
              {(order.items || []).map((item, idx) => {
                const product = item.productId || {};
                const name = product.name || item.name || "Unnamed product";
                const img =
                  product.thumbnail ||
                  (Array.isArray(product.images) && product.images[0]) ||
                  "";
                const price = Number(item.priceAtPurchase || 0);
                const qty = Number(item.quantity || 0);

                return (
                  <li
                    key={`${product._id || item.productId || idx}`}
                    className="list-group-item d-flex align-items-center justify-content-between"
                  >
                    <div className="d-flex align-items-center">
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: "cover",
                          }}
                          className="rounded me-2"
                        />
                      ) : (
                        <div
                          className="me-2 bg-light border rounded"
                          style={{ width: 48, height: 48 }}
                        />
                      )}
                      <div>
                        <div className="fw-semibold">{name}</div>
                        <small className="text-muted">× {qty}</small>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {order.status === "delivered" && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            // tuỳ routing của bạn:
                            // 1) dùng query:
                            // navigate(`/review?orderId=${order._id}&productId=${product._id}`)
                            // 2) hoặc state:
                            navigate("/review", {
                              state: {
                                orderId: order._id,
                                productId: product._id,
                              },
                            })
                          }
                        >
                          Review
                        </button>
                      )}
                      <span>${(price * qty).toLocaleString()}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Total */}
            <div className="d-flex justify-content-end mt-2">
              <strong>Total: ${orderTotal(order).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      ))}

      <main className="orders-main">
        <Outlet />
      </main>
    </div>
  );
}
