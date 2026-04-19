import React, { useState } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LandingVisionSection } from '../components/home/LandingVisionSection';
import { LandingFeaturesSection } from '../components/home/LandingFeaturesSection';
import { LandingArchitectureSection } from '../components/home/LandingArchitectureSection';
import { LandingRecruitmentSection } from '../components/home/LandingRecruitmentSection';
import { LandingFooterCTA } from '../components/home/LandingFooterCTA';

const LandingPage: React.FC = () => {
    const [triggerWarp, setTriggerWarp] = useState(false);

    const handleExplore = () => {
        // Scroll to top to ensure warp animation aligns correctly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Slight delay to allow scroll to settle before warping
        setTimeout(() => {
            setTriggerWarp(true);
        }, 500);
    };

    return (
        <div
            className="bg-[#05070D] min-h-screen selection:bg-[#FF3B30]/30"
            style={{ backgroundColor: '#05070D' }}
        >
            {/* Ambient Background Glows - Heritage Tones */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dancheong-green/5 blur-[120px] rounded-full opacity-20" />
            </div>

            <main className="relative z-10 w-full pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
                <HeroSection externalTrigger={triggerWarp} />
                <LandingVisionSection />
                <LandingFeaturesSection />
                <LandingArchitectureSection />
                <LandingRecruitmentSection />
                <LandingFooterCTA onExplore={handleExplore} />
            </main>
        </div>
    );
};

export default LandingPage;
