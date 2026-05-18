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

export const ProjectCurationPage: React.FC = () => {
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

    const [editingSection, setEditingSection] = useState<'hero' | 'feature' | 'banner' | 'footer' | 'header' | 'curation' | null>(null);
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
                          agencyProducts.find(p => p.page_type === 'curation') ||
                          agencyProducts[0] ||
                          allProducts.filter(p => !p.agency_id).find(p => p.page_type === 'curation') ||
                          allProducts.filter(p => !p.agency_id)[0] ||
                          allProducts[0];

            if (sample) setLocalItem(sample);

            // Filter products for this page type
            const curationProducts = (agencyProducts.length > 0 ? agencyProducts : allProducts)
                .filter(p => p.page_type === 'curation' || p.category === 'curation');
            
            setProducts(curationProducts);
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

    const metadata = (localItem?.metadata as any) || {};

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
                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <EditableWrapper
                        canEdit={canEdit}
                        label="Edit Page Content"
                        onEdit={() => setEditingSection('curation')}
                    >
                        <div className="py-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-center mb-20"
                            >
                                <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D2924] mb-6">
                                    <AutoTranslatedText text={metadata.curationTitle || "큐레이션"} />
                                </h1>
                                <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                                    <AutoTranslatedText text={metadata.curationSubtitle || "Personalized Selection"} />
                                </p>
                            </motion.div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                {products.map((product) => (
                                    <div key={product.id} className="group relative">
                                        <Link to={`/project-template/product/${product.id}`} className="flex flex-col md:flex-row gap-8 bg-white/50 p-8 rounded-[40px] border border-[#2D2924]/5 group-hover:shadow-xl transition-all duration-500">
                                            <div className="w-full md:w-1/2 aspect-square rounded-[30px] overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#F5F0E8] flex items-center justify-center opacity-20">
                                                        <span className="text-xs font-black uppercase tracking-widest">CURA</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4">
                                                <h3 className="text-2xl font-serif text-[#2D2924] group-hover:text-[#FF7F7F] transition-colors">
                                                    <AutoTranslatedText text={product.title} />
                                                </h3>
                                                <p className="text-[#5C564D] leading-relaxed text-sm line-clamp-4">
                                                    <AutoTranslatedText text={product.description} />
                                                </p>
                                            </div>
                                        </Link>

                                        {canEdit && (
                                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                                    <p className="text-[#8B7E66] text-sm italic font-serif">등록된 큐레이션이 없습니다.</p>
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
            
            <EditableWrapper
                canEdit={canEdit}
                label="Edit Footer"
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
                        page_type: 'curation',
                        category: 'curation',
                        subcategory: 'curation',
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

export default ProjectCurationPage;
