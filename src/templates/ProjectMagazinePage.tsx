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

const ProjectMagazinePage: React.FC = () => {
    useImmersiveMode(true);
    const navigate = useNavigate();
    const { isAdmin, isAgency, user } = useAdmin();
    const [localItem, setLocalItem] = useState<FeaturedItem | undefined>();
    const [editingSection, setEditingSection] = useState<'magazine' | 'header' | 'footer' | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchSample = async () => {
            try {
                const products = await getFeaturedProducts();
                const sample = products.find(p => 
                    p.page_type === 'magazine' && 
                    (isAdmin || (isAgency && p.agency_id?.toString() === user?.id?.toString()))
                ) || products.find(p => p.page_type === 'magazine') || products.find(p => p.page_type === 'skincare');
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
                    <EditableWrapper canEdit={canEdit} label="Edit Page Content" onEdit={() => setEditingSection('magazine')}>
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
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-6">
                                    <div className="aspect-video bg-white/50 rounded-2xl border border-[#2D2924]/5 overflow-hidden shadow-sm" />
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-[#FF7F7F] font-black uppercase tracking-widest"><AutoTranslatedText text="Editorial" /></span>
                                        <h3 className="text-2xl font-serif text-[#2D2924]"><AutoTranslatedText text={`Seasonal Beauty Insight Vol.0${i}`} /></h3>
                                        <p className="text-sm text-[#8B7E66] leading-relaxed"><AutoTranslatedText text="계절의 변화에 대처하는 현명한 스킨케어 가이드. 여움이 제안하는 계절별 필수 케어 팁을 만나보세요." /></p>
                                    </div>
                                </div>
                            ))}
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

export default ProjectMagazinePage;
