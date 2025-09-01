import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Orders from "../../components/distributionHub/Orders"; // renamed
import OrderDetail from "../../components/distributionHub/OrderDetail"; // renamed
import { STATUS_FLOW } from "../../components/distributionHub/HubUtil.js";
import { apiUtils } from "../../utils/newRequest";

const mockOrders = [ { id: "A001", from: "Bloomart DC – District 1", to: "123 Nguyen Trai, District 5, HCMC", customerName: "Nguyen Van A", customerPhone: "0912 345 678", items: [ { name: "Colored Contact Lenses", qty: 2, image: "https://via.placeholder.com/64?text=L", }, ], price: 235000, status: "active", placedAt: "2025-08-24T09:30:00Z", }, { id: "A002", from: "Bloomart DC – District 1", to: "56 Le Loi, District 1, HCMC", customerName: "Tran Thi B", customerPhone: "0905 123 456", items: [ { name: "Wireless Earbuds", qty: 1, image: "https://via.placeholder.com/64?text=E", }, ], price: 119000, status: "at_hub", placedAt: "2025-08-24T10:05:00Z", }, { id: "A003", from: "Bloomart DC – Thu Duc", to: "78 Tran Hung Dao, District 3, HCMC", customerName: "Le Van C", customerPhone: "0938 123 123", items: [ { name: "Bluetooth Speaker", qty: 1, image: "https://via.placeholder.com/64?text=S", }, { name: "Phone Case", qty: 2, image: "https://via.placeholder.com/64?text=C", }, ], price: 80000, status: "out_for_delivery", placedAt: "2025-08-24T08:45:00Z", }, { id: "A004", from: "Bloomart DC – Thu Duc", to: "22 Pham Van Dong, Thu Duc City", customerName: "Pham Thi D", customerPhone: "0977 456 321", items: [ { name: "Pack of T-Shirts", qty: 3, image: "https://via.placeholder.com/64?text=T", }, ], price: 152000, status: "delivered", placedAt: "2025-08-23T16:20:00Z", }, { id: "A005", from: "Bloomart DC – District 7", to: "99 Nguyen Van Linh, District 7, HCMC", customerName: "Hoang Van E", customerPhone: "0987 456 123", items: [ { name: "Gaming Mouse", qty: 1, image: "https://via.placeholder.com/64?text=M", }, ], price: 67000, status: "cancelled", placedAt: "2025-08-23T12:10:00Z", }, { id: "A006", from: "Bloomart DC – District 5", to: "12 Vo Van Kiet, District 5, HCMC", customerName: "Nguyen Thi F", customerPhone: "0911 002 200", items: [ { name: "Makeup Kit", qty: 1, image: "https://via.placeholder.com/64?text=MK", }, ], price: 123000, status: "active", placedAt: "2025-08-24T11:40:00Z", }, ];

export default function DistributionHub() {
    const { distributionHubId, orderId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const role = (searchParams.get("role") || "shipper").toLowerCase();

    const [hub, setHub] = useState(null);
    const [orders, setOrders] = useState(mockOrders || []);
    const [loading, setLoading] = useState({ hub: true, orders: true });
    const [error, setError] = useState({ hub: "", orders: "" });

    // Load hub info + orders for this hub
    useEffect(() => {
        let alive = true;

        const loadHub = async () => {
            setLoading((s) => ({ ...s, hub: true }));
            setError((e) => ({ ...e, hub: "" }));
            try {
                const response = await apiUtils.get(`/distributionHub/readDistributionHub/${distributionHubId}`);
                if (alive) setHub(response.data.metadata.distributionHub);
            } catch (err) {
                if (alive)
                    setError((e) => ({
                        ...e,
                        hub: err?.response?.data?.message || "Failed to load hub",
                    }));
            } finally {
                if (alive) setLoading((s) => ({ ...s, hub: false }));
            }
        };

        const loadOrders = async () => {
            setLoading((s) => ({ ...s, orders: true }));
            setError((e) => ({ ...e, orders: "" }));
            try {
				console.log(distributionHubId)
                const response = await apiUtils.get(`/order/readOrdersByHub/${distributionHubId}`);
                const raw = response?.data?.metadata?.orders;
				const orders = Array.isArray(raw) ? raw : [];
				if (alive) setOrders(orders);
            } catch (err) {
                if (alive)
                    setError((e) => ({
                        ...e,
                        orders: err?.response?.data?.message || "Failed to load orders",
                    }));
            } finally {
                if (alive) setLoading((s) => ({ ...s, orders: false }));
            }
        };

        if (distributionHubId) {
            loadHub();
            loadOrders();
        }

        return () => {
            alive = false;
        };
    }, [distributionHubId]);

    const currentOrder = useMemo(
        () => orders?.find((o) => String(o.id) === String(orderId)),
        [orders, orderId]
    );

    const advanceStatus = (oid) => {
        setOrders((list) =>
            list.map((o) => {
                if (String(o.id) !== String(oid)) return o;
                const i = STATUS_FLOW.indexOf(o.status);
                if (i === -1 || i === STATUS_FLOW.length - 1) return o;
                return { ...o, status: STATUS_FLOW[i + 1] };
            })
        );
    };

    const markDelivered = (oid) => {
        setOrders((list) =>
            list.map((o) =>
                String(o.id) === String(oid) ? { ...o, status: "delivered" } : o
            )
        );
    };

    const cancelOrder = (oid) => {
        const ok = window.confirm(`Cancel order ${oid}?`);
        if (!ok) return;
        setOrders((list) =>
            list.map((o) =>
                String(o.id) === String(oid) ? { ...o, status: "cancelled" } : o
            )
        );
    };

    if (loading.hub || loading.orders) {
        return <div style={{ padding: 16 }}>Loading…</div>;
    }
    if (error.hub) {
        return <div style={{ padding: 16, color: "#b91c1c" }}>{error.hub}</div>;
    }

    if (orderId) {
        return (
            <OrderDetail
                role={role}
                distributionHubId={distributionHubId}
                orderId={orderId}
                order={currentOrder}
                onBack={() => navigate(-1)}
                onAdvance={() => advanceStatus(orderId)}
                onDeliver={() => markDelivered(orderId)}
                onCancel={() => cancelOrder(orderId)}
            />
        );
    }

    return (
        <Orders
            hub={hub}
            role={role}
            orders={orders}
            onOpenOrder={(oid) =>
                navigate(
                    `/distributionHub/${distributionHubId}/orders/${oid}?role=${role}`
                )
            }
            onAdvance={advanceStatus}
            onDeliver={markDelivered}
            onCancel={cancelOrder}
        />
    );
}
