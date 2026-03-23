import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight, BookOpen, Filter } from 'lucide-react';
import { searchProducts } from '../api/products';
import { FeaturedItem } from '../types';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { getJoseonThemeById } from '../utils/themeUtils';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { i18n } = useTranslation();
    const [results, setResults] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Use a neutral but premium theme for search results
    const theme = getJoseonThemeById('search', 'default');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const data = await searchProducts(query, i18n.language);
                setResults(data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchResults();
    }, [query]);

    return (
        <div className="min-h-screen pb-20 text-white font-sans" style={theme.bgStyle}>
            {/* Search Header */}
            <header className="relative w-full py-24 flex items-center justify-center overflow-hidden mb-16 border-b border-white/10">
                <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)]" />
                
                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6">
                            <Search size={32} className="text-dancheong-gold opacity-80" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-black mb-4 tracking-tight">
                            <AutoTranslatedText text="검색 결과" />
                        </h1>
                        <p className="text-lg text-white/40 font-light tracking-widest uppercase">
                            {results.length} <AutoTranslatedText text="개의 결과가 발견되었습니다" />
                        </p>
                        
                        <div className="mt-8 inline-block px-6 py-2 rounded-full bg-white/5 border border-white/10 text-dancheong-gold font-serif italic text-xl">
                            "{query}"
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="container mx-auto px-6 max-w-7xl">
                {/* Results Header / Controls */}
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <Filter size={18} className="text-white/30" />
                        <span className="text-sm font-bold tracking-widest text-white/40 uppercase">
                            <AutoTranslatedText text="전체 카테고리" />
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: theme.accentColor }}></div>
                        <p className="text-white/20 animate-pulse uppercase tracking-[0.2em] text-xs font-bold">Searching Archive...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <AnimatePresence mode="popLayout">
                            {results.map((item, index) => (
                                <motion.article
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="group relative flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500"
                                >
                                    <div className="aspect-[16/10] overflow-hidden relative">
                                        <img
                                            src={item.imageUrl || '/placeholder-product.jpg'}
                                            alt={getLocalizedText(item.title, i18n.language)}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                        
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-black/80 backdrop-blur-md text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter border border-white/10">
                                                <AutoTranslatedText text={getLocalizedText(item.category || 'Culture', i18n.language)} />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="text-[10px] font-bold tracking-[0.2em] text-dancheong-gold/60 uppercase mb-3">
                                            {getLocalizedText(item.date, i18n.language)}
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold mb-4 group-hover:text-dancheong-gold transition-colors">
                                            <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                        </h3>
                                        <p className="text-sm text-white/40 font-light leading-relaxed mb-8 line-clamp-2">
                                            <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                        </p>
                                        
                                        <div className="mt-auto pt-6 border-t border-white/5">
                                            <Link
                                                to={`/detail/${item.id}`}
                                                className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-dancheong-gold transition-colors group/link"
                                            >
                                                <BookOpen size={14} />
                                                <AutoTranslatedText text="자세히 보기" />
                                                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32"
                    >
                        <div className="inline-block p-12 rounded-3xl bg-white/[0.02] border border-white/5">
                            <h3 className="text-2xl font-serif mb-4 text-white/60">
                                <AutoTranslatedText text="검색 결과가 없습니다" />
                            </h3>
                            <p className="text-white/20 font-light max-w-md mx-auto">
                                <AutoTranslatedText text="다른 키워드로 검색하시거나 오타가 없는지 확인해 주세요." />
                            </p>
                            <Link 
                                to="/" 
                                className="mt-8 inline-block px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest text-xs font-bold"
                            >
                                <AutoTranslatedText text="홈으로 돌아가기" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default SearchPage;
