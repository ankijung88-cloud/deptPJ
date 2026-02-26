import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FloorGuideSection } from '../components/home/FloorGuideSection';
import { CalendarEventsCombinedSection } from '../components/home/CalendarEventsCombinedSection';
import { LiveShortsSection } from '../components/home/LiveShortsSection';
import { AboutSection } from '../components/home/AboutSection';

import { Footer } from '../components/layout/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className="h-screen overflow-y-auto snap-y snap-mandatory no-scrollbar">
            <HeroSection />
            <FloorGuideSection />
            <CalendarEventsCombinedSection />
            <AboutSection />
            <LiveShortsSection />
            <div className="snap-start">
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
