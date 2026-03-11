import React, { useRef, useState } from 'react';
import { motion, useTransform, useSpring, animate, AnimatePresence, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

import { HeroPortal3D } from './HeroPortal3D';

type PortalPhase = 'hero' | 'warping' | 'arrived';

export const HeroSection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [phase, setPhase] = useState<PortalPhase>('hero');
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Motion Values for timed animation
    const portalVelocity = useMotionValue(2);
    const portalOpacity = useMotionValue(0.4);
    const videoOpacity = useMotionValue(0.8);
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
        animate(videoOpacity, 0, { duration: 2, delay: 0.5 });

        // 3. Trigger Flash
        setTimeout(() => {
            setFlashActive(true);
        }, 2700);

        // 4. Arrive
        setTimeout(() => {
            setPhase('arrived');
            setFlashActive(false);
            portalVelocity.set(0);
        }, 3000);
    };

    const videoUrl = "https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/main_hero.mp4";
    const arrivalImg = "/images/arrival_gateway.png";

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#1A2420]" style={{ backgroundColor: '#1A2420' }}>
            <AnimatePresence mode="wait">
                {phase !== 'arrived' ? (
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

                        {/* Background Video */}
                        <motion.div
                            style={{ opacity: videoOpacity }}
                            className="absolute inset-0 z-0"
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src={videoUrl} type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-b from-[#1A2420]/40 via-transparent to-[#1A2420]/80 z-10" />
                            <div className="absolute inset-0 bg-black/20 z-10" />
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
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-block mb-6 px-4 py-1 border border-[#00FFC2]/30 bg-[#00FFC2]/5 backdrop-blur-md rounded-full text-[#00FFC2] text-sm font-medium tracking-widest uppercase"
                            >
                                <AutoTranslatedText text={t('hero.tagline')} />
                            </motion.div>

                            <motion.h1
                                className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-4 leading-[1.1] tracking-tighter break-keep text-white"
                            >
                                <AutoTranslatedText text={t('hero.title_main')} /> <br className="hidden sm:block" />
                                <span className="text-[#FFD700]/80"><AutoTranslatedText text={t('hero.title_sub')} /></span>
                            </motion.h1>

                            <motion.p
                                className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/80 leading-relaxed font-medium break-keep px-4 sm:px-0"
                            >
                                <AutoTranslatedText text={t('hero.description')} />
                            </motion.p>

                            <motion.div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={handleExplore}
                                    disabled={phase === 'warping'}
                                    className="px-10 py-4 bg-[#FF3B30] text-white font-semibold rounded-sm hover:bg-[#e6352b] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,59,48,0.4)] tracking-wider uppercase disabled:opacity-50"
                                >
                                    {phase === 'warping' ? <AutoTranslatedText text={t('hero.warping')} /> : <AutoTranslatedText text={t('hero.explore')} />}
                                </button>
                                <button
                                    onClick={() => navigate('/about')}
                                    className="px-10 py-4 border border-white/30 backdrop-blur-sm text-white font-semibold rounded-sm hover:bg-white/10 transition-all duration-500 tracking-wider uppercase"
                                >
                                    <AutoTranslatedText text={t('hero.story')} />
                                </button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1, duration: 1 }}
                                className="mt-8 flex justify-center"
                            >
                                <button
                                    onClick={() => navigate('/inspiration')}
                                    className="text-sm text-white/70 hover:text-white transition-all duration-300 tracking-[0.3em] uppercase border-b border-white/40 hover:border-white hover:scale-110 pb-1"
                                >
                                    SKIP
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="arrived-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 z-40 bg-[#1A2420] flex items-center justify-center"
                    >
                        {/* Arrival Space Background */}
                        <div className="absolute inset-0 z-0 bg-[#0A0D17]">
                            <img
                                src={arrivalImg}
                                alt="Virtual Gateway"
                                className="w-full h-full object-cover opacity-80"
                                onError={(e) => {
                                    console.error("Arrival image failed to load:", arrivalImg);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2420] via-[#1A2420]/40 to-[#1A2420]/80" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
                        </div>

                        {/* Arrival UI */}
                        <div className="relative z-10 text-center px-6">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="text-5xl md:text-7xl font-serif text-white mb-6"
                            >
                                <AutoTranslatedText text={t('hero.arrived')} />
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2, duration: 1 }}
                                className="text-white/60 tracking-[0.4em] uppercase text-sm"
                            >
                                <AutoTranslatedText text={t('hero.welcome')} />
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2, duration: 1 }}
                                className="mt-12"
                            >
                                <button
                                    onClick={() => {
                                        navigate('/inspiration');
                                    }}
                                    className="px-8 py-3 border border-[#FFD700]/30 text-[#FFD700] rounded-full hover:bg-[#FFD700]/10 transition-all duration-300 pointer-events-auto"
                                >
                                    <AutoTranslatedText text={t('hero.start')} />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
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
