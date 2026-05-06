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
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, List } from 'lucide-react';

const ProjectBrandPage: React.FC = () => {
    useImmersiveMode(true);
    const navigate = useNavigate();
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | undefined>();
    const [editingSection, setEditingSection] = useState<'brand' | 'header' | 'footer' | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchSample = async () => {
            try {
                const products = await getFeaturedProducts();
                const sample = products.find(p => 
                    p.page_type === 'brand' && 
                    (isAdmin || (isAgency && p.agency_id?.toString() === user?.id?.toString()))
                ) || products.find(p => p.page_type === 'brand') || products.find(p => p.page_type === 'skincare');
                if (sample) setLocalItem(sample);
            } catch (err) {
                console.error('Failed to fetch sample project:', err);
            }
        };
        fetchSample();
    }, []);

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

    const canEdit = isAdmin || (isAgency && localItem?.agency_id?.toString() === user?.id?.toString());
    const metadata = (localItem?.metadata as any) || {};

    return (
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8]">
            <EditableWrapper canEdit={canEdit} label="Edit Header" onEdit={() => setEditingSection('header')}>
                <PremiumHeader item={localItem} />
            </EditableWrapper>
            
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <EditableWrapper canEdit={canEdit} label="Edit Page Content" onEdit={() => setEditingSection('brand')}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-20"
                        >
                            <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D2924] mb-6">
                                <AutoTranslatedText text={metadata.brandTitle || "브랜드"} />
                            </h1>
                            <p className="text-[#8B7E66] tracking-[0.3em] uppercase text-xs font-black">
                                <AutoTranslatedText text={metadata.brandSubtitle || "Our Identity"} />
                            </p>
                        </motion.div>
                        
                        <div className="max-w-4xl mx-auto space-y-24 text-center">
                            <section>
                                <h2 className="text-3xl font-serif text-[#2D2924] mb-8 italic">
                                    <AutoTranslatedText text={metadata.brandStoryTitle || "여움의 시작"} />
                                </h2>
                                <p className="text-[#5C564D] leading-loose text-lg whitespace-pre-line">
                                    <AutoTranslatedText text={metadata.brandStoryContent || "복잡한 도심 속에서 잃어버린 피부의 '여유'를 찾아드리기 위해 시작되었습니다.\n우리는 자연의 순수함과 현대 과학의 조화를 지향합니다."} />
                                </p>
                            </section>
                            <div className="w-full h-[500px] bg-white/50 rounded-[60px] shadow-sm border border-[#2D2924]/5 overflow-hidden">
                                {metadata.brandImage && (
                                    <img src={metadata.brandImage} alt="Brand" className="w-full h-full object-cover" />
                                )}
                            </div>
                        </div>
                    </EditableWrapper>
                </div>
            </main>
            
            <EditableWrapper canEdit={canEdit} label="Edit Footer" onEdit={() => setEditingSection('footer')}>
                <PremiumFooter item={localItem} />
            </EditableWrapper>

            {/* Admin Action Bar */}
            {canEdit && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 p-2 bg-[#2D2924]/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
                    <button onClick={() => navigate('/admin/products')} className="p-3 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all">
                        <List size={18} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#2D2924] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD700] transition-all shadow-xl">
                        <Plus size={14} /> New Project
                    </button>
                    <button onClick={handleDelete} disabled={isDeleting} className="p-3 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-all disabled:opacity-50">
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            {/* Editing Modals */}
            {localItem && editingSection && (
                <TemplateTextEditModal 
                    item={localItem}
                    section={editingSection as any}
                    onClose={() => setEditingSection(null)}
                    onSuccess={(updated) => setLocalItem(updated)}
                />
            )}

            {showCreateModal && (
                <ProductFormModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => navigate('/admin/products')}
                />
            )}
        </div>
    );
};

export default ProjectBrandPage;
