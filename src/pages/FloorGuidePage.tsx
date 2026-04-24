import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building, Archive } from 'lucide-react';
import { useFloors } from '../context/FloorContext';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

const FloorGuidePage: React.FC = () => {
    const { floorId } = useParams<{ floorId: string }>();
    const { floors, loading } = useFloors();
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const floorData = floors.find(f => f.id === floorId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [floorId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dancheong-ivory flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-dancheong-mugwort"></div>
            </div>
        );
    }

    if (!floorData) {
        return (
            <div className="min-h-screen bg-dancheong-ivory flex items-center justify-center flex-col gap-8">
                <div className="w-20 h-20 bg-dancheong-ink/10 rounded-full flex items-center justify-center">
                    <Archive size={32} className="text-dancheong-ink/20" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-dancheong-ink"><AutoTranslatedText text="Floor not found" /></h2>
                <button onClick={() => navigate('/floor-guide')} className="px-8 py-3 bg-dancheong-ink text-white rounded-full text-xs font-black uppercase tracking-widest">
                    <AutoTranslatedText text="Back to Directory" />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dancheong-ivory text-dancheong-ink pb-20 pt-32">
            <div className="lossless-layout">
                <header>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-16">
                        <div className="max-w-4xl">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-3 text-dancheong-mugwort font-black text-[11px] tracking-[0.5em] uppercase mb-8"
                            >
                                <Archive size={14} />
                                <span>FLOOR DIRECTORY</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-6xl md:text-9xl font-serif font-black text-dancheong-ink tracking-tighter leading-[0.85] mb-8"
                            >
                                <AutoTranslatedText text={getLocalizedText(floorData.floor, i18n.language)} />
                            </motion.h1>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-md md:text-right"
                        >
                            <p className="text-dancheong-ink/80 font-light italic text-xl leading-relaxed">
                                <AutoTranslatedText text={getLocalizedText(floorData.description, i18n.language)} />
                            </p>
                        </motion.div>
                    </div>
                </header>

                {/* Zones Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
                    {(floorData.subitems || []).map((sub: any, idx: number) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => navigate(`/category/${sub.id}`)}
                            className="group cursor-pointer"
                        >
                            <div className="heritage-card rounded-[48px] p-12 flex flex-col md:flex-row gap-16 h-full relative overflow-hidden border-dancheong-ink/30">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-700">
                                    <Building size={160} className="text-dancheong-ink" />
                                </div>

                                <div className="w-full md:w-[40%] aspect-square rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-sm relative">
                                    <img 
                                        src={sub.bgImage || '/placeholder_floor.jpg'} 
                                        alt={getLocalizedText(sub.label, i18n.language)}
                                        className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-115"
                                    />
                                    <div className="absolute inset-0 bg-dancheong-ink/10 group-hover:bg-transparent transition-colors duration-700" />
                                </div>

                                <div className="w-full md:w-[60%] flex flex-col justify-center relative z-10">
                                    <div className="flex items-center gap-4 mb-6">

                                        <span className="text-[11px] font-black uppercase tracking-widest text-dancheong-mugwort">
                                            SECTION {idx + 1}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-serif font-black text-dancheong-ink mb-4 group-hover:text-dancheong-mugwort transition-colors duration-500 leading-tight">
                                        <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                    </h3>
                                    <p className="text-dancheong-ink/70 font-light leading-relaxed mb-8 text-lg">
                                        <AutoTranslatedText text={getLocalizedText(sub.description, i18n.language)} />
                                    </p>
                                    <div className="flex items-center gap-3 text-dancheong-ink/60 group-hover:text-dancheong-ink transition-colors duration-500 font-black text-[11px] uppercase tracking-[0.2em]">
                                        <AutoTranslatedText text="Explore Sector" />
                                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Return */}
                <div className="text-center pt-20">
                    <button 
                        onClick={() => navigate('/floor-guide')}
                        className="group px-16 py-6 bg-dancheong-ink text-white rounded-full text-xs font-black uppercase tracking-[0.4em] hover:bg-dancheong-mugwort transition-all duration-500 shadow-2xl shadow-dancheong-ink/20 active:scale-95 flex items-center gap-4 mx-auto"
                    >
                        <AutoTranslatedText text="Back to Directory" />
                        <ArrowRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloorGuidePage;
