import React, { useState } from 'react';
import { motion, useTransform, useSpring, animate, AnimatePresence, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

import { HeroPortal3D } from './HeroPortal3D';


type PortalPhase = 'hero' | 'warping' | 'arrived';

interface HeroSectionProps {
    externalTrigger?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ externalTrigger }) => {
    const [phase, setPhase] = useState<PortalPhase>('hero');
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Motion Values for timed animation
    const portalVelocity = useMotionValue(0);
    const portalOpacity = useMotionValue(0.4);
    const contentScale = useMotionValue(1);
    const contentBlur = useMotionValue(0);
    const contentBlurFilter = useTransform(contentBlur, (v) => `blur(${v}px)`);
    const contentOpacity = useMotionValue(1);

    // Smooth Spring for Velocity
    const smoothVelocity = useSpring(portalVelocity, { stiffness: 50, damping: 30 });

    const [flashActive, setFlashActive] = useState(false);

    const handleExplore = async () => {
        if (phase !== 'hero') return;

        setPhase('warping');

        // 1. Accelerate Portal & Visuals
        animate(portalVelocity, 120, { duration: 2.8, ease: [0.4, 0, 0.2, 1] });
        animate(portalOpacity, 1, { duration: 1 });

        // 2. Dissolve Content
        animate(contentScale, 2.5, { duration: 3, ease: "easeIn" });
        animate(contentBlur, 12, { duration: 2.5 });
        animate(contentOpacity, 0, { duration: 1.5, delay: 0.5 });

        // 3. Trigger Flash
        setTimeout(() => {
            setFlashActive(true);
        }, 2700);

        // 4. Navigate Directly to Floor Guide
        setTimeout(() => {
            navigate('/inspiration');
        }, 3000);
    };

    React.useEffect(() => {
        if (externalTrigger && phase === 'hero') {
            handleExplore();
        }
    }, [externalTrigger, phase]);


    return (
        <section className={`${phase !== 'hero' ? 'fixed inset-0 z-50' : 'relative h-screen w-full overflow-hidden'} flex items-center justify-center bg-white`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key="hero-content"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {/* 3D Portal Layer */}
                    <motion.div
                        style={{ opacity: portalOpacity }}
                        className="absolute inset-0 z-10 pointer-events-none"
                    >
                        <HeroPortal3D velocity={smoothVelocity} />
                    </motion.div>


                    {/* Main UI */}
                    <motion.div
                        style={{
                            opacity: contentOpacity,
                            scale: contentScale,
                            filter: contentBlurFilter
                        }}
                        className="relative z-20 container mx-auto px-6 text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-2 flex justify-center"
                        >
                            <img
                                src="/sample.png"
                                alt="몽땅쏙 Logo"
                                className="h-32 w-auto grayscale contrast-125 brightness-75 opacity-80"
                            />
                        </motion.div>


                        <motion.h1
                            className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-4 leading-[1.1] tracking-tighter break-keep text-dancheong-ink"
                        >
                            몽땅쏙
                        </motion.h1>

                        <motion.p
                            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 text-[#171717] opacity-80 leading-relaxed font-medium break-keep px-4 sm:px-0"
                        >
                            <AutoTranslatedText text={t('hero.description')} />
                        </motion.p>

                        <motion.div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <button
                                onClick={handleExplore}
                                disabled={phase === 'warping'}
                                className="w-48 py-5 bg-[#171717] text-white font-black rounded-full hover:bg-[#4F6D5B] transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#171717]/20 tracking-[0.2em] uppercase disabled:opacity-50"
                            >
                                {phase === 'warping' ? <AutoTranslatedText text={t('hero.warping')} /> : <AutoTranslatedText text={t('hero.explore')} />}
                            </button>
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="heritage-button-outline w-48 py-5 font-black rounded-full shadow-xl shadow-[#171717]/5"
                            >
                                <AutoTranslatedText text={t('hero.story')} />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="mt-12 flex justify-center"
                        >
                            <button
                                onClick={() => navigate('/inspiration')}
                                className="text-sm text-[#171717] font-black hover:text-[#4F6D5B] transition-all duration-300 tracking-[0.4em] uppercase border-b-2 border-[#171717]/20 hover:border-[#4F6D5B] hover:scale-110 pb-2"
                            >
                                <AutoTranslatedText text="SKIP" />
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Global Flash Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: flashActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] bg-white pointer-events-none mix-blend-screen"
            />
        </section>
    );
};
