import React, { useEffect } from 'react';
import { LandingFeaturesSection } from '../components/home/LandingFeaturesSection';
import { LandingRecruitmentSection } from '../components/home/LandingRecruitmentSection';
import { LandingPartnerSection } from '../components/home/LandingPartnerSection';
import { LandingFloorSection } from '../components/home/LandingFloorSection';
import { LandingFooterCTA } from '../components/home/LandingFooterCTA';
import { LandingHeader } from '../components/layout/LandingHeader';
import { HeroSection } from '../components/home/HeroSection';

const LandingPage: React.FC = () => {

    useEffect(() => {
        const path = window.location.pathname;
        if (path === '/inspiration' || path === '/floor-guide') {
            const floorSection = document.getElementById('floors');
            if (floorSection) {
                setTimeout(() => {
                    floorSection.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, []);

    const handleExplore = () => {
        const floorSection = document.getElementById('floors');
        if (floorSection) {
            floorSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div
            className="bg-white min-h-screen selection:bg-dancheong-mugwort/30 relative"
        >
            {/* Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Ambient Background Glows - Beauty Palette */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Soft Rose Pink Glow */}
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#FFECEC]/40 blur-[150px] rounded-full opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
                {/* Pure Luminous Glow */}
                <div className="absolute bottom-[10%] left-[-10%] w-[60%] h-[60%] bg-white/50 blur-[120px] rounded-full opacity-40" />
                {/* Deep Mugwort Accents */}
                <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-dancheong-mugwort/5 blur-[100px] rounded-full opacity-20" />
            </div>

            <main className="relative z-10 w-full pt-20 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
                <LandingHeader />
                <HeroSection />
                <LandingFloorSection />
                <LandingFeaturesSection />
                <LandingPartnerSection />
                <LandingRecruitmentSection />
                <LandingFooterCTA onExplore={handleExplore} />
            </main>
        </div>
    );
};

export default LandingPage;
