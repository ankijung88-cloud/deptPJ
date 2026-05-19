import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PremiumHeader } from '../components/layout/PremiumHeader';
import { PremiumFooter } from '../components/home/PremiumFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { ArrowRight, ChevronRight, Droplets, Leaf, Sparkles, Edit2, X, Check, Upload, Loader2 } from 'lucide-react';
import { getProductById, updateProduct, deleteProduct } from '../api/products';
import { FeaturedItem } from '../types';
import { useAdmin } from '../hooks/useAdmin';
import { EditableWrapper } from '../components/common/EditableWrapper';
import { ProjectAdminBar } from '../components/admin/ProjectAdminBar';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { ProjectNavigationModal } from '../components/admin/ProjectNavigationModal';

// --- Types ---
interface PremiumDetailConfig {
    hero: {
        title: string;
        subtitle: string;
        description: string;
        imageUrl: string;
        features: { label: string; iconType: 'leaf' | 'droplet' | 'sparkle' }[];
    };
    quote: {
        text: string;
        subtext: string;
    };
    features: {
        title: string;
        description: string;
        iconType: 'leaf' | 'droplet' | 'sparkle';
    }[];
    recommendations: {
        title: string;
        description: string;
        imageUrl: string;
    }[];
    usage: {
        title: string;
        description: string;
        imageUrl: string;
    };
}

const DEFAULT_CONFIG: PremiumDetailConfig = {
    hero: {
        title: '여움 수분 크림',
        subtitle: '피부에 여유를 담다',
        description: '지친 하루 끝,\n피부에 편안한 휴식을 전합니다.',
        imageUrl: '',
        features: [
            { label: '저자극 포뮬러', iconType: 'leaf' },
            { label: '수분 충전', iconType: 'droplet' },
            { label: '피부 진정', iconType: 'sparkle' }
        ]
    },
    quote: {
        text: '아무것도 하지 않아도 괜찮은 날,\n피부도 잠시 쉬어가도 괜찮아요.',
        subtext: '여움 수분 크림은 피부에 편안한 휴식을 주고,\n건강한 균형을 되찾아주는 데 도움을 줍니다.'
    },
    features: [
        { title: '진정 케어', description: '병풀 추출물과 판테놀 성분이\n민감해진 피부를 편안하게 진정시켜 줍니다.', iconType: 'leaf' },
        { title: '수분 충전', description: '히알루론산이 피부 깊숙이 수분을 채워\n오랫동안 촉촉함을 유지해 줍니다.', iconType: 'droplet' },
        { title: '가벼운 사용감', description: '산뜻한 텍스트가 끈적임 없이 흡수되어\n매일 부담 없이 사용할 수 있습니다.', iconType: 'sparkle' }
    ],
    recommendations: [
        { title: '지쳤을 때', description: '하루의 피로로 지친 피부를\n편안하게 달래주세요.', imageUrl: '' },
        { title: '민감할 때', description: '외부 자극으로 예민해진 피부를\n순하게 케어해 줍니다.', imageUrl: '' },
        { title: '쉬고 싶은 날', description: '나만의 휴식 시간이 필요할 때,\n피부에도 여유를 주세요.', imageUrl: '' }
    ],
    usage: {
        title: '사용 방법',
        description: '스킨케어 마지막 단계에서 적당량을 덜어\n얼굴 전체에 부드럽게 펴 발라 흡수시켜 줍니다.\n아침, 저녁으로 사용하시면 더욱 좋습니다.',
        imageUrl: ''
    }
};

const IconMap = {
    leaf: Leaf,
    droplet: Droplets,
    sparkle: Sparkles
};

