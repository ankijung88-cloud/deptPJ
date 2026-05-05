import React, { useEffect, useState } from 'react';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../api/products';
import { FeaturedItem } from '../types';
import { Loader2, Plus } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { EditableWrapper } from '../components/common/EditableWrapper';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { deleteProduct } from '../api/products';

const ProjectSkincarePage: React.FC = () => {
    useImmersiveMode(true);
    const { isAdmin, isAgency, user } = useAdmin();
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<FeaturedItem | null>(null);

    const canCreate = isAdmin || (isAgency && user?.has_project_template_access);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const allProducts = await getFeaturedProducts();
            const skincareProducts = allProducts.filter(p => 
                p.category?.toLowerCase().includes('skin') || 
                p.subcategory?.toLowerCase().includes('skin') ||
                p.page_type === 'skincare'
            );
            setProducts(skincareProducts.length > 0 ? skincareProducts : allProducts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteProduct(id);
            fetchProducts();
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };
    
    return (
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8]">
            <PremiumHeader />
            
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D2924] mb-6">
                            <AutoTranslatedText text="스킨케어" />
                        </h1>
                        <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                            <AutoTranslatedText text="Essential Care" />
                        </p>
                    </motion.div>
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="animate-spin text-[#8B7E66]" size={40} />
                            <p className="text-[#8B7E66] text-sm font-black uppercase tracking-widest">Loading Collection</p>
                        </div>
                    ) : products.length > 0 ? (
                        <EditableWrapper
                            canEdit={canCreate}
                            label="Add Product"
                            onAdd={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {products.map((product) => {
                                    const isOwner = isAdmin || (isAgency && product.agency_id?.toString() === user?.id?.toString());
                                    return (
                                        <EditableWrapper
                                            key={product.id}
                                            canEdit={isOwner}
                                            label={typeof product.title === 'string' ? product.title : 'Product'}
                                            onEdit={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                            onDelete={() => handleDelete(product.id)}
                                        >
                                            <Link 
                                                to={`/project-template/product/${product.id}`} 
                                                className="group cursor-pointer block h-full"
                                            >
                                                <div className="aspect-[4/5] bg-white rounded-[40px] overflow-hidden mb-8 border border-[#2D2924]/5 group-hover:shadow-2xl transition-all duration-700 relative">
                                                    {product.imageUrl ? (
                                                        <img 
                                                            src={product.imageUrl} 
                                                            alt={typeof product.title === 'string' ? product.title : ''} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-[#F5F0E8] flex items-center justify-center text-[#8B7E66]/20">
                                                            <span className="font-serif text-6xl">S</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                                </div>
                                                <div className="space-y-3 px-2 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest">
                                                            {product.subcategory || 'Collection'}
                                                        </span>
                                                        <div className="h-px flex-1 bg-[#2D2924]/10" />
                                                    </div>
                                                    <h3 className="text-2xl font-serif text-[#2D2924]">
                                                        <AutoTranslatedText text={typeof product.title === 'string' ? product.title : JSON.stringify(product.title)} />
                                                    </h3>
                                                    <p className="text-sm text-[#8B7E66] line-clamp-2 leading-relaxed">
                                                        <AutoTranslatedText text={typeof product.description === 'string' ? product.description : ''} />
                                                    </p>
                                                </div>
                                            </Link>
                                        </EditableWrapper>
                                    );
                                })}
                            </div>
                        </EditableWrapper>
                    ) : (
                        <div className="text-center py-24 bg-white/30 rounded-[40px] border border-dashed border-[#8B7E66]/30">
                            <p className="text-[#8B7E66] mb-8 font-serif italic text-lg">아직 등록된 스킨케어 제품이 없습니다.</p>
                            {isAdmin && (
                                <Link 
                                    to="/admin" 
                                    className="inline-flex items-center gap-2 bg-[#2D2924] text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    <Plus size={16} />
                                    제품 등록하러 가기
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <ProductFormModal
                        product={editingProduct}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => { setIsModalOpen(false); fetchProducts(); }}
                    />
                )}
            </AnimatePresence>
            
            <PremiumFooter />
        </div>
    );
};

export default ProjectSkincarePage;
