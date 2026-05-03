import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit3, Check, Users, Clock, ShoppingCart, Plus, Calendar } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { FeaturedItem } from '../types';
import { getProductById, updateProduct } from '../api/products';
import { useAdmin } from '../hooks/useAdmin';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { useFloors } from '../context/FloorContext';

interface GroupBuyData {
    targetParticipants: number;
    currentParticipants: number;
    deadline: string; // ISO String
}

const parseGroupBuyData = (longDesc: string | Record<string, any> | undefined): GroupBuyData => {
    try {
        if (!longDesc) return { targetParticipants: 0, currentParticipants: 0, deadline: '' };
        
        let targetStr = '';
        if (typeof longDesc === 'string') {
            targetStr = longDesc;
        } else if (longDesc.ko) {
            targetStr = longDesc.ko;
        } else if (longDesc.en) {
            targetStr = longDesc.en;
        }

        if (targetStr.startsWith('{')) {
            const parsed = JSON.parse(targetStr);
            return {
                targetParticipants: parsed.targetParticipants || parsed.target || 10,
                currentParticipants: parsed.currentParticipants || parsed.current || 0,
                deadline: parsed.deadline || ''
            };
        }
    } catch (e) {
        console.error('Failed to parse group buy data:', e);
    }
    return { targetParticipants: 10, currentParticipants: 0, deadline: new Date(Date.now() + 86400000).toISOString() };
};

const stringifyGroupBuyData = (data: GroupBuyData): string => {
    return JSON.stringify(data);
};

