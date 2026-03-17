import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { FeaturedItem } from '../../types';

interface ThemePromoContainerProps {
    item: FeaturedItem;
    theme: any;
    isAdmin: boolean;
}

const ThemePromoContainer: React.FC<ThemePromoContainerProps> = ({ item, theme: _theme, isAdmin }) => {
    const { i18n } = useTranslation();
    return (
        <div className="min-h-screen bg-black">
            {/* Full Screen Magazine Hero */}
            <div className="relative h-screen flex items-end">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <motion.img 
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 5 }}
                        src={item.imageUrl} alt="" className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                
                <div className="relative z-10 w-full p-12 max-w-7xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <span className="text-[#00FFC2] font-bold tracking-[0.4em] uppercase text-xs">Featured Editorial</span>
                        <h1 className="text-7xl md:text-9xl font-serif font-black text-white leading-none tracking-tighter">
                            <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                        </h1>
                        <div className="w-32 h-2 bg-[#00FFC2]" />
                    </motion.div>
                </div>
            </div>

            {/* Editorial Content blocks */}
            <div className="max-w-4xl mx-auto px-6 py-32 space-y-32">
                <section className="space-y-12">
                    <h3 className="text-3xl font-serif italic text-white/40 leading-relaxed text-center max-w-2xl mx-auto">
                        <AutoTranslatedText text='"Modernity is not the rejection of tradition, but the sophisticated evolution of its core values into the digital era."' />
                    </h3>
                </section>

                <section className="space-y-8">
                    <div className="text-white/60 text-xl leading-relaxed font-light space-y-8">
                        <p className="first-letter:text-8xl first-letter:font-serif first-letter:mr-4 first-letter:float-left first-letter:text-[#00FFC2] first-letter:leading-none">
                            <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                        </p>
                        <p>
                            <AutoTranslatedText text="Within these archives, the delicate balance of history and innovation is laid bare. We invite the observer to look beyond the surface, to find the hidden patterns that have guided our aesthetic choices for centuries. Each pixel in this digital re-creation serves as a bridge, connecting the tangible past with an intangible, algorithmically-driven future." />
                        </p>
                    </div>
                </section>

                <section className="relative aspect-[3/4] md:aspect-video rounded-3xl overflow-hidden">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover grayscale opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                        <div className="space-y-6 max-w-md">
                            <h4 className="text-4xl font-serif font-bold text-white">
                                <AutoTranslatedText text="Explore the Unseen" />
                            </h4>
                            <p className="text-white/40"><AutoTranslatedText text="Dedicated archival footage and high-definition blueprints available for registered patrons." /></p>
                            <button className="px-12 py-4 bg-white text-black rounded-full font-bold hover:bg-[#00FFC2] transition-colors">
                                <AutoTranslatedText text="Visit Resource Domain" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {isAdmin && (
                <div className="fixed bottom-12 right-12 z-50">
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-20 h-20 rounded-full bg-[#00FFC2] text-black shadow-2xl flex items-center justify-center border-4 border-black"
                    >
                        <Plus size={36} />
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default ThemePromoContainer;
