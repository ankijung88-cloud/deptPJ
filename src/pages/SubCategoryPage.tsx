import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

const SubCategoryPage: React.FC = () => {
    const { category, subcategory } = useParams<{ category: string; subcategory: string }>();
    const { t } = useTranslation();

    // Mapping subcategories to their parent category for display or verification could be done here
    // For now, we just display the subcategory title

    const getTitle = () => {
        // Try to get specific translation, otherwise fallback to key
        // We added keys like "popup", "collab" directly to "nav" namespace in i18n
        // so we can access them via `nav.${subcategory}`
        // But in i18n we added them to resources.translation.nav
        return `nav.${subcategory}`;
    };

    return (
        <div className="pt-20 min-h-screen bg-[#1a1a1a] text-white">
            {/* Hero Section */}
            <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
                {/* Background Image with Parallax-like effect (simplified for subcategory) */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop"
                        alt=""
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                </div>

                <div className="relative z-20 text-center text-white px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
                            <AutoTranslatedText text={t(getTitle())} />
                        </h1>
                        <div className="w-20 h-1 bg-dancheong-red mx-auto mb-6" />
                        <p className="text-lg md:text-xl font-light text-white/80 max-w-2xl mx-auto">
                            <AutoTranslatedText text={t(`category.${category}.description`)} />
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-6 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="bg-[#2a2a2a] rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-dancheong-red/50 transition-all duration-300">
                            <div className="h-64 bg-white/5 animate-pulse" />
                            <div className="p-6">
                                <div className="h-6 w-3/4 bg-white/10 rounded mb-4 animate-pulse" />
                                <div className="h-4 w-full bg-white/5 rounded mb-2 animate-pulse" />
                                <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12 text-white/40">
                    <p>Content for {subcategory} is coming soon.</p>
                </div>
            </div>
        </div>
    );
};

export default SubCategoryPage;
