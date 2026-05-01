import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const HeroSection: React.FC = () => {
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="hero" className="relative min-h-[90vh] sm:h-screen w-full overflow-hidden flex items-center justify-center bg-transparent pt-20">
            <div className="container mx-auto px-6 relative z-20 flex flex-col items-center justify-center text-center">
                <motion.div
                    className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-12 max-w-5xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Description Text - Top (As seen in user image) */}
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-[13px] sm:text-lg md:text-xl font-sans font-medium tracking-tight text-dancheong-ink max-w-[280px] sm:max-w-2xl leading-relaxed"
                    >
                        <AutoTranslatedText text="새로운 가능성을 만드는, 우리 모두를 위한 디지털 생태계를 경험해 보세요." />
                    </motion.p>

                    {/* Action Buttons - Bottom */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4 sm:mt-8 w-full sm:w-auto"
                    >
                        <button
                            onClick={() => scrollToSection('floors')}
                            className="w-full sm:w-auto px-10 py-4 bg-dancheong-ink text-white rounded-full font-bold text-sm sm:text-base hover:bg-dancheong-mugwort transition-all shadow-2xl hover:shadow-dancheong-mugwort/30 transform hover:-translate-y-1 active:scale-95"
                        >
                            <AutoTranslatedText text="Explore Floors" />
                        </button>
                        <button
                            onClick={() => navigate('/notice')}
                            className="w-full sm:w-auto px-10 py-4 bg-white/40 backdrop-blur-md border-2 border-dancheong-ink text-dancheong-ink rounded-full font-bold text-sm sm:text-base hover:bg-dancheong-ink hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                            <AutoTranslatedText text="View Announcements" />
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative background element */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-dancheong-mugwort/5 blur-[120px] rounded-full" />
            </div>
        </section>
    );
};
