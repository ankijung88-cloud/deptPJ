import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { SUPABASE_MEDIA_URL } from '../../lib/supabaseClient';

export const AboutSection: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });


    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Parallax Transforms
    const bgScale = useTransform(smoothProgress, [0, 0.5, 1], [1.2, 1, 1.2]);
    const textLayerY = useTransform(smoothProgress, [0, 1], [100, -100]);
    const giantTextX = useTransform(smoothProgress, [0, 1], [-100, 100]);
    const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={sectionRef}
            className="min-h-[150vh] w-full bg-dancheong-deep-bg overflow-hidden relative py-40 flex flex-col items-center"
        >
            {/* Immersive Background Layer */}
            <motion.div
                style={{ scale: bgScale, opacity }}
                className="absolute inset-0 z-0"
            >
                <video
                    className="w-full h-full object-cover opacity-20 grayscale brightness-50"
                    src={`${SUPABASE_MEDIA_URL}/video/k-culture.mp4`}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-b from-dancheong-deep-bg via-transparent to-dancheong-deep-bg" />
            </motion.div>

            {/* Giant Background Typography - Increased Vibrancy */}
            <motion.div
                style={{ x: giantTextX }}
                className="absolute inset-x-0 top-1/4 -translate-y-1/2 flex justify-center items-center pointer-events-none opacity-[0.05] select-none z-0 overflow-hidden"
            >
                <span className="text-[40vw] font-serif font-black whitespace-nowrap leading-none tracking-tighter text-dancheong-white/10 italic">
                    S A N S U
                </span>
            </motion.div>

            {/* Narrative Content Blocks */}
            <div className="lossless-layout relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    {/* Left: Brand Essence Card */}
                    <div className="lg:col-span-12 flex justify-center mb-40">
                        <motion.div
                            style={{ y: textLayerY, opacity }}
                            className="max-w-4xl text-center space-y-8"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: 120 }}
                                    className="dancheong-rafter-line opacity-40"
                                />
                                <span className="text-xs font-black tracking-[0.6em] text-dancheong-gold uppercase">
                                    <AutoTranslatedText text="Identity of Silence" />
                                </span>
                            </div>

                            <h2 className="text-5xl md:text-[12rem] font-serif font-black text-dancheong-white tracking-tighter leading-[0.9] drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                                <span className="block text-dancheong-red/40 font-light italic mb-4 text-4xl md:text-6xl"><AutoTranslatedText text="본질을 비추는" /></span>
                                <AutoTranslatedText text="공간의 아카이브" />
                            </h2>
                        </motion.div>
                    </div>

                    {/* Right: Detailed Story Card */}
                    <div className="lg:col-span-7 lg:col-start-6">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="bg-dancheong-deep-bg/80 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] border border-dancheong-border relative group shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                        >
                            {/* Accent Glow */}
                            <div className="absolute -top-3 -left-3 w-12 h-12 bg-dancheong-vibrant-teal/20 rounded-full blur-xl opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />

                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <h3 className="text-2xl md:text-4xl font-serif font-bold text-shadow-premium text-dancheong-white">
                                        <AutoTranslatedText text={t('about.title')} />
                                    </h3>
                                    <p className="text-dancheong-white/40 text-lg font-light leading-relaxed italic">
                                        <AutoTranslatedText text={t('about.subtitle')} />
                                    </p>
                                </div>

                                <div className="space-y-8 text-white/80 font-light leading-relaxed text-2xl">
                                    <p className="border-l-4 border-dancheong-red pl-12">
                                        <AutoTranslatedText text={t('about.description1')} />
                                    </p>
                                    <p className="opacity-60 pl-12 border-l border-white/10">
                                        <AutoTranslatedText text={t('about.description2')} />
                                    </p>
                                </div>

                                <motion.button
                                    onClick={() => navigate('/about')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative flex items-center gap-6 bg-dancheong-gold/5 border border-dancheong-border text-dancheong-white py-5 px-10 rounded-full transition-all duration-500 hover:bg-dancheong-gold/10"
                                >
                                    <span className="font-bold tracking-[0.3em] text-xs uppercase"><AutoTranslatedText text="Discovery Full Story" /></span>
                                    <div className="w-10 h-10 rounded-full bg-dancheong-white/5 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500 border border-dancheong-white/10">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Visual Fragment */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.5, scale: 1 }}
                viewport={{ once: true }}
                className="absolute bottom-20 left-10 w-64 aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 hidden lg:block shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            >
                <video
                    className="w-full h-full object-cover"
                    src={`${SUPABASE_MEDIA_URL}/video/modern_tradition.mp4`}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            </motion.div>
        </section>
    );
};
