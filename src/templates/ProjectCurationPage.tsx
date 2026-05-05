import React from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { motion } from 'framer-motion';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

const ProjectCurationPage: React.FC = () => {
    useImmersiveMode(true);
    
    return (
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8]">
            <PremiumHeader />
            
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D2924] mb-6">
                            <AutoTranslatedText text="큐레이션" />
                        </h1>
                        <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                            <AutoTranslatedText text="Personalized Selection" />
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="aspect-[4/5] bg-white/50 rounded-[40px] overflow-hidden shadow-sm border border-[#2D2924]/5" />
                        <div className="flex flex-col justify-center space-y-8">
                            <h2 className="text-3xl font-serif text-[#2D2924]">
                                <AutoTranslatedText text="당신만을 위한 맞춤 제안" />
                            </h2>
                            <p className="text-[#5C564D] leading-relaxed">
                                <AutoTranslatedText text="여움의 전문가들이 선별한 프리미엄 라인업을 만나보세요. 피부 상태와 고민에 맞춘 최적의 조합을 제안합니다." />
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            
            <PremiumFooter />
        </div>
    );
};

export default ProjectCurationPage;
