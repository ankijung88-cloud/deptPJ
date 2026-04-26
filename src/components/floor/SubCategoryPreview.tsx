import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, Package } from 'lucide-react';
import { getFeaturedProducts } from '../../api/products';
import { FeaturedItem } from '../../types';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { FALLBACK_PRODUCTS } from '../../data/fallbackData';

interface SubCategoryPreviewProps {
    subId: string;
    onClose: () => void;
}

const SubCategoryPreview: React.FC<SubCategoryPreviewProps> = ({ subId, onClose }) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const itemsData = await getFeaturedProducts();
                if (mounted) {
                    const sourceItems = (itemsData && itemsData.length > 0) ? itemsData : (FALLBACK_PRODUCTS as any[]);
                    const filtered = sourceItems.filter((item: any) => item.subcategory === subId);
                    setItems(filtered);
                }
            } catch (err) {
                console.error('Failed to fetch preview items:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, [subId]);

    if (loading) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dancheong-ink/5">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 rounded-full border-2 border-dancheong-ink/10 mb-3"
                    style={{ borderTopColor: '#171717' }}
                />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dancheong-ink/5 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors">
                    <X size={18} className="text-dancheong-ink/40" />
                </button>
                <Package size={32} className="text-dancheong-ink/10 mb-2" />
                <p className="text-[11px] font-serif italic text-dancheong-ink/40">No records found.</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full overflow-hidden"
        >
            <div className="bg-white rounded-[2.5rem] border border-dancheong-ink/10 shadow-xl overflow-hidden relative min-h-[180px] max-h-[360px]">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 z-[70] p-2 bg-white rounded-full shadow-sm border border-dancheong-ink/5 hover:scale-110 active:scale-95 transition-all text-dancheong-ink/40 hover:text-dancheong-ink"
                >
                    <X size={18} />
                </button>

                {/* Main Content Area (Full Width List) */}
                <div className="p-8 md:p-12 overflow-hidden flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                        {items.map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group flex items-center gap-8 p-4 rounded-3xl hover:bg-black/[0.02] transition-all"
                            >
                                {/* Product Thumbnail */}
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-dancheong-ink/5 flex-shrink-0 border border-dancheong-ink/5">
                                    <img 
                                        src={item.thumbnailUrl || item.imageUrl || '/via_station_logo_portal.png'} 
                                        alt="" 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/f5f5f5/171717?text=Product';
                                        }}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <button 
                                        onClick={() => navigate(`/detail/${item.id}`)}
                                        className="block text-left group/title mb-1"
                                    >
                                        <h4 className="text-sm font-black text-dancheong-ink group-hover/title:text-dancheong-mugwort transition-colors flex items-center gap-2">
                                            <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                            <ChevronRight size={14} className="opacity-0 group-hover/title:opacity-100 group-hover/title:translate-x-1 transition-all" />
                                        </h4>
                                    </button>
                                    <p className="text-[11px] leading-relaxed text-dancheong-ink/40 line-clamp-1 max-w-2xl">
                                        <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                    </p>
                                </div>

                                {/* Price or Action (Optional) */}
                                <div className="hidden sm:block text-right">
                                    <span className="text-[10px] font-black tracking-widest text-dancheong-ink/20 uppercase">Collection Item</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(23, 23, 23, 0.08);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(23, 23, 23, 0.15);
                }
            `}</style>
        </motion.div>
    );
};

export default SubCategoryPreview;