const CountdownTimer: React.FC<{ deadline: string }> = ({ deadline }) => {
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

    useEffect(() => {
        if (!deadline) return;
        const targetDate = new Date(deadline).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                clearInterval(interval);
            } else {
                setTimeLeft({
                    d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [deadline]);

    if (!timeLeft) return <div className="text-white/50 text-[10px] tracking-widest"><AutoTranslatedText text="마감일 미정" /></div>;

    const isExpired = timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0;

    return (
        <div className={`flex items-center gap-2 font-mono text-sm tracking-card transition-colors ${isExpired ? 'text-red-600' : 'text-black'}`}>
            <Clock size={14} className={isExpired ? 'opacity-50' : 'animate-pulse text-red-500'} />
            {isExpired ? (
                <AutoTranslatedText text="마감됨 (Ended)" />
            ) : (
                <span>{timeLeft.d}d {timeLeft.h.toString().padStart(2, '0')}:{timeLeft.m.toString().padStart(2, '0')}:{timeLeft.s.toString().padStart(2, '0')}</span>
            )}
        </div>
    );
};

// --- Main Page Component ---
interface VirtualGroupBuyPageProps {
    item?: any;
    productId?: string;
    onClose?: () => void;
}

const VirtualGroupBuyPage: React.FC<VirtualGroupBuyPageProps> = ({ item: propItem, productId: propProductId, onClose }) => {
    useImmersiveMode(false);
    const { i18n, t } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const { id: routeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const parentId = routeId || propProductId || propItem?.id || location.state?.parentId;
    const { isAdmin, role, user } = useAdmin();
    const { floors } = useFloors();

    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);
    const isManagementAllowed = isAdmin || (role === 'agency' && String(parentProduct?.agency_id) === String(user?.id));

    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDesc, setTempDesc] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        targetParticipants: 10,
        deadline: '',
        imageUrl: ''
    });

    // Checkout / Processing Auth
    const [processingId, setProcessingId] = useState<string | null>(null);

    const getLoc = (val: any, lang: string): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[lang] || val['ko'] || '';
    };

    const currentFloor = floors.find(f => f.floor.toLowerCase() === parentProduct?.category?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === parentProduct?.subcategory);
    const floorLabel = parentProduct?.category || '';

    useSetBreadcrumbPath(parentProduct ? [
        { id: currentFloor?.floor || parentProduct.category, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || parentProduct.subcategory, label: currentCategory?.label || parentProduct.subcategory, type: 'category' },
        { id: 'detail', label: t('common.details'), type: 'detail' },
        { id: parentProduct.id, label: getLoc(parentProduct.title, i18n.language), type: 'detail' },
                { id: 'groupbuy', label: <AutoTranslatedText text="공동구매" />, type: 'template' }
    ] : []);

    useEffect(() => {
        const fetchMetadata = async () => {
            if (!parentId) return;
            try {
                const data = await getProductById(parentId);
                if (data) {
                    setParentProduct(data);
                    const selectedTemplatesRaw = typeof data.selected_templates === 'string'
                        ? JSON.parse(data.selected_templates)
                        : (data.selected_templates as any) || [];

                    let templates = Array.isArray(selectedTemplatesRaw) ? selectedTemplatesRaw : Object.entries(selectedTemplatesRaw).map(([id, val]: any) => ({ id, ...val }));
                    const meta = templates.find((t: any) => t.id === 'groupbuy');
                    
                    setTempTitle(meta?.title?.ko || (typeof meta?.title === 'string' ? meta.title : '') || '프리미엄 공동구매');
                    setTempDesc(meta?.description?.ko || (typeof meta?.description === 'string' ? meta.description : '') || '목표 인원이 달성되면 특별한 가격으로 구매가 확정됩니다.');
                }
            } catch (error) {
                console.error("Failed to fetch parent metadata:", error);
            }
        };
        fetchMetadata();
    }, [parentId]);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const url = parentId
                ? `/api/products/category/groupbuy?parentId=${parentId}`
                : '/api/products/category/groupbuy';

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setItems(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch groupbuy items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [parentId, i18n.language]);

    const handleSaveMetadata = async () => {
        if (!parentProduct || !parentId) return;
        try {
            const selectedTemplatesRaw = typeof parentProduct.selected_templates === 'string'
                ? JSON.parse(parentProduct.selected_templates)
                : (parentProduct.selected_templates as any) || [];

            let templates = Array.isArray(selectedTemplatesRaw) ? selectedTemplatesRaw : Object.entries(selectedTemplatesRaw).map(([id, val]: any) => ({ id, ...val }));
            const hasMeta = templates.some((t: any) => t.id === 'groupbuy');

            const updatedTemplates = hasMeta
                ? templates.map((t: any) => t.id === 'groupbuy' ? {
                    ...t,
                    title: { ko: tempTitle },
                    description: { ko: tempDesc }
                } : t)
                : [...templates, {
                    id: 'groupbuy',
                    status: 'visible',
                    title: { ko: tempTitle },
                    description: { ko: tempDesc }
                }];

            const updatedProduct = { ...parentProduct, selected_templates: updatedTemplates };
            await updateProduct(parentId, updatedProduct);
            setParentProduct(updatedProduct as any);
            setIsEditingMetadata(false);
            alert(t('common.save_success'));
        } catch (error) {
            alert(t('common.save_fail'));
        }
    };

    const handleAddItem = async () => {
        if (!formData.title || !formData.imageUrl || !formData.deadline) {
            const msg = await translateAsync("상품명, 이미지 URL, 마감 기한을 모두 입력해주세요.");
            alert(msg);
            return;
        }

        try {
            const groupBuyData: GroupBuyData = {
                targetParticipants: formData.targetParticipants,
                currentParticipants: 0,
                deadline: new Date(formData.deadline).toISOString()
            };

            const newItem = {
                id: `groupbuy-${Date.now()}`,
                title: { ko: formData.title, en: formData.title },
                category: 'groupbuy',
                description: { ko: '공동구매 상품', en: 'Group Buy Item' },
                long_description: { ko: stringifyGroupBuyData(groupBuyData), en: stringifyGroupBuyData(groupBuyData) },
                image_url: formData.imageUrl,
                thumbnail_url: formData.imageUrl,
                price: formData.price || '₩0',
                parent_id: parentId || null,
                agency_id: user?.id || null
            };

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: JSON.stringify(newItem)
            });

            if (res.ok) {
                const msg = await translateAsync("공동구매 상품이 성공적으로 등록되었습니다.");
                alert(msg);
                setShowAddModal(false);
                fetchItems();
            } else {
                const msg = await translateAsync("등록 실패");
                alert(msg);
            }
        } catch (error) {
            console.error('Create error:', error);
            const msg = await translateAsync("오류가 발생했습니다.");
            alert(msg);
        }
    };

    const handleJoinGroupBuy = async (item: FeaturedItem) => {
        const adminToken = sessionStorage.getItem('admin_token');
        if (!adminToken) {
            const msg = await translateAsync("테스트 환경: 로그인이 필요한 기능입니다.");
            alert(msg);
            return;
        }

        setProcessingId(item.id);
        
        try {
            const gbData = parseGroupBuyData(item.long_description);
            const isClosing = gbData.currentParticipants + 1 >= gbData.targetParticipants;
            
            // 모의: 참여 인원 1 증가
            const updatedGbData = {
                ...gbData,
                currentParticipants: gbData.currentParticipants + 1
            };

            const updatedItem = {
                ...item,
                long_description: { ko: stringifyGroupBuyData(updatedGbData), en: stringifyGroupBuyData(updatedGbData) },
                // Required payload alignments
                image_url: item.imageUrl,
                thumbnail_url: item.thumbnailUrl,
                parent_id: item.parent_id || parentId || null,
            };

            await updateProduct(item.id, updatedItem);
            
            // Re-fetch to sync
            await fetchItems();
            
            if (isClosing) {
                const msg = await translateAsync(`🎉 축하합니다! [${getLoc(item.title, i18n.language)}] 목표 인원이 달성되어 공동구매 결제가 확정되었습니다! (가상 결제 완료)`);
                alert(msg);
            } else {
                const msg = await translateAsync(`✅ 참여 예약이 완료되었습니다! (현재 참여: ${updatedGbData.currentParticipants}명)`);
                alert(msg);
            }
            
        } catch (error) {
            console.error("Failed to join group buy:", error);
            const msg = await translateAsync("참여 처리 중 오류가 발생했습니다.");
            alert(msg);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen font-sans bg-[#FFFFFF]">
            {/* Header */}
            <header className="relative w-full py-16 px-6 md:px-12 border-b border-neutral-200 z-10 bg-white shadow-sm">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => {
                                if (onClose) {
                                    onClose();
                                } else {
                                    navigate(-1);
                                }
                            }}
                            className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-widest text-red-600"
                        >
                            <ArrowLeft size={14} />
                            <AutoTranslatedText text={t('common.back')} />
                        </button>

                        {isManagementAllowed && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => isEditingMetadata ? handleSaveMetadata() : setIsEditingMetadata(true)}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-all text-[10px] font-black tracking-widest uppercase text-black shadow-sm bg-white"
                                >
                                    {isEditingMetadata ? <Check size={14} /> : <Edit3 size={14} />}
                                    <AutoTranslatedText text={isEditingMetadata ? t("common.save") : t("common.edit_info")} />
                                </button>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-transparent bg-[#FF6B6B] hover:bg-[#ff5555] transition-all text-[10px] font-black tracking-widest uppercase text-white shadow-[0_0_20px_rgba(255,107,107,0.3)]"
                                >
                                    <Plus size={14} />
                                                                        <AutoTranslatedText text={t('common.add_product', '상품 추가')} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                        <div className="w-full md:w-2/3">
                                                        <h2 className="text-[10px] font-black tracking-[0.4em] mb-4 uppercase text-red-600"><AutoTranslatedText text="GROUP BUY EVENT" /></h2>
                            {isEditingMetadata ? (
                                <input
                                    type="text"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-4xl/none font-light tracking-tight text-black focus:outline-none focus:border-red-600"
                                />
                            ) : (
                                <h1 className="text-4xl/none md:text-5xl/none font-light tracking-tight text-black">
                                    <AutoTranslatedText text={tempTitle} />
                                </h1>
                            )}

                            {isEditingMetadata ? (
                                <textarea
                                    value={tempDesc}
                                    onChange={(e) => setTempDesc(e.target.value)}
                                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm tracking-relaxed text-black/80 focus:outline-none focus:border-red-600 mt-4 h-24 resize-none"
                                />
                            ) : (
                                <p className="text-sm tracking-relaxed text-black/80 max-w-2xl mt-4 leading-tight">
                                    <AutoTranslatedText text={tempDesc} />
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* List */}
            <main className="relative z-10 container mx-auto px-6 md:px-12 py-16">
                {isLoading ? (
                                        <div className="text-center text-white/50 text-sm tracking-widest uppercase"><AutoTranslatedText text="Loading items..." /></div>
                ) : items.length === 0 ? (
                    <div className="text-center py-24 bg-black/5 rounded-3xl border border-black/10">
                        <ShoppingCart size={48} className="mx-auto text-black/20 mb-6" />
                        <h3 className="text-xl font-light text-black mb-2"><AutoTranslatedText text="등록된 공동구매 상품이 없습니다" /></h3>
                        <p className="text-sm text-black/60"><AutoTranslatedText text="관리자 권한으로 로그인하여 새 공동구매를 열어보세요." /></p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {items.map((item, idx) => {
                                const gbData = parseGroupBuyData(item.long_description);
                                const progressPercentage = Math.min(100, Math.round((gbData.currentParticipants / gbData.targetParticipants) * 100));
                                const isGoalMet = gbData.currentParticipants >= gbData.targetParticipants;
                                const isExpired = new Date(gbData.deadline).getTime() < new Date().getTime();

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group relative bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
                                    >
                                        <div className="aspect-[4/3] overflow-hidden relative">
                                            <img src={item.imageUrl} alt="Group Buy Product" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            {isGoalMet && (
                                                <div className="absolute inset-0 bg-[#FF6B6B] flex flex-col justify-center items-center">
                                                    <Check size={48} className="text-white mb-4" />
                                                    <span className="text-white font-bold tracking-widest text-lg"><AutoTranslatedText text="목표 인원 달성 (공동구매 성공!)" /></span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-xl font-light text-black truncate pr-4">
                                                    <AutoTranslatedText text={getLoc(item.title, i18n.language)} />
                                                </h3>
                                                <div className="text-right flex-shrink-0">
                                                                                                        <span className="text-[10px] uppercase tracking-widest text-red-600 block mb-1"><AutoTranslatedText text="공동구매 특가" /></span>
                                                    <span className="font-mono text-xl text-black">{getLoc(item.price, i18n.language)}</span>
                                                </div>
                                            </div>

                                            {/* Timer */}
                                            <div className="bg-black/5 border border-black/10 rounded-2xl p-4 flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-2 text-black/60 text-[10px] uppercase tracking-widest">
                                                    <Calendar size={14} />
                                                    <AutoTranslatedText text="마감 기한" />
                                                </div>
                                                <CountdownTimer deadline={gbData.deadline} />
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-8">
                                                <div className="flex justify-between text-xs tracking-widest text-black/80 mb-3 uppercase">
                                                                                                        <span><AutoTranslatedText text="참여" />: {gbData.currentParticipants}<AutoTranslatedText text="명" /></span>
                                                    <span className="text-red-600 font-bold"><AutoTranslatedText text="목표" />: {gbData.targetParticipants}<AutoTranslatedText text="명" /></span>
                                                </div>
                                                <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        className="h-full bg-gradient-to-r from-red-600 to-red-400"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressPercentage}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleJoinGroupBuy(item)}
                                                disabled={isGoalMet || isExpired || processingId === item.id}
                                                className={`w-full py-4 rounded-full flex items-center justify-center gap-3 text-sm tracking-widest uppercase transition-all ${
                                                    isGoalMet 
                                                    ? 'bg-black/10 text-black/40 cursor-not-allowed'
                                                    : isExpired
                                                    ? 'bg-red-500/20 border border-red-500/30 text-red-600 cursor-not-allowed'
                                                    : 'bg-black text-white hover:bg-red-600'
                                                }`}
                                            >
                                                <Users size={16} />
                                                {processingId === item.id ? (
                                                                                                        <span><AutoTranslatedText text="처리중..." /></span>
                                                ) : isGoalMet ? (
                                                    <AutoTranslatedText text="참여 마감" />
                                                ) : isExpired ? (
                                                    <AutoTranslatedText text="기간 종료" />
                                                ) : (
                                                    <AutoTranslatedText text="참여 확약하기" />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-xl bg-white border border-neutral-200 rounded-[2.5rem] p-10 shadow-2xl"
                        >
                            <h3 className="text-xl text-black mb-6 font-light tracking-tight"><AutoTranslatedText text="공동구매 상품 추가" /></h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-black/60 block mb-2 tracking-widest"><AutoTranslatedText text="상품명" /></label>
                                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black focus:border-red-600 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-black/60 block mb-2 tracking-widest"><AutoTranslatedText text="이미지 URL" /></label>
                                    <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black focus:border-red-600 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-black/60 block mb-2 tracking-widest"><AutoTranslatedText text="결제 가격 표기" /></label>
                                        <input type="text" placeholder="₩99,000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black focus:border-red-600 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-black/60 block mb-2 tracking-widest"><AutoTranslatedText text="목표 참여 인원" /></label>
                                        <input type="number" value={formData.targetParticipants} onChange={e => setFormData({ ...formData, targetParticipants: parseInt(e.target.value) || 10 })} className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black focus:border-red-600 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-black/60 block mb-2 tracking-widest"><AutoTranslatedText text="마감 기한 (YYYY-MM-DDTHH:mm)" /></label>
                                    <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black focus:border-red-600 outline-none" style={{ colorScheme: 'light' }} />
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-full text-xs font-black tracking-widest uppercase text-black/60 hover:text-black transition-colors"><AutoTranslatedText text="취소" /></button>
                                    <button onClick={handleAddItem} className="px-6 py-3 rounded-full bg-black hover:bg-red-600 text-white text-xs font-black tracking-widest uppercase shadow-lg transition-colors"><AutoTranslatedText text="등록하기" /></button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VirtualGroupBuyPage;
