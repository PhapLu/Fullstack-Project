import { Outlet, NavLink } from "react-router-dom";

export default function OrdersLayout() {
  return (
    <div className="orders-layout">
      <nav className="orders-nav">
        <NavLink to="/orders/success">Order Success</NavLink>
        <NavLink to="/orders/shipper">Shipper Orders</NavLink>
        <NavLink to="/orders/test">Order Tester</NavLink>
      </nav>
      <main className="orders-main">
        <Outlet />
      </main>
    </div>
  );
}
