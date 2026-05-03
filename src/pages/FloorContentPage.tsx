import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Layout, ArrowRight, Calendar, Archive, Bookmark } from 'lucide-react';
import { useFloors } from '../context/FloorContext';
import { useEditorial } from '../hooks/useEditorial';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

const FloorContentPage: React.FC = () => {
    const { floorId } = useParams<{ floorId: string }>();
    const { floors } = useFloors();
    const { items: articles, loading } = useEditorial(floorId);
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const floorData = floors.find(f => f.id === floorId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [floorId]);

    if (!floorData) return null;

    return (
        <div className="bg-dancheong-ivory min-h-screen selection:bg-dancheong-mugwort/30 relative overflow-hidden">
            {/* Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Ambient Background Glows - Beauty Palette */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#FFD1D1]/20 blur-[150px] rounded-full opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[10%] left-[-10%] w-[60%] h-[60%] bg-[#F9F9F9]/30 blur-[120px] rounded-full opacity-30" />
                <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-dancheong-mugwort/5 blur-[100px] rounded-full opacity-20" />
            </div>

            <div className="lossless-layout relative z-10 pt-32 pb-20">
                {/* Editorial Header */}
                <header className="mb-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-dancheong-ink/10 pb-16 relative">
                        <div className="max-w-4xl">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-3 text-dancheong-mugwort font-black text-[11px] tracking-[0.5em] uppercase mb-8"
                            >
                                <Bookmark size={14} strokeWidth={3} />
                                <span className="font-black tracking-[0.2em]">{floorData.floor} PERSPECTIVE</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-6xl md:text-9xl font-serif font-black text-dancheong-ink tracking-tighter leading-[0.85] mb-8"
                            >
                                <AutoTranslatedText text={getLocalizedText(floorData.title, i18n.language)} />
                            </motion.h1>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-md md:text-right"
                        >
                            <p className="text-dancheong-ink/60 font-medium italic text-xl leading-relaxed">
                                <AutoTranslatedText text={getLocalizedText(floorData.description, i18n.language)} />
                            </p>
                        </motion.div>
                        
                        {/* Soft accent line */}
                        <div className="absolute bottom-0 left-0 w-24 h-1 bg-dancheong-mugwort" />
                    </div>
                </header>

                {/* Editorial Feed */}
                {loading ? (
                    <div className="flex justify-center py-40">
                        <div className="w-12 h-12 border-4 border-dancheong-mugwort/20 border-t-dancheong-mugwort rounded-full animate-spin" />
                    </div>
                ) : articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32">
                        {articles.map((article: any, idx: number) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.7 }}
                                className="group cursor-pointer"
                            >
                                <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-[4rem] overflow-hidden transition-all duration-700 hover:shadow-[0_80px_120px_rgba(255,209,209,0.15)] hover:-translate-y-4 h-full flex flex-col relative">
                                    <div className="aspect-[4/5] overflow-hidden relative">
                                        <img 
                                            src={article.imageUrl} 
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        
                                        <div className="absolute top-8 left-8">
                                            <div className="px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-sm">
                                                <span className="text-[9px] font-black text-dancheong-ink/60 uppercase tracking-[0.2em]">
                                                    <AutoTranslatedText text={article.category || 'Editorial'} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 sm:p-12 flex-grow flex flex-col">
                                        <div className="flex items-center gap-2 text-dancheong-ink/30 text-[9px] font-black uppercase tracking-widest mb-6">
                                            <Calendar size={12} strokeWidth={2.5} />
                                            <span>{getLocalizedText(article.date, i18n.language) || 'Upcoming'}</span>
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-serif font-black text-dancheong-ink mb-6 group-hover:text-dancheong-mugwort transition-colors duration-500 leading-tight text-left">
                                            <AutoTranslatedText text={getLocalizedText(article.title, i18n.language)} />
                                        </h3>
                                        <p className="text-dancheong-ink/60 font-medium leading-relaxed text-base line-clamp-3 mb-10 text-left">
                                            <AutoTranslatedText text={getLocalizedText(article.description, i18n.language)} />
                                        </p>
                                        <div className="mt-auto flex items-center gap-4 text-dancheong-ink/20 group-hover:text-dancheong-mugwort transition-colors duration-500 font-black text-[10px] uppercase tracking-[0.3em]">
                                            <AutoTranslatedText text="Explore Perspective" />
                                            <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-2 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center border border-white/40 rounded-[4rem] bg-white/20 backdrop-blur-sm shadow-xl">
                        <div className="w-24 h-24 bg-white/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Archive size={32} className="text-dancheong-ink/10" />
                        </div>
                        <h2 className="text-3xl font-serif font-black text-dancheong-ink mb-4">
                            <AutoTranslatedText text="현재 수집된 기록이 없습니다" />
                        </h2>
                        <p className="text-dancheong-ink/40 font-medium italic mb-10">
                            <AutoTranslatedText text="이 층의 새로운 전시 기록이 준비되는 대로 업데이트될 예정입니다." />
                        </p>
                        <button 
                            onClick={() => navigate('/floor-guide')}
                            className="px-10 py-5 bg-dancheong-ink text-white font-black rounded-full hover:bg-dancheong-mugwort transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-dancheong-ink/20 tracking-[0.2em] uppercase"
                        >
                            <AutoTranslatedText text="Back to Directory" />
                        </button>
                    </div>
                )}

                {/* Perspective Navigator */}
                <div className="mt-40 pt-20 border-t border-dancheong-ink/10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <button 
                        onClick={() => navigate('/floor-guide')}
                        className="flex items-center gap-4 text-dancheong-ink/30 hover:text-dancheong-ink transition-colors font-black text-[10px] uppercase tracking-[0.4em] group"
                    >
                        <Layout size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-500" />
                        <AutoTranslatedText text="Return to Main Floor Map" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloorContentPage;
