import React from 'react';
import Header from './Header';
import { Footer } from './Footer';
import { Outlet, useLocation } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '../common/LanguageSelector';
import { useNavigationState } from '../../context/NavigationActionContext';


export const Layout: React.FC = () => {
    const { i18n } = useTranslation();
    const isRTL = ['ar', 'fa', 'he'].includes(i18n.language);
    const location = useLocation();
    const { isImmersive, isUiVisible, isMeeting } = useNavigationState();
    
    const { hideHeader, isAdminPage, isMuseumPage, isSquarePage, isMeetingPage, isOfficePage, isLandingPage, isProjectTemplate } = React.useMemo(() => {
        const normalizedPath = (location.pathname || '').replace(/\/$/, '');
        const landing = normalizedPath === '' || normalizedPath === '/' || normalizedPath === '/inspiration' || normalizedPath === '/floor-guide' || (normalizedPath && normalizedPath.endsWith('/'));
        const inspiration = normalizedPath === '/inspiration';
        const museum = normalizedPath && normalizedPath.endsWith('/museum');
        const square = normalizedPath && normalizedPath.endsWith('/square');
        const meeting = (normalizedPath && normalizedPath.endsWith('/meeting')) || isMeeting;
        const office = normalizedPath && normalizedPath.endsWith('/office');
        const admin = normalizedPath?.startsWith('/admin') || normalizedPath?.startsWith('/register') || normalizedPath?.startsWith('/agency');
        const projectTemplate = normalizedPath && normalizedPath.includes('/project-template');
        
        // Show header on login and registration pages for better UX
        const isAuthPage = normalizedPath.includes('/login') || normalizedPath.includes('/register');
        const shouldHideHeader = (landing || inspiration || admin) && !isAuthPage;
        
        return {
            hideHeader: shouldHideHeader,
            isAdminPage: admin,
            isMuseumPage: museum,
            isSquarePage: square,
            isMeetingPage: meeting || isMeeting,
            isOfficePage: office,
            isLandingPage: landing,
            isProjectTemplate: projectTemplate
        };
    }, [location.pathname, isMeeting]);

    return (
        <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="flex flex-col min-h-screen bg-transparent text-dancheong-ink font-sans selection:bg-dancheong-mugwort selection:text-white relative overflow-x-hidden"
        >

            {!hideHeader && !isImmersive && <Header />}
            {(hideHeader || isImmersive) && !isAdminPage && !isMuseumPage && !isSquarePage && !isMeetingPage && !isOfficePage && !isLandingPage && !isProjectTemplate && (
                <div className={`fixed inset-0 pointer-events-none z-[50000] transition-all duration-700 ${!isUiVisible ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    <LanguageSelector variant="floating" />
                </div>
            )}
            
            {/* Minimap feature removed as per user request */}
            
            <div className={`flex-grow flex flex-col relative ${(!hideHeader && !isImmersive) ? 'pt-20' : ''}`}>

                <main className="flex-grow">
                    <Outlet />
                </main>
            </div>
            {!isImmersive && <Footer />}


        </div>
    );
};
