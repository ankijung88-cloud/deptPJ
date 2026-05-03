import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Compass, Info, ArrowLeft, Maximize2, Plus, Image as ImageIcon, Type, UploadCloud, Edit3, Trash2, Check } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { FeaturedItem } from '../types';
import { getLocalizedText } from '../utils/i18nUtils';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { getProductById } from '../api/products';
import { useFloors } from '../context/FloorContext';
import { useAdmin } from '../hooks/useAdmin';
import { updateProduct } from '../api/products';

interface MuseumCardProps {
    item: FeaturedItem;
    theme: any;
    lang: string;
    onImageClick: (url: string) => void;
    onEdit: (item: FeaturedItem) => void;
    onDelete: (id: string) => void;
    isManagementAllowed?: boolean;
}

const MuseumCard: React.FC<MuseumCardProps> = ({ item, theme, lang, onImageClick, onEdit, onDelete, isManagementAllowed }) => {
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
                    className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-center p-6 text-center shadow-xl overflow-hidden group-hover:border-red-600 transition-all duration-500"
                    style={{ 
                        backgroundColor: '#FFF5F5', 
                        borderColor: '#FEE2E2', // rose-100
                        backfaceVisibility: 'hidden',
                        zIndex: isFlipped ? 0 : 1
                    }}
                >
                    <div className="mb-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500 text-red-600">
                        <Compass size={32} />
                    </div>
                    
                    <h3 className="text-lg font-serif font-black leading-tight mb-2 whitespace-pre-wrap break-keep text-neutral-900">
                        <AutoTranslatedText text={displayName} />
                    </h3>
                    
                    <div className="h-[1px] w-8 bg-neutral-200 my-3" />
                    
                    <span className="text-[10px] font-black tracking-widest opacity-40 uppercase text-neutral-500">
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
                            <span className="text-[10px] font-black text-white tracking-widest uppercase">
                                <AutoTranslatedText text={getLocalizedText(item.date, lang)} />
                            </span>
                            {isManagementAllowed && (
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                        className="p-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-900 transition-all border border-neutral-300"
                                    >
                                        <Edit3 size={12} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                        className="p-1.5 rounded-lg bg-neutral-200 hover:bg-red-600 text-neutral-900 hover:text-white transition-all border border-neutral-300"
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
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-xl group/btn"
                        >
                            <span className="text-[10px] font-black tracking-widest uppercase">
                                <AutoTranslatedText text="감상하기" />
                            </span>
                            <Maximize2 size={12} className="group-hover/btn:scale-110 transition-all" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

interface VirtualMuseumPageProps {
    item?: FeaturedItem;
    productId?: string;
    onClose?: () => void;
}

const VirtualMuseumPage: React.FC<VirtualMuseumPageProps> = ({ item: propItem, productId: _propProductId, onClose }) => {
    const { i18n, t } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    useImmersiveMode(!!selectedImage);
    const { isAdmin: isAdminLoggedIn, role, user } = useAdmin();
    
    // Determine the effective parent ID (favor params, fallback to state)
    const parentId = paramId || location.state?.parentId;

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Inline Editing for Page Metadata
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDesc, setTempDesc] = useState('');

    // Standardized Ivory Theme Tokens
    const theme = {
        bgStyle: { backgroundColor: '#FFFFFF' },
        color1: '#FFFFFF',
        color2: '#FFFFFF',
        color3: '#171717',
        accentColor: '#DC2626', // red-600
        highlightColor: '#171717',
        textPrimary: '#171717',
        glowColor: '#DC2626'
    };

    const [museumItems, setMuseumItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(propItem || null);
    const isManagementAllowed = isAdminLoggedIn || (role === 'agency' && String(parentProduct?.agency_id) === String(user?.id));
    const [isUploading, setIsUploading] = useState(false);
    const { floors } = useFloors();

    // Set Breadcrumb Path
    const currentFloor = floors.find(f => f.floor.toLowerCase() === parentProduct?.category?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === parentProduct?.subcategory);
    const floorNum = parentProduct?.category?.replace('floor-', '') || currentFloor?.floor?.replace('F', '').replace('f', '') || '';
    const floorLabel = floorNum ? `Floor-${floorNum}` : (currentFloor?.floor || parentProduct?.category || '');

    useSetBreadcrumbPath(parentProduct ? [
        { id: currentFloor?.floor || parentProduct.category, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || parentProduct.subcategory, label: currentCategory?.label || parentProduct.subcategory, type: 'category' },
        { id: 'detail', label: <AutoTranslatedText text="상세" />, type: 'detail' },
        { id: parentProduct.id, label: parentProduct.title, type: 'detail' },
        { id: 'museum', label: <AutoTranslatedText text="가상 전시관" />, type: 'template' }
    ] : []);

    useEffect(() => {
        const fetchParent = async () => {
            if (propItem) {
                setParentProduct(propItem);
                initializeMetadata(propItem);
                return;
            }

            if (parentId) {
                const data = await getProductById(parentId);
                if (data) {
                    setParentProduct(data);
                    initializeMetadata(data);
                }
            }
        };

        const initializeMetadata = (data: FeaturedItem) => {
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

            const museumMeta = templates.find((t: any) => t.id === 'museum');
            // Always load Korean for the editable fields to ensure consistency
            setTempTitle(museumMeta?.title?.ko || (typeof museumMeta?.title === 'string' ? museumMeta.title : '') || t("가상 박물관"));
            setTempDesc(museumMeta?.description?.ko || (typeof museumMeta?.description === 'string' ? museumMeta.description : '') || t("전 세계의 진귀한 유물과 예술품을 고해상도 2D로 감상하세요. 역사의 숨결을 생생하게 느낄 수 있는 디지털 전시관입니다."));
        };

        fetchParent();
    }, [parentId, i18n.language, propItem]);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const effectiveParentId = parentId;
            const url = effectiveParentId 
                ? `/api/products/category/museum?parentId=${effectiveParentId}`
                : '/api/products/category/museum';
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                }
            });
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('[VirtualMuseum] Expected array from API, got:', data);
                setMuseumItems([]);
                return;
            }

            const safeParse = (str: any) => {
                if (!str) return null;
                if (typeof str !== 'string') return str;
                try {
                    const trimmed = str.trim();
                    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                        return JSON.parse(str);
                    }
                    return str;
                } catch (e) {
                    return str;
                }
            };

            const normalizedData = data.map((dbItem: any) => ({
                id: dbItem.id,
                title: safeParse(dbItem.title),
                category: dbItem.category,
                description: safeParse(dbItem.description),
                imageUrl: dbItem.image_url,
                date: safeParse(dbItem.event_date),
                location: safeParse(dbItem.location),
                price: dbItem.price,
                agency_id: dbItem.agency_id
            }));
            
            console.log(`[VirtualMuseum] Loaded ${normalizedData.length} items`);
            setMuseumItems(normalizedData);
        } catch (error) {
            console.error('Failed to fetch museum items:', error);
            setMuseumItems([]);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchItems();
    }, [parentId, i18n.language]);


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
        const confirmMsg = await translateAsync('정말 삭제하시겠습니까?');
        if (!window.confirm(confirmMsg)) return;
        try {
            const adminToken = sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/products/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (res.ok) {
                const successMsg = await translateAsync('삭제되었습니다.');
                alert(successMsg);
                fetchItems();
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            const errorMsg = await translateAsync('삭제에 실패했습니다.');
            alert(errorMsg);
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
            const msg = await translateAsync('유물 명칭을 입력해주세요.');
            alert(msg);
            return;
        }

        setIsUploading(true);
        try {
            let finalImageUrl = newImageUrl;
            const adminToken = sessionStorage.getItem('admin_token');
            
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
                const successMsg = await translateAsync(isEditMode ? '수정 성공' : '등록 성공');
                alert(successMsg);
                await fetchItems();
                setNewTitle('');
                setNewImageUrl('');
                setPreviewUrl(null);
                setShowAddModal(false);
                setIsEditMode(false);
                setEditingId(null);
            } else {
                const errorData = await res.json();
                const failMsg = await translateAsync('처리 실패');
                alert(`${failMsg}: ${errorData.message || 'Error'}`);
            }
        } catch (error) {
            console.error('Save failed:', error);
            const msg = await translateAsync('서버 연결에 실패했습니다.');
            alert(msg);
        } finally {
            setIsUploading(false);
        }
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

            // Check if museum template already exists in the selection
            const hasMuseum = templates.some((t: any) => t.id === 'museum');
            
            const updatedTemplates = hasMuseum 
                ? templates.map((t: any) => t.id === 'museum' ? {
                    ...t,
                    title: { ...(typeof t.title === 'object' ? t.title : {}), ko: tempTitle },
                    description: { ...(typeof t.description === 'object' ? t.description : {}), ko: tempDesc }
                } : t)
                : [...templates, {
                    id: 'museum',
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
        <div className="min-h-screen font-sans overflow-x-hidden" style={theme.bgStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
            `}} />

            {/* Header Section */}
            <header className="relative w-full py-20 px-6 md:px-12 border-b z-[50] bg-white/80 backdrop-blur-md shadow-sm" style={{ borderColor: 'rgba(23, 23, 23, 0.05)' }}>
                <div className="container mx-auto relative z-10">
                    <div className="flex justify-between items-start mb-8">
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
                            className="flex items-center gap-2 text-neutral-900 opacity-80 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-widest relative z-[60]"
                        >
                            <ArrowLeft size={14} />
                            <AutoTranslatedText text="Back" />
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
                                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-all text-[10px] font-black tracking-widest uppercase text-neutral-900 shadow-sm"
                                >
                                    {isEditingMetadata ? <Check size={14} /> : <Edit3 size={14} />}
                                    <AutoTranslatedText text={isEditingMetadata ? "Save Changes" : "Edit Page Info"} />
                                </button>
                                {isEditingMetadata && (
                                    <button 
                                        onClick={() => setIsEditingMetadata(false)}
                                        className="p-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-400"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => { setIsEditMode(false); setShowAddModal(true); }}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-all text-[10px] font-black tracking-widest uppercase text-white shadow-lg"
                                >
                                    <Plus size={14} />
                                    <AutoTranslatedText text="Add Content" />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-4 mb-4">
                            <Link 
                                to={currentFloor ? `/inspiration?floor=${currentFloor.floor.toLowerCase()}` : '/inspiration'}
                                className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-neutral-200 bg-white hover:bg-neutral-50 transition-all relative z-[60] text-neutral-900 shadow-sm" 
                            >
                                <AutoTranslatedText text="아카이브" /> {floorLabel}
                            </Link>
                                <div className="h-[1px] w-12 bg-neutral-200" />
                        </div>
                        
                        {isEditingMetadata ? (
                            <textarea 
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-4xl md:text-5xl font-serif font-black mb-6 text-neutral-900 focus:outline-none focus:border-red-600 transition-all resize-none shadow-inner"
                                rows={2}
                            />
                        ) : (
                            <h1 className="text-4xl md:text-7xl font-serif font-black mb-6 leading-tight text-neutral-900">
                                <AutoTranslatedText text={tempTitle} />
                            </h1>
                        )}
                        
                        {isEditingMetadata ? (
                            <textarea 
                                value={tempDesc}
                                onChange={(e) => setTempDesc(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-lg font-serif italic text-neutral-700 focus:outline-none focus:border-red-600/50 transition-all resize-none shadow-inner"
                                rows={3}
                            />
                        ) : (
                            <p className="text-lg md:text-xl font-serif italic text-neutral-600 max-w-2xl leading-tight">
                                <AutoTranslatedText text={tempDesc} />
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* Grid Layout Section */}
            <main className="container mx-auto px-6 md:px-12 py-20">
                {isLoading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black/20" />
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
                                isManagementAllowed={isManagementAllowed}
                            />
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                    {[
                        { icon: Info, title: t("인터랙티브 전람"), desc: t("앞면의 제목을 확인하고 뒤집어서 유물의 실물을 만나보세요.") },
                        { icon: Compass, title: t("고해상도 뷰어"), desc: t("이미지를 클릭하면 실제 박물관 부럽지 않은 선명한 화질을 경험할 수 있습니다.") },
                        { icon: Plus, title: t("콘텐츠 확장"), desc: t("언제든지 새로운 유물을 추가하여 나만의 가상 전시장을 꾸며보세요.") }
                    ].map((feature, idx) => (
                        <div key={idx} className="p-10 rounded-[2.5rem] border border-neutral-200/50 bg-white group hover:bg-neutral-50 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
                             <feature.icon className="mb-8 text-red-600 opacity-60 group-hover:opacity-100 transition-all" size={40} />
                             <h3 className="text-2xl font-serif font-black mb-4 text-neutral-900"><AutoTranslatedText text={feature.title} /></h3>
                             <p className="text-base text-neutral-500 leading-relaxed font-light"><AutoTranslatedText text={feature.desc} /></p>
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
                        className="fixed inset-0 z-[11000] bg-black/90 flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg rounded-3xl p-10 shadow-2xl bg-white border border-neutral-200"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-serif font-black text-neutral-900">
                                    <AutoTranslatedText text={isEditMode ? "유물 정보 수정" : "새 유물 추가"} />
                                </h2>
                                <button onClick={() => { setShowAddModal(false); setIsEditMode(false); setEditingId(null); }} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-2 block">
                                        <AutoTranslatedText text="유물 명칭 (Title)" />
                                    </label>
                                    <div className="relative">
                                        <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                        <textarea 
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder={i18n.t("예: 금동향로")}
                                            rows={2}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-red-600 transition-all resize-none text-sm shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-2 block">
                                        <AutoTranslatedText text="이미지 설정 (Image Setup)" />
                                    </label>
                                    
                                    <div className="space-y-4">
                                        {/* URL Input */}
                                        <div className="relative">
                                            <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                            <input 
                                                type="text"
                                                value={newImageUrl}
                                                onChange={(e) => {
                                                    setNewImageUrl(e.target.value);
                                                    if (previewUrl) {
                                                        setPreviewUrl(null);
                                                    }
                                                }}
                                                placeholder={i18n.t("/via_station_logo_portal.png")}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-red-600 transition-all text-sm shadow-inner"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="h-[1px] flex-grow bg-neutral-100" />
                                            <span className="text-[8px] font-black text-neutral-300 uppercase tracking-widest"><AutoTranslatedText text="or" /></span>
                                            <div className="h-[1px] flex-grow bg-neutral-100" />
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
                                                className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-red-600/30 hover:bg-neutral-50 transition-all group"
                                            >
                                                <UploadCloud size={32} className="text-neutral-300 group-hover:text-red-600/50 mb-3 transition-colors" />
                                                <span className="text-xs font-bold text-neutral-400 group-hover:text-neutral-600">
                                                    <AutoTranslatedText text="이미지 파일 직접 업로드 (Click to Upload)" />
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 group">
                                                <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewUrl(null);
                                                        }}
                                                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-[10px] font-black tracking-widest uppercase hover:bg-red-700 transition-colors"
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
                                    className="w-full py-5 rounded-2xl font-black tracking-[0.2em] uppercase transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
                            alt={i18n.t("Artifact Preview")}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="py-20 px-6 border-t mt-32 bg-white/50" style={{ borderColor: '#E5E7EB' }}>
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="text-2xl font-serif font-black text-neutral-300">MONGTANG MUSEUM</div>
                        <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase max-w-md">
                            <AutoTranslatedText text="상호작용하는 가상 전시장, 디지털 헤리티지의 새로운 지평을 엽니다." />
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VirtualMuseumPage;
