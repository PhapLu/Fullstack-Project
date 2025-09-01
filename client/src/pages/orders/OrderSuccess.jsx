// src/components/OrderSuccess.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ordersMock = [
  {
    id: "order_001",
    customerId: "user_101",
    vendorId: "vendor_201",
    distributionHubId: "hub_301",
    shipperId: "shipper_401",
    status: "placed",
    shippingAddress: "123 Nguyen Trai Street, District 5, Ho Chi Minh City",
    placedAt: "2025-08-20T09:30:00Z",
    deliveredAt: null,
    items: [
      {
        productId: "prod_001",
        name: "Colored Contact Lenses",
        quantity: 2,
        priceAtPurchase: 159000,
      },
      {
        productId: "prod_002",
        name: "Lens Cleaning Solution",
        quantity: 1,
        priceAtPurchase: 99000,
      },
    ],
  },
  // ... giữ nguyên các order khác
];

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const fallbackOrder = ordersMock[0];

  const order = {
    id: state.id || fallbackOrder.id,
    items: state.items || fallbackOrder.items,
    placedAt: state.placedAt || fallbackOrder.placedAt,
    shippingAddress: state.customer?.address || fallbackOrder.shippingAddress,
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
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex gap-3 align-items-start">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 48, height: 48, background: "#E7F5EE" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="#22C55E" />
              <path d="M7 12.5l3.2 3.2L17 9" stroke="#22C55E" strokeWidth="2" />
            </svg>
          </span>
          <div>
            <h3 className="mb-1">Order placed successfully</h3>
            <div className="text-muted small">
              Order ID <span className="fw-semibold">{order.id}</span> · Placed
              at {placedAtStr}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h4 className="fw-bold mb-2">Shipping Address</h4>
              {order.customer && (
                <div className="text-muted small">
                  {order.customer.name} · {order.customer.phone}
                </div>
              )}
              <div>{order.shippingAddress}</div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="fw-bold mb-2">Payment Method</h4>
              <div>{paymentLabel}</div>
              {order.payment === "cash" && (
                <div className="text-muted small">
                  Pay when receiving package
                </div>
              )}
              {order.payment === "card" && (
                <div className="text-muted small">
                  Your card will be charged securely
                </div>
              )}
              {order.payment === "banking" && (
                <div className="text-muted small">
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
              <div className="d-flex justify-content-between mt-3">
                <span>Shipping Discount</span>
                <span>-${formatUSD(shippingDiscount)}</span>
              </div>
              <hr />
              <div
                className="d-flex justify-content-between mt-3"
                style={{ fontSize: "18px" }}
              >
                <strong>Total</strong>
                <strong className="text-danger">${formatUSD(total)}</strong>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3 flex-wrap">
            <button
              className="btn btn-outline-secondary rounded-pill px-4"
              style={{ fontSize: "12px" }}
              onClick={() => navigate("../landingPage/LandingPage.jsx")}
            >
              Continue shopping
            </button>
            <Link
              to="/orders"
              className="btn btn-primary rounded-pill px-4"
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
