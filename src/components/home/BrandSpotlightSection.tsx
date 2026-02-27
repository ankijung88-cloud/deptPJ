import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getBrandSpotlights } from '../../api/brands';
import { BrandSpotlight } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const BrandSpotlightSection: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [brands, setBrands] = useState<BrandSpotlight[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchBrands = async () => {
            try {
                console.log("BrandSpotlightSection: Fetching brands...");
                const data = await getBrandSpotlights();
                console.log("BrandSpotlightSection: Fetched brands count:", data.length);
                if (data.length > 0) {
                    console.log("BrandSpotlightSection: First brand sample:", data[0]);
                }
                if (mounted) setBrands(data);
            } catch (error) {
                console.error("BrandSpotlightSection: Failed to fetch brand spotlights", error);
            }
        };
        fetchBrands();
        return () => { mounted = false; };
    }, []);

    return (
        <section className="min-h-screen w-full snap-start bg-charcoal relative flex flex-col pt-28 pb-12 md:pt-24 md:pb-16 overflow-hidden">
            <div className="container mx-auto px-6 mb-8 lg:mb-12 flex justify-between items-end shrink-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm font-bold tracking-widest text-dancheong-green mb-3 uppercase">Brand Archive</h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                        {t('brand.title', '브랜드 스포트라이트')}
                    </h3>
                </motion.div>
            </div>

            <div className="w-full h-full overflow-x-auto overflow-y-hidden no-scrollbar">
                <div className="flex flex-col md:flex-row px-6 md:px-12 gap-8 md:gap-12 pb-10 min-h-[400px]">
                    {(() => { console.log("BrandSpotlightSection: Rendering brands list, length:", brands.length); return null; })()}
                    {brands.map((brand) => (
                        <div
                            key={brand.id}
                            className="w-full md:w-[600px] lg:w-[800px] h-[50vh] md:h-[60vh] shrink-0 snap-center md:snap-start relative rounded-3xl overflow-hidden group shadow-2xl border-2 border-white/10"
                        >
                            <img
                                src={brand.imageUrl}
                                alt="brand"
                                className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                            />

                            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/90 via-black/40 to-transparent p-8 md:p-20 flex flex-col justify-end md:justify-center">
                                <div className="max-w-2xl opacity-100 transform-none">
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
                                    <h5 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-6 md:mb-8 leading-tight">
                                        <AutoTranslatedText text={getLocalizedText(brand.title, i18n.language)} />
                                    </h5>
                                    <p className="text-white/60 text-base md:text-lg font-light leading-relaxed mb-10">
                                        <AutoTranslatedText text={getLocalizedText(brand.description, i18n.language)} />
                                    </p>
                                    <button className="w-fit text-white border-b border-white/50 pb-1 hover:border-white transition-colors uppercase tracking-widest text-xs md:text-sm font-bold">
                                        <AutoTranslatedText text="Explore Collection" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Placeholder for "Coming Soon" - Only show if no brands are loaded */}
                    {brands.length === 0 && (
                        <div className="w-full md:min-w-[400px] h-32 md:h-[60vh] shrink-0 snap-center rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/20 font-serif italic text-xl px-12 text-center">
                            Discover more brands soon (No data in DB)
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
