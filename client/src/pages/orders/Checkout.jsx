import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { createOrders } from '../store/slices/orderSlices';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector(s => s.cart?.items || []);
  const creating = useSelector(s => s.orders.creating);
  const [address, setAddress] = useState('');

  const place = async () => {
    const items = cart.map(i => ({ productId: i._id || i.productId, quantity: i.qty || 1 }));
    const action = await dispatch(createOrders({ items, shippingAddress: address }));
    if (createOrders.fulfilled.match(action)) {
      const firstId = action.payload[0]._id;
      navigate(`/orders/success/${firstId}`, { state: { all: action.payload } });
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      <textarea placeholder="Shipping address" value={address} onChange={e=>setAddress(e.target.value)} />
      <button disabled={creating || cart.length===0 || address.trim().length<5} onClick={place}>
        {creating ? 'Placing…' : 'Place order'}
      </button>
    </div>
  );
}
