import React, { useState, useEffect } from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { motion } from 'framer-motion';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { FeaturedItem } from '../types';
import { getFeaturedProducts, deleteProduct } from '../api/products';
import { useAdmin } from '../hooks/useAdmin';
import { EditableWrapper } from '../components/common/EditableWrapper';
import { TemplateTextEditModal } from '../components/admin/TemplateTextEditModal';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { useNavigate } from 'react-router-dom';
import { ProjectAdminBar } from '../components/admin/ProjectAdminBar';
import { ProjectNavigationModal } from '../components/admin/ProjectNavigationModal';
import { PremiumHero } from '../components/home/PremiumHero';

export const ProjectMagazinePage: React.FC = () => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const navigate = useNavigate();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(null);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'magazine' | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showNavigationModal, setShowNavigationModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchSample = async () => {
        try {
            const products = await getFeaturedProducts();
            const sample = products.find(p => 
                (localItem ? p.id === localItem.id : false) || (
                    p.page_type === 'magazine' && 
                    (isAdmin || (isAgency && p.agency_id?.toString() === user?.id?.toString()))
                )
            ) || products.find(p => p.page_type === 'magazine') || products.find(p => p.page_type === 'skincare');
            if (sample) setLocalItem(sample);
        } catch (err) {
            console.error('Failed to fetch sample project:', err);
        }
    };

    useEffect(() => {
        fetchSample();
    }, [isAdmin, isAgency, user]);

    if (!localItem) return null;

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteProduct(localItem.id);
            navigate('/');
        } catch (err) {
            console.error('Delete failed:', err);
            alert('삭제에 실패했습니다.');
        }
    };

    const metadata = (localItem?.metadata as any) || {};

    return (
        <div className="min-h-screen bg-[#FCF9F5]">
            <ProjectAdminBar 
                item={localItem}
                canEdit={canEdit}
                onEditSettings={() => setShowProjectModal(true)}
                onEditHeader={() => setShowNavigationModal(true)}
                onAdd={() => setShowProjectModal(true)}
                onDelete={isOwner ? handleDelete : undefined}
            />

            <EditableWrapper 
                canEdit={canEdit} 
                label="Header / Navigation" 
                onEdit={() => setShowNavigationModal(true)}
            >
                <PremiumHeader item={localItem} />
            </EditableWrapper>
            
            <main className="pt-20">
                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Edit Hero Section" 
                    onEdit={() => setEditingSection('hero')}
                >
                    <PremiumHero item={localItem} />
                </EditableWrapper>

                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <EditableWrapper canEdit={canEdit} label="Edit Page Content" onEdit={() => setEditingSection('magazine')}>
                        <div className="py-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-center mb-20"
                            >
                                <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D2924] mb-6">
                                    <AutoTranslatedText text={metadata.magazineTitle || "매거진"} />
                                </h1>
                                <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                                    <AutoTranslatedText text={metadata.magazineSubtitle || "Beauty Journal"} />
                                </p>
                            </motion.div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                {[1, 2].map((i) => (
                                    <div key={i} className="space-y-6">
                                        <div className="aspect-video bg-[#F5F0E8] rounded-2xl border border-[#2D2924]/5 overflow-hidden shadow-sm">
                                            {metadata[`magazineItem${i}Image`] ? (
                                                <img src={metadata[`magazineItem${i}Image`]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-20">
                                                    <span className="text-[10px] font-black tracking-widest uppercase">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] text-[#8B7E66] font-black uppercase tracking-widest"><AutoTranslatedText text="Editorial" /></span>
                                            <h3 className="text-2xl font-serif text-[#2D2924]">
                                                <AutoTranslatedText text={metadata[`magazineItem${i}Title`] || `Seasonal Beauty Insight Vol.0${i}`} />
                                            </h3>
                                            <p className="text-sm text-[#8B7E66] leading-relaxed">
                                                <AutoTranslatedText text={metadata[`magazineItem${i}Desc`] || "계절의 변화에 대처하는 현명한 스킨케어 가이드."} />
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </EditableWrapper>
                </div>
            </main>
            
            <EditableWrapper canEdit={canEdit} label="Edit Footer" onEdit={() => setEditingSection('footer')}>
                <PremiumFooter item={localItem} />
            </EditableWrapper>

            {/* Editing Modals */}
            {localItem && editingSection && (
                <TemplateTextEditModal 
                    item={localItem}
                    section={editingSection as any}
                    onClose={() => setEditingSection(null)}
                    onSuccess={(updated) => setLocalItem(updated)}
                />
            )}

            {localItem && showNavigationModal && (
                <ProjectNavigationModal 
                    item={localItem}
                    onClose={() => setShowNavigationModal(false)}
                    onSuccess={(updated) => setLocalItem(updated)}
                />
            )}

            {showProjectModal && (
                <ProductFormModal 
                    product={isOwner ? localItem : null}
                    onClose={() => setShowProjectModal(false)}
                    onSuccess={(updated) => {
                        setShowProjectModal(false);
                        if (updated) {
                            setLocalItem(updated);
                        } else {
                            fetchSample();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ProjectMagazinePage;
