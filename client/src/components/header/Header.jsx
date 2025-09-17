// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Tran Bao Tran
// ID: S3975175

import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import styles from "./Header.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../../store/slices/authSlices";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../../store/cart/CartContext";

library.add(fas);

export default function Header() {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { saveNow, itemCount } = useCart();

    // ✅ ref for uncontrolled input
    const searchInputRef = useRef(null);

    const onLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await saveNow(); // snapshot cart one last time
        } catch (e) {
            console.warn("cart snapshot failed (continuing logout)", e);
        }
        try {
            await apiUtils.post("/auth/logout");
        } catch (e) {
            console.warn("server logout failed (continuing client logout)", e);
        }
        dispatch(logout());
        navigate("/auth/signIn");
        setIsLoggingOut(false);
    };

    const handleSearch = (e) => {
        e?.preventDefault?.();
        const value = searchInputRef.current?.value.trim();
        console.log("handleSearch triggered:", value);
        if (!value) return;
        navigate(`/searching?query=${encodeURIComponent(value)}`);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <header className={styles.header} id="site-header">
            {/* Top Nav */}
            <div className={styles.header__top}>
                <nav className={styles.header__links}>
                    {!user && (
                        <>
                            <Link to="/auth/signup/vendor">
                                Become a vendor
                            </Link>
                            <span>│</span>
                            <Link to="/auth/signup/shipper">
                                Become a shipper
                            </Link>
                            <span>│</span>
                        </>
                    )}
                    <a href="/#about">About us</a>
                    <span>│</span>
                    <a href="/#contact">Contact us</a>
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

                {/* Auth Section */}
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
                                to={`/${
                                    user.role === "vendor" ? "vendor" : "user"
                                }/${user._id}`}
                                className={styles.userLink}
                            >
                                <img
                                    className={styles.avatar}
                                    src={
                                        getImageUrl(user.avatar) ||
                                        "/public/default_avatar.png"
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
                                        Hi,{" "}
                                        {user?.fullName ||
                                            user?.username ||
                                            "User"}
                                    </div>
                                    {user?.email && (
                                        <div className={styles.menuEmail}>
                                            {user.email}
                                        </div>
                                    )}
                                </div>

                                {user?.role === "vendor" ? (
                                    <button
                                        type="button"
                                        className={styles.menuItem}
                                        onClick={() =>
                                            navigate("/vendordashboard")
                                        }
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
                                        onClick={() =>
                                            navigate(
                                                `/distributionHub/${user.shipperProfile.assignedHub._id}`
                                            )
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
                                        onClick={() =>
                                            navigate(
                                                `/user/${user?._id}/order-history`
                                            )
                                        }
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
                                    onClick={() =>
                                        navigate(
                                            `/${
                                                user?.role === "vendor"
                                                    ? "vendor"
                                                    : "user"
                                            }/${user?._id}`
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
                                    <span>
                                        © {new Date().getFullYear()} • BlooMart
                                    </span>
                                    <span className={styles.menuTermsLink}>
                                        Terms
                                    </span>
                                </div>
                            </div>
                            {/* === /menuBar === */}
                        </div>
                    )}
                </nav>
            </div>

            {/* Search Row */}
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
                        <img
                            className={styles.auth__logo}
                            src={logo}
                            alt="Logo"
                        />
                        <span className={styles.auth__name}>Bloomart</span>
                    </NavLink>
                </div>

                {/* ✅ fixed search input */}
                <div className={styles.header__search} role="search">
                    <input
                        ref={searchInputRef}
                        placeholder="Search for items..."
                        defaultValue="" // uncontrolled, no React state
                        autoComplete="off"
                        spellCheck={false}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearch(e);
                            }
                        }}
                    />
                    <button
                        type="button"
                        aria-label="search"
                        className={styles.header__searchBtn}
                        onClick={handleSearch}
                    >
                        <FontAwesomeIcon
                            icon={["fas", "magnifying-glass"]}
                            style={{ color: "#ffffff" }}
                        />
                    </button>
                </div>

                {user && user.role !== "customer" ? (
                    <div className={styles.header__cart}></div>
                ) : (
                    <NavLink
                        to={user ? "/cart" : "/auth/signin"}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                        }}
                    >
                        <button
                            className={styles.header__cart}
                            aria-label="cart"
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M6 6h15l-2 9H8L6 6Z"
                                    stroke="#0F172A"
                                    strokeWidth="1.8"
                                />
                                <circle cx="9" cy="20" r="1.6" fill="#0F172A" />
                                <circle
                                    cx="18"
                                    cy="20"
                                    r="1.6"
                                    fill="#0F172A"
                                />
                            </svg>
                            {itemCount >= 0 && (
                                <span
                                    className={styles.cartBadge}
                                    aria-label={`${itemCount} items in cart`}
                                >
                                    {itemCount > 99 ? "99+" : itemCount}
                                </span>
                            )}
                        </button>
                    </NavLink>
                )}
            </div>
        </header>
    );
}
