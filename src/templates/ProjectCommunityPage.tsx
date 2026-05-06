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
import { useNavigate, useLocation } from 'react-router-dom';
import { ProjectAdminBar } from '../components/admin/ProjectAdminBar';
import { ProjectNavigationModal } from '../components/admin/ProjectNavigationModal';
import { PremiumHero } from '../components/home/PremiumHero';

export const ProjectCommunityPage: React.FC = () => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(null);
    
    // Parse agencyId from URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlAgencyId = queryParams.get('agencyId');

    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'community' | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showNavigationModal, setShowNavigationModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchSample = async () => {
        try {
            const products = await getFeaturedProducts();
            
            // Priority for agency context:
            // 1. agencyId from URL (for visitors)
            // 2. agencyId from current logged-in user
            const targetAgencyId = urlAgencyId || (isAgency ? user?.id?.toString() : null);
            
            const agencyProjects = targetAgencyId ? products.filter(p => p.agency_id?.toString() === targetAgencyId) : [];

            const sample = (localItem ? products.find(p => p.id === localItem.id) : null) || 
                          agencyProjects.find(p => p.page_type === 'community') ||
                          agencyProjects[0] ||
                          products.find(p => p.page_type === 'community') || 
                          products.find(p => p.page_type === 'skincare') ||
                          products[0];

            if (sample) setLocalItem(sample);
        } catch (err) {
            console.error('Failed to fetch sample project:', err);
        }
    };

    useEffect(() => {
        fetchSample();
    }, [isAdmin, isAgency, user, urlAgencyId]);

    if (!localItem) return null;

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteProduct(localItem.id);
            navigate('/');
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };

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

                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Edit Community Section" 
                    onEdit={() => setEditingSection('community')}
                >
                    <div className="py-24 px-6 md:px-12 lg:px-24">
                        <div className="max-w-4xl mx-auto text-center space-y-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <h2 className="text-4xl md:text-5xl font-serif text-[#2D2924]">
                                    <AutoTranslatedText text={(localItem.metadata as any)?.communityTitle || "커뮤니티"} />
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#8B7E66]">
                                    <AutoTranslatedText text={(localItem.metadata as any)?.communitySubtitle || "Together in Beauty"} />
                                </p>
                            </motion.div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map(num => (
                                    <div key={num} className="bg-white p-8 rounded-2xl shadow-sm border border-[#2D2924]/5 hover:shadow-xl transition-all duration-500">
                                        <div className="w-12 h-12 bg-[#F5F0E8] rounded-full flex items-center justify-center mb-6 mx-auto">
                                            <span className="text-xs font-black text-[#2D2924]">{num}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-[#2D2924] mb-4">
                                            <AutoTranslatedText text={(localItem.metadata as any)?.[`communityItem${num}Title`] || "커뮤니티 소식"} />
                                        </h4>
                                        <p className="text-xs text-[#8B7E66] leading-relaxed">
                                            <AutoTranslatedText text={(localItem.metadata as any)?.[`communityItem${num}Desc`] || "새로운 소식과 팁을 이웃들과 함께 나눠보세요."} />
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </EditableWrapper>
            </main>

            <EditableWrapper 
                canEdit={canEdit} 
                label="Edit Footer Content" 
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

export default ProjectCommunityPage;
