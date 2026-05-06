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
import { useNavigate } from 'react-router-dom';
import { ProjectAdminBar } from '../components/admin/ProjectAdminBar';
import { ProductFormModal } from '../components/admin/ProductFormModal';

interface ProjectLandingPageProps {
    item?: FeaturedItem;
}

const ProjectLandingPage: React.FC<ProjectLandingPageProps> = ({ item }) => {
    useImmersiveMode(true);
    const navigate = useNavigate();
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(item || null);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchSample = async () => {
        try {
            const products = await getFeaturedProducts();
            const sample = products.find(p => 
                (localItem ? p.id === localItem.id : false) || (
                    p.page_type === 'skincare' && 
                    (isAdmin || (isAgency && p.agency_id?.toString() === user?.id?.toString()))
                )
            ) || products.find(p => p.page_type === 'skincare') || products[0];
            if (sample) setLocalItem(sample);
        } catch (err) {
            console.error('Failed to fetch sample project:', err);
        }
    };

    useEffect(() => {
        if (!item) {
            fetchSample();
        } else {
            setLocalItem(item);
        }
    }, [item, isAdmin, isAgency, user]);

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
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8]">
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

                <EditableWrapper 
                    canEdit={isOwner} 
                    label="Edit Features Section" 
                    onEdit={() => setEditingSection('feature')}
                >
                    <PremiumFeatureGrid item={localItem} />
                </EditableWrapper>

                <EditableWrapper 
                    canEdit={isOwner} 
                    label="Edit Banner & Inquiry" 
                    onEdit={() => setEditingSection('banner')}
                >
                    <PremiumBannerSection item={localItem} />
                </EditableWrapper>
            </main>

            <EditableWrapper 
                canEdit={isOwner} 
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

export default ProjectLandingPage;

