import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AutoTranslatedText } from './AutoTranslatedText';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Hash } from 'lucide-react';
import { getFloorCategories } from '../../api/categories';
import { getFeaturedProducts } from '../../api/products';
import { FloorCategory, FeaturedItem } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { Link } from 'react-router-dom';

interface FloorGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FloorGuideModal: React.FC<FloorGuideModalProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const [floors, setFloors] = useState<FloorCategory[]>([]);
    const [allProducts, setAllProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [floorsData, productsData] = await Promise.all([
                    getFloorCategories(),
                    getFeaturedProducts()
                ]);
                if (mounted) {
                    setFloors(floorsData);
                    setAllProducts(productsData);
                }
            } catch (error) {
                console.error("Error fetching data for modal", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, [isOpen]);

    // Reverse floors to show 6F first (top to bottom)
    const reversedFloors = [...floors].reverse();

    // Portal mounting point
    const modalRoot = document.body;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-dancheong-ink/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#2a2a2a]">
                            <div>
                                <h2 className="text-2xl font-serif font-black text-white tracking-tight">
                                    <AutoTranslatedText text={t('floor_guide')} />
                                </h2>
                                <p className="text-white/80 text-sm mt-1 font-medium">
                                    <AutoTranslatedText text={t('floor_guide_subtitle')} />
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-dancheong-ink/5 rounded-full transition-colors text-dancheong-ink/30 hover:text-dancheong-ink"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {loading && (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/20"></div>
                                </div>
                            )}

                            {!loading && reversedFloors.map((floor, index) => (
                                <motion.div
                                    key={floor.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white/40 p-5 rounded-2xl border border-dancheong-ink/5 flex flex-col gap-4 hover:bg-white/60 transition-colors"
                                >
                                    {/* Floor Header */}
                                    <div className="flex items-center gap-5">
                                        <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5">
                                            <span className="text-xl font-black text-white/60">
                                                {floor.floor}
                                            </span>
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className="text-xl font-black text-white mb-1 tracking-tight">
                                                <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                            </h3>
                                            <p className="text-sm text-white/80 font-medium line-clamp-2">
                                                <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                            </p>
                                        </div>
                                    </div>

                                    {/* Subcategories & Products */}
                                    {floor.subitems && floor.subitems.length > 0 && (
                                        <div className="space-y-4 md:pl-[4.5rem]">
                                            {floor.subitems.map((sub: any) => {
                                                // Filter products for this subcategory
                                                const subProducts = allProducts.filter(p => 
                                                    p.subcategory?.toLowerCase() === sub.id?.toLowerCase()
                                                );

                                                return (
                                                    <div key={sub.id} className="group/sub">
                                                        {/* Section Title Link */}
                                                        <Link
                                                            to={`/category/${sub.id}`}
                                                            onClick={onClose}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-dancheong-ink/5 hover:bg-dancheong-ink/10 text-dancheong-ink/60 hover:text-dancheong-ink text-sm font-bold rounded-lg border border-dancheong-ink/5 transition-all mb-2"
                                                        >
                                                            <ChevronRight size={14} className="text-dancheong-ink/20 group-hover/sub:text-dancheong-ink/40 transition-colors" />
                                                            <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                                        </Link>

                                                        {/* Product Titles List */}
                                                        {subProducts.length > 0 && (
                                                            <div className="flex flex-wrap gap-x-4 gap-y-2 pl-4 border-l border-dancheong-ink/10">
                                                                {subProducts.map(product => (
                                                                    <Link
                                                                        key={product.id}
                                                                        to={`/product/${product.id}`}
                                                                        onClick={onClose}
                                                                        className="text-[12px] text-white/60 hover:text-dancheong-mugwort hover:bg-white/5 px-2 py-1 rounded transition-all flex items-center gap-1.5"
                                                                    >
                                                                        <Hash size={10} className="opacity-50" />
                                                                        <AutoTranslatedText text={getLocalizedText(product.title, i18n.language)} />
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        modalRoot
    );
};
