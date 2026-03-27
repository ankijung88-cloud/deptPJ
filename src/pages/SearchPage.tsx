import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Tag, Calendar, ChevronRight } from 'lucide-react';
import { searchProducts } from '../api/products';
import { getNotices } from '../api/notices';
import { getFaqs } from '../api/faqs';
import { FeaturedItem, Notice, FAQ } from '../types';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { getJoseonThemeById } from '../utils/themeUtils';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

type SearchResultType = 'product' | 'notice' | 'faq';

interface UnifiedSearchResult {
    id: string | number;
    type: SearchResultType;
    title: string;
    description: string;
    date?: string;
    category?: string;
    link: string;
    imageUrl?: string;
}

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { i18n } = useTranslation();
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const { translateAsync } = useAutoTranslate(null);
    const theme = getJoseonThemeById('search', 'default');

    useEffect(() => {
        const fetchAll = async () => {
            if (!query.trim()) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                // Determine search queries (Original + Translated)
                let searchquery = query;
                const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query);
                if (!isKorean) {
                    searchquery = await translateAsync(query);
                }

                // Parallel fetching
                const [productData, noticeData, faqData] = await Promise.all([
                    searchProducts(searchquery, i18n.language).then(res => 
                        res.length === 0 && searchquery !== query ? searchProducts(query, i18n.language) : res
                    ),
                    getNotices(),
                    getFaqs()
                ]);

                setProducts(productData);
                
                // Client-side filtering for Notices and FAQs
                const lowerQuery = query.toLowerCase();
                const lowerTrans = searchquery.toLowerCase();
                
                const filterText = (text: any) => {
                    const val = getLocalizedText(text, i18n.language).toLowerCase();
                    return val.includes(lowerQuery) || val.includes(lowerTrans);
                };

                setNotices(noticeData.filter(n => filterText(n.title) || filterText(n.content)));
                setFaqs(faqData.filter(f => filterText(f.question) || filterText(f.answer)));

            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchAll();
    }, [query, i18n.language]);

    // Consolidate all results into a single list
    const allResults = useMemo(() => {
        const results: UnifiedSearchResult[] = [];

        // Map Products
        products.forEach(p => {
            results.push({
                id: p.id,
                type: 'product',
                title: getLocalizedText(p.title, i18n.language),
                description: getLocalizedText(p.description, i18n.language),
                date: getLocalizedText(p.date, i18n.language),
                category: getLocalizedText(p.category || 'Product', i18n.language),
                link: `/detail/${p.id}`,
                imageUrl: p.imageUrl
            });
        });

        // Map Notices
        notices.forEach(n => {
            results.push({
                id: n.id,
                type: 'notice',
                title: getLocalizedText(n.title, i18n.language),
                description: getLocalizedText(n.content, i18n.language),
                date: n.date,
                category: n.category,
                link: '/notice'
            });
        });

        // Map FAQs
        faqs.forEach(f => {
            results.push({
                id: f.id,
                type: 'faq',
                title: getLocalizedText(f.question, i18n.language),
                description: getLocalizedText(f.answer, i18n.language),
                category: f.category || 'FAQ',
                link: '/faq'
            });
        });

        return results;
    }, [products, notices, faqs, i18n.language]);

    return (
        <div className="min-h-screen pb-20 text-white font-sans" style={theme.bgStyle}>
            {/* Header Section */}
            <header className="relative w-full py-24 flex items-center justify-center overflow-hidden mb-12 border-b border-white/5">
                <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2)_0%,transparent_70%)]" />
                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-6">
                            <Search size={24} className="text-dancheong-gold opacity-60" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-black mb-4 tracking-tight">
                            <AutoTranslatedText text="통합 검색 결과" />
                        </h1>
                        <p className="text-sm text-white/40 font-light tracking-[0.3em] uppercase">
                             ARCHIVE • NOTICE • FAQ
                        </p>
                        <div className="mt-8 inline-block px-8 py-2 rounded-full bg-white/5 border border-white/10 text-dancheong-gold font-serif italic text-xl">
                            "{query}"
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="container mx-auto px-6 max-w-5xl">
                {/* Result Summary Bar */}
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <Tag size={16} className="text-white/20" />
                        <span className="text-xs font-bold tracking-widest text-white/40 uppercase">
                            {allResults.length} <AutoTranslatedText text="Search Entries Found" />
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-white/20 uppercase">
                        <span className={products.length > 0 ? 'text-dancheong-gold' : ''}>Archive ({products.length})</span>
                        <span className={notices.length > 0 ? 'text-dancheong-red' : ''}>Notice ({notices.length})</span>
                        <span className={faqs.length > 0 ? 'text-blue-400' : ''}>FAQ ({faqs.length})</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: theme.accentColor }}></div>
                        <p className="text-white/10 uppercase tracking-[0.3em] text-[10px] font-black">Syncing all archives...</p>
                    </div>
                ) : allResults.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {allResults.map((result, index) => (
                                <motion.div
                                    key={`${result.type}-${result.id}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.03 }}
                                >
                                    <Link
                                        to={result.link}
                                        className="group relative flex flex-col md:flex-row items-stretch bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500"
                                    >
                                        {/* Type Indicator */}
                                        <div 
                                            className={`w-1.5 shrink-0 ${
                                                result.type === 'product' ? 'bg-dancheong-gold/40' : 
                                                result.type === 'notice' ? 'bg-dancheong-red/40' : 'bg-blue-400/40'
                                            }`} 
                                        />

                                        {/* Content */}
                                        <div className="p-8 flex-grow flex flex-col justify-center">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${
                                                    result.type === 'product' ? 'border-dancheong-gold/20 text-dancheong-gold/60' : 
                                                    result.type === 'notice' ? 'border-dancheong-red/20 text-dancheong-red/60' : 'border-blue-400/20 text-blue-400/60'
                                                }`}>
                                                    <AutoTranslatedText text={result.type} />
                                                </span>
                                                {result.category && (
                                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                                        <AutoTranslatedText text={result.category} />
                                                    </span>
                                                )}
                                                {result.date && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/20 uppercase ml-auto">
                                                        <Calendar size={10} />
                                                        <span>{result.date}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="text-xl md:text-2xl font-serif font-bold mb-3 group-hover:text-white transition-colors">
                                                <AutoTranslatedText text={result.title} />
                                            </h3>
                                            
                                            <p className="text-sm text-white/40 font-light leading-relaxed line-clamp-1 group-hover:text-white/60 transition-colors">
                                                <AutoTranslatedText text={result.description} />
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <div className="px-8 flex items-center justify-center border-l border-white/5 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors">
                                            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-white/40 group-hover:text-white transition-all">
                                                <AutoTranslatedText text="Explore" />
                                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
                        <div className="inline-block p-16 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                            <h3 className="text-2xl font-serif mb-4 text-white/40 italic">
                                "{query}" <AutoTranslatedText text="에 대한 결과를 찾을 수 없습니다." />
                            </h3>
                            <p className="text-xs font-bold text-white/20 uppercase tracking-[0.3em] mb-10">
                                <AutoTranslatedText text="Please try different keywords or browse our archive." />
                            </p>
                            <Link 
                                to="/" 
                                className="px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest text-[10px] font-black"
                            >
                                <AutoTranslatedText text="Return to Home" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default SearchPage;
