import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LandingFeaturesSection } from '../components/home/LandingFeaturesSection';
import { LandingRecruitmentSection } from '../components/home/LandingRecruitmentSection';
import { LandingPartnerSection } from '../components/home/LandingPartnerSection';
import { LandingFloorSection } from '../components/home/LandingFloorSection';
import { LandingFooterCTA } from '../components/home/LandingFooterCTA';
import { LandingHeader } from '../components/layout/LandingHeader';

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
            className="bg-transparent min-h-screen selection:bg-dancheong-mugwort/30"
        >
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

                
                {/* Heritage Tones / Glows */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dancheong-mugwort/5 blur-[120px] rounded-full opacity-40" />
                <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-dancheong-navy/5 blur-[100px] rounded-full opacity-30" />
            </div>

            <main className="relative z-10 w-full pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
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
