import React, { useEffect, useState } from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getFeaturedProducts, deleteProduct } from '../api/products';
import { FeaturedItem } from '../types';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { EditableWrapper } from '../components/common/EditableWrapper';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { TemplateTextEditModal } from '../components/admin/TemplateTextEditModal';
import { ProjectAdminBar } from '../components/admin/ProjectAdminBar';
import { ProjectNavigationModal } from '../components/admin/ProjectNavigationModal';

export const ProjectSkincarePage: React.FC<{ item?: FeaturedItem }> = ({ item }) => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [localItem, setLocalItem] = useState<FeaturedItem | null>(item || null);
    
    // Parse agencyId and category/subcategory context from URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlAgencyId = queryParams.get('agencyId');
    const urlCategory = queryParams.get('category');
    const urlSubcategory = queryParams.get('subcategory');

    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'skincare' | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<FeaturedItem | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
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
            let skincareProducts = (agencyProducts.length > 0 ? agencyProducts : allProducts)
                .filter(p => p.subcategory === 'skincare' || p.category === 'skincare' || p.page_type === 'skincare');
            
            if (urlCategory) {
                skincareProducts = skincareProducts.filter(p => p.category === urlCategory);
            }
            if (urlSubcategory) {
                skincareProducts = skincareProducts.filter(p => p.subcategory === urlSubcategory);
            }
            
            setProducts(skincareProducts);
            
            // Get sample for metadata (header/footer) (Prioritize urlCategory matching to break local state stickiness)
            const sample = (urlCategory ? allProducts.find(p => p.category === urlCategory && p.page_type === 'skincare' && (targetAgencyId ? p.agency_id?.toString() === targetAgencyId : !p.agency_id)) : null) ||
                          (urlCategory ? allProducts.find(p => p.category === urlCategory && p.page_type === 'skincare') : null) ||
                          (localItem ? allProducts.find(p => p.id === localItem.id) : null) || 
                          agencyProducts.find(p => p.page_type === 'skincare') ||
                          agencyProducts[0] ||
                          allProducts.filter(p => !p.agency_id).find(p => p.page_type === 'skincare') ||
                          allProducts.filter(p => !p.agency_id)[0] ||
                          allProducts[0];
            
            if (sample) setLocalItem(sample);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!item || (urlCategory && item.category !== urlCategory)) {
            // If sticky localItem has a different category than urlCategory, reset it
            if (localItem && urlCategory && localItem.category !== urlCategory) {
                setLocalItem(null);
            }
            fetchAll();
        } else {
            setLocalItem(item);
        }
    }, [item, isAdmin, isAgency, user, urlAgencyId, urlCategory, urlSubcategory]);

    if (!localItem || loading) return (
        <div className="min-h-screen bg-[#FCF9F5] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#2D2924]" size={40} />
        </div>
    );

    const handleDelete = async (productId?: string) => {
        const idToDelete = productId || localItem.id;
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteProduct(idToDelete);
            if (!productId) {
                navigate('/');
            } else {
                fetchAll();
            }
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };

    const handleEditProduct = (product: FeaturedItem) => {
        setSelectedProduct(product);
        setModalMode('edit');
    };



    return (
        <div className="min-h-screen bg-[#FCF9F5] overflow-x-hidden w-full max-w-full">
            <ProjectAdminBar 
                item={localItem}
                canEdit={canEdit}
                onEditSettings={() => handleEditProduct(localItem)}
                onEditHeader={() => setShowNavigationModal(true)}
                onAdd={() => setModalMode('add')}
                onDelete={isOwner ? () => handleDelete() : undefined}
            />

            <PremiumHeader 
                item={localItem} 
                canEdit={canEdit}
                onEdit={() => setShowNavigationModal(true)}
            />

            <main className="pt-20">


                <div className="py-24 container mx-auto px-6 md:px-12 lg:px-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {products.map((product) => (
                            <div key={product.id} className="group relative">
                                <Link 
                                    to={`/project-template/product/${product.id}`}
                                    className="block"
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

                                {canEdit && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

            {modalMode && (
                <ProductFormModal 
                    product={modalMode === 'edit' ? selectedProduct : null}
                    initialData={modalMode === 'add' ? {
                        page_type: 'skincare',
                        category: urlCategory || 'skincare',
                        subcategory: urlSubcategory || 'skincare',
                        agency_id: localItem.agency_id
                    } : undefined}
                    onClose={() => {
                        setModalMode(null);
                        setSelectedProduct(null);
                    }}
                    onSuccess={() => {
                        setModalMode(null);
                        setSelectedProduct(null);
                        fetchAll();
                    }}
                />
            )}
        </div>
    );
};

export default ProjectSkincarePage;
