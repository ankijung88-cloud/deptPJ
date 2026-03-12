import React, { useState } from 'react';
import Header from './Header';
import { Footer } from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { CustomCursor } from '../common/CustomCursor';
import { MouseTrail3D } from '../common/MouseTrail3D';
import { MousePointer2, Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { LanguageSelector } from '../common/LanguageSelector';
import { NavigationActionProvider } from '../../context/NavigationActionContext';
import { GlobalMiniMap } from '../common/GlobalMiniMap';

type MouseEffectType = '2d' | '3d' | 'none';

export const Layout: React.FC = () => {
    const { i18n } = useTranslation();
    const isRTL = ['ar', 'fa', 'he'].includes(i18n.language);
    const location = useLocation();
    const isLandingPage = location.pathname === '/';
    const isInspirationPage = location.pathname === '/inspiration';
    const hideHeader = isLandingPage || isInspirationPage;

    // State to toggle between 2D Canvas, 3D WebGL, and no effect
    const [activeEffect, setActiveEffect] = useState<MouseEffectType>('none');

    const toggleEffect = () => {
        setActiveEffect(prev => {
            if (prev === '2d') return '3d';
            if (prev === '3d') return 'none';
            return '2d';
        });
    };

    const getTooltipText = (effect: MouseEffectType) => {
        switch (effect) {
            case '2d': return <AutoTranslatedText text="3D 입체 효과로 변경" />;
            case '3d': return <AutoTranslatedText text="효과 끄기" />;
            case 'none': return <AutoTranslatedText text="2D 꽃잎 효과로 변경" />;
            default: return '';
        }
    };

    const getIconTitle = (effect: MouseEffectType) => {
        switch (effect) {
            case '2d': return "3D 마우스 효과로 변경";
            case '3d': return "효과 끄기";
            case 'none': return "2D 캔버스 효과로 변경";
            default: return '';
        }
    };

    return (
        <NavigationActionProvider>
            <div
                dir={isRTL ? 'rtl' : 'ltr'}
                className="flex flex-col min-h-screen bg-dancheong-deep-bg text-dancheong-white font-sans selection:bg-white/20 selection:text-white"
                style={{ backgroundColor: '#2D3D36' }}
            >
                {activeEffect === '2d' && <CustomCursor />}
                {activeEffect === '3d' && <MouseTrail3D />}
                {!hideHeader && <Header />}
                {hideHeader && <LanguageSelector variant="floating" />}
                
                <GlobalMiniMap />
                
                <div className={`flex-grow flex flex-col relative ${!hideHeader ? 'pt-20' : ''}`}>

                    <main className="flex-grow">
                        <Outlet />
                    </main>
                </div>
                {!isLandingPage && <Footer />}

                {/* Mouse Effect Toggle Button */}
                <button
                    onClick={toggleEffect}
                    className="fixed bottom-6 right-6 z-[60] w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl hover:bg-black/60 hover:scale-105 active:scale-95 transition-all group flex items-center justify-center magnetic-target"
                    title={getIconTitle(activeEffect)}
                >
                    {activeEffect === 'none' ? (
                        <Ban className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                    ) : (
                        <MousePointer2 className="w-5 h-5 text-white/60 group-hover:scale-110 transition-all" />
                    )}

                    <span className="absolute -top-10 right-0 bg-black/80 px-3 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center pointer-events-none">
                        {getTooltipText(activeEffect)}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-t-[4px] border-t-black border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent"></span>
                    </span>
                </button>
            </div>
        </NavigationActionProvider>
    );
};
