import React from "react";
import styles from "./LandingPage.module.scss";

import ChatToggle from "../../components/chatToggle/ChatToggle";
import Banner from "../../components/banner/Banner";
import Categories from "../../components/categories/Categories";
import Promo from "../../components/promo/Promo";
import HotDeals from "../../components/hot_deals/HotDeals";
import Malls from "../../components/malls/Malls";
import PopularProducts from "../../components/popularProduct/PopularProducts";

export default function LandingPage() {

  const USERS = [
    { id: "customer_1", name: "Bạn", role: "buyer" },
    { id: "s_ducanh", name: "Đức Anh Computer", role: "seller" },
    { id: "s_hoangha", name: "Hoàng Hà Mobile", role: "seller" },
    { id: "s_phongvu", name: "Phòng Vũ", role: "seller" },
  ];

  return (
    <div id="top">
      {/* Banner */}
      <Banner/>
      {/* Featured Categories */}
      <Categories/>
      {/* Promo */}
      <Promo/>
      {/* HotDeals */}
      <HotDeals/>
      {/* Malls */}
      <Malls/>
      {/* Popular Products */}
      <PopularProducts />

      <section className={styles.about} id="about">
        <h2>About us</h2>
        <div className={styles["about-card"]}>
          <h3>Bloomart</h3>
          <p>
            Your friendly online marketplace for everything you love. 
            Our mission is to bring you a wide variety of quality products at great prices, delivered with care. 
            We are committed to creating a shopping experience that’s fast, friendly, and trustworthy 
            — because your satisfaction is our priority.
          </p>
        </div>
      </section>
      <ChatToggle
        currentUserId="customer_1"
        users={USERS}
        role="buyer"
        defaultOpen={false}
        position="br"       // 'br' (góc phải) hoặc 'bl' (góc trái)
        panelWidth={720}
        panelHeight={640}
      />
    </div>
  );
}
