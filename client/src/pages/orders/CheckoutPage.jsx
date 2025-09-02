// src/components/CheckoutPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 thêm

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
      {
        productId: "prod_003",
        name: "Wireless Earbuds",
        quantity: 3,
        priceAtPurchase: 250000,
      },
    ],
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
      {
        productId: "prod_004",
        name: "Bluetooth Speaker",
        quantity: 1,
        priceAtPurchase: 199000,
      },
      {
        productId: "prod_005",
        name: "Phone Case",
        quantity: 2,
        priceAtPurchase: 120000,
      },
    ],
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
      {
        productId: "prod_006",
        name: "Pack of T-Shirts",
        quantity: 5,
        priceAtPurchase: 50000,
      },
    ],
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
      {
        productId: "prod_007",
        name: "Gaming Mouse",
        quantity: 1,
        priceAtPurchase: 890000,
      },
    ],
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const order = ordersMock[0];

  const [customer, setCustomer] = useState({
    name: "John Doe",
    phone: "0912 345 678",
    address: order.shippingAddress,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [payment, setPayment] = useState("cash");

  const subtotal = order.items.reduce(
    (s, i) => s + i.priceAtPurchase * i.quantity,
    0
  );
  const shippingFee = 16500;
  const shippingDiscount = 16500;
  const voucher = order.voucher || 0;
  const total = subtotal + shippingFee - shippingDiscount - voucher;

  const formatUSD = (n) => n.toLocaleString("en-US");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handlePurchase = () => {
    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      return alert("Please fill in complete delivery information.");
    }
    if (isEditing) {
      return alert("You are editing, click Save before purchasing.");
    }

    navigate(`/order-success?id=${order.id}`, {
      state: {
        customer,
        payment,
        items: order.items,
        pricing: { subtotal, shippingFee, shippingDiscount, voucher, total },
        placedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">Checkout</h3>

      {/* Customer Info */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h4 className="fw-bold mb-0">Customer Information</h4>
            <button
              className="btn btn-sm btn-link text-primary p-0"
              onClick={() => setIsEditing((v) => !v)}
              style={{ fontSize: "12px" }}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>

          {!isEditing ? (
            <div className="lh-lg fs-7">
              {" "}
              <div className="mb-2">
                <span className="fw-bold me-2">Name:</span>
                <span>{customer.name}</span>
              </div>
              <div className="mb-2">
                <span className="fw-bold me-2">Phone:</span>
                <span>{customer.phone}</span>
              </div>
              <div className="mb-0">
                <span className="fw-bold me-2">Address:</span>
                <span>{customer.address}</span>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold fs-7">Name</label>
                <input
                  name="name"
                  className="form-control form-control-lg fs-7"
                  value={customer.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold fs-7">Phone</label>
                <input
                  name="phone"
                  className="form-control form-control-lg fs-7"
                  value={customer.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold fs-7">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  className="form-control form-control-lg fs-7"
                  value={customer.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <h4 className="fw-bold mb-0 mb-3">{order.vendorId}</h4>
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="d-flex justify-content-between align-items-center mb-3"
            >
              <img
                src={item.image || "https://via.placeholder.com/80"}
                alt={item.name}
                style={{ width: 80, height: 80, objectFit: "cover" }}
                className="rounded"
              />
              <div className="flex-grow-1 ms-3">
                <p className="mb-1 fw-semibold">{item.name}</p>
                <div className="text-danger fw-bold">
                  ${formatUSD(item.priceAtPurchase)}
                </div>
              </div>
              <span>x{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <h4 className="fw-bold mb-3">Payment Method</h4>
          {["cash", "card"].map((m) => (
            <div className="form-check mb-2" key={m}>
              <input
                type="radio"
                id={`pay-${m}`}
                className="form-check-input"
                value={m}
                checked={payment === m}
                onChange={(e) => setPayment(e.target.value)}
              />
              <label className="form-check-label" htmlFor={`pay-${m}`}>
                {m === "cash" ? "Cash on Delivery" : "Credit / Debit Card"}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body lh-lg">
          <h4 className="fw-bold mb-2">Payment Details</h4>
          <div className="d-flex justify-content-between">
            <span>Subtotal</span>
            <span>${formatUSD(subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Shipping Fee</span>
            <span>${formatUSD(shippingFee)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Shipping Discount</span>
            <span>-${formatUSD(shippingDiscount)}</span>
          </div>
          <hr />
          <div
            className="d-flex justify-content-between"
            style={{ fontSize: "18px" }}
          >
            <strong>Total</strong>
            <strong className="text-danger">${formatUSD(total)}</strong>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
        <button
          className="btn btn-outline-secondary px-4 py-3 fw-bold rounded-pill"
          style={{ fontSize: "12px" }}
          onClick={() => navigate("/cart")}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary px-4 py-3 fw-bold rounded-pill"
          style={{ fontSize: "12px" }}
          onClick={handlePurchase}
          disabled={isEditing}
        >
          Purchase
        </button>
      </div>
    </div>
  );
}
