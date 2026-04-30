import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Ticket, Calendar, ArrowLeft, MapPin, Clock, Plus, Image as ImageIcon, Type, UploadCloud, Check, Edit3, Sparkles } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { FeaturedItem } from '../types';
import { getProductById, updateProduct } from '../api/products';
import { useFloors } from '../context/FloorContext';
import { useAdmin } from '../hooks/useAdmin';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';

// --- Sub-components for Broadway Billboard ---

const BroadwayTicketCard: React.FC<{ 
    ticket: FeaturedItem, 
    lang: string, 
    isAdmin?: boolean,
    onEdit?: () => void,
    onDelete?: () => void,
    onClick: () => void 
}> = ({ ticket, lang, isAdmin, onEdit, onDelete, onClick }) => {
    const { t } = useTranslation();
    const getLoc = (val: any, l: string): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[l] || val['ko'] || '';
    };

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative group cursor-pointer overflow-hidden rounded-[2rem] bg-white border border-black/10 transition-all duration-500 shadow-lg"
        >
            {/* Animated Light Border */}
            <div className="absolute inset-0 z-10 pointer-events-none border-2 border-dashed border-red-600/10 opacity-0 group-hover:opacity-100 animate-[pulse_2s_infinite] rounded-[2rem]" />
            
            {/* Broadway Lights */}
            <div className="absolute top-4 left-4 right-4 h-2 flex justify-between px-4 z-20 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-600/20 group-hover:bg-red-600 group-hover:animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.3)]" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>

            {/* Content Preview */}
            <div className="h-64 relative overflow-hidden">
                <img src={ticket.imageUrl} alt={getLoc(ticket.title, lang)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-8 left-6 px-3 py-1 rounded-full bg-black/5 border border-black/10 backdrop-blur-sm">
                        <AutoTranslatedText text={t('ticket.live_show')} />
                </div>
            </div>

            {/* Ticket Info */}
            <div className="p-8 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-black uppercase tracking-tighter leading-tight group-hover:text-red-600 transition-colors whitespace-pre-wrap break-keep">
                        <AutoTranslatedText text={getLoc(ticket.title, lang)} />
                    </h3>
                    <div className="flex items-center gap-2 text-black/40">
                        <MapPin size={12} className="text-red-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{getLoc(ticket.location, lang)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-black/5">
                    <div className="space-y-1">
                            <AutoTranslatedText text={t('ticket.performance_date')} />
                        <div className="flex items-center gap-2 text-black/40">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase">{getLoc(ticket.date, lang)}</span>
                        </div>
                    </div>
                    <div className="text-right">
                            <AutoTranslatedText text={t('ticket.entry_fee')} />
                        <div className="text-lg font-black text-red-600">{getLoc(ticket.price, lang)}</div>
                    </div>
                </div>

                {/* Decorative Perforation */}
                <div className="absolute bottom-20 -left-3 w-6 h-6 rounded-full bg-[#F2E7D5] border border-black/10" />
                <div className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-[#F2E7D5] border border-black/10" />
            </div>

            {/* Admin Controls */}
            {isAdmin && (
                <div className="absolute top-8 right-6 z-30 flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                        className="w-8 h-8 rounded-full bg-white/80 border border-black/10 flex items-center justify-center text-black/40 hover:text-black hover:bg-white transition-all shadow-sm"
                    >
                        <Type size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="w-8 h-8 rounded-full bg-white/80 border border-black/10 flex items-center justify-center text-black/40 hover:text-red-600 hover:bg-red-600/10 transition-all shadow-sm"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
            
            {/* Reserve Button overlay */}
            <div className="h-1.5 bg-black/5 group-hover:bg-red-600 transition-colors" />
        </motion.div>
    );
};

const ReservationModal: React.FC<{
    ticket: FeaturedItem | null,
    isOpen: boolean,
    onClose: () => void,
    quantity: number,
    setQuantity: (q: number) => void,
    onConfirm: () => void,
    isReserving: boolean,
    reservationComplete: boolean,
    lang: string
}> = ({ ticket, isOpen, onClose, quantity, setQuantity, onConfirm, isReserving, reservationComplete, lang }) => {
    const { t } = useTranslation();
    if (!ticket) return null;

    const getLoc = (val: any, l: string): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[l] || val['ko'] || '';
    };

    const priceNum = parseInt(getLoc(ticket.price, 'ko').replace(/[^0-9]/g, '')) || 0;
    const totalPrice = priceNum * quantity;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[30000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ y: 50, scale: 0.9, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 50, scale: 0.9, opacity: 0 }}
                        className="bg-[#F2E7D5] border border-black/10 w-full max-w-4xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative text-black"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-8 right-8 z-[30010] w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 transition-all shadow-sm"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-full md:w-1/2 h-full bg-black relative group overflow-hidden">
                            <img src={ticket.imageUrl} alt={getLoc(ticket.title, lang)} className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F2E7D5] via-transparent to-transparent" />
                            
                            <div className="absolute bottom-12 left-12 right-12">
                                    <AutoTranslatedText text={t('ticket.official_selection')} />
                                <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter leading-tight mb-4">
                                    <AutoTranslatedText text={getLoc(ticket.title, lang)} />
                                </h2>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-black/60">
                                        <MapPin size={14} className="text-red-600" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{getLoc(ticket.location, lang)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-black/60">
                                        <Clock size={14} className="text-red-600" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{getLoc(ticket.date, lang)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 h-full p-12 flex flex-col justify-between border-l border-black/5">
                            <div className="space-y-10">
                                <div>
                                        <AutoTranslatedText text={t('ticket.event_details')} />
                                    <p className="text-sm text-black/60 font-medium leading-[1.8]">
                                        <AutoTranslatedText text={getLoc(ticket.description, lang) || 'We invite you to a special performance where artisan breath and traditional values harmonize. We promise the best impression.'} />
                                    </p>
                                </div>

                                <div className="p-8 rounded-3xl bg-white border border-black/10 space-y-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                            <AutoTranslatedText text={t('ticket.ticket_quantity')} />
                                        <div className="flex items-center gap-6 bg-black/5 border border-black/10 rounded-full px-6 py-3">
                                            <button 
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="text-black/40 hover:text-black transition-colors font-bold"
                                            >-</button>
                                            <span className="text-xl font-black text-black w-8 text-center">{quantity}</span>
                                            <button 
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="text-black/40 hover:text-black transition-colors font-bold"
                                            >+</button>
                                        </div>
                                    </div>

                                    <div className="h-[1px] w-full bg-black/5" />

                                    <div className="flex items-center justify-between">
                                            <AutoTranslatedText text={t('ticket.total_payable')} />
                                        <div className="text-3xl font-black text-red-600">
                                            ₩{totalPrice.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button 
                                    onClick={onConfirm}
                                    disabled={isReserving || reservationComplete}
                                    className="w-full py-6 rounded-2xl bg-black text-white font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden group active:scale-95 transition-all disabled:opacity-50 hover:bg-red-600 shadow-xl"
                                >
                                    <AnimatePresence mode="wait">
                                        {isReserving ? (
                                            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                <AutoTranslatedText text={t('common.processing')} />
                                            </motion.div>
                                        ) : reservationComplete ? (
                                            <motion.div key="complete" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                <Check size={18} />
                                                <AutoTranslatedText text={t('ticket.reservation_complete')} />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                <Ticket size={18} />
                                                <AutoTranslatedText text={t('ticket.confirm_reservation')} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                                     <p className="text-[10px] text-black/40 text-center uppercase tracking-widest">
                                        <AutoTranslatedText text={t('ticket.security_delivery_msg')} />
                                     </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
interface VirtualTicketPageProps {
    item?: any;
    productId?: string;
    onClose?: () => void;
}

export const VirtualTicketPage: React.FC<VirtualTicketPageProps> = ({ item: propItem, productId: propProductId, onClose }) => {
    useImmersiveMode(true);
    const { t, i18n } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    
    const parentId = paramId || propProductId || propItem?.id || location.state?.parentId;
    const [selectedTicket, setSelectedTicket] = useState<FeaturedItem | null>(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [reservationComplete, setReservationComplete] = useState(false);
    const [quantity, setQuantity] = useState(1);
    
    const { isAdmin: isAdminLoggedIn, role, user } = useAdmin();
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);
    const { floors } = useFloors();

    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDesc, setTempDesc] = useState('');

    const isManagementAllowed = isAdminLoggedIn || (role === 'agency' && String(parentProduct?.agency_id) === String(user?.id));

    const currentFloor = floors.find(f => f.floor.toLowerCase() === parentProduct?.category?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === parentProduct?.subcategory);
    const floorNum = parentProduct?.category?.replace('floor-', '') || currentFloor?.floor?.replace('F', '').replace('f', '') || '';
    const floorLabel = floorNum ? `Floor-${floorNum}` : (currentFloor?.floor || parentProduct?.category || '');

    useSetBreadcrumbPath(parentProduct ? [
        { id: currentFloor?.floor || parentProduct.category, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || parentProduct.subcategory, label: currentCategory?.label || parentProduct.subcategory, type: 'category' },
        { id: 'detail', label: t('common.details'), type: 'detail' },
        { id: parentProduct.id, label: parentProduct.title, type: 'detail' },
        { id: 'ticket', label: <AutoTranslatedText text={t('ticket.virtual_ticket')} />, type: 'template' }
    ] : []);

    useEffect(() => {
        const fetchParent = async () => {
            if (parentId) {
                const data = await getProductById(parentId);
                if (data) {
                    setParentProduct(data);
                    
                    const selectedTemplatesRaw = typeof data.selected_templates === 'string' 
                        ? JSON.parse(data.selected_templates) 
                        : (data.selected_templates as any);
                    
                    const templates = Array.isArray(selectedTemplatesRaw) 
                        ? selectedTemplatesRaw 
                        : (typeof selectedTemplatesRaw === 'object' && selectedTemplatesRaw !== null
                            ? Object.entries(selectedTemplatesRaw).map(([id, val]: [string, any]) => ({
                                id,
                                status: val.status || 'visible',
                                title: val.title,
                                description: val.description
                            }))
                            : []);

                    const ticketMeta = templates.find((t: any) => t.id === 'ticket');
                    setTempTitle(ticketMeta?.title?.ko || (typeof ticketMeta?.title === 'string' ? ticketMeta.title : '') || t("ticket.ticket_booth"));
                    setTempDesc(ticketMeta?.description?.ko || (typeof ticketMeta?.description === 'string' ? ticketMeta.description : '') || t("ticket.booth_desc"));
                }
            }
        };
        fetchParent();
    }, [parentId, i18n.language]);


    const [ticketItems, setTicketItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ title: '', date: '', imageUrl: '' });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeCategory, setActiveCategory] = useState('ALL');

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const effectiveParentId = parentId; 
            const url = effectiveParentId 
                ? `/api/products/category/ticket?parentId=${effectiveParentId}`
                : '/api/products/category/ticket';
            const response = await fetch(url);
            const data = await response.json();
            const normalizedData = data.map((dbItem: any) => ({
                id: dbItem.id,
                title: typeof dbItem.title === 'string' ? JSON.parse(dbItem.title) : dbItem.title,
                category: dbItem.category,
                description: typeof dbItem.description === 'string' ? JSON.parse(dbItem.description) : dbItem.description,
                imageUrl: dbItem.image_url,
                date: typeof dbItem.event_date === 'string' ? JSON.parse(dbItem.event_date) : dbItem.event_date,
                location: typeof dbItem.location === 'string' ? JSON.parse(dbItem.location) : dbItem.location,
                price: dbItem.price
            }));
            setTicketItems(normalizedData);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [location.state?.parentId]);

    useEffect(() => {
        if (!isLoading && ticketItems.length > 0 && location.state?.initialId) {
            const initialItem = ticketItems.find(item => item.id === location.state.initialId);
            if (initialItem) {
                setSelectedTicket(initialItem);
                setQuantity(1);
                setShowReservationModal(true);
            }
        }
    }, [isLoading, ticketItems, location.state]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditInitiate = (item: FeaturedItem) => {
        setEditingItemId(item.id);
        const titleKo = typeof item.title === 'string' ? item.title : item.title?.ko || '';
        const dateKo = typeof item.date === 'string' ? item.date : item.date?.ko || '';
        setNewTicket({ title: titleKo, date: dateKo, imageUrl: item.imageUrl });
        setPreviewUrl(null);
        setIsEditMode(true);
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        const confirmMsg = t('common.delete_confirm');
        if (!window.confirm(confirmMsg)) return;
        try {
            const adminToken = sessionStorage.getItem('admin_token');
            const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (response.ok) {
                const successMsg = t('common.deleted_msg');
                alert(successMsg);
                fetchItems();
            } else {
                const err = await response.json();
                const failMsg = t('common.delete_failed');
                alert(`${failMsg}: ${err.message || 'Error'}`);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            const errorMsg = t('common.server_error');
            alert(errorMsg);
        }
    };

    const handleSaveTicket = async () => {
        if (!newTicket.title) {
            const msg = await translateAsync('행사 명칭을 입력해주세요.');
            alert(msg);
            return;
        }

        try {
            let finalImageUrl = newTicket.imageUrl;
            const adminToken = sessionStorage.getItem('admin_token');

            if (fileInputRef.current?.files?.[0]) {
                try {
                    const formData = new FormData();
                    formData.append('file', fileInputRef.current.files[0]);
                    const uploadRes = await fetch('/api/upload', { 
                        method: 'POST', 
                        body: formData,
                        headers: { 'Authorization': `Bearer ${adminToken}` }
                    });
                    if (!uploadRes.ok) throw new Error('Upload failed');
                    const uploadData = await uploadRes.json();
                    finalImageUrl = uploadData.url;
                } catch (error) {
                    console.error('Upload failed:', error);
                    const msg = await translateAsync('이미지 업로드에 실패했습니다.');
                    alert(msg);
                    return;
                }
            }

            const itemData = {
                id: isEditMode ? editingItemId : `ticket-${Date.now()}`,
                title: { ko: newTicket.title, en: newTicket.title },
                category: 'ticket',
                subcategory: 'general',
                description: { ko: '', en: '' },
                image_url: finalImageUrl,
                event_date: { ko: newTicket.date || 'Reservation Open', en: newTicket.date || 'Reservation Open' },
                location: { ko: 'Main Hall', en: 'Main Hall' },
                price: '₩0',
                parent_id: location.state?.parentId || null
            };

            const res = await fetch(isEditMode ? `/api/products/${encodeURIComponent(editingItemId!)}` : '/api/products', {
                method: isEditMode ? 'PUT' : 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(itemData)
            });
            if (res.ok) {
                const successMsg = await translateAsync(isEditMode ? '수정 성공' : '등록 성공');
                alert(successMsg);
                await fetchItems();
                setIsEditMode(false);
                setEditingItemId(null);
                setNewTicket({ title: '', date: '', imageUrl: '' });
                setPreviewUrl(null);
                setShowAddModal(false);
            } else {
                const errorData = await res.json();
                const failMsg = await translateAsync('요청 실패');
                alert(`${failMsg}: ${errorData.message || 'Error'}`);
            }
        } catch (error) {
            console.error('Operation failed:', error);
            const msg = await translateAsync('서버 연결에 실패했습니다.');
            alert(msg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleReservation = () => {
        setIsReserving(true);
        setTimeout(() => {
            setIsReserving(false);
            setReservationComplete(true);
            setTimeout(() => {
                setReservationComplete(false);
                setShowReservationModal(false);
            }, 2000);
        }, 2000);
    };

    const handleSaveMetadata = async () => {
        if (!parentProduct || !parentId) return;
        
        try {
            const selectedTemplatesRaw = typeof parentProduct.selected_templates === 'string' 
                ? JSON.parse(parentProduct.selected_templates) 
                : (parentProduct.selected_templates as any) || [];
            
            let templates = Array.isArray(selectedTemplatesRaw) 
                ? selectedTemplatesRaw 
                : (typeof selectedTemplatesRaw === 'object' && selectedTemplatesRaw !== null
                    ? Object.entries(selectedTemplatesRaw).map(([id, val]: [string, any]) => ({
                        id,
                        status: val.status || 'visible',
                        title: val.title,
                        description: val.description
                    }))
                    : []);

            const hasTicket = templates.some((t: any) => t.id === 'ticket');
            
            const updatedTemplates = hasTicket 
                ? templates.map((t: any) => t.id === 'ticket' ? {
                    ...t,
                    title: { ...(typeof t.title === 'object' ? t.title : {}), ko: tempTitle },
                    description: { ...(typeof t.description === 'object' ? t.description : {}), ko: tempDesc }
                } : t)
                : [...templates, {
                    id: 'ticket',
                    status: 'visible',
                    title: { ko: tempTitle },
                    description: { ko: tempDesc }
                }];
            
            const updatedProduct = {
                ...parentProduct,
                selected_templates: updatedTemplates
            };
            
            await updateProduct(parentId, updatedProduct);
            setParentProduct(updatedProduct as any);
            setIsEditingMetadata(false);
            const successMsg = await translateAsync('변경사항이 저장되었습니다.');
            alert(successMsg);
        } catch (error) {
            console.error('Failed to save metadata:', error);
            const errorMsg = await translateAsync('저장에 실패했습니다.');
            alert(errorMsg);
        }
    };

return (
        <div className="min-h-screen font-sans overflow-hidden bg-[#F2E7D5] text-black">
            <header className="relative w-full py-16 md:py-24 px-6 md:px-12 border-b border-black/10 z-[50]">
                <div className="container mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-10 relative z-[60]">
                        <button 
                            onClick={() => {
                                if (onClose) {
                                    onClose();
                                } else if (window.history.state && window.history.state.idx > 0) {
                                    navigate(-1);
                                } else if (parentId) {
                                    navigate(`/detail/${parentId}`);
                                } else if (currentFloor) {
                                    navigate(`/inspiration?floor=${currentFloor.floor.toLowerCase()}`);
                                } else {
                                    navigate('/inspiration');
                                }
                            }}
                            className="flex items-center gap-3 text-black/40 hover:text-black transition-opacity uppercase text-[10px] font-black tracking-[0.4em] relative z-[60]"
                        >
                            <ArrowLeft size={16} />
                            <AutoTranslatedText text={t('common.back')} />
                        </button>

                        {isManagementAllowed && (
                            <div className="flex gap-2 relative z-[70]">
                                <button 
                                    onClick={() => {
                                        if (isEditingMetadata) {
                                            handleSaveMetadata();
                                        } else {
                                            setIsEditingMetadata(true);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-black/10 hover:bg-black hover:text-white transition-all text-[10px] font-black tracking-widest uppercase shadow-sm"
                                >
                                    {isEditingMetadata ? <Check size={14} /> : <Edit3 size={14} />}
                                    <AutoTranslatedText text={isEditingMetadata ? t("common.save") : t("common.edit_info")} />
                                </button>
                                {isEditingMetadata && (
                                    <button 
                                        onClick={() => setIsEditingMetadata(false)}
                                        className="p-2 rounded-full border border-black/10 hover:bg-black/5 text-black/40"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => { setIsEditMode(false); setNewTicket({ title: '', date: '', imageUrl: '' }); setShowAddModal(true); }}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-black/10 hover:bg-black hover:text-white transition-all text-[10px] font-black tracking-widest uppercase shadow-sm"
                                >
                                    <Plus size={14} />
                                    <AutoTranslatedText text={t('ticket.add_event')} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-4 mb-6">
                                <Link 
                                    to={currentFloor ? `/inspiration?floor=${currentFloor.floor.toLowerCase()}` : '/inspiration'}
                                    className="px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm bg-white border border-black/10 hover:bg-black hover:text-white transition-all uppercase relative z-[60] text-black">
                                    <AutoTranslatedText text={t('common.archive')} /> {floorLabel}
                                </Link>
                                <div className="h-[1px] w-20 bg-black/5" />
                            </div>
                            
                            {isEditingMetadata ? (
                                <textarea 
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="w-full bg-white border border-black/10 rounded-2xl p-4 text-4xl md:text-5xl font-black mb-10 text-black focus:outline-none focus:border-red-600 transition-all resize-none shadow-xl"
                                    rows={2}
                                />
                            ) : (
                                <h1 className="text-5xl md:text-9xl font-black mb-10 leading-[0.8] tracking-tighter uppercase whitespace-pre-wrap break-keep text-black">
                                    <AutoTranslatedText text={tempTitle} />
                                </h1>
                            )}
                            
                            {isEditingMetadata ? (
                                <textarea 
                                    value={tempDesc}
                                    onChange={(e) => setTempDesc(e.target.value)}
                                    className="w-full bg-white border border-black/10 rounded-2xl p-4 text-lg md:text-xl font-serif italic mb-10 text-black focus:outline-none focus:border-red-600 transition-all resize-none shadow-xl"
                                    rows={4}
                                />
                            ) : (
                                <p className="text-xl md:text-2xl font-serif italic text-black/40 max-w-2xl leading-relaxed border-l-4 border-red-600 pl-8">
                                    <AutoTranslatedText text={tempDesc} />
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

              <section id="availability-section" className="relative py-24 px-6 md:px-12 bg-black/5 backdrop-blur-sm">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-black/60">
                                <Sparkles size={16} className="text-red-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]"><AutoTranslatedText text={t('ticket.current_season')} /></span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase leading-none">
                                <AutoTranslatedText text={t('ticket.now_available')} />
                            </h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="h-px w-12 bg-red-600" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
                                <AutoTranslatedText text={t('ticket.premium_selection_msg')} />
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-16 p-2 rounded-[2rem] bg-black/5 w-fit border border-black/10">
                        {['ALL', 'MUSICAL', 'TRADITION', 'EXHIBITION'].map((cat) => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-8 py-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-all shadow-sm ${
                                    activeCategory === cat 
                                    ? 'bg-black text-white' 
                                    : 'bg-white border border-black/10 text-black/40 hover:bg-black hover:text-white'
                                }`}
                            >
                                <AutoTranslatedText text={cat === 'ALL' ? t('common.all') : cat} />
                            </button>
                        ))}
                    </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-96 rounded-3xl bg-[#1a1a1a] border border-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : ticketItems.length === 0 ? (
                         <AutoTranslatedText text={t('ticket.no_events')} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {ticketItems.map((ticket) => (
                            <BroadwayTicketCard 
                                key={ticket.id} 
                                ticket={ticket} 
                                lang={i18n.language}
                                isAdmin={isManagementAllowed}
                                onEdit={() => handleEditInitiate(ticket)}
                                onDelete={() => handleDelete(ticket.id)}
                                onClick={() => {
                                    setSelectedTicket(ticket);
                                    setQuantity(1);
                                    setShowReservationModal(true);
                                }}
                            />
                        ))}
                    </div>
                )}
                </div>
            </section>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[40000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#F2E7D5] border border-black/10 w-full max-w-2xl rounded-[3rem] p-12 text-black shadow-2xl relative overflow-y-auto max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-8 right-8 z-[30010] w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 transition-all shadow-sm"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">
                                 <AutoTranslatedText text={isEditMode ? t('ticket.edit_event') : t('ticket.add_new_event')} />
                            </h2>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block">
                                         <AutoTranslatedText text={t('common.title')} />
                                    </label>
                                    <input 
                                        type="text"
                                        value={newTicket.title}
                                        onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                                        className="w-full bg-white border border-black/10 rounded-2xl px-6 py-4 text-black focus:outline-none focus:border-red-600 transition-all shadow-sm"
                                        placeholder="Broadway Musical..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block">
                                         <AutoTranslatedText text={t('common.date')} />
                                    </label>
                                    <div className="relative">
                                        <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                                        <input 
                                            type="text"
                                            value={newTicket.date}
                                            onChange={(e) => setNewTicket({...newTicket, date: e.target.value})}
                                            placeholder="2026.04.15 ~ 2026.04.30"
                                            className="w-full bg-white border border-black/10 rounded-2xl py-4 pl-14 pr-6 text-black focus:outline-none focus:border-red-600 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block">
                                         <AutoTranslatedText text={t('common.image_url')} />
                                    </label>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <ImageIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                                            <input 
                                                type="text"
                                                value={newTicket.imageUrl}
                                                onChange={(e) => {
                                                    setNewTicket({...newTicket, imageUrl: e.target.value});
                                                    if (previewUrl) setPreviewUrl(null);
                                                }}
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full bg-white border border-black/10 rounded-2xl py-4 pl-14 pr-6 text-black focus:outline-none focus:border-red-600 transition-all shadow-sm"
                                            />
                                        </div>

                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                        
                                        {!previewUrl && !newTicket.imageUrl ? (
                                            <button 
                                                onClick={() => fileInputRef.current?.click()} 
                                                className="w-full flex flex-col items-center justify-center p-12 rounded-[2rem] border-2 border-dashed border-black/10 hover:border-red-600/30 hover:bg-black/5 transition-all group"
                                            >
                                                <UploadCloud size={40} className="text-black/20 group-hover:text-red-600 mb-4 transition-colors" />
                                                <span className="text-xs font-bold text-black/40 group-hover:text-black">
                                                    <AutoTranslatedText text="Upload Thumbnail Image" />
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="relative rounded-[2rem] overflow-hidden border border-black/10 group shadow-lg">
                                                <img src={previewUrl || newTicket.imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewUrl(null);
                                                            setNewTicket({...newTicket, imageUrl: ''});
                                                        }} 
                                                        className="px-6 py-3 rounded-full bg-red-600 text-white text-[10px] font-black tracking-widest uppercase hover:bg-red-700 shadow-xl"
                                                    >
                                                        <AutoTranslatedText text="Remove & Replace" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={handleSaveTicket}
                                        disabled={isUploading}
                                        className="flex-1 py-6 rounded-2xl bg-black text-white font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                <AutoTranslatedText text={t('common.processing')} />
                                            </div>
                                        ) : (
                                            <AutoTranslatedText text={isEditMode ? t('common.save_changes') : t('ticket.add_event')} />
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-6 rounded-2xl bg-white border border-black/10 text-black font-black text-sm uppercase tracking-widest hover:bg-black/5 transition-all shadow-sm active:scale-95"
                                    >
                                        <AutoTranslatedText text={t('common.cancel')} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ticket Footer */}
            <footer className="mt-40 border-t border-black/10 py-20 px-6">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
                    <div className="flex flex-col gap-6">
                        <div className="text-4xl font-black tracking-tighter text-black/10 uppercase"><AutoTranslatedText text="몽땅쏙 TICKETS" /></div>
                        <p className="text-[9px] font-bold tracking-[0.5em] text-black/30 uppercase max-w-sm leading-loose">
                            <AutoTranslatedText text="Certified Virtual Ticketing Infrastructure for premium cultural heritage events." />
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex flex-col items-center gap-4 cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all shadow-sm">
                             <div className="w-1 h-1 rounded-full bg-black opacity-40 group-hover:bg-white group-hover:h-8 transition-all" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest uppercase text-black/40 group-hover:text-black transition-opacity"><AutoTranslatedText text="Back to Top" /></span>
                    </button>
                </div>
            </footer>

            {/* Broadway Reservation Modal */}
            <ReservationModal 
                ticket={selectedTicket}
                isOpen={showReservationModal}
                onClose={() => setShowReservationModal(false)}
                quantity={quantity}
                setQuantity={setQuantity}
                onConfirm={handleReservation}
                isReserving={isReserving}
                reservationComplete={reservationComplete}
                lang={i18n.language}
            />
        </div>
    );
};

export default VirtualTicketPage;
