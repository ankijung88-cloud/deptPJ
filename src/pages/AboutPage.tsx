import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { Home } from 'lucide-react';

const AboutPage: React.FC = () => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
            const navigate = useNavigate();

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo(0, 0);
        }
    }, []);

            return (
        <div ref={containerRef} className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory bg-[#1A2420] text-white font-sans selection:bg-dancheong-red/30 relative scroll-smooth">
            <LanguageSelector variant="floating" />

            <button
                onClick={() => navigate('/')}
                className="fixed top-6 left-6 md:top-10 md:left-10 z-[100] p-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-black/60 hover:border-white/30 transition-all shadow-lg group"
                aria-label={t('common.back_home')}
            >
                <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            {/* 00. Brand Vision / Intro Section (Editorial Style) */}
            <section className="w-full min-h-[100dvh] flex flex-col items-center justify-center snap-start snap-always relative overflow-hidden bg-[#0A100D] py-24 px-6">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-dancheong-red/5 to-transparent"></div>
                    <div className="absolute inset-0" style={{ 
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                        backgroundSize: '100px 100px'
                    }}></div>
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-dancheong-red/5 blur-[130px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-dancheong-gold/5 blur-[130px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="w-full max-w-5xl mx-auto relative z-10">
                    {/* Masthead */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="text-center border-b border-white/20 pb-6 mb-16"
                    >
                        <span className="text-[10px] md:text-sm font-bold tracking-[0.8em] text-white/40 uppercase">
                            {t('brand_vision.masthead')}
                        </span>
                    </motion.div>

                    {/* Headline Area */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 1.2 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-[5.5rem] font-serif font-black mb-10 tracking-tighter leading-[1.05] max-w-5xl mx-auto drop-shadow-2xl">
                            <AutoTranslatedText text={t('brand_vision.headline')} />
                        </h2>
                        <div className="flex flex-col items-center gap-8">
                            <p className="text-xl md:text-3xl font-bold text-dancheong-gold max-w-3xl mx-auto break-keep leading-tight px-4">
                                <AutoTranslatedText text={t('brand_vision.subheadline')} />
                            </p>
                            <div className="flex items-center justify-center gap-6 text-[10px] md:text-xs font-mono tracking-[0.3em] text-white/30 uppercase border-t border-white/5 pt-6 w-full max-w-md">
                                <span>{t('brand_vision.metadata')}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Article Content */}
                    <div className="grid md:grid-cols-2 gap-x-20 gap-y-12 text-white/70 leading-relaxed font-light text-lg md:text-xl">
                        {/* Column 1 */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="space-y-10"
                        >
                            <div className="relative">
                                {/* First char drop cap logic handled by i18n or manual extraction if needed */}
                                <p className="text-justify break-keep">
                                    <span className="float-left text-7xl md:text-9xl font-serif font-black text-dancheong-red mr-6 mt-3 leading-[0.8] drop-shadow-[0_0_20px_rgba(235,59,45,0.3)]">
                                        V
                                    </span>
                                    <AutoTranslatedText text={t('brand_vision.body_intro').startsWith('V') ? t('brand_vision.body_intro').slice(1) : t('brand_vision.body_intro')} />
                                </p>
                            </div>
                            <div className="bg-white/[0.03] border-l-4 border-dancheong-red p-10 rounded-r-[2rem] shadow-xl">
                                <p className="italic text-white/90 leading-loose">
                                    <AutoTranslatedText text={t('brand_vision.body_philosophy')} />
                                </p>
                            </div>
                        </motion.div>

                        {/* Column 2 */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="space-y-10"
                        >
                            <p className="text-justify break-keep">
                                <AutoTranslatedText text={t('brand_vision.body_future')} />
                            </p>
                            
                            {/* Pull Quote */}
                            <div className="py-12 border-y border-white/10 my-12 relative group">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-6xl text-dancheong-gold opacity-30 font-serif">"</div>
                                <p className="text-2xl md:text-4xl font-serif font-bold text-white text-center italic leading-[1.3] px-6">
                                    <AutoTranslatedText text={t('brand_vision.pull_quote')} />
                                </p>
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-6xl text-dancheong-gold opacity-30 font-serif">"</div>
                            </div>

                            <p className="text-justify break-keep">
                                <AutoTranslatedText text={t('brand_vision.body_essential')} />
                            </p>
                        </motion.div>
                    </div>

                    {/* Final Conclusion */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 1.2, delay: 0.6 }}
                        className="mt-24 pt-16 border-t border-white/10 text-center max-w-4xl mx-auto"
                    >
                        <p className="text-2xl md:text-4xl font-serif font-medium text-white/40 leading-snug italic tracking-tight">
                            <AutoTranslatedText text={t('brand_vision.body_conclusion')} />
                        </p>
                    </motion.div>
                </div>

                {/* Aesthetic Detail: Side Label */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 2 }}
                    className="absolute bottom-12 left-10 hidden md:flex flex-col items-center gap-6 opacity-20 hover:opacity-100 transition-opacity"
                >
                    <span className="text-[10px] tracking-[1em] uppercase [writing-mode:vertical-lr] font-black rotate-180"><AutoTranslatedText text="VISIONARY REPORT" /></span>
                    <div className="w-[1px] h-24 bg-gradient-to-b from-dancheong-gold to-transparent"></div>
                </motion.div>
                
                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 2 }}
                    className="absolute bottom-12 right-12 hidden md:flex flex-col items-end gap-4 opacity-40 group cursor-pointer"
                >
                    <span className="text-[10px] tracking-[0.5em] uppercase text-white/50 group-hover:text-dancheong-gold transition-colors"><AutoTranslatedText text="SCROLL TO EXPLORE" /></span>
                    <div className="w-16 h-[1px] bg-gradient-to-r from-dancheong-gold/60 to-transparent group-hover:w-24 transition-all duration-500"></div>
                </motion.div>
            </section>

        </div>
    );
};

export default AboutPage;
