import React, { useState } from 'react';
import Header from './Header';
import { Footer } from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { CustomCursor } from '../common/CustomCursor';
import { MouseTrail3D } from '../common/MouseTrail3D';
import { MousePointer2, Ban } from 'lucide-react';

type MouseEffectType = '2d' | '3d' | 'none';

export const Layout: React.FC = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    // State to toggle between 2D Canvas, 3D WebGL, and no effect
    const [activeEffect, setActiveEffect] = useState<MouseEffectType>('2d');

    const toggleEffect = () => {
        setActiveEffect(prev => {
            if (prev === '2d') return '3d';
            if (prev === '3d') return 'none';
            return '2d';
        });
    };

    const getTooltipText = (effect: MouseEffectType) => {
        switch (effect) {
            case '2d': return '3D 입체 효과로 변경';
            case '3d': return '효과 끄기';
            case 'none': return '2D 꽃잎 효과로 변경';
            default: return '';
        }
    };

    const getIconTitle = (effect: MouseEffectType) => {
        switch (effect) {
            case '2d': return '3D 마우스 효과로 변경';
            case '3d': return '효과 끄기';
            case 'none': return '2D 캔버스 효과로 변경';
            default: return '';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-charcoal text-white font-sans selection:bg-dancheong-red selection:text-white">
            {activeEffect === '2d' && <CustomCursor />}
            {activeEffect === '3d' && <MouseTrail3D />}
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            {!isLandingPage && <Footer />}

            {/* Mouse Effect Toggle Button */}
            <button
                onClick={toggleEffect}
                className="fixed bottom-6 right-6 z-[60] p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg hover:bg-white/20 hover:scale-110 active:scale-95 transition-all group flex items-center justify-center"
                title={getIconTitle(activeEffect)}
            >
                {activeEffect === 'none' ? (
                    <Ban className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                ) : (
                    <MousePointer2 className="w-6 h-6 text-white group-hover:text-dancheong-red transition-colors" />
                )}

                <span className="absolute -top-10 right-0 bg-black/80 px-3 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center pointer-events-none">
                    {getTooltipText(activeEffect)}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-tx-[4px] border-t-black border-l-transparent border-r-transparent"></span>
                </span>
            </button>
        </div>
    );
};
