/* Gia Hy-s4053650 */
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import logo from "../../assets/logo.png";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import styles from "./Header.module.scss"; // switched to CSS module
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../../store/slices/authSlices";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";
import { useState } from "react";
import { useCart } from "../../store/cart/CartContext";

library.add(fas);

export default function Header() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { saveNow, itemCount } = useCart();

  const onLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // save cart to DB before the session is cleared
      await saveNow();
    } catch (e) {
      console.warn("cart snapshot failed (continuing logout)", e);
    }
    try {
      await apiUtils.post("/auth/logout");
    } catch (e) {
      console.warn("server logout failed (continuing client logout)", e);
    }
    dispatch(logout());
    navigate("/");
    setIsLoggingOut(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/searching?query=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className={styles.header} id="site-header">
      <div className={styles.header__top}>
        <nav className={styles.header__links}>
          {(!user || (user && user.role == "customer")) && (
            <>
              <Link to="/auth/signup/vendor">Become a vendor</Link>
              <span>│</span>
              <Link to="/auth/signup/shipper">Become a shipper</Link>
              <span>│</span>
            </>
          )}

          <HashLink smooth to="/#about">
            About us
          </HashLink>
          <span>│</span>
          <HashLink smooth to="/#contact">
            Contact us
          </HashLink>
          <div className={`${styles.header__social} ps-3`}>
            <a href="#">
              <FontAwesomeIcon
                icon={faFacebook}
                size="2x"
                style={{ color: "#007bff" }}
              />
            </a>
            <a href="#">
              <FontAwesomeIcon
                icon={faInstagram}
                size="2x"
                style={{ color: "#007bff" }}
              />
            </a>
          </div>
        </nav>

        <nav className={styles.header__auth}>
          {!user ? (
            <>
              <Link
                to="/auth/signin"
                className={styles["header__link--signin"]}
              >
                Sign In
              </Link>
              <span>│</span>
              <Link
                to="/auth/signup/customer"
                className={styles["header__link--signup"]}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className={styles.userBox}>
              <NavLink
                to={`/${user.role === "vendor" ? "vendor" : "user"}/${
                  user._id
                }`}
                className={styles.userLink}
              >
                <img
                  className={styles.avatar}
                  src={
                    getImageUrl(user.avatar) ||
                    "/uploads/pastal_system_default_avatar.png"
                  }
                  alt="avatar"
                />
                <span className={styles.userName}>
                  {user.fullName || user.username}
                </span>
              </NavLink>

              {/* === menuBar === */}
              <div
                className={styles.menuBar}
                role="menu"
                aria-label="User menu"
              >
                <div className={styles.menuHeader}>
                  <div className={styles.menuTitle}>
                    Hi, {user?.fullName || user?.username || "User"}
                  </div>
                  {user?.email && (
                    <div className={styles.menuEmail}>{user.email}</div>
                  )}
                </div>

                {user?.role === "vendor" ? (
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => navigate("/vendordashboard")}
                  >
                    <FontAwesomeIcon
                      icon={["fas", "gauge"]}
                      className={styles.menuIcon}
                    />
                    <span>Vendor Dashboard</span>
                  </button>
                ) : user?.role === "shipper" ? (
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() =>
                      navigate("/distributionHub/${order.distributionHubId}")
                    }
                  >
                    <FontAwesomeIcon
                      icon={["fas", "gauge"]}
                      className={styles.menuIcon}
                    />
                    <span>Shipper Dashboard</span>
                  </button>
                ) : user?.role === "admin" ? (
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => navigate("/admin")}
                  >
                    <FontAwesomeIcon
                      icon={["fas", "gauge"]}
                      className={styles.menuIcon}
                    />
                    <span>Admin Dashboard</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => navigate(`/user/${user?._id}/order-history`)}
                  >
                    <FontAwesomeIcon
                      icon={["fas", "receipt"]}
                      className={styles.menuIcon}
                    />
                    <span>Order History</span>
                  </button>
                )}

                <button
                  type="button"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() =>
                    navigate(
                      `/${user?.role === "vendor" ? "vendor" : "user"}/${
                        user?._id
                      }`
                    )
                  }
                >
                  <FontAwesomeIcon
                    icon={["fas", "user"]}
                    className={styles.menuIcon}
                  />
                  <span>Profile</span>
                </button>

                <div className={styles.menuDivider} />

                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuLogout}`}
                  role="menuitem"
                  onClick={onLogout}
                  disabled={isLoggingOut}
                >
                  <FontAwesomeIcon
                    icon={["fas", "right-from-bracket"]}
                    className={styles.menuIcon}
                  />
                  <span>Logout</span>
                </button>
                <div className={styles.menuFooter}>
                  <span>© {new Date().getFullYear()} • BlooMart</span>
                  <span className={styles.menuTermsLink}> Terms </span>
                </div>
              </div>

              {/* === /menuBar === */}
            </div>
          )}
        </nav>
      </div>

      <div className={styles.header__searchRow}>
        <div className={styles.auth__brand}>
          <NavLink
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img className={styles.auth__logo} src={logo} alt="Logo" />
            <span className={styles.auth__name}>Bloomart</span>
          </NavLink>
        </div>

        {/* wrap input + button trong form */}
        <form className={styles.header__search} onSubmit={handleSearch}>
          <input
            placeholder="Search for items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            aria-label="search"
            className={styles.header__searchBtn}
          >
            <FontAwesomeIcon
              icon={["fas", "magnifying-glass"]}
              style={{ color: "#ffffff" }}
            />
          </button>
        </form>

        <NavLink
          to={user ? "/cart" : "/auth/signin"}
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <button className={styles.header__cart} aria-label="cart">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6h15l-2 9H8L6 6Z"
                stroke="#0F172A"
                strokeWidth="1.8"
              />
              <circle cx="9" cy="20" r="1.6" fill="#0F172A" />
              <circle cx="18" cy="20" r="1.6" fill="#0F172A" />
            </svg>
            {itemCount > 0 && (
              <span
                className={styles.cartBadge}
                aria-label={`${itemCount} items in cart`}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>
        </NavLink>
      </div>
    </header>
  );
}
