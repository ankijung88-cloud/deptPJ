import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/home/HeroSection';
import { LandingVisionSection } from '../components/home/LandingVisionSection';
import { LandingFeaturesSection } from '../components/home/LandingFeaturesSection';
import { LandingArchitectureSection } from '../components/home/LandingArchitectureSection';
import { LandingRecruitmentSection } from '../components/home/LandingRecruitmentSection';
import { LandingFooterCTA } from '../components/home/LandingFooterCTA';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleExplore = () => {
        navigate('/inspiration');
    };

    return (
        <div
            className="bg-transparent min-h-screen selection:bg-dancheong-mugwort/30"
        >
            {/* Ambient Background Glows - Heritage Tones */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dancheong-mugwort/5 blur-[120px] rounded-full opacity-40" />
                <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-dancheong-navy/5 blur-[100px] rounded-full opacity-30" />
            </div>

            <main className="relative z-10 w-full pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
                <HeroSection />
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
