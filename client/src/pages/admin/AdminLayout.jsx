// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Khanh Huyen
// ID: S4026707

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./AdminLayout.module.scss";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlices";
import { useEffect } from "react";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const titleMap = [
    { path: "/admin/hubs", label: "Hubs" },
    { path: "/admin", label: "Overview" },
  ];

  const user = useSelector(selectUser);
  const role = user?.role?.toLowerCase() || "";

  useEffect(() => {
    if (role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [role, navigate]);

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
