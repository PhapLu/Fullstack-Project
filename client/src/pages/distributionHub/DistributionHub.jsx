import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Orders from "../../components/distributionHub/Orders"; // renamed
import OrderDetail from "../../components/distributionHub/OrderDetail"; // renamed
import { STATUS_FLOW } from "../../components/distributionHub/HubUtil.js";
import { apiUtils } from "../../utils/newRequest";

export default function DistributionHub() {
  const { distributionHubId, orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const role = (searchParams.get("role") || "shipper").toLowerCase();

  const [hub, setHub] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState({ hub: true, orders: true });
  const [error, setError] = useState({ hub: "", orders: "" });

  useEffect(() => {
    let alive = true;

    const loadHub = async () => {
      setLoading((s) => ({ ...s, hub: true }));
      setError((e) => ({ ...e, hub: "" }));
      try {
        const response = await apiUtils.get(
          `/distributionHub/readDistributionHub/${distributionHubId}`
        );
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
        console.log(distributionHubId);
        const response = await apiUtils.get(
          `/order/readOrdersByHub/${distributionHubId}`
        );
        console.log(response.data.metadata.orders);
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
    return (
      <div style={{ padding: 16, color: "var(--danger)" }}>{error.hub}</div>
    );
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
