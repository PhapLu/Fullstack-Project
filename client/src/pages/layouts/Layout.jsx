// Imports
import { Outlet } from 'react-router-dom';

import Footer from '../../components/footer/Footer.jsx';
import Header from '../../components/header/Header.jsx';
import Filter from '../../components/filter/filter.jsx';
import { useEffect } from 'react';
import "../../assets/css/base.scss";

import styles from './Layout.module.scss';


export default function Layout() {
  // Navigate to id section
 useEffect(() => {
  const header = document.getElementById("site-header");
  const filter = document.getElementById("filter-nav");

  const setVars = () => {
    const h = header?.offsetHeight || 0;
    const f = filter?.offsetHeight || 0;
    // small extra breathing room so the section title isn’t touching the bar
    const gap = 16;
    document.documentElement.style.setProperty("--header-height", `${h}px`);
    document.documentElement.style.setProperty("--filter-height", `${f}px`);
    document.documentElement.style.setProperty("--sticky-offset", `${h + f + gap}px`);
  };

  setVars();
  // Recalculate on resize/zoom or if fonts load and change height
  window.addEventListener("resize", setVars);
  document.fonts?.addEventListener?.("loadingdone", setVars);

  return () => {
    window.removeEventListener("resize", setVars);
    document.fonts?.removeEventListener?.("loadingdone", setVars);
  };
}, []);

  
  return (
    <div className={styles.layout}>
      <Header />
      <Filter/>
      <div className={`${styles.app} ${styles["without-sidebar"]}`}>
        <Outlet/>
        <Footer />
      </div>
    </div>
  );
}
