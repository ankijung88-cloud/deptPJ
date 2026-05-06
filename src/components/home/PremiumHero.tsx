import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import heroImage from '../../assets/premium-landing/premium_skincare_hero_1777972489385.png';
import { FeaturedItem } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';

interface PremiumHeroProps {
    item?: FeaturedItem;
}

export const PremiumHero: React.FC<PremiumHeroProps> = ({ item }) => {
    const { i18n } = useTranslation();
    const metadata = (item?.metadata as any) || {};
    
    // Extract dynamic title: Prefer metadata, then fallback to template title, then static fallback
    const rawTitle = metadata.heroTitle || (item?.title ? getLocalizedText(item.title, i18n.language) : "피부에 \n여유를 담다.");
    const titleLines = rawTitle.split('\n');

    // Extract dynamic description: Prefer metadata, then fallback to template description, then static fallback
    const rawDesc = metadata.heroDesc || (item?.description ? getLocalizedText(item.description, i18n.language) : "지친 하루 끝, 당신만을 위한 가장 특별한 시간.\n여움이 전하는 프리미엄 피부 휴식을 경험하세요.");

    // Use detail_media_url (if video/large image) or imageUrl or fallback to heroImage
    const bgImage = item?.detail_media_url || item?.image_url || item?.imageUrl || heroImage;


    return (
        <section className="relative w-full h-[700px] md:h-[90vh] overflow-hidden flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={bgImage} 
                    alt={rawTitle.replace('\n', ' ')} 
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
                            <AutoTranslatedText text={item?.subcategory || "Premium Skincare Curation"} />
                        </h2>
                        <h1 className="text-6xl md:text-8xl font-light leading-[1.1] mb-10 text-[#2D2924] font-serif drop-shadow-md whitespace-pre-line">
                            {titleLines.map((line: string, idx: number) => (
                                <React.Fragment key={idx}>
                                    {idx === titleLines.length - 1 ? (
                                        <span className="italic">{line}</span>
                                    ) : (
                                        <>{line}<br /></>
                                    )}
                                </React.Fragment>
                            ))}
                        </h1>
                        <p className="text-xl md:text-2xl text-[#2D2924]/80 max-w-lg mb-14 leading-relaxed font-light whitespace-pre-line">
                            <AutoTranslatedText text={rawDesc} />
                        </p>
                        
                        <button className="group flex items-center gap-6 bg-[#2D2924] text-[#F5F0E8] px-10 py-5 rounded-full text-sm font-black tracking-[0.2em] uppercase hover:bg-black transition-all shadow-2xl shadow-black/20 hover:scale-105 active:scale-95">
                            <AutoTranslatedText text={metadata.heroBtnText || "SHOP COLLECTIONS"} />
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
