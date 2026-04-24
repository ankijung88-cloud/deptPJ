import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const LandingVisionSection: React.FC = () => {
    return (
        <section className="relative w-full py-32 px-6 bg-dancheong-ivory flex flex-col items-center justify-center overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-dancheong-mugwort/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-dancheong-navy/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-dancheong-ink mb-8 tracking-wide">
                        <AutoTranslatedText text="ENTERPRISE METAVERSE SOLUTION" />
                    </h2>
                    <p className="text-lg md:text-2xl text-dancheong-ink/70 leading-relaxed font-light max-w-3xl mx-auto break-keep">
                        <AutoTranslatedText text="몽땅쏙은 단순한 가상 공간 전시를 넘어, 시간과 공간의 제약을 없애고 완벽한 몰입감의 프라이빗 웹 기반 인프라를 제공하는 차세대 비즈니스 공간 솔루션입니다." />
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
