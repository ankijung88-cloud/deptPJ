import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import heroImage from '../../assets/premium-landing/premium_skincare_hero_1777972489385.png';

export const PremiumHero: React.FC = () => {
    return (
        <section className="relative w-full h-[700px] md:h-[90vh] overflow-hidden flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={heroImage} 
                    alt="Premium Skincare Background" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 bg-gradient-to-l from-white/40 via-transparent to-transparent" />
            </div>

            <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10 h-full flex items-center justify-end">
                <div className="max-w-2xl text-left flex flex-col items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        <h2 className="text-[12px] font-black tracking-[0.5em] mb-6 uppercase text-[#2D2924]/60 drop-shadow-sm">
                            <AutoTranslatedText text="Premium Skincare Curation" />
                        </h2>
                        <h1 className="text-6xl md:text-8xl font-light leading-[1.1] mb-10 text-[#2D2924] font-serif drop-shadow-md">
                            피부에 <br />
                            <span className="italic">여유를 담다.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-[#2D2924]/80 max-w-lg mb-14 leading-relaxed font-light">
                            <AutoTranslatedText text="지친 하루 끝, 당신만을 위한 가장 특별한 시간.\n여움이 전하는 프리미엄 피부 휴식을 경험하세요." />
                        </p>
                        
                        <button className="group flex items-center gap-6 bg-[#2D2924] text-[#F5F0E8] px-10 py-5 rounded-full text-sm font-black tracking-[0.2em] uppercase hover:bg-black transition-all shadow-2xl shadow-black/20 hover:scale-105 active:scale-95">
                            <AutoTranslatedText text="SHOP COLLECTIONS" />
                            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Scrolling Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
                <div className="w-[1px] h-12 bg-gradient-to-b from-[#2D2924]/40 to-transparent" />
                <span className="text-[10px] font-black tracking-[0.3em] text-[#2D2924]/40 uppercase rotate-90 origin-left mt-8">Scroll</span>
            </div>
        </section>
    );
};
