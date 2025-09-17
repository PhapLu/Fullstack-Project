// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Khanh Huyen
// ID: S4026707

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./SignUp.module.scss";
import {
    faEnvelope,
    faEye,
    faEyeSlash,
    faLock,
    faLocationDot,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiUtils } from "../../../utils/newRequest";
import {
    isFilled,
    isMatch,
    isValidEmail,
    isValidPassword,
    isValidUsername,
    minLength,
} from "../../../utils/validator";

const SignUp = () => {
    const { role } = useParams();
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitRegisterLoading, setIsSubmitRegisterLoading] =
        useState(false);
    const [hubs, setHubs] = useState([]);
    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        businessName: "",
        businessAddress: "",
        distributionHub: "",
    });
    const navigate = useNavigate();

    const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
    const extraSignupFields = {
        customer: [],
        vendor: [
            {
                key: "businessName",
                placeholder: "Business Name",
                icon: <FontAwesomeIcon icon={faUser} />,
                type: "text",
            },
            {
                key: "businessAddress",
                placeholder: "Business Address",
                icon: <FontAwesomeIcon icon={faLocationDot} />,
                type: "text",
            },
        ],
        shipper: [
            {
                key: "distributionHub",
                placeholder: "Select Distribution Hub",
                icon: <FontAwesomeIcon icon={faLocationDot} />,
                type: "select",
            },
        ],
    };

    useEffect(() => {
        const fetchHubs = async () => {
            try {
                const response = await apiUtils.get(
                    "/distributionHub/readDistributionHubs"
                );
                setHubs(response?.data?.metadata.distributionHubs || []);
            } catch (error) {
                console.error("Error fetching distribution hubs:", error);
            }
        };
        if (role === "shipper") fetchHubs();
    }, [role]);

    const validateInputs = (values) => {
        const nextErrors = {};
        const roleNorm = (role ?? "").toLowerCase();
      
        // Username
        if (!isFilled(values.username)) {
            nextErrors.username = "Username is required";
        } else if (!isValidUsername(values.username)) {
            nextErrors.username =
                "Username must be 8–15 letters/digits (no spaces or symbols)";
        }
      
        // Email (optional in spec; only check if provided)
        if (isFilled(values.email) && !isValidEmail(values.email)) {
            nextErrors.email = "Invalid email format";
        }
      
        // Password
        if (!isFilled(values.password)) {
            nextErrors.password = "Password is required";
        } else if (!isValidPassword(values.password)) {
            nextErrors.password =
            "Password must be 8–20 characters, with at least 1 uppercase, 1 lowercase, 1 number, and 1 special (!@#$%^&*). Only these are allowed."
        }
      
        // Confirm password
        if (!isFilled(values.confirmPassword)) {
            nextErrors.confirmPassword = "Confirm password is required";
        } else if (!isMatch(values.confirmPassword, values.password)) {
            nextErrors.confirmPassword = "Passwords do not match";
        }
      
        // Role-specific
        const needsMin5 = (v) => isFilled(v) && !minLength(v, 5);
      
        if (roleNorm === "vendor") {
            if (!isFilled(values.businessName)) {
                nextErrors.businessName = "Business name is required";
            } else if (needsMin5(values.businessName)) {
                nextErrors.businessName = "Business name must be at least 5 characters";
            }
        
            if (!isFilled(values.businessAddress)) {
                nextErrors.businessAddress = "Business address is required";
            } else if (needsMin5(values.businessAddress)) {
                nextErrors.businessAddress =
                "Business address must be at least 5 characters";
            }
        }
      
        if (roleNorm === "shipper") {
            if (!isFilled(values.distributionHub)) {
                nextErrors.distributionHub = "Please select a distribution hub";
            }
        }
      
        return nextErrors;
      };
           

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        // Update input value & clear error
        setInputs((values) => ({ ...values, [name]: value }));
        setErrors((values) => ({ ...values, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitRegisterLoading(true);
      
        // make a trimmed snapshot
        const trimmed = Object.fromEntries(
            Object.entries(inputs).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
        );
        const validationErrors = validateInputs(trimmed);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitRegisterLoading(false);
            return;
        }
      
        try {
            const { confirmPassword, distributionHub, businessName, businessAddress, ...rest } = trimmed;
            const payload = { ...rest, role };
        
            if (role === "vendor") {
                payload.businessName = businessName;
                payload.businessAddress = businessAddress;
            }
            if (role === "shipper") {
                payload.assignedHubId = distributionHub;
            }
        
            const response = await apiUtils.post("/auth/signUp", payload);
        
            if (response) {
                navigate("/auth/otp", {
                    state: { username: trimmed.username, email: trimmed.email, password: trimmed.password }
                });
            }
        } catch (error) {
            console.error("Failed to register:", error);
            setErrors((prev) => ({
                ...prev,
                serverError: error?.response?.data?.message || "Registration failed"
            }));
        } finally {
            setIsSubmitRegisterLoading(false);
        }
    };
      

    return (
        <div className={styles["auth__card"]}>
            <div className={styles["auth__panel"]}>
                <div className={styles["auth__header"]}>
                    <h2>Welcome to</h2>
                    <span className={styles["auth__name"]}>Bloomart</span>
                </div>

                <p className={styles["auth__text"]}>
                    Create your new account and start with us now
                </p>

                <form className={styles["auth__form"]} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="username" className={styles.ico}>
                            <FontAwesomeIcon icon={faUser} />
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={inputs.username || ""}
                            onChange={handleChange}
                            placeholder="Username"
                            autoComplete="on"
                        />
                        {errors.username && (
                            <span className="form-field__error">
                                {errors.username}
                            </span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.ico}>
                            <FontAwesomeIcon icon={faEnvelope} />
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={inputs.email || ""}
                            onChange={handleChange}
                            className="form-field__input"
                            placeholder="Email"
                            autoComplete="on"
                        />
                        {errors.email && (
                            <span className="form-field__error">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.ico}>
                            <FontAwesomeIcon icon={faLock} />
                        </label>
                        <input
                            type={show1 ? "text" : "password"}
                            id="password"
                            name="password"
                            value={inputs.password || ""}
                            onChange={handleChange}
                            placeholder="Password"
                            autoComplete="on"
                            required
                        />
                        <button
                            type="button"
                            className={styles.eye}
                            onClick={() => setShow1((v) => !v)}
                        >
                            <FontAwesomeIcon
                                icon={show1 ? faEyeSlash : faEye}
                            />
                        </button>
                        {errors.password && (
                            <span className="form-field__error">
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.ico}>
                            <FontAwesomeIcon icon={faLock} />
                        </label>
                        <input
                            type={show2 ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={inputs.confirmPassword || ""}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            autoComplete="on"
                            required
                        />
                        {errors.confirmPassword && (
                            <span className="form-field__error">
                                {errors.confirmPassword}
                            </span>
                        )}

                        <button
                            type="button"
                            className={styles.eye}
                            onClick={() => setShow2((v) => !v)}
                        >
                            <FontAwesomeIcon
                                icon={show2 ? faEyeSlash : faEye}
                            />
                        </button>
                    </div>

                    {(extraSignupFields[role] || []).map((f) => (
                        <div className={styles.field} key={f.key}>
                            <label className={styles.ico}>{f.icon}</label>

                            {f.type === "select" ? (
                                <select
                                    name="distributionHub"
                                    value={inputs.distributionHub || ""}
                                    onChange={handleChange}
                                    required
                                    className={styles.select}
                                >
                                    <option value="">{f.placeholder}</option>
                                    {hubs?.map((h) => (
                                        <option key={h._id} value={h._id}>
                                            {h?.title || h.name || h._id}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name={f.key}
                                    value={inputs[f.key] || ""}
                                    onChange={handleChange}
                                    required
                                    placeholder={f.placeholder}
                                />
                            )}

                             {errors[f.key] && (
                                <span className="form-field__error">
                                    {errors[f.key]}
                                </span>
                             )}
                        </div>
                    ))}

                    <button
                        className={`${styles.btn} ${styles["btn-primary"]} ${styles["auth__submit"]}`}
                        type="submit"
                        disabled={isSubmitRegisterLoading}
                    >
                        {isSubmitRegisterLoading
                            ? "Creating..."
                            : "Create Account"}
                    </button>

                    {errors.serverError && (
                        <div className="form-field__error" role="alert" aria-live="polite">
                            {errors.serverError}
                        </div>
                    )}

                    <div className={styles.help}>
                        Have an account?{" "}
                        <Link className={styles.link} to={`/auth/signin`}>
                            Sign In
                        </Link>
                    </div>

                    <div className={`${styles.help} ${styles.small}`}>
                        Or create an account as a{" "}
                        <div className={styles["help__role-selection"]}>
                            {["customer", "vendor", "shipper"]
                                .filter((r) => r !== role)
                                .map((r, i) => (
                                    <span key={r}>
                                        {i > 0 && " / "}
                                        <Link
                                            className={styles["link-mode"]}
                                            to={`/auth/signup/${r}`}
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

export default SignUp;
