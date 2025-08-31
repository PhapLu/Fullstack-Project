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

library.add(fas);

export default function Header() {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onLogout = async () => {
        try {
            // clear cookie on server (adjust path if your route differs)
            await apiUtils.post("/auth/logout");
        } catch (_) {
            // ignore; we'll still clear client state
        } finally {
            dispatch(logout());
            navigate("/"); // optional
        }
    };
    return (
        <header className={styles.header} id="site-header">
            <div className={styles.header__top}>
                <nav className={styles.header__links}>
                    {
                        (!user || (user && user.role == 'customer')) && (
                            <>
                                <Link to="/auth/signup/vendor">Become a vendor</Link>
                                <span>│</span>
                                <Link to="/auth/signup/shipper">Become a shipper</Link>
                                <span>│</span>
                            </>
                        )
                    }
                    
                    <HashLink smooth to="/#about">
                        About us
                    </HashLink>
                    <span>│</span>
                    <HashLink smooth to="/#contact">
                        Contact us
                    </HashLink>
                    <div className={styles.header__social}>
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
                                to="/auth/signin/customer"
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
                                to={`/${user.role === "vendor" ? "vendor" : "user"}/${user._id}`}
                                className={styles.userLink}
                            >
                                <img
                                    className={styles.avatar}
                                    src={user.avatar || "/uploads/pastal_system_default_avatar.png"}
                                    alt="avatar"
                                />
                                <span className={styles.userName}>
                                    {user.fullName || user.username}
                                </span>
                            </NavLink>

                            <button className={styles.logoutBtn} onClick={onLogout}>
                                Logout
                            </button>
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
                        <img
                            className={styles.auth__logo}
                            src={logo}
                            alt="Logo"
                        />
                        <span className={styles.auth__name}>Bloomart</span>
                    </NavLink>
                </div>

                <div className={styles.header__search}>
                    <input placeholder="Search for items..." />
                    <button
                        aria-label="search"
                        className={styles.header__searchBtn}
                    >
                        <FontAwesomeIcon
                            icon={["fas", "magnifying-glass"]}
                            style={{ color: "#ffffff" }}
                        />
                    </button>
                </div>

                <NavLink
                    to="/cart"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                    }}
                >
                    <button className={styles.header__cart} aria-label="cart">
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
                            <circle cx="18" cy="20" r="1.6" fill="#0F172A" />
                        </svg>
                    </button>
                </NavLink>
            </div>
        </header>
    );
}
