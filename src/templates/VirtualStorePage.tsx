import React, { useState, useEffect, useRef } from 'react';
console.log("VirtualStorePage.tsx version 2 loaded");

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ShoppingBag, CreditCard, ArrowLeft, Tag, ShoppingCart, Info, Plus, UploadCloud, ChevronLeft, ChevronRight, Check, Pencil, Trash2, Edit3, Search } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { JOSEON_THEMES } from '../utils/themeUtils';
import { FeaturedItem } from '../types';
import { getProductById, updateProduct } from '../api/products';
import { createOrder } from '../api/orders';
import { useFloors } from '../context/FloorContext';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../hooks/useAdmin';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';

// --- Sub-components for Detail Viewer ---

const ProductDetailViewer: React.FC<{ item: FeaturedItem | null }> = ({ item }) => {
    const { i18n } = useTranslation();
    const getLoc = (val: any, lang: string): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[lang] || val['ko'] || '';
    };

    if (!item) return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4">
            <ShoppingBag size={48} strokeWidth={1} />
            <AutoTranslatedText text="상세설명을 확인할 제품을 선택하세요" />
        </div>
    );

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar relative z-10">
            <div className="p-8 md:p-12 space-y-12">
                <div className="w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative bg-black/40 border border-white/5">
                    <img
                        src={item.thumbnailUrl || item.imageUrl}
                        alt={getLoc(item.title, 'ko')}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                    />
                </div>
                
                <div className="space-y-6 pb-20">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Info size={24} className="text-[#00FFC2]" />
                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-[#00FFC2]">
                                <AutoTranslatedText text="상세 스토리 & 설명" />
                            </h3>
                        </div>
                        <div className="w-16 h-[2px] bg-[#00FFC2]/40" />
                    </div>
                    <div className="text-base md:text-lg text-white/80 leading-relaxed md:leading-loose font-medium whitespace-pre-wrap">
                        <AutoTranslatedText text={getLoc(item.long_description, i18n.language) || '상세 정보가 등록되지 않았습니다.'} />
                    </div>
                </div>
            </div>
            
            <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/95 border border-[#00FFC2]/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00FFC2]"><AutoTranslatedText text="Detail Information" /></span>
            </div>
        </div>
    );
};


// --- Main Page Component ---

