import React, { useEffect, useState } from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getFeaturedProducts, deleteProduct } from '../api/products';
import { FeaturedItem } from '../types';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { EditableWrapper } from '../components/common/EditableWrapper';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { TemplateTextEditModal } from '../components/admin/TemplateTextEditModal';
import { ProjectAdminBar } from '../components/admin/ProjectAdminBar';
import { ProjectNavigationModal } from '../components/admin/ProjectNavigationModal';

export const ProjectSkincarePage: React.FC = () => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(null);
    
    // Parse agencyId from URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlAgencyId = queryParams.get('agencyId');

    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'skincare' | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showNavigationModal, setShowNavigationModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchAll = async () => {
        try {
            const allProducts = await getFeaturedProducts();
            
            // Priority for agency context:
            // 1. agencyId from URL (for visitors)
            // 2. agencyId from current logged-in user
            const targetAgencyId = urlAgencyId || (isAgency ? user?.id?.toString() : null);
            
            const agencyProducts = targetAgencyId ? allProducts.filter(p => p.agency_id?.toString() === targetAgencyId) : [];
            const skincareProducts = (agencyProducts.length > 0 ? agencyProducts : allProducts)
                .filter(p => p.subcategory === 'skincare' || p.category === 'skincare' || p.page_type === 'skincare');
            
            setProducts(skincareProducts.length > 0 ? skincareProducts : (agencyProducts.length > 0 ? agencyProducts : allProducts));
            
            // Get sample for metadata (header/footer)
            const sample = (localItem ? allProducts.find(p => p.id === localItem.id) : null) || 
                          agencyProducts.find(p => p.page_type === 'skincare') ||
                          agencyProducts[0] ||
                          allProducts.find(p => p.page_type === 'skincare') || 
                          allProducts[0];
            
            if (sample) setLocalItem(sample);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [isAdmin, isAgency, user, urlAgencyId]);

    if (!localItem || loading) return (
        <div className="min-h-screen bg-[#FCF9F5] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#2D2924]" size={40} />
        </div>
    );

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteProduct(localItem.id);
            navigate('/');
        } catch (err) {
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
                    onEdit={() => setEditingSection('skincare')}
                >
                    <div className="bg-[#2D2924] py-32 px-6 md:px-12 lg:px-24 text-center">
                        <h1 className="text-5xl font-serif font-black text-white mb-6">
                            <AutoTranslatedText text={metadata.skincareTitle || "프리미엄 스킨케어 컬렉션"} />
                        </h1>
                        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
                            <AutoTranslatedText text={metadata.skincareSubtitle || "피부 본연의 빛을 찾아주는 여움만의 특별한 큐레이션을 경험해보세요."} />
                        </p>
                    </div>
                </EditableWrapper>

                <div className="py-24 container mx-auto px-6 md:px-12 lg:px-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {products.map((product) => (
                            <Link 
                                key={product.id}
                                to={`/product/${product.id}`}
                                className="group block"
                            >
                                <div className="aspect-[3/4] bg-[#F5F0E8] rounded-2xl overflow-hidden mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.id} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <h3 className="text-lg font-serif font-bold text-[#2D2924] mb-2 group-hover:text-[#FF7F7F] transition-colors">
                                    <AutoTranslatedText text={product.title} />
                                </h3>
                                <p className="text-xs text-[#8B7E66] line-clamp-2 leading-relaxed">
                                    <AutoTranslatedText text={product.description} />
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            <EditableWrapper 
                canEdit={canEdit} 
                label="Edit Footer Content" 
                onEdit={() => setEditingSection('footer')}
            >
                <PremiumFooter item={localItem} />
            </EditableWrapper>

            {editingSection && (
                <TemplateTextEditModal 
                    item={localItem}
                    section={editingSection}
                    onClose={() => setEditingSection(null)}
                    onSuccess={(updatedItem) => {
                        setLocalItem(updatedItem);
                        fetchAll();
                    }}
                />
            )}

            {localItem && showNavigationModal && (
                <ProjectNavigationModal 
                    item={localItem}
                    onClose={() => setShowNavigationModal(false)}
                    onSuccess={(updated) => {
                        setLocalItem(updated);
                        fetchAll();
                    }}
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
                            fetchAll(); // Refresh grid too
                        } else {
                            fetchAll();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ProjectSkincarePage;
