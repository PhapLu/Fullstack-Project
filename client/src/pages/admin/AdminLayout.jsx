import { NavLink, Outlet, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.scss";

export default function AdminLayout() {
  const { pathname } = useLocation();

  const titleMap = [
    { path: "/admin/users", label: "Users" },
    { path: "/admin/products", label: "Products" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/hubs", label: "Hubs" },
    { path: "/admin", label: "Overview" },
  ];

  const activeTitle =
    titleMap.find(
      ({ path }) => pathname === path || pathname.startsWith(path + "/")
    )?.label || "Dashboard";

  const Item = ({ to, label, end = false }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.active : ""}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className={styles.wrap}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Admin Dashboard</div>
        <nav className={styles.nav}>
          <Item to="/admin" label="Overview" end />
          <Item to="/admin/users" label="Users" />
          <Item to="/admin/products" label="Products" />
          <Item to="/admin/orders" label="Orders" />
          <Item to="/admin/hubs" label="Hubs" />
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <h2>{activeTitle}</h2>
        </header>
        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
