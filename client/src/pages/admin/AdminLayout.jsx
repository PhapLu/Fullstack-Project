// client/src/admin/AdminLayout.jsx
import { Link, Outlet, useLocation } from 'react-router-dom';
import styles from './AdminLayout.module.scss';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const Item = ({ to, label }) => (
    <Link className={`${styles.navItem} ${pathname === to ? styles.active : ''}`} to={to}>{label}</Link>
  );

  return (
    <div className={styles.wrap}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Admin</div>
        <nav className={styles.nav}>
          <Item to="/admin" label="Overview" />
          <Item to="/admin/users" label="Users" />
          <Item to="/admin/products" label="Products" />
          <Item to="/admin/orders" label="Orders" />
          <Item to="/admin/hubs" label="Hubs" />
        </nav>
      </aside>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <h1>Admin Dashboard</h1>
        </header>
        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
