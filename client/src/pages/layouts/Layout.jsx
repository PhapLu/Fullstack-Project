// Imports
import { Outlet } from 'react-router-dom';

import Navbar from '../../components/navbar/Navbar.jsx';
import Footer from '../../components/footer/Footer.jsx';

export default function Layout() {
    return (
        <div className='layout'>
            <Navbar />
            <div className='app without-sidebar'>
                <Outlet/>
            </div>
            <Footer />
        </div>
    )
}