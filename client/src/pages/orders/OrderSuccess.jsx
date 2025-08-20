import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchOrderById } from '../store/slices/orderSlices';

export default function OrderSuccess() {
  const { id } = useParams();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const order = useSelector(s => s.orders.current);

  useEffect(()=>{ dispatch(fetchOrderById(id)); }, [dispatch,id]);

  return (
    <div>
      <h1>Order placed 🎉</h1>
      {!order ? 'Loading…' : (
        <>
          <p>Order: {order._id} — {order.status}</p>
          <p>Hub: {order.distributionHubId?.name}</p>
          <ul>{order.items.map(i => (
            <li key={i.productId._id}>{i.productId.name} × {i.quantity} — ${i.priceAtPurchase}</li>
          ))}</ul>
        </>
      )}
      {state?.all?.length>1 && (
        <div>
          <h3>Other orders</h3>
          <ul>{state.all.filter(o=>o._id!==id).map(o => (
            <li key={o._id}><Link to={`/orders/success/${o._id}`}>{o._id}</Link></li>
          ))}</ul>
        </div>
      )}
      <Link to="/products">Back to products</Link>
    </div>
  );
}
