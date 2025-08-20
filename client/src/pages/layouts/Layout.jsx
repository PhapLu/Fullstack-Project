// Imports
import { Outlet } from 'react-router-dom';

import Footer from '../../components/footer/Footer.jsx';
import Header from '../../components/header/Header.jsx';
import "../../assets/css/base.css";
import Filter from '../../components/filter/filter.jsx';

export default function Layout() {
    return (
        <div className='layout'>
            <Header />
            <Filter/>
            <div className='app without-sidebar'>
                <Outlet/>
            </div>
            <Footer />
        </div>
    )
}