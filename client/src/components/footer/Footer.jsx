// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Tran Bao Tran
// ID: S3975175

import styles from "./Footer.module.scss";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.footer__grid}>
        <div>
          <div className={styles.auth__brand}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <img className={styles.auth__logo} src={logo} alt="Logo" />
              <span className={styles.auth__name}>Bloomart</span>
            </Link>
          </div>
          <ul className={styles.footer__contact}>
            <li>
              <strong>Address:</strong> 702 Nguyen Van Linh, Dist 7, HCMC 70000
            </li>
            <li>
              <strong>Call us:</strong> (+91) - 540-025-124553
            </li>
            <li>
              <strong>Email:</strong> group4rmit@Bloo.com
            </li>
            <li>
              <strong>Hours:</strong> 10:00 - 18:00, Mon - Sat
            </li>
          </ul>
        </div>

        <div className={styles.footer__info}>
          <h4>Company</h4>
          <ul>
            <li>
              <a href="/#about">About Us</a>
            </li>
            <li>
              <Link to="/">Delivery Information</Link>
            </li>
            <li>
              <Link to="/">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/">Terms & Conditions</Link>
            </li>
            <li>
              <a href="/#contact">Contact</a>
            </li>
            <li>
              <Link to="/">Support Center</Link>
            </li>
            <li>
              <Link to="/">Careers</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footer__info}>
          <h4>Account</h4>
          <ul>
            <li>
              <Link to="/auth/signin">Sign In</Link>
            </li>
            <li>
              <Link to="/cart">View Cart</Link>
            </li>
            <li>
              <Link to="/">My Wishlist</Link>
            </li>
            <li>
              <Link to="/">Track My Order</Link>
            </li>
            <li>
              <Link to="/">Help Ticket</Link>
            </li>
            <li>
              <Link to="/">Shipping Details</Link>
            </li>
            <li>
              <Link to="/">Compare products</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footer__info}>
          <h4>Corporate</h4>
          <ul>
            <li>
              <Link to="/auth/signup/vendor">Become a Vendor</Link>
            </li>
            <li>
              <Link to="/">Affiliate Program</Link>
            </li>
            <li>
              <Link to="/">Farm Business</Link>
            </li>
            <li>
              <Link to="/">Our Suppliers</Link>
            </li>
            <li>
              <Link to="/">Accessibility</Link>
            </li>
            <li>
              <Link to="/">Promotions</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footer__payment}>
          <h4>Install App</h4>
          <p>From App Store or Google Play</p>
          <div className={styles.footer__badges}>
            <div className={styles.footer__badge}>App Store</div>
            <div className={styles.footer__badge}>Google Play</div>
          </div>
          <p>Secured Payment Gateways</p>
          <div className={styles.footer__cards}>
            <span>VISA</span>
            <span>Mastercard</span>
            <span>Maestro</span>
            <span>Amex</span>
          </div>
        </div>
      </div>

      <div className={styles.footer__bottom}>
        <div className={styles.footer__copy}>
          © 2025, <b className={styles.auth__name}>Bloomart</b> All rights
          reserved
        </div>
        <div className={styles.footer__phones}>
          <div className={styles.footer__phone}>
            <span className={styles.footer__phoneNum}>1900 - 6666</span>
            <span className={styles.footer__small}> Working 8:00 - 22:00 </span>
          </div>
          <div className={styles.footer__phone}>
            <span className={styles.footer__phoneNum}>1900 - 8888</span>
            <span className={styles.footer__small}> 24/7 Support Center </span>
          </div>
        </div>
        <div className={styles.footer__social}>
          <span>
            {" "}
            Follow Us:
            <FontAwesomeIcon
              icon={faFacebook}
              size="2x"
              style={{ color: "#007bff" }}
            />
            <FontAwesomeIcon
              icon={faInstagram}
              size="2x"
              style={{ color: "#007bff" }}
            />
          </span>
          <span className={styles.footer__small}>
            Up to 15% discount on your first subscribe
          </span>
        </div>
      </div>
    </footer>
  );
}
