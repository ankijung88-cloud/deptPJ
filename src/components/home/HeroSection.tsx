import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { BrandLogo } from '../common/BrandLogo';
import { useTranslation } from 'react-i18next';

export const HeroSection: React.FC = () => {
    const { t } = useTranslation();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-transparent">
            <div className="absolute inset-0 flex items-center justify-center pb-16 lg:pb-24">
                {/* Main UI */}
                <div className="relative z-20 container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="-mb-16 lg:-mb-24 flex justify-center"
                    >
                        <img
                            src="/door.png"
                            alt="Door Logo"
                            className="h-72 sm:h-96 lg:h-[36rem] xl:h-[42rem] w-auto opacity-100 drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
                        />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="tracking-tight break-keep flex flex-col items-center gap-4 lg:gap-8 text-dancheong-ink"
                    >
                        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold opacity-90">
                            <AutoTranslatedText text="모든 가치와 사람이 어우러지는 통합 연결 플랫폼" />
                        </span>
                        <BrandLogo size={120} className="mb-4" />
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-3xl mx-auto mt-12 flex flex-col items-center gap-8"
                    >
                        <p className="text-sm sm:text-base text-dancheong-ink/70 leading-[1.8] font-medium break-keep">
                            <AutoTranslatedText text="몽땅쏙은 비즈니스, 예술, 소통 등 분야의 경계 없이 누구나 주인공이 되어 함께 어울릴 수 있는 열린 공간입니다. 각자의 고유한 이야기가 하나로 모여 새로운 가능성을 만드는, 우리 모두를 위한 디지털 생태계를 경험해 보세요." />
                        </p>
                        
                        <button
                            onClick={() => scrollToSection('floors')}
                            className="heritage-button-fill px-8 py-3 text-sm sm:text-base font-black rounded-full bg-dancheong-ink text-white hover:bg-dancheong-mugwort transition-all duration-500 tracking-widest uppercase shadow-xl shadow-dancheong-ink/20 hover:shadow-2xl hover:-translate-y-1"
                        >
                            <AutoTranslatedText text={t('hero.start')} />
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