const VirtualStorePage: React.FC = () => {
    useImmersiveMode(true);
    const { i18n, t } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const { id: routeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine the effective parent ID (favor route params, fallback to state)
    const parentId = routeId || location.state?.parentId;

    const [selectedItem, setSelectedItem] = useState<FeaturedItem | null>(null);
    const [purchaseComplete, setPurchaseComplete] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [detailItem, setDetailItem] = useState<FeaturedItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const { isAdmin: isAdminLoggedIn, role, user } = useAdmin();


    // Inline Editing for Page Metadata
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDesc, setTempDesc] = useState('');

    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);
    const isManagementAllowed = isAdminLoggedIn || (role === 'agency' && String(parentProduct?.agency_id) === String(user?.id));

    const { floors } = useFloors();

    // Checkout Modal States
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [orderInfo, setOrderInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Order Lookup States
    const [showOrderLookupModal, setShowOrderLookupModal] = useState(false);
    const [orderLookupInfo, setOrderLookupInfo] = useState({ name: '', phone: '' });
    const [isSearchingOrder, setIsSearchingOrder] = useState(false);
    const [lookupResult, setLookupResult] = useState<any>(null);

    const getLoc = (val: any, lang: string): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[lang] || val['ko'] || '';
    };

    const formatPrice = (price: number) => {
        return `₩${price.toLocaleString()}`;
    };

    // --- Cart Management ---
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems } = useCart();
    const [showCartDrawer, setShowCartDrawer] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [checkoutMode, setCheckoutMode] = useState<'single' | 'cart'>('single');

    const handleAddToCart = () => {
        if (!selectedItem) return;
        setIsAddingToCart(true);
        addToCart({
            id: selectedItem.id,
            title: selectedItem.title,
            price: selectedItem.price,
            imageUrl: selectedItem.imageUrl,
            quantity: 1
        });
        setTimeout(() => setIsAddingToCart(false), 2000);
    };

    const cartTotal = cart.reduce((acc, item) => {
        const priceStr = getLoc(item.price, i18n.language).replace(/[^0-9]/g, '');
        return acc + (parseInt(priceStr || '0') * item.quantity);
    }, 0);


    // Set Breadcrumb Path
    const currentFloor = floors.find(f => f.floor.toLowerCase() === parentProduct?.category?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === parentProduct?.subcategory);
    const floorNum = parentProduct?.category?.replace('floor-', '') || currentFloor?.floor?.replace('F', '').replace('f', '') || '';
    const floorLabel = floorNum ? `Floor-${floorNum}` : (currentFloor?.floor || parentProduct?.category || '');

    useSetBreadcrumbPath(parentProduct ? [
        { id: currentFloor?.floor || parentProduct.category, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || parentProduct.subcategory, label: currentCategory?.label || parentProduct.subcategory, type: 'category' },
        { id: 'detail', label: t('common.details'), type: 'detail' },
        { id: parentProduct.id, label: getLoc(parentProduct.title, i18n.language), type: 'detail' },
        { id: 'store', label: t('store.store_title'), type: 'template' }
    ] : []);


    useEffect(() => {
        const fetchParent = async () => {
            if (parentId) {
                try {
                    const data = await getProductById(parentId);
                    if (data) {
                        setParentProduct(data);

                        // Safe parsing of selected_templates
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

                        const storeMeta = templates.find((t: any) => t.id === 'store');
                        // Always load English for the editable fields fallbacks to ensure consistency with AutoTranslatedText
                        setTempTitle(storeMeta?.title?.ko || (typeof storeMeta?.title === 'string' ? storeMeta.title : '') || t("store.store_title"));
                        setTempDesc(storeMeta?.description?.ko || (typeof storeMeta?.description === 'string' ? storeMeta.description : '') || t("store.store_desc"));
                    }
                } catch (error) {
                    console.error("Failed to fetch parent product:", error);
                }
            }
        };
        fetchParent();
    }, [parentId, i18n.language]);


    // Using "Hunter Amber" (index 4) theme for Store - warm, premium, and commercial
    const theme = React.useMemo(() => JOSEON_THEMES[Math.floor(Math.random() * JOSEON_THEMES.length)], []);;

    const [storeItems, setStoreItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newShortDescription, setNewShortDescription] = useState('Premium traditional craft product completed with the touch of an artisan.');
    const [newLongDescription, setNewLongDescription] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newDetailImageUrl, setNewDetailImageUrl] = useState('');
    const [newLeftSideImageUrl, setNewLeftSideImageUrl] = useState('');
    const [newRightSideImageUrl, setNewRightSideImageUrl] = useState('');
    const [newBackImageUrl, setNewBackImageUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [detailPreviewUrl, setDetailPreviewUrl] = useState<string | null>(null);
    const [leftSidePreviewUrl, setLeftSidePreviewUrl] = useState<string | null>(null);
    const [rightSidePreviewUrl, setRightSidePreviewUrl] = useState<string | null>(null);
    const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const detailFileInputRef = useRef<HTMLInputElement>(null);
    const leftSideFileInputRef = useRef<HTMLInputElement>(null);
    const rightSideFileInputRef = useRef<HTMLInputElement>(null);
    const backFileInputRef = useRef<HTMLInputElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const url = parentId
                ? `/api/products/category/store?parentId=${parentId}`
                : '/api/products/category/store';

            console.log(`[VirtualStore] Fetching from: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const data = await response.json();
            console.log(`[VirtualStore] Received ${data?.length} items:`, data);

            if (!Array.isArray(data)) {
                console.error('[VirtualStore] Data is not an array:', data);
                setStoreItems([]);
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
                long_description: safeParse(dbItem.long_description),
                imageUrl: dbItem.image_url,
                thumbnailUrl: dbItem.thumbnail_url,
                sideImageUrl: dbItem.side_image_url,
                leftSideImageUrl: dbItem.left_side_image_url,
                rightSideImageUrl: dbItem.right_side_image_url,
                backImageUrl: dbItem.back_image_url,
                date: safeParse(dbItem.event_date),
                location: safeParse(dbItem.location),
                price: dbItem.price || '₩0',
                agency_id: dbItem.agency_id
            }));

            console.log(`[VirtualStore] Loaded ${normalizedData.length} items`);
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
            console.error('Failed to fetch store items:', error);
            setStoreItems([]);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchItems();
    }, [parentId, i18n.language]);


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

        setLeftSidePreviewUrl(item.leftSideImageUrl || null);
        setNewLeftSideImageUrl(item.leftSideImageUrl || '');

        setRightSidePreviewUrl(item.rightSideImageUrl || null);
        setNewRightSideImageUrl(item.rightSideImageUrl || '');

        setBackPreviewUrl(item.backImageUrl || null);
        setNewBackImageUrl(item.backImageUrl || '');

        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        const confirmMsg = t('common.delete_confirm');
        if (!window.confirm(confirmMsg)) return;
        try {
            const adminToken = sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (res.ok) {
                const successMsg = t('store.deleted_success');
                alert(successMsg);
                fetchItems();
                if (selectedItem?.id === id) setSelectedItem(null);
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            const errorMsg = t('store.delete_fail');
            alert(errorMsg);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'detail' | 'back' | 'left' | 'right') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                if (type === 'main') setPreviewUrl(res);
                else if (type === 'detail') setDetailPreviewUrl(res);
                else if (type === 'left') setLeftSidePreviewUrl(res);
                else if (type === 'right') setRightSidePreviewUrl(res);
                else if (type === 'back') setBackPreviewUrl(res);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddItem = async () => {
        if (!newTitle) {
            const msg = t('store.enter_title');
            alert(msg);
            return;
        }

        setIsUploading(true);
        try {
            let finalImageUrl = newImageUrl;
            let finalDetailImageUrl = newDetailImageUrl;
            let finalLeftSideImageUrl = newLeftSideImageUrl;
            let finalRightSideImageUrl = newRightSideImageUrl;
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
            if (leftSideFileInputRef.current?.files?.[0]) finalLeftSideImageUrl = await uploadFile(leftSideFileInputRef.current.files[0]);
            if (rightSideFileInputRef.current?.files?.[0]) finalRightSideImageUrl = await uploadFile(rightSideFileInputRef.current.files[0]);
            if (backFileInputRef.current?.files?.[0]) finalBackImageUrl = await uploadFile(backFileInputRef.current.files[0]);

            if (!finalImageUrl) {
                const msg = t('store.register_image');
                alert(msg);
                return;
            }

            const oldItem = isEditMode ? storeItems.find(i => i.id === editingId) : null;

            const newItem = {
                id: isEditMode ? editingId : `store-${Date.now()}`,
                title: { ko: newTitle, en: newTitle },
                category: 'store',
                subcategory: 'general',
                description: { ko: newShortDescription || '장인의 손길이 닿은 프리미엄 전통 공예품입니다.', en: 'Premium traditional craft made by a master.' },
                long_description: { ko: newLongDescription || '상세 정보가 등록되지 않았습니다.', en: newLongDescription || 'No detailed info.' },
                image_url: finalImageUrl,
                thumbnail_url: finalDetailImageUrl || '',
                side_image_url: oldItem?.sideImageUrl || '',
                left_side_image_url: finalLeftSideImageUrl || '',
                right_side_image_url: finalRightSideImageUrl || '',
                back_image_url: finalBackImageUrl || '',
                event_date: { ko: 'In Stock', en: 'In Stock' },
                location: { ko: 'Boutique', en: 'Boutique' },
                price: newPrice || `₩${Math.floor(Math.random() * 10 + 5)},000`,
                parent_id: parentId || null,
                agency_id: user?.id || null
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
                const successMsg = t(isEditMode ? 'store.update_success' : 'store.register_success');
                alert(successMsg);
                await fetchItems();
                setNewTitle('');
                setNewPrice('');
                setNewShortDescription('Premium traditional craft product completed with the touch of an artisan.');
                setNewLongDescription('');
                setNewImageUrl('');
                setNewDetailImageUrl('');
                setNewLeftSideImageUrl('');
                setNewRightSideImageUrl('');
                setNewBackImageUrl('');
                setPreviewUrl(null);
                setDetailPreviewUrl(null);
                setLeftSidePreviewUrl(null);
                setRightSidePreviewUrl(null);
                setBackPreviewUrl(null);
                setShowAddModal(false);
                setIsEditMode(false);
                setEditingId(null);
            } else {
                const errorData = await res.json();
                const failMsg = t('store.process_fail');
                alert(`${failMsg}: ${errorData.message || 'Error'}`);
            }
        } catch (error) {
            console.error('Operation failed:', error);
            const errorMsg = t('common.server_error');
            alert(errorMsg);
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

            // Check if store template already exists in the selection
            const hasStore = templates.some((t: any) => t.id === 'store');

            const updatedTemplates = hasStore
                ? templates.map((t: any) => t.id === 'store' ? {
                    ...t,
                    title: { ...(typeof t.title === 'object' ? t.title : {}), ko: tempTitle },
                    description: { ...(typeof t.description === 'object' ? t.description : {}), ko: tempDesc }
                } : t)
                : [...templates, {
                    id: 'store',
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
            const successMsg = t('common.save_success');
            alert(successMsg);
        } catch (error) {
            console.error('Failed to save metadata:', error);
            const errorMsg = t('common.save_fail');
            alert(errorMsg);
        }
    };

    const handlePurchase = () => {
        if (!selectedItem) return;
        setCheckoutMode('single');
        setShowCheckoutModal(true);
    };


    const handleCompletePayment = async () => {
        if (!orderInfo.name || !orderInfo.phone || !orderInfo.address) {
            const msg = t('store.enter_order_info');
            alert(msg);
            return;
        }

        setIsProcessingPayment(true);
        try {
            // 1. Simulate PortOne Payment
            await new Promise(resolve => setTimeout(resolve, 2000));
            const simulatedPaymentId = `PAY-${Date.now()}`;

            // 2. Create Order in DB
            const finalPrice = checkoutMode === 'single' 
                ? parseFloat(String(getLoc(selectedItem?.price, i18n.language) || '0').replace(/[^0-9.]/g, ''))
                : cartTotal;

            const orderData = {
                userName: orderInfo.name,
                userPhone: orderInfo.phone,
                userAddress: orderInfo.address,
                productId: checkoutMode === 'single' ? selectedItem?.id : 'MULTIPLE_ITEMS',
                price: finalPrice,
                agencyId: checkoutMode === 'single' ? selectedItem?.agency_id : null,
                paymentId: simulatedPaymentId,
                items: checkoutMode === 'single' ? [{ id: selectedItem?.id, quantity: 1 }] : cart.map(i => ({ id: i.id, quantity: i.quantity }))
            };

            await createOrder(orderData);

            // 3. Success UI
            if (checkoutMode === 'cart') {
                clearCart();
            }
            setIsProcessingPayment(false);
            setShowCheckoutModal(false);
            setPurchaseComplete(true);
            setTimeout(() => setPurchaseComplete(false), 3000);

            const successMsg = await translateAsync('Order has been completed.');
            alert(successMsg);
        } catch (error) {
            console.error('Payment failed:', error);
            setIsProcessingPayment(false);
            const errorMsg = await translateAsync('Payment processing failed.');
            alert(errorMsg);
        }
    };

    const handleLookupOrder = async () => {
        if (!orderLookupInfo.name || !orderLookupInfo.phone) {
            const msg = t('store.enter_lookup_info');
            alert(msg);
            return;
        }

        setIsSearchingOrder(true);
        setLookupResult(null);

        // Simulate lookup delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulated high-fidelity result
        setLookupResult({
            id: `ORD-VIA-${Math.floor(Math.random() * 90000 + 10000)}`,
            date: new Date().toLocaleDateString(),
            status: 'PREPARING', // PAID, PREPARING, SHIPPING, DELIVERED
            productName: selectedItem ? getLoc(selectedItem.title, 'ko') : 'Premium Joseon Craft',
            price: selectedItem ? getLoc(selectedItem.price, 'ko') : '₩120,000',
            address: '서울특별시 종로구 세종로 1 (시뮬레이션 주소)'
        });

        setIsSearchingOrder(false);
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
                    <div className="flex justify-between items-center mb-6 relative z-[60]">
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
                                    <AutoTranslatedText text="Add Product" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-4 mb-3">
                                <Link
                                    to={currentFloor ? `/inspiration?floor=${currentFloor.floor.toLowerCase()}` : '/inspiration'}
                                    className="px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase shadow-lg hover:brightness-110 transition-all relative z-[60]"
                                    style={{ backgroundColor: `${theme.color2}44`, color: theme.highlightColor, border: `1px solid ${theme.color3}33` }}>
                                    <AutoTranslatedText text="Archive" /> {floorLabel}
                                </Link>
                                <div className="h-[1px] w-12 bg-white/10" />
                                <span className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-20"><AutoTranslatedText text="Virtual Commerce V2" /></span>
                            </div>

                            {isEditingMetadata ? (
                                <textarea
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-4xl md:text-5xl font-black mb-4 text-white focus:outline-none focus:border-white transition-all resize-none shadow-2xl"
                                    rows={2}
                                />
                            ) : (
                                <h1 className="text-4xl md:text-7xl font-sans font-black mb-4 leading-tight uppercase tracking-tighter"
                                    style={{ color: theme.highlightColor, textShadow: `0 0 40px ${theme.glowColor}22` }}>
                                    <AutoTranslatedText text={tempTitle} />
                                </h1>
                            )}

                            {isEditingMetadata ? (
                                <textarea
                                    value={tempDesc}
                                    onChange={(e) => setTempDesc(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 text-sm md:text-base opacity-60 max-w-2xl leading-relaxed mb-4 text-white focus:outline-none focus:border-white transition-all resize-none shadow-2xl"
                                    rows={3}
                                />
                            ) : (
                                tempDesc && (
                                    <p className="text-sm md:text-base opacity-40 max-w-2xl leading-relaxed mb-4">
                                        <AutoTranslatedText text={tempDesc} />
                                    </p>
                                )
                            )}
                        </div>

                        <button 
                            onClick={() => setShowCartDrawer(true)}
                            className="flex bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all active:scale-95 group relative"
                        >
                            <div className="px-6 py-4 flex flex-col items-center border-r border-white/10">
                                <span className="text-xl font-black" style={{ color: theme.highlightColor }}>{totalItems}</span>
                                <span className="text-[8px] font-bold tracking-widest uppercase opacity-30"><AutoTranslatedText text="In Bag" /></span>
                            </div>
                            <div className="px-6 py-4 flex items-center justify-center relative">
                                <ShoppingCart size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                {totalItems > 0 && (
                                    <span className="absolute top-3 right-4 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                )}
                            </div>
                        </button>
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
                            [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="min-w-[280px] h-[380px] rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
                            ))
                        ) : storeItems.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedItem(item)}
                                className={`min-w-[280px] h-[380px] rounded-3xl border transition-all cursor-pointer snap-start relative overflow-hidden group ${selectedItem?.id === item.id
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

                {/* 2. Interactive Detail Showcase Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 h-[70vh] rounded-[3.5rem] bg-black/40 border border-white/5 relative overflow-hidden group shadow-inner">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
                        <ProductDetailViewer item={selectedItem} />
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-center gap-10">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={selectedItem?.id || 'empty-sidebar'}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-white/40 mb-2">
                                    <AutoTranslatedText text="Product Identification" />
                                </h2>
                                <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-4" style={{ color: theme.highlightColor }}>
                                    {selectedItem ? <AutoTranslatedText text={getLoc(selectedItem.title, i18n.language)} /> : "---"}
                                </h2>
                                <div className="flex items-center gap-4 text-white/60">
                                    <div className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black text-xl">
                                        {selectedItem ? getLoc(selectedItem.price, i18n.language) : "₩0"}
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                                        <AutoTranslatedText text="Tax Included / Global Shipping" />
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                <h5 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                    <Info size={12} />
                                    <AutoTranslatedText text="Product Description" />
                                </h5>
                                <p className="text-sm text-white/60 leading-relaxed font-medium">
                                    {selectedItem ? (
                                        <AutoTranslatedText text={getLoc(selectedItem.description, i18n.language) || 'This is a premium product completed with the touch of a Korean traditional craft expert using the highest quality materials.'} />
                                    ) : (
                                        <AutoTranslatedText text="No product info selected." />
                                    )}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handlePurchase}
                                    disabled={!selectedItem || isProcessingPayment || purchaseComplete}
                                    className="w-full py-6 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden group active:scale-95 transition-all disabled:opacity-50"
                                >

                                    <AnimatePresence mode="wait">
                                        {isProcessingPayment ? (
                                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
                                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <AutoTranslatedText text="Processing..." />
                                            </motion.div>
                                        ) : purchaseComplete ? (
                                            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
                                                <Check size={18} />
                                                <AutoTranslatedText text="Payment Success" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
                                                <CreditCard size={18} />
                                                <AutoTranslatedText text="Checkout" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-1000" />
                                </button>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedItem || isAddingToCart}
                                    className="w-full py-6 rounded-2xl bg-[#D4AF37] text-white font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden group active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
                                >
                                    <AnimatePresence mode="wait">
                                        {isAddingToCart ? (
                                            <motion.div key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                <Check size={18} />
                                                <AutoTranslatedText text="Added to Bag" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                <ShoppingBag size={18} />
                                                <AutoTranslatedText text="Add to Bag" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>


                                {isManagementAllowed && (

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => selectedItem && handleEditInitiate(selectedItem)}
                                            disabled={!selectedItem}
                                            className="py-6 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-20"
                                        >
                                            <Pencil size={14} />
                                            <AutoTranslatedText text="Edit" />
                                        </button>
                                        <button
                                            onClick={() => selectedItem && handleDelete(selectedItem.id)}
                                            disabled={!selectedItem}
                                            className="py-6 rounded-2xl bg-white/5 border border-white/10 text-red-500/40 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-20"
                                        >
                                            <Trash2 size={14} />
                                            <AutoTranslatedText text="Delete" />
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowOrderLookupModal(true)}
                                    disabled={!selectedItem}
                                    className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all disabled:opacity-20"
                                >
                                    <AutoTranslatedText text="CHECK ORDER/DELIVERY" />
                                </button>

                            </div>
                        </motion.div>
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
                                <AutoTranslatedText text="Register Product (Manager)" />
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
                        className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-[#050505]/95"
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
                                        <AutoTranslatedText text={isEditMode ? 'Edit Product Info' : 'Register New Product'} />
                                    </h3>
                                    <button onClick={() => { setShowAddModal(false); setIsEditMode(false); }} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X size={20} /></button>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                                <AutoTranslatedText text="Product Title" />
                                            </label>
                                            <input
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none"
                                                placeholder={t("Enter title...")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                                <AutoTranslatedText text="Price" />
                                            </label>
                                            <input
                                                type="text"
                                                value={newPrice}
                                                onChange={(e) => setNewPrice(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none"
                                                placeholder={t("₩0,000")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                            <AutoTranslatedText text="Short Description" />
                                        </label>
                                        <input
                                            type="text"
                                            value={newShortDescription}
                                            onChange={(e) => setNewShortDescription(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none"
                                            placeholder={t("Enter short description (shown on card)...")}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                            <AutoTranslatedText text="Detailed Description" />
                                        </label>
                                        <textarea
                                            value={newLongDescription}
                                            onChange={(e) => setNewLongDescription(e.target.value)}
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none resize-none"
                                            placeholder={t("Enter detailed description (shown on detail modal)...")}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">
                                                <AutoTranslatedText text="Main Image (Front View)" />
                                            </label>
                                            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'main')} accept="image/*" className="hidden" />
                                            {!previewUrl ? (
                                                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Front Image" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">
                                                <AutoTranslatedText text="Left Image (Side View)" />
                                            </label>
                                            <input type="file" ref={leftSideFileInputRef} onChange={(e) => handleFileChange(e, 'left')} accept="image/*" className="hidden" />
                                            {!leftSidePreviewUrl ? (
                                                <button onClick={() => leftSideFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Left Side Image" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={leftSidePreviewUrl} alt="Left Side Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setLeftSidePreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">
                                                <AutoTranslatedText text="Right Image (Side View)" />
                                            </label>
                                            <input type="file" ref={rightSideFileInputRef} onChange={(e) => handleFileChange(e, 'right')} accept="image/*" className="hidden" />
                                            {!rightSidePreviewUrl ? (
                                                <button onClick={() => rightSideFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Right Side Image" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={rightSidePreviewUrl} alt="Right Side Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setRightSidePreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">
                                                <AutoTranslatedText text="Back Image (Back View)" />
                                            </label>
                                            <input type="file" ref={backFileInputRef} onChange={(e) => handleFileChange(e, 'back')} accept="image/*" className="hidden" />
                                            {!backPreviewUrl ? (
                                                <button onClick={() => backFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Back Image" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={backPreviewUrl} alt="Back Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setBackPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block">
                                                <AutoTranslatedText text="Detail Image (For Info)" />
                                            </label>
                                            <input type="file" ref={detailFileInputRef} onChange={(e) => handleFileChange(e, 'detail')} accept="image/*" className="hidden" />
                                            {!detailPreviewUrl ? (
                                                <button onClick={() => detailFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-white/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Detail Image" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-white/20 group h-40">
                                                    <img src={detailPreviewUrl} alt="Detail Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setDetailPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
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
                                                <AutoTranslatedText text="Uploading..." />
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
                        className="fixed inset-0 z-[30000] flex items-center justify-center p-6 bg-[#050505]/98"
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
                                    alt={t("Detail view")}
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                                />
                            </div>

                            <div className="w-full md:w-1/2 h-full p-12 flex flex-col justify-center gap-8 border-l border-white/5 overflow-y-auto">
                                <div className="space-y-4">
                                    <h2 className="text-[11px] font-black tracking-[0.4em] uppercase text-white/30 mb-2">
                                        <AutoTranslatedText text="Product Archives" />
                                    </h2>
                                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
                                        <AutoTranslatedText text={getLoc(detailItem.title, i18n.language)} />
                                    </h2>
                                </div>

                                <div className="h-[2px] w-12 bg-orange-500/20" />

                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white/20"><AutoTranslatedText text="상세 스토리 & 설명" /></h5>
                                    <p className="text-lg text-white/60 leading-relaxed font-medium">
                                        <AutoTranslatedText text={getLoc(detailItem.long_description, i18n.language) || 'Detailed description for this product has not been registered.'} />
                                    </p>
                                </div>

                                <div className="pt-8 grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-2"><AutoTranslatedText text="Category" /></span>
                                        <span className="text-xs font-bold text-white uppercase">{detailItem.category}</span>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-2"><AutoTranslatedText text="Pricing" /></span>
                                        <span className="text-xs font-bold text-white uppercase">{getLoc(detailItem.price, i18n.language)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handlePurchase}
                                        disabled={isProcessingPayment || purchaseComplete}
                                        className="w-full py-8 rounded-[2rem] bg-white text-black font-black text-sm uppercase tracking-[0.2em] relative overflow-hidden group active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-white/5"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isProcessingPayment ? (
                                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
                                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                    <AutoTranslatedText text="Processing..." />
                                                </motion.div>
                                            ) : purchaseComplete ? (
                                                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
                                                    <Check size={18} />
                                                    <AutoTranslatedText text="Payment Success" />
                                                </motion.div>
                                            ) : (
                                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
                                                    <CreditCard size={18} />
                                                    <AutoTranslatedText text="Purchase Now" />
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

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckoutModal && (selectedItem || checkoutMode === 'cart') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[40000] flex items-center justify-center p-6 bg-[#050505]/95"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#111] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        <AutoTranslatedText text="Order Information" />
                                    </h3>
                                    <button onClick={() => setShowCheckoutModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X size={20} /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">
                                                    <AutoTranslatedText text={checkoutMode === 'single' ? 'Product' : 'Items Summary'} />
                                                </span>
                                                <div className="text-xl font-bold text-white uppercase tracking-tighter">
                                                    {checkoutMode === 'single' ? (
                                                        <AutoTranslatedText text={getLoc(selectedItem?.title, i18n.language)} />
                                                    ) : (
                                                        <div className="text-sm">
                                                            {cart.length > 0 && (
                                                                <AutoTranslatedText text={`${getLoc(cart[0].title, i18n.language)} and ${totalItems - cart[0].quantity} more items`} />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block mb-1"><AutoTranslatedText text="Total Amount" /></span>
                                                <div className="text-2xl font-black text-white tracking-tighter">
                                                    {checkoutMode === 'single' 
                                                        ? getLoc(selectedItem?.price, i18n.language)
                                                        : formatPrice(cartTotal)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                                <AutoTranslatedText text="Orderer Name" />
                                            </label>
                                            <input
                                                type="text"
                                                value={orderInfo.name}
                                                onChange={(e) => setOrderInfo({ ...orderInfo, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none"
                                                placeholder={t("Orderer Name")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                                <AutoTranslatedText text="Contact Number" />
                                            </label>
                                            <input
                                                type="text"
                                                value={orderInfo.phone}
                                                onChange={(e) => setOrderInfo({ ...orderInfo, phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none"
                                                placeholder="010-0000-0000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                                                <AutoTranslatedText text="Shipping Address" />
                                            </label>
                                            <textarea
                                                value={orderInfo.address}
                                                onChange={(e) => setOrderInfo({ ...orderInfo, address: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-sm focus:border-white/30 outline-none resize-none"
                                                rows={3}
                                                placeholder={t("Shipping Address")}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCompletePayment}
                                        disabled={isProcessingPayment || !orderInfo.name || !orderInfo.phone || !orderInfo.address}
                                        className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest disabled:opacity-20 flex items-center justify-center gap-3"
                                        style={{ backgroundColor: theme.accentColor }}
                                    >
                                        {isProcessingPayment ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <AutoTranslatedText text="Processing..." />
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={18} />
                                                <AutoTranslatedText text="Complete Order" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Lookup Modal */}
            <AnimatePresence>
                {showOrderLookupModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[40000] flex items-center justify-center p-6 bg-[#050505]/95"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#111] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        <AutoTranslatedText text="Order Tracking" />
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowOrderLookupModal(false);
                                            setLookupResult(null);
                                            setOrderLookupInfo({ name: '', phone: '' });
                                        }}
                                        className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {!lookupResult ? (
                                    <div className="space-y-8">
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest text-white/30 uppercase pl-1">
                                                    <AutoTranslatedText text="Orderer Name" />
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orderLookupInfo.name}
                                                    onChange={(e) => setOrderLookupInfo({ ...orderLookupInfo, name: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-white text-sm focus:border-white/30 focus:bg-white/5 outline-none transition-all"
                                                    placeholder={t("Enter your name")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest text-white/30 uppercase pl-1">
                                                    <AutoTranslatedText text="Contact Number" />
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orderLookupInfo.phone}
                                                    onChange={(e) => setOrderLookupInfo({ ...orderLookupInfo, phone: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-white text-sm focus:border-white/30 focus:bg-white/5 outline-none transition-all"
                                                    placeholder="010-0000-0000"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLookupOrder}
                                            disabled={isSearchingOrder || !orderLookupInfo.name || !orderLookupInfo.phone}
                                            className="w-full py-6 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] disabled:opacity-20 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-white/5"
                                            style={{ backgroundColor: theme.accentColor }}
                                        >
                                            {isSearchingOrder ? (
                                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Search size={16} />
                                                    <AutoTranslatedText text="Search" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[9px] font-black tracking-widest text-white/20 uppercase block mb-1"><AutoTranslatedText text="Status" /></span>
                                                    <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                                                        <AutoTranslatedText text={lookupResult.status} />
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[9px] font-black tracking-widest text-white/20 uppercase mb-1"><AutoTranslatedText text="Order ID" /></div>
                                                    <div className="text-[11px] font-bold text-white/60 tracking-tighter">{lookupResult.id}</div>
                                                </div>
                                            </div>

                                            <div className="h-[1px] w-full bg-white/5" />

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-[9px] font-black tracking-widest text-white/20 uppercase mb-1"><AutoTranslatedText text="Product" /></div>
                                                    <div className="text-sm font-bold text-white"><AutoTranslatedText text={lookupResult.productName} /></div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-[9px] font-black tracking-widest text-white/20 uppercase mb-1"><AutoTranslatedText text="Date" /></div>
                                                        <div className="text-[11px] text-white/60">{lookupResult.date}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black tracking-widest text-white/20 uppercase mb-1"><AutoTranslatedText text="Price" /></div>
                                                        <div className="text-[11px] text-white/60">{lookupResult.price}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setLookupResult(null)}
                                            className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            <AutoTranslatedText text="Search Again" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            <footer className="mt-40 border-t py-20 px-6 bg-[#0a0a0a]" style={{ borderColor: `${theme.color3}11` }}>
                <div className="container mx-auto flex flex-col items-center gap-6">
                    <div className="text-4xl font-black tracking-tighter opacity-10 uppercase"><AutoTranslatedText text="몽땅쏙 IMMERSIVE" /></div>
                    <p className="text-[9px] font-bold tracking-[0.5em] opacity-30 uppercase text-center max-w-lg leading-loose">
                        <AutoTranslatedText text="The convergence of traditional aesthetics and cutting-edge virtual commerce technology." />
                    </p>
                </div>
            </footer>

            {/* Shopping Cart Drawer */}
            <AnimatePresence>
                {showCartDrawer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCartDrawer(false)}
                            className="fixed inset-0 z-[50000] bg-black/80"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[51000] bg-[#111] border-l border-white/10 shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                        <AutoTranslatedText text="Shopping Bag" />
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        <span>{totalItems} <AutoTranslatedText text="Items in Bag" /></span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCartDrawer(false)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 transition-all hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                                        <ShoppingCart size={48} />
                                        <p className="text-sm font-bold uppercase tracking-widest text-center">
                                            <AutoTranslatedText text="Your bag is empty" />
                                        </p>
                                    </div>
                                ) : (
                                    cart.map((item: any) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 relative group"
                                        >
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
                                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow min-w-0 py-1">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate mb-1">
                                                    <AutoTranslatedText text={getLoc(item.title, i18n.language)} />
                                                </h4>
                                                <p className="text-[10px] font-black tracking-widest text-[#D4AF37] mb-3">
                                                    {getLoc(item.price, i18n.language)}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-8 bg-white/[0.02] border-t border-white/10 space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest"><AutoTranslatedText text="Subtotal Estimate" /></span>
                                            <div className="text-3xl font-black text-white tracking-tighter">
                                                {formatPrice(cartTotal)}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={clearCart}
                                            className="text-[10px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors mb-2"
                                        >
                                            <AutoTranslatedText text="Clear Bag" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCheckoutMode('cart');
                                            setShowCartDrawer(false);
                                            setShowCheckoutModal(true);
                                        }}
                                        className="w-full py-6 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                                    >

                                        <AutoTranslatedText text="Checkout All" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VirtualStorePage;


