import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

interface LandingFooterCTAProps {
    onExplore: () => void;
}

export const LandingFooterCTA: React.FC<LandingFooterCTAProps> = ({ onExplore }) => {
    return (
        <section className="relative w-full py-32 px-6 bg-transparent flex flex-col items-center justify-center border-t border-dancheong-ink/10">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#FFD700]/5 blur-[200px] rounded-full" />
            </div>

            <div className="relative z-10 text-center max-w-4xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl lg:text-7xl font-black text-dancheong-ink mb-8 tracking-tighter"
                >
                    <AutoTranslatedText text="READY TO DIVE IN?" />
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <button
                        onClick={onExplore}
                        className="px-12 py-5 bg-dancheong-ink text-white text-lg font-bold rounded-full hover:bg-dancheong-mugwort transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(26,26,26,0.3)] tracking-[0.2em] uppercase"
                    >
                        <AutoTranslatedText text="EXPLORE NOW" />
                    </button>
                    <p className="mt-6 text-dancheong-ink/40 text-sm font-light tracking-wide">
                        <AutoTranslatedText text="지금 바로 새로운 차원의 연결을 경험하세요." />
                    </p>
                </motion.div>
            </div>
            
            <div className="absolute bottom-8 w-full text-center text-dancheong-ink/20 text-[10px] font-black uppercase tracking-widest">
                © {new Date().getFullYear()} <AutoTranslatedText text="MONGTANG" />. <AutoTranslatedText text="ALL RIGHTS RESERVED." />
            </div>
        </section>
    );
};
