import React from "react";
import styles from "./VerifyOtp.module.scss"; // <-- import as styles
import logo from '../../../assets/logo.png'

export default function VerifyOtp({ registerInputs }) {
  return (
    <form
      className={styles.verifyRegistrationForm}
      onClick={(e) => e.stopPropagation()}
      // Optional: prevent actual submit while wiring up
      onSubmit={(e) => e.preventDefault()}
    >
        <img
            className={styles["auth__logo-form"]}
            src={logo}
            alt="Logo"
        />
      <h1 className={styles.formTitle}>Verify OTP</h1>

      <p className={styles.formSubTitle}>
        Enter the verification code <span>Bloomart</span> just emailed you.
      </p>

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
        />
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
        >
          Verify
        </button>
      </div>
    </form>
  )
}