// --- Sub-Components ---
const EditModal = ({ product, config, initialSection, onClose, onSave }: { product: FeaturedItem, config: PremiumDetailConfig, initialSection?: string | null, onClose: () => void, onSave: (newConfig: PremiumDetailConfig) => void }) => {
    const [localConfig, setLocalConfig] = useState<PremiumDetailConfig>(config);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        if (initialSection) {
            // Wait for modal animation
            setTimeout(() => {
                const el = document.getElementById(`edit-section-${initialSection}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [initialSection]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(path);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: formData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            
            if (data.url) {
                // Update nested config
                const newConfig = { ...localConfig };
                if (path === 'hero') newConfig.hero.imageUrl = data.url;
                else if (path === 'usage') newConfig.usage.imageUrl = data.url;
                else if (path.startsWith('rec-')) {
                    const idx = parseInt(path.split('-')[1]);
                    newConfig.recommendations[idx].imageUrl = data.url;
                }
                setLocalConfig(newConfig);
            }
        } catch (err) {
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setUploading(null);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProduct(product.id, {
                ...product,
                metadata: {
                    ...product.metadata,
                    premiumDetail: localConfig
                }
            });
            onSave(localConfig);
        } catch (err) {
            alert('저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-[#2D2924]/5 flex justify-between items-center bg-[#F5F0E8]/50">
                    <div>
                        <h3 className="text-2xl font-serif text-[#2D2924]">제품 상세 디자인 편집</h3>
                        <p className="text-xs text-[#8B7E66] mt-1 uppercase tracking-widest font-black">Visual Content Editor</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                    {/* Hero Section Edit */}
                    <section id="edit-section-hero" className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-[#2D2924]/10">
                            <span className="w-6 h-6 rounded-full bg-[#8B7E66] text-white flex items-center justify-center text-[10px] font-black">01</span>
                            <h4 className="font-serif text-lg text-[#2D2924]">히어로 섹션</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">대표 이미지</label>
                                    <div className="relative aspect-video bg-[#F5F0E8]/50 rounded-2xl overflow-hidden group">
                                        {localConfig.hero.imageUrl ? (
                                            <img src={localConfig.hero.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#8B7E66]/30">
                                                <Upload size={32} />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'hero')} />
                                            <span className="text-white text-xs font-black uppercase tracking-widest">
                                                {uploading === 'hero' ? 'Uploading...' : 'Change Image'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">제품명</label>
                                        <input 
                                            type="text" 
                                            value={localConfig.hero.title}
                                            onChange={(e) => setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, title: e.target.value } })}
                                            className="w-full bg-[#F5F0E8]/30 border border-[#2D2924]/10 rounded-2xl p-4 focus:outline-none focus:border-[#8B7E66]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">서브 타이틀</label>
                                        <input 
                                            type="text" 
                                            value={localConfig.hero.subtitle}
                                            onChange={(e) => setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, subtitle: e.target.value } })}
                                            className="w-full bg-[#F5F0E8]/30 border border-[#2D2924]/10 rounded-2xl p-4 focus:outline-none focus:border-[#8B7E66]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">설명 문구</label>
                                <textarea 
                                    rows={8}
                                    value={localConfig.hero.description}
                                    onChange={(e) => setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, description: e.target.value } })}
                                    className="w-full bg-[#F5F0E8]/30 border border-[#2D2924]/10 rounded-2xl p-4 focus:outline-none focus:border-[#8B7E66] h-[calc(100%-24px)]"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Quote Section Edit */}
                    <section id="edit-section-quote" className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-[#2D2924]/10">
                            <span className="w-6 h-6 rounded-full bg-[#8B7E66] text-white flex items-center justify-center text-[10px] font-black">02</span>
                            <h4 className="font-serif text-lg text-[#2D2924]">철학/인용 문구</h4>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">메인 문구</label>
                                <textarea 
                                    rows={2}
                                    value={localConfig.quote.text}
                                    onChange={(e) => setLocalConfig({ ...localConfig, quote: { ...localConfig.quote, text: e.target.value } })}
                                    className="w-full bg-[#F5F0E8]/30 border border-[#2D2924]/10 rounded-2xl p-4 focus:outline-none focus:border-[#8B7E66]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">서브 문구</label>
                                <textarea 
                                    rows={2}
                                    value={localConfig.quote.subtext}
                                    onChange={(e) => setLocalConfig({ ...localConfig, quote: { ...localConfig.quote, subtext: e.target.value } })}
                                    className="w-full bg-[#F5F0E8]/30 border border-[#2D2924]/10 rounded-2xl p-4 focus:outline-none focus:border-[#8B7E66]"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Features Edit */}
                    <section id="edit-section-features" className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-[#2D2924]/10">
                            <span className="w-6 h-6 rounded-full bg-[#8B7E66] text-white flex items-center justify-center text-[10px] font-black">03</span>
                            <h4 className="font-serif text-lg text-[#2D2924]">제품 특징 (3개)</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {localConfig.features.map((feat, idx) => (
                                <div key={idx} className="bg-[#F5F0E8]/30 p-6 rounded-3xl border border-[#2D2924]/5 space-y-4">
                                    <select 
                                        value={feat.iconType}
                                        onChange={(e) => {
                                            const newFeats = [...localConfig.features];
                                            newFeats[idx].iconType = e.target.value as any;
                                            setLocalConfig({ ...localConfig, features: newFeats });
                                        }}
                                        className="w-full bg-white border border-[#2D2924]/10 rounded-xl p-2 text-xs"
                                    >
                                        <option value="leaf">나뭇잎 (진정)</option>
                                        <option value="droplet">물방울 (수분)</option>
                                        <option value="sparkle">반짝임 (효과)</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder="특징 제목"
                                        value={feat.title}
                                        onChange={(e) => {
                                            const newFeats = [...localConfig.features];
                                            newFeats[idx].title = e.target.value;
                                            setLocalConfig({ ...localConfig, features: newFeats });
                                        }}
                                        className="w-full bg-white border border-[#2D2924]/10 rounded-xl p-3 text-sm"
                                    />
                                    <textarea 
                                        rows={3}
                                        placeholder="특징 설명"
                                        value={feat.description}
                                        onChange={(e) => {
                                            const newFeats = [...localConfig.features];
                                            newFeats[idx].description = e.target.value;
                                            setLocalConfig({ ...localConfig, features: newFeats });
                                        }}
                                        className="w-full bg-white border border-[#2D2924]/10 rounded-xl p-3 text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recommendations Edit */}
                    <section id="edit-section-recommendations" className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-[#2D2924]/10">
                            <span className="w-6 h-6 rounded-full bg-[#8B7E66] text-white flex items-center justify-center text-[10px] font-black">04</span>
                            <h4 className="font-serif text-lg text-[#2D2924]">추천 상황</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {localConfig.recommendations.map((rec, idx) => (
                                <div key={idx} className="bg-[#F5F0E8]/30 p-6 rounded-3xl border border-[#2D2924]/5 space-y-4">
                                    <div className="relative aspect-square bg-white rounded-2xl overflow-hidden group">
                                        {rec.imageUrl ? (
                                            <img src={rec.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#8B7E66]/20">
                                                <Upload size={24} />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, `rec-${idx}`)} />
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">
                                                {uploading === `rec-${idx}` ? 'Uploading...' : 'Change'}
                                            </span>
                                        </label>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="상황 제목"
                                        value={rec.title}
                                        onChange={(e) => {
                                            const newRecs = [...localConfig.recommendations];
                                            newRecs[idx].title = e.target.value;
                                            setLocalConfig({ ...localConfig, recommendations: newRecs });
                                        }}
                                        className="w-full bg-white border border-[#2D2924]/10 rounded-xl p-3 text-sm font-bold"
                                    />
                                    <textarea 
                                        rows={3}
                                        placeholder="상황 설명"
                                        value={rec.description}
                                        onChange={(e) => {
                                            const newRecs = [...localConfig.recommendations];
                                            newRecs[idx].description = e.target.value;
                                            setLocalConfig({ ...localConfig, recommendations: newRecs });
                                        }}
                                        className="w-full bg-white border border-[#2D2924]/10 rounded-xl p-3 text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Usage Section Edit */}
                    <section id="edit-section-usage" className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-[#2D2924]/10">
                            <span className="w-6 h-6 rounded-full bg-[#8B7E66] text-white flex items-center justify-center text-[10px] font-black">05</span>
                            <h4 className="font-serif text-lg text-[#2D2924]">사용 방법</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">상세 가이드 이미지</label>
                                <div className="relative aspect-video bg-[#F5F0E8]/50 rounded-2xl overflow-hidden group">
                                    {localConfig.usage.imageUrl ? (
                                        <img src={localConfig.usage.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#8B7E66]/30">
                                            <Upload size={32} />
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'usage')} />
                                        <span className="text-white text-xs font-black uppercase tracking-widest">
                                            {uploading === 'usage' ? 'Uploading...' : 'Change Image'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">섹션 제목</label>
                                    <input 
                                        type="text" 
                                        value={localConfig.usage.title}
                                        onChange={(e) => setLocalConfig({ ...localConfig, usage: { ...localConfig.usage, title: e.target.value } })}
                                        className="w-full bg-[#F5F0E8]/30 border border-[#2D2924]/10 rounded-2xl p-4 focus:outline-none focus:border-[#8B7E66]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-[#8B7E66] uppercase tracking-widest block mb-2">가이드 설명</label>
                                    <textarea 
                                        rows={6}
                                        value={localConfig.usage.description}
                                        onChange={(e) => setLocalConfig({ ...localConfig, usage: { ...localConfig.usage, description: e.target.value } })}
                                        className="w-full bg-[#F5F0E8]/30 border border-[#2D2924]/10 rounded-2xl p-4 focus:outline-none focus:border-[#8B7E66]"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                    </div>

                    <div className="p-8 bg-[#F5F0E8]/50 border-t border-[#2D2924]/5 flex justify-end gap-4">
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 rounded-full text-xs font-black tracking-widest uppercase text-[#8B7E66] hover:bg-black/5 transition-colors"
                        >
                            취소
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#2D2924] text-white px-10 py-3 rounded-full text-xs font-black tracking-widest uppercase hover:bg-black transition-all flex items-center gap-3"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            저장하기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Component ---
const ProjectProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAdmin, isAgency, user } = useAdmin();
    const navigate = useNavigate();
    useImmersiveMode(true);
    
    const [product, setProduct] = useState<FeaturedItem | null>(null);
    const [parentProject, setParentProject] = useState<FeaturedItem | null>(null);
    const [config, setConfig] = useState<PremiumDetailConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTargetSection, setEditTargetSection] = useState<string | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showNavigationModal, setShowNavigationModal] = useState(false);

    const canEdit = isAdmin || isAgency;
    const isOwner = isAdmin || (isAgency && product?.agency_id?.toString() === user?.id?.toString());

    const openEditSection = (section: string) => {
        setEditTargetSection(section);
        setIsEditModalOpen(true);
    };

    useEffect(() => {
        if (id) {
            fetchProductData();
        }
    }, [id]);

    const fetchProductData = async () => {
        setLoading(true);
        try {
            const data = await getProductById(id!);
            if (data) {
                setProduct(data);
                if ((data as any).parent_id) {
                    try {
                        const parentData = await getProductById((data as any).parent_id.toString());
                        if (parentData) setParentProject(parentData);
                    } catch (e) {
                        console.error('Failed to fetch parent:', e);
                    }
                }
                // Deep merge or fallback for nested config
                const savedConfig = data.metadata?.premiumDetail || {};
                const mergedConfig = {
                    ...DEFAULT_CONFIG,
                    ...savedConfig,
                    hero: { ...DEFAULT_CONFIG.hero, ...savedConfig.hero },
                    quote: { ...DEFAULT_CONFIG.quote, ...savedConfig.quote },
                    usage: { ...DEFAULT_CONFIG.usage, ...savedConfig.usage },
                    features: Array.isArray(savedConfig.features) && savedConfig.features.length > 0 
                        ? savedConfig.features 
                        : DEFAULT_CONFIG.features,
                    recommendations: Array.isArray(savedConfig.recommendations) && savedConfig.recommendations.length > 0 
                        ? savedConfig.recommendations 
                        : DEFAULT_CONFIG.recommendations,
                };
                setConfig(mergedConfig);
            } else {
                setProduct(null);
            }
        } catch (err) {
            console.error('Failed to fetch product:', err);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteProduct(product!.id);
            navigate(-1);
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
                <Loader2 size={48} className="text-[#8B7E66] animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center space-y-6">
                <h2 className="text-2xl font-serif text-[#2D2924]">제품을 찾을 수 없습니다.</h2>
                <button 
                    onClick={() => navigate('/')}
                    className="text-sm font-black text-[#8B7E66] underline tracking-widest uppercase"
                >
                    홈으로 돌아가기
                </button>
            </div>
        );
    }
    
    // Safety check for title
    const displayTitle = config.hero?.title || product.title || "Product Detail";

    return (
        <div className="min-h-screen bg-[#F5F0E8] selection:bg-[#2D2924] selection:text-[#F5F0E8] overflow-x-hidden w-full max-w-full">
            <ProjectAdminBar 
                item={product}
                canEdit={canEdit}
                onEditSettings={() => setShowProductModal(true)}
                onEditHeader={() => setShowNavigationModal(true)}
                onAdd={() => setShowProductModal(true)}
                onDelete={isOwner ? handleDelete : undefined}
            />

            <PremiumHeader 
                item={parentProject || product} 
                canEdit={canEdit}
                onEdit={() => setShowNavigationModal(true)}
            />
            
            {/* Admin Controls */}
            {canEdit && (
                <div className="fixed bottom-12 right-12 z-[500] flex flex-col gap-4">
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-16 h-16 bg-[#2D2924] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
                    >
                        <Edit2 size={24} />
                        <span className="absolute right-full mr-4 px-4 py-2 bg-[#2D2924] text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-widest uppercase">
                            Edit Content
                        </span>
                    </button>
                </div>
            )}

            <AnimatePresence>
                {isEditModalOpen && (
                    <EditModal 
                        product={product} 
                        config={config} 
                        initialSection={editTargetSection}
                        onClose={() => setIsEditModalOpen(false)} 
                        onSave={(newConfig) => {
                            setConfig(newConfig);
                            setIsEditModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showProductModal && (
                    <ProductFormModal
                        onClose={() => setShowProductModal(false)}
                        onSuccess={() => {
                            setShowProductModal(false);
                            fetchProductData();
                        }}
                        product={product}
                    />
                )}
                {showNavigationModal && (
                    <ProjectNavigationModal
                        onClose={() => setShowNavigationModal(false)}
                        onSuccess={(updated) => {
                            setProduct(updated);
                            setShowNavigationModal(false);
                        }}
                        item={product}
                    />
                )}
            </AnimatePresence>

            <main className={`pt-24 ${canEdit ? 'md:pt-[140px] pt-32' : ''}`}>
                {/* Breadcrumbs */}
                <div className="container mx-auto px-6 md:px-12 lg:px-24 py-6">
                    <nav className="flex items-center gap-2 text-[10px] text-[#8B7E66] tracking-widest uppercase">
                        <AutoTranslatedText text="홈" />
                        <ChevronRight size={10} />
                        <AutoTranslatedText text={product.page_type === 'curation' ? '큐레이션' : product.page_type === 'brand' ? '브랜드' : '스킨케어'} />
                        <ChevronRight size={10} />
                        <AutoTranslatedText text="제품" />
                        <ChevronRight size={10} />
                        <span className="text-[#2D2924] font-black"><AutoTranslatedText text={displayTitle} /></span>
                    </nav>
                </div>

                {/* Hero Section */}
                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Hero Section" 
                    onEdit={() => openEditSection('hero')}
                >
                    <section className="container mx-auto px-6 md:px-12 lg:px-24 mb-32">
                        <div className="bg-white/40 rounded-[60px] overflow-hidden flex flex-col md:flex-row items-center border border-[#2D2924]/5 shadow-sm min-h-[600px]">
                            <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col items-start">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <h1 className="text-5xl md:text-7xl font-serif text-[#2D2924] mb-4">
                                        <AutoTranslatedText text={config.hero?.title || product.title} />
                                    </h1>
                                    <div className="flex items-center gap-2 mb-8">
                                        <span className="text-xl md:text-2xl text-[#8B7E66] font-light">
                                            <AutoTranslatedText text={config.hero?.subtitle || "Premium Quality"} />
                                        </span>
                                        <div className="w-2 h-2 bg-[#FF7F7F] rounded-full" />
                                    </div>
                                    <p className="text-[#5C564D] max-w-sm mb-12 leading-relaxed whitespace-pre-line">
                                        <AutoTranslatedText text={config.hero?.description || product.description} />
                                    </p>
                                    <button className="bg-[#8B7E66] text-white px-10 py-4 rounded-full text-xs font-black tracking-widest uppercase hover:bg-[#2D2924] transition-all flex items-center gap-4 group">
                                        <AutoTranslatedText text="지금 구매하기" />
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    
                                    <div className="flex gap-12 mt-16">
                                        {config.hero?.features?.map((f, idx) => {
                                            const Icon = IconMap[f.iconType] || Sparkles;
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-[#8B7E66]">
                                                        <Icon size={18} strokeWidth={1.5} />
                                                    </div>
                                                    <span className="text-[9px] font-black text-[#8B7E66] tracking-widest uppercase"><AutoTranslatedText text={f.label} /></span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="w-full md:w-1/2 aspect-square md:h-full relative p-12">
                                <div className="w-full h-full bg-white/60 rounded-[40px] overflow-hidden flex items-center justify-center">
                                    {config.hero?.imageUrl || product.image_url ? (
                                        <img src={config.hero?.imageUrl || product.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-3/4 h-3/4 bg-gradient-to-br from-[#E8DCCB] to-[#F5F0E8] rounded-2xl shadow-2xl rotate-3" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </EditableWrapper>

                {/* Quote Section */}
                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Narrative Quote" 
                    onEdit={() => openEditSection('quote')}
                >
                    <section className="bg-white/30 py-32 mb-32 border-y border-[#2D2924]/5">
                        <div className="container mx-auto px-6 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-serif text-[#2D2924] leading-relaxed mb-12 whitespace-pre-line">
                                    <AutoTranslatedText text={config.quote?.text || "Story behind the product"} />
                                </h2>
                                <div className="w-12 h-[1px] bg-[#2D2924]/20 mx-auto mb-12" />
                                <p className="text-[#8B7E66] max-w-xl mx-auto leading-loose font-light whitespace-pre-line">
                                    <AutoTranslatedText text={config.quote?.subtext || "Crafted with passion and dedication to quality."} />
                                </p>
                            </motion.div>
                        </div>
                    </section>
                </EditableWrapper>

                {/* Feature Grid */}
                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Features Grid" 
                    onEdit={() => openEditSection('features')}
                    onAdd={() => openEditSection('features')}
                >
                    <section className="container mx-auto px-6 md:px-12 lg:px-24 mb-48">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {config.features?.map((item, idx) => {
                                const Icon = IconMap[item.iconType] || Sparkles;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: idx * 0.2 }}
                                        className="bg-white/40 p-12 rounded-[40px] text-center border border-[#2D2924]/5 hover:bg-white/60 transition-colors group"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#8B7E66] mx-auto mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                            <Icon size={24} strokeWidth={1.2} />
                                        </div>
                                        <h3 className="text-xl font-serif text-[#2D2924] mb-6">{item.title}</h3>
                                        <div className="w-8 h-[1px] bg-[#2D2924]/10 mx-auto mb-6" />
                                        <p className="text-sm text-[#8B7E66] leading-relaxed whitespace-pre-line">
                                            <AutoTranslatedText text={item.description} />
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                </EditableWrapper>

                {/* Recommendation Section */}
                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Recommendations" 
                    onEdit={() => openEditSection('recommendations')}
                    onAdd={() => openEditSection('recommendations')}
                >
                    <section className="container mx-auto px-6 md:px-12 lg:px-24 mb-48 text-center">
                        <h2 className="text-3xl font-serif text-[#2D2924] mb-20">
                            <AutoTranslatedText text="이럴 때 추천해요" />
                            <span className="text-[#FF7F7F]">.</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {config.recommendations?.map((item, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <div className="aspect-[4/3] bg-white/60 rounded-[32px] overflow-hidden mb-6 border border-[#2D2924]/5 group-hover:shadow-lg transition-all">
                                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="bg-white/40 p-8 rounded-[24px] border border-[#2D2924]/5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8B7E66]">
                                            <div className="w-4 h-4 bg-[#8B7E66]/20 rounded-full flex items-center justify-center">
                                                <Droplets size={12} />
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-[#2D2924] mb-1">{item.title}</h4>
                                            <p className="text-[10px] text-[#8B7E66] leading-relaxed whitespace-pre-line">
                                                <AutoTranslatedText text={item.description} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </EditableWrapper>

                {/* Usage Section */}
                <EditableWrapper 
                    canEdit={canEdit} 
                    label="Usage Steps" 
                    onEdit={() => openEditSection('usage')}
                >
                    <section className="container mx-auto px-6 md:px-12 lg:px-24 mb-48">
                        <div className="bg-white/40 rounded-[60px] overflow-hidden flex flex-col md:flex-row border border-[#2D2924]/5">
                            <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center">
                                <h2 className="text-3xl font-serif text-[#2D2924] mb-8"><AutoTranslatedText text={config.usage?.title || "How to use"} /></h2>
                                <div className="w-12 h-[1px] bg-[#2D2924]/20 mb-8" />
                                <p className="text-[#5C564D] leading-loose whitespace-pre-line">
                                    <AutoTranslatedText text={config.usage?.description || "Follow these steps for best results."} />
                                </p>
                            </div>
                            <div className="w-full md:w-1/2 aspect-video md:aspect-auto bg-white/60">
                                {config.usage?.imageUrl && <img src={config.usage.imageUrl} alt="" className="w-full h-full object-cover" />}
                            </div>
                        </div>
                    </section>
                </EditableWrapper>

                {/* Bottom Banner */}
                <section className="bg-white/30 py-24 text-center border-t border-[#2D2924]/5">
                    <h2 className="text-3xl md:text-4xl font-serif text-[#2D2924] mb-4 italic">
                        <AutoTranslatedText text="오늘," />
                    </h2>
                    <h2 className="text-3xl md:text-4xl font-serif text-[#2D2924]">
                        <AutoTranslatedText text="피부에 여유를 더해보세요" />
                        <span className="text-[#FF7F7F]">.</span>
                    </h2>
                </section>
            </main>
            
            <PremiumFooter item={parentProject || product} />
        </div>
    );
};

export default ProjectProductDetailPage;
