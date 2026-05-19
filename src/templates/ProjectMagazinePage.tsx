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

export const ProjectMagazinePage: React.FC<{ item?: FeaturedItem }> = ({ item }) => {
    useImmersiveMode(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(item || null);
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Parse agencyId and category/subcategory context from URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlAgencyId = queryParams.get('agencyId');
    const urlCategory = queryParams.get('category');
    const urlSubcategory = queryParams.get('subcategory');

    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'magazine' | null>(null);
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

            // Main template item (Prioritize urlCategory & urlSubcategory matching to break local state stickiness)
            const sample = (urlCategory && urlSubcategory ? allProducts.find(p => p.category === urlCategory && p.subcategory === urlSubcategory && p.page_type === 'magazine' && (targetAgencyId ? p.agency_id?.toString() === targetAgencyId : !p.agency_id)) : null) ||
                          (urlCategory && urlSubcategory ? allProducts.find(p => p.category === urlCategory && p.subcategory === urlSubcategory && (targetAgencyId ? p.agency_id?.toString() === targetAgencyId : !p.agency_id)) : null) ||
                          (urlCategory && !urlSubcategory ? allProducts.find(p => p.category === urlCategory && p.page_type === 'magazine' && (targetAgencyId ? p.agency_id?.toString() === targetAgencyId : !p.agency_id)) : null) ||
                          (urlCategory && !urlSubcategory ? allProducts.find(p => p.category === urlCategory && p.page_type === 'magazine') : null) ||
                          (localItem ? allProducts.find(p => p.id === localItem.id) : null) || 
                          agencyProducts.find(p => p.page_type === 'magazine') ||
                          agencyProducts[0] ||
                          allProducts.filter(p => !p.agency_id).find(p => p.page_type === 'magazine') ||
                          allProducts.filter(p => !p.agency_id)[0] ||
                          allProducts[0];

            if (item) {
                setLocalItem(item);
            } else if (sample) {
                setLocalItem(sample);
            }

            // Filter products for this page type
            let magazineProducts = (agencyProducts.length > 0 ? agencyProducts : allProducts)
                .filter(p => p.page_type === 'magazine');
            
            if (urlCategory) {
                magazineProducts = magazineProducts.filter(p => p.category === urlCategory);
            }
            if (urlSubcategory) {
                magazineProducts = magazineProducts.filter(p => p.subcategory === urlSubcategory);
            }
            
            setProducts(magazineProducts);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!item || (urlCategory && item.category !== urlCategory) || (urlSubcategory && item.subcategory !== urlSubcategory)) {
            // If sticky localItem has a different category or subcategory, reset it
            if (localItem && ((urlCategory && localItem.category !== urlCategory) || (urlSubcategory && localItem.subcategory !== urlSubcategory))) {
                setLocalItem(null);
            }
        } else {
            setLocalItem(item);
        }
        fetchAll();
    }, [item, isAdmin, isAgency, user, urlAgencyId, urlCategory, urlSubcategory]);

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

    const metadata = (localItem?.metadata as any) || {};

    return (
        <div className="min-h-screen bg-[#FCF9F5] overflow-x-hidden w-full max-w-full">
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
                                {products.map((product) => (
                                    <div key={product.id} className="group relative">
                                        <Link to={`/project-template/product/${product.id}`} className="block space-y-6">
                                            <div className="aspect-video bg-[#F5F0E8] rounded-2xl border border-[#2D2924]/5 overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                                        <span className="text-[10px] font-black tracking-widest uppercase">No Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[10px] text-[#8B7E66] font-black uppercase tracking-widest">
                                                    <AutoTranslatedText text={product.subcategory || "Editorial"} />
                                                </span>
                                                <h3 className="text-2xl font-serif text-[#2D2924] group-hover:text-[#FF7F7F] transition-colors">
                                                    <AutoTranslatedText text={product.title} />
                                                </h3>
                                                <p className="text-sm text-[#8B7E66] leading-relaxed line-clamp-2">
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
                                                    <Edit2 size={14} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(product.id);
                                                    }}
                                                    className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {products.length === 0 && !loading && (
                                <div className="text-center py-20 bg-[#F5F0E8]/30 rounded-[40px] border border-dashed border-[#2D2924]/10">
                                    <p className="text-[#8B7E66] text-sm italic font-serif">등록된 매거진이 없습니다.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="animate-spin text-[#8B7E66]" />
                                </div>
                            )}
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

            {modalMode && (
                <ProductFormModal 
                    product={modalMode === 'edit' ? selectedProduct : null}
                    initialData={modalMode === 'add' ? {
                        page_type: 'magazine',
                        category: urlCategory || 'magazine',
                        subcategory: urlSubcategory || 'magazine',
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

export default ProjectMagazinePage;
