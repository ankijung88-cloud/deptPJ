import React from 'react';
import Header from './Header';
import { Footer } from './Footer';
import { Outlet, useLocation } from 'react-router-dom';

export const Layout: React.FC = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <div className="flex flex-col min-h-screen bg-charcoal text-white font-sans selection:bg-dancheong-red selection:text-white">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            {!isLandingPage && <Footer />}
        </div>
    );
};
