import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import magazineImage from '../../assets/premium-landing/premium_skincare_hero_1777972489385.png'; // Reusing hero for magazine look

import { FeaturedItem } from '../../types';

interface PremiumBannerSectionProps {
    item?: FeaturedItem;
}

export const PremiumBannerSection: React.FC<PremiumBannerSectionProps> = ({ item }) => {
    const metadata = (item?.metadata as any) || {};

    return (
        <section className="py-12 bg-[#F5F0E8]">
            <div className="container mx-auto px-6 md:px-12 lg:px-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Magazine Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-7 bg-[#FFFDFB] rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-xl shadow-black/5"
                    >
                        <div className="p-10 flex flex-col justify-center items-start flex-1">
                            <h4 className="text-[10px] font-black tracking-[0.4em] mb-4 uppercase text-[#8B7E66]">
                                <AutoTranslatedText text={metadata.bannerLabel || "Yeoul Magazine"} />
                            </h4>
                            <h3 className="text-2xl font-serif text-[#2D2924] mb-4">
                                <AutoTranslatedText text={metadata.bannerTitle || "여울 매거진"} />
                            </h3>
                            <p className="text-sm text-[#8B7E66] mb-8 leading-relaxed">
                                <AutoTranslatedText text={metadata.bannerDesc || "피부와 마음이 편안해지는\n작은 이야기들"} />
                            </p>
                            <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-[#2D2924] border-b border-[#2D2924] pb-1 hover:opacity-60 transition-opacity">
                                <AutoTranslatedText text={metadata.bannerBtnText || "자세히 보기"} />
                                <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="md:w-1/2 h-[200px] md:h-full relative">
                            <img src={metadata.bannerImage || magazineImage} alt="Magazine" className="w-full h-full object-cover" />
                        </div>
                    </motion.div>

                    {/* Inquiry Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-5 bg-[#FFFDFB] rounded-[40px] p-10 flex flex-col justify-center items-center text-center shadow-xl shadow-black/5 relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <h3 className="text-2xl font-serif text-[#2D2924] mb-4">
                                <AutoTranslatedText text={metadata.inquiryTitle || "여울의 큐레이션이\n궁금하다면?"} />
                            </h3>
                            <p className="text-sm text-[#8B7E66] mb-8">
                                <AutoTranslatedText text={metadata.inquiryDesc || "카카오톡 채널 추가하고\n더 깊은 여울을 만나보세요."} />
                            </p>
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-[#2D2924] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-xl font-bold italic">Ch</span>
                                </div>
                            </div>
                        </div>
                        {/* Background subtle decoration */}
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#F5F0E8] rounded-full opacity-50 group-hover:scale-150 transition-transform duration-1000" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
