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
      { productId: "prod_001", name: "Colored Contact Lenses", quantity: 2, priceAtPurchase: 159000 },
      { productId: "prod_002", name: "Lens Cleaning Solution", quantity: 1, priceAtPurchase: 99000 }
    ]
  },
  {
    id: "order_002",
    customerId: "user_102",
    vendorId: "vendor_202",
    distributionHubId: "hub_302",
    shipperId: "shipper_402",
    status: "at_hub",
    shippingAddress: "456 Le Loi Street, District 1, Ho Chi Minh City",
    placedAt: "2025-08-21T11:00:00Z",
    deliveredAt: null,
    items: [
      { productId: "prod_003", name: "Wireless Earbuds", quantity: 3, priceAtPurchase: 250000 }
    ]
  },
  {
    id: "order_003",
    customerId: "user_103",
    vendorId: "vendor_203",
    distributionHubId: "hub_303",
    shipperId: "shipper_403",
    status: "out_for_delivery",
    shippingAddress: "78 Tran Hung Dao Street, District 3, Ho Chi Minh City",
    placedAt: "2025-08-22T08:15:00Z",
    deliveredAt: null,
    items: [
      { productId: "prod_004", name: "Bluetooth Speaker", quantity: 1, priceAtPurchase: 199000 },
      { productId: "prod_005", name: "Phone Case", quantity: 2, priceAtPurchase: 120000 }
    ]
  },
  {
    id: "order_004",
    customerId: "user_104",
    vendorId: "vendor_204",
    distributionHubId: "hub_304",
    shipperId: "shipper_404",
    status: "delivered",
    shippingAddress: "22 Pham Van Dong, Thu Duc City, Ho Chi Minh City",
    placedAt: "2025-08-18T13:45:00Z",
    deliveredAt: "2025-08-19T16:20:00Z",
    items: [
      { productId: "prod_006", name: "Pack of T-Shirts", quantity: 5, priceAtPurchase: 50000 }
    ]
  },
  {
    id: "order_005",
    customerId: "user_105",
    vendorId: "vendor_205",
    distributionHubId: "hub_305",
    shipperId: "shipper_405",
    status: "cancelled",
    shippingAddress: "99 Nguyen Van Linh, District 7, Ho Chi Minh City",
    placedAt: "2025-08-15T10:10:00Z",
    deliveredAt: null,
    items: [
      { productId: "prod_007", name: "Gaming Mouse", quantity: 1, priceAtPurchase: 890000 }
    ]
  }
];

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function OrderSuccess() {
  const query = useQuery();
  const navigate = useNavigate();

  // find order from ?id=order_001, fallback to first
  const orderId = query.get("id");
  const order =
    ordersMock.find((o) => o.id === orderId) ?? ordersMock[0];

  const subtotal = order.items.reduce(
    (sum, i) => sum + i.priceAtPurchase * i.quantity,
    0
  );
  const shippingFee = 16500;
  const shippingDiscount = 16500; // free ship demo
  const total = subtotal + shippingFee - shippingDiscount;

  return (
    <div className="container py-4">
      {/* Success header */}
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex gap-3 align-items-start">
          {/* check icon */}
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 48, height: 48, background: "#E7F5EE" }}
            aria-hidden="true"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="#22C55E" />
              <path d="M7 12.5l3.2 3.2L17 9" stroke="#22C55E" strokeWidth="2" fill="none"/>
            </svg>
          </span>
          <div className="flex-grow-1">
            <h5 className="mb-1">Order placed successfully 🎉</h5>
            <div className="text-muted small">
              Order ID <span className="fw-semibold">{order.id}</span> ·{" "}
              Placed at {new Date(order.placedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Shipping + Payment */}
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0">Shipping Address</h6>
              </div>
              <div className="text-muted small">Default address</div>
              <div className="mt-1">{order.shippingAddress}</div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Payment Method</h6>
              <div>Cash on Delivery</div>
              <div className="text-muted small">You can pay when receiving the package.</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Order Summary</h6>

              {/* items */}
              <ul className="list-group list-group-flush mb-3">
                {order.items.map((it) => (
                  <li key={it.productId} className="list-group-item px-0 d-flex justify-content-between">
                    <span className="me-3 text-truncate">
                      {it.name} × {it.quantity}
                    </span>
                    <span>₫{(it.priceAtPurchase * it.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>

              {/* totals */}
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>₫{subtotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Shipping Fee</span>
                <span>₫{shippingFee.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Shipping Discount</span>
                <span>-₫{shippingDiscount.toLocaleString()}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong className="text-danger">₫{total.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Actions aligned right */}
          <div className="d-flex justify-content-end gap-2 mt-3 flex-wrap">
            <button
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={() => navigate("/")}
            >
              Continue shopping
            </button>
            <Link
              to="/orders"
              className="btn btn-primary rounded-pill px-4"
            >
              View my orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
