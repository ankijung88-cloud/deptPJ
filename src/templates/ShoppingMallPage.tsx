import React, { useState, useEffect, useRef } from 'react';
console.log("ShoppingMallPage.tsx loaded");

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ShoppingBag, CreditCard, ArrowLeft, ShoppingCart, Info, Plus, UploadCloud, ChevronRight, Trash2, Edit3, Search } from 'lucide-react';

import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

import { FeaturedItem } from '../types';
import { getProductById, updateProduct, deleteProduct } from '../api/products';

import { createOrder } from '../api/orders';

import { useFloors } from '../context/FloorContext';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../hooks/useAdmin';
import { useImmersiveMode, useSetBreadcrumbPath } from '../context/NavigationActionContext';

// --- Sub-components for Detail Viewer ---

const ProductDetailViewer: React.FC<{ item: FeaturedItem | null, customDetailHeading?: string, isEditing?: boolean, onChangeHeading?: (val: string) => void }> = ({ item, customDetailHeading, isEditing, onChangeHeading }) => {
    const { i18n } = useTranslation();
    const getLoc = (val: any, lang: string): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val[lang] || val['ko'] || '';
    };

    if (!item) return (
        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 gap-4">
            <ShoppingBag size={48} strokeWidth={1} />
            <AutoTranslatedText text="상세설명을 확인할 제품을 선택하세요" />
        </div>
    );


    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar relative z-10">
            <div className="p-8 md:p-12 space-y-12">
                <div className="w-full rounded-3xl overflow-hidden shadow-2xl relative bg-transparent border border-neutral-200" style={{ mixBlendMode: 'multiply' }}>
                    <img
                        src={item.thumbnailUrl || item.imageUrl}
                        alt={getLoc(item.title, 'ko')}
                        style={{ 
                            filter: 'contrast(1.05) brightness(1.02)'
                        }}
                        className="w-full h-auto object-contain"
                    />
                </div>
                
                <div className="space-y-6 pb-20">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Info size={24} className="text-red-600" />
                            <div className="flex-grow">
                                {isEditing ? (
                                    <input 
                                        value={customDetailHeading || "상세 스토리 & 설명"}
                                        onChange={(e) => onChangeHeading?.(e.target.value)}
                                        className="text-xl md:text-2xl font-black uppercase tracking-widest text-red-600 bg-transparent border-b border-red-600/20 focus:outline-none w-full"
                                    />
                                ) : (
                                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-red-600">
                                        <AutoTranslatedText text={customDetailHeading || "상세 스토리 & 설명"} />
                                    </h3>
                                )}
                            </div>
                        </div>
                        <div className="w-16 h-[2px] bg-red-600/40" />
                    </div>
                    <div className="text-base md:text-lg text-neutral-800 leading-relaxed md:leading-loose font-medium whitespace-pre-wrap">
                        <AutoTranslatedText text={getLoc(item.long_description, i18n.language) || '상세 정보가 등록되지 않았습니다.'} />
                    </div>
                </div>
            </div>
            
            <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-neutral-900 text-white shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-widest"><AutoTranslatedText text="Detail Information" /></span>
            </div>
        </div>
    );
};


// --- Main Page Component ---

interface ShoppingMallPageProps {
    item?: FeaturedItem;
    productId?: string;
    onClose?: () => void;
}

