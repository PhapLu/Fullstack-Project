import React, { useState } from "react";
import "./VerifyOtp.module.scss";
import { apiUtils } from "../../../utils/newRequest.js";

export default function RegisterVerification({ handleRegisterSubmit, registerInputs }) {

    return (
        <>
            <form
                className="form verify-registration-form"
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >

                <h1 className="form__title">Đăng kí</h1>

                <p className="text-align-center">
                    Vui lòng điền mã xác thực Pastal vừa gửi đến email{" "}
                    <span className="highlight-text purple">
                        {registerInputs.email}
                    </span>
                </p>

                <div className="form-field">
                    <label htmlFor="otp" className="form-field__label">
                        Mã xác thực
                    </label>
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={inputs.otp || ""}
                        onChange={handleChange}
                        className="form-field__input"
                        placeholder="Nhập mã xác thực"
                    />
                    {errors.otp && (
                        <span className="form-field__error">{errors.otp}</span>
                    )}
                    {errors.serverError && <span className="form-field__error">{errors.serverError}</span>}
                </div>
                <p className="text-align-center">
                    Không nhận được mã?{" "}

                    <span
                        className={`highlight-text with-hover-effect purple ${isButtonDisabled ? "disabled" : ""
                            }`}
                        onClick={!isButtonDisabled ? handleResend : null}
                    >
                        {isButtonDisabled
                            ? `Gửi lại sau ${countdown}s`
                            : "Gửi lại"}
                    </span>

                    <br />
                    <div className="">Kiểm tra hòm thư spam nếu không tìm thấy mã</div>
                </p>
                <div className="form-field">
                    <button
                        type="submit"
                        className="form-field__input btn btn-2 btn-md"
                        disabled={isSubmitRegisterVerificationLoading}
                    >
                        {isSubmitRegisterVerificationLoading ? (
                            <span className="btn-spinner"></span>
                        ) : (
                            "Đăng kí"
                        )}
                    </button>
                </div>
            </form>
        </>
    );
}
