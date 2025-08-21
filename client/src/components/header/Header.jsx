/* Gia Hy-s4053650 */
import { Link, NavLink } from "react-router-dom";
import logo from '../../assets/logo.png'
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram  } from '@fortawesome/free-brands-svg-icons'

library.add(fas);

import "./Header.css";


export default function Header() {
  return (
    <header className="header">
      <div className="header__top">
        <nav className="header__links">
          <Link to="/auth/signup/vendor">Become a vendor</Link>
          <span>│</span>
          <Link to="/auth/signup/shipper">Become a shipper</Link>
          <span>│</span>
          <Link to="/about">About us</Link>
          <span>│</span>
          <Link to="/contact">Contact us</Link>
          <div className="header__social">
            <a href="#"><i className="facebook" />
              <FontAwesomeIcon icon={faFacebook} size="2x" style={{ color: "#007bff" }} />
            </a>
            <a href="#"><i className="instagram" />
              <FontAwesomeIcon icon={faInstagram} size="2x" style={{ color: "#007bff" }} />
            </a>
          </div>
        </nav>

        <nav className="header__auth">
          <Link to="/auth/signin/customer" className="header__link--signin">Sign In</Link>
          <span>│</span>
          <Link to="/auth/signup/customer" className="header__link--signup">Sign Up</Link>
        </nav>
      </div>

      <div className="header__searchRow">
        <div className="auth__brand">
              <NavLink 
                to="/" 
                style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
              >
                <img className="auth__logo" src={logo} alt="Logo" />
                <span className="auth__name">Bloomart</span>
              </NavLink>
        </div>

        <div className="header__search">
          <input placeholder="Search for items..." />
          
            <button aria-label="search" className="header__searchBtn">
              {/* search icon */}
              <FontAwesomeIcon
                icon={['fas', 'magnifying-glass']}
                style={{ color: '#ffffff' }}
              />
            </button>
        </div>


          <NavLink
            to="/"
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          >
            <button className="header__cart" aria-label="cart">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M6 6h15l-2 9H8L6 6Z" stroke="#0F172A" strokeWidth="1.8" />
                <circle cx="9" cy="20" r="1.6" fill="#0F172A"/>
                <circle cx="18" cy="20" r="1.6" fill="#0F172A"/>
              </svg>
            </button>
        </NavLink>
      </div>
    </header>
  );
}