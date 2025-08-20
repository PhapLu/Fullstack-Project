import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipperOrders, updateOrderStatus } from '../store/slices/orderSlices';

export default function ShipperOrders() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('placed');
  const orders = useSelector(s => s.orders.shipper);

  useEffect(()=>{ dispatch(fetchShipperOrders(status)); }, [dispatch,status]);

  const setAs = (id, s) => dispatch(updateOrderStatus({ id, status: s }));

  return (
    <div>
      <h1>Orders in my hub</h1>
      <select value={status} onChange={e=>setStatus(e.target.value)}>
        <option value="placed">Placed</option>
        <option value="at_hub">At hub</option>
        <option value="out_for_delivery">Out for delivery</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {orders.map(o => (
        <div key={o._id}>
          <div><b>{o._id}</b> — {o.status}</div>
          <ul>{o.items.map(i => <li key={i.productId._id}>{i.productId.name} × {i.quantity}</li>)}</ul>
          {['placed','at_hub','out_for_delivery'].includes(o.status) && (
            <>
              {o.status !== 'out_for_delivery' && <button onClick={()=>setAs(o._id,'out_for_delivery')}>Out for delivery</button>}
              <button onClick={()=>setAs(o._id,'delivered')}>Delivered</button>
              <button onClick={()=>setAs(o._id,'cancelled')}>Cancel</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
