import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Ticket, Calendar, ArrowLeft, MapPin, Clock, CreditCard, Info, Plus, Image as ImageIcon, Type, UploadCloud, Check } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { JOSEON_THEMES } from '../utils/themeUtils';
import { FeaturedItem } from '../types';
import { getProductById } from '../api/products';
import { useFloors } from '../context/FloorContext';
import { useSetBreadcrumbPath } from '../context/NavigationActionContext';

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
                    <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500">Live Show</span>
                </div>
            </div>

            {/* Ticket Info */}
            <div className="p-8 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-yellow-400 transition-colors">
                        <AutoTranslatedText text={getLoc(ticket.title, lang)} />
                    </h3>
                    <div className="flex items-center gap-2 opacity-40">
                        <MapPin size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{getLoc(ticket.location, lang)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-white/10">
                    <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Performance Date</span>
                        <div className="flex items-center gap-2 text-white/60">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase">{getLoc(ticket.date, lang)}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Entry Fee</span>
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
                                <span className="text-[10px] font-black tracking-[0.4em] text-yellow-500 uppercase mb-4 block">Official Selection</span>
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
                                    <span className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase mb-4 block">Event Details</span>
                                    <p className="text-sm text-white/60 font-medium leading-[1.8]">
                                        <AutoTranslatedText text={getLoc(ticket.description, lang) || '장인의 숨결과 전통의 가치가 어우러진 특별한 공연에 여러분을 초대합니다. 최고의 감동을 약속드립니다.'} />
                                    </p>
                                </div>

                                {/* Ticket Selection */}
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Ticket Quantity</span>
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
                                        <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Total Payable</span>
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
                                                <AutoTranslatedText text="Processing..." />
                                            </motion.div>
                                        ) : reservationComplete ? (
                                            <motion.div key="complete" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                <Check size={18} />
                                                <AutoTranslatedText text="Reservation Complete" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                <Ticket size={18} />
                                                <AutoTranslatedText text="Confirm Reservation" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                                <p className="text-center text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">
                                    Secure SSL Encryption Enabled • Digital Delivery
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
    const { i18n } = useTranslation();
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
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);
    const { floors } = useFloors();

    // Set Breadcrumb Path
    const currentFloor = floors.find(f => f.floor.toLowerCase() === parentProduct?.category?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === parentProduct?.subcategory);
    const floorNum = parentProduct?.category?.replace('floor-', '') || currentFloor?.floor?.replace('F', '').replace('f', '') || '';
    const floorLabel = floorNum ? `바닥-${floorNum}` : (currentFloor?.floor || parentProduct?.category || '');

    useSetBreadcrumbPath(parentProduct ? [
        { id: currentFloor?.floor || parentProduct.category, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || parentProduct.subcategory, label: currentCategory?.label || parentProduct.subcategory, type: 'category' },
        { id: 'detail', label: '상세', type: 'detail' },
        { id: parentProduct.id, label: parentProduct.title, type: 'detail' },
        { id: 'ticket', label: '가상 티켓', type: 'template' }
    ] : []);

    useEffect(() => {
        const fetchParent = async () => {
            if (parentId) {
                const data = await getProductById(parentId);
                setParentProduct(data);
            }
        };
        fetchParent();
    }, [parentId]);

    useEffect(() => {
        const checkAdmin = () => {
            setIsAdminLoggedIn(!!localStorage.getItem('admin_token'));
        };
        checkAdmin();
        window.addEventListener('storage', checkAdmin);
        return () => window.removeEventListener('storage', checkAdmin);
    }, []);


    // Using "Royal Guard" (index 0) theme for Ticket Booth - formal, striking, and prestigious
    const theme = JOSEON_THEMES[0]; 

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
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const adminToken = localStorage.getItem('admin_token');
            const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (response.ok) {
                alert('삭제되었습니다.');
                fetchItems();
            } else {
                const err = await response.json();
                alert(`삭제 실패: ${err.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('연결 오류가 발생했습니다.');
        }
    };

    const handleAddItem = async () => {
        if (!newTitle) {
            alert('행사 명칭을 입력해주세요.');
            return;
        }

        try {
            let finalImageUrl = newImageUrl;
            const adminToken = localStorage.getItem('admin_token');

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
                    alert('이미지 업로드에 실패했습니다.');
                    return;
                }
            }

            if (!finalImageUrl) {
                alert('이미지 URL을 입력하거나 파일을 업로드해주세요.');
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
                alert(isEditMode ? '수정 성공' : '등록 성공');
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
                alert(`요청 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Operation failed:', error);
            alert('서버 연결에 실패했습니다.');
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

return (
        <div className="min-h-screen font-sans overflow-hidden" style={theme.bgStyle}>
            {/* Ticket Header */}
            <header className="relative w-full py-16 md:py-24 px-6 md:px-12 border-b-2 z-[50]" style={{ borderColor: `${theme.accentColor}22` }}>
                <div className="container mx-auto relative z-10">
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
                        className="flex items-center gap-3 mb-10 opacity-60 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-[0.4em] relative z-[60]"
                        style={{ color: theme.highlightColor }}
                    >
                        <ArrowLeft size={16} />
                        <AutoTranslatedText text="Back" />
                    </button>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-4 mb-6">
                                <Link 
                                    to={currentFloor ? `/inspiration?floor=${currentFloor.floor.toLowerCase()}` : '/inspiration'}
                                    className="px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all uppercase relative z-[60]" 
                                     style={{ color: theme.highlightColor }}>
                                    <AutoTranslatedText text="아카이브" /> {floorLabel}
                                </Link>
                                <div className="h-[1px] w-20 bg-white/10" />
                            </div>
                            
                            <h1 className="text-5xl md:text-9xl font-black mb-10 leading-[0.8] tracking-tighter uppercase" 
                                style={{ color: theme.highlightColor, textShadow: `0 0 60px ${theme.glowColor}55` }}>
                                <AutoTranslatedText text="3D 가상 티켓 부스" />
                            </h1>
                            
                            <p className="text-xl md:text-2xl font-serif italic opacity-60 max-w-2xl leading-relaxed border-l-4 pl-8" style={{ borderColor: theme.accentColor }}>
                                <AutoTranslatedText text="전통 문화 행사를 손쉽게 예약하세요. 가상 티켓 부스에서 실시간 잔여 좌석 확인 및 티켓 구매가 가능합니다. 오감을 자극하는 특별한 경험이 기다리고 있습니다." />
                            </p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 opacity-10 bg-white transform rotate-45 -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                     <Ticket size={24} className="mb-2 opacity-40 group-hover:scale-110 transition-transform" />
                                     <span className="text-3xl font-black tracking-tighter" style={{ color: theme.highlightColor }}>08</span>
                                     <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">Running Events</span>
                                </div>
                            </div>
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
            <main className="container mx-auto px-6 md:px-12 py-24">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10">
                    <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center" style={{ color: theme.accentColor }}>
                             <Calendar size={28} />
                         </div>
                         <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight"><AutoTranslatedText text="Live Availability" /></h2>
                            <p className="text-[10px] font-bold tracking-[0.4em] opacity-30 uppercase mt-1">Real-time Ticket Inventory</p>
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-6 px-10 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-[11px] font-black tracking-widest uppercase"><AutoTranslatedText text="Server Online" /></span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/20" />
                        <span className="text-[11px] font-black tracking-widest uppercase opacity-40">Secure Transaction</span>
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
                         <AutoTranslatedText text="예약 가능한 행사가 없습니다." />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {ticketItems.map((ticket) => (
                            <BroadwayTicketCard 
                                key={ticket.id} 
                                ticket={ticket} 
                                theme={theme}
                                lang={i18n.language}
                                isAdmin={isAdminLoggedIn}
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

                {isAdminLoggedIn && (
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
                                <AutoTranslatedText text="행사 추가 (Add Event)" />
                            </span>
                        </button>
                    </div>
                )}

                {/* Ticketing Info Sections */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: MapPin, title: "위치 안내", desc: "각 행사장별 상세 위치와 오시는 길을 안내해 드립니다." },
                        { icon: Clock, title: "관람 시간", desc: "회차별 관람 시간 및 대기 동선을 확인하실 수 있습니다." },
                        { icon: CreditCard, title: "간편 결제", desc: "각종 간편 결제 및 카드사 할부 혜택을 제공합니다." },
                        { icon: Info, title: "유의 사항", desc: "취소 및 환불 규정, 반입 금지 물품 등을 확인하세요." }
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
                                            <AutoTranslatedText text={isEditMode ? "행사 정보 수정" : "신규 행사 등록"} />
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
                                            <AutoTranslatedText text="행사 명칭 (Title)" />
                                        </label>
                                        <div className="relative">
                                            <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input 
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                placeholder="Enter event title..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                            <AutoTranslatedText text="행사 일정 (Schedule)" />
                                        </label>
                                        <div className="relative">
                                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input 
                                                type="text"
                                                value={newEventDate}
                                                onChange={(e) => setNewEventDate(e.target.value)}
                                                placeholder="e.g. 2026.04.15 ~ 2026.04.30"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                            <AutoTranslatedText text="행사 썸네일 (Thumbnail)" />
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
                                                    placeholder="Thumbnail URL..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                                                />
                                            </div>

                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                            {!previewUrl ? (
                                                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group">
                                                    <UploadCloud size={32} className="text-white/20 group-hover:text-white/40 mb-3 transition-colors" />
                                                    <span className="text-xs font-bold text-white/40 group-hover:text-white/60"><AutoTranslatedText text="파일 업로드" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <button onClick={() => setPreviewUrl(null)} className="px-4 py-2 rounded-lg bg-red-500/80 text-white text-[10px] font-black tracking-widest uppercase hover:bg-red-500">Remove</button>
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
                                                <AutoTranslatedText text="업로드 중..." />
                                            </>
                                        ) : (
                                            <AutoTranslatedText text={isEditMode ? "수정하기 (Update Event)" : "등록하기 (Register Event)"} />
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
                        <div className="text-4xl font-black tracking-tighter opacity-10 uppercase">DEPT. TICKETS</div>
                        <p className="text-[9px] font-bold tracking-[0.5em] opacity-30 uppercase max-w-sm leading-loose">
                            Certified Virtual Ticketing Infrastructure for premium cultural heritage events.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex flex-col items-center gap-4 cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                             <div className="w-1 h-1 rounded-full bg-white opacity-40 group-hover:h-8 transition-all" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">Back to Top</span>
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
