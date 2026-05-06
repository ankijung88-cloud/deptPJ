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

export const ProjectBrandPage: React.FC = () => {
    useImmersiveMode(true);
    const navigate = useNavigate();
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(null);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'brand' | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchSample = async () => {
        try {
            const products = await getFeaturedProducts();
            const sample = products.find(p => 
                p.page_type === 'brand' && 
                (isAdmin || (isAgency && p.agency_id?.toString() === user?.id?.toString()))
            ) || products.find(p => p.page_type === 'brand') || products.find(p => p.page_type === 'skincare');
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
                    <EditableWrapper canEdit={isOwner} label="Edit Page Content" onEdit={() => setEditingSection('brand')}>
                        <div className="py-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-center mb-20"
                            >
                                <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D2924] mb-6">
                                    <AutoTranslatedText text={metadata.brandTitle || "브랜드"} />
                                </h1>
                                <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                                    <AutoTranslatedText text={metadata.brandSubtitle || "Our Identity"} />
                                </p>
                            </motion.div>
                            
                            <div className="max-w-4xl mx-auto space-y-24 text-center">
                                <section>
                                    <h2 className="text-3xl font-serif text-[#2D2924] mb-8 italic">
                                        <AutoTranslatedText text={metadata.brandStoryTitle || "여움의 시작"} />
                                    </h2>
                                    <p className="text-[#5C564D] leading-loose text-lg whitespace-pre-line">
                                        <AutoTranslatedText text={metadata.brandStoryContent || "복잡한 도심 속에서 잃어버린 피부의 '여유'를 찾아드리기 위해 시작되었습니다.\n우리는 자연의 순수함과 현대 과학의 조화를 지향합니다."} />
                                    </p>
                                </section>
                                <div className="w-full h-[500px] bg-white/50 rounded-[60px] shadow-sm border border-[#2D2924]/5 overflow-hidden">
                                    {metadata.brandImage && (
                                        <img src={metadata.brandImage} alt="Brand" className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </EditableWrapper>
                </div>
            </main>
            
            <EditableWrapper canEdit={isOwner} label="Edit Footer" onEdit={() => setEditingSection('footer')}>
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
                    onSuccess={() => {
                        setShowProjectModal(false);
                        fetchSample();
                    }}
                />
            )}
        </div>
    );
};

export default ProjectBrandPage;
