import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, Plus, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { FeaturedItem } from '../../types';
import { updateProduct, createProduct, getFeaturedProducts } from '../../api/products';
import { useAdmin } from '../../hooks/useAdmin';

interface ProjectNavigationModalProps {
    item: FeaturedItem;
    onClose: () => void;
    onSuccess: (updatedItem: FeaturedItem) => void;
}

export const ProjectNavigationModal: React.FC<ProjectNavigationModalProps> = ({ 
    item, 
    onClose, 
    onSuccess 
}) => {
    const { isAdmin, isAgency, user } = useAdmin();
    const metadata = (item.metadata as any) || {};
    const [formData, setFormData] = useState<any>({ ...metadata });
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const isOwner = isAdmin || (isAgency && item.agency_id?.toString() === user?.id?.toString());

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedMetadata = { ...metadata, ...formData };
            const agencyId = user?.id?.toString();
            const categoryKey = item.category || '';
            const storedNameKey = categoryKey ? `agency_brand_name_${categoryKey}` : 'agency_brand_name';
            const storedLogoKey = categoryKey ? `agency_brand_logo_${categoryKey}` : 'agency_brand_logo';
            
            // Persist to localStorage for immediate session-wide consistency (category-scoped)
            if (formData.headerLogoText) {
                localStorage.setItem(storedNameKey, formData.headerLogoText);
            } else {
                localStorage.removeItem(storedNameKey);
            }
            if (formData.headerLogoUrl) {
                localStorage.setItem(storedLogoKey, formData.headerLogoUrl);
            } else {
                localStorage.removeItem(storedLogoKey);
            }

            // Fetch all products to find other agency projects for propagation
            const allProducts = await getFeaturedProducts();
            const agencyProjects = agencyId ? allProducts.filter(p => p.agency_id?.toString() === agencyId) : [];

            if (isOwner) {
                // Update current project
                const updatedItem = { ...item, metadata: updatedMetadata };
                const response = await updateProduct(item.id, updatedItem);
                
                // Propagate branding only to other agency projects of the SAME category
                const propagationTargets = agencyProjects.filter(p => p.id !== item.id && p.category === item.category);
                if (propagationTargets.length > 0) {
                    await Promise.all(propagationTargets.map(p => {
                        const newMetadata = { 
                            ...(p.metadata as any || {}), 
                            headerLogoText: formData.headerLogoText,
                            headerLogoUrl: formData.headerLogoUrl,
                            navLinks: formData.navLinks
                        };
                        return updateProduct(p.id, { ...p, metadata: newMetadata });
                    }));
                }
                
                onSuccess(response as any);
            } else {
                // Initializing a new project for the agency
                const newId = `${item.id}-${agencyId || 'agency'}-${Date.now()}`;
                const newItem = { 
                    ...item, 
                    id: newId,
                    agency_id: agencyId,
                    metadata: updatedMetadata,
                    title: {
                        ko: `${(item.title as any)?.ko || item.title}`,
                        en: `${(item.title as any)?.en || item.title}`
                    }
                };
                const response = await createProduct(newItem);
                
                // If the agency doesn't have a landing page (project_landing type) yet in this category, 
                // and this isn't one, consider this the start of their site.
                const hasLanding = agencyProjects.some(p => p.page_type === 'project_landing' && p.category === item.category);
                if (!hasLanding && item.page_type !== 'project_landing') {
                    // Create a default landing page for them too so the logo click works immediately
                    const landingId = `landing-${agencyId}-${Date.now()}`;
                    await createProduct({
                        ...newItem,
                        id: landingId,
                        page_type: 'project_landing',
                        title: { ko: `${formData.headerLogoText || 'Home'}`, en: 'Home' }
                    });
                }

                alert('에이전시 전용 프로젝트로 설정되었습니다. 이제 모든 페이지에 브랜드가 적용됩니다.');
                onSuccess(response as any);
            }
            onClose();
        } catch (err) {
            console.error('Failed to update navigation:', err);
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
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#2D2924]/80 backdrop-blur-xl"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-10 py-8 border-b border-[#2D2924]/5 flex items-center justify-between bg-[#F5F0E8]/30">
                        <div>
                            <h2 className="text-2xl font-serif text-[#2D2924]">전용 네비게이션 설정</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mt-1">
                                NAVIGATION & LOGO SETTINGS
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
                    <div className="p-10 max-h-[65vh] overflow-y-auto space-y-10 custom-scrollbar">
                        {/* Section 1: Logo */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-[#2D2924] flex items-center justify-center text-white text-[10px] font-bold">01</div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#2D2924]">Logo Configuration</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#F5F0E8]/50 rounded-3xl border border-[#2D2924]/5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Logo Text</label>
                                    <input 
                                        type="text"
                                        value={formData.headerLogoText || ''} 
                                        onChange={(e) => handleChange('headerLogoText', e.target.value)}
                                        className="w-full bg-white border border-[#2D2924]/10 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                        placeholder="여움"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#8B7E66] mb-2">Logo Image</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            value={formData.headerLogoUrl || ''} 
                                            onChange={(e) => handleChange('headerLogoUrl', e.target.value)}
                                            className="flex-1 bg-white border border-[#2D2924]/10 rounded-xl p-4 text-[10px] font-mono focus:ring-2 focus:ring-[#2D2924]/20 outline-none"
                                            placeholder="https://..."
                                        />
                                        <input 
                                            type="file" 
                                            id="file-nav-logo"
                                            onChange={(e) => handleFileUpload(e, 'headerLogoUrl')}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <label 
                                            htmlFor="file-nav-logo"
                                            className={`flex items-center justify-center w-12 h-12 rounded-xl border border-dashed border-[#2D2924]/20 hover:border-[#2D2924] transition-colors cursor-pointer bg-white ${uploading === 'headerLogoUrl' ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            {uploading === 'headerLogoUrl' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Navigation Links */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#2D2924] flex items-center justify-center text-white text-[10px] font-bold">02</div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#2D2924]">Navigation Links</h3>
                                </div>
                                <button 
                                    onClick={addNavLink}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#2D2924] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#8B7E66] transition-all shadow-lg shadow-black/10"
                                >
                                    <Plus size={12} /> Add Link
                                </button>
                            </div>

                            <div className="space-y-4">
                                {navLinks.map((link: any, idx: number) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx} 
                                        className="flex gap-4 items-center bg-[#F5F0E8]/30 p-5 rounded-3xl border border-[#2D2924]/5 group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
                                    >
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-[#8B7E66] uppercase mb-1 pl-1">Label</label>
                                                    <input 
                                                        type="text"
                                                        value={link.name}
                                                        onChange={(e) => updateNavLink(idx, 'name', e.target.value)}
                                                        placeholder="Link Name"
                                                        className="w-full bg-white border border-[#2D2924]/10 rounded-xl p-3 text-xs font-bold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-[#8B7E66] uppercase mb-1 pl-1">Path / URL</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text"
                                                            value={link.path}
                                                            onChange={(e) => updateNavLink(idx, 'path', e.target.value)}
                                                            placeholder="/path"
                                                            className="w-full bg-white border border-[#2D2924]/10 rounded-xl p-3 pl-8 text-[10px] font-mono outline-none"
                                                        />
                                                        <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D2924]/30" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeNavLink(idx)}
                                            className="p-3 text-[#2D2924]/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="px-10 py-8 bg-[#F5F0E8]/50 border-t border-[#2D2924]/5 flex justify-between items-center">
                        <div className="text-[10px] font-bold text-[#8B7E66] italic">
                            {!isOwner && "* 저장 시 귀하의 프로젝트로 새로 생성됩니다."}
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={onClose}
                                className="px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest text-[#2D2924]/60 hover:text-[#2D2924] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-3 px-12 py-4 bg-[#2D2924] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-black hover:scale-105 transition-all shadow-xl shadow-black/20 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                {isOwner ? 'Save Changes' : 'Initialize My Project'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
