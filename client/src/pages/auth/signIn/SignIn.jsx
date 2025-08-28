/* Gia Hy-s4053650 */
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import logo from "../../../assets/logo.png";
import styles from "./SignIn.module.scss";
import {
    faEye,
    faEyeSlash,
    faLock,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SignIn = () => {
    const { role } = useParams(); // role: customer|vendor|shipper
    const [showPassword, setShowPassword] = useState(false);

    const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: call your sign-in API
    };

    return (
        <div className={styles["auth__card"]}>
            <div className={styles["auth__panel"]}>
                <div className={styles["auth__header"]}>
                    <h2>Welcome back</h2>
                </div>

                <p className={styles["auth__text"]}>
                    Log in your account and start with us now
                </p>

                <img
                    className={styles["auth__logo-form"]}
                    src={logo}
                    alt="Logo"
                />

                <form className={styles["auth__form"]} onSubmit={onSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="username" className={styles.ico}>
                            <FontAwesomeIcon icon={faUser} />
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Username"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.ico}>
                            <FontAwesomeIcon icon={faLock} />
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            required
                        />
                        <button
                            type="button"
                            className={styles.eye}
                            onClick={() => setShowPassword((v) => !v)}
                        >
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                            />
                        </button>
                    </div>

                    <button
                        className={`${styles.btn} ${styles["btn-primary"]} ${styles["auth__submit"]}`}
                        type="submit"
                    >
                        Sign in
                    </button>

                    <div className={styles.help}>
                        Don’t have an account yet{" "}
                        <Link
                            className={styles.link}
                            to={`/auth/signup/${role}`}
                        >
                            Sign Up
                        </Link>
                    </div>

                    <div className={`${styles.help} ${styles.small}`}>
                        Or sign in an account as a{" "}
                        <div className={styles["help__role-selection"]}>
                            {["customer", "vendor", "shipper"]
                                .filter((r) => r !== role)
                                .map((r, i) => (
                                    <span key={r}>
                                        {i > 0 && " / "}
                                        <Link
                                            className={styles["link-mode"]}
                                            to={`/auth/signin/${r}`}
                                        >
                                            {cap(r)}
                                        </Link>
                                    </span>
                                ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
