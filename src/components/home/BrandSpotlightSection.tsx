import React from 'react';
import { motion } from 'framer-motion';
import { BRAND_SPOTLIGHTS } from '../../data/mockData';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const BrandSpotlightSection: React.FC = () => {
    const { i18n } = useTranslation();

    return (
        <section className="h-screen w-full snap-start bg-charcoal relative flex flex-col justify-center overflow-hidden pt-20 pb-8">
            <div className="container mx-auto px-6 mb-8 lg:mb-12 flex justify-between items-end shrink-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm font-bold tracking-widest text-dancheong-green mb-3 uppercase">Brand Archive</h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                        <AutoTranslatedText text="브랜드 스포트라이트" />
                    </h3>
                </motion.div>
            </div>

            <div className="flex-grow flex items-center">
                <div className="w-full flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 gap-8">
                    {BRAND_SPOTLIGHTS.map((brand, index) => (
                        <motion.div
                            key={brand.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.2 }}
                            className="min-w-[80vw] md:min-w-[900px] h-[60vh] snap-center relative rounded-3xl overflow-hidden group"
                        >
                            <img
                                src={brand.imageUrl}
                                alt="brand"
                                className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                            />

                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-12 md:p-20 flex flex-col justify-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.2 + 0.3 }}
                                    className="max-w-2xl"
                                >
                                    <div className="flex gap-2 mb-6">
                                        {brand.tags.map((tag, tIdx) => (
                                            <span key={tIdx} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-dancheong-green uppercase border border-white/10">
                                                {getLocalizedText(tag, i18n.language)}
                                            </span>
                                        ))}
                                    </div>
                                    <h4 className="text-xl md:text-2xl font-serif text-dancheong-green mb-2">
                                        {getLocalizedText(brand.brandName, i18n.language)}
                                    </h4>
                                    <h5 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                                        <AutoTranslatedText text={getLocalizedText(brand.title, i18n.language)} />
                                    </h5>
                                    <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-10">
                                        <AutoTranslatedText text={getLocalizedText(brand.description, i18n.language)} />
                                    </p>
                                    <button className="w-fit text-white border-b border-white/30 pb-2 hover:border-white transition-colors uppercase tracking-widest text-sm font-bold">
                                        <AutoTranslatedText text="Explore Collection" />
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                    {/* Placeholder for "Coming Soon" */}
                    <div className="min-w-[80vw] md:min-w-[400px] h-[60vh] snap-center rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/10 font-serif italic text-2xl">
                        Discover more brands soon
                    </div>
                </div>
            </div>
        </section>
    );
};
