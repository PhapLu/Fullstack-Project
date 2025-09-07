import React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";

import styles from "./AuthLayout.module.scss";   // switched to CSS module
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
    <>  
      <div className={styles["auth__wrap"]}>
        <aside className={styles["auth__left"]}>
          <header className={styles["auth__brand"]}>
              <NavLink 
                to="/" 
                style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
              >
                <img className={styles["auth__logo"]} src={logo} alt="Logo" />
                <span className={styles["auth__name"]}>Bloomart</span>
              </NavLink>
           </header>

          <div className={styles["auth__tagline"]}>
            <p>Enjoy your shopping</p>
            <h2>{ROLE_TITLE[role] || "Customer"}</h2>
          </div>

          {/* swap images per role if you want */}
          <div className={styles["auth__img"]}>
            <img className={styles.img1} src={imgs[2]} alt={`${role}-1`} loading="eager" />
            <img className={styles.img2} src={imgs[1]} alt={`${role}-2`} loading="lazy" />
            <img className={styles.img3} src={imgs[0]} alt={`${role}-3`} loading="lazy" />
          </div>
        </aside>

        <main className={styles["auth__right"]}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AuthLayout;
