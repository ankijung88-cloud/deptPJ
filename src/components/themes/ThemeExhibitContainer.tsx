import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { FeaturedItem } from '../../types';

interface ThemeExhibitContainerProps {
    item: FeaturedItem;
    theme: any;
    isAdmin: boolean;
}

const ThemeExhibitContainer: React.FC<ThemeExhibitContainerProps> = ({ item, theme: _theme, isAdmin }) => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    return (
        <div className="min-h-screen">
            {/* Atmospheric Hero Entry */}
            <div className="relative h-[90vh] overflow-hidden">
                <div className="absolute inset-0 bg-black z-0" />
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 z-0"
                >
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-40 scale-110 blur-sm" />
                </motion.div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D17] via-transparent to-black/60" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-px bg-[#FF00E5]/50" />
                            <span className="text-[#FF00E5] font-bold tracking-[0.5em] uppercase text-xs">Exhibition Portal</span>
                            <div className="w-12 h-px bg-[#FF00E5]/50" />
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-widest leading-none">
                            <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                        </h1>
                        
                        <p className="text-white/40 max-w-2xl mx-auto text-lg md:text-xl font-light italic leading-relaxed">
                            <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                        </p>

                        <div className="pt-8">
                            <motion.button
                                whileHover={{ scale: 1.05, letterSpacing: '0.2em' }}
                                onClick={() => navigate('/inspiration')}
                                className="px-16 py-5 border border-[#FF00E5] text-[#FF00E5] rounded-full font-bold text-lg uppercase tracking-widest hover:bg-[#FF00E5] hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,0,229,0.2)]"
                            >
                                <AutoTranslatedText text="Enter 3D Gallery" />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Gallery Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-24 space-y-24">
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <h3 className="text-4xl font-serif font-bold text-white border-l-4 border-[#FF00E5] pl-8">
                            <AutoTranslatedText text="The Curator's Note" />
                        </h3>
                        <p className="text-white/60 text-lg leading-relaxed font-light">
                            <AutoTranslatedText text="Explore our digital preservation efforts. This virtual space hosts a unique selection of artifacts meticulously scanned and re-lit for a cinematic viewing experience. Every object in this exhibition has a profound connection to the cultural heritage of our civilization." />
                        </p>
                    </div>
                    <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl shadow-black">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                    </div>
                </section>

                <div className="space-y-12">
                    <div className="flex justify-between items-center">
                        <h4 className="text-2xl font-serif font-bold text-white uppercase tracking-widest flex items-center gap-4">
                            <Eye size={24} className="text-[#FF00E5]" />
                            <AutoTranslatedText text="Exhibited Artifacts" />
                        </h4>
                        {isAdmin && (
                            <button className="px-6 py-3 bg-white/5 border border-white/10 text-[#FF00E5] rounded-xl font-bold hover:bg-white/10 transition-all">
                                <Plus size={18} /> <AutoTranslatedText text="Manage Collection" />
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[3/4] bg-white/5 border border-white/5 rounded-3xl group relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Plus size={40} className="text-white" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black to-transparent">
                                    <div className="w-8 h-1 bg-[#FF00E5] mb-4" />
                                    <span className="text-white/20 font-bold uppercase tracking-[0.3em] text-[10px]"><AutoTranslatedText text={`Artifact #00${i}`} /></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeExhibitContainer;
