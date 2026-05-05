import React from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { motion } from 'framer-motion';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

const ProjectBrandPage: React.FC = () => {
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
                            <AutoTranslatedText text="브랜드" />
                        </h1>
                        <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                            <AutoTranslatedText text="Our Identity" />
                        </p>
                    </motion.div>
                    
                    <div className="max-w-4xl mx-auto space-y-24 text-center">
                        <section>
                            <h2 className="text-3xl font-serif text-[#2D2924] mb-8 italic"><AutoTranslatedText text="여움의 시작" /></h2>
                            <p className="text-[#5C564D] leading-loose text-lg">
                                <AutoTranslatedText text="복잡한 도심 속에서 잃어버린 피부의 '여유'를 찾아드리기 위해 시작되었습니다.\n우리는 자연의 순수함과 현대 과학의 조화를 지향합니다." />
                            </p>
                        </section>
                        <div className="w-full h-[500px] bg-white/50 rounded-[60px] shadow-sm border border-[#2D2924]/5" />
                    </div>
                </div>
            </main>
            
            <PremiumFooter />
        </div>
    );
};

export default ProjectBrandPage;
