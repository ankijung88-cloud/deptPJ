import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FloorGuideSection } from '../components/home/FloorGuideSection';
import { CalendarSection } from '../components/home/CalendarSection';
import { ArtistSection } from '../components/home/ArtistSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { BrandSpotlightSection } from '../components/home/BrandSpotlightSection';
import { LiveShortsSection } from '../components/home/LiveShortsSection';
import { AboutSection } from '../components/home/AboutSection';

import { Footer } from '../components/layout/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className="h-screen overflow-y-auto snap-y snap-mandatory no-scrollbar">
            <HeroSection />
            <CalendarSection />
            <FloorGuideSection />
            <ArtistSection />
            <FeaturedSection />
            <BrandSpotlightSection />
            <LiveShortsSection />
            <AboutSection />
            <div className="snap-start">
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
