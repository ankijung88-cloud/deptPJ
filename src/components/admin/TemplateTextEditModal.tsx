import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { FeaturedItem } from '../../types';
import { updateProduct } from '../../api/products';

interface TemplateTextEditModalProps {
    item: FeaturedItem;
    section: 'hero' | 'feature' | 'banner' | 'footer' | null;
    onClose: () => void;
    onSuccess: (updatedItem: FeaturedItem) => void;
}

export const TemplateTextEditModal: React.FC<TemplateTextEditModalProps> = ({ 
    item, 
    section, 
    onClose, 
    onSuccess 
}) => {
    const metadata = (item.metadata as any) || {};
    const [formData, setFormData] = useState<any>({ ...metadata });
    const [isSaving, setIsSaving] = useState(false);

    if (!section) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedMetadata = { ...metadata, ...formData };
            const response = await updateProduct(item.id, { metadata: updatedMetadata });
            onSuccess(response as any);
            onClose();
        } catch (err) {
            console.error('Failed to update template text:', err);
            alert('저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const renderFields = () => {
        switch (section) {
            case 'hero':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Hero Title</label>
                            <textarea 
                                value={formData.heroTitle || ''} 
                                onChange={(e) => handleChange('heroTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none min-h-[100px]"
                                placeholder="피부에 \n여유를 담다."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Hero Description</label>
                            <textarea 
                                value={formData.heroDesc || ''} 
                                onChange={(e) => handleChange('heroDesc', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-light focus:ring-2 focus:ring-[#2D2924]/20 outline-none min-h-[100px]"
                                placeholder="지친 하루 끝, 당신만을 위한 가장 특별한 시간..."
                            />
                        </div>
                    </div>
                );
            case 'feature':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Feature Title</label>
                            <input 
                                type="text"
                                value={formData.featureTitle || ''} 
                                onChange={(e) => handleChange('featureTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="오늘의 여울"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Feature Subtitle</label>
                            <input 
                                type="text"
                                value={formData.featureSubtitle || ''} 
                                onChange={(e) => handleChange('featureSubtitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-[0.3em] focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="Today's Yeoul"
                            />
                        </div>
                    </div>
                );
            case 'banner':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Magazine Title</label>
                            <input 
                                type="text"
                                value={formData.bannerTitle || ''} 
                                onChange={(e) => handleChange('bannerTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="여울 매거진"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Magazine Description</label>
                            <textarea 
                                value={formData.bannerDesc || ''} 
                                onChange={(e) => handleChange('bannerDesc', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-light focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="피부와 마음이 편안해지는\n작은 이야기들"
                            />
                        </div>
                        <div className="pt-4 border-t border-[#2D2924]/5">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Inquiry Title</label>
                            <textarea 
                                value={formData.inquiryTitle || ''} 
                                onChange={(e) => handleChange('inquiryTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="여울의 큐레이션이\n궁금하다면?"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Inquiry Description</label>
                            <textarea 
                                value={formData.inquiryDesc || ''} 
                                onChange={(e) => handleChange('inquiryDesc', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-light focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="카카오톡 채널 추가하고\n더 깊은 여울을 만나보세요."
                            />
                        </div>
                    </div>
                );
            case 'footer':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Footer Intro Text</label>
                            <textarea 
                                value={formData.footerText || ''} 
                                onChange={(e) => handleChange('footerText', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-light focus:ring-2 focus:ring-[#2D2924]/20 outline-none min-h-[100px]"
                                placeholder="피부에 여유를 담다\n프리미엄 스킨케어 큐레이션 서비스"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#2D2924]/60 backdrop-blur-md"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-10 py-8 border-b border-[#2D2924]/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-serif text-[#2D2924]">섹션 문구 수정</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mt-1">
                                {section.toUpperCase()} SECTION EDIT
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 hover:bg-[#F5F0E8] rounded-full transition-colors"
                        >
                            <X size={20} className="text-[#2D2924]" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-10 max-h-[60vh] overflow-y-auto">
                        {renderFields()}
                    </div>

                    {/* Footer */}
                    <div className="px-10 py-8 bg-[#F5F0E8]/50 border-t border-[#2D2924]/5 flex justify-end gap-4">
                        <button 
                            onClick={onClose}
                            className="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest text-[#2D2924]/60 hover:text-[#2D2924] transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-3 px-10 py-4 bg-[#2D2924] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
