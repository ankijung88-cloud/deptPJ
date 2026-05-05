import React from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumHero } from '../components/home/PremiumHero';
import { PremiumFeatureGrid } from '../components/home/PremiumFeatureGrid';
import { PremiumBannerSection } from '../components/home/PremiumBannerSection';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { useImmersiveMode } from '../context/NavigationActionContext';

const ProjectLandingPage: React.FC = () => {
    useImmersiveMode(true);
    
    return (
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8]">
            <PremiumHeader />
            <main className="pt-20">
                <PremiumHero />
                <PremiumFeatureGrid />
                <PremiumBannerSection />
            </main>
            <PremiumFooter />
        </div>
    );
};

export default ProjectLandingPage;
