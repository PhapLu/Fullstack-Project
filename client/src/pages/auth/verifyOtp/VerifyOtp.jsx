import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./VerifyOtp.module.scss";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { apiUtils } from "../../../utils/newRequest";
import { isFilled } from "../../../utils/validator"; // if you have it
import { signIn, openSocket } from "../../../store/slices/authSlices"; // <-- Redux thunks

export default function VerifyOtp() {
	const { state: registerInputs } = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const sanitizeOtp = (value) => value.replace(/\D/g, "").slice(0, 6);

    const onChangeOtp = (e) => {
        const next = sanitizeOtp(e.target.value);
        setOtp(next);
        // live clear field error
        if (next && errors.otp) {
            setErrors((prev) => ({ ...prev, otp: undefined }));
        }
    };

    const validate = () => {
        const e = {};
        if (!isFilled?.(otp) || otp.length !== 6) {
            e.otp = "Vui lòng nhập đúng mã xác thực (6 số).";
        }
        if (!registerInputs?.username || !registerInputs?.password) {
            e.register = "Thiếu username hoặc mật khẩu đăng ký. Vui lòng đăng ký lại.";
        }
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        const v = validate();
        if (Object.keys(v).length) {
            setErrors(v);
            return;
        }

        setSubmitting(true);
        setErrors((prev) => ({ ...prev, server: undefined }));

        try {
            // 1) Verify OTP with your backend
            await apiUtils.post("/auth/verifyOtp", {
                otp,
                email: registerInputs.email,
            });

            // 2) If OTP OK → sign in via Redux
            const action = await dispatch(
                signIn({
                    username: registerInputs.username,
                    password: registerInputs.password,
                })
            );

            if (action.meta.requestStatus === "fulfilled") {
                // 3) Persist token + open socket, then redirect
                localStorage.setItem("token", action.payload.token);
                dispatch(openSocket());
                navigate("/");
            } else {
                // signIn rejected
                setErrors((prev) => ({
                    ...prev,
                    server:
                        action.payload ||
                        "Đăng nhập thất bại sau khi xác thực OTP.",
                }));
            }
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                server:
                    err?.response?.data?.message ||
                    "Xác thực OTP thất bại. Vui lòng thử lại.",
            }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            className={styles.verifyRegistrationForm}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            noValidate
        >
            <img className={styles["auth__logo-form"]} src={logo} alt="Logo" />
            <h1 className={styles.formTitle}>Verify OTP</h1>

            <p className={styles.formSubTitle}>
                Enter the verification code <span>Bloomart</span> just emailed
                you.
            </p>

            {/* Server/global error */}
            {errors.server && (
                <div className={styles.formError} role="alert">
                    {errors.server}
                </div>
            )}
            {errors.register && (
                <div className={styles.formError} role="alert">
                    {errors.register}
                </div>
            )}

            <div className={styles.formField}>
                <label htmlFor="otp" className={styles.formFieldLabel}>
                    Verify your OTP
                </label>
                <input
                    type="text"
                    id="otp"
                    name="otp"
                    className={styles.formFieldInput}
                    placeholder="Your OTP code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    aria-label="One-time password code"
                    aria-invalid={Boolean(errors.otp)}
                    value={otp}
                    onChange={onChangeOtp}
                    disabled={submitting}
                />
                {errors.otp && (
                    <div className={styles.fieldError} role="alert">
                        {errors.otp}
                    </div>
                )}
            </div>

            <p className={styles.centerText}>
                Cannot receive the verification code?
                <br />
                <span className={styles.helperText}>
                    Can’t find the code? Check your email’s spam or junk folder.
                </span>
            </p>

            <div className={styles.formActions}>
                <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="btn-spinner"></span>
                    ) : (
                        "Verify"
                    )}
                </button>
            </div>
        </form>
    );
}
