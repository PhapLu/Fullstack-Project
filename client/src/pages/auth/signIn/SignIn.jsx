/* Gia Hy-s4053650 */
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import styles from "./SignIn.module.scss";
import {
    faEye,
    faEyeSlash,
    faLock,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import {signIn, openSocket, selectAuth, fetchMe} from "../../../store/slices/authSlices";

const SignIn = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { status, error } = useSelector(selectAuth);

    const [showPassword, setShowPassword] = useState(false);
    const [inputs, setInputs] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({});

    const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

    const onChange = (e) => {
        const { name, value } = e.target;
        setInputs((s) => ({ ...s, [name]: value }));
        if (errors[name]) setErrors((s) => ({ ...s, [name]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!inputs.username?.trim()) e.username = "Please enter your username.";
        if (!inputs.password) e.password = "Please enter your password.";
        return e;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const v = validate();
        if (Object.keys(v).length) {
            setErrors(v);
            return;
        }

        // Dispatch Redux signIn
        const action = await dispatch(
            signIn({ username: inputs.username.trim(), password: inputs.password })
        );
        console.log(action)
        if (action.meta.requestStatus === "fulfilled") {
            // Persist token then open socket
            localStorage.setItem("token", action.payload.token);
            dispatch(openSocket());
            dispatch(fetchMe())
            // Navigate wherever you want after login
            navigate("/");
        } else {
            // Error from thunk (already in store.error); also show inline
            setErrors((s) => ({
                ...s,
                server: action.payload || "Sign in failed.",
            }));
        }
    };

    const submitting = status === "loading";

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

                <form
                    className={styles["auth__form"]}
                    onSubmit={onSubmit}
                    noValidate
                >
                    <div className={styles.field}>
                        <label htmlFor="username" className={styles.ico}>
                            <FontAwesomeIcon icon={faEnvelope} />
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="username"
                            placeholder="Username"
                            value={inputs.username}
                            onChange={onChange}
                            autoComplete="username"
                            required
                            aria-invalid={Boolean(errors.username)}
                            disabled={submitting}
                        />
                        {errors.username && (
                            <span className={styles["form-field__error"]}>
                                {errors.username}
                            </span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.ico}>
                            <FontAwesomeIcon icon={faLock} />
                        </label>
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={inputs.password}
                            onChange={onChange}
                            autoComplete="current-password"
                            required
                            aria-invalid={Boolean(errors.password)}
                            disabled={submitting}
                        />
                        {errors.password && (
                            <span className={styles["form-field__error"]}>
                                {errors.password}
                            </span>
                        )}
                        {errors.server && (
                            <div className={styles["form-field__error"]}>
                                {errors.server}
                            </div>
                        )}

                        <button
                            type="button"
                            className={styles.eye}
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            disabled={submitting}
                        >
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                            />
                        </button>
                    </div>

                    <button
                        className={`${styles.btn} ${styles["btn-primary"]} ${styles["auth__submit"]}`}
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <span className="btn-spinner" />
                        ) : (
                            "Sign in"
                        )}
                    </button>

                    <div className={styles.help}>
                        Don’t have an account yet{" "}
                        <Link
                            className={styles.link}
                            to={`/auth/signup/customer`}
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* <div className={`${styles.help} ${styles.small}`}>
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
                    </div> */}
                </form>
            </div>
        </div>
    );
};

export default SignIn;
