// Imports
import { Outlet } from 'react-router-dom';

import Footer from '../../components/footer/Footer.jsx';
import Header from '../../components/header/Header.jsx';
import "../../assets/css/base.css";
import '../layouts/Layout.css'
import Filter from '../../components/filter/filter.jsx';
import { useEffect } from 'react';

export default function Layout() {
    // Navigate to id section
    useEffect(() => {
    const setOffset = () => {
      const header = document.querySelector(".header");      // className header sticky
      const filter = document.querySelector(".filter-nav");  // className filter sticky
      const off =
        (header?.offsetHeight || 0) +
        (filter?.offsetHeight || 0) + 30;
      document.documentElement.style.setProperty("--sticky-offset", `${off}px`);
    };
    setOffset();
    window.addEventListener("resize", setOffset);
    return () => window.removeEventListener("resize", setOffset);
  }, []);
  
    return (
        <div className='layout'>
            <Header />
            <Filter/>
            <div className='app without-sidebar'>
                <Outlet/>
                <Footer />
            </div>
            
        </div>
    )
}