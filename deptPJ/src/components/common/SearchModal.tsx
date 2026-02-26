import React, { useState, useEffect } from 'react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchProducts } from '../../api/products';
import { getLocalizedText } from '../../utils/i18nUtils';
import { FeaturedItem } from '../../types';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQuery(''); // Reset query on open
            setResults([]);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await searchProducts(query);
                setResults(data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex flex-col items-center pt-24 px-4"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-4xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Input */}
                            <div className="relative mb-12">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40" size={32} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={t('search.placeholder')}
                                    className="w-full bg-transparent border-b-2 border-white/20 py-4 pl-12 pr-4 text-3xl md:text-5xl font-serif text-white placeholder:text-white/20 focus:outline-none focus:border-dancheong-red transition-colors"
                                    autoFocus
                                />
                            </div>

                            {/* Results */}
                            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="text-center py-10 text-white/50">{t('common.loading')}</div>
                                ) : (
                                    <>
                                        {query && results.length > 0 && (
                                            <p className="text-white/40 mb-6 text-sm">
                                                {t('search.results_for', { query })} ({results.length})
                                            </p>
                                        )}

                                        {results.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                                {results.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        to={`/detail/${item.id}`}
                                                        onClick={onClose}
                                                        className="group flex gap-4 bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors border border-white/5 hover:border-white/20"
                                                    >
                                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={getLocalizedText(item.title, i18n.language)}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs font-bold text-dancheong-red mb-1 block">
                                                                {item.category}
                                                            </span>
                                                            <h3 className="text-white font-serif text-lg leading-tight mb-2 truncate group-hover:text-dancheong-red transition-colors">
                                                                <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                                            </h3>
                                                            <p className="text-white/60 text-sm line-clamp-2">
                                                                <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-center text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all">
                                                            <ArrowRight size={20} />
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            query && (
                                                <div className="text-center py-20">
                                                    <p className="text-white/40 text-lg">{t('search.no_results')}</p>
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
