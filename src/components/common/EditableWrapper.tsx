import React, { useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableWrapperProps {
    children: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    onAdd?: () => void;
    label?: string;
    canEdit: boolean;
    className?: string;
}

export const EditableWrapper: React.FC<EditableWrapperProps> = ({ 
    children, 
    onEdit, 
    onDelete, 
    onAdd, 
    label,
    canEdit,
    className
}) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!canEdit) return <>{children}</>;

    return (
        <div 
            className={`relative group/editable ${className || ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Outline on Hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-2 border-2 border-dashed border-[#FFD700]/30 rounded-2xl pointer-events-none z-10"
                    />
                )}
            </AnimatePresence>

            {/* Content */}
            {children}

            {/* CRUD Bubble (Speech Bubble Style) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-1 p-1 bg-[#2D2924]/90 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl"
                    >
                        {/* Label */}
                        {label && (
                            <span className="px-3 py-1 text-[9px] font-black text-[#FFD700] uppercase tracking-widest border-r border-white/10 mr-1">
                                {label}
                            </span>
                        )}

                        {/* Buttons */}
                        <div className="flex items-center">
                            {onEdit && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-white group/btn"
                                    title="Edit"
                                >
                                    <Edit2 size={14} className="group-hover/btn:scale-125 transition-transform" />
                                </button>
                            )}
                            {onAdd && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-[#00FFC2] group/btn"
                                    title="Add"
                                >
                                    <Plus size={14} className="group-hover/btn:scale-125 transition-transform" />
                                </button>
                            )}
                            {onDelete && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                    className="p-2 hover:bg-red-500/30 rounded-full transition-colors text-red-400 group/btn"
                                    title="Delete"
                                >
                                    <Trash2 size={14} className="group-hover/btn:scale-125 transition-transform" />
                                </button>
                            )}
                        </div>

                        {/* Speech Bubble Pointer */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#2D2924]/90" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
