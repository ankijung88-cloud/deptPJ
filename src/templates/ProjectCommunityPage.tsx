import React from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { motion } from 'framer-motion';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

const ProjectCommunityPage: React.FC = () => {
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
                            <AutoTranslatedText text="커뮤니티" />
                        </h1>
                        <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                            <AutoTranslatedText text="Together in Beauty" />
                        </p>
                    </motion.div>
                    
                    <div className="bg-white/50 rounded-[40px] p-12 border border-[#2D2924]/5 min-h-[400px] flex flex-col items-center justify-center space-y-6">
                        <h2 className="text-2xl font-serif text-[#2D2924]"><AutoTranslatedText text="아직 활성화되지 않은 서비스입니다." /></h2>
                        <p className="text-[#8B7E66]"><AutoTranslatedText text="조금만 기다려주세요, 당신의 아름다운 이야기를 나눌 공간이 곧 찾아옵니다." /></p>
                    </div>
                </div>
            </main>
            
            <PremiumFooter />
        </div>
    );
};

export default ProjectCommunityPage;
