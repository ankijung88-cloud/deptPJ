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
        <div className="min-h-screen bg-transparent text-dancheong-ink pt-32 pb-20">
            <div className="lossless-layout">
                {/* Editorial Header */}
                <header className="mb-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b-8 border-dancheong-ink pb-16">
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
                            <p className="text-dancheong-ink font-black italic text-xl leading-relaxed">
                                <AutoTranslatedText text={getLocalizedText(floorData.description, i18n.language)} />
                            </p>
                        </motion.div>
                    </div>
                </header>

                {/* Editorial Feed */}
                {loading ? (
                    <div className="flex justify-center py-40">
                        <div className="w-12 h-12 border-4 border-dancheong-mugwort/20 border-t-dancheong-mugwort rounded-full animate-spin" />
                    </div>
                ) : articles.length > 0 ? (
                    <div className="space-y-32">
                        {articles.map((article: any, idx: number) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.7 }}
                                className="group cursor-pointer"
                            >
                                <div className="bg-white/10 border-2 border-dancheong-ink/20 rounded-[48px] overflow-hidden transition-all duration-700 hover:shadow-[0_60px_100px_rgba(23,23,23,0.12)] hover:-translate-y-3 hover:bg-white/30 h-full flex flex-col">
                                    <div className="aspect-[3/4] overflow-hidden relative">
                                        <img 
                                            src={article.imageUrl} 
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-115"
                                        />
                                        <div className="absolute inset-0 bg-dancheong-ink/5 group-hover:bg-transparent transition-colors duration-700" />
                                        
                                        <div className="absolute top-10 left-10">
                                            <div className="px-5 py-2 bg-white rounded-full border-2 border-dancheong-ink shadow-lg">
                                                <span className="text-[10px] font-black text-dancheong-ink uppercase tracking-[0.2em]">
                                                    <AutoTranslatedText text={article.category || 'Editorial'} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-12 flex-grow flex flex-col">
                                        <div className="flex items-center gap-2 text-dancheong-ink/60 text-[10px] font-black uppercase tracking-widest mb-6">
                                            <Calendar size={14} strokeWidth={2.5} />
                                            <span>{getLocalizedText(article.date, i18n.language) || 'Upcoming'}</span>
                                        </div>
                                        <h3 className="text-3xl font-serif font-black text-dancheong-ink mb-6 group-hover:text-dancheong-mugwort transition-colors duration-500 leading-[1.1] text-left">
                                            <AutoTranslatedText text={getLocalizedText(article.title, i18n.language)} />
                                        </h3>
                                        <p className="text-dancheong-ink font-black leading-relaxed text-lg line-clamp-3 mb-10 text-left">
                                            <AutoTranslatedText text={getLocalizedText(article.description, i18n.language)} />
                                        </p>
                                        <div className="mt-auto flex items-center gap-4 text-dancheong-ink/50 group-hover:text-dancheong-ink transition-colors duration-500 font-black text-[11px] uppercase tracking-[0.3em]">
                                            <AutoTranslatedText text="Explore Perspective" />
                                            <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-3 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center border-4 border-dancheong-ink/20 rounded-[48px] bg-white/10 shadow-xl">
                        <div className="w-24 h-24 bg-dancheong-ink/[0.05] rounded-full flex items-center justify-center mx-auto mb-8">
                            <Archive size={40} className="text-dancheong-ink/20" />
                        </div>
                        <h2 className="text-3xl font-serif font-black text-dancheong-ink mb-4">
                            <AutoTranslatedText text="현재 수집된 기록이 없습니다" />
                        </h2>
                        <p className="text-dancheong-ink/80 font-black italic mb-10">
                            <AutoTranslatedText text="이 층의 새로운 전시 기록이 준비되는 대로 업데이트될 예정입니다." />
                        </p>
                        <button 
                            onClick={() => navigate('/floor-guide')}
                            className="w-48 py-5 bg-dancheong-ink text-white font-black rounded-full hover:bg-dancheong-mugwort transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-dancheong-ink/20 tracking-[0.2em] uppercase disabled:opacity-50"
                        >
                            <AutoTranslatedText text="Back to Directory" />
                        </button>
                    </div>
                )}

                {/* Perspective Navigator */}
                <div className="mt-40 pt-20 border-t-4 border-dancheong-ink flex flex-col md:flex-row items-center justify-between gap-12">
                    <button 
                        onClick={() => navigate('/floor-guide')}
                        className="flex items-center gap-4 text-dancheong-ink/50 hover:text-dancheong-ink transition-colors font-black text-[11px] uppercase tracking-[0.4em] group"
                    >
                        <Layout size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-500" />
                        <AutoTranslatedText text="Return to Main Floor Map" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloorContentPage;
