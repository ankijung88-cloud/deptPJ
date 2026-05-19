import React, { useState, useEffect } from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumHero } from '../components/home/PremiumHero';
import { PremiumFeatureGrid } from '../components/home/PremiumFeatureGrid';
import { PremiumBannerSection } from '../components/home/PremiumBannerSection';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { FeaturedItem } from '../types';
import { getFeaturedProducts, deleteProduct } from '../api/products';
import { useAdmin } from '../hooks/useAdmin';
import { EditableWrapper } from '../components/common/EditableWrapper';
import { TemplateTextEditModal } from '../components/admin/TemplateTextEditModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProjectAdminBar } from '../components/admin/ProjectAdminBar';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { ProjectNavigationModal } from '../components/admin/ProjectNavigationModal';

interface ProjectLandingPageProps {
    item?: FeaturedItem;
}

const ProjectLandingPage: React.FC<ProjectLandingPageProps> = ({ item }) => {
    useImmersiveMode(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(item || null);
    
    // Parse agencyId and category from URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlAgencyId = queryParams.get('agencyId');
    const urlCategory = queryParams.get('category');
    const urlSubcategory = queryParams.get('subcategory');

    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
    const [showNavigationModal, setShowNavigationModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchSample = async () => {
        try {
            const products = await getFeaturedProducts();
            
            // Priority for agency context
            const targetAgencyId = urlAgencyId || (isAgency ? user?.id?.toString() : null);
            const agencyProducts = targetAgencyId ? products.filter(p => p.agency_id?.toString() === targetAgencyId) : [];

            // Main template item (Prioritize urlCategory matching to break local state stickiness)
            const sample = (urlCategory ? products.find(p => p.category === urlCategory && p.page_type === 'project_landing' && (targetAgencyId ? p.agency_id?.toString() === targetAgencyId : !p.agency_id)) : null) ||
                          (urlCategory ? products.find(p => p.category === urlCategory && p.page_type === 'project_landing') : null) ||
                          (localItem ? products.find(p => p.id === localItem.id) : null) || 
                          agencyProducts.find(p => p.page_type === 'project_landing') ||
                          agencyProducts[0] ||
                          products.filter(p => !p.agency_id).find(p => p.page_type === 'project_landing') ||
                          products.filter(p => !p.agency_id)[0] ||
                          products[0];

            if (sample) setLocalItem(sample);
        } catch (err) {
            console.error('Failed to fetch sample project:', err);
        }
    };

    useEffect(() => {
        if (!item || (urlCategory && item.category !== urlCategory) || (urlSubcategory && item.subcategory !== urlSubcategory)) {
            fetchSample();
        } else {
            setLocalItem(item);
        }
    }, [item, isAdmin, isAgency, user, urlAgencyId, urlCategory, urlSubcategory]);

    if (!localItem) return null;

    const handleDelete = async () => {
        if (!window.confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
        try {
            await deleteProduct(localItem.id);
            navigate('/admin/products');
        } catch (err) {
            console.error('Delete failed:', err);
            alert('삭제에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8] overflow-x-hidden w-full max-w-full">
            <ProjectAdminBar 
                item={localItem}
                canEdit={canEdit}
                onEditSettings={() => setModalMode('edit')}
                onEditHeader={() => setShowNavigationModal(true)}
                onAdd={() => setModalMode('add')}
                onDelete={isOwner ? handleDelete : undefined}
            />

            <PremiumHeader 
                item={localItem} 
                canEdit={canEdit}
                onEdit={() => setShowNavigationModal(true)}
            />
            
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
                    label="Edit Features Section" 
                    onEdit={() => setEditingSection('feature')}
                >
                    <PremiumFeatureGrid item={localItem} />
                </EditableWrapper>

                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Edit Banner & Inquiry" 
                    onEdit={() => setEditingSection('banner')}
                >
                    <PremiumBannerSection item={localItem} />
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
                    section={editingSection}
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

            {modalMode && (
                <ProductFormModal 
                    product={modalMode === 'edit' ? localItem : null}
                    initialData={modalMode === 'add' ? {
                        agency_id: localItem.agency_id,
                        page_type: 'skincare' // Default to skincare for new products from landing
                    } : undefined}
                    onClose={() => setModalMode(null)}
                    onSuccess={(updated) => {
                        setModalMode(null);
                        if (modalMode === 'edit' && updated) {
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


export default ProjectLandingPage;

