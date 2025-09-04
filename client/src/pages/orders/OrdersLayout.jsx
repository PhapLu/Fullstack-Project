import { useEffect, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";
import { usd } from "../../utils/currency";

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
        shippingAddress:
            "78 Tran Hung Dao Street, District 3, Ho Chi Minh City",
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
                            <h6 className="card-title mb-0">
                                Order ID: {order.id}
                            </h6>
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
                                    <span>
                                        ${item.priceAtPurchase.toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Total */}
                        <div className="d-flex justify-content-end mt-2">
                            <strong>
                                Total: $
                                {order.items
                                    .reduce(
                                        (sum, i) =>
                                            sum +
                                            i.priceAtPurchase * i.quantity,
                                        0
                                    )
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
