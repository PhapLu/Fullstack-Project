import React from "react";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import '../../../assets/css/base.css'
import "../authForm/AuthForm.css";

const AuthForm = () => {
  const { mode, role } = useParams(); {/* mode: signup|signin, role: customer|vendor|shipper */}
  const isSignup = mode === "signup";
  const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  // dynamic fields
  const extraSignupFields = {
    customer: [{ key: "address", placeholder: "Address", icon: "📍" }],
    vendor: [
        { key: "businessName", placeholder: "Business Name", icon: "🏢" },
        { key: "businessAddress", placeholder: "Business Address", icon: "📍" },
    ],
    shipper: [{ key: "distributionHub", placeholder: "Select Distribution Hub", icon: "📦",}],
  };

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: hook up to your API
  };
  return (
    <div className="auth-card">
      <h2>
        {isSignup ? "Welcome to " : "Welcome back"}{" "}
        <span className="c-primary">Bloomart</span>
      </h2>
      <p className="muted">
        {isSignup
          ? "Create your new account and start your shopping now"
          : "Log in your account and start shopping now"}
      </p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field">
          <span className="ico">@</span>
          <input type="email" placeholder="Email" required />
        </label>

        <label className="field">
          <span className="ico">🔑</span>
          <input
            type={show1 ? "text" : "password"}
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="eye"
            onClick={() => setShow1((v) => !v)}
          >
            {show1 ? "🙈" : "👁️"}
          </button>
        </label>

        {isSignup && (
          <>
            <label className="field">
              <span className="ico">🔑</span>
              <input
                type={show2 ? "text" : "password"}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShow2((v) => !v)}
              >
                {show2 ? "🙈" : "👁️"}
              </button>
            </label>

            {(extraSignupFields[role] || []).map((f) => (
              <label className="field" key={f.key}>
                <span className="ico">{f.icon}</span>
                <input type="text" placeholder={f.placeholder} />
              </label>
            ))}
          </>
        )}

        <button className="btn btn-primary" type="submit">
          {isSignup ? "Create Account" : "Sign in"}
        </button>

        <div className="help">
          {isSignup ? "Have an account? " : "Don’t have an account yet? "}
          <Link
            className="link"
            to={`/auth/${isSignup ? "signin" : "signup"}/${role}`}
          >
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </div>

        <div className="help small">
          {isSignup
            ? "Or create an account as a "
            : "Or sign in an account as a "}
          {["customer", "vendor", "shipper"]
            .filter((r) => r !== role)
            .map((r, i) => (
              <span key={r}>
                {i > 0 && " / "}
                <Link className="link link-muted" to={`/auth/${mode}/${r}`}>
                  {cap(r)} {/*capital the first letter in role and keep the rest */}
                </Link>
              </span>
            ))}
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
