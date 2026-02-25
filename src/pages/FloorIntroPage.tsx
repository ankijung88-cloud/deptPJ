import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FLOOR_CATEGORIES } from '../data/mockData';
import { motion } from 'framer-motion';
import { getLocalizedText } from '../utils/i18nParams';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

const FloorIntroPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { i18n } = useTranslation();

    // Find Floor Data
    const floorData = FLOOR_CATEGORIES.find(f => f.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!floorData) {
        return (
            <div className="min-h-screen pt-32 text-center bg-charcoal text-white">
                <h2 className="text-2xl font-bold">존재하지 않는 층입니다.</h2>
                <Link to="/" className="text-dancheong-red mt-4 inline-block">홈으로 가기</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-charcoal text-white pt-20">
            {/* Hero Section */}
            <section className="py-20 bg-[#2a2a2a] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/korean-pattern.png')]"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${floorData.bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 to-charcoal"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block text-dancheong-green font-bold tracking-widest mb-4 text-xl"
                    >
                        {floorData.floor}
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif font-bold mb-6"
                    >
                        {getLocalizedText(floorData.title, i18n.language)}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 text-lg max-w-2xl mx-auto mb-8"
                    >
                        {getLocalizedText(floorData.description, i18n.language)}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link
                            to={`/floor/${floorData.id}/articles`}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-white font-medium group"
                        >
                            전체 내용 보기
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Introduction Blog Content */}
            {floorData.content && (
                <section className="py-16 container mx-auto px-6">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {floorData.content.map((block, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {block.type === 'text' && (
                                    <p className="text-lg leading-relaxed text-white/80 whitespace-pre-line">
                                        {getLocalizedText(block.value, i18n.language)}
                                    </p>
                                )}
                                {block.type === 'image' && (
                                    <figure className="my-8">
                                        <img
                                            src={getLocalizedText(block.value, i18n.language)}
                                            alt={block.caption ? getLocalizedText(block.caption, i18n.language) : 'Floor intro image'}
                                            className="w-full rounded-xl shadow-2xl border border-white/10"
                                        />
                                        {block.caption && (
                                            <figcaption className="mt-3 text-center text-sm text-white/50 italic">
                                                {getLocalizedText(block.caption, i18n.language)}
                                            </figcaption>
                                        )}
                                    </figure>
                                )}
                                {block.type === 'video' && (
                                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-white/10">
                                        <iframe
                                            src={getLocalizedText(block.value, i18n.language)}
                                            title="Floor Video"
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Bottom CTA */}
            <section className="py-20 bg-[#2a2a2a] border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-2xl font-bold mb-8">더 많은 소식이 궁금하신가요?</h3>
                    <Link
                        to={`/floor/${floorData.id}/articles`}
                        className="inline-flex items-center gap-2 px-10 py-4 bg-dancheong-red hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        {getLocalizedText(floorData.title, i18n.language)} 자세히 보기
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default FloorIntroPage;
