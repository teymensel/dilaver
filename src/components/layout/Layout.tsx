import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout: React.FC = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="content-area">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
