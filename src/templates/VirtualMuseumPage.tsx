import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Compass, Info, ArrowLeft, Maximize2, Plus, Image as ImageIcon, Type, UploadCloud, Edit3, Trash2 } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { JOSEON_THEMES } from '../utils/themeUtils';
import { FeaturedItem } from '../types';
import { getLocalizedText } from '../utils/i18nUtils';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { getProductById } from '../api/products';
import { useFloors } from '../context/FloorContext';
import { useAdmin } from '../hooks/useAdmin';

interface MuseumCardProps {
    item: FeaturedItem;
    theme: any;
    lang: string;
    onImageClick: (url: string) => void;
    onEdit: (item: FeaturedItem) => void;
    onDelete: (id: string) => void;
    isAdminLoggedIn?: boolean;
}

const MuseumCard: React.FC<MuseumCardProps> = ({ item, theme, lang, onImageClick, onEdit, onDelete, isAdminLoggedIn }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const displayName = getLocalizedText(item.title, lang);

    return (
        <div 
            className="relative h-[300px] w-full perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="w-full h-full relative preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Side: Title centric */}
                <div 
                    className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-center p-6 text-center shadow-xl overflow-hidden"
                    style={{ 
                        backgroundColor: `${theme.color1}ee`, 
                        borderColor: `${theme.color3}44`,
                        backdropFilter: 'blur(10px)',
                        backfaceVisibility: 'hidden',
                        zIndex: isFlipped ? 0 : 1
                    }}
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{ backgroundImage: `radial-gradient(circle at center, ${theme.accentColor} 0%, transparent 70%)` }} />
                    
                    <div className="mb-4 opacity-30 group-hover:opacity-100 transition-opacity duration-500" style={{ color: theme.accentColor }}>
                        <Compass size={32} />
                    </div>
                    
                    <h3 className="text-lg font-serif font-black leading-tight mb-2 whitespace-pre-wrap break-keep" style={{ color: theme.highlightColor }}>
                        <AutoTranslatedText text={displayName} />
                    </h3>
                    
                    <div className="h-[1px] w-8 bg-white/10 my-3" />
                    
                    <span className="text-[10px] font-mono tracking-widest opacity-40 uppercase">
                        <AutoTranslatedText text="Click to Reveal" />
                    </span>
                </div>

                {/* Back Side: Image centric */}
                <div 
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border"
                    style={{ 
                        transform: 'rotateY(180deg)',
                        borderColor: theme.accentColor,
                        backfaceVisibility: 'hidden',
                        zIndex: isFlipped ? 1 : 0
                    }}
                >
                    <img 
                        src={item.imageUrl} 
                        alt={displayName} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                    
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-white/60 tracking-tighter">
                                <AutoTranslatedText text={getLocalizedText(item.date, lang)} />
                            </span>
                            {isAdminLoggedIn && (
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                    >
                                        <Edit3 size={12} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onImageClick(item.imageUrl || '');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all group/btn"
                        >
                            <span className="text-[10px] font-black tracking-widest uppercase text-white">
                                <AutoTranslatedText text="감상하기" />
                            </span>
                            <Maximize2 size={12} className="text-white/60 group-hover/btn:text-white group-hover/btn:scale-110 transition-all" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const VirtualMuseumPage: React.FC = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    useImmersiveMode(!!selectedImage);
    const { isAdmin: isAdminLoggedIn } = useAdmin();
    
    // Determine the effective parent ID (favor params, fallback to state)
    const parentId = paramId || location.state?.parentId;

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Theme: Scholar Green
    const theme = JOSEON_THEMES[2]; 

    const [museumItems, setMuseumItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
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
        { id: 'museum', label: '가상 전시관', type: 'template' }
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
            const effectiveParentId = parentId; // Use the one we calculated in the component body
            const url = effectiveParentId 
                ? `/api/products/category/museum?parentId=${effectiveParentId}`
                : '/api/products/category/museum';
            const response = await fetch(url);
            const data = await response.json();
            
            // Normalize DB items to FeaturedItem interface
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
            
            setMuseumItems(normalizedData);
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
        if (!isLoading && museumItems.length > 0 && location.state?.initialId) {
            const initialItem = museumItems.find(item => item.id === location.state.initialId);
            if (initialItem) {
                setSelectedImage(initialItem.imageUrl);
            }
        }
    }, [isLoading, museumItems, location.state]);

    const handleEditInitiate = (item: FeaturedItem) => {
        setIsEditMode(true);
        setEditingId(item.id);
        setNewTitle(typeof item.title === 'string' ? item.title : item.title.ko);
        setPreviewUrl(item.imageUrl);
        setNewImageUrl(item.imageUrl);
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

    useEffect(() => {
        if (selectedImage || showAddModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [selectedImage, showAddModal]);

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
            alert('유물 명칭을 입력해주세요.');
            return;
        }

        setIsUploading(true);
        try {
            let finalImageUrl = newImageUrl;
            const adminToken = localStorage.getItem('admin_token');
            
            // 1. If file uploaded, upload to server first
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
                    console.error('File upload failed:', error);
                    alert('이미지 업로드에 실패했습니다.');
                    return;
                }
            }

            if (!finalImageUrl) {
                alert('이미지 URL을 입력하거나 파일을 업로드해주세요.');
                return;
            }
            
            // 2. Save to DB
            const newItem = {
                id: isEditMode ? editingId : `museum-${Date.now()}`,
                title: { ko: newTitle, en: newTitle },
                category: 'museum',
                subcategory: 'general',
                description: { ko: '', en: '' },
                image_url: finalImageUrl,
                event_date: { ko: new Date().toLocaleDateString(), en: new Date().toLocaleDateString() },
                location: { ko: '가상 박물관', en: 'Virtual Museum' },
                price: '전시중',
                parent_id: location.state?.parentId || null
            };

            const endpoint = isEditMode ? `/api/products/${editingId}` : '/api/products';
            const method = isEditMode ? 'PUT' : 'POST';

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
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden" style={theme.bgStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
            `}} />

            {/* Header Section */}
            <header className="relative w-full py-16 px-6 md:px-12 border-b z-[50]" style={{ borderColor: `${theme.color3}44` }}>
                <div className="container mx-auto relative z-10">
                    <div className="flex justify-between items-start mb-8">
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
                            className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-widest relative z-[60]"
                            style={{ color: theme.highlightColor }}
                        >
                            <ArrowLeft size={14} />
                            <AutoTranslatedText text="Back" />
                        </button>

                        {isAdminLoggedIn && (
                            <button 
                                onClick={() => { setIsEditMode(false); setShowAddModal(true); }}
                                className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all text-[10px] font-black tracking-widest uppercase"
                                style={{ color: theme.accentColor, borderColor: `${theme.accentColor}44` }}
                            >
                                <Plus size={14} />
                                <AutoTranslatedText text="Add Content" />
                            </button>
                        )}
                    </div>
                    
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-4 mb-4">
                        <Link 
                            to={currentFloor ? `/inspiration?floor=${currentFloor.floor.toLowerCase()}` : '/inspiration'}
                            className="px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase hover:brightness-110 transition-all shadow-lg relative z-[60]" 
                            style={{ backgroundColor: `${theme.color2}44`, color: theme.highlightColor }}
                        >
                            <AutoTranslatedText text="아카이브" /> {floorLabel}
                        </Link>
                            <div className="h-[1px] w-12 bg-white/10" />
                        </div>
                        
                        <h1 className="text-4xl md:text-7xl font-serif font-black mb-6 leading-tight whitespace-pre-wrap break-keep" 
                            style={{ color: theme.highlightColor, textShadow: `0 0 30px ${theme.glowColor}22` }}>
                            <AutoTranslatedText text="3D 가상 전시 박물관" />
                        </h1>
                        
                        <p className="text-lg md:text-xl font-serif italic opacity-60 max-w-2xl leading-relaxed">
                            <AutoTranslatedText text="카드를 클릭하여 유물의 세부 모습을 확인해 보세요. 뒷면의 이미지를 다시 클릭하면 전체 화면으로 감상할 수 있습니다." />
                        </p>
                    </div>
                </div>
            </header>

            {/* Grid Layout Section */}
            <main className="container mx-auto px-6 md:px-12 py-20">
                {isLoading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20" />
                    </div>
                ) : museumItems.length === 0 ? (
                    <div className="text-center py-40 opacity-40">
                        <AutoTranslatedText text="등록된 콘텐츠가 없습니다. 새로운 유물을 추가해 보세요." />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {museumItems.map((item) => (
                            <MuseumCard 
                                key={item.id} 
                                item={item} 
                                theme={theme} 
                                lang={i18n.language} 
                                onImageClick={(url) => setSelectedImage(url)}
                                onEdit={handleEditInitiate}
                                onDelete={handleDelete}
                                isAdminLoggedIn={isAdminLoggedIn}
                            />
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                    {[
                        { icon: Info, title: "인터랙티브 전람", desc: "앞면의 제목을 확인하고 뒤집어서 유물의 실물을 만나보세요." },
                        { icon: Compass, title: "고해상도 뷰어", desc: "이미지를 클릭하면 실제 박물관 부럽지 않은 선명한 화질을 경험할 수 있습니다." },
                        { icon: Plus, title: "콘텐츠 확장", desc: "언제든지 새로운 유물을 추가하여 나만의 가상 전시장을 꾸며보세요." }
                    ].map((feature, idx) => (
                        <div key={idx} className="p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm group hover:bg-white/10 transition-all duration-500">
                             <feature.icon className="mb-6 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: theme.accentColor }} size={32} />
                             <h3 className="text-xl font-serif font-bold mb-3"><AutoTranslatedText text={feature.title} /></h3>
                             <p className="text-sm opacity-50 leading-relaxed font-light"><AutoTranslatedText text={feature.desc} /></p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Add Content Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[11000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg rounded-3xl p-10 shadow-2xl border"
                            style={{ backgroundColor: JOSEON_THEMES[2].color1, borderColor: `${JOSEON_THEMES[2].accentColor}44` }}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-serif font-black" style={{ color: theme.highlightColor }}>
                                    <AutoTranslatedText text={isEditMode ? "유물 정보 수정" : "새 유물 추가"} />
                                </h2>
                                <button onClick={() => { setShowAddModal(false); setIsEditMode(false); setEditingId(null); }} className="opacity-40 hover:opacity-100 transition-opacity">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                        <AutoTranslatedText text="유물 명칭 (Title)" />
                                    </label>
                                    <div className="relative">
                                        <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                        <textarea 
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="예: 금동향로"
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all resize-none text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-2 block">
                                        <AutoTranslatedText text="이미지 설정 (Image Setup)" />
                                    </label>
                                    
                                    <div className="space-y-4">
                                        {/* URL Input */}
                                        <div className="relative">
                                            <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input 
                                                type="text"
                                                value={newImageUrl}
                                                onChange={(e) => {
                                                    setNewImageUrl(e.target.value);
                                                    if (previewUrl) {
                                                        setPreviewUrl(null);
                                                    }
                                                }}
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="h-[1px] flex-grow bg-white/5" />
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">or</span>
                                            <div className="h-[1px] flex-grow bg-white/5" />
                                        </div>

                                        {/* File Upload Trigger */}
                                        <input 
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        
                                        {!previewUrl ? (
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group"
                                            >
                                                <UploadCloud size={32} className="text-white/20 group-hover:text-white/40 mb-3 transition-colors" />
                                                <span className="text-xs font-bold text-white/40 group-hover:text-white/60">
                                                    <AutoTranslatedText text="이미지 파일 직접 업로드 (Click to Upload)" />
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="relative rounded-2xl overflow-hidden border border-white/20 group">
                                                <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewUrl(null);
                                                        }}
                                                        className="px-4 py-2 rounded-lg bg-red-500/80 text-white text-[10px] font-black tracking-widest uppercase hover:bg-red-500 transition-colors"
                                                    >
                                                        <AutoTranslatedText text="Remove File" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAddItem}
                                    disabled={isUploading}
                                    className="w-full py-5 rounded-2xl font-black tracking-[0.2em] uppercase transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    style={{ backgroundColor: theme.accentColor, color: theme.color1 }}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            <AutoTranslatedText text="업로드 중..." />
                                        </>
                                    ) : (
                                        <AutoTranslatedText text={isEditMode ? "Update Collection" : "Add to Collection"} />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[12000] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.button 
                            className="absolute top-10 right-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-[2110]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X size={24} />
                        </motion.button>
                        
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 25 }}
                            src={selectedImage} 
                            alt="Artifact Preview" 
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="py-20 px-6 border-t mt-32" style={{ backgroundColor: `${theme.color1}44`, borderColor: `${theme.color3}44` }}>
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="text-2xl font-serif font-black opacity-40">DEPT. MUSEUM</div>
                        <p className="text-xs font-bold tracking-widest opacity-30 uppercase max-w-md">
                            <AutoTranslatedText text="상호작용하는 가상 전시장, 디지털 헤리티지의 새로운 지평을 엽니다." />
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VirtualMuseumPage;
