import React, { useState, useEffect } from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
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

export const ProjectCommunityPage: React.FC = () => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const navigate = useNavigate();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(null);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'community' | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchSample = async () => {
        try {
            const products = await getFeaturedProducts();
            const sample = products.find(p => 
                p.page_type === 'community' && 
                (isAdmin || (isAgency && p.agency_id?.toString() === user?.id?.toString()))
            ) || products.find(p => p.page_type === 'community') || products.find(p => p.page_type === 'skincare');
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
            alert('삭제에 실패했습니다.');
        }
    };

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

                <EditableWrapper 
                    canEdit={isOwner} 
                    label="Edit Community Section" 
                    onEdit={() => setEditingSection('community')}
                >
                    <div className="py-24 px-6 md:px-12 lg:px-24">
                        <div className="max-w-4xl mx-auto text-center space-y-12">
                            <h2 className="text-3xl font-serif font-black text-[#2D2924]">
                                <AutoTranslatedText text={(localItem.metadata as any)?.communityTitle || "함께 나누는 여유"} />
                            </h2>
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

export default ProjectCommunityPage;
