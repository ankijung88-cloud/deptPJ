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

const ProjectCurationPage: React.FC = () => {
    useImmersiveMode(true);
    const navigate = useNavigate();
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | undefined>();
    const [editingSection, setEditingSection] = useState<'curation' | 'header' | 'footer' | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchSample = async () => {
            try {
                const products = await getFeaturedProducts();
                const sample = products.find(p => 
                    p.page_type === 'curation' && 
                    (isAdmin || (isAgency && p.agency_id?.toString() === user?.id?.toString()))
                ) || products.find(p => p.page_type === 'curation') || products.find(p => p.page_type === 'skincare');
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
            <EditableWrapper 
                canEdit={canEdit} 
                label="Edit Header" 
                onEdit={() => setEditingSection('header')}
            >
                <PremiumHeader item={localItem} />
            </EditableWrapper>
            
            <main className="pt-32 pb-24">
                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <EditableWrapper
                        canEdit={canEdit}
                        label="Edit Page Content"
                        onEdit={() => setEditingSection('curation')}
                    >
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="aspect-[4/5] bg-white/50 rounded-[40px] overflow-hidden shadow-sm border border-[#2D2924]/5">
                                {metadata.curationImage && (
                                    <img src={metadata.curationImage} alt="Curation" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex flex-col justify-center space-y-8">
                                <h2 className="text-3xl font-serif text-[#2D2924]">
                                    <AutoTranslatedText text={metadata.curationContentTitle || "당신만을 위한 맞춤 제안"} />
                                </h2>
                                <p className="text-[#5C564D] leading-relaxed">
                                    <AutoTranslatedText text={metadata.curationContentDesc || "여움의 전문가들이 선별한 프리미엄 라인업을 만나보세요. 피부 상태와 고민에 맞춘 최적의 조합을 제안합니다."} />
                                </p>
                            </div>
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

export default ProjectCurationPage;
