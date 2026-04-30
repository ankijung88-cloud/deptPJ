import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Play, ArrowLeft, Plus, Image as ImageIcon, Edit3, Trash2, Check } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

import VirtualGallery from '../components/gallery/VirtualGallery';
import { FeaturedItem } from '../types';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { getProductById, updateProduct } from '../api/products';
import { useFloors } from '../context/FloorContext';
import { useAdmin } from '../hooks/useAdmin';

interface VirtualCinemaPageProps {
    item?: FeaturedItem;
    productId?: string;
    onClose?: () => void;
}

const VirtualCinemaPage: React.FC<VirtualCinemaPageProps> = ({ item: propItem, productId: _propProductId, onClose }) => {
    const { i18n, t } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const { id: routeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [isExplorationMode, setIsExplorationMode] = useState(false);
    useImmersiveMode(isExplorationMode);

    const parentId = routeId || location.state?.parentId;

    const theme = {
        bgStyle: { backgroundColor: '#F2E7D5' },
        color1: '#FFFFFF',
        color2: '#F2E7D5',
        color3: '#000000',
        accentColor: '#DC2626',
        highlightColor: '#171717',
        textPrimary: '#171717',
        glowColor: '#DC2626'
    };

    const { isAdmin: isAdminLoggedIn, role, user } = useAdmin();
    const [cinemaItems, setCinemaItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [selectedCinemaItem, setSelectedCinemaItem] = useState<FeaturedItem | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(propItem || null);

    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDesc, setTempDesc] = useState('');
    const isManagementAllowed = isAdminLoggedIn || (role === 'agency' && String(parentProduct?.agency_id) === String(user?.id));
    const { floors } = useFloors();

    const currentFloor = floors.find(f => f.floor.toLowerCase() === parentProduct?.category?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === parentProduct?.subcategory);
    const floorNum = parentProduct?.category?.replace('floor-', '') || currentFloor?.floor?.replace('F', '').replace('f', '') || '';
    const floorLabel = floorNum ? `Floor-${floorNum}` : (currentFloor?.floor || parentProduct?.category || '');

    useSetBreadcrumbPath(parentProduct ? [
        { id: currentFloor?.floor || parentProduct.category, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || parentProduct.subcategory, label: currentCategory?.label || parentProduct.subcategory, type: 'category' },
        { id: 'detail', label: t('상세'), type: 'detail' },
        { id: parentProduct.id, label: typeof parentProduct.title === 'string' ? parentProduct.title : (parentProduct.title.ko || parentProduct.title.en), type: 'detail' },
        { id: 'cinema', label: t('가상 시네마'), type: 'template' }
    ] : []);

    useEffect(() => {
        const fetchParent = async () => {
            if (propItem) {
                setParentProduct(propItem);
                initializeMetadata(propItem);
                return;
            }

            if (parentId) {
                try {
                    const data = await getProductById(parentId);
                    if (data) {
                        setParentProduct(data);
                        initializeMetadata(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch parent product:", error);
                }
            }
        };

        const initializeMetadata = (data: FeaturedItem) => {
            let templates = [];
            try {
                const selectedTemplatesRaw = typeof data.selected_templates === 'string'
                    ? JSON.parse(data.selected_templates)
                    : (data.selected_templates as any);

                templates = Array.isArray(selectedTemplatesRaw)
                    ? selectedTemplatesRaw
                    : (typeof selectedTemplatesRaw === 'object' && selectedTemplatesRaw !== null
                        ? Object.entries(selectedTemplatesRaw).map(([id, val]: [string, any]) => ({
                            id,
                            status: val.status || 'visible',
                            title: val.title,
                            description: val.description
                        }))
                        : []);
            } catch (e) {
                console.error("Failed to parse templates:", e);
            }

            const cinemaMeta = templates.find((t: any) => t.id === 'cinema');
            setTempTitle(cinemaMeta?.title?.ko || (typeof cinemaMeta?.title === 'string' ? cinemaMeta.title : '') || "2D 가상 시네마");
            setTempDesc(cinemaMeta?.description?.ko || (typeof cinemaMeta?.description === 'string' ? cinemaMeta.description : '') || "시공을 초월한 몰입형 다큐멘터리와 영화를 감상하세요.");
        };

        fetchParent();
    }, [parentId, i18n.language, propItem]);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const url = parentId ? `/api/products/category/cinema?parentId=${parentId}` : '/api/products/category/cinema';
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}` } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const safeParse = (str: any) => { try { return typeof str === 'string' ? JSON.parse(str) : str; } catch { return str; } };
            const normalizedData = data.map((dbItem: any) => ({
                id: dbItem.id,
                title: safeParse(dbItem.title),
                category: dbItem.category,
                description: safeParse(dbItem.description),
                imageUrl: dbItem.image_url,
                date: safeParse(dbItem.event_date),
                location: safeParse(dbItem.location),
                price: dbItem.price,
                videoUrl: dbItem.video_url,
                agency_id: dbItem.agency_id
            }));
            setCinemaItems(normalizedData);
        } catch (error) {
            console.error('Failed to fetch:', error);
            setCinemaItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [parentId, i18n.language]);

    const handleEditInitiate = (item: FeaturedItem) => {
        setIsEditMode(true);
        setEditingId(item.id || (item as any)._id);
        const titleKo = typeof item.title === 'string' ? item.title : item.title?.ko || '';
        setNewTitle(titleKo);
        setNewThumbnailUrl(item.imageUrl || (item as any).image_url || '');
        setNewVideoUrl(item.videoUrl || (item as any).video_url || '');
        setPreviewUrl(null);
        setShowAddModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setNewThumbnailUrl(data.url);
                setPreviewUrl(data.url);
            }
        } catch (error) { console.error("Upload failed:", error); } finally { setIsUploading(false); }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setNewVideoUrl(data.url);
            }
        } catch (error) { console.error("Upload failed:", error); } finally { setIsUploading(false); }
    };

    const handleDelete = async (id: string) => {
        const confirmMsg = await translateAsync('정말 삭제하시겠습니까?');
        if (!window.confirm(confirmMsg)) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}` } });
            if (res.ok) { alert(await translateAsync('삭제되었습니다.')); fetchItems(); }
        } catch (error) { alert(await translateAsync('삭제에 실패했습니다.')); }
    };

    const handleAddItem = async () => {
        if (!newTitle) { alert(await translateAsync('영상 명칭을 입력해주세요.')); return; }
        setIsUploading(true);
        try {
            const adminToken = sessionStorage.getItem('admin_token');
            let finalImageUrl = newThumbnailUrl;
            let finalVideoUrl = newVideoUrl;
            
            const itemData = {
                id: isEditMode ? editingId : `cinema-${Date.now()}`,
                title: { ko: newTitle, en: newTitle },
                category: 'cinema',
                subcategory: 'general',
                image_url: finalImageUrl,
                video_url: finalVideoUrl,
                parent_id: parentId || null
            };

            const endpoint = isEditMode ? `/api/products/${editingId}` : '/api/products';
            const res = await fetch(endpoint, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
                body: JSON.stringify(itemData)
            });
            if (res.ok) {
                alert(await translateAsync(isEditMode ? '수정 성공' : '등록 성공'));
                fetchItems();
                setShowAddModal(false);
            }
        } catch (error) { alert(await translateAsync('서버 연결 실패')); } finally { setIsUploading(false); }
    };

    const handleSaveMetadata = async () => {
        if (!parentProduct || !parentId) return;
        const selectedTemplatesRaw = typeof parentProduct.selected_templates === 'string' ? JSON.parse(parentProduct.selected_templates) : (parentProduct.selected_templates as any) || [];
        let templates = Array.isArray(selectedTemplatesRaw) ? selectedTemplatesRaw : [];
        const updatedTemplates = templates.map((t: any) => t.id === 'cinema' ? { ...t, title: { ko: tempTitle }, description: { ko: tempDesc } } : t);
        if (!templates.find((t: any) => t.id === 'cinema')) updatedTemplates.push({ id: 'cinema', title: { ko: tempTitle }, description: { ko: tempDesc } });
        
        await updateProduct(parentId, { ...parentProduct, selected_templates: updatedTemplates });
        setIsEditingMetadata(false);
        alert(await translateAsync('변경사항이 저장되었습니다.'));
    };

    return (
        <div className="min-h-screen font-sans" style={theme.bgStyle}>
            <header className="relative w-full py-16 px-6 md:px-12 border-b z-[50] bg-white shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                <div className="container mx-auto relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <button 
                            onClick={() => {
                                if (onClose) {
                                    onClose();
                                } else {
                                    navigate(-1);
                                }
                            }}
                            className="flex items-center gap-2 text-neutral-900 opacity-80 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-widest relative z-[60]"
                        >
                            <ArrowLeft size={14} />
                            <AutoTranslatedText text="Back" />
                        </button>
                        {isManagementAllowed && (
                            <div className="flex gap-2 relative z-[70]">
                                <button onClick={() => isEditingMetadata ? handleSaveMetadata() : setIsEditingMetadata(true)} className="flex items-center gap-2 px-6 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-all text-[10px] font-black tracking-widest uppercase text-neutral-900 shadow-sm">
                                    {isEditingMetadata ? <Check size={14} /> : <Edit3 size={14} />}
                                    <AutoTranslatedText text={isEditingMetadata ? "Save Changes" : "Edit Page Info"} />
                                </button>
                                <button onClick={() => { setIsEditMode(false); setShowAddModal(true); }} className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-all text-[10px] font-black tracking-widest uppercase text-white shadow-lg">
                                    <Plus size={14} />
                                    <AutoTranslatedText text="Add Video" />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-4 mb-4">
                            <Link to="/" className="px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-neutral-200 bg-neutral-100 text-neutral-900">
                                <AutoTranslatedText text="시네마" /> {floorLabel}
                            </Link>
                            <div className="h-[1px] w-12 bg-neutral-200" />
                        </div>
                        {isEditingMetadata ? (
                            <textarea value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-4xl md:text-5xl font-serif font-black mb-6 text-neutral-900 focus:outline-none focus:border-red-600 transition-all shadow-inner" rows={2} />
                        ) : (
                            <h1 className="text-4xl md:text-7xl font-serif font-black mb-6 leading-tight text-neutral-900">
                                <AutoTranslatedText text={tempTitle} />
                            </h1>
                        )}
                        {isEditingMetadata ? (
                            <textarea value={tempDesc} onChange={(e) => setTempDesc(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-lg font-serif italic text-neutral-700 focus:outline-none focus:border-red-600 transition-all shadow-inner" rows={3} />
                        ) : (
                            <p className="text-lg md:text-xl font-serif italic text-neutral-600 max-w-2xl leading-tight">
                                <AutoTranslatedText text={tempDesc} />
                            </p>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 md:px-12 py-20">
                <div className="h-[65vh] rounded-[2rem] overflow-hidden bg-white shadow-xl border border-neutral-100 relative">
                    {isLoading ? <div className="flex items-center justify-center h-full">Loading...</div> : (
                        <VirtualGallery items={cinemaItems} stories={[]} theme={theme} lang={i18n.language} onClick={() => setIsExplorationMode(true)} cinemaItem={selectedCinemaItem} playing={isVideoPlaying} setPlaying={setIsVideoPlaying} isTheaterMode={true} />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {cinemaItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="relative group rounded-[2rem] overflow-hidden border border-neutral-200 bg-white shadow-sm cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] hover:-y-1" 
                            onClick={() => setSelectedCinemaItem(item)}
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-transparent transition-colors" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <Play size={12} className="text-red-600" />
                                </div>
                            </div>
                            <div className="p-8">
                                <h4 className="font-serif font-black text-xl text-neutral-900 mb-4 leading-tight">
                                    <AutoTranslatedText text={typeof item.title === 'string' ? item.title : (item.title as any).ko} />
                                </h4>
                                <div className="flex justify-between items-center">
                                    <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                        <AutoTranslatedText text="Archive" />
                                    </div>
                                    {isManagementAllowed && (
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleEditInitiate(item); }}
                                                className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors"
                                            >
                                                <Edit3 size={14}/>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-neutral-200 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-serif font-black text-neutral-900 uppercase tracking-tighter">
                                        <AutoTranslatedText text={isEditMode ? "Edit Video" : "Add New Video"} />
                                    </h3>
                                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                            <AutoTranslatedText text="Video Title" />
                                        </label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all"
                                            placeholder={t("Enter title")}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                                <AutoTranslatedText text="Thumbnail" />
                                            </label>
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-video rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all overflow-hidden relative group"
                                            >
                                                {previewUrl || newThumbnailUrl ? (
                                                    <img src={previewUrl || newThumbnailUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <ImageIcon size={24} className="text-neutral-300 mb-2" />
                                                        <span className="text-[8px] font-black text-neutral-400 uppercase"><AutoTranslatedText text="Upload Image" /></span>
                                                    </>
                                                )}
                                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                                <AutoTranslatedText text="Video File" />
                                            </label>
                                            <div 
                                                onClick={() => videoInputRef.current?.click()}
                                                className="aspect-video rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all overflow-hidden relative group"
                                            >
                                                {newVideoUrl ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Play size={24} className="text-red-600" />
                                                        <span className="text-[8px] font-black text-neutral-900 uppercase truncate px-4 w-full text-center">Video Attached</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Plus size={24} className="text-neutral-300 mb-2" />
                                                        <span className="text-[8px] font-black text-neutral-400 uppercase"><AutoTranslatedText text="Upload MP4" /></span>
                                                    </>
                                                )}
                                                <input type="file" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" accept="video/*" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddItem}
                                        disabled={isUploading || !newTitle}
                                        className="w-full py-5 rounded-2xl bg-neutral-900 text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3 mt-4"
                                    >
                                        {isUploading ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Check size={16} />
                                        )}
                                        <AutoTranslatedText text={isEditMode ? "Update Video" : "Confirm Registration"} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinema Footer */}
            <footer className="mt-48 py-24 px-6 border-t bg-white" style={{ borderColor: '#E5E7EB' }}>
                <div className="container mx-auto flex flex-col items-center gap-10">
                    <div className="text-5xl font-serif font-black tracking-tighter text-neutral-100 uppercase select-none"><AutoTranslatedText text="몽땅쏙 CINEMA" /></div>
                    <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black tracking-[0.3em] uppercase text-neutral-400">
                        <a href="#" className="hover:text-red-600 transition-colors"><AutoTranslatedText text="Showtimes" /></a>
                        <a href="#" className="hover:text-red-600 transition-colors"><AutoTranslatedText text="Archives" /></a>
                        <a href="#" className="hover:text-red-600 transition-colors"><AutoTranslatedText text="Technical" /></a>
                        <a href="#" className="hover:text-red-600 transition-colors"><AutoTranslatedText text="Access" /></a>
                    </div>
                    <div className="w-12 h-[1px] bg-neutral-200 mt-4" />
                </div>
            </footer>
        </div>
    );
};

export default VirtualCinemaPage;
