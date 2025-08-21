import { useQuery } from "react-query";
import api from "../../utils/api";

export default function MyOrder() {
  const q = useQuery({
    queryKey: ["orders","me"],
    queryFn: async () => (await api.get("/orders/me")).data,
    select: d => Array.isArray(d?.orders) ? d.orders : [],
    retry: false,
  });

  if (q.isLoading) return <div style={{padding:16}}>Loading…</div>;
  if (q.isError)   return <div style={{padding:16,color:"red"}}>{String(q.error)}</div>;

  const orders = q.data; // luôn là mảng
  return (
    <div style={{ padding: 16 }}>
      <h2>My Orders</h2>
      {!orders.length && <p>No orders.</p>}
      <ul>
        {orders.map(o => (
          <li key={o._id || o.id}>
            #{o._id || o.id} — {o.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
