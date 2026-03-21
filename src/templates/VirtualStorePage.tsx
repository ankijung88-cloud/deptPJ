import React, { useState, useEffect, useRef, Suspense } from 'react';
console.log("VirtualStorePage.tsx version 2 loaded");

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ShoppingBag, CreditCard, ArrowLeft, Tag, ShoppingCart, Info, Plus, UploadCloud, ChevronLeft, ChevronRight, Check, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { JOSEON_THEMES } from '../utils/themeUtils';
import { FeaturedItem } from '../types';
import { getProductById } from '../api/products';
import { useFloors } from '../context/FloorContext';
import { useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { useAdmin } from '../hooks/useAdmin';

// --- Sub-components for 3D Viewer ---

const DisplacementMesh: React.FC<{ imageUrl: string, scale?: number, subdivisions?: number }> = ({ imageUrl, scale = 0.6, subdivisions = 128 }) => {
    if (!imageUrl) return null;
    
    const texture = useLoader(THREE.TextureLoader, imageUrl);
    const meshRef = useRef<THREE.Mesh>(null);

    return (
        <mesh ref={meshRef} castShadow receiveShadow>
            <planeGeometry args={[3.2, 4.2, subdivisions, subdivisions]} />
            <meshStandardMaterial 
                map={texture} 
                displacementMap={texture}
                displacementScale={scale}
                displacementBias={-0.1}
                roughness={0.5}
                metalness={0.2}
            />
        </mesh>
    );
};

const ProductModel: React.FC<{ item: FeaturedItem }> = ({ item }) => {
    const { imageUrl, sideImageUrl, backImageUrl } = item;
    
    return (
        <group>
            <Suspense fallback={null}>
                {/* 1. Front View */}
                <group position={[0, 0, 0.4]}>
                    <DisplacementMesh imageUrl={imageUrl} scale={0.4} />
                </group>

                {/* 2. Back View - use backImageUrl or fallback to main */}
                <group position={[0, 0, -0.4]} rotation={[0, Math.PI, 0]}>
                    <DisplacementMesh imageUrl={backImageUrl || imageUrl} scale={0.4} />
                </group>

                {/* 3. Side Views - use sideImageUrl or fallback to main */}
                {sideImageUrl && (
                    <>
                        <group position={[1.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                            <DisplacementMesh imageUrl={sideImageUrl} scale={0.2} subdivisions={64} />
                        </group>
                        <group position={[-1.6, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                            <DisplacementMesh imageUrl={sideImageUrl} scale={0.2} subdivisions={64} />
                        </group>
                    </>
                )}
            </Suspense>
            
            {/* 4. Exhibition Stand (Base) */}
            <mesh position={[0, -2.5, 0]}>
                <cylinderGeometry args={[2.5, 2.8, 0.4, 32]} />
                <meshStandardMaterial color="#0a0a0a" metalness={1} roughness={0.1} />
            </mesh>

            <spotLight position={[5, 5, 5]} intensity={2} angle={0.4} penumbra={1} castShadow />
            <spotLight position={[-5, 5, -5]} intensity={1.5} angle={0.4} penumbra={1} color="#00d4ff" />
            <pointLight position={[0, 2, 3]} intensity={1} />
        </group>
    );
};

const Product3DViewer: React.FC<{ item: FeaturedItem | null }> = ({ item }) => {
    if (!item) return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4">
            <ShoppingBag size={48} strokeWidth={1} />
            <AutoTranslatedText text="상품을 선택하여 3D로 확인하세요" />
        </div>
    );

    return (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas shadows gl={{ antialias: true, powerPreference: 'high-performance' }}>
                <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={40} />
                <ambientLight intensity={0.4} />
                
                {/* Dynamic Studio Lighting */}
                <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
                <spotLight position={[-5, 5, 5]} angle={0.2} penumbra={1} intensity={1} color="#ffaa00" />
                <pointLight position={[0, -5, 5]} intensity={0.5} />
                
                <Suspense fallback={null}>
                    {/* Near zero floating as requested (제자리에 있도록) */}
                    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.1}>
                        <ProductModel item={item} />
                    </Float>
                    <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={8} blur={2.5} far={4} color="#000" />
                </Suspense>

                <OrbitControls 
                    enableZoom={true} 
                    enablePan={false} 
                    minDistance={4} 
                    maxDistance={12}
                    autoRotate={true}
                    autoRotateSpeed={1}
                    makeDefault
                />
            </Canvas>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-[pulse_2s_infinite]" />
                 <span className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Holographic Engine Active</span>
            </div>
        </div>
    );
};


// --- Main Page Component ---

const VirtualStorePage: React.FC = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    const [selectedItem, setSelectedItem] = useState<FeaturedItem | null>(null);
    
    // Determine the effective parent ID (favor params, fallback to state)
    const parentId = paramId || location.state?.parentId;
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseComplete, setPurchaseComplete] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [detailItem, setDetailItem] = useState<FeaturedItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const { isAdmin: isAdminLoggedIn, role, user } = useAdmin();
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);
    const isManagementAllowed = isAdminLoggedIn || (role === 'agency' && String(parentProduct?.agency_id) === String(user?.id));
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
        { id: 'store', label: '가상 스토어', type: 'template' }
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


    const getLoc = (val: any, lang: string): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[lang] || val['ko'] || '';
    };

    // Using "Hunter Amber" (index 4) theme for Store - warm, premium, and commercial
    const theme = JOSEON_THEMES[4]; 

    const [storeItems, setStoreItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newShortDescription, setNewShortDescription] = useState('장인의 손길이 닿은 프리미엄 전통 공예품입니다.');
    const [newLongDescription, setNewLongDescription] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newDetailImageUrl, setNewDetailImageUrl] = useState('');
    const [newSideImageUrl, setNewSideImageUrl] = useState('');
    const [newBackImageUrl, setNewBackImageUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [detailPreviewUrl, setDetailPreviewUrl] = useState<string | null>(null);
    const [sidePreviewUrl, setSidePreviewUrl] = useState<string | null>(null);
    const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const detailFileInputRef = useRef<HTMLInputElement>(null);
    const sideFileInputRef = useRef<HTMLInputElement>(null);
    const backFileInputRef = useRef<HTMLInputElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const effectiveParentId = parentId; // Use calculated parentId
            const url = effectiveParentId 
                ? `/api/products/category/store?parentId=${effectiveParentId}`
                : '/api/products/category/store';
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                }
            });
            const data = await response.json();
            const normalizedData = data.map((dbItem: any) => ({
                id: dbItem.id,
                title: typeof dbItem.title === 'string' ? JSON.parse(dbItem.title) : dbItem.title,
                category: dbItem.category,
                description: typeof dbItem.description === 'string' ? JSON.parse(dbItem.description) : dbItem.description,
                long_description: typeof dbItem.long_description === 'string' ? JSON.parse(dbItem.long_description) : dbItem.long_description,
                imageUrl: dbItem.image_url,
                thumbnailUrl: dbItem.thumbnail_url,
                sideImageUrl: dbItem.side_image_url,
                backImageUrl: dbItem.back_image_url,
                date: typeof dbItem.event_date === 'string' ? JSON.parse(dbItem.event_date) : dbItem.event_date,
                location: typeof dbItem.location === 'string' ? JSON.parse(dbItem.location) : dbItem.location,
                price: dbItem.price || '₩0',
                agency_id: dbItem.agency_id
            }));
            setStoreItems(normalizedData);
            
            // Update selectedItem/detailItem references if they exist
            if (selectedItem) {
                const refreshed = normalizedData.find((i: any) => i.id === selectedItem.id);
                if (refreshed) setSelectedItem(refreshed);
            }
            if (detailItem) {
                const refreshed = normalizedData.find((i: any) => i.id === detailItem.id);
                if (refreshed) setDetailItem(refreshed);
            }

            // Default select first item
            if (normalizedData.length > 0 && !selectedItem) {
                setSelectedItem(normalizedData[0]);
            }
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
        if (!isLoading && storeItems.length > 0 && location.state?.initialId) {
            const initialItem = storeItems.find(item => item.id === location.state.initialId);
            if (initialItem) {
                setSelectedItem(initialItem);
            }
        }
    }, [isLoading, storeItems, location.state]);

    const handleEditInitiate = (item: FeaturedItem) => {
        setIsEditMode(true);
        setEditingId(item.id);
        setNewTitle(typeof item.title === 'string' ? item.title : item.title.ko);
        
        const priceVal = typeof item.price === 'string' 
            ? item.price 
            : (item.price?.ko || '');
        setNewPrice(priceVal);

        setNewShortDescription(getLoc(item.description, 'ko'));
        setNewLongDescription(getLoc(item.long_description, 'ko'));
        
        setPreviewUrl(item.imageUrl);
        setNewImageUrl(item.imageUrl);
        
        setDetailPreviewUrl(item.thumbnailUrl || null);
        setNewDetailImageUrl(item.thumbnailUrl || '');
        
        setSidePreviewUrl(item.sideImageUrl || null);
        setNewSideImageUrl(item.sideImageUrl || '');
        
        setBackPreviewUrl(item.backImageUrl || null);
        setNewBackImageUrl(item.backImageUrl || '');
        
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const adminToken = sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/products/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (res.ok) {
                alert('삭제되었습니다.');
                fetchItems();
                if (selectedItem?.id === id) setSelectedItem(null);
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('삭제에 실패했습니다.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'detail' | 'side' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                if (type === 'main') setPreviewUrl(res);
                else if (type === 'detail') setDetailPreviewUrl(res);
                else if (type === 'side') setSidePreviewUrl(res);
                else if (type === 'back') setBackPreviewUrl(res);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddItem = async () => {
        if (!newTitle) {
            alert('상품 명칭을 입력해주세요.');
            return;
        }

        setIsUploading(true);
        try {
            let finalImageUrl = newImageUrl;
            let finalDetailImageUrl = newDetailImageUrl;
            let finalSideImageUrl = newSideImageUrl;
            let finalBackImageUrl = newBackImageUrl;

            const adminToken = sessionStorage.getItem('admin_token');

            const uploadFile = async (file: File) => {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await fetch('/api/upload', { 
                    method: 'POST', 
                    body: formData,
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });
                if (!uploadRes.ok) throw new Error('Upload failed');
                const data = await uploadRes.json();
                return data.url;
            };

            if (fileInputRef.current?.files?.[0]) finalImageUrl = await uploadFile(fileInputRef.current.files[0]);
            if (detailFileInputRef.current?.files?.[0]) finalDetailImageUrl = await uploadFile(detailFileInputRef.current.files[0]);
            if (sideFileInputRef.current?.files?.[0]) finalSideImageUrl = await uploadFile(sideFileInputRef.current.files[0]);
            if (backFileInputRef.current?.files?.[0]) finalBackImageUrl = await uploadFile(backFileInputRef.current.files[0]);

            if (!finalImageUrl) {
                alert('기본 상품 이미지를 등록해주세요.');
                return;
            }

            const newItem = {
                id: isEditMode ? editingId : `store-${Date.now()}`,
                title: { ko: newTitle, en: newTitle },
                category: 'store',
                subcategory: 'general',
                description: { ko: newShortDescription || '장인의 손길이 닿은 프리미엄 전통 공예품입니다.', en: 'Premium traditional craft made by a master.' },
                long_description: { ko: newLongDescription || '상세 정보가 등록되지 않았습니다.', en: newLongDescription || 'No detailed info.' },
                image_url: finalImageUrl,
                thumbnail_url: finalDetailImageUrl || '',
                side_image_url: finalSideImageUrl || '',
                back_image_url: finalBackImageUrl || '',
                event_date: { ko: 'In Stock', en: 'In Stock' },
                location: { ko: 'Boutique', en: 'Boutique' },
                price: newPrice || `₩${Math.floor(Math.random() * 10 + 5)},000`,
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
                setNewPrice('');
                setNewShortDescription('장인의 손길이 닿은 프리미엄 전통 공예품입니다.');
                setNewLongDescription('');
                setNewImageUrl('');
                setNewDetailImageUrl('');
                setNewSideImageUrl('');
                setNewBackImageUrl('');
                setPreviewUrl(null);
                setDetailPreviewUrl(null);
                setSidePreviewUrl(null);
                setBackPreviewUrl(null);
                setShowAddModal(false);
                setIsEditMode(false);
                setEditingId(null);
            } else {
                const errorData = await res.json();
                alert(`처리 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('Operation failed:', error);
            alert('서버 연결에 실패했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const handlePurchase = () => {
        setIsPurchasing(true);
        // Simulate payment process
        setTimeout(() => {
            setIsPurchasing(false);
            setPurchaseComplete(true);
            setTimeout(() => setPurchaseComplete(false), 3000);
        }, 2000);
    };

    const scrollSlider = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = 300;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden" style={theme.bgStyle}>
            {/* Store Header */}
            <header className="relative w-full py-12 px-6 md:px-12 border-b z-[50]" style={{ borderColor: `${theme.color3}22` }}>
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
                        className="flex items-center gap-2 mb-6 opacity-60 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-widest relative z-[60]"
                        style={{ color: theme.highlightColor }}
                    >
                        <ArrowLeft size={14} />
                        <AutoTranslatedText text="Back" />
                    </button>
                    
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                             <div className="flex items-center gap-4 mb-3">
                                <Link 
                                    to={currentFloor ? `/inspiration?floor=${currentFloor.floor.toLowerCase()}` : '/inspiration'}
                                    className="px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-lg hover:brightness-110 transition-all relative z-[60]" 
                                     style={{ backgroundColor: `${theme.color2}44`, color: theme.highlightColor, border: `1px solid ${theme.color3}33` }}>
                                    <AutoTranslatedText text="아카이브" /> {floorLabel}
                                </Link>
                                <div className="h-[1px] w-12 bg-white/10" />
                                <span className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-20">Virtual Commerce V2</span>
                            </div>
                            
                            <h1 className="text-4xl md:text-7xl font-sans font-black mb-4 leading-tight uppercase tracking-tighter" 
                                style={{ color: theme.highlightColor, textShadow: `0 0 40px ${theme.glowColor}22` }}>
                                <AutoTranslatedText text="3D 상품 리베이트" />
                            </h1>
                        </div>
                        
                        <div className="flex bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                            <div className="px-6 py-4 flex flex-col items-center border-r border-white/10">
                                <span className="text-xl font-black" style={{ color: theme.highlightColor }}>{storeItems.length}</span>
                                <span className="text-[8px] font-bold tracking-widest uppercase opacity-30">Artifacts</span>
                            </div>
                            <div className="px-6 py-4 flex items-center justify-center">
                                <ShoppingCart size={20} className="opacity-40" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 md:px-12 py-12 space-y-20">
                
                {/* 1. Product Slider Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center" style={{ color: theme.accentColor }}>
                                <Tag size={16} />
                             </div>
                             <h3 className="text-xl font-black uppercase tracking-tight text-white/80">
                                <AutoTranslatedText text="Collection Slider" />
                             </h3>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => scrollSlider('left')} className="p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                <ChevronLeft size={20} className="text-white/40" />
                             </button>
                             <button onClick={() => scrollSlider('right')} className="p-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                <ChevronRight size={20} className="text-white/40" />
                             </button>
                        </div>
                    </div>

                    <div 
                        ref={sliderRef}
                        className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar"
                    >
                        {isLoading ? (
                            [1,2,3,4,5].map(i => (
                                <div key={i} className="min-w-[280px] h-[380px] rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
                            ))
                        ) : storeItems.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedItem(item)}
                                className={`min-w-[280px] h-[380px] rounded-3xl border transition-all cursor-pointer snap-start relative overflow-hidden group ${
                                    selectedItem?.id === item.id 
                                    ? 'border-white/40 bg-white/10 shadow-2xl' 
                                    : 'border-white/5 bg-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                                }`}
                            >
                                <img src={item.imageUrl} alt={getLoc(item.title, 'ko')} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                     <div className="text-[9px] font-black tracking-widest text-white/40 uppercase mb-2">{getLoc(item.price, i18n.language)}</div>
                                     <h4 className="text-lg font-black text-white uppercase leading-tight">
                                        <AutoTranslatedText text={getLoc(item.title, i18n.language)} />
                                     </h4>
                                </div>
                                {selectedItem?.id === item.id && (
                                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 2. Interactive 3D Showcase Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 h-[70vh] rounded-[3.5rem] bg-black/40 border border-white/5 relative overflow-hidden group shadow-inner">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
                         <Product3DViewer item={selectedItem} />
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-center gap-10">
                        {selectedItem ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={selectedItem.id}
                                className="space-y-8"
                            >
                                <div>
                                    <span className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase mb-4 block">Product Identification</span>
                                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-4" style={{ color: theme.highlightColor }}>
                                        <AutoTranslatedText text={getLoc(selectedItem.title, i18n.language)} />
                                    </h2>
                                    <div className="flex items-center gap-4 text-white/60">
                                         <div className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black text-xl">
                                             {getLoc(selectedItem.price, i18n.language)}
                                         </div>
                                         <div className="text-[10px] font-bold tracking-widest uppercase opacity-40">Tax Included / Global Shipping</div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                     <h5 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                         <Info size={12} />
                                         <AutoTranslatedText text="Product Description" />
                                     </h5>
                                     <p className="text-sm text-white/60 leading-relaxed font-medium">
                                         <AutoTranslatedText text={getLoc(selectedItem.description, i18n.language) || '최고급 소재를 사용하고 한국 전통 공예 전문가의 손길로 완성된 명품 제품입니다.'} />
                                     </p>
                                </div>

                                <div className="space-y-4">
                                    <button 
                                        onClick={handlePurchase}
                                        disabled={isPurchasing || purchaseComplete}
                                        className="w-full py-6 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden group active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isPurchasing ? (
                                                <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                    <AutoTranslatedText text="Processing..." />
                                                </motion.div>
                                            ) : purchaseComplete ? (
                                                <motion.div key="complete" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                    <Check size={18} />
                                                    <AutoTranslatedText text="Payment Success" />
                                                </motion.div>
                                            ) : (
                                                <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                    <CreditCard size={18} />
                                                    <AutoTranslatedText text="결제 진행하기 (Checkout)" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-1000" />
                                    </button>
                                    
                                    <button 
                                         onClick={() => { setDetailItem(selectedItem); setShowDetailModal(true); }}
                                         className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-3"
                                     >
                                          <AutoTranslatedText text="상세설명보기 (View Details)" />
                                     </button>

                                      {isManagementAllowed && (
                                         <div className="grid grid-cols-2 gap-4">
                                             <button 
                                                  onClick={() => handleEditInitiate(selectedItem)}
                                                  className="py-6 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                             >
                                                  <Pencil size={14} />
                                                  <AutoTranslatedText text="수정 (Edit)" />
                                             </button>
                                             <button 
                                                  onClick={() => handleDelete(selectedItem.id)}
                                                  className="py-6 rounded-2xl bg-white/5 border border-white/10 text-red-500/40 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                                             >
                                                  <Trash2 size={14} />
                                                  <AutoTranslatedText text="삭제 (Delete)" />
                                             </button>
                                         </div>
                                     )}

                                     <button className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all">
                                          <AutoTranslatedText text="장바구니 담기 (Add to Cart)" />
                                     </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-center opacity-20 py-20">
                                 <AutoTranslatedText text="상품 정보가 선택되지 않았습니다." />
                            </div>
                        )}
                    </div>
                </section>

                {isManagementAllowed && (
                    <div className="flex justify-center pt-10">
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Plus size={18} className="text-white" />
                            </div>
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors">
                                <AutoTranslatedText text="새 상품 등록 (Manager)" />
                            </span>
                        </button>
                    </div>
                )}
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
                            className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        {isEditMode ? '상품 정보 수정' : '신규 상품 등록'}
                                    </h3>
                                    <button onClick={() => { setShowAddModal(false); setIsEditMode(false); }} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X size={20} /></button>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">상품 명칭</label>
                                            <input 
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none"
                                                placeholder="Enter title..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">판매 금액</label>
                                            <input 
                                                type="text"
                                                value={newPrice}
                                                onChange={(e) => setNewPrice(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none"
                                                placeholder="₩0,000"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">상품 한줄 설명</label>
                                        <input 
                                            type="text"
                                            value={newShortDescription}
                                            onChange={(e) => setNewShortDescription(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none"
                                            placeholder="Enter short description (shown on card)..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">세부 상세 설명</label>
                                        <textarea 
                                            value={newLongDescription}
                                            onChange={(e) => setNewLongDescription(e.target.value)}
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none resize-none"
                                            placeholder="Enter detailed description (shown on detail modal)..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">메인 이미지 (3D 정면)</label>
                                            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'main')} accept="image/*" className="hidden" />
                                            {!previewUrl ? (
                                                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold">Front Image</span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white">Remove</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">측면 이미지 (3D 측면)</label>
                                            <input type="file" ref={sideFileInputRef} onChange={(e) => handleFileChange(e, 'side')} accept="image/*" className="hidden" />
                                            {!sidePreviewUrl ? (
                                                <button onClick={() => sideFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold">Side Image</span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={sidePreviewUrl} alt="Side Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setSidePreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white">Remove</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">후면 이미지 (3D 후면)</label>
                                            <input type="file" ref={backFileInputRef} onChange={(e) => handleFileChange(e, 'back')} accept="image/*" className="hidden" />
                                            {!backPreviewUrl ? (
                                                <button onClick={() => backFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold">Back Image</span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={backPreviewUrl} alt="Back Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setBackPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white">Remove</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">상세 정보용 이미지</label>
                                            <input type="file" ref={detailFileInputRef} onChange={(e) => handleFileChange(e, 'detail')} accept="image/*" className="hidden" />
                                            {!detailPreviewUrl ? (
                                                <button onClick={() => detailFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold">Detail Image</span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={detailPreviewUrl} alt="Detail Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setDetailPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white">Remove</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleAddItem}
                                        disabled={isUploading || !newTitle || (!newImageUrl && !previewUrl)}
                                        className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest disabled:opacity-20 translate-y-2 flex items-center justify-center gap-3"
                                        style={{ backgroundColor: theme.accentColor }}
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <AutoTranslatedText text="업로드 중..." />
                                            </>
                                        ) : (
                                            <AutoTranslatedText text={isEditMode ? 'Update Product' : 'Register Product'} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {showDetailModal && detailItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[30000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-5xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
                        >
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="absolute top-8 right-8 z-[30010] w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={24} />
                            </button>

                            <div className="w-full md:w-1/2 h-full bg-black flex items-center justify-center p-12">
                                <img 
                                    src={detailItem.thumbnailUrl || detailItem.imageUrl} 
                                    alt="Detail view" 
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                                />
                            </div>

                            <div className="w-full md:w-1/2 h-full p-12 flex flex-col justify-center gap-8 border-l border-white/5 overflow-y-auto">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black tracking-[0.4em] text-orange-500 uppercase">Product Archives</span>
                                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                                        <AutoTranslatedText text={getLoc(detailItem.title, i18n.language)} />
                                    </h2>
                                </div>

                                <div className="h-[2px] w-12 bg-orange-500/20" />

                                <div className="space-y-6">
                                     <h5 className="text-[10px] font-black uppercase tracking-widest text-white/20">상세 스토리 & 설명</h5>
                                     <p className="text-lg text-white/60 leading-relaxed font-medium">
                                          <AutoTranslatedText text={getLoc(detailItem.long_description, i18n.language) || '해당 상품의 상세 설명이 등록되지 않았습니다.'} />
                                     </p>
                                </div>

                                 <div className="pt-8 grid grid-cols-2 gap-4">
                                     <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-2">Category</span>
                                          <span className="text-xs font-bold text-white uppercase">{detailItem.category}</span>
                                     </div>
                                     <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-2">Pricing</span>
                                          <span className="text-xs font-bold text-white uppercase">{getLoc(detailItem.price, i18n.language)}</span>
                                     </div>
                                </div>

                                <div className="pt-8">
                                    <button 
                                        onClick={handlePurchase}
                                        disabled={isPurchasing || purchaseComplete}
                                        className="w-full py-8 rounded-[2rem] bg-white text-black font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden group active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-white/5"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isPurchasing ? (
                                                <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                    <AutoTranslatedText text="Processing..." />
                                                </motion.div>
                                            ) : purchaseComplete ? (
                                                <motion.div key="complete" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                    <Check size={18} />
                                                    <AutoTranslatedText text="Payment Success" />
                                                </motion.div>
                                            ) : (
                                                <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex items-center justify-center gap-3">
                                                    <CreditCard size={18} />
                                                    <AutoTranslatedText text="지금 결제하기 (Purchase Now)" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-1000" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="mt-40 border-t py-20 px-6 backdrop-blur-3xl" style={{ borderColor: `${theme.color3}11` }}>
                 <div className="container mx-auto flex flex-col items-center gap-6">
                      <div className="text-4xl font-black tracking-tighter opacity-10 uppercase">DEPT. STORE IMMERSIVE</div>
                      <p className="text-[9px] font-bold tracking-[0.5em] opacity-30 uppercase text-center max-w-lg leading-loose">
                         The convergence of traditional aesthetics and cutting-edge virtual commerce technology.
                      </p>
                 </div>
            </footer>
        </div>
    );
};

export default VirtualStorePage;
