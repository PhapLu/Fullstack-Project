// Imports
import { Outlet } from 'react-router-dom';

import Navbar from '../../components/navbar/Navbar.jsx';
import Header from '../../components/header/Header.jsx'
import Footer from '../../components/footer/Footer.jsx';

export default function Layout() {
    return (
        <div className='layout'>
            <Header />
            <div className="layout--right">
                <Navbar />
                <main style={{ padding: 16 }}>
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    )
}