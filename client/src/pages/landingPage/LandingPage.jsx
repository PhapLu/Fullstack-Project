import React from "react";
import "./LandingPage.css";

import Banner from "../../components/banner/Banner";
import Categories from "../../components/categories/Categories";
import Promo from "../../components/promo/Promo";
import HotDeals from "../../components/hot_deals/HotDeals";



export default function LandingPage() {
  return (
    <div>
      {/* Banner */}
        <Banner/>
      {/* Featured Categories */}
       <Categories/>
      {/* Promo */}
       <Promo/>
      {/* HotDeals */}
       <HotDeals/>
    </div>
  );
}
