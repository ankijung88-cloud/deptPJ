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
import { PremiumHero } from '../components/home/PremiumHero';

export const ProjectCurationPage: React.FC = () => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const navigate = useNavigate();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(null);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'curation' | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchSample = async () => {
        try {
            const products = await getFeaturedProducts();
            const sample = products.find(p => 
                (localItem ? p.id === localItem.id : false) || (
                    p.page_type === 'curation' && 
                    (isAdmin || (isAgency && p.agency_id?.toString() === user?.id?.toString()))
                )
            ) || products.find(p => p.page_type === 'curation') || products.find(p => p.page_type === 'skincare');
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
                onEditHeader={() => setEditingSection('header')}
                onAdd={() => setShowProjectModal(true)}
                onDelete={isOwner ? handleDelete : undefined}
            />

            <PremiumHeader item={localItem} />
            
            <main className="pt-20">
                <EditableWrapper 
                    canEdit={isOwner} 
                    label="Edit Hero Section" 
                    onEdit={() => setEditingSection('hero')}
                >
                    <PremiumHero item={localItem} />
                </EditableWrapper>

                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <EditableWrapper
                        canEdit={isOwner}
                        label="Edit Page Content"
                        onEdit={() => setEditingSection('curation')}
                    >
                        <div className="py-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-center mb-20"
                            >
                                <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D2924] mb-6">
                                    <AutoTranslatedText text={metadata.curationTitle || "큐레이션"} />
                                </h1>
                                <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                                    <AutoTranslatedText text={metadata.curationSubtitle || "Personalized Selection"} />
                                </p>
                            </motion.div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="aspect-[4/5] bg-white/50 rounded-[40px] overflow-hidden shadow-sm border border-[#2D2924]/5">
                                    {metadata.curationImage && (
                                        <img src={metadata.curationImage} alt="Curation" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex flex-col justify-center space-y-8">
                                    <h2 className="text-3xl font-serif text-[#2D2924]">
                                        <AutoTranslatedText text={metadata.curationContentTitle || "당신만을 위한 맞춤 제안"} />
                                    </h2>
                                    <p className="text-[#5C564D] leading-relaxed">
                                        <AutoTranslatedText text={metadata.curationContentDesc || "여움의 전문가들이 선별한 프리미엄 라인업을 만나보세요. 피부 상태와 고민에 맞춘 최적의 조합을 제안합니다."} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </EditableWrapper>
                </div>
            </main>
            
            <EditableWrapper
                canEdit={isOwner}
                label="Edit Footer"
                onEdit={() => setEditingSection('footer')}
            >
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

export default ProjectCurationPage;
