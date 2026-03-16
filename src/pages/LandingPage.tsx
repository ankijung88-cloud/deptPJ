import { HeroSection } from '../components/home/HeroSection';

const LandingPage: React.FC = () => {
    return (
        <div
            className="bg-dancheong-deep-bg selection:bg-dancheong-red/30"
            style={{ backgroundColor: '#05070D' }}
        >
            {/* Ambient Background Glows - Heritage Tones */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dancheong-green/5 blur-[120px] rounded-full opacity-20" />
            </div>


            <main className="relative z-10">
                <HeroSection />
            </main>
        </div>
    );
};

export default LandingPage;
