import React from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { motion } from 'framer-motion';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

const ProjectMagazinePage: React.FC = () => {
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
                            <AutoTranslatedText text="매거진" />
                        </h1>
                        <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                            <AutoTranslatedText text="Beauty Journal" />
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-6">
                                <div className="aspect-video bg-white/50 rounded-2xl border border-[#2D2924]/5 overflow-hidden" />
                                <div className="space-y-2">
                                    <span className="text-[10px] text-[#FF7F7F] font-black uppercase tracking-widest"><AutoTranslatedText text="Editorial" /></span>
                                    <h3 className="text-2xl font-serif text-[#2D2924]"><AutoTranslatedText text={`Seasonal Beauty Insight Vol.0${i}`} /></h3>
                                    <p className="text-sm text-[#8B7E66]"><AutoTranslatedText text="계절의 변화에 대처하는 현명한 스킨케어 가이드" /></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            
            <PremiumFooter />
        </div>
    );
};

export default ProjectMagazinePage;
