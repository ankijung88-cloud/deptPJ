import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Play, Film, ArrowLeft, Monitor, Music, Plus, Image as ImageIcon, Type, UploadCloud, Edit3, Trash2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { JOSEON_THEMES } from '../utils/themeUtils';
import VirtualGallery from '../components/gallery/VirtualGallery';
import { FeaturedItem } from '../types';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { getProductById } from '../api/products';
import { useFloors } from '../context/FloorContext';

const VirtualCinemaPage: React.FC = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    const [isExplorationMode, setIsExplorationMode] = useState(false);
    useImmersiveMode(isExplorationMode);
    
    // Determine the effective parent ID (favor params, fallback to state)
    const parentId = paramId || location.state?.parentId;


    // Using "Night Sky" (index 11) theme for Cinema - deep, immersive, and cinematic
    const theme = JOSEON_THEMES[10]; 

    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

    useEffect(() => {
        const checkAdmin = () => {
            setIsAdminLoggedIn(!!localStorage.getItem('admin_token'));
        };
        checkAdmin();
        window.addEventListener('storage', checkAdmin);
        return () => window.removeEventListener('storage', checkAdmin);
    }, []);

    const [cinemaItems, setCinemaItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedCinemaItem, setSelectedCinemaItem] = useState<FeaturedItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);
    const { floors } = useFloors();

    // Set Breadcrumb Path
    const currentFloor = floors.find(f => f.floor.toLowerCase() === parentProduct?.category?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === parentProduct?.subcategory);
    
    useSetBreadcrumbPath(parentProduct ? [
        { id: currentFloor?.floor || parentProduct.category, label: currentFloor?.floor || parentProduct.category, type: 'floor' },
        { id: currentCategory?.id || parentProduct.subcategory, label: currentCategory?.label || parentProduct.subcategory, type: 'category' },
        { id: 'detail', label: '상세', type: 'detail' },
        { id: parentProduct.id, label: parentProduct.title, type: 'detail' },
        { id: 'cinema', label: '가상 시네마', type: 'template' }
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

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const effectiveParentId = parentId; // Use calculated parentId
            const url = effectiveParentId 
                ? `/api/products/category/cinema?parentId=${effectiveParentId}`
                : '/api/products/category/cinema';
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
                price: dbItem.price,
                videoUrl: dbItem.video_url
            }));
            setCinemaItems(normalizedData);
            
            // Re-fetch should keep selections current if needed
            // VirtualCinemaPage doesn't have selectedItem yet, but good for future.
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Handle initial item selection if passed via navigation state
    useEffect(() => {
        if (!isLoading && cinemaItems.length > 0 && location.state?.initialId) {
            const initialItem = cinemaItems.find(item => item.id === location.state.initialId);
            if (initialItem) {
                setSelectedCinemaItem(initialItem);
                // Optionally enter immersive mode automatically for interaction
                // setIsExplorationMode(true); 
            }
        }
    }, [isLoading, cinemaItems, location.state]);

    const handleEditInitiate = (item: FeaturedItem) => {
        setIsEditMode(true);
        setEditingId(item.id);
        setNewTitle(typeof item.title === 'string' ? item.title : item.title.ko);
        const urlToPreview = item.videoUrl || (item as any).video_url || item.imageUrl || item.image_url;
        setPreviewUrl(urlToPreview as string);
        setNewImageUrl(item.imageUrl || item.image_url || '');
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const adminToken = localStorage.getItem('admin_token');
            const res = await fetch(`/api/products/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (res.ok) {
                alert('삭제되었습니다.');
                fetchItems();
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('삭제에 실패했습니다.');
        }
    };

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

    const handleAddItem = async () => {
        if (!newTitle) {
            alert('영상 명칭을 입력해주세요.');
            return;
        }

        let finalImageUrl = newImageUrl;
        let finalVideoUrl = '';
        
        const file = fileInputRef.current?.files?.[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const adminToken = localStorage.getItem('admin_token');
                const uploadRes = await fetch('/api/upload', { 
                    method: 'POST', 
                    body: formData,
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                if (!uploadRes.ok) throw new Error('Upload failed');
                const uploadData = await uploadRes.json();
                
                const isVideo = file.type.startsWith('video/');
                if (isVideo) {
                    finalVideoUrl = uploadData.url;
                    // For videos, we might want a placeholder or the same URL as image fallback if the server supports it
                    if (!finalImageUrl) finalImageUrl = uploadData.url; 
                } else {
                    finalImageUrl = uploadData.url;
                }
            } catch (error) {
                console.error('Upload failed:', error);
                alert('파일 업로드에 실패했습니다.');
                return;
            }
        }

        if (!finalImageUrl) {
            alert('이미지 URL을 입력하거나 파일을 업로드해주세요.');
            return;
        }

        const newItem = {
            id: isEditMode ? editingId : `cinema-${Date.now()}`,
            title: { ko: newTitle, en: newTitle },
            category: 'cinema',
            subcategory: 'general',
            description: { ko: '', en: '' },
            image_url: finalImageUrl,
            video_url: finalVideoUrl || (finalImageUrl?.includes('.mp4') || finalImageUrl?.includes('.webm') ? finalImageUrl : ''),
            event_date: { ko: 'Now Playing', en: 'Now Playing' },
            location: { ko: 'Theatre 01', en: 'Theatre 01' },
            price: '4K HD',
            parent_id: location.state?.parentId || null
        };

        try {
            const endpoint = isEditMode ? `/api/products/${editingId}` : '/api/products';
            const method = isEditMode ? 'PUT' : 'POST';
            const adminToken = localStorage.getItem('admin_token');

            const res = await fetch(endpoint, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                alert(isEditMode ? '수정 성공' : '등록 성공');
                await fetchItems();
                setNewTitle('');
                setNewImageUrl('');
                setPreviewUrl(null);
                setShowAddModal(false);
                setIsEditMode(false);
                setEditingId(null);
            } else {
                const errorData = await res.json();
                alert(`처리 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen font-sans overflow-hidden" style={theme.bgStyle}>
            {/* Cinema Header */}
            <header className="relative w-full py-20 px-6 md:px-12" style={{ borderBottom: `1px solid ${theme.color3}44` }}>
                <div className="container mx-auto relative z-10">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 mb-10 opacity-50 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-[0.3em]"
                    >
                        <ArrowLeft size={12} />
                        <AutoTranslatedText text="Back to Lobby" />
                    </button>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 bg-white/5" 
                                     style={{ color: theme.highlightColor }}>
                                    <AutoTranslatedText text="Multiplex Virtual" />
                                </div>
                                <div className="h-4 w-[1px] bg-white/20" />
                                <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Now Streaming in 4K</span>
                            </div>
                            
                            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase" 
                                style={{ color: theme.highlightColor, textShadow: `0 0 60px ${theme.glowColor}44` }}>
                                <AutoTranslatedText text="3D 가상 상영관" />
                            </h1>
                            
                            <p className="text-xl md:text-2xl font-serif italic opacity-60 max-w-2xl leading-relaxed">
                                <AutoTranslatedText text="몰입감 넘치는 가상 극장에서 고해상도 영상을 감상하세요. 역사와 예술을 담은 시네마틱 아카이브가 당신 앞에 펼쳐집니다." />
                            </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-6">
                             <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group cursor-pointer hover:bg-white/10 transition-all">
                                 <Play size={32} className="text-white fill-white ml-1 opacity-40 group-hover:opacity-100" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Ambient Cinematic Glow */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/4 w-[100%] h-[150%] opacity-20" style={{ 
                        background: `radial-gradient(circle at center, ${theme.accentColor} 0%, transparent 60%)`,
                        filter: 'blur(120px)',
                    }} />
                </div>
            </header>

            {/* Theatre Selection Section */}
            <main className="container mx-auto px-6 md:px-12 py-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Film size={20} className="text-white/30" />
                            <h2 className="text-2xl font-black uppercase tracking-tight"><AutoTranslatedText text="Cinema Selection" /></h2>
                        </div>
                        <p className="text-sm font-medium opacity-40 tracking-widest uppercase"><AutoTranslatedText text="Interactive Video corridor" /></p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-2">
                             {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border border-black bg-white/10" />)}
                        </div>
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-40"><AutoTranslatedText text="1,248 Viewers Online" /></span>
                    </div>
                </div>

                {/* 3D Cinema Corridor */}
                <div className="h-[65vh] md:h-[85vh] rounded-[4rem] overflow-hidden border shadow-[0_0_100px_rgba(0,0,0,0.8)] relative group" 
                     style={{ borderColor: `${theme.color3}33`, backgroundColor: '#020202' }}>
                    
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20" />
                        </div>
                    ) : cinemaItems.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-40">
                             <AutoTranslatedText text="상영 중인 영상이 없습니다." />
                        </div>
                    ) : (
                        <VirtualGallery 
                            items={cinemaItems} 
                            stories={[]} 
                            theme={theme} 
                            lang={i18n.language}
                            onClick={() => setIsExplorationMode(true)}
                            cinemaItem={selectedCinemaItem}
                        />
                    )}

                    {/* Overlay Vignette for Cinema feel */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-10" />
                </div>

                {/* Cinema Selection Slider - Slide-style cards */}
                {!isLoading && cinemaItems.length > 0 && (
                    <div className="mt-12 overflow-x-auto pb-8 hide-scrollbar">
                        <motion.div 
                            className="flex gap-6 px-4"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            {cinemaItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedCinemaItem(item)}
                                    className={`relative shrink-0 w-64 h-40 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-500 ${selectedCinemaItem?.id === item.id ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'border-white/10 grayscale-[0.6] hover:grayscale-0'}`}
                                >
                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                        <div className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-1">
                                            {typeof item.price === 'string' ? item.price : (item.price as any).ko}
                                        </div>
                                        <div className="text-xs font-bold text-white uppercase truncate">
                                            <AutoTranslatedText text={typeof item.title === 'string' ? item.title : (item.title as any).ko} />
                                        </div>
                                    </div>
                                    {selectedCinemaItem?.id === item.id && (
                                        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_10px_#fff]" />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                )}

                {/* Management Section */}
                {isAdminLoggedIn && (
                    <div className="mt-12 flex flex-col items-center gap-8">
                        <button 
                            onClick={() => { setIsEditMode(false); setShowAddModal(true); }}
                            className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Plus size={18} className="text-white" />
                            </div>
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors">
                                <AutoTranslatedText text="영상 추가 (Add Video)" />
                            </span>
                        </button>

                        {!isLoading && cinemaItems.length > 0 && (
                            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cinemaItems.map(item => (
                                    <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[10px] font-bold text-white/60 truncate uppercase tracking-tight">
                                                {typeof item.title === 'string' ? item.title : (item.title as any).ko}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEditInitiate(item)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Secondary Features / Technical Specs */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { icon: Monitor, title: "4K 울트라 HD", desc: "모든 영상은 4K 초고화질로 업스케일링되어 최상의 디테일을 제공합니다." },
                        { icon: Music, title: "공간 오디오", desc: "입체적인 사운드 설계를 통해 현장에 있는 듯한 몰입감을 선사합니다." },
                        { icon: Film, title: "시네마틱 아카이브", desc: "역사적 가치가 높은 자료들을 시네마틱 기법으로 재편집하여 제공합니다." }
                    ].map((feature, idx) => (
                        <div key={idx} className="space-y-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-500" style={{ color: theme.accentColor }}>
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold"><AutoTranslatedText text={feature.title} /></h3>
                            <p className="text-sm opacity-40 leading-relaxed font-light"><AutoTranslatedText text={feature.desc} /></p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Immersive Fullscreen Theater Mode */}
            <AnimatePresence>
                {isExplorationMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black"
                    >
                        <div className="absolute top-10 left-10 z-[1010]">
                            <div className="text-[10px] font-black tracking-[0.5em] text-white/30 uppercase mb-2">Theater Immersion</div>
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Cinematic Space</h2>
                        </div>

                        <button 
                            onClick={() => setIsExplorationMode(false)}
                            className="absolute top-10 right-10 z-[1010] p-4 bg-white/5 hover:bg-white/20 rounded-full text-white border border-white/10 transition-all duration-500"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-full h-full">
                            <VirtualGallery 
                                items={cinemaItems} 
                                stories={[]} 
                                theme={theme} 
                                showUI={false}
                                defaultActivated={true}
                                lang={i18n.language}
                                cinemaItem={selectedCinemaItem}
                            />
                        </div>

                        {/* Scrolling HUD */}
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[1010] flex flex-col items-center">
                             <div className="w-[2px] h-12 bg-gradient-to-t from-white/40 to-transparent mb-4" />
                             <div className="text-[10px] font-black tracking-[0.6em] text-white/40 uppercase">Navigate Theater</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                            <AutoTranslatedText text={isEditMode ? "영상 정보 수정" : "신규 영상 등록"} />
                                        </h3>
                                        <p className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">{isEditMode ? "Edit Video Info" : "Add New Cinematic Content"}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setShowAddModal(false); setIsEditMode(false); setEditingId(null); }}
                                        className="p-3 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                            <AutoTranslatedText text="영상 명칭 (Title)" />
                                        </label>
                                        <div className="relative">
                                            <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input 
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                placeholder="Enter video title..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                            <AutoTranslatedText text="영상 썸네일 (Thumbnail)" />
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

                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                                            {!previewUrl ? (
                                                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group">
                                                    <UploadCloud size={32} className="text-white/20 group-hover:text-white/40 mb-3 transition-colors" />
                                                    <span className="text-xs font-bold text-white/40 group-hover:text-white/60"><AutoTranslatedText text="파일 업로드" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group">
                                                    {previewUrl.startsWith('data:video') || previewUrl.endsWith('.mp4') || previewUrl.endsWith('.webm') ? (
                                                        <video src={previewUrl} className="w-full h-40 object-cover" muted loop autoPlay />
                                                    ) : (
                                                        <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <button onClick={() => { setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-4 py-2 rounded-lg bg-red-500/80 text-white text-[10px] font-black tracking-widest uppercase hover:bg-red-500">Remove</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleAddItem}
                                        disabled={!newTitle || (!newImageUrl && !previewUrl)}
                                        className="w-full py-5 rounded-2xl text-black font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                        style={{ backgroundColor: theme.accentColor }}
                                    >
                                        <AutoTranslatedText text={isEditMode ? "수정하기 (Update Video)" : "등록하기 (Register Video)"} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinema Footer */}
            <footer className="mt-48 pb-20 px-6 opacity-30">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-3xl font-black tracking-tighter uppercase">DEPT. CINEMA</div>
                    <div className="flex gap-10 text-[10px] font-black tracking-widest uppercase">
                         <a href="#">Showtimes</a>
                         <a href="#">Archives</a>
                         <a href="#">Technical</a>
                         <a href="#">Access</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VirtualCinemaPage;
