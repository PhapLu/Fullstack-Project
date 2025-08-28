/* Gia Hy-s4053650 */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { isFilled, isMatch, isValidPassword } from "../../../utils/validator";

const SignUp = () => {
    const { role } = useParams(); // role: customer|vendor|shipper
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [inputs, setInputs] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitRegisterLoading, setIsSubmitRegisterLoading] = useState(false);
    const [hubs, setHubs] = useState([]);

    const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

    // role-based extra fields
    const extraSignupFields = {
        customer: [
            // Example if you later want to re-enable:
            // { key: "name", placeholder: "Name", icon: <FontAwesomeIcon icon={faUser} /> },
            // { key: "address", placeholder: "Address", icon: <FontAwesomeIcon icon={faLocationDot} /> },
        ],
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
                const response = await apiUtils.get("/distributionHub/readDistributionHubs");
                console.log('hubs:', response?.data?.metadata.hubs);
                setHubs(response?.data?.metadata.hubs || []);
            } catch (error) {
                console.error("Error fetching distribution hubs:", error);
            }
        };
        if (role === "shipper") fetchHubs();
    }, [role]);

    const validateInputs = () => {
        let errors = {};

        // Validate email
        if (!isFilled(inputs.username)) {
            console.log(inputs)
            errors.username = "Vui lòng nhập username";
        } else if (!inputs.username) {
            errors.username = "Usrename không hợp lệ";
        }

        // Validate passwords
        if (!isFilled(inputs.password)) {
            errors.password = "Vui lòng nhập mật khẩu";
        } else if (!isValidPassword(inputs.password)) {
            errors.password =
                "Mật khẩu phải chứa ít nhất 6 kí tự, 1 số và 1 kí tự đặc biệt";
        }

        if (!isFilled(inputs.confirmPassword)) {
            errors.confirmPassword = "Vui lòng nhập mật khẩu xác nhận";
        } else if (!isMatch(inputs.confirmPassword, inputs.password)) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        if (
            isFilled(inputs.password) &&
            isFilled(inputs.confirmPassword) &&
            !isMatch(inputs.confirmPassword, inputs.password)
        ) {
            errors.password = "Mật khẩu không khớp";
            errors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }
        return errors;
    };

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        console.log(name, value);

        // Update input value & clear error
        setInputs((values) => ({ ...values, [name]: value }));
        setErrors((values) => ({ ...values, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Initialize loading effect for the submit button
        setIsSubmitRegisterLoading(true);

        // Validate user inputs
        const validationErrors = validateInputs();
        console.log('PASSESS VALIDATION:', validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // Clear the loading effect if validation failed
            setIsSubmitRegisterLoading(false);
            return;
        }

        // Handle register request
        try {
            const { confirmPassword, ...others } = inputs;
            const response = await apiUtils.post("/auth/signUp", others);
            if (response) {
                setShowRegisterVerificationForm(true);
            }
        } catch (error) {
            console.error("Failed to register:", error);
            errors.serverError = error.response.data.message;
        } finally {
            // Clear the loading effect
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
                        <input type="username" id="username" name="username" value={inputs.username || ""} onChange={handleChange} placeholder="Username" autoComplete="on" />
                        {errors.username && <span className="form-field__error">{errors.username}</span>}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.ico}>
                            <FontAwesomeIcon icon={faEnvelope} />
                        </label>
                        <input type="email" id="email" name="email" value={inputs.email || ""} onChange={handleChange} className="form-field__input" placeholder="Email" autoComplete="on" />
                        {errors.email && <span className="form-field__error">{errors.email}</span>}
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
                        {errors.password && <span className="form-field__error">{errors.password}</span>}
                        <button
                            type="button"
                            className={styles.eye}
                            onClick={() => setShow1(v => !v)}
                        >
                            <FontAwesomeIcon icon={show1 ? faEyeSlash : faEye} />
                        </button>
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
                        {errors.confirmPassword && <span className="form-field__error">{errors.confirmPassword}</span>}

                        <button
                            type="button"
                            className={styles.eye}
                            onClick={() => setShow2(v => !v)}
                        >
                            <FontAwesomeIcon icon={show2 ? faEyeSlash : faEye} />
                        </button>
                    </div>

                    {(extraSignupFields[role] || []).map((f) => (
                        <div className={styles.field} key={f.key}>
                            <label className={styles.ico}>{f.icon}</label>

                            {f.type === "select" ? (
                                <select required>
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
                                    placeholder={f.placeholder}
                                />
                            )}
                        </div>
                    ))}

                    <button
                        className={`${styles.btn} ${styles["btn-primary"]} ${styles["auth__submit"]}`}
                        type="submit"
                    >
                        Create Account
                    </button>

                    <div className={styles.help}>
                        Have an account?{" "}
                        <Link
                            className={styles.link}
                            to={`/auth/signin/${role}`}
                        >
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
