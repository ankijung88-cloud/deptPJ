import React from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Plus } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

interface ThemePromoContainerProps {
    parentId: string;
    isAdmin: boolean;
    themeData?: any;
}

const ThemePromoContainer: React.FC<ThemePromoContainerProps> = ({ isAdmin }) => {
    return (
        <div className="max-w-3xl mx-auto space-y-24 py-12">
            {/* Magazine Style Content Blocks */}
            <div className="space-y-16">
                <section className="space-y-8">
                    <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                        <img src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=2000" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-4xl font-serif font-bold text-white leading-tight">
                            <AutoTranslatedText text="The Heritage of Craftsmanship" />
                        </h3>
                        <p className="text-white/60 text-lg leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-[#00FFC2]">
                            <AutoTranslatedText text="Discover the untold stories of Korean master artisans. Every thread and every stroke carries a thousand years of history, reinterpreted for the modern era. This exclusive digital archive brings you closer to the soul of Joseon art." />
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h4 className="text-2xl font-serif font-bold text-[#00FFC2]">
                            <AutoTranslatedText text="A New Perspective" />
                        </h4>
                        <p className="text-white/50 leading-relaxed">
                            <AutoTranslatedText text="We bridge the gap between tradition and technology, creating an immersive space where heritage is not just remembered, but experienced." />
                        </p>
                    </div>
                    <div className="aspect-square rounded-full border border-[#00FFC2]/20 p-4">
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2000" alt="" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </section>
            </div>

            {/* Link & Domain Section */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-6">
                <LinkIcon size={32} className="mx-auto text-white/20" />
                <h3 className="text-2xl font-serif font-bold text-white">
                    <AutoTranslatedText text="Explore the Full Story" />
                </h3>
                <p className="text-white/40 max-w-md mx-auto">
                    <AutoTranslatedText text="Visit our dedicated exhibition platform for deep-dive interviews and architectural blueprints." />
                </p>
                <div className="pt-4">
                    <button className="px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-[#00FFC2] transition-all">
                        <AutoTranslatedText text="Visit Resource Domain" />
                    </button>
                </div>
            </div>

            {isAdmin && (
                <div className="fixed bottom-12 right-12 z-50">
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 rounded-full bg-[#00FFC2] text-black shadow-2xl flex items-center justify-center"
                    >
                        <Plus size={32} />
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default ThemePromoContainer;
