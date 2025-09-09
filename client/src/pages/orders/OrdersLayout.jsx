import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";
import { capitalizeFirst } from "../../utils/formatter";
import { getImageUrl } from "../../utils/imageUrl";
import noneOrderImage from "../../assets/customer_img/no-order-image.png";

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
    const di = order?.deliveryInformationId || {};
    const diAddr =
      di.address ||
      [di.street, di.ward, di.district, di.city].filter(Boolean).join(", ");
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
    <div
      className="orders-layout container-fluid py-4 d-flex flex-column"
      style={{ minHeight: "65vh" }}
    >
      {orders.length === 0 ? (
        <section className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="card border-0 shadow-sm px-4 py-5 text-center w-100">
            {/* Illustration — replace src with your asset path */}
            <img
              src={noneOrderImage}
              alt="No orders"
              className="img-fluid mx-auto mb-4"
              style={{ maxWidth: 220 }}
            />
            <h4 className="fw-bold mb-2">You haven’t placed any orders yet</h4>
            <p className="text-muted mb-4 fs-5">
              Explore our latest items and deals. Your orders will show up here
              after checkout.
            </p>
            <div className="d-grid d-sm-flex justify-content-center gap-2 mb-4">
              <button
                className="btn btn-primary fs-5"
                onClick={() => navigate("/")}
              >
                Browse products
              </button>
              <button
                className="btn btn-outline-secondary fs-5"
                onClick={() => navigate("/cart")}
              >
                Go to cart
              </button>
            </div>
          </div>
        </section>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="card mb-3 shadow-sm">
            <div className="card-body">
              {/* Header */}
              <div
                className="d-flex justify-content-between align-items-center border-bottom"
                style={{
                  cursor: "pointer",
                  paddingBottom: "10px",
                }}
                onClick={() => navigate(`/order/${order._id}`)}
              >
                <h4 className="card-title mb-0 fs-4 ">
                  View Detail Your Order: {order._id}
                </h4>
                <span
                  className={`badge ${
                    order.status === "delivered"
                      ? "bg-success"
                      : order.status === "cancelled"
                      ? "bg-danger"
                      : order.status === "paid"
                      ? "bg-warning text-dark"
                      : "bg-secondary"
                  } fs-5`}
                  style={{
                    borderRadius: "3px",
                    padding: "9px",
                  }}
                >
                  {(capitalizeFirst(order.status) || "").replace(/_/g, " ")}
                </span>
              </div>

              {/* Address + Date */}
              <p className="mb-2 mt-2">
                <strong>Address:</strong> {buildAddress(order)}
              </p>
              <p className="mb-3 mt-3">
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
                                            key={`${
                                                product._id ||
                                                item.productId ||
                                                idx
                                            }`}
                                            className="list-group-item d-flex align-items-center justify-content-between"
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                {img ? (
                                                    <img
                                                        src={getImageUrl(img)}
                                                        alt={name}
                                                        style={{
                                                            width: 60,
                                                            height: 60,
                                                            objectFit: "cover",
                                                        }}
                                                        className="rounded me-2"
                                                    />
                                                ) : (
                                                    <div
                                                        className="me-2 bg-light border rounded"
                                                        style={{
                                                            width: 48,
                                                            height: 48,
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <div className="fw-semibold">
                                                        {name}
                                                    </div>
                                                    <small className="text-muted">
                                                        × {qty}
                                                    </small>
                                                </div>
                                            </div>

                      <div className="d-flex align-items-center gap-2">
                        {(order.status === "delivered" && !order.isReviewed) && (
                          <button
                            className="btn btn-sm btn-outline-primary fs-5"
                            onClick={() =>
                              navigate(`/product/${product._id}`, {
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
              <div
                className="d-flex justify-content-end  mt-3"
                style={{ fontSize: "18px" }}
              >
                <strong>Total</strong>
                <strong
                  style={{ color: "var(--primary-color)" }}
                  className="fs-2 ms-3"
                >
                  ${orderTotal(order).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        ))
      )}

      <main className="orders-main">
        <Outlet />
      </main>
    </div>
  );
}
