import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Ticket, Calendar, ArrowLeft, MapPin, Clock, Plus, Image as ImageIcon, UploadCloud, Check, Edit3 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
            whileHover={{ y: -16, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative group cursor-pointer overflow-hidden rounded-[3.5rem] bg-white border border-dancheong-ink/5 transition-all duration-1000 shadow-[0_40px_100px_rgba(0,0,0,0.06)] hover:shadow-[0_80px_120px_rgba(0,0,0,0.12)]"
        >
            {/* Status Lights - Refined with more visibility */}
            <div className="absolute top-8 left-10 right-10 h-1 flex justify-between z-20">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-dancheong-ink/10 group-hover:bg-[#800020] group-hover:animate-pulse transition-all duration-500 shadow-sm" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>

            {/* Image Section */}
            <div className="h-80 relative overflow-hidden">
                <img src={ticket.imageUrl} alt={getLoc(ticket.title, lang)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
                
                {/* Badge */}
                <div className="absolute top-12 left-10 px-6 py-2.5 rounded-full bg-white border border-dancheong-ink/10 text-[10px] font-black tracking-widest text-dancheong-ink uppercase shadow-lg">
                    <AutoTranslatedText text={t('ticket.live_show')} />
                </div>
            </div>

            {/* Info Section */}
            <div className="p-12 space-y-8 relative z-10">
                <div className="space-y-4">
                    <h3 className="text-3xl font-serif font-black text-dancheong-ink tracking-tight leading-none group-hover:text-[#800020] transition-colors duration-500 whitespace-pre-wrap break-keep">
                        <AutoTranslatedText text={getLoc(ticket.title, lang)} />
                    </h3>
                    <div className="flex items-center gap-3 text-dancheong-ink/60">
                        <MapPin size={14} className="text-[#800020]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">{getLoc(ticket.location, lang)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-10 border-t border-dancheong-ink/5">
                    <div className="space-y-3">
                        <div className="text-[9px] font-black text-dancheong-ink/20 tracking-widest uppercase"><AutoTranslatedText text={t('ticket.performance_date')} /></div>
                        <div className="flex items-center gap-3 text-dancheong-ink/80">
                            <Calendar size={14} className="text-[#800020]" />
                            <span className="text-[11px] font-serif italic font-bold">{getLoc(ticket.date, lang)}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-dancheong-ink/20 tracking-widest uppercase"><AutoTranslatedText text={t('ticket.entry_fee')} /></div>
                        <div className="text-3xl font-serif font-black text-[#800020]">{getLoc(ticket.price, lang)}</div>
                    </div>
                </div>

                {/* Perforation detail - More defined */}
                <div className="absolute bottom-28 -left-4 w-10 h-10 rounded-full bg-white border border-dancheong-ink/5 shadow-inner" />
                <div className="absolute bottom-28 -right-4 w-10 h-10 rounded-full bg-white border border-dancheong-ink/5 shadow-inner" />
            </div>

            {isAdmin && (
                <div className="absolute top-12 right-10 z-30 flex gap-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                        className="w-12 h-12 rounded-full bg-white border border-dancheong-ink/10 flex items-center justify-center text-dancheong-ink/20 hover:text-white hover:bg-dancheong-ink transition-all shadow-xl"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="w-12 h-12 rounded-full bg-white border border-dancheong-ink/10 flex items-center justify-center text-dancheong-ink/20 hover:text-white hover:bg-[#800020] transition-all shadow-xl"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            
            <div className="h-2 bg-dancheong-ink/5 group-hover:bg-[#800020] transition-colors duration-1000" />
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
                    className="fixed inset-0 z-[30000] flex items-center justify-center p-6 bg-dancheong-ink/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ y: 80, scale: 0.95, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 80, scale: 0.95, opacity: 0 }}
                        className="bg-white border border-dancheong-ink/10 w-full max-w-6xl h-[85vh] rounded-[4.5rem] overflow-hidden shadow-[0_100px_150px_rgba(0,0,0,0.3)] flex flex-col md:flex-row relative text-dancheong-ink"
                    >
                        <button 
                            onClick={onClose}
                            className="absolute top-12 right-12 z-[30010] w-16 h-16 rounded-full bg-white border border-dancheong-ink/10 flex items-center justify-center text-dancheong-ink/20 hover:text-dancheong-ink hover:bg-[#FFFFFF] transition-all shadow-xl"
                        >
                            <X size={28} />
                        </button>

                        <div className="w-full md:w-1/2 h-full bg-dancheong-ink relative group overflow-hidden">
                            <img src={ticket.imageUrl} alt={getLoc(ticket.title, lang)} className="w-full h-full object-cover opacity-80 transition-transform duration-[2000ms] group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                            
                            <div className="absolute bottom-20 left-20 right-20">
                                <div className="text-[11px] font-black tracking-[0.5em] uppercase text-dancheong-ink/40 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                                    <AutoTranslatedText text={t('ticket.official_selection')} />
                                </div>
                                <h2 className="text-6xl md:text-8xl font-serif font-black text-dancheong-ink uppercase tracking-tighter leading-[0.85] mb-12">
                                    <AutoTranslatedText text={getLoc(ticket.title, lang)} />
                                </h2>
                                <div className="flex items-center gap-12">
                                    <div className="flex items-center gap-4 text-dancheong-ink/60">
                                        <MapPin size={16} className="text-[#800020]" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">{getLoc(ticket.location, lang)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-dancheong-ink/60">
                                        <Clock size={16} className="text-[#800020]" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">{getLoc(ticket.date, lang)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 h-full p-20 flex flex-col justify-between border-l border-dancheong-ink/5 bg-white">
                            <div className="space-y-16">
                                <div>
                                    <div className="text-[11px] font-black tracking-[0.5em] uppercase text-dancheong-ink/30 mb-8"><AutoTranslatedText text={t('ticket.event_details')} /></div>
                                    <p className="text-xl text-dancheong-ink/60 font-serif italic leading-relaxed border-l-[6px] border-[#800020] pl-10">
                                        <AutoTranslatedText text={getLoc(ticket.description, lang) || 'We invite you to a special performance where artisan breath and traditional values harmonize. We promise the best impression.'} />
                                    </p>
                                </div>

                                <div className="p-12 rounded-[3.5rem] bg-[#FFFFFF] border border-dancheong-ink/5 shadow-sm space-y-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black tracking-widest uppercase text-dancheong-ink/40"><AutoTranslatedText text={t('ticket.ticket_quantity')} /></span>
                                        <div className="flex items-center gap-10 bg-white border border-dancheong-ink/5 rounded-full px-10 py-5 shadow-sm">
                                            <button 
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="text-dancheong-ink/20 hover:text-[#800020] transition-colors font-black text-xl"
                                            >-</button>
                                            <span className="text-3xl font-serif font-black text-dancheong-ink w-10 text-center">{quantity}</span>
                                            <button 
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="text-dancheong-ink/20 hover:text-[#800020] transition-colors font-black text-xl"
                                            >+</button>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-dancheong-ink/5" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black tracking-widest uppercase text-dancheong-ink/40"><AutoTranslatedText text={t('ticket.total_payable')} /></span>
                                        <div className="text-5xl font-serif font-black text-[#800020]">
                                            ₩{totalPrice.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <button 
                                    onClick={onConfirm}
                                    disabled={isReserving || reservationComplete}
                                    className={`w-full py-10 rounded-[3rem] font-black text-[11px] uppercase tracking-[0.5em] relative overflow-hidden group active:scale-[0.98] transition-all duration-700 shadow-2xl disabled:opacity-50 ${reservationComplete ? 'bg-dancheong-mugwort text-white' : 'bg-dancheong-ink text-white hover:bg-[#800020]'}`}
                                >
                                    <AnimatePresence mode="wait">
                                        {isReserving ? (
                                            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-4">
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                <AutoTranslatedText text={t('common.processing')} />
                                            </motion.div>
                                        ) : reservationComplete ? (
                                            <motion.div key="complete" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-4">
                                                <Check size={24} />
                                                <AutoTranslatedText text={t('ticket.reservation_complete')} />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-4">
                                                <Ticket size={24} />
                                                <AutoTranslatedText text={t('ticket.confirm_reservation')} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                                <p className="text-[10px] text-dancheong-ink/30 text-center uppercase font-black tracking-[0.4em]">
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
        <div className="min-h-screen bg-white selection:bg-[#800020] selection:text-white overflow-x-hidden">
            {/* Standard Header is provided by Layout */}

            
            {/* Elegant Hero Section */}
            <section className="relative pt-60 pb-40 px-10 md:px-20">
                <div className="max-w-[1800px] mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        <div className="flex justify-between items-center relative z-[60]">
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
                                className="group flex items-center gap-6 text-dancheong-ink/40 hover:text-dancheong-ink transition-all uppercase text-[11px] font-black tracking-[0.6em] relative z-[60]"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-3 transition-transform duration-500" />
                                <AutoTranslatedText text={t('common.back')} />
                            </button>

                            {isManagementAllowed && (
                                <div className="flex gap-6 relative z-[70]">
                                    <button 
                                        onClick={() => {
                                            if (isEditingMetadata) {
                                                handleSaveMetadata();
                                            } else {
                                                setIsEditingMetadata(true);
                                            }
                                        }}
                                        className="flex items-center gap-4 px-10 py-4 rounded-full bg-white border border-dancheong-ink/10 hover:bg-[#FFFFFF] transition-all text-[11px] font-black tracking-widest uppercase shadow-xl"
                                    >
                                        {isEditingMetadata ? <Check size={16} className="text-dancheong-mugwort" /> : <Edit3 size={16} />}
                                        <AutoTranslatedText text={isEditingMetadata ? t("common.save") : t("common.edit_info")} />
                                    </button>
                                    {isEditingMetadata && (
                                        <button 
                                            onClick={() => setIsEditingMetadata(false)}
                                            className="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-dancheong-ink/10 hover:bg-white text-dancheong-ink/40 transition-all shadow-xl"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => { setIsEditMode(false); setNewTicket({ title: '', date: '', imageUrl: '' }); setShowAddModal(true); }}
                                        className="flex items-center gap-4 px-10 py-4 rounded-full bg-dancheong-ink text-white hover:bg-[#800020] transition-all text-[11px] font-black tracking-widest uppercase shadow-2xl"
                                    >
                                        <Plus size={16} />
                                        <AutoTranslatedText text={t('ticket.add_event')} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6 pt-20">
                            <div className="h-px w-24 bg-[#800020]" />
                            <span className="text-[11px] font-black tracking-[0.6em] text-[#800020] uppercase">
                                <AutoTranslatedText text={t('ticket.title')} />
                            </span>
                        </div>
                        
                        <div className="max-w-[1800px]">
                            {isEditingMetadata ? (
                                <textarea 
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="w-full bg-white border border-dancheong-ink/10 rounded-[4rem] p-16 text-6xl md:text-[10rem] font-serif font-black text-dancheong-ink focus:outline-none focus:border-[#800020] transition-all resize-none shadow-2xl uppercase tracking-tighter leading-[0.8]"
                                    rows={2}
                                />
                            ) : (
                                <h1 className="text-[10rem] md:text-[18rem] font-serif font-black text-dancheong-ink tracking-tighter leading-[0.8] uppercase flex flex-col">
                                    <span className="flex items-center gap-10">
                                        Virtual <span className="text-xl md:text-3xl font-serif italic text-dancheong-ink/20 tracking-widest align-middle">DEPT.</span>
                                    </span>
                                    <span className="ml-20 md:ml-40 text-[#800020]">
                                        <AutoTranslatedText text={tempTitle} />
                                    </span>
                                </h1>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-16 pt-20">
                            <div className="max-w-4xl">
                                {isEditingMetadata ? (
                                    <textarea 
                                        value={tempDesc}
                                        onChange={(e) => setTempDesc(e.target.value)}
                                        className="w-full bg-white border border-dancheong-ink/10 rounded-[3rem] p-12 text-2xl font-serif italic text-dancheong-ink/60 focus:outline-none focus:border-[#800020] transition-all resize-none shadow-xl"
                                        rows={4}
                                    />
                                ) : (
                                    <p className="text-3xl md:text-5xl text-dancheong-ink/60 font-serif italic leading-tight border-l-[12px] border-[#800020] pl-16">
                                        <AutoTranslatedText text={tempDesc} />
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-12 text-[11px] font-black tracking-widest text-dancheong-ink/40 uppercase">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-dancheong-mugwort" />
                                    <span>LIVE SHOWS</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-[#800020]" />
                                    <span>LIMITED EDITION</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden opacity-5">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-to-br from-[#800020] to-transparent rounded-full blur-[200px]" />
                </div>
            </section>

            {/* Grid Section */}
            <main className="max-w-[1800px] mx-auto px-10 md:px-20 pb-60">
                <div className="flex flex-wrap gap-4 mb-32 p-4 rounded-full bg-rose-50 border border-rose-100 w-fit shadow-xl backdrop-blur-md">
                    {['ALL', 'MUSICAL', 'TRADITION', 'EXHIBITION'].map((cat) => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-12 py-5 rounded-full text-[11px] font-black tracking-widest uppercase transition-all duration-700 ${
                                activeCategory === cat 
                                ? 'bg-red-600 text-white shadow-2xl scale-105' 
                                : 'bg-rose-50 border border-rose-100 text-red-600/60 hover:text-red-600 hover:border-red-600/30 shadow-sm'
                            }`}
                        >
                            <AutoTranslatedText text={cat === 'ALL' ? t('common.all') : cat} />
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-20">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[600px] rounded-[4rem] bg-white border border-dancheong-ink/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-20"
                    >
                        {ticketItems.map((ticket, idx) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <BroadwayTicketCard 
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
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[40000] flex items-center justify-center p-6 bg-dancheong-ink/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="bg-white border border-dancheong-ink/10 w-full max-w-3xl rounded-[4.5rem] p-20 text-dancheong-ink shadow-[0_100px_150px_rgba(0,0,0,0.3)] relative overflow-y-auto max-h-[90vh]"
                        >
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-12 right-12 z-[30010] w-16 h-16 rounded-full bg-white border border-dancheong-ink/10 flex items-center justify-center text-dancheong-ink/20 hover:text-dancheong-ink hover:bg-[#FFFFFF] transition-all shadow-xl"
                            >
                                <X size={28} />
                            </button>

                            <h2 className="text-5xl font-serif font-black mb-16 uppercase tracking-tighter">
                                <AutoTranslatedText text={isEditMode ? t('ticket.edit_event') : t('ticket.add_new_event')} />
                            </h2>

                            <div className="space-y-16">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.5em] text-dancheong-ink/30 block ml-4">
                                        <AutoTranslatedText text={t('common.title')} />
                                    </label>
                                    <input 
                                        type="text"
                                        value={newTicket.title}
                                        onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                                        className="w-full bg-[#FFFFFF] border border-dancheong-ink/5 rounded-[2.5rem] px-10 py-6 text-xl font-serif italic text-dancheong-ink focus:outline-none focus:border-[#800020] transition-all shadow-sm"
                                        placeholder="Performance Title..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.5em] text-dancheong-ink/30 block ml-4">
                                        <AutoTranslatedText text={t('common.date')} />
                                    </label>
                                    <div className="relative">
                                        <Calendar size={20} className="absolute left-10 top-1/2 -translate-y-1/2 text-[#800020]" />
                                        <input 
                                            type="text"
                                            value={newTicket.date}
                                            onChange={(e) => setNewTicket({...newTicket, date: e.target.value})}
                                            placeholder="2026.04.15 ~ 2026.04.30"
                                            className="w-full bg-[#FFFFFF] border border-dancheong-ink/5 rounded-[2.5rem] py-6 pl-20 pr-10 text-xl font-serif italic text-dancheong-ink focus:outline-none focus:border-[#800020] transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.5em] text-dancheong-ink/30 block ml-4">
                                        <AutoTranslatedText text={t('common.image_url')} />
                                    </label>
                                    <div className="space-y-8">
                                        <div className="relative">
                                            <ImageIcon size={20} className="absolute left-10 top-1/2 -translate-y-1/2 text-[#800020]" />
                                            <input 
                                                type="text"
                                                value={newTicket.imageUrl}
                                                onChange={(e) => {
                                                    setNewTicket({...newTicket, imageUrl: e.target.value});
                                                    if (previewUrl) setPreviewUrl(null);
                                                }}
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full bg-[#FFFFFF] border border-dancheong-ink/5 rounded-[2.5rem] py-6 pl-20 pr-10 text-xl font-serif italic text-dancheong-ink focus:outline-none focus:border-[#800020] transition-all shadow-sm"
                                            />
                                        </div>

                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                        
                                        {!previewUrl && !newTicket.imageUrl ? (
                                            <button 
                                                onClick={() => fileInputRef.current?.click()} 
                                                className="w-full flex flex-col items-center justify-center p-20 rounded-[4rem] border-2 border-dashed border-dancheong-ink/10 hover:border-[#800020] hover:bg-[#FFFFFF] transition-all group"
                                            >
                                                <UploadCloud size={64} className="text-dancheong-ink/10 group-hover:text-[#800020] mb-6 transition-colors duration-700" />
                                                <span className="text-[11px] font-black tracking-widest text-dancheong-ink/30 group-hover:text-dancheong-ink uppercase">
                                                    <AutoTranslatedText text="Upload Cinematic Frame" />
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="relative rounded-[4rem] overflow-hidden border border-dancheong-ink/5 group shadow-2xl">
                                                <img src={previewUrl || newTicket.imageUrl} alt="Preview" className="w-full h-80 object-cover transition-all duration-1000 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-dancheong-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewUrl(null);
                                                            setNewTicket({...newTicket, imageUrl: ''});
                                                        }} 
                                                        className="px-12 py-5 rounded-full bg-[#800020] text-white text-[11px] font-black tracking-widest uppercase hover:bg-red-800 shadow-2xl transition-transform duration-500 hover:scale-110"
                                                    >
                                                        <AutoTranslatedText text="Remove & Replace" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-8 pt-10">
                                    <button 
                                        onClick={handleSaveTicket}
                                        disabled={isUploading}
                                        className="flex-1 py-10 rounded-[3rem] bg-dancheong-ink text-white font-black text-[11px] uppercase tracking-[0.5em] hover:bg-[#800020] transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                <AutoTranslatedText text={t('common.processing')} />
                                            </div>
                                        ) : (
                                            <AutoTranslatedText text={isEditMode ? t('common.save_changes') : t('ticket.add_event')} />
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-10 rounded-[3rem] bg-white border border-dancheong-ink/10 text-dancheong-ink font-black text-[11px] uppercase tracking-[0.5em] hover:bg-[#FFFFFF] transition-all shadow-xl active:scale-95"
                                    >
                                        <AutoTranslatedText text={t('common.cancel')} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

            {/* Global Footer - Minimalist Premium */}
            <footer className="border-t border-dancheong-ink/5 bg-white pt-60 pb-40 px-20">
                <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start gap-40">
                    <div className="space-y-20">
                        <h2 className="text-8xl md:text-[12rem] font-serif font-black text-dancheong-ink/10 leading-none uppercase select-none">
                            Heritage<br />Excellence
                        </h2>
                        <div className="flex gap-20">
                            {[t('footer.about'), t('footer.privacy'), t('footer.terms')].map((link, i) => (
                                <a key={i} href="#" className="text-[11px] font-black tracking-[0.4em] text-dancheong-ink/40 hover:text-[#800020] transition-colors uppercase">
                                    <AutoTranslatedText text={link} />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="text-right space-y-8">
                        <div className="text-4xl font-serif font-black text-dancheong-ink">DEPT.</div>
                        <p className="text-[11px] font-black text-dancheong-ink/20 tracking-[0.4em] uppercase">
                            © 2024 DEPT GLOBAL INC. ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VirtualTicketPage;
