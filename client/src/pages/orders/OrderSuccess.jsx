import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { selectUser } from "../../store/slices/authSlices";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const user = useSelector(selectUser);
  console.log(user);

  const order = {
    orderId: state.orderId,
    items: state.items,
    placedAt: state.placedAt,
    deliveryInformation: state.deliveryInformation,
    customer: state.customer,
    payment: state.payment || "cash",
    pricing: state.pricing,
  };

  const subtotal = order.items.reduce(
    (s, i) => s + i.priceAtPurchase * i.quantity,
    0
  );
  const shippingFee = order.pricing?.shippingFee ?? 16500;
  const shippingDiscount = order.pricing?.shippingDiscount ?? 16500;
  const total =
    order.pricing?.total ?? subtotal + shippingFee - shippingDiscount;

  const formatUSD = (n) => n.toLocaleString("en-US");
  const placedAtStr = new Date(order.placedAt).toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const paymentLabel =
    order.payment === "cash"
      ? "Cash on Delivery"
      : order.payment === "card"
      ? "Credit / Debit Card"
      : "Online Banking";

  return (
    <div className="container py-4">
      <div
        className="card border-0 shadow-sm mb-3"
        role="status"
        aria-live="polite"
        aria-label="Order placed successfully"
      >
        <div className="card-body d-flex flex-column align-items-center text-center gap-3 p-4">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" stroke="var(--primary-color)" />
            <path
              d="M7 12.5l3.2 3.2L17 9"
              stroke="var(--primary-color)"
              strokeWidth="2"
            />
          </svg>

          <div className="flex-grow-1">
            <h2 className="mb-2 fs-1 fs-md-2">Order placed successfully</h2>
            <div className="mb-0 text-body-secondary fs-4 fs-md-5">
              Placed at {placedAtStr}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h4 className="fw-bold mb-2">Delivery Information</h4>
              {order.deliveryInformation && (
                <div className="text-muted medium mt-2">
                  {order.deliveryInformation.name} ·{" "}
                  {order.deliveryInformation.phoneNumber}
                </div>
              )}
              <div className="text-muted medium mt-2">
                {order.deliveryInformation.address}
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold mb-2">Payment Method</h4>
              <div>{paymentLabel}</div>
              {order.payment === "cash" && (
                <div className="text-muted small mt-2">
                  Pay when receiving package
                </div>
              )}
              {order.payment === "card" && (
                <div className="text-muted small mt-2">
                  Your card will be charged securely
                </div>
              )}
              {order.payment === "banking" && (
                <div className="text-muted small mt-2">
                  Complete online transfer as instructed
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold mb-3">Order Summary</h4>
              <ul className="list-group list-group-flush mb-5">
                {order.items.map((it) => (
                  <li
                    key={it.productId}
                    className="list-group-item px-0 d-flex justify-content-between mt-2"
                  >
                    <span>
                      {it.name} × {it.quantity}
                    </span>
                    <span>${formatUSD(it.priceAtPurchase * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between mt-3">
                <span>Subtotal</span>
                <span>${formatUSD(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mt-3">
                <span>Shipping Fee</span>
                <span>${formatUSD(shippingFee)}</span>
              </div>
              <hr />
              <div
                className="d-flex justify-content-between mt-3"
                style={{ fontSize: "18px" }}
              >
                <strong>Total</strong>
                <strong
                  style={{ color: "var(--primary-color)" }}
                  className="fs-2"
                >
                  ${formatUSD(total)}
                </strong>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3 flex-wrap">
            <button
              className="btn btn-outline-secondary rounded px-4"
              style={{ fontSize: "12px" }}
              onClick={() => navigate("/")}
            >
              Continue shopping
            </button>
            <Link
              to={`/user/${user?._id}/order-history`}
              className="btn btn-primary rounded px-4"
              style={{ fontSize: "12px" }}
            >
              View my orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
