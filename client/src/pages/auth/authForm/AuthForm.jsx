/* Gia Hy-s4053650 */
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import logo from '../../../assets/logo.png'
import "../authForm/AuthForm.css";
import { faEnvelope, faEye, faEyeSlash, faLock, faLocationDot, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const AuthForm = () => {
  const { mode, role } = useParams(); {/* mode: signup|signin, role: customer|vendor|shipper */}
  const isSignup = mode === "signup";
  const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  // dynamic fields
  const extraSignupFields = {
    customer: [{ key: "address", placeholder: "Address", icon: <FontAwesomeIcon icon={faLocationDot} /> }],
    vendor: [
        { key: "businessName", placeholder: "Business Name", icon: <FontAwesomeIcon icon={faUser} /> },
        { key: "businessAddress", placeholder: "Business Address", icon: <FontAwesomeIcon icon={faLocationDot} /> },
    ],
    shipper: [{ key: "distributionHub", placeholder: "Select Distribution Hub", icon: <FontAwesomeIcon icon={faLocationDot} /> }],
  };

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: hook up to your API
  };
  return (
    <div className="auth__card">
      <div className="auth__panel">
        <div className="auth__header">
          {isSignup ? <h2>Welcome to</h2> : <h2>Welcome back</h2>}
          {isSignup && <span className="auth__name">Bloomart</span>}
        </div>

        <p className="auth__text">
          {isSignup ? "Create your new account and start with us now"
                    : "Log in your account and start with us now"}
        </p>

        {!isSignup && <img className="auth__logo-form" src={logo} alt="Logo" />}

        <form className="auth__form" onSubmit={onSubmit}>
          <label className="field">
            <span className="ico">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input type="email" placeholder="Email" required />
          </label>

          <label className="field">
            <span className="ico">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input type={show1 ? "text" : "password"} placeholder="Password" required />
            <button type="button" className="eye" onClick={() => setShow1((v) => !v)}>
              <FontAwesomeIcon icon={show1 ? faEyeSlash : faEye} />
            </button>
          </label>

          {isSignup && (
            <>
              <label className="field">
                <span className="ico">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type={show2 ? "text" : "password"}
                  placeholder="Confirm password"
                  required
                />
                <button type="button" className="eye" onClick={() => setShow2((v) => !v)}>
                  <FontAwesomeIcon icon={show2 ? faEyeSlash : faEye} />
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

          <button className="btn btn-primary auth__submit" type="submit">
            {isSignup ? "Create Account" : "Sign in"}
          </button>

          <div className="help">
            {isSignup ? "Have an account? " : "Don’t have an account yet? "}
            <Link className="link" to={`/auth/${isSignup ? "signin" : "signup"}/${role}`}>
              {isSignup ? "Sign In" : "Sign Up"}
            </Link>
          </div>

          <div className="help small">
            {isSignup ? "Or create an account as a " : "Or sign in an account as a "}
            <div className="help__role-selection">
              {["customer", "vendor", "shipper"]
                .filter((r) => r !== role)
                .map((r, i) => (
                  <span key={r}>
                    {i > 0 && " / "}
                    <Link className="link-mode" to={`/auth/${mode}/${r}`}>
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

export default AuthForm;