const ShoppingMallPage: React.FC<ShoppingMallPageProps> = ({ item: propItem, productId: _propProductId, onClose }) => {
    useImmersiveMode(false);
    const { i18n, t } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const { id: routeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine the effective parent ID (favor route params, fallback to state)
    const parentId = routeId || location.state?.parentId;

    const [selectedItem, setSelectedItem] = useState<FeaturedItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { isAdmin: isAdminLoggedIn, role, user, isAuthenticated } = useAdmin();


    // Inline Editing for Page Metadata
    const [isEditingMetadata, setIsEditingMetadata] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempDesc, setTempDesc] = useState('');

    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(propItem || null);
    const isManagementAllowed = isAdminLoggedIn || (role === 'agency' && String(parentProduct?.agency_id) === String(user?.id));

    const [tempFloorLabels, setTempFloorLabels] = useState<Record<string, any>>({});

    const { floors } = useFloors();
    const [customCategories, setCustomCategories] = useState<any[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [newCategoryLabel, setNewCategoryLabel] = useState('');
    const [newCategoryBg, setNewCategoryBg] = useState('');

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [activeTemplate, setActiveTemplate] = useState<string | null>(null);


    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId, activeTemplate]);


    // Checkout Modal States
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showCartDrawer, setShowCartDrawer] = useState(false);
    const [showOrderLookupModal, setShowOrderLookupModal] = useState(false);
    const [orderInfo, setOrderInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Order Lookup States
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
    const [checkoutMode, setCheckoutMode] = useState<'single' | 'cart'>('single');

    // Standardized Ivory Theme Tokens
    const theme = {
        bgStyle: { backgroundColor: '#F2E7D5' },
        color1: '#FFFFFF',
        color2: '#F2E7D5',
        color3: '#000000',
        accentColor: '#DC2626', // red-600
        highlightColor: '#171717',
        textPrimary: '#171717',
        glowColor: '#DC2626'
    };
    const [storeItems, setStoreItems] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtering items by Custom Category
    const filteredItems = storeItems.filter(item => {
        const matchesCategory = !selectedCategoryId || item.subcategory === selectedCategoryId;
        const matchesTemplate = !activeTemplate || (item.page_type || 'standard') === activeTemplate;
        return matchesCategory && matchesTemplate;
    });

    const handleAddToCart = () => {
        if (!selectedItem) return;
        addToCart({
            id: selectedItem.id,
            title: selectedItem.title,
            price: selectedItem.price,
            imageUrl: selectedItem.imageUrl,
            quantity: 1
        });
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
                } catch (error) { console.error("Failed to fetch parent product:", error); }
            }
        };

        const initializeMetadata = (data: FeaturedItem) => {
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
            } catch (e) { console.error("Failed to parse templates:", e); }

            const storeMeta = templates.find((t: any) => t.id === 'store');
            setTempTitle(storeMeta?.title?.ko || (typeof storeMeta?.title === 'string' ? storeMeta.title : '') || t("store.store_title"));
            setTempDesc(storeMeta?.description?.ko || (typeof storeMeta?.description === 'string' ? storeMeta.description : '') || t("store.store_desc"));
            setCustomFloorDirectoryLabel(storeMeta?.customFloorDirectoryLabel || '');
            setCustomCategoryLabel(storeMeta?.customCategoryLabel || '');
            setCustomDetailHeading(storeMeta?.customDetailHeading || '');
            setCustomBoutiqueLabel(storeMeta?.customBoutiqueLabel || '');
            setCustomSubtitleLabel(storeMeta?.customSubtitleLabel || '');
            setCustomAllItemsLabel(storeMeta?.customAllItemsLabel || '');
            setCustomRegisterProductLabel(storeMeta?.customRegisterProductLabel || '');
            setCustomHeroBg(storeMeta?.customHeroBg || '');
            setCustomHeroLogo(storeMeta?.customHeroLogo || '');
            setTempFloorLabels(storeMeta?.customFloorLabels || {});
            setCustomCategories(storeMeta?.customCategories || []);
        };


        fetchParent();
    }, [parentId, i18n.language, propItem]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newPrice, setNewPrice] = useState('');

    // Diagnostics for Production
    useEffect(() => {
        console.log(`[VirtualStore Debug] Auth Status:`, {
            isAuthenticated,
            role,
            userId: user?.id,
            adminToken: sessionStorage.getItem('admin_token') ? 'Present' : 'Missing'
        });
        console.log(`[VirtualStore Debug] Params:`, { parentId, isManagementAllowed });
    }, [isAuthenticated, role, user, parentId, isManagementAllowed]);
    const [newShortDescription, setNewShortDescription] = useState('Premium traditional craft product completed with the touch of an artisan.');
    const [newLongDescription, setNewLongDescription] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newDetailImageUrl, setNewDetailImageUrl] = useState('');
    const [newLeftSideImageUrl, setNewLeftSideImageUrl] = useState('');
    const [newBackImageUrl, setNewBackImageUrl] = useState('');
    const [newCategory, setNewCategory] = useState('store');
    const [newSubCategory, setNewSubCategory] = useState(selectedCategoryId || '');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [detailPreviewUrl, setDetailPreviewUrl] = useState<string | null>(null);
    const [leftSidePreviewUrl, setLeftSidePreviewUrl] = useState<string | null>(null);
    const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null);
    
    // Custom UI Labels from Metadata
    const [customFloorDirectoryLabel, setCustomFloorDirectoryLabel] = useState<string>('');
    const [customCategoryLabel, setCustomCategoryLabel] = useState<string>('');
    const [customDetailHeading, setCustomDetailHeading] = useState<string>('');
    const [customBoutiqueLabel, setCustomBoutiqueLabel] = useState<string>('');
    const [customSubtitleLabel, setCustomSubtitleLabel] = useState<string>('');
    const [customAllItemsLabel, setCustomAllItemsLabel] = useState<string>('');
    const [customRegisterProductLabel, setCustomRegisterProductLabel] = useState<string>('');
    const [customHeroBg, setCustomHeroBg] = useState<string>('');
    const [customHeroLogo, setCustomHeroLogo] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const detailFileInputRef = useRef<HTMLInputElement>(null);
    const leftSideFileInputRef = useRef<HTMLInputElement>(null);
    const backFileInputRef = useRef<HTMLInputElement>(null);
    const heroBgInputRef = useRef<HTMLInputElement>(null);
    const heroLogoInputRef = useRef<HTMLInputElement>(null);


    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const adminToken = sessionStorage.getItem('admin_token');
        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const data = await uploadRes.json();
        return data.url;
    };

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

            if (data?.length === 0) {
                console.warn(`[VirtualStore Debug] No items found for ParentID: ${parentId}. Check if products are linked correctly.`);
            }

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
                subcategory: dbItem.subcategory,
                page_type: dbItem.page_type,
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

            // Update selectedItem reference if it exists

            if (selectedItem) {
                const refreshed = normalizedData.find((i: any) => i.id === selectedItem.id);
                if (refreshed) setSelectedItem(refreshed);
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

        setBackPreviewUrl(item.backImageUrl || null);
        setNewBackImageUrl(item.backImageUrl || '');

        setNewCategory(item.category);
        setNewSubCategory(item.subcategory || '');

        setShowAddModal(true);
    };

    const handleDeleteContent = async (id: string) => {
        if (!window.confirm(t('common.confirm_delete') || 'Are you sure you want to delete this item?')) return;
        try {
            await deleteProduct(id);
            fetchItems();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Delete failed.");
        }
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
                if (selectedItem?.id === id) setShowDetailModal(false);

            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            const errorMsg = t('store.delete_fail');
            alert(errorMsg);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'detail' | 'back' | 'left') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                if (type === 'main') setPreviewUrl(res);
                else if (type === 'detail') setDetailPreviewUrl(res);
                else if (type === 'left') setLeftSidePreviewUrl(res);
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
            let finalBackImageUrl = newBackImageUrl;

            if (fileInputRef.current?.files?.[0]) finalImageUrl = await uploadFile(fileInputRef.current.files[0]);
            if (detailFileInputRef.current?.files?.[0]) finalDetailImageUrl = await uploadFile(detailFileInputRef.current.files[0]);
            if (leftSideFileInputRef.current?.files?.[0]) finalLeftSideImageUrl = await uploadFile(leftSideFileInputRef.current.files[0]);
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
                category: newCategory,
                subcategory: newSubCategory,
                description: { ko: newShortDescription || '장인의 손길이 닿은 프리미엄 전통 공예품입니다.', en: 'Premium traditional craft made by a master.' },
                long_description: { ko: newLongDescription || '상세 정보가 등록되지 않았습니다.', en: newLongDescription || 'No detailed info.' },
                image_url: finalImageUrl,
                thumbnail_url: finalDetailImageUrl || '',
                side_image_url: oldItem?.sideImageUrl || '',
                left_side_image_url: finalLeftSideImageUrl || '',
                back_image_url: finalBackImageUrl || '',
                event_date: { ko: 'In Stock', en: 'In Stock' },
                location: { ko: 'Boutique', en: 'Boutique' },
                price: newPrice || `₩${Math.floor(Math.random() * 10 + 5)},000`,
                parent_id: parentId || null,
                agency_id: user?.id || null
            };

            const adminToken = sessionStorage.getItem('admin_token');
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
                setNewBackImageUrl('');
                setPreviewUrl(null);
                setDetailPreviewUrl(null);
                setLeftSidePreviewUrl(null);
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
                        description: val.description,
                        customFloorDirectoryLabel: val.customFloorDirectoryLabel,
                        customCategoryLabel: val.customCategoryLabel
                    }))
                    : []);

            // Check if store template already exists in the selection
            const hasStore = templates.some((t: any) => t.id === 'store');

            const updatedTemplates = hasStore
                ? templates.map((t: any) => t.id === 'store' ? {
                    ...t,
                    title: { ...(typeof t.title === 'object' ? t.title : {}), ko: tempTitle },
                    description: { ...(typeof t.description === 'object' ? t.description : {}), ko: tempDesc },
                    customFloorDirectoryLabel,
                    customCategoryLabel,
                    customDetailHeading,
                    customBoutiqueLabel,
                    customSubtitleLabel,
                    customAllItemsLabel,
                    customRegisterProductLabel,
                    customHeroBg,
                    customHeroLogo,
                    customFloorLabels: tempFloorLabels,
                    customCategories

                } : t)
                : [...templates, {
                    id: 'store',
                    status: 'visible',
                    title: { ko: tempTitle },
                    description: { ko: tempDesc },
                    customFloorDirectoryLabel,
                    customCategoryLabel,
                    customDetailHeading,
                    customBoutiqueLabel,
                    customSubtitleLabel,
                    customAllItemsLabel,
                    customRegisterProductLabel,
                    customHeroBg,
                    customHeroLogo,
                    customFloorLabels: tempFloorLabels,
                    customCategories

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

    const handleSaveCategory = () => {
        if (!newCategoryLabel) return;
        
        const newCat = {
            id: editingCategory?.id || `cat-${Date.now()}`,
            label: { ko: newCategoryLabel, en: newCategoryLabel },
            bgImage: newCategoryBg
        };

        if (editingCategory) {
            setCustomCategories(prev => prev.map(c => c.id === editingCategory.id ? newCat : c));
        } else {
            setCustomCategories(prev => [...prev, newCat]);
        }

        setShowCategoryModal(false);
        setEditingCategory(null);
        setNewCategoryLabel('');
        setNewCategoryBg('');
    };

    const handleDeleteCategory = (id: string) => {
        if (!window.confirm(t('common.delete_confirm'))) return;
        setCustomCategories(prev => prev.filter(c => c.id !== id));
        if (selectedCategoryId === id) setSelectedCategoryId(null);
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



    return (
        <div className="min-h-screen font-sans" style={theme.bgStyle}>
            {/* Store Header */}
            {/* Brand Hero Section */}
            <header className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden flex flex-col justify-center px-6 md:px-20 transition-all duration-700" style={{ backgroundColor: '#F2E7D5' }}>
                {/* Custom Hero Background */}
                {customHeroBg && (
                    <div className="absolute inset-0 z-0">
                        <img src={customHeroBg} className="w-full h-full object-cover" alt="Hero Background" />
                        <div className="absolute inset-0 bg-black/5" />
                    </div>
                )}

                <div className="relative z-10">

                    <div className="flex justify-between items-start mb-8 relative z-[60]">
                        <button
                            onClick={() => onClose ? onClose() : navigate(-1)}
                            className="flex items-center gap-2 text-neutral-900 opacity-80 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-widest relative z-[60]"
                        >
                            <ArrowLeft size={14} />
                            <AutoTranslatedText text={t('common.back')} />
                        </button>

                        {isManagementAllowed && (
                            <div className="flex gap-2 relative z-[70]">
                                {isEditingMetadata && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); isEditingMetadata ? handleSaveMetadata() : setIsEditingMetadata(true); }}
                                        className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                                            isEditingMetadata 
                                                ? 'bg-red-600 border-red-600 text-white shadow-lg' 
                                                : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-900'
                                        }`}
                                    >
                                        <AutoTranslatedText text={isEditingMetadata ? "Save Page Info" : "Edit Page Info"} />
                                    </button>
                                    <button 
                                        onClick={() => heroBgInputRef.current?.click()}
                                        className="px-6 py-2 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:bg-white transition-all flex items-center gap-2"
                                    >
                                        <UploadCloud size={14} />
                                        <AutoTranslatedText text="Hero Bg" />
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={heroBgInputRef} 
                                        className="hidden" 
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                setIsUploading(true);
                                                const url = await uploadFile(e.target.files[0]);
                                                if (url) setCustomHeroBg(url);
                                                setIsUploading(false);
                                            }
                                        }}
                                    />
                                    <button 
                                        onClick={() => { setIsEditMode(false); setShowAddModal(true); }}
                                        className="px-6 py-2 rounded-full bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg"
                                    >
                                        <Plus size={14} />
                                        <AutoTranslatedText text="Add Product" />
                                    </button>
                                </div>
                            )}
                            {!isEditingMetadata && isManagementAllowed && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsEditingMetadata(true); }}
                                    className="px-6 py-2 rounded-full bg-white border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:border-neutral-900 transition-all shadow-md"
                                >
                                    <AutoTranslatedText text="Edit Page Info" />
                                </button>
                            )}
                            </div>
                        )}
                    </div>

                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-4">
                            {isEditingMetadata ? (
                                <input 
                                    value={customBoutiqueLabel}
                                    onChange={(e) => setCustomBoutiqueLabel(e.target.value)}
                                    placeholder="Boutique"
                                    className="px-3 py-1 rounded-full bg-red-600/5 text-red-600 text-[10px] font-black tracking-widest uppercase border border-red-600/10 focus:outline-none"
                                />
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-red-600/5 text-red-600 text-[10px] font-black tracking-widest uppercase border border-red-600/10">
                                    <AutoTranslatedText text={customBoutiqueLabel || "Boutique"} />
                                </span>
                            )}
                            <div className="h-[1px] w-8 bg-neutral-200" />
                            {isEditingMetadata ? (
                                <input 
                                    value={customSubtitleLabel}
                                    onChange={(e) => setCustomSubtitleLabel(e.target.value)}
                                    placeholder="Shopping Mall Platform"
                                    className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest tracking-[0.3em] bg-transparent border-b border-neutral-200 focus:outline-none"
                                />
                            ) : (
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest tracking-[0.3em]">
                                    <AutoTranslatedText text={customSubtitleLabel || "Shopping Mall Platform"} />
                                </span>
                            )}
                        </div>

                        {isEditingMetadata ? (
                            <div className="flex flex-col gap-4">
                                <textarea
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="w-full bg-white/50 backdrop-blur-md border border-neutral-200 rounded-2xl p-6 text-4xl md:text-5xl font-serif font-black mb-4 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all resize-none shadow-inner"
                                    rows={2}
                                />
                                <button 
                                    onClick={() => heroLogoInputRef.current?.click()}
                                    className="w-fit px-4 py-2 rounded-xl bg-white/80 border border-neutral-200 text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:bg-white transition-all flex items-center gap-2"
                                >
                                    <UploadCloud size={12} />
                                    <AutoTranslatedText text="Update Logo Image" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={heroLogoInputRef} 
                                    className="hidden" 
                                    onChange={async (e) => {
                                        if (e.target.files?.[0]) {
                                            setIsUploading(true);
                                            const url = await uploadFile(e.target.files[0]);
                                            if (url) setCustomHeroLogo(url);
                                            setIsUploading(false);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {customHeroLogo ? (
                                    <img src={customHeroLogo} className="h-16 md:h-24 w-auto object-contain mb-4" alt="Brand Logo" />
                                ) : (
                                    <h1 className="text-3xl md:text-7xl font-serif font-black mb-4 md:mb-6 leading-tight text-neutral-900">
                                        <AutoTranslatedText text={tempTitle} />
                                    </h1>
                                )}
                            </div>
                        )}


                        {isEditingMetadata ? (
                            <textarea
                                value={tempDesc}
                                onChange={(e) => setTempDesc(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-lg text-neutral-600 max-w-2xl leading-relaxed mb-4 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all resize-none shadow-inner"
                                rows={3}
                            />
                        ) : (
                            tempDesc && (
                                <p className="text-base md:text-xl font-serif italic text-neutral-600 max-w-2xl leading-tight">
                                    <AutoTranslatedText text={tempDesc} />
                                </p>
                            )
                        )}
                    </div>

                    <div className="absolute bottom-0 right-0 p-8">
                        <button 
                            onClick={() => setShowCartDrawer(true)}
                            className="relative p-4 rounded-full bg-white border border-neutral-200 hover:bg-neutral-50 transition-all shadow-lg text-neutral-900"
                        >
                            <ShoppingCart size={24} />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 md:px-12 py-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-72 space-y-8 lg:space-y-12">
                        <div>
                            <div className="group relative">
                                {isEditingMetadata ? (
                                    <div className="flex flex-col gap-1 mb-8">
                                        <label className="text-[8px] font-black uppercase text-red-600 ml-1">Sidebar Group Label 1</label>
                                        <input 
                                            value={customFloorDirectoryLabel}
                                            onChange={(e) => setCustomFloorDirectoryLabel(e.target.value)}
                                            placeholder="Floor Directory"
                                            className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 bg-neutral-50 border-b border-neutral-200 focus:outline-none ml-1 w-full"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-red-600 mb-2 px-1">
                                            <AutoTranslatedText text={customCategoryLabel || "Categories"} />
                                        </div>
                                        <h2 className="text-2xl font-serif font-black text-neutral-900 uppercase tracking-tighter mb-8 px-1">
                                            <AutoTranslatedText text={customFloorDirectoryLabel || "Collection"} />
                                        </h2>
                                    </>
                                )}

                            </div>
                            <div className="flex lg:flex-col gap-2 lg:gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 no-scrollbar">
                                <button
                                    onClick={() => setSelectedCategoryId(null)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                        selectedCategoryId === null 
                                        ? 'bg-neutral-900 text-white shadow-xl lg:translate-x-2' 
                                        : 'bg-white border border-neutral-100 text-neutral-400 hover:border-red-600 hover:text-neutral-900'
                                    } whitespace-nowrap min-w-fit lg:min-w-0 lg:w-full mb-2`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-black tracking-widest ${selectedCategoryId === null ? 'text-red-600' : 'text-neutral-300'}`}>ALL</span>
                                        <span className="text-xs font-black uppercase tracking-widest"><AutoTranslatedText text="전체보기" /></span>
                                    </div>
                                </button>

                                {customCategories.map((c) => (
                                    <div key={c.id} className="relative group/floor">
                                        <button
                                            onClick={() => setSelectedCategoryId(c.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                                selectedCategoryId === c.id 
                                                ? 'bg-neutral-900 text-white shadow-xl lg:translate-x-2' 
                                                : 'bg-white border border-neutral-100 text-neutral-400 hover:border-red-600 hover:text-neutral-900'
                                            } whitespace-nowrap min-w-fit lg:min-w-0 lg:w-full`}
                                        >
                                            <div className="flex items-center gap-4 flex-grow">
                                                <span className="text-xs font-black uppercase tracking-widest">
                                                    <AutoTranslatedText text={getLoc(c.label, i18n.language)} />
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isEditingMetadata ? (
                                                    <div className="flex gap-1">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setEditingCategory(c); setNewCategoryLabel(getLoc(c.label, 'ko')); setNewCategoryBg(c.bgImage || ''); setShowCategoryModal(true); }}
                                                            className="p-1 hover:text-red-600 transition-colors"
                                                        >
                                                            <Edit3 size={12} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id); }}
                                                            className="p-1 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <ChevronRight size={14} className={selectedCategoryId === c.id ? 'text-red-600' : 'text-neutral-200'} />
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                ))}

                                {isEditingMetadata && (
                                    <button
                                        onClick={() => { setEditingCategory(null); setNewCategoryLabel(''); setNewCategoryBg(''); setShowCategoryModal(true); }}
                                        className="w-full flex items-center justify-center p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-red-600 hover:text-red-600 transition-all gap-2"
                                    >
                                        <Plus size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Add Category</span>
                                    </button>
                                )}

                            </div>
                        </div>


                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        {/* Sub-Category Boxes (Optimized for 6-columns) */}
                        {selectedCategoryId && customCategories.find(c => c.id === selectedCategoryId) && (
                            <div className="mb-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-[2px] w-12 bg-red-600" />
                                    <h3 className="text-2xl font-serif font-black text-neutral-900 uppercase tracking-tighter">
                                        <AutoTranslatedText text={getLoc(customCategories.find(c => c.id === selectedCategoryId)?.label, i18n.language)} />
                                    </h3>
                                </div>
                                <div className="w-full h-[1px] bg-neutral-100" />
                            </div>
                        )}


                                {/* Sub-template Boxes (Restored) */}
                                {storeItems.length > 0 && (
                                    <div className="mb-12">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-[1px] bg-red-600/20" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/40">Available Services</span>
                                            <div className="flex-grow h-[1px] bg-neutral-100" />
                                        </div>
                                        <div className="flex flex-wrap gap-3 md:gap-6">
                                            <button
                                                onClick={() => setActiveTemplate(null)}
                                                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${!activeTemplate ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg' : 'bg-white text-neutral-400 border-neutral-100 hover:border-neutral-200'}`}
                                            >
                                                <AutoTranslatedText text="All Types" />
                                            </button>
                                            {Array.from(new Set(storeItems.filter(p => !selectedCategoryId || p.subcategory === selectedCategoryId).map(p => p.page_type || 'standard')))
                                                .filter(type => type !== 'standard')
                                                .map((type, idx) => (
                                                    <motion.button
                                                        key={type}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        onClick={() => setActiveTemplate(type)}
                                                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${activeTemplate === type ? 'bg-red-600 text-white border-red-600 shadow-xl scale-105' : 'bg-white text-neutral-900 border-neutral-100 hover:border-neutral-200'}`}
                                                    >
                                                        <AutoTranslatedText text={type.replace('_', ' ')} />
                                                    </motion.button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="w-full h-[1px] bg-neutral-100 mb-8" />


                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="aspect-[3/4] rounded-[2rem] bg-white border border-neutral-100 animate-pulse" />
                                ))
                            ) : filteredItems.length === 0 ? (
                                <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-neutral-300 gap-6">
                                    <div className="w-32 h-32 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                        <ShoppingBag size={48} strokeWidth={1} className="text-neutral-200" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
                                        <AutoTranslatedText text="제품을 등록해주세요" />
                                    </p>
                                    {isManagementAllowed && (
                                        <button 
                                            onClick={() => { setIsEditMode(false); setShowAddModal(true); }}
                                            className="mt-8 px-10 py-4 rounded-full bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-neutral-900/10"
                                        >
                                            <AutoTranslatedText text="제품 등록하기" />
                                        </button>
                                    )}
                                </div>
                            ) : filteredItems.slice((currentPage - 1) * 20, currentPage * 20).map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() => { setSelectedItem(item); setShowDetailModal(true); }}
                                    className="group relative bg-transparent rounded-[1.5rem] md:rounded-[2rem] border border-neutral-100 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="aspect-[1/1] bg-[#F2E7D5] relative overflow-hidden" style={{ mixBlendMode: 'multiply' }}>
                                        <img 
                                            src={item.imageUrl} 
                                            alt={getLoc(item.title, 'ko')} 
                                            style={{ 
                                                filter: 'contrast(1.05) brightness(1.02)'
                                            }}
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    </div>
                                    <div className="p-3 md:p-4 space-y-1 md:space-y-2">
                                        <div className="space-y-1">
                                            <h4 className="text-xs md:text-sm font-bold text-neutral-900 uppercase tracking-tight line-clamp-1">
                                                <AutoTranslatedText text={getLoc(item.title, i18n.language)} />
                                            </h4>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[7px] md:text-[8px] font-black tracking-widest text-neutral-400 uppercase">
                                                    {item.subcategory || 'Signature'}
                                                </span>
                                                <div className="text-[11px] md:text-sm font-black text-red-600 tracking-tighter">
                                                    {getLoc(item.price, i18n.language)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all pt-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); addToCart({ ...item, quantity: 1 }); }}
                                                className="flex-grow py-1.5 md:py-2 rounded-lg bg-neutral-900 text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                            >
                                                <AutoTranslatedText text="Add" />
                                            </button>
                                            {isManagementAllowed && (
                                                <div className="flex gap-1">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleEditInitiate(item); }}
                                                        className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-400 flex items-center justify-center hover:bg-neutral-200 hover:text-neutral-900 transition-all"
                                                    >
                                                        <Edit3 size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteContent(item.id); }}
                                                        className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {filteredItems.length > 20 && (
                            <div className="flex justify-center items-center gap-6 mt-12">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-600 transition-all disabled:opacity-30 shadow-md"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <span className="text-[10px] font-black tracking-widest text-neutral-900">{currentPage} / {Math.ceil(filteredItems.length / 20)}</span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredItems.length / 20), prev + 1))}
                                    disabled={currentPage >= Math.ceil(filteredItems.length / 20)}
                                    className="p-3 rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-600 transition-all disabled:opacity-30 shadow-md"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {isManagementAllowed && (
                            <div className="flex justify-center mt-20">
                                {isEditingMetadata ? (
                                    <div className="flex items-center gap-4 bg-white border border-neutral-200 px-12 py-6 rounded-full shadow-lg">
                                        <input 
                                            value={customRegisterProductLabel}
                                            onChange={(e) => setCustomRegisterProductLabel(e.target.value)}
                                            placeholder="Register Product"
                                            className="text-xs font-black tracking-[0.2em] uppercase text-neutral-600 bg-neutral-50 border-b border-neutral-200 focus:outline-none w-48 text-center"
                                        />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setIsEditMode(false); setShowAddModal(true); }}
                                        className="group flex items-center gap-6 px-12 py-6 rounded-full bg-white border border-neutral-200 hover:border-red-600 transition-all active:scale-95 shadow-lg"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                            <Plus size={20} className="text-neutral-400 group-hover:text-white" />
                                        </div>
                                        <span className="text-xs font-black tracking-[0.2em] uppercase text-neutral-600 group-hover:text-red-600 transition-colors">
                                            <AutoTranslatedText text={customRegisterProductLabel || "Register Product"} />
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Product Detail Modal */}
            <AnimatePresence>

                {showDetailModal && selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-neutral-200 w-[95vw] md:w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[95vh] md:h-[90vh]"
                        >
                            <div className="md:w-3/5 bg-neutral-50 relative h-1/2 md:h-full">
                                <ProductDetailViewer 
                                    item={selectedItem} 
                                    customDetailHeading={customDetailHeading} 
                                    isEditing={isEditingMetadata}
                                    onChangeHeading={setCustomDetailHeading}
                                />
                                <button 
                                    onClick={() => setShowDetailModal(false)}
                                    className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white/80 backdrop-blur-md rounded-full text-neutral-900 hover:bg-white transition-all shadow-lg z-10"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="md:w-2/5 p-6 md:p-12 flex flex-col justify-between overflow-y-auto">
                                <div className="space-y-8">
                                    <div>
                                        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-400 mb-2">
                                            {selectedItem.category} / {selectedItem.subcategory}
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-serif font-black text-neutral-900 uppercase tracking-tighter leading-tight mb-4">
                                            <AutoTranslatedText text={getLoc(selectedItem.title, i18n.language)} />
                                        </h2>
                                        <div className="text-xl md:text-3xl font-black text-red-600 tracking-tighter">
                                            {getLoc(selectedItem.price, i18n.language)}
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-3xl bg-neutral-50 space-y-4">
                                        <h5 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                            <Info size={12} className="text-red-600" />
                                            <AutoTranslatedText text="Product Description" />
                                        </h5>
                                        <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                                            <AutoTranslatedText text={getLoc(selectedItem.description, i18n.language) || 'This is a premium product completed with the touch of a Korean traditional craft expert using the highest quality materials.'} />
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 mt-8">
                                    <button
                                        onClick={handlePurchase}
                                        className="w-full py-6 rounded-2xl bg-neutral-900 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl"
                                    >
                                        <AutoTranslatedText text="Checkout Now" />
                                    </button>
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full py-6 rounded-2xl bg-white border border-neutral-200 text-neutral-900 font-black text-sm uppercase tracking-[0.2em] hover:bg-neutral-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        <ShoppingBag size={18} />
                                        <AutoTranslatedText text="Add to Bag" />
                                    </button>

                                    {isManagementAllowed && (
                                        <button
                                            onClick={() => { handleDelete(selectedItem!.id); setShowDetailModal(false); }}
                                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-red-600/40 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            <AutoTranslatedText text="Delete Product" />
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => setShowOrderLookupModal(true)}
                                        className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-all"
                                    >
                                        <AutoTranslatedText text="Check Order Status" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
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
                        className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-neutral-200 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="p-12">
                                <div className="flex justify-between items-center mb-12">
                                    <h3 className="text-3xl font-serif font-black text-neutral-900 uppercase tracking-tighter">
                                        <AutoTranslatedText text={isEditMode ? 'Edit Product Info' : 'Register New Product'} />
                                    </h3>
                                    <button onClick={() => { setShowAddModal(false); setIsEditMode(false); }} className="p-3 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors"><X size={24} /></button>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">
                                                <AutoTranslatedText text="Product Title" />
                                            </label>
                                            <input
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all"
                                                placeholder={t("Enter title...")}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">
                                                <AutoTranslatedText text="Price" />
                                            </label>
                                            <input
                                                type="text"
                                                value={newPrice}
                                                onChange={(e) => setNewPrice(e.target.value)}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all"
                                                placeholder={t("₩0,000")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">
                                            <AutoTranslatedText text="Short Description" />
                                        </label>
                                        <input
                                            type="text"
                                            value={newShortDescription}
                                            onChange={(e) => setNewShortDescription(e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all"
                                            placeholder={t("Enter short description (shown on card)...")}
                                        />
                                    </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">
                                                <AutoTranslatedText text="Category" />
                                            </label>
                                            <select
                                                value={newSubCategory}
                                                onChange={(e) => setNewSubCategory(e.target.value)}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">{t('common.all')}</option>
                                                {customCategories.map(c => (
                                                    <option key={c.id} value={c.id}>{getLoc(c.label, i18n.language)}</option>
                                                ))}
                                            </select>
                                        </div>


                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">
                                            <AutoTranslatedText text="Detailed Description" />
                                        </label>
                                        <textarea
                                            value={newLongDescription}
                                            onChange={(e) => setNewLongDescription(e.target.value)}
                                            rows={5}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none resize-none transition-all"
                                            placeholder={t("Enter detailed description (shown on detail modal)...")}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase block">
                                                <AutoTranslatedText text="Product Thumbnail (Card View)" />
                                            </label>
                                            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'main')} accept="image/*" className="hidden" />
                                            {!previewUrl ? (
                                                <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all text-neutral-400">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Front Image" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-neutral-200 group h-40">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase block">
                                                <AutoTranslatedText text="Detail Page Image (Info View)" />
                                            </label>
                                            <input type="file" ref={detailFileInputRef} onChange={(e) => handleFileChange(e, 'detail')} accept="image/*" className="hidden" />
                                            {!detailPreviewUrl ? (
                                                <button onClick={() => detailFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all text-neutral-400">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Detail Page Image" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-neutral-200 group h-40">
                                                    <img src={detailPreviewUrl} alt="Detail Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setDetailPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400/40 uppercase block">
                                                <AutoTranslatedText text="Side Image (Optional)" />
                                            </label>
                                            <input type="file" ref={leftSideFileInputRef} onChange={(e) => handleFileChange(e, 'left')} accept="image/*" className="hidden" />
                                            {!leftSidePreviewUrl ? (
                                                <button onClick={() => leftSideFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-neutral-100/10 hover:border-neutral-100/20 hover:bg-neutral-50/5 transition-all text-neutral-400/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Side View" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-neutral-200/20 group h-40">
                                                    <img src={leftSidePreviewUrl} alt="Side Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setLeftSidePreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400/40 uppercase block">
                                                <AutoTranslatedText text="Back Image (Optional)" />
                                            </label>
                                            <input type="file" ref={backFileInputRef} onChange={(e) => handleFileChange(e, 'back')} accept="image/*" className="hidden" />
                                            {!backPreviewUrl ? (
                                                <button onClick={() => backFileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center p-8 h-40 rounded-2xl border-2 border-dashed border-neutral-100/10 hover:border-neutral-100/20 hover:bg-neutral-50/5 transition-all text-neutral-400/40">
                                                    <UploadCloud size={24} className="mb-2" />
                                                    <span className="text-[10px] font-bold"><AutoTranslatedText text="Back View" /></span>
                                                </button>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-neutral-200/20 group h-40">
                                                    <img src={backPreviewUrl} alt="Back Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                        <button onClick={() => setBackPreviewUrl(null)} className="px-4 py-2 bg-red-500 rounded-lg text-[10px] font-black uppercase text-white"><AutoTranslatedText text="Remove" /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddItem}
                                        disabled={isUploading || !newTitle || (!newImageUrl && !previewUrl && !newDetailImageUrl && !detailPreviewUrl)}
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

                                    {isEditMode && (
                                        <button
                                            onClick={() => { handleDelete(editingId!); setShowAddModal(false); }}
                                            className="w-full py-5 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-3 border border-red-100"
                                        >
                                            <Trash2 size={16} />
                                            <AutoTranslatedText text="Delete Product Permanent" />
                                        </button>
                                    )}
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
                        className="fixed inset-0 z-[40000] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-neutral-200 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">
                                        <AutoTranslatedText text="Order Information" />
                                    </h3>
                                    <button onClick={() => setShowCheckoutModal(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400"><X size={20} /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                                                    <AutoTranslatedText text={checkoutMode === 'single' ? 'Product' : 'Items Summary'} />
                                                </span>
                                                <div className="text-xl font-bold text-neutral-900 uppercase tracking-tighter">
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
                                                <span className="text-[10px] font-black tracking-widest text-red-600 uppercase block mb-1"><AutoTranslatedText text="Total Amount" /></span>
                                                <div className="text-2xl font-black text-neutral-900 tracking-tighter">
                                                    {checkoutMode === 'single' 
                                                        ? getLoc(selectedItem?.price, i18n.language)
                                                        : formatPrice(cartTotal)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                                <AutoTranslatedText text="Orderer Name" />
                                            </label>
                                            <input
                                                type="text"
                                                value={orderInfo.name}
                                                onChange={(e) => setOrderInfo({ ...orderInfo, name: e.target.value })}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-4 px-6 text-neutral-900 text-sm focus:border-red-600/30 outline-none transition-all"
                                                placeholder={t("Orderer Name")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                                <AutoTranslatedText text="Contact Number" />
                                            </label>
                                            <input
                                                type="text"
                                                value={orderInfo.phone}
                                                onChange={(e) => setOrderInfo({ ...orderInfo, phone: e.target.value })}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-4 px-6 text-neutral-900 text-sm focus:border-red-600/30 outline-none transition-all"
                                                placeholder="010-0000-0000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                                <AutoTranslatedText text="Shipping Address" />
                                            </label>
                                            <textarea
                                                value={orderInfo.address}
                                                onChange={(e) => setOrderInfo({ ...orderInfo, address: e.target.value })}
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-4 px-6 text-neutral-900 text-sm focus:border-red-600/30 outline-none resize-none transition-all"
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
                        className="fixed inset-0 z-[40000] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-neutral-200 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-12">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-3xl font-serif font-black text-neutral-900 uppercase tracking-tighter">
                                        <AutoTranslatedText text="Order Tracking" />
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowOrderLookupModal(false);
                                            setLookupResult(null);
                                            setOrderLookupInfo({ name: '', phone: '' });
                                        }}
                                        className="p-3 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {!lookupResult ? (
                                    <div className="space-y-8">
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                                    <AutoTranslatedText text="Orderer Name" />
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orderLookupInfo.name}
                                                    onChange={(e) => setOrderLookupInfo({ ...orderLookupInfo, name: e.target.value })}
                                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all"
                                                    placeholder={t("Enter your name")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                                    <AutoTranslatedText text="Contact Number" />
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orderLookupInfo.phone}
                                                    onChange={(e) => setOrderLookupInfo({ ...orderLookupInfo, phone: e.target.value })}
                                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all"
                                                    placeholder="010-0000-0000"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLookupOrder}
                                            disabled={isSearchingOrder || !orderLookupInfo.name || !orderLookupInfo.phone}
                                            className="w-full py-6 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-[0.2em] disabled:opacity-20 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-red-600/10"
                                        >
                                            {isSearchingOrder ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
                                        <div className="p-8 rounded-[2.5rem] bg-neutral-50 border border-neutral-200 space-y-8 shadow-inner">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase block mb-1"><AutoTranslatedText text="Status" /></span>
                                                    <span className="px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                                                        <AutoTranslatedText text={lookupResult.status} />
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-1"><AutoTranslatedText text="Order ID" /></div>
                                                    <div className="text-xs font-bold text-neutral-900 tracking-tighter">{lookupResult.id}</div>
                                                </div>
                                            </div>

                                            <div className="h-[1px] w-full bg-neutral-200" />

                                            <div className="space-y-5">
                                                <div>
                                                    <div className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-1"><AutoTranslatedText text="Product" /></div>
                                                    <div className="text-base font-bold text-neutral-900"><AutoTranslatedText text={lookupResult.productName} /></div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <div className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-1"><AutoTranslatedText text="Date" /></div>
                                                        <div className="text-xs font-medium text-neutral-600">{lookupResult.date}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-1"><AutoTranslatedText text="Price" /></div>
                                                        <div className="text-xs font-black text-red-600">{lookupResult.price}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setLookupResult(null)}
                                            className="w-full py-5 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-neutral-900 hover:bg-neutral-200 transition-all"
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



            {/* Category Management Modal */}
            <AnimatePresence>
                {showCategoryModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[50000] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-neutral-200 w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-12">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-3xl font-serif font-black text-neutral-900 uppercase tracking-tighter">
                                        <AutoTranslatedText text={editingCategory ? 'Edit Category' : 'Add Category'} />
                                    </h3>
                                    <button onClick={() => setShowCategoryModal(false)} className="p-3 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors"><X size={24} /></button>
                                </div>
                                
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                            <AutoTranslatedText text="Category Name" />
                                        </label>
                                        <input
                                            type="text"
                                            value={newCategoryLabel}
                                            onChange={(e) => setNewCategoryLabel(e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all"
                                            placeholder="Enter category name..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase pl-1">
                                            <AutoTranslatedText text="Background Image URL (Optional)" />
                                        </label>
                                        <input
                                            type="text"
                                            value={newCategoryBg}
                                            onChange={(e) => setNewCategoryBg(e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-5 px-6 text-neutral-900 text-sm focus:ring-2 focus:ring-red-600/10 focus:border-red-600/30 outline-none transition-all"
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveCategory}
                                        disabled={!newCategoryLabel}
                                        className="w-full py-6 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-[0.2em] disabled:opacity-20 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-red-600/10"
                                    >
                                        <AutoTranslatedText text={editingCategory ? 'Update' : 'Create'} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="mt-40 border-t py-24 px-6 bg-white" style={{ borderColor: '#E5E7EB' }}>
                <div className="container mx-auto flex flex-col items-center gap-8">
                    <div className="text-5xl font-serif font-black tracking-tighter text-neutral-100 uppercase select-none"><AutoTranslatedText text="몽땅쏙" /></div>
                    <p className="text-[10px] font-black tracking-[0.6em] text-neutral-400 uppercase text-center max-w-lg leading-loose">
                        <AutoTranslatedText text="Traditional Heritage × Modern Virtual Experience" />
                    </p>
                    <div className="w-12 h-[1px] bg-neutral-200" />
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
                            className="fixed inset-0 z-[50000] bg-neutral-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[51000] bg-white border-l border-neutral-200 shadow-2xl flex flex-col"
                        >
                            <div className="p-10 border-b border-neutral-100 flex justify-between items-center">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-serif font-black text-neutral-900 uppercase tracking-tighter">
                                        <AutoTranslatedText text="Shopping Bag" />
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                        <span>{totalItems} <AutoTranslatedText text="Items" /></span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCartDrawer(false)}
                                    className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-full text-neutral-400 transition-all hover:text-neutral-900"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-10 space-y-8 scrollbar-hide">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-neutral-200 space-y-4">
                                        <ShoppingBag size={64} strokeWidth={1} />
                                        <p className="text-xs font-black uppercase tracking-widest text-center">
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
                                            className="flex gap-6 p-5 rounded-3xl bg-neutral-50 border border-neutral-100 relative group transition-all hover:shadow-md"
                                        >
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-neutral-200 shrink-0">
                                                <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-grow min-w-0 py-2">
                                                <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-tight truncate mb-1">
                                                    <AutoTranslatedText text={getLoc(item.title, i18n.language)} />
                                                </h4>
                                                <p className="text-[11px] font-black tracking-widest text-red-600 mb-4">
                                                    {getLoc(item.price, i18n.language)}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center bg-white rounded-lg border border-neutral-200 p-1">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-xs font-black text-neutral-900 w-8 text-center">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="absolute top-6 right-6 text-neutral-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-10 bg-neutral-50 border-t border-neutral-200 space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest"><AutoTranslatedText text="Estimated Total" /></span>
                                            <div className="text-4xl font-black text-neutral-900 tracking-tighter">
                                                {formatPrice(cartTotal)}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={clearCart}
                                            className="text-[10px] font-black text-neutral-300 hover:text-red-600 uppercase tracking-widest transition-colors mb-3"
                                        >
                                            <AutoTranslatedText text="Clear All" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCheckoutMode('cart');
                                            setShowCartDrawer(false);
                                            setShowCheckoutModal(true);
                                        }}
                                        className="w-full py-6 rounded-2xl bg-neutral-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-black"
                                    >
                                        <AutoTranslatedText text="Checkout Bag" />
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

export default ShoppingMallPage;


