/* Gia Hy-s4053650 */
import "./Footer.css";
import { Link } from "react-router-dom";
import logo from '../../assets/logo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faInstagram  } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer__grid">
        <div>
          <div className="auth__brand">
              <Link 
                to="/" 
                style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
              >
                <img className="auth__logo" src={logo} alt="Logo" />
                <span className="auth__name">Bloomart</span>
              </Link>
        </div>
          <ul className="footer__contact">
            <li><strong>Address:</strong> 702 Nguyen Van Linh, Dist 7, HCMC 70000</li>
            <li><strong>Call us:</strong> (+91) - 540-025-124553</li>
            <li><strong>Email:</strong> group4rmit@Bloo.com</li>
            <li><strong>Hours:</strong> 10:00 - 18:00, Mon - Sat</li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/delivery">Delivery Information</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/support">Support Center</Link></li>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/auth/signin/customer">Sign In</Link></li>
            <li><Link to="/cart">View Cart</Link></li>
            <li><Link to="/">My Wishlist</Link></li>
            <li><Link to="/orders">Track My Order</Link></li>
            <li><Link to="/">Help Ticket</Link></li>
            <li><Link to="/">Shipping Details</Link></li>
            <li><Link to="/">Compare products</Link></li>
          </ul>
        </div>

        <div>
          <h4>Corporate</h4>
          <ul>
            <li><Link to="/auth/signup/vendor">Become a Vendor</Link></li>
            <li><Link to="/">Affiliate Program</Link></li>
            <li><Link to="/">Farm Business</Link></li>
            <li><Link to="/">Our Suppliers</Link></li>
            <li><Link to="/">Accessibility</Link></li>
            <li><Link to="/">Promotions</Link></li>
          </ul>
        </div>

        <div className="footer__payment">
          <h4>Install App</h4>
          <p>From App Store or Google Play</p>
          <div className="footer__badges">
            <div className="footer__badge">App Store</div>
            <div className="footer__badge">Google Play</div>
          </div>
          <p>Secured Payment Gateways</p>
          <div className="footer__cards">
            <span>VISA</span><span>Mastercard</span><span>Maestro</span><span>Amex</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__copy">© 2025, <b className="auth__name">Bloomart</b> All rights reserved</div>
        <div className="footer__phones">
          <div className="footer__phone">
            <span className="footer__phoneNum">1900 - 6666</span>
            <small>Working 8:00 - 22:00</small>
          </div>
          <div className="footer__phone">
            <span className="footer__phoneNum">1900 - 8888</span>
            <small>24/7 Support Center</small>
          </div>
        </div>
        <div className="footer__social">
          <span>Follow Us:
                  <FontAwesomeIcon icon={faFacebook} size="2x" style={{ color: "#007bff" }} />
                  <FontAwesomeIcon icon={faInstagram} size="2x" style={{ color: "#007bff" }} />
          </span>
          <small>Up to 15% discount on your first subscribe</small>
        </div>
      </div>
    </footer>
  );
}