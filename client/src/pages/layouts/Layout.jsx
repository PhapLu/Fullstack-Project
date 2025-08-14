// Imports
import { Outlet } from 'react-router-dom';

import Footer from '../../components/footer/Footer.jsx';
import Header from '../../components/header/Header.jsx';

export default function Layout() {
    return (
        <div className='layout'>
            <Header />
            <div className='app without-sidebar'>
                <Outlet/>
            </div>
            <Footer />
        </div>
    )
}