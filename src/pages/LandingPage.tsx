import React, { useEffect, useRef } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FloorGuideSection } from '../components/home/FloorGuideSection';


import { FeaturedSection } from '../components/home/FeaturedSection';

import { LiveShortsSection } from '../components/home/LiveShortsSection';
import { AboutSection } from '../components/home/AboutSection';

import { Footer } from '../components/layout/Footer';

const SCROLL_KEY = 'landing-scroll-y';

const LandingPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // 복원: 마운트 시 저장된 스크롤 위치로 이동
    useEffect(() => {
        const saved = sessionStorage.getItem(SCROLL_KEY);
        if (saved && containerRef.current) {
            containerRef.current.scrollTo({ top: parseInt(saved, 10), behavior: 'auto' });
        }
    }, []);

    // 저장: 스크롤할 때마다 위치 기록
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handleScroll = () => {
            sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
        };
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div ref={containerRef} className="h-screen overflow-y-auto snap-y snap-mandatory no-scrollbar">
            <HeroSection />

            <FloorGuideSection />

            <FeaturedSection />

            <LiveShortsSection />
            <AboutSection />
            <div className="snap-start">
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
