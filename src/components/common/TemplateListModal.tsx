import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloors } from '../../context/FloorContext';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from './AutoTranslatedText';

interface TemplateListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TemplateListModal: React.FC<TemplateListModalProps> = ({ isOpen, onClose }) => {
    const { floors } = useFloors();
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    // Collect all subitems as templates
    const templates = React.useMemo(() => {
        const all = [];
        for (const floor of floors) {
            if (floor.subitems) {
                for (const sub of floor.subitems) {
                    all.push({
                        ...sub,
                        floorTitle: floor.title,
                        floorNum: floor.floor
                    });
                }
            }
        }
        return all;
    }, [floors]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-dancheong-ivory border border-dancheong-ink/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 md:p-12">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-dancheong-ink uppercase tracking-tighter mb-1">
                                        <AutoTranslatedText text="전체 템플릿 리스트" />
                                    </h3>
                                    <p className="text-[10px] font-bold text-dancheong-mugwort tracking-[0.3em] uppercase">
                                        <AutoTranslatedText text="Explore All Virtual Spaces" />
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-dancheong-ink/5 rounded-full text-dancheong-ink/40 hover:text-dancheong-ink transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            navigate(`/category/${template.id}`);
                                            onClose();
                                        }}
                                        className="group relative flex flex-col p-6 rounded-3xl border border-dancheong-ink/5 bg-white/40 hover:bg-white hover:border-dancheong-mugwort/30 transition-all duration-500 text-left"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-mono tracking-widest text-dancheong-mugwort/60">
                                                {template.floorNum} | {getLocalizedText(template.floorTitle, i18n.language)}
                                            </span>
                                            <ArrowRight size={14} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-dancheong-mugwort" />
                                        </div>
                                        <h4 className="text-xl font-bold text-dancheong-ink tracking-tight">
                                            <AutoTranslatedText text={getLocalizedText(template.label, i18n.language)} />
                                        </h4>
                                        <div className="absolute inset-0 rounded-3xl border-2 border-dancheong-mugwort/0 group-hover:border-dancheong-mugwort/10 transition-colors pointer-events-none" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-dancheong-ink/5 p-6 flex items-center justify-center gap-2">
                            <LayoutGrid size={16} className="text-dancheong-ink/30" />
                            <span className="text-[10px] font-bold tracking-[0.2em] text-dancheong-ink/30 uppercase italic">
                                Mongtangssok Immersive Platform
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
