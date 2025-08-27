// src/components/CheckoutPage.jsx
import React, { useState } from "react";

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

export default function CheckoutPage() {
  // lấy order đầu tiên trong mock làm ví dụ
  const order = ordersMock[0];

  // state cho customer info (có thể chỉnh sửa)
  const [customer, setCustomer] = useState({
    name: "John Doe",
    phone: "0912 345 678",
    address: order.shippingAddress,
  });

    const [isEditing, setIsEditing] = useState(false);

  const [payment, setPayment] = useState("cash");

  // tính toán tổng tiền
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0
  );
  const shippingFee = 16500;
  const shippingDiscount = 16500; // free ship
  const voucher = order.voucher || 0; // chỉ trừ khi có voucher
  const total = subtotal + shippingFee - shippingDiscount - voucher;

  // hàm xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">Checkout</h3>

{/* Customer Info */}
<div className="card mb-3 shadow-sm">
  <div className="card-body">
    <div className="d-flex justify-content-between align-items-start mb-2">
      <h6 className="fw-bold mb-0">Customer Information</h6>
      <button
        className="btn btn-sm btn-link text-primary p-0"
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? "Save" : "Edit"}
      </button>
    </div>

    {!isEditing ? (
      <>
        <p className="mb-1"><strong>Name:</strong> {customer.name}</p>
        <p className="mb-1"><strong>Phone:</strong> {customer.phone}</p>
        <p className="mb-0"><strong>Address:</strong> {customer.address}</p>
      </>
    ) : (
      <>
        <div className="mb-2">
          <label className="form-label">Name</label>
          <input
            name="name"
            className="form-control"
            value={customer.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label className="form-label">Phone</label>
          <input
            name="phone"
            className="form-control"
            value={customer.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="form-label">Address</label>
          <textarea
            name="address"
            rows="2"
            className="form-control"
            value={customer.address}
            onChange={handleChange}
          />
        </div>
      </>
    )}
  </div>
</div>


{/* Product Summary */}
<div className="card mb-3 shadow-sm">
  <div className="card-body">
    {/* Vendor name */}
    <div className="d-flex align-items-center mb-3">
      <h6 className="fw-bold mb-0">{order.vendorId}</h6>
    </div>

    {/* Products */}
    {order.items.map((item) => (
      <div
        key={item.productId}
        className="d-flex align-items-center justify-content-between mb-3"
      >
        {/* Product image */}
        <img
          src={item.image || "https://via.placeholder.com/80"}
          alt={item.name}
          className="rounded"
          style={{ width: "80px", height: "80px", objectFit: "cover" }}
        />

        {/* Product details */}
        <div className="flex-grow-1 ms-3">
          <p className="mb-1 fw-semibold">{item.name}</p>
          <p className="mb-1 text-muted small">
            {item.description || "No description"}
          </p>
          <div className="text-danger fw-bold">
            ₫{item.priceAtPurchase.toLocaleString()}
          </div>
        </div>

        {/* Quantity */}
        <span className="text-muted">x{item.quantity}</span>
      </div>
    ))}
  </div>
</div>


      {/* Shipping */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-2">Shipping</h6>
          <p className="mb-1">Standard Delivery</p>
          <span className="badge bg-success">Free Shipping</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Payment Method</h6>
          {["cash", "card", "banking"].map((method) => (
            <div className="form-check mb-2" key={method}>
              <input
                className="form-check-input"
                type="radio"
                name="payment"
                id={`pay-${method}`}
                value={method}
                checked={payment === method}
                onChange={(e) => setPayment(e.target.value)}
              />
              <label className="form-check-label" htmlFor={`pay-${method}`}>
                {method === "cash"
                  ? "Cash on Delivery"
                  : method === "card"
                  ? "Credit / Debit Card"
                  : "Online Banking"}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-2">Payment Details</h6>
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
          {voucher > 0 && (
            <div className="d-flex justify-content-between">
              <span>Voucher</span>
              <span>-₫{voucher.toLocaleString()}</span>
            </div>
          )}
          <hr />
          <div className="d-flex justify-content-between">
            <strong>Total</strong>
            <strong className="text-danger">₫{total.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3 flex-wrap">
  <button
    className="btn btn-outline-secondary px-4 py-2 fw-bold rounded-pill"
    onClick={() => window.location.href = "/cart"}
  >
    Cancel
  </button>
  <button
    className="btn btn-primary px-4 py-2 fw-bold rounded-pill"
    onClick={() => alert("Order placed successfully!")}
  >
    Purchase 
  </button>
</div>

    </div>
  );
}
