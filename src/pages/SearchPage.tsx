import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight, Archive } from 'lucide-react';
import { searchProducts } from '../api/products';
import { getNotices } from '../api/notices';
import { getFaqs } from '../api/faqs';
import { FeaturedItem, Notice, FAQ, StaticPage } from '../types';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { FALLBACK_PRODUCTS, FALLBACK_NOTICES, FALLBACK_FAQS, FALLBACK_PAGES } from '../data/fallbackData';
import { useFloors } from '../context/FloorContext';

type SearchResultType = 'product' | 'notice' | 'faq' | 'floor' | 'page';

interface UnifiedSearchResult {
    id: string | number;
    type: SearchResultType;
    title: string;
    description: string;
    date?: string;
    category?: string;
    link: string;
}

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const { floors: allFloors } = useFloors();
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [loading, setLoading] = useState(true);
    const { translateAsync } = useAutoTranslate(null);

    useEffect(() => {
        const fetchAll = async () => {
            if (!query.trim()) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                let searchquery = query;
                const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query);
                if (!isKorean) {
                    try {
                        searchquery = await translateAsync(query);
                    } catch (e) {
                        console.warn('Translation failed');
                    }
                }

                const [productData, noticeData, faqData] = await Promise.all([
                    searchProducts(searchquery, i18n.language).catch(() => []),
                    getNotices().catch(() => []),
                    getFaqs().catch(() => [])
                ]);

                const lowerQuery = query.toLowerCase().trim();
                const lowerTrans = searchquery.toLowerCase().trim();
                
                const filterText = (text: any) => {
                    const val = getLocalizedText(text, i18n.language).toLowerCase();
                    return val.includes(lowerQuery) || val.includes(lowerTrans);
                };

                // Filter logic
                setProducts((productData.length > 0 ? productData : FALLBACK_PRODUCTS).filter(p => 
                    filterText(p.title) || filterText(p.description)
                ));
                setNotices((noticeData.length > 0 ? noticeData : FALLBACK_NOTICES).filter(n => 
                    filterText(n.title) || filterText(n.content)
                ));
                setFaqs((faqData.length > 0 ? faqData : FALLBACK_FAQS).filter(f => 
                    filterText(f.question) || filterText(f.answer)
                ));
                // setFloors is removed as we'll filter allFloors directly in useMemo or local const
                setPages(FALLBACK_PAGES.filter(p => 
                    filterText(p.title) || filterText(p.description)
                ));

            } catch (error) {
                console.warn('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchAll();
    }, [query, i18n.language]);

    const allResults = useMemo(() => {
        const results: UnifiedSearchResult[] = [];
        
        const lowerQuery = query.toLowerCase().trim();
        const filterText = (text: any) => {
            const val = getLocalizedText(text, i18n.language).toLowerCase();
            return val.includes(lowerQuery);
        };

        const filteredFloors = allFloors.filter(f => 
            filterText(f.title) || filterText(f.description) || f.floor.toLowerCase().includes(lowerQuery)
        );

        filteredFloors.forEach(f => results.push({ id: f.id, type: 'floor', title: `${f.floor} ${getLocalizedText(f.title, i18n.language)}`, description: getLocalizedText(f.description, i18n.language), link: `/floor/${f.id}/articles` }));
        products.forEach(p => results.push({ id: p.id, type: 'product', title: getLocalizedText(p.title, i18n.language), description: getLocalizedText(p.description, i18n.language), category: getLocalizedText(p.category || 'Product', i18n.language), date: getLocalizedText(p.date, i18n.language), link: `/detail/${p.id}` }));
        notices.forEach(n => results.push({ id: n.id, type: 'notice', title: getLocalizedText(n.title, i18n.language), description: getLocalizedText(n.content, i18n.language), category: n.category, date: n.date, link: `/notice#notice-${n.id}` }));
        faqs.forEach(f => results.push({ id: f.id, type: 'faq', title: getLocalizedText(f.question, i18n.language), description: getLocalizedText(f.answer, i18n.language), category: f.category || 'FAQ', link: `/faq#faq-${f.id}` }));
        pages.forEach(p => results.push({ id: p.id, type: 'page', title: getLocalizedText(p.title, i18n.language), description: getLocalizedText(p.description, i18n.language), link: p.url }));

        return results;
    }, [products, notices, faqs, allFloors, pages, i18n.language, query]);

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 text-dancheong-ink">
            <div className="lossless-layout">
                {/* Search Header */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-dancheong-mugwort/10 border border-dancheong-mugwort/20 rounded-full text-dancheong-mugwort text-[10px] font-black uppercase tracking-widest mb-4"
                            >
                                <Search size={12} />
                                <AutoTranslatedText text="Universal Search" />
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-5xl md:text-7xl font-serif font-black text-dancheong-ink mb-4 tracking-tighter"
                            >
                                <AutoTranslatedText text="검색 결과" />
                            </motion.h1>
                            <p className="text-dancheong-ink/40 font-light italic text-lg">
                                <AutoTranslatedText text={`"${query}"에 대한 ${allResults.length}개의 기록을 찾았습니다.`} />
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white border border-dancheong-ink/10 px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] min-w-[300px]">
                            <Search className="text-dancheong-ink/20" size={20} />
                            <input 
                                type="text"
                                value={query || ''}
                                readOnly
                                className="bg-transparent border-none outline-none text-dancheong-ink font-serif italic text-xl w-full"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-dancheong-ink/5 w-full" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dancheong-mugwort"></div>
                        <p className="text-dancheong-ink/20 uppercase tracking-[0.4em] text-[10px] font-black"><AutoTranslatedText text="Retrieving Archives..." /></p>
                    </div>
                ) : allResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {allResults.map((result, idx) => (
                                <motion.div
                                    key={`${result.type}-${result.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(result.link)}
                                    className="group cursor-pointer relative"
                                >
                                    <div className="absolute inset-0 bg-white rounded-3xl border border-dancheong-ink/5 shadow-2xl group-hover:border-dancheong-navy transition-all duration-500" />
                                    <div className="relative p-8 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="px-3 py-1 bg-dancheong-mugwort/[0.07] border border-dancheong-mugwort/10 rounded-full">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-dancheong-mugwort">
                                                    <AutoTranslatedText text={result.type} />
                                                </span>
                                            </div>
                                            <ArrowRight className="text-dancheong-ink/0 group-hover:text-dancheong-ink/20 group-hover:translate-x-1 transition-all" size={20} />
                                        </div>

                                        <h3 className="text-2xl font-serif font-bold text-dancheong-ink mb-4 group-hover:text-dancheong-mugwort transition-colors leading-snug">
                                            <AutoTranslatedText text={result.title} />
                                        </h3>

                                        <p className="text-sm text-dancheong-ink/40 line-clamp-3 font-light leading-relaxed mb-8 flex-grow">
                                            <AutoTranslatedText text={result.description} />
                                        </p>

                                        <div className="pt-6 border-t border-dancheong-ink/5 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <Archive size={12} className="text-dancheong-ink/20" />
                                                <span className="text-[10px] font-black text-dancheong-ink/20 uppercase tracking-tighter">
                                                    몽땅쏙 ARCHIVE
                                                </span>
                                            </div>
                                            {result.date && (
                                                <span className="text-[10px] font-medium text-dancheong-ink/20 italic">
                                                    {result.date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="py-40 text-center">
                        <div className="w-24 h-24 bg-dancheong-ink/[0.02] border border-dancheong-ink/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Search size={40} className="text-dancheong-ink/10" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-dancheong-ink mb-4">
                            <AutoTranslatedText text="일치하는 기록이 없습니다" />
                        </h2>
                        <p className="text-dancheong-ink/40 font-light italic mb-12 max-w-md mx-auto">
                            <AutoTranslatedText text="다른 검색어를 입력하시거나 전체 카테고리를 탐색해 보세요." />
                        </p>
                        <button 
                            onClick={() => navigate('/')}
                            className="px-10 py-4 bg-dancheong-ink text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-dancheong-mugwort transition-colors shadow-lg shadow-dancheong-ink/10"
                        >
                            <AutoTranslatedText text="홈으로 돌아가기" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
