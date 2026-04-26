import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const HeroSection: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleExplore = () => {
        navigate('/inspiration');
    };

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-dancheong-ivory">
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Main UI */}
                <div className="relative z-20 container mx-auto px-6 text-center">
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-4 leading-[1.1] tracking-tighter break-keep text-dancheong-ink"
                    >
                        몽땅쏙
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 text-dancheong-ink opacity-80 leading-relaxed font-medium break-keep px-4 sm:px-0"
                    >
                        <AutoTranslatedText text={t('hero.description')} />
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-6"
                    >
                        <button
                            onClick={handleExplore}
                            className="w-48 py-5 bg-dancheong-ink text-white font-black rounded-full hover:bg-dancheong-mugwort transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-dancheong-ink/20 tracking-[0.2em] uppercase"
                        >
                            <AutoTranslatedText text={t('hero.explore')} />
                        </button>
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="heritage-button-outline w-48 py-5 font-black rounded-full shadow-xl shadow-dancheong-ink/5"
                        >
                            <AutoTranslatedText text={t('hero.story')} />
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
