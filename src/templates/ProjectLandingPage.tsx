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
import { Trash2, Plus, List } from 'lucide-react';
import { ProductFormModal } from '../components/admin/ProductFormModal';

interface ProjectLandingPageProps {
    item?: FeaturedItem;
}

const ProjectLandingPage: React.FC<ProjectLandingPageProps> = ({ item }) => {
    useImmersiveMode(true);
    const navigate = useNavigate();
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | undefined>(item);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!item) {
            const fetchSample = async () => {
                try {
                    const products = await getFeaturedProducts();
                    const sample = products.find(p => p.page_type === 'skincare');
                    if (sample) setLocalItem(sample);
                } catch (err) {
                    console.error('Failed to fetch sample project:', err);
                }
            };
            fetchSample();
        } else {
            setLocalItem(item);
        }
    }, [item]);

    const handleDelete = async () => {
        if (!localItem || !window.confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
        setIsDeleting(true);
        try {
            await deleteProduct(localItem.id);
            alert('성공적으로 삭제되었습니다.');
            navigate('/admin/products');
        } catch (err) {
            console.error('Delete failed:', err);
            alert('삭제에 실패했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        // Refresh or navigate
        navigate('/admin/products');
    };

    // Permissions: Admin or Agency owner of the project
    const canEdit = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    return (
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8]">
            <PremiumHeader item={localItem} />
            
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

            {/* Admin Action Bar */}
            {canEdit && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 p-2 bg-[#2D2924]/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
                    <button 
                        onClick={() => navigate('/admin/products')}
                        className="p-3 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all"
                        title="관리 목록"
                    >
                        <List size={18} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#2D2924] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD700] transition-all shadow-xl"
                    >
                        <Plus size={14} />
                        New Project
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-3 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                        title="프로젝트 삭제"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            {/* Editing Modals */}
            {localItem && editingSection && (
                <TemplateTextEditModal 
                    item={localItem}
                    section={editingSection}
                    onClose={() => setEditingSection(null)}
                    onSuccess={(updated) => setLocalItem(updated)}
                />
            )}

            {showCreateModal && (
                <ProductFormModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
};

export default ProjectLandingPage;

