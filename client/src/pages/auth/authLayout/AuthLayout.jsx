/* Gia Hy-s4053650 */
import React, { useEffect, useRef } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";

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

  const c1Ref = useRef(null);
  const c3Ref = useRef(null);

  useEffect(() => {
  document.body.style.overflowY = "hidden";
  return () => {
    document.body.style.overflowY = "auto"; // reset unmount
  };
}, []);


  useEffect(() => {
  const start = Date.now();
  const items = [
    { el: c1Ref.current, moveX: 36, moveY: 72, scaleRange: 0.060, speed: 0.72, phase: 0.10 },
  
    { el: c3Ref.current, moveX: 26, moveY: 52, scaleRange: 0.050, speed: 0.76, phase: 3.00 },
  ];
  

  let frame;
  const animate = () => {
    const t = (Date.now() - start) / 1000;
    items.forEach(({ el, moveX, moveY, scaleRange, speed, phase }) => {
      if (!el) return;
      const offsetX = Math.sin(t * speed + phase) * moveX;
      const offsetY = Math.cos(t * speed + phase) * moveY;
      const scale = 1 + Math.sin(t * speed + phase) * scaleRange;
      el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    });
    frame = requestAnimationFrame(animate);
  };

  animate();
  return () => cancelAnimationFrame(frame);
}, []);

  return (
    <>
      <div ref={c1Ref} className="bg-circle circle1" />
      <div ref={c3Ref} className="bg-circle circle3" />
      
      <div className="auth__wrap">
        <aside className="auth__left">
          <header className="auth__brand">
              <NavLink 
                to="/" 
                style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
              >
                <img className="auth__logo" src={logo} alt="Logo" />
                <span className="auth__name">Bloomart</span>
              </NavLink>
           </header>

          <div className="auth__tagline">
            <p>Enjoy your shopping as a</p>
            <h2>{ROLE_TITLE[role] || "Customer"}</h2>
          </div>

          {/* swap images per role if you want */}
          <div className="auth__img">
            <img className="img1" src={imgs[2]} alt={`${role}-1`} loading="eager" />
            <img className="img2" src={imgs[1]} alt={`${role}-2`} loading="lazy" />
            <img className="img3" src={imgs[0]} alt={`${role}-3`} loading="lazy" />
          </div>
        </aside>

        <main className="auth__right">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AuthLayout;
