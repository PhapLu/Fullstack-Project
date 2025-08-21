// Imports
import { Outlet } from 'react-router-dom';

import Footer from '../../components/footer/Footer.jsx';
import Header from '../../components/header/Header.jsx';
import "../../assets/css/base.css";
import '../layouts/Layout.css'
import Filter from '../../components/filter/filter.jsx';

export default function Layout() {
    return (
        <div className='layout'>
            <Header />
            <div className='app without-sidebar'>
                <Filter/>
                <Outlet/>
                <Footer />
            </div>
            
        </div>
    )
}