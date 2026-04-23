import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Ticket, Calendar, ArrowLeft, MapPin, Clock, CreditCard, Info, Plus, Image as ImageIcon, Type, UploadCloud, Check, Edit3 } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { JOSEON_THEMES } from '../utils/themeUtils';
import { FeaturedItem } from '../types';
import { getProductById, updateProduct } from '../api/products';
import { useFloors } from '../context/FloorContext';
import { useAdmin } from '../hooks/useAdmin';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';

// --- Sub-components for Broadway Billboard ---

const BroadwayTicketCard: React.FC<{ 
    ticket: FeaturedItem, 
    theme: any, 
    lang: string, 
    isAdmin?: boolean,
    onEdit?: () => void,
    onDelete?: () => void,
    onClick: () => void 
}> = ({ ticket, theme, lang, isAdmin, onEdit, onDelete, onClick }) => {
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
            className="relative group cursor-pointer overflow-hidden rounded-[2rem] bg-black border-2 transition-all duration-500 shadow-2xl"
            style={{ borderColor: `${theme.accentColor}44` }}
        >
            {/* Animated Light Border */}
            <div className="absolute inset-0 z-10 pointer-events-none border-4 border-dashed border-yellow-500/20 opacity-0 group-hover:opacity-100 animate-[pulse_2s_infinite] rounded-[2rem]" />
            
            {/* Broadway Lights */}
            <div className="absolute top-4 left-4 right-4 h-2 flex justify-between px-4 z-20 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-yellow-400/40 group-hover:bg-yellow-400 group-hover:animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>

            {/* Content Preview */}
            <div className="h-64 relative overflow-hidden">
                <img src={ticket.imageUrl} alt={getLoc(ticket.title, lang)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-8 left-6 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-md">
                    <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500">
                        {t('ticket.live_show')}
                    </span>
                </div>
            </div>

            {/* Ticket Info */}
            <div className="p-8 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-yellow-400 transition-colors whitespace-pre-wrap break-keep">
                        <AutoTranslatedText text={getLoc(ticket.title, lang)} />
                    </h3>
                    <div className="flex items-center gap-2 opacity-40">
                        <MapPin size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{getLoc(ticket.location, lang)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-white/10">
                    <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">
                            {t('ticket.performance_date')}
                        </span>
                        <div className="flex items-center gap-2 text-white/60">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase">{getLoc(ticket.date, lang)}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">
                            {t('ticket.entry_fee')}
                        </span>
                        <div className="text-lg font-black text-yellow-500">{getLoc(ticket.price, lang)}</div>
                    </div>
                </div>

                {/* Decorative Perforation */}
                <div className="absolute bottom-20 -left-3 w-6 h-6 rounded-full bg-[#000] border border-white/10" />
                <div className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-[#000] border border-white/10" />
            </div>

            {/* Admin Controls */}
            {isAdmin && (
                <div className="absolute top-8 right-6 z-30 flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                        className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-yellow-500 hover:text-black transition-all"
                    >
                        <Type size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
            
            {/* Reserve Button overlay */}
            <div className="h-2 bg-yellow-500/20 group-hover:bg-yellow-500 transition-colors" />
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
                    className="fixed inset-0 z-[30000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl"
                >
                    <motion.div
                        initial={{ y: 50, scale: 0.9, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 50, scale: 0.9, opacity: 0 }}
                        className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-8 right-8 z-[30010] w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X size={24} />
                        </button>

                        {/* Image Section */}
                        <div className="w-full md:w-1/2 h-full bg-black relative group overflow-hidden">
                            <img src={ticket.imageUrl} alt={getLoc(ticket.title, lang)} className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                            
                            <div className="absolute bottom-12 left-12 right-12">
                                <span className="text-[10px] font-black tracking-[0.4em] text-yellow-500 uppercase mb-4 block">
                                    {t('ticket.official_selection')}
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                                    <AutoTranslatedText text={getLoc(ticket.title, lang)} />
                                </h2>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <MapPin size={14} className="text-yellow-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{getLoc(ticket.location, lang)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Clock size={14} className="text-yellow-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{getLoc(ticket.date, lang)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="w-full md:w-1/2 h-full p-12 flex flex-col justify-between border-l border-white/5">
                            <div className="space-y-10">
                                <div>
                                    <span className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase mb-4 block">
                                        {t('ticket.event_details')}
                                    </span>
                                    <p className="text-sm text-white/60 font-medium leading-[1.8]">
                                        <AutoTranslatedText text={getLoc(ticket.description, lang) || 'We invite you to a special performance where artisan breath and traditional values harmonize. We promise the best impression.'} />
                                    </p>
                                </div>

                                {/* Ticket Selection */}
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                            {t('ticket.ticket_quantity')}
                                        </span>
                                        <div className="flex items-center gap-6 bg-black border border-white/10 rounded-full px-6 py-3">
                                            <button 
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="text-white/40 hover:text-white transition-colors"
                                            >-</button>
                                            <span className="text-xl font-black text-white w-8 text-center">{quantity}</span>
                                            <button 
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="text-white/40 hover:text-white transition-colors"
                                            >+</button>
                                        </div>
                                    </div>

                                    <div className="h-[1px] w-full bg-white/5" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                            {t('ticket.total_payable')}
                                        </span>
                                        <div className="text-3xl font-black text-yellow-500">
                                            ₩{totalPrice.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button 
                                    onClick={onConfirm}
                                    disabled={isReserving || reservationComplete}
                                    className="w-full py-6 rounded-2xl bg-yellow-500 text-black font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden group active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <AnimatePresence mode="wait">
                                        {isReserving ? (
                                            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                {t('common.processing')}
                                            </motion.div>
                                        ) : reservationComplete ? (
                                            <motion.div key="complete" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                <Check size={18} />
                                                {t('ticket.reservation_complete')}
                                            </motion.div>
                                        ) : (
                                            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                <Ticket size={18} />
                                                {t('ticket.confirm_reservation')}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                                <p className="text-center text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">
                                    {t('ticket.security_delivery_msg')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
const VirtualTicketPage: React.FC = () => {
    useImmersiveMode(true);
    const { t, i18n } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    
    // Determine the effective parent ID (favor params, fallback to state)
    const parentId = paramId || location.state?.parentId;
    const [selectedTicket, setSelectedTicket] = useState<FeaturedItem | null>(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [reservationComplete, setReservationComplete] = useState(false);
    const [quantity, setQuantity] = useState(1);
    
    const { isAdmin: isAdminLoggedIn, role, user } = useAdmin();
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);
    const { floors } = useFloors();

    // Inline Editing for Page Metadata
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDesc, setTempDesc] = useState('');

    const isManagementAllowed = isAdminLoggedIn || (role === 'agency' && String(parentProduct?.agency_id) === String(user?.id));

    // Set Breadcrumb Path
    const currentFloor = floors.find(f => f.floor.toLowerCase() === parentProduct?.category?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === parentProduct?.subcategory);
    const floorNum = parentProduct?.category?.replace('floor-', '') || currentFloor?.floor?.replace('F', '').replace('f', '') || '';
    const floorLabel = floorNum ? `Floor-${floorNum}` : (currentFloor?.floor || parentProduct?.category || '');

    useSetBreadcrumbPath(parentProduct ? [
        { id: currentFloor?.floor || parentProduct.category, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || parentProduct.subcategory, label: currentCategory?.label || parentProduct.subcategory, type: 'category' },
        { id: 'detail', label: t('common.details'), type: 'detail' },
        { id: parentProduct.id, label: parentProduct.title, type: 'detail' },
        { id: 'ticket', label: t('ticket.virtual_ticket'), type: 'template' }
    ] : []);

    useEffect(() => {
        const fetchParent = async () => {
            if (parentId) {
                const data = await getProductById(parentId);
                if (data) {
                    setParentProduct(data);
                    
                    // Initialize temp values from parent metadata if available
                    const selectedTemplatesRaw = typeof data.selected_templates === 'string' 
                        ? JSON.parse(data.selected_templates) 
                        : (data.selected_templates as any);
                    
                    // Standardize as array
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
                    // Always load Korean for the editable fields to ensure consistency
                    setTempTitle(ticketMeta?.title?.ko || (typeof ticketMeta?.title === 'string' ? ticketMeta.title : '') || t("ticket.ticket_booth"));
                    setTempDesc(ticketMeta?.description?.ko || (typeof ticketMeta?.description === 'string' ? ticketMeta.description : '') || t("ticket.booth_desc"));
                }
            }
        };
        fetchParent();
    }, [parentId, i18n.language]);




    // Using "Royal Guard" (index 0) theme for Ticket Booth - formal, striking, and prestigious
    const theme = React.useMemo(() => JOSEON_THEMES[Math.floor(Math.random() * JOSEON_THEMES.length)], []);; 

    const [ticketItems, setTicketItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const effectiveParentId = parentId; // Use calculated parentId
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

    // Handle initial item selection if passed via navigation state
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
        setNewTitle(titleKo);
        const dateKo = typeof item.date === 'string' ? item.date : item.date?.ko || '';
        setNewEventDate(dateKo);
        setNewImageUrl(item.imageUrl);
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

    const handleAddItem = async () => {
        if (!newTitle) {
            const msg = await translateAsync('행사 명칭을 입력해주세요.');
            alert(msg);
            return;
        }

        try {
            let finalImageUrl = newImageUrl;
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

            if (!finalImageUrl) {
                const msg = await translateAsync('이미지 URL을 입력하거나 파일을 업로드해주세요.');
                alert(msg);
                return;
            }

            const itemData = {
                id: isEditMode ? editingItemId : `ticket-${Date.now()}`,
                title: { ko: newTitle, en: newTitle },
                category: 'ticket',
                subcategory: 'general',
                description: { ko: '', en: '' },
                image_url: finalImageUrl,
                event_date: { ko: newEventDate || 'Reservation Open', en: newEventDate || 'Reservation Open' },
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
                setNewTitle('');
                setNewEventDate('');
                setNewImageUrl('');
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
        // Simulate payment process
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
            
            // Standardize as array
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

            // Check if ticket template already exists in the selection
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
        <div className="min-h-screen font-sans overflow-hidden" style={theme.bgStyle}>
            {/* Ticket Header */}
            <header className="relative w-full py-16 md:py-24 px-6 md:px-12 border-b-2 z-[50]" style={{ borderColor: `${theme.accentColor}22` }}>
                <div className="container mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-10 relative z-[60]">
                        <button 
                            onClick={() => {
                                if (window.history.state && window.history.state.idx > 0) {
                                    navigate(-1);
                                } else if (parentId) {
                                    navigate(`/detail/${parentId}`);
                                } else if (currentFloor) {
                                    navigate(`/inspiration?floor=${currentFloor.floor.toLowerCase()}`);
                                } else {
                                    navigate('/inspiration');
                                }
                            }}
                            className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-[0.4em] relative z-[60]"
                            style={{ color: theme.highlightColor }}
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
                                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all text-[10px] font-black tracking-widest uppercase shadow-xl"
                                    style={{ color: theme.highlightColor, borderColor: `${theme.highlightColor}44` }}
                                >
                                    {isEditingMetadata ? <Check size={14} /> : <Edit3 size={14} />}
                                    <AutoTranslatedText text={isEditingMetadata ? t("common.save") : t("common.edit_info")} />
                                </button>
                                {isEditingMetadata && (
                                    <button 
                                        onClick={() => setIsEditingMetadata(false)}
                                        className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-white/40"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => { setIsEditMode(false); setShowAddModal(true); }}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all text-[10px] font-black tracking-widest uppercase shadow-xl"
                                    style={{ color: theme.accentColor, borderColor: `${theme.accentColor}44` }}
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
                                    className="px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all uppercase relative z-[60]" 
                                     style={{ color: theme.highlightColor }}>
                                    {t('common.archive')} {floorLabel}
                                </Link>
                                <div className="h-[1px] w-20 bg-white/10" />
                            </div>
                            
                            {isEditingMetadata ? (
                                <textarea 
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-4xl md:text-5xl font-black mb-10 text-white focus:outline-none focus:border-white transition-all resize-none shadow-2xl"
                                    rows={2}
                                />
                            ) : (
                                <h1 className="text-5xl md:text-9xl font-black mb-10 leading-[0.8] tracking-tighter uppercase whitespace-pre-wrap break-keep" 
                                    style={{ color: theme.highlightColor, textShadow: `0 0 60px ${theme.glowColor}55` }}>
                                    <AutoTranslatedText text={tempTitle} />
                                </h1>
                            )}
                            
                            {isEditingMetadata ? (
                                <textarea 
                                    value={tempDesc}
                                    onChange={(e) => setTempDesc(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-lg md:text-xl font-serif italic mb-10 text-white focus:outline-none focus:border-white transition-all resize-none shadow-2xl"
                                    rows={4}
                                />
                            ) : (
                                <p className="text-xl md:text-2xl font-serif italic opacity-60 max-w-2xl leading-relaxed border-l-4 pl-8" style={{ borderColor: theme.accentColor }}>
                                    <AutoTranslatedText text={tempDesc} />
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-6">
                            <button 
                                onClick={() => {
                                    const element = document.getElementById('availability-section');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden group hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 opacity-10 bg-white transform rotate-45 -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                     <Ticket size={24} className="mb-2 opacity-40 group-hover:scale-110 transition-transform" style={{ color: theme.highlightColor }} />
                                     <span className="text-3xl font-black tracking-tighter" style={{ color: theme.highlightColor }}>{ticketItems.length.toString().padStart(2, '0')}</span>
                                     <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">
                                         {t('ticket.running_events')}
                                     </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Royal Crimson Background Decor */}
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                     <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                     <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                </div>
            </header>

            {/* Event Selection Grid / 3D Layout */}
            <main id="availability-section" className="container mx-auto px-6 md:px-12 py-24">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10">
                    <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center" style={{ color: theme.accentColor }}>
                             <Calendar size={28} />
                         </div>
                         <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">{t('ticket.live_availability')}</h2>
                            <p className="text-[10px] font-bold tracking-[0.4em] opacity-30 uppercase mt-1">
                                {t('ticket.realtime_inventory')}
                            </p>
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-6 px-10 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-[11px] font-black tracking-widest uppercase">{t('ticket.server_online')}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/20" />
                        <span className="text-[11px] font-black tracking-widest uppercase opacity-40">{t('ticket.secure_transaction')}</span>
                    </div>
                </div>

                {/* Broadway Billboard Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-96 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : ticketItems.length === 0 ? (
                    <div className="flex items-center justify-center p-20 bg-white/5 rounded-3xl border border-white/10 opacity-40">
                         {t('ticket.no_events')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {ticketItems.map((ticket) => (
                            <BroadwayTicketCard 
                                key={ticket.id} 
                                ticket={ticket} 
                                theme={theme}
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

                {isManagementAllowed && (
                    <div className="mt-12 flex justify-center">
                        <button 
                            onClick={() => {
                                setIsEditMode(false);
                                setEditingItemId(null);
                                setNewTitle('');
                                setNewEventDate('');
                                setNewImageUrl('');
                                setPreviewUrl(null);
                                setShowAddModal(true);
                            }}
                            className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Plus size={18} className="text-white" />
                            </div>
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors">
                                <AutoTranslatedText text="Add Event" />
                            </span>
                        </button>
                    </div>
                )}

                {/* Ticketing Info Sections */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: MapPin, title: "Location Info", desc: "Detailed location and directions to each venue." },
                        { icon: Clock, title: "Viewing Hours", desc: "Check performance times and waiting lines for each session." },
                        { icon: CreditCard, title: "Easy Payment", desc: "We provide various easy payment and card installment benefits." },
                        { icon: Info, title: "Notice", desc: "Check cancellation and refund policies, prohibited items, etc." }
                    ].map((info, idx) => (
                        <div key={idx} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-700 group hover:-translate-y-2">
                             <info.icon className="mb-6 opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: theme.accentColor }} size={24} />
                             <h4 className="text-lg font-bold mb-3"><AutoTranslatedText text={info.title} /></h4>
                             <p className="text-sm opacity-40 leading-relaxed font-light"><AutoTranslatedText text={info.desc} /></p>
                        </div>
                    ))}
                </div>
            </main>


            {/* Add Content Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#111] border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">
                                            <AutoTranslatedText text={isEditMode ? "Edit Event Info" : "Register New Event"} />
                                        </h3>
                                        <p className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">{isEditMode ? "Edit Event Info" : "Add New Event"}</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowAddModal(false)}
                                        className="p-3 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                            <AutoTranslatedText text="Event Title" />
                                        </label>
                                        <div className="relative">
                                            <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <textarea 
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                placeholder={t("Enter event title...")}
                                                rows={2}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                            <AutoTranslatedText text="Event Schedule" />
                                        </label>
                                        <div className="relative">
                                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input 
                                                type="text"
                                                value={newEventDate}
                                                onChange={(e) => setNewEventDate(e.target.value)}
                                                placeholder={t("e.g. 2026.04.15 ~ 2026.04.30")}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                            <AutoTranslatedText text="Event Thumbnail" />
                                        </label>
                                        
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                                <input 
                                                    type="text"
                                                    value={newImageUrl}
                                                    onChange={(e) => {
                                                        setNewImageUrl(e.target.value);
                                                        if (previewUrl) setPreviewUrl(null);
                                                    }}
                                                    placeholder={t("Thumbnail URL...")}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                                                />
                                            </div>

                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                            {!previewUrl ? (
                                                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group">
                                                    <UploadCloud size={32} className="text-white/20 group-hover:text-white/40 mb-3 transition-colors" />
                                                    <span className="text-xs font-bold text-white/40 group-hover:text-white/60"><AutoTranslatedText text="Upload File" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <button onClick={() => setPreviewUrl(null)} className="px-4 py-2 rounded-lg bg-red-500/80 text-white text-[10px] font-black tracking-widest uppercase hover:bg-red-500"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleAddItem}
                                        disabled={isUploading || !newTitle || (!newImageUrl && !previewUrl)}
                                        className="w-full py-5 rounded-2xl text-black font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                        style={{ backgroundColor: theme.accentColor }}
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <AutoTranslatedText text="Uploading..." />
                                            </>
                                        ) : (
                                            <AutoTranslatedText text={isEditMode ? "Update Event" : "Register Event"} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ticket Footer */}
            <footer className="mt-40 border-t py-20 px-6" style={{ borderColor: `${theme.accentColor}11` }}>
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
                    <div className="flex flex-col gap-6">
                        <div className="text-4xl font-black tracking-tighter opacity-10 uppercase">DEPART TICKETS</div>
                        <p className="text-[9px] font-bold tracking-[0.5em] opacity-30 uppercase max-w-sm leading-loose">
                            <AutoTranslatedText text="Certified Virtual Ticketing Infrastructure for premium cultural heritage events." />
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex flex-col items-center gap-4 cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                             <div className="w-1 h-1 rounded-full bg-white opacity-40 group-hover:h-8 transition-all" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity"><AutoTranslatedText text="Back to Top" /></span>
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
