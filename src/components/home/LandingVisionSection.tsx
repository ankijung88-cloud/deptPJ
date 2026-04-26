import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const LandingVisionSection: React.FC = () => {
    return (
        <section className="relative w-full py-32 px-6 bg-transparent flex flex-col items-center justify-center overflow-hidden">
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
                        <AutoTranslatedText text="모든 가치와 사람이 어우러지는 통합 연결 플랫폼, 몽땅쏙" />
                    </h2>
                    <p className="text-lg md:text-2xl text-dancheong-ink leading-relaxed font-medium max-w-3xl mx-auto break-keep">
                        <AutoTranslatedText text="몽땅쏙은 비즈니스, 예술, 소통 등 분야의 경계 없이 누구나 주인공이 되어 함께 어울릴 수 있는 열린 공간입니다. 각자의 고유한 이야기가 하나로 모여 새로운 가능성을 만드는, 우리 모두를 위한 디지털 생태계를 경험해 보세요." />
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
