import React, { useEffect } from 'react';
import { AutoTranslatedText } from './AutoTranslatedText';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { FLOOR_CATEGORIES } from '../../data/mockData';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { Link } from 'react-router-dom';

interface FloorGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FloorGuideModal: React.FC<FloorGuideModalProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Reverse floors to show 6F first (top to bottom)
    const reversedFloors = [...FLOOR_CATEGORIES].reverse();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
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
                                <h2 className="text-2xl font-serif font-bold text-white">{t('floor_guide')}</h2>
                                <p className="text-white/60 text-sm mt-1">{t('floor_guide_subtitle')}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {reversedFloors.map((floor, index) => (
                                <motion.div
                                    key={floor.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-[#2a2a2a] p-4 md:p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4"
                                >
                                    {/* Floor Main Link */}
                                    <Link
                                        to={`/floor/${floor.id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 md:gap-6 group"
                                    >
                                        {/* Floor Number */}
                                        <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-white/5 rounded-full group-hover:bg-dancheong-red/20 transition-colors">
                                            <span className="text-xl font-bold text-dancheong-green group-hover:text-dancheong-red transition-colors">
                                                {floor.floor}
                                            </span>
                                        </div>

                                        {/* Floor Details */}
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-dancheong-red transition-colors flex items-center gap-2">
                                                <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-dancheong-red" size={18} />
                                            </h3>
                                            <p className="text-sm text-white/50 line-clamp-1 group-hover:text-white/70 transition-colors">
                                                <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Subcategories */}
                                    {floor.subitems && floor.subitems.length > 0 && (
                                        <div className="flex flex-wrap gap-2 md:pl-[5.5rem] pl-[4.5rem]">
                                            {floor.subitems.map(sub => (
                                                <Link
                                                    key={sub.id}
                                                    to={`/category/${sub.id}`}
                                                    onClick={onClose}
                                                    className="px-3 md:px-4 py-1.5 md:py-2 bg-black/40 hover:bg-dancheong-red text-white/70 hover:text-white text-xs md:text-sm rounded-lg border border-white/5 hover:border-transparent transition-all"
                                                >
                                                    <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
