import React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import '../../../assets/css/base.css'
import "../authLayout/AuthLayout.css";
import logo from '../../../assets/logo.png'
import c1 from '../../../assets/customer_img/customer-1.png'
import c2 from '../../../assets/customer_img/customer-2.png'
import c3 from '../../../assets/customer_img/customer-3.png'
import v1 from '../../../assets/vendor_img/vendor-1.png'
import v2 from '../../../assets/vendor_img/vendor-2.png'
import v3 from '../../../assets/vendor_img/vendor-3.png'
import s1 from '../../../assets/shipper_img/shipper-1.png'
import s2 from '../../../assets/shipper_img/shipper-2.png'
import s3 from '../../../assets/shipper_img/shipper-3.png'

const ROLE_TITLE = {
  customer: "Customer",
  vendor: "Vendor",
  shipper: "Shipper",
};

const ROLE_IMAGES = {
  customer: [c1, c2, c3],
  vendor:   [v1, v2, v3],
  shipper:  [s1, s2, s3],
};

const AuthLayout = () => {
  const { role } = useParams();
  const imgs = ROLE_IMAGES[role] || ROLE_IMAGES.customer;

  return (
    <div className="auth-wrap">
      <aside className="auth-left">
        <header className="auth-brand">
        {/* add NavLink to landing page */}
          <img className="auth-logo" src={logo} alt="Logo" style={{ width: "50px", height: "50px", objectFit: "cover" }} />
          <span className="auth-name">Bloomart</span>
        </header>

        <div className="auth-tagline">
          <p>Enjoy your shopping as a</p>
          <h3>{ROLE_TITLE[role] || "Customer"}</h3>
        </div>

        {/* swap images per role if you want */}
        <img className="auth-img auth-img1" src={imgs[0]} alt={`${role}-1`} loading="eager" style={{ width: "500px", height: "500px", objectFit: "cover" }} />
        <img className="auth-img auth-img2" src={imgs[1]} alt={`${role}-2`} loading="lazy" style={{ width: "500px", height: "500px", objectFit: "cover" }} />
        <img className="auth-img auth-img3" src={imgs[2]} alt={`${role}-3`} loading="lazy" style={{ width: "500px", height: "500px", objectFit: "cover" }} />
      </aside>

      <main className="auth-right">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
