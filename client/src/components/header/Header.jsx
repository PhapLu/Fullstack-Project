/* Gia Hy-s4053650 */
import { Link } from "react-router-dom";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Add tất cả solid icons vào library
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
            <a href="#"><i className="facebook" /></a>
            <a href="#"><i className="instagram" /></a>
          </div>
        </nav>

        <nav className="header__auth">
          <Link to="/auth/signin/customer" className="header__link--signin">Sign In</Link>
          <Link to="/auth/signup/customer" className="header__link--signup">Sign Up</Link>
        </nav>
      </div>

      <div className="header__searchRow">
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

        <button className="header__cart" aria-label="cart">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M6 6h15l-2 9H8L6 6Z" stroke="#0F172A" strokeWidth="1.8" />
            <circle cx="9" cy="20" r="1.6" fill="#0F172A"/>
            <circle cx="18" cy="20" r="1.6" fill="#0F172A"/>
          </svg>
        </button>
      </div>
    </header>
  );
}