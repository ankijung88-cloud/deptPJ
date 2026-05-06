import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Plus, Upload } from 'lucide-react';
import { FeaturedItem } from '../../types';
import { updateProduct } from '../../api/products';

interface TemplateTextEditModalProps {
    item: FeaturedItem;
    section: 'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'curation' | 'brand' | 'magazine' | 'community' | 'skincare' | null;
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
    const [uploading, setUploading] = useState<string | null>(null);

    if (!section) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedMetadata = { ...metadata, ...formData };
            const updatedItem = { ...item, metadata: updatedMetadata };
            const response = await updateProduct(item.id, updatedItem);
            onSuccess(response as any);
            onClose();
        } catch (err) {
            console.error('Failed to update template text:', err);
            alert('저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(field);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: uploadData
            });
            
            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            if (data.url) {
                handleChange(field, data.url);
            }
        } catch (err) {
            console.error('Upload failure:', err);
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setUploading(null);
        }
    };

    const ImageField = ({ label, field, placeholder }: { label: string, field: string, placeholder?: string }) => (
        <div className="space-y-2 mb-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66]">{label}</label>
            <div className="flex gap-4">
                <div className="flex-1">
                    <input 
                        type="text"
                        value={formData[field] || ''} 
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-[10px] font-mono focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                        placeholder={placeholder || "https://..."}
                    />
                </div>
                <div className="relative">
                    <input 
                        type="file" 
                        id={`file-${field}`}
                        onChange={(e) => handleFileUpload(e, field)}
                        className="hidden"
                        accept="image/*"
                    />
                    <label 
                        htmlFor={`file-${field}`}
                        className={`flex items-center justify-center w-12 h-12 rounded-xl border border-dashed border-[#2D2924]/20 hover:border-[#2D2924] transition-colors cursor-pointer ${uploading === field ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {uploading === field ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    </label>
                </div>
            </div>
            {formData[field] && (
                <div className="mt-2 h-20 w-32 rounded-lg border border-[#2D2924]/5 overflow-hidden bg-[#F5F0E8]">
                    <img src={formData[field]} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );

    const renderFields = () => {
        switch (section) {
            case 'header':
                const navLinks = formData.navLinks || [
                    { name: '큐레이션', path: '/project-template/curation' },
                    { name: '스킨케어', path: '/project-template/skincare' },
                    { name: '브랜드', path: '/project-template/brand' },
                    { name: '매거진', path: '/project-template/magazine' },
                    { name: '커뮤니티', path: '/project-template/community' }
                ];

                const updateNavLink = (index: number, field: string, value: string) => {
                    const newLinks = [...navLinks];
                    newLinks[index] = { ...newLinks[index], [field]: value };
                    setFormData({ ...formData, navLinks: newLinks });
                };

                const addNavLink = () => {
                    setFormData({ 
                        ...formData, 
                        navLinks: [...navLinks, { name: '', path: '' }] 
                    });
                };

                const removeNavLink = (index: number) => {
                    const newLinks = navLinks.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, navLinks: newLinks });
                };

                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Logo Text</label>
                                <input 
                                    type="text"
                                    value={formData.headerLogoText || ''} 
                                    onChange={(e) => handleChange('headerLogoText', e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                    placeholder="여움"
                                />
                            </div>
                            <ImageField label="Logo Image" field="headerLogoUrl" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66]">Navigation Links</label>
                                <button 
                                    onClick={addNavLink}
                                    className="flex items-center gap-1 text-[10px] font-black text-[#2D2924] hover:opacity-70"
                                >
                                    <Plus size={12} /> ADD LINK
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {navLinks.map((link: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 items-center bg-white/50 p-3 rounded-xl border border-[#2D2924]/5">
                                        <input 
                                            type="text"
                                            value={link.name}
                                            onChange={(e) => updateNavLink(idx, 'name', e.target.value)}
                                            placeholder="Link Name"
                                            className="flex-1 bg-transparent border-b border-[#2D2924]/10 p-1 text-xs font-bold outline-none"
                                        />
                                        <input 
                                            type="text"
                                            value={link.path}
                                            onChange={(e) => updateNavLink(idx, 'path', e.target.value)}
                                            placeholder="/path"
                                            className="flex-1 bg-transparent border-b border-[#2D2924]/10 p-1 text-[10px] font-mono outline-none"
                                        />
                                        <button 
                                            onClick={() => removeNavLink(idx)}
                                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
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
                        <ImageField label="Hero Background Image" field="heroImage" />
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Button Text</label>
                            <input 
                                type="text"
                                value={formData.heroBtnText || ''} 
                                onChange={(e) => handleChange('heroBtnText', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="SHOP COLLECTIONS"
                            />
                        </div>
                    </div>
                );
            case 'feature':
                const features = formData.features || [1, 2, 3, 4].map(num => ({
                    title: formData[`feature${num}Title`] || '',
                    desc: formData[`feature${num}Desc`] || '',
                    image: formData[`feature${num}Image`] || ''
                }));

                const updateFeatures = (index: number, field: string, value: string) => {
                    const newFeatures = [...features];
                    newFeatures[index] = { ...newFeatures[index], [field]: value };
                    setFormData({ ...formData, features: newFeatures });
                };

                const addFeature = () => {
                    setFormData({ 
                        ...formData, 
                        features: [...features, { title: '', desc: '', image: '' }] 
                    });
                };

                const removeFeature = (index: number) => {
                    const newFeatures = features.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, features: newFeatures });
                };

                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Section Subtitle</label>
                                <input 
                                    type="text"
                                    value={formData.featureSubtitle || ''} 
                                    onChange={(e) => handleChange('featureSubtitle', e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-[0.3em] focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                    placeholder="Today's Yeoul"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Section Title</label>
                                <input 
                                    type="text"
                                    value={formData.featureTitle || ''} 
                                    onChange={(e) => handleChange('featureTitle', e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                    placeholder="오늘의 여울"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-[#2D2924]/5">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[#2D2924]">Feature Items</h4>
                                <button 
                                    onClick={addFeature}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D2924] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#8B7E66] transition-colors"
                                >
                                    <Plus size={12} /> Add Item
                                </button>
                            </div>
                            <div className="space-y-6">
                                {features.map((feature: any, idx: number) => (
                                    <div key={idx} className="relative p-6 bg-[#F5F0E8]/50 rounded-2xl space-y-4 group">
                                        <button 
                                            onClick={() => removeFeature(idx)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg z-10"
                                        >
                                            <X size={12} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-[#8B7E66]">Item {idx + 1} Info</label>
                                                <input 
                                                    type="text"
                                                    value={feature.title} 
                                                    onChange={(e) => updateFeatures(idx, 'title', e.target.value)}
                                                    className="w-full bg-white border border-[#2D2924]/10 rounded-lg p-3 text-xs font-serif"
                                                    placeholder="Title"
                                                />
                                                <textarea 
                                                    value={feature.desc} 
                                                    onChange={(e) => updateFeatures(idx, 'desc', e.target.value)}
                                                    className="w-full bg-white border border-[#2D2924]/10 rounded-lg p-3 text-xs font-light min-h-[60px]"
                                                    placeholder="Description"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-[#8B7E66]">Item {idx + 1} Image</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text"
                                                        value={feature.image} 
                                                        onChange={(e) => updateFeatures(idx, 'image', e.target.value)}
                                                        className="flex-1 bg-white border border-[#2D2924]/10 rounded-lg p-3 text-[10px] font-mono"
                                                        placeholder="Image URL"
                                                    />
                                                    <input 
                                                        type="file" 
                                                        id={`file-feature-${idx}`}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            setUploading(`feature-${idx}`);
                                                            const uploadData = new FormData();
                                                            uploadData.append('file', file);
                                                            try {
                                                                const res = await fetch('/api/upload', {
                                                                    method: 'POST',
                                                                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}` },
                                                                    body: uploadData
                                                                });
                                                                const data = await res.json();
                                                                if (data.url) updateFeatures(idx, 'image', data.url);
                                                            } finally {
                                                                setUploading(null);
                                                            }
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <label htmlFor={`file-feature-${idx}`} className="flex items-center justify-center w-10 h-10 bg-white border border-[#2D2924]/10 rounded-lg cursor-pointer hover:bg-[#F5F0E8]">
                                                        {uploading === `feature-${idx}` ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                    </label>
                                                </div>
                                                {feature.image && <img src={feature.image} className="h-12 w-20 object-cover rounded border border-black/5" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'banner':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Magazine Label</label>
                            <input 
                                type="text"
                                value={formData.bannerLabel || ''} 
                                onChange={(e) => handleChange('bannerLabel', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-[0.3em] focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="Yeoul Magazine"
                            />
                        </div>
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
                        <ImageField label="Banner Image" field="bannerImage" />
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Magazine Button Text</label>
                            <input 
                                type="text"
                                value={formData.bannerBtnText || ''} 
                                onChange={(e) => handleChange('bannerBtnText', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="자세히 보기"
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
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Footer Logo Text</label>
                            <input 
                                type="text"
                                value={formData.footerLogoText || ''} 
                                onChange={(e) => handleChange('footerLogoText', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="여움"
                            />
                        </div>
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
            case 'curation':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Curation Page Title</label>
                            <input 
                                type="text"
                                value={formData.curationTitle || ''} 
                                onChange={(e) => handleChange('curationTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="큐레이션"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Curation Page Subtitle</label>
                            <input 
                                type="text"
                                value={formData.curationSubtitle || ''} 
                                onChange={(e) => handleChange('curationSubtitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="Personalized Selection"
                            />
                        </div>
                        <ImageField label="Curation Hero Image" field="curationImage" />
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Main Content Title</label>
                            <input 
                                type="text"
                                value={formData.curationContentTitle || ''} 
                                onChange={(e) => handleChange('curationContentTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="당신만을 위한 맞춤 제안"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Main Content Description</label>
                            <textarea 
                                value={formData.curationContentDesc || ''} 
                                onChange={(e) => handleChange('curationContentDesc', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-light focus:ring-2 focus:ring-[#2D2924]/20 outline-none min-h-[100px]"
                                placeholder="여움의 전문가들이 선별한 프리미엄 라인업을 만나보세요."
                            />
                        </div>
                    </div>
                );
            case 'brand':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Brand Page Title</label>
                            <input 
                                type="text"
                                value={formData.brandTitle || ''} 
                                onChange={(e) => handleChange('brandTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="브랜드"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Brand Page Subtitle</label>
                            <input 
                                type="text"
                                value={formData.brandSubtitle || ''} 
                                onChange={(e) => handleChange('brandSubtitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="Our Identity"
                            />
                        </div>
                        <div className="pt-4 border-t border-[#2D2924]/5">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Story Title</label>
                            <input 
                                type="text"
                                value={formData.brandStoryTitle || ''} 
                                onChange={(e) => handleChange('brandStoryTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="여움의 시작"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Story Content</label>
                            <textarea 
                                value={formData.brandStoryContent || ''} 
                                onChange={(e) => handleChange('brandStoryContent', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-light focus:ring-2 focus:ring-[#2D2924]/20 outline-none min-h-[150px]"
                                placeholder="복잡한 도심 속에서 잃어버린 피부의 '여유'를 찾아드리기 위해..."
                            />
                        </div>
                        <ImageField label="Brand Main Image" field="brandImage" />
                    </div>
                );
            case 'magazine':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Magazine Page Title</label>
                                <input 
                                    type="text"
                                    value={formData.magazineTitle || ''} 
                                    onChange={(e) => handleChange('magazineTitle', e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                    placeholder="매거진"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Magazine Page Subtitle</label>
                                <input 
                                    type="text"
                                    value={formData.magazineSubtitle || ''} 
                                    onChange={(e) => handleChange('magazineSubtitle', e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                    placeholder="Beauty Journal"
                                />
                            </div>
                        </div>

                        {[1, 2].map(num => (
                            <div key={num} className="pt-6 border-t border-[#2D2924]/5 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2D2924]">Article {num}</h4>
                                <input 
                                    type="text"
                                    value={formData[`magazineItem${num}Title`] || ''} 
                                    onChange={(e) => handleChange(`magazineItem${num}Title`, e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif"
                                    placeholder={`Article ${num} Title`}
                                />
                                <textarea 
                                    value={formData[`magazineItem${num}Desc`] || ''} 
                                    onChange={(e) => handleChange(`magazineItem${num}Desc`, e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-light min-h-[80px]"
                                    placeholder={`Article ${num} Description`}
                                />
                                <ImageField label={`Article ${num} Image`} field={`magazineItem${num}Image`} />
                            </div>
                        ))}
                    </div>
                );
            case 'community':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Community Page Title</label>
                                <input 
                                    type="text"
                                    value={formData.communityTitle || ''} 
                                    onChange={(e) => handleChange('communityTitle', e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                    placeholder="커뮤니티"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Community Page Subtitle</label>
                                <input 
                                    type="text"
                                    value={formData.communitySubtitle || ''} 
                                    onChange={(e) => handleChange('communitySubtitle', e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                    placeholder="Together in Beauty"
                                />
                            </div>
                        </div>

                        {[1, 2, 3].map(num => (
                            <div key={num} className="pt-6 border-t border-[#2D2924]/5 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2D2924]">Community Item {num}</h4>
                                <input 
                                    type="text"
                                    value={formData[`communityItem${num}Title`] || ''} 
                                    onChange={(e) => handleChange(`communityItem${num}Title`, e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif"
                                    placeholder={`Item ${num} Title`}
                                />
                                <textarea 
                                    value={formData[`communityItem${num}Desc`] || ''} 
                                    onChange={(e) => handleChange(`communityItem${num}Desc`, e.target.value)}
                                    className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-light min-h-[60px]"
                                    placeholder={`Item ${num} Description`}
                                />
                            </div>
                        ))}
                    </div>
                );
            case 'skincare':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Skincare Page Title</label>
                            <input 
                                type="text"
                                value={formData.skincareTitle || ''} 
                                onChange={(e) => handleChange('skincareTitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="스킨케어"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Skincare Page Subtitle</label>
                            <input 
                                type="text"
                                value={formData.skincareSubtitle || ''} 
                                onChange={(e) => handleChange('skincareSubtitle', e.target.value)}
                                className="w-full bg-[#F5F0E8] border border-[#2D2924]/10 rounded-xl p-4 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                placeholder="Essential Care"
                            />
                        </div>
                        <ImageField label="Skincare Hero Image" field="skincareHeroImage" />
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
                                {section?.toUpperCase()} SECTION EDIT
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
