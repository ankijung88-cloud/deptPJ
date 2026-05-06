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
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ProjectAdminBar } from '../components/admin/ProjectAdminBar';
import { ProjectNavigationModal } from '../components/admin/ProjectNavigationModal';

import { Edit2, Trash2, Loader2 } from 'lucide-react';

export const ProjectCommunityPage: React.FC = () => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(null);
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Parse agencyId from URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlAgencyId = queryParams.get('agencyId');

    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'community' | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<FeaturedItem | null>(null);
    const [showNavigationModal, setShowNavigationModal] = useState(false);

    // Permission logic
    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());

    const fetchAll = async () => {
        setLoading(true);
        try {
            const allProducts = await getFeaturedProducts();
            
            // Priority for agency context
            const targetAgencyId = urlAgencyId || (isAgency ? user?.id?.toString() : null);
            const agencyProducts = targetAgencyId ? allProducts.filter(p => p.agency_id?.toString() === targetAgencyId) : [];

            // Main template item
            const sample = (localItem ? allProducts.find(p => p.id === localItem.id) : null) || 
                          agencyProducts.find(p => p.page_type === 'community') ||
                          agencyProducts[0] ||
                          allProducts.filter(p => !p.agency_id).find(p => p.page_type === 'community') ||
                          allProducts.filter(p => !p.agency_id)[0] ||
                          allProducts[0];

            if (sample) setLocalItem(sample);

            // Filter products for this page type
            const communityProducts = (agencyProducts.length > 0 ? agencyProducts : allProducts)
                .filter(p => p.page_type === 'community' || p.category === 'community');
            
            setProducts(communityProducts);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [isAdmin, isAgency, user, urlAgencyId]);

    const handleDelete = async (id?: string) => {
        const targetId = id || localItem?.id;
        if (!targetId || !window.confirm('정말 삭제하시겠습니까?')) return;
        
        try {
            await deleteProduct(targetId);
            if (!id) navigate('/');
            else fetchAll();
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };

    const handleEditProduct = (product: FeaturedItem) => {
        setSelectedProduct(product);
        setModalMode('edit');
    };

    if (!localItem) return null;

    return (
        <div className="min-h-screen bg-[#FCF9F5]">
            <ProjectAdminBar 
                item={localItem}
                canEdit={canEdit}
                onEditSettings={() => handleEditProduct(localItem)}
                onEditHeader={() => setShowNavigationModal(true)}
                onAdd={() => {
                    setSelectedProduct(null);
                    setModalMode('add');
                }}
                onDelete={isOwner ? () => handleDelete() : undefined}
            />

            <PremiumHeader 
                item={localItem} 
                canEdit={canEdit}
                onEdit={() => setShowNavigationModal(true)}
            />

            <main className="pt-20">
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
                                {products.map((product) => (
                                    <div key={product.id} className="group relative">
                                        <Link to={`/project-template/product/${product.id}`} className="block">
                                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#2D2924]/5 group-hover:shadow-xl transition-all duration-500 min-h-[280px] flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-[#F5F0E8] rounded-full flex items-center justify-center mb-6 overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-black text-[#2D2924]">COMM</span>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-bold text-[#2D2924] mb-4 group-hover:text-[#FF7F7F] transition-colors">
                                                    <AutoTranslatedText text={product.title} />
                                                </h4>
                                                <p className="text-xs text-[#8B7E66] leading-relaxed line-clamp-3 text-center">
                                                    <AutoTranslatedText text={product.description} />
                                                </p>
                                            </div>
                                        </Link>

                                        {canEdit && (
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleEditProduct(product);
                                                    }}
                                                    className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-[#2D2924] hover:bg-[#2D2924] hover:text-white transition-all"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(product.id);
                                                    }}
                                                    className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {products.length === 0 && !loading && !canEdit && (
                                <div className="text-center py-20 bg-[#F5F0E8]/30 rounded-[40px] border border-dashed border-[#2D2924]/10">
                                    <p className="text-[#8B7E66] text-sm italic font-serif">등록된 커뮤니티가 없습니다.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="animate-spin text-[#8B7E66]" />
                                </div>
                            )}
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

            {modalMode && (
                <ProductFormModal 
                    product={modalMode === 'edit' ? selectedProduct : null}
                    initialData={modalMode === 'add' ? {
                        page_type: 'community',
                        category: 'community',
                        subcategory: 'community',
                        agency_id: localItem.agency_id
                    } : undefined}
                    onClose={() => setModalMode(null)}
                    onSuccess={() => {
                        setModalMode(null);
                        fetchAll();
                    }}
                />
            )}
        </div>
    );
};

export default ProjectCommunityPage;
