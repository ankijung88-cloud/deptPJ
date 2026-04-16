import React, { useState, useEffect } from 'react';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../hooks/useAdmin';
import { TEMPLATE_CATEGORIES } from '../utils/constants';
import { 
    LayoutDashboard, 
    Package, 
    Layers, 
    Plus, 
    Search,
    Edit2,
    Trash2,
    ChevronRight,
    X,
    Megaphone,
    HelpCircle,
    Upload,
    Check,
    RotateCcw,
    LogOut,
    Menu,
    ShoppingCart
} from 'lucide-react';
import { useFloors } from '../context/FloorContext';
import { getFeaturedProducts, deleteProduct, createProduct, updateProduct } from '../api/products';
import { 
    createFloorCategory, 
    updateFloorCategory, 
    deleteFloorCategory
} from '../api/categories';
import { getNotices, createNotice as apiCreateNotice, updateNotice as apiUpdateNotice, deleteNotice as apiDeleteNotice } from '../api/notices';
import { getFaqs, createFaq as apiCreateFaq, updateFaq as apiUpdateFaq, deleteFaq as apiDeleteFaq } from '../api/faqs';
import { getAgencies, createAgency, updateAgency, deleteAgency, updateAgencyStatus } from '../api/auth';
import { getOrders, updateOrderStatus, deleteOrder } from '../api/orders';
import { FeaturedItem, Notice, FAQ } from '../types';
import { getNormalizedFloorId, getNormalizedSubcategoryId } from '../utils/idUtils';

// Helper for localized text
const displayLocalized = (text: any) => {
    if (!text) return '';
    if (typeof text === 'string') {
        // 만약 문자열이 JSON 형태라면 파싱 시도
        if (text.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(text);
                return parsed.ko || parsed.en || Object.values(parsed)[0] || '';
            } catch (e) {
                return text;
            }
        }
        return text;
    }
    return text.ko || text.en || Object.values(text)[0] || '';
};

const normalizeLocalizedString = (val: any): { ko: string; en: string } => {
    if (!val) return { ko: '', en: '' };
    
    // If it's already an object, just ensure it has ko/en keys
    if (typeof val === 'object' && val !== null) {
        return {
            ko: val.ko || '',
            en: val.en || ''
        };
    }

    // If it's a string, try to parse it as JSON
    if (typeof val === 'string' && val.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(val);
            // Recursively call for potentially nested JSON or return if it's the right shape
            if (typeof parsed === 'object' && parsed !== null) {
                return normalizeLocalizedString(parsed);
            }
        } catch (e) {
            // If parsing fails, fall back to treating it as a normal string
        }
    }

    // If it's just a regular string
    return {
        ko: val || '',
        en: ''
    };
};

const generateUniqueId = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toLowerCase();
    return `item-${date}-${random}`;
};

const DEFAULT_LONG_DESCRIPTION = {
    ko: "현대 시대를 위해 재해석된 전통 한국 미학의 깊이를 탐험하세요.\n\n각 요소는 단순한 시청을 초월하는 몰입형 경험을 제공하도록 세심하게 큐레이팅되었습니다. 이 프레젠테이션의 건축물 안에 담긴 질감, 리듬, 그리고 침묵의 이야기에 참여하시기 바랍니다.",
    en: "Explore the depths of traditional Korean aesthetics reimagined for the modern era. Handcrafted with precision and a deep respect for historical legacy, this piece represents more than just a functional object—it is a vessel of culture, carrying signatures of the past into the digital frontier.\n\nEach element has been meticulously curated to provide an immersive experience that transcends simple viewing. We invite you to engage with the textures, the rhythms, and the silent stories embedded within the architecture of this presentation."
};

const normalizeProductData = (product: any) => {
    const defaultData = {
        id: generateUniqueId(),
        title: { ko: '', en: '' },
        category: '',
        subcategory: '',
        description: { ko: '', en: '' },
        image_url: '',
        event_date: { ko: '', en: '' },
        location: { ko: '', en: '' },
        price: '',
        video_url: '',
        long_description: { ...DEFAULT_LONG_DESCRIPTION },
        closed_days: [],
        parent_id: '',
        detail_media_url: '',
        detail_media_type: 'image',
        reservation_programs: [],
        reservation_slots: []
    };
    if (!product) return defaultData;

    // FeaturedItem 타입(camelCase)과 DB 원본(snake_case) 모두 지원
    const image_url = product.image_url || product.imageUrl || '';
    const video_url = product.video_url || product.videoUrl || '';
    // event_date: FeaturedItem에서는 'date' 필드에 매핑됨
    const raw_event_date = product.event_date || product.date || '';
    // closed_days: FeaturedItem에서는 'closedDays' 필드에 매핑됨
    const raw_closed_days = product.closed_days || product.closedDays || [];

    const normalized_long_description = normalizeLocalizedString(product.long_description);
    if (!normalized_long_description.ko && !normalized_long_description.en) {
        normalized_long_description.ko = DEFAULT_LONG_DESCRIPTION.ko;
        normalized_long_description.en = DEFAULT_LONG_DESCRIPTION.en;
    }

    return {
        ...defaultData,
        ...product,
        image_url,
        video_url,
        title: normalizeLocalizedString(product.title),
        description: normalizeLocalizedString(product.description),
        long_description: normalized_long_description,
        event_date: normalizeLocalizedString(raw_event_date),
        location: normalizeLocalizedString(product.location),
        closed_days: Array.isArray(raw_closed_days) ? raw_closed_days : [],
        parent_id: product.parent_id || '',
        detail_media_url: product.detail_media_url || product.detailMediaUrl || '',
        detail_media_type: product.detail_media_type || product.detailMediaType || 'image',
        reservation_programs: typeof product.reservation_programs === 'string' ? JSON.parse(product.reservation_programs) : (product.reservation_programs || []),
        reservation_slots: typeof product.reservation_slots === 'string' ? JSON.parse(product.reservation_slots) : (product.reservation_slots || [])
    };
};

const normalizeNoticeData = (notice: any) => {
    const defaultData = {
        title: { ko: '', en: '' },
        content: { ko: '', en: '' },
        category: '',
        date: new Date().toISOString().split('T')[0],
        is_important: false
    };
    if (!notice) return defaultData;
    return {
        ...defaultData,
        ...notice,
        title: normalizeLocalizedString(notice.title),
        content: normalizeLocalizedString(notice.content),
        agency_id: notice.agency_id || null
    };
};

const normalizeFAQData = (faq: any) => {
    const defaultData = {
        question: { ko: '', en: '' },
        answer: { ko: '', en: '' },
        category: '',
        display_order: 0
    };
    if (!faq) return defaultData;
    return {
        ...defaultData,
        ...faq,
        question: normalizeLocalizedString(faq.question),
        answer: normalizeLocalizedString(faq.answer),
        agency_id: faq.agency_id || null
    };
};

// Components for different sections
const ProductManager = ({ agencies }: { agencies: any[] }) => {
    const { isAdmin } = useAdmin();
    const { floors } = useFloors();
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('');
    const [selectedFloor, setSelectedFloor] = useState(''); // e.g. floor-1
    const [selectedSubcategory, setSelectedSubcategory] = useState(''); // floor subitem id
    const [selectedProductType, setSelectedProductType] = useState(''); // free subcategory value
    const [selectedTemplate, setSelectedTemplate] = useState(''); // cinema, museum, etc. or 'uncategorized'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const searchPlaceholder = "Search products...";
    const allFloorsLabel = "모든 층";
    const allSubCatsLabel = "모든 서브카테고리";
    const allProductTypesLabel = "모든 제품종류";
    const allTemplatesLabel = "템플릿 및 기타 미분류";
    const allAgenciesLabel = "모든 에이전시";
    const [currentPage, setCurrentPage] = useState(1);
    const [isBypassFilters, setIsBypassFilters] = useState(false);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        fetchProducts();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFloor, selectedSubcategory, selectedProductType, selectedTemplate, selectedAgency]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Updated API call to support role-based filtering on server side if needed, 
            // but here we get all for simpler filtering if it's admin.
            // Actually, best to pass agencyId if admin selected one.
            const data = await getFeaturedProducts();
            setProducts(data);
        } finally {
            setLoading(false);
        }
    };


    const { translateAsync } = useAutoTranslate(null);

    const handleDelete = async (id: string) => {
        const confirmMsg = await translateAsync('Are you sure you want to delete this product?');
        if (confirm(confirmMsg)) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (err) {
                const errMsg = await translateAsync('Delete failed');
                alert(errMsg);
            }
        }
    };



    // 1. Base search & primary filters
    const baseFiltered = products.filter(p => {
        const normalizedCatId = getNormalizedFloorId(p.category);
        const floor = floors.find(f => f.id === normalizedCatId);
        const floorLabel = floor ? `${floor.floor} ${displayLocalized(floor.title)}`.toLowerCase() : '';
        
        const term = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            p.id.toLowerCase().includes(term) ||
            displayLocalized(p.title).toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term) ||
            normalizedCatId.toLowerCase().includes(term) ||
            floorLabel.includes(term) ||
            (p.subcategory && (
                p.subcategory.toLowerCase().includes(term) || 
                getNormalizedSubcategoryId(p.subcategory).toLowerCase().includes(term)
            ));
        const matchesAgency = !selectedAgency || Number(p.agency_id) === Number(selectedAgency);
        return matchesSearch && matchesAgency;
    });

    // 2. Options for Floor & Category dropdown (Show all floors unconditionally)
    const floorOptions = floors;
    
    // 3. Filtered for Subcategory dropdown
    const floorFiltered = baseFiltered.filter(p => !selectedFloor || getNormalizedFloorId(p.category) === selectedFloor);
    
    // Aggregated subcategories from all floors if none selected, or from selected floor
    const allRelevantSubitems = selectedFloor 
        ? floors.find(f => f.id === selectedFloor)?.subitems || []
        : floors.flatMap(f => f.subitems || []);
        
    const subcategoryOptions = Array.from(new Map(allRelevantSubitems.map(s => [s.id, s])).values());
    // Show all defined subcategories for the selected floor to ensure rebranded items like "CAR 케어" are visible

    const floorFilteredNormalized = floorFiltered.map(p => ({ ...p, subcategory: getNormalizedSubcategoryId(p.subcategory || '') }));
    
    // 4. Filtered for Product Title dropdown
    const subFiltered = floorFilteredNormalized.filter(p => !selectedSubcategory || p.subcategory === selectedSubcategory);
    const productTitleOptions = Array.from(new Set(subFiltered.map(p => displayLocalized(p.title)).filter(Boolean))).sort();

    // 5. Filtered for Template dropdown
    const typeFiltered = subFiltered.filter(p => !selectedProductType || displayLocalized(p.title) === selectedProductType);
    const templateOptions = Array.from(new Set(typeFiltered.map(p => {
        const normalizedCatId = getNormalizedFloorId(p.category);
        if (TEMPLATE_CATEGORIES.includes(normalizedCatId)) return normalizedCatId;
        const isFloor = floors.some(f => f.id === normalizedCatId);
        if (!isFloor || !p.category) return 'uncategorized';
        return null;
    }).filter((cat): cat is string => !!cat))).sort();

    // 6. Final filtered list for the table
    const filteredProducts = isBypassFilters 
        ? baseFiltered 
        : typeFiltered.filter(p => {
            const isUncategorized = !p.category || (!floors.some(f => f.id === p.category) && !TEMPLATE_CATEGORIES.includes(p.category));
            const matchesTemplate = !selectedTemplate || 
                (selectedTemplate === 'uncategorized' ? isUncategorized : getNormalizedFloorId(p.category) === selectedTemplate);
            return matchesTemplate;
        });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const filteredCountText = `${filteredProducts.length} items`;

    return (
        <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-serif font-bold text-white">Product Management</h2>
                    <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-sm font-bold">
                        {filteredCountText}
                    </span>
                </div>
                <button 
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    className="bg-[#00FFC2] text-[#0A0D17] px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition-all"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 relative z-10">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input 
                        type="text" 
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FFC2]/50"
                    />
                </div>

                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-4 py-2 shrink-0 h-[56px]">
                    <input 
                        type="checkbox" 
                        id="bypass-filters"
                        checked={isBypassFilters}
                        onChange={(e) => setIsBypassFilters(e.target.checked)}
                        className="w-4 h-4 accent-[#00FFC2] cursor-pointer"
                    />
                    <label htmlFor="bypass-filters" className="text-xs text-white/50 cursor-pointer select-none whitespace-nowrap">
                        Show All (Bypass)
                    </label>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    {isAdmin && (
                        <select 
                            value={selectedAgency}
                            onChange={(e) => {
                                setSelectedAgency(e.target.value);
                                setSelectedFloor('');
                                setSelectedSubcategory('');
                                setSelectedProductType('');
                                setSelectedTemplate('');
                            }}
                            className="bg-black/40 border border-[#00FFC2]/20 rounded-2xl px-4 py-2 text-[#00FFC2] focus:outline-none focus:border-[#00FFC2]/50 cursor-pointer min-w-[140px] font-bold"
                        >
                            <option value="">{allAgenciesLabel}</option>
                            {agencies.map(a => (
                                <option key={a.id} value={a.id}>{a.agency_name}</option>
                            ))}
                        </select>
                    )}

                    {/* 2 & 3. Merged Floor & Category */}
                    <select 
                        value={selectedFloor}
                        onChange={(e) => {
                            setSelectedFloor(e.target.value);
                            setSelectedSubcategory('');
                            setSelectedTemplate('');
                        }}
                        className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50 cursor-pointer min-w-[200px]"
                    >
                        <option value="">{allFloorsLabel}</option>
                        {floorOptions.map(f => (
                            <option key={f.id} value={f.id}>{f.floor} - {displayLocalized(f.title)}</option>
                        ))}
                    </select>

                    {/* 4. Subcategory (Floor Areas) */}
                    <select 
                        value={selectedSubcategory}
                        onChange={(e) => {
                            setSelectedSubcategory(e.target.value);
                            setSelectedProductType('');
                            setSelectedTemplate('');
                        }}
                        className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50 cursor-pointer min-w-[150px]"
                        disabled={!selectedFloor}
                    >
                        <option value="">{allSubCatsLabel}</option>
                        {subcategoryOptions.map(s => (
                            <option key={s.id} value={s.id}>{displayLocalized(s.label)}</option>
                        ))}
                    </select>

                    {/* 5. Product Type (Showing Titles as requested) */}
                    <select 
                        value={selectedProductType}
                        onChange={(e) => {
                            setSelectedProductType(e.target.value);
                            setSelectedTemplate('');
                        }}
                        className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50 cursor-pointer min-w-[200px]"
                    >
                        <option value="">{allProductTypesLabel}</option>
                        {productTitleOptions.map(title => (
                            <option key={title} value={title}>{title}</option>
                        ))}
                    </select>

                    {/* 6. Template & Uncategorized */}
                    <select 
                        value={selectedTemplate}
                        onChange={(e) => {
                            setSelectedTemplate(e.target.value);
                            if (e.target.value) {
                                setSelectedFloor('');
                                setSelectedSubcategory('');
                                setSelectedProductType('');
                            }
                        }}
                        className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50 cursor-pointer min-w-[180px]"
                    >
                        <option value="">{allTemplatesLabel}</option>
                        {templateOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                        ))}
                    </select>

                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedAgency('');
                            setSelectedFloor('');
                            setSelectedSubcategory('');
                            setSelectedProductType('');
                            setSelectedTemplate('');
                            setCurrentPage(1);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-bold transition-all border border-white/20 hover:scale-105 active:scale-95"
                    >
                        <RotateCcw size={18} />
                        <span className="text-sm">Reset Filters</span>
                    </button>
                </div>
            </div>

            <div className="bg-[#1A2420]/40 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Title</th>
                            {isAdmin && <th className="px-6 py-4 text-[#00FFC2]">Agency</th>}
                            <th className="px-6 py-4">Floor</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginatedProducts.map(product => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-black/20" />
                                </td>
                                <td className="px-6 py-4 text-white font-medium">
                                    {displayLocalized(product.title)}
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-[#00FFC2] font-bold text-xs">
                                        {agencies.find(a => a.id === (product as any).agency_id)?.agency_name || '-'}
                                    </td>
                                )}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: floors.find(f => f.id === getNormalizedFloorId(product.category))?.color || '#333' }}></div>
                                        <span className="text-white font-bold">
                                            {(() => {
                                            const normalizedCatId = getNormalizedFloorId(product.category);
                                                const floor = floors.find(f => f.id === normalizedCatId);
                                                if (floor) return `${floor.floor}`;
                                                if (TEMPLATE_CATEGORIES.includes(product.category)) return 'Template';
                                                return displayLocalized(product.category);
                                            })()}
                                        </span>
                                        <span className="text-white/40 text-xs">
                                            {(() => {
                                                const normalizedCatId = getNormalizedFloorId(product.category);
                                                const floor = floors.find(f => f.id === normalizedCatId);
                                                if (floor) return displayLocalized(floor.title);
                                                if (TEMPLATE_CATEGORIES.includes(normalizedCatId)) return normalizedCatId.toUpperCase();
                                                return '';
                                            })()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-white/60">
                                    {(() => {
                                        const normalizedCatId = getNormalizedFloorId(product.category);
                                        const floor = floors.find(f => f.id === normalizedCatId);
                                        const normalizedSubId = getNormalizedSubcategoryId(product.subcategory || '');
                                        const sub = floor?.subitems?.find(s => s.id === normalizedSubId);
                                        return sub ? displayLocalized(sub.label) : displayLocalized(normalizedSubId);
                                    })()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#00FFC2] transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="py-20 text-center text-white/20">Loading products...</div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl px-6 py-4">
                    <div className="text-white/40 text-sm">
                        Showing <span className="text-white font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> of <span className="text-white font-medium">{filteredProducts.length}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-xl bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors border border-white/5"
                        >
                            Previous
                        </button>
                        <div className="flex flex-wrap gap-1 justify-center max-w-[300px] md:max-w-none">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                                        currentPage === page 
                                            ? 'bg-[#00FFC2] text-[#0A0D17] border-[#00FFC2]' 
                                            : 'bg-white/5 text-white border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-xl bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors border border-white/5"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modal placeholder */}
            <AnimatePresence>
                {isModalOpen && (
                    <ProductFormModal 
                        product={editingProduct} 
                        onClose={() => setIsModalOpen(false)} 
                        onSuccess={() => { setIsModalOpen(false); fetchProducts(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductFormModal = ({ product, onClose, onSuccess }: any) => {
    const { isAdmin } = useAdmin();
    const { floors } = useFloors();
    const [agencies, setAgencies] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>(() => {
        const data = normalizeProductData(product);
        return {
            ...data,
            agency_id: (product as any)?.agency_id || ''
        };
    });
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin) {
            fetchAgencies();
        }
    }, [isAdmin]);

    const fetchAgencies = async () => {
        try {
            const data = await getAgencies();
            setAgencies(data);
        } catch (err) {
            console.error('Failed to fetch agencies for modal:', err);
        }
    };

    const isEdit = !!product;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(field);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: uploadData
            });
            
            if (!response.ok) {
                let errorMsg = 'Unknown error';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
                } catch (e) {
                    errorMsg = await response.text();
                }
                console.error('Upload Error:', errorMsg);
                throw new Error(errorMsg);
            }

            const data = await response.json();
            if (data.url) {
                setFormData({ ...formData, [field]: data.url });
            }
        } catch (err: any) {
            console.error('Upload failure:', err);
            alert(`Upload failed: ${err.message || 'Unknown error'}`);
        } finally {
            setUploading(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateProduct(product.id, formData);
            } else {
                await createProduct(formData);
            }
            onSuccess();
        } catch (err: any) {
            console.error('[handleSubmit] Error:', err);
            alert(`Operation failed: ${err.message || JSON.stringify(err)}`);
        }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} 
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-[#1A2420] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold text-white">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. ID & 2. Title */}
                        <div className="space-y-4">
                            {!isEdit && (
                                <div>
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block">1. Unique ID</label>
                                    <input 
                                        type="text" required
                                        value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                        placeholder="e.g. k-heritage-001"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="2. 제목" /></label>
                                <input 
                                    type="text" required
                                    value={formData.title.ko} onChange={(e) => setFormData({...formData, title: {...formData.title, ko: e.target.value}})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                />
                            </div>
                        </div>

                        {/* 3. Category & 4. Subcategory */}
                        <div className="space-y-4">
                            {isAdmin && (
                                <div>
                                    <label className="text-xs font-bold text-[#00FFC2] uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="Agency Owner" /></label>
                                    <select 
                                        value={formData.agency_id || ''} 
                                        onChange={(e) => setFormData({...formData, agency_id: e.target.value})}
                                        className="w-full bg-black/40 border border-[#00FFC2]/30 rounded-xl p-4 text-[#00FFC2] focus:border-[#00FFC2]/50 font-bold"
                                    >
                                        <option value="">Admin (Default)</option>
                                        {agencies.map(a => (
                                            <option key={a.id} value={a.id}>{a.agency_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="3. Category (Floor)" /></label>
                                <select 
                                    required
                                    value={formData.category} 
                                    onChange={(e) => {
                                        const newFloorId = e.target.value;
                                        const floor = floors.find(f => f.id === newFloorId);
                                        setFormData({
                                            ...formData, 
                                            category: newFloorId,
                                            subcategory: floor?.subitems?.[0]?.id || ''
                                        });
                                    }}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                >
                                    <option value="">Select Floor</option>
                                    {floors.map(floor => (
                                        <option key={floor.id} value={floor.id}>
                                            {floor.floor} - {typeof floor.title === 'string' ? floor.title : floor.title.ko}
                                        </option>
                                    ))}
                                    <optgroup label="Templates">
                                        {TEMPLATE_CATEGORIES.map(t => (
                                            <option key={t} value={t}>{t.toUpperCase()}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="4. Subcategory ID" /></label>
                                <select 
                                    required
                                    value={formData.subcategory} 
                                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                    disabled={!formData.category}
                                >
                                    <option value="">Select Subcategory</option>
                                    {TEMPLATE_CATEGORIES.includes(formData.category) ? (
                                        <option value="general">General</option>
                                    ) : (
                                        floors.find(f => f.id === formData.category)?.subitems?.map(sub => (
                                            <option key={sub.id} value={sub.id}>
                                                {typeof sub.label === 'string' ? sub.label : sub.label.ko}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 5. Description */}
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="5. 설명" /></label>
                        <textarea 
                            rows={4} required
                            value={formData.description.ko} onChange={(e) => setFormData({...formData, description: {...formData.description, ko: e.target.value}})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50 resize-none"
                        />
                    </div>

                    {/* Template specific fields: Parent ID */}
                    {TEMPLATE_CATEGORIES.includes(formData.category) && (
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block">
                                <AutoTranslatedText text="Template Linked Parent ID (필수)" />
                            </label>
                            <input 
                                type="text" 
                                value={formData.parent_id || ''} 
                                onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                                className="w-full bg-black/40 border border-[#00FFC2]/30 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                placeholder="연결할 상위 제품의 ID를 입력하세요 (예: car-care-exchange-week)"
                            />
                            <p className="text-[10px] text-white/30 mt-2 px-1">
                                * 템플릿(Cinema, Museum 등) 데이터는 상위 제품 ID가 정확히 입력되어야 해당 페이지에서 노출됩니다.
                            </p>
                        </div>
                    )}

                    {/* 5-2. Detailed Description */}
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="5-2. 상세 설명 (상세 페이지용)" /></label>
                        <textarea 
                            rows={8}
                            value={formData.long_description.ko} onChange={(e) => setFormData({...formData, long_description: {...formData.long_description, ko: e.target.value}})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50 resize-none"
                            placeholder="상세 페이지 하단에 표시될 긴 설명을 입력하세요. 빈 칸인 경우 기본 하드코딩된 텍스트가 표시됩니다."
                        />
                    </div>

                    {/* 5-3. 상세 미디어 (상세 설명 하단) */}
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="5-3. 상세 미디어 (상세 설명 하단)" /></label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-6 rounded-2xl border border-white/5">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-white/40 uppercase block tracking-wider">미디어 타입 (Media Type)</label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, detail_media_type: 'image'})}
                                        className={`flex-1 py-3 rounded-xl border transition-all font-bold ${formData.detail_media_type === 'image' ? 'bg-[#00FFC2] text-[#0A0D17] border-[#00FFC2]' : 'bg-black/40 text-white/40 border-white/10 hover:bg-white/5'}`}
                                    >
                                        이미지 (Image)
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, detail_media_type: 'video'})}
                                        className={`flex-1 py-3 rounded-xl border transition-all font-bold ${formData.detail_media_type === 'video' ? 'bg-[#00FFC2] text-[#0A0D17] border-[#00FFC2]' : 'bg-black/40 text-white/40 border-white/10 hover:bg-white/5'}`}
                                    >
                                        영상 (Video)
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-white/40 uppercase block tracking-wider">미디어 업로드 / URL (Upload / URL)</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative group">
                                        <input 
                                            type="text" 
                                            value={formData.detail_media_url || ''} 
                                            onChange={(e) => setFormData({...formData, detail_media_url: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-xs focus:border-[#00FFC2]/50 pr-12"
                                            placeholder="https://..."
                                        />
                                        <label className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg cursor-pointer text-white/40 hover:text-[#00FFC2] transition-all">
                                            {uploading === 'detail_media_url' ? <div className="w-4 h-4 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
                                            <input type="file" className="hidden" accept={formData.detail_media_type === 'video' ? "video/*" : "image/*"} onChange={(e) => handleFileUpload(e, 'detail_media_url')} />
                                        </label>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 min-h-[150px] flex items-center justify-center overflow-hidden">
                                    {formData.detail_media_url ? (
                                        formData.detail_media_type === 'video' ? (
                                            <video src={formData.detail_media_url} className="max-h-[300px] w-auto" muted loop autoPlay />
                                        ) : (
                                            <div className="max-h-[400px] w-full overflow-y-auto custom-scrollbar flex justify-center">
                                                <img 
                                                    src={formData.detail_media_url} 
                                                    alt="" 
                                                    className="w-full h-auto max-w-full" 
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <span className="text-[10px] text-white/20 uppercase tracking-widest italic">미리보기 (No Preview)</span>
                                    )}
                                </div>
                                <p className="text-[9px] text-white/20 px-1 italic">
                                    * 상세 페이지 하단에 표시될 미디어입니다. {formData.detail_media_type === 'video' ? 'MP4/M4V 영상 권장.' : 'JPG/PNG 이미지 권장.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 6. Main Image */}
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="6. Main Image" /></label>
                            <div className="space-y-4">
                                <div className="relative group aspect-video bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {formData.image_url ? (
                                        <>
                                            <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-[#00FFC2] text-[#0A0D17] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                                                    <Upload size={18} />
                                                    <AutoTranslatedText text="Change Image" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url')} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-3 text-white/20 hover:text-[#00FFC2] transition-colors">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                                {uploading === 'image_url' ? <div className="w-8 h-8 border-4 border-[#00FFC2] border-t-transparent rounded-full animate-spin" /> : <Upload size={32} />}
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-wider"><AutoTranslatedText text="Upload Main Image" /></span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url')} />
                                        </label>
                                    )}
                                </div>
                                <input 
                                    type="text" placeholder="https://..."
                                    value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[#00FFC2]/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 8. Event Date & 9. Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="8. 행사 기간" /></label>
                            <input 
                                type="text" 
                                value={formData.event_date.ko} onChange={(e) => setFormData({...formData, event_date: {...formData.event_date, ko: e.target.value}})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                placeholder="예: 2025.03.15 - 04.30"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="9. 장소" /></label>
                            <input 
                                type="text" 
                                value={formData.location.ko} onChange={(e) => setFormData({...formData, location: {...formData.location, ko: e.target.value}})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                placeholder="예: 6층 K-컬처 센터"
                            />
                        </div>
                    </div>

                    {/* 10. Price, 11. Closed Days, 12. Video URL */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="10. Price" /></label>
                            <input 
                                type="text" 
                                value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                placeholder="예: 50,000원"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="11. Closed Days" /></label>
                            <input 
                                type="text"
                                value={Array.isArray(formData.closed_days) ? JSON.stringify(formData.closed_days) : (formData.closed_days || '[]')} 
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        if (Array.isArray(parsed)) setFormData({...formData, closed_days: parsed});
                                    } catch(err) { /* ignore parse errors while typing */ }
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-[#00FFC2]/50"
                                placeholder='["2025-03-25"]'
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="12. 사이트 URL" /></label>
                            <input 
                                type="text" 
                                value={formData.video_url || ''} onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </div>

                    {/* Reservation Settings Section */}
                    <div className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Layers className="text-[#00FFC2]" size={18} />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Reservation Settings</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-8">
                            {/* Programs Management */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Programs</label>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newProgram = {
                                                id: `prog-${Date.now()}`,
                                                title: { ko: '', en: '' },
                                                description: { ko: '', en: '' },
                                                price: ''
                                            };
                                            setFormData({
                                                ...formData,
                                                reservation_programs: [...formData.reservation_programs, newProgram]
                                            });
                                        }}
                                        className="text-[10px] font-bold text-[#00FFC2] bg-[#00FFC2]/10 px-3 py-1.5 rounded-lg hover:bg-[#00FFC2]/20 transition-all font-mono"
                                    >
                                        + Add Program
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {formData.reservation_programs.map((prog: any, idx: number) => (
                                        <div key={prog.id} className="bg-black/20 border border-white/5 rounded-2xl p-6 relative group">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const updated = formData.reservation_programs.filter((_: any, i: number) => i !== idx);
                                                    setFormData({ ...formData, reservation_programs: updated });
                                                }}
                                                className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <input 
                                                        type="text"
                                                        placeholder="Program Title (KO)"
                                                        value={prog.title?.ko || ''}
                                                        onChange={(e) => {
                                                            const updated = [...formData.reservation_programs];
                                                            updated[idx] = { ...updated[idx], title: { ...updated[idx].title, ko: e.target.value } };
                                                            setFormData({ ...formData, reservation_programs: updated });
                                                        }}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#00FFC2]/50"
                                                    />
                                                    <input 
                                                        type="text"
                                                        placeholder="Price (e.g. 50,000원)"
                                                        value={prog.price || ''}
                                                        onChange={(e) => {
                                                            const updated = [...formData.reservation_programs];
                                                            updated[idx] = { ...updated[idx], price: e.target.value };
                                                            setFormData({ ...formData, reservation_programs: updated });
                                                        }}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#00FFC2]/50"
                                                    />
                                                </div>
                                                <div>
                                                    <textarea 
                                                        placeholder="Description (KO)"
                                                        rows={3}
                                                        value={prog.description?.ko || ''}
                                                        onChange={(e) => {
                                                            const updated = [...formData.reservation_programs];
                                                            updated[idx] = { ...updated[idx], description: { ...updated[idx].description, ko: e.target.value } };
                                                            setFormData({ ...formData, reservation_programs: updated });
                                                        }}
                                                        className="w-full h-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#00FFC2]/50 resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.reservation_programs.length === 0 && (
                                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl text-white/20 text-xs italic">
                                            No programs registered. Default programs will be used.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Time Slots Management */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Time Slots</label>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                reservation_slots: [...formData.reservation_slots, "10:00"]
                                            });
                                        }}
                                        className="text-[10px] font-bold text-[#00FFC2] bg-[#00FFC2]/10 px-3 py-1.5 rounded-lg hover:bg-[#00FFC2]/20 transition-all font-mono"
                                    >
                                        + Add Slot
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.reservation_slots.map((slot: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1 pl-3">
                                            <input 
                                                type="text"
                                                value={slot}
                                                onChange={(e) => {
                                                    const updated = [...formData.reservation_slots];
                                                    updated[idx] = e.target.value;
                                                    setFormData({ ...formData, reservation_slots: updated });
                                                }}
                                                className="bg-transparent border-none text-white text-xs font-mono w-16 focus:outline-none"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const updated = formData.reservation_slots.filter((_: any, i: number) => i !== idx);
                                                    setFormData({ ...formData, reservation_slots: updated });
                                                }}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/20 hover:text-red-400 transition-all font-sans"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.reservation_slots.length === 0 && (
                                        <div className="w-full text-center py-4 border border-dashed border-white/5 rounded-2xl text-white/20 text-xs italic">
                                            No time slots registered. Default slots will be used.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4 border-t border-white/5">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-white/40 hover:text-white transition-colors"><AutoTranslatedText text="Cancel" /></button>
                        <button type="submit" className="px-8 py-3 rounded-xl bg-[#00FFC2] text-[#0A0D17] font-bold hover:scale-105 transition-all">
                            <AutoTranslatedText text={isEdit ? 'Update Product' : 'Create Product'} />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const FloorManager = () => {
    const { floors, loading, refreshFloors } = useFloors();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState<any>(null);

    const { translateAsync } = useAutoTranslate(null);

    const handleDelete = async (id: string) => {
        const confirmMsg = await translateAsync('Are you sure you want to delete this floor content?');
        if (confirm(confirmMsg)) {
            try {
                await deleteFloorCategory(id);
                refreshFloors();
            } catch (err) {
                const errMsg = await translateAsync('Delete failed');
                alert(errMsg);
            }
        }
    };


    return (
        <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-white"><AutoTranslatedText text="Floor Content Management" /></h2>
                <button 
                    onClick={() => { setEditingFloor(null); setIsModalOpen(true); }}
                    className="bg-[#00FFC2] text-[#0A0D17] px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition-all"
                >
                    <Plus size={18} /> <AutoTranslatedText text="Add Floor Content" />
                </button>
            </div>

            <div className="bg-[#1A2420]/40 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4"><AutoTranslatedText text="Floor" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Title" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Description" /></th>
                            <th className="px-6 py-4 text-right"><AutoTranslatedText text="Actions" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {floors.map(floor => (
                            <tr key={floor.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-[#00FFC2] font-bold">{floor.floor}</td>
                                <td className="px-6 py-4 text-white font-medium">{displayLocalized(floor.title)}</td>
                                <td className="px-6 py-4 text-white/40 text-sm truncate max-w-xs">{displayLocalized(floor.description)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => { setEditingFloor(floor); setIsModalOpen(true); }}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#00FFC2] transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(floor.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="py-20 text-center text-white/20"><AutoTranslatedText text="Loading floors..." /></div>}
                {!loading && floors.length === 0 && <div className="py-20 text-center text-white/20"><AutoTranslatedText text="No floor content found" /></div>}
            </div>

            {isModalOpen && (
                <FloorFormModal 
                    floor={editingFloor} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => { setIsModalOpen(false); refreshFloors(); }} 
                />
            )}
        </div>
    );
};

const FloorFormModal = ({ floor, onClose, onSuccess }: any) => {
    const [formData, setFormData] = useState<any>({
        id: '',
        floor: '',
        title: { ko: '', en: '' },
        description: { ko: '', en: '' },
        subitems: [],
        color: '',
        bgImage: '',
        video_url: ''
    });

    useEffect(() => {
        if (floor) {
            setFormData({
                id: floor.id || '',
                floor: floor.floor || '',
                title: floor.title || { ko: '', en: '' },
                description: floor.description || { ko: '', en: '' },
                subitems: floor.subitems || [],
                color: floor.color || '',
                bgImage: floor.bgImage || '',
                video_url: floor.videoUrl || ''
            });
        }
    }, [floor]);

    const isEdit = !!floor;

    const addSubitem = () => {
        const uniqueId = `cat-${Date.now()}`;
        const newSubitems = [...(formData.subitems || []), { id: uniqueId, label: { ko: '' }, bgImage: '' }];
        setFormData({ ...formData, subitems: newSubitems });
    };

    const updateSubitem = (index: number, field: string, value: any) => {
        const newSubitems = [...(formData.subitems || [])];
        if (field === 'label') {
            const oldLabel = typeof newSubitems[index].label === 'object' ? newSubitems[index].label : { ko: newSubitems[index].label || '' };
            newSubitems[index] = { ...newSubitems[index], label: { ...oldLabel, ko: value } };
        } else {
            newSubitems[index] = { ...newSubitems[index], [field]: value };
        }
        setFormData({ ...formData, subitems: newSubitems });
    };

    const removeSubitem = (index: number) => {
        const newSubitems = formData.subitems.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, subitems: newSubitems });
    };

    const [uploading, setUploading] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, subIdx?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadId = subIdx !== undefined ? `${field}-${subIdx}` : field;
        setUploading(uploadId);
        
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: uploadData
            });
            
            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            if (data.url) {
                if (subIdx !== undefined) {
                    updateSubitem(subIdx, field, data.url);
                } else {
                    setFormData({ ...formData, [field]: data.url });
                }
            }
        } catch (err: any) {
            console.error('Upload failure:', err);
            alert(`Upload failed: ${err.message || 'Unknown error'}`);
        } finally {
            setUploading(null);
        }
    };

    const translateAsync = async (t: string) => t;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (isEdit) {
                try {
                    await updateFloorCategory(floor.id, formData);
                    const successMsg = await translateAsync('Successfully updated!');
                    alert(successMsg);
                } catch (updateErr: any) {
                    if (updateErr.message?.includes('404') || 
                        updateErr.message?.toLowerCase().includes('not found') ||
                        updateErr.message?.includes('No category found')) {
                        await createFloorCategory(formData);
                        const successMsg = await translateAsync('Successfully created new record for this floor!');
                        alert(successMsg);
                    } else {
                        throw updateErr;
                    }
                }
            } else {
                await createFloorCategory(formData);
                const successMsg = await translateAsync('Successfully created!');
                alert(successMsg);
            }
            onSuccess();
        } catch (err: any) {
            const errMsg = await translateAsync(`Operation failed: ${err.message || 'Unknown error'}`);
            alert(errMsg);
        }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="relative w-full max-w-4xl bg-[#1A2420] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold text-white">
                        {isEdit ? 'Edit Floor Content' : 'Add Floor Content'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 border-none bg-transparent cursor-pointer"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex flex-col gap-8 flex-1 overflow-y-auto pr-2 custom-scrollbar p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Floor Level (e.g. 6F)</label>
                                <input type="text" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">ID (Unique)</label>
                                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" disabled={isEdit} required />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase mb-2 block">제목</label>
                            <input type="text" value={formData.title.ko || ''} onChange={e => setFormData({...formData, title: {...formData.title, ko: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Theme Color (HEX)</label>
                                <div className="flex gap-2">
                                    <input type="text" value={formData.color || ''} onChange={e => setFormData({...formData, color: e.target.value})} className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-[#00FFC2]/50" placeholder="#00FFC2" />
                                    <div className="w-14 h-14 rounded-xl border border-white/10" style={{ backgroundColor: formData.color || '#000' }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="사이트 URL" /></label>
                                <input type="text" value={formData.video_url || ''} onChange={e => setFormData({...formData, video_url: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" placeholder="https://..." />
                            </div>
                        </div>

                        {/* Floor Background Image */}
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Floor Background Image</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1 relative group bg-black/40 border border-white/10 rounded-xl overflow-hidden aspect-[21/9] flex items-center justify-center">
                                    {formData.bgImage ? (
                                        <>
                                            <img src={formData.bgImage} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md">
                                                    <Upload size={20} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bgImage')} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-2 text-white/20 hover:text-[#00FFC2] transition-colors">
                                            {uploading === 'bgImage' ? <div className="w-6 h-6 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin" /> : <Upload size={24} />}
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload Image</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bgImage')} />
                                        </label>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input 
                                        type="text" 
                                        value={formData.bgImage || ''} 
                                        onChange={e => setFormData({...formData, bgImage: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-xs focus:border-[#00FFC2]/50"
                                        placeholder="https://..."
                                    />
                                    <p className="text-[10px] text-white/20 px-1 italic">* 층 전체의 배경으로 사용되는 이미지입니다. 가로가 긴 이미지 권장.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="설명" /></label>
                            <textarea rows={3} value={formData.description.ko || ''} onChange={e => setFormData({...formData, description: {...formData.description, ko: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50 resize-none" required />
                        </div>
                        
                        {/* Sub-items Management */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pr-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block"><AutoTranslatedText text="Sub-items (Categories)" /></label>
                                <button type="button" onClick={addSubitem} className="flex items-center gap-1 text-[10px] font-bold text-[#00FFC2] bg-[#00FFC2]/10 px-3 py-1.5 rounded-lg hover:bg-[#00FFC2]/20 transition-all border-none cursor-pointer">
                                    <Plus size={14} /> <AutoTranslatedText text="Add Category" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {(formData.subitems || []).map((sub: any, idx: number) => (
                                    <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4 relative group/sub">
                                        <button 
                                            type="button" 
                                            onClick={() => removeSubitem(idx)}
                                            className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 opacity-0 group-hover/sub:opacity-100 transition-all border-none bg-transparent cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-white/20 uppercase mb-2 block">ID</label>
                                                <input 
                                                    type="text" 
                                                    value={sub.id} 
                                                    onChange={e => updateSubitem(idx, 'id', e.target.value)}
                                                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white text-sm focus:border-[#00FFC2]/30"
                                                    placeholder="heritage"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-white/20 uppercase mb-2 block">Label (KO)</label>
                                                <input 
                                                    type="text" 
                                                    value={typeof sub.label === 'string' ? sub.label : (sub.label?.ko || '')} 
                                                    onChange={e => updateSubitem(idx, 'label', e.target.value)}
                                                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white text-sm focus:border-[#00FFC2]/30"
                                                    placeholder="헤리티지"
                                                />
                                            </div>
                                        </div>

                                        {/* Sub-item Background Image */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-white/20 uppercase block tracking-wider">Sub-category Background Image</label>
                                            <div className="flex gap-4 items-start">
                                                <div className="w-32 h-20 bg-black/20 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center relative group">
                                                    {sub.bgImage ? (
                                                        <>
                                                            <img src={sub.bgImage} alt="" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
                                                                    <Upload size={14} />
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bgImage', idx)} />
                                                                </label>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <label className="cursor-pointer flex flex-col items-center gap-1 text-white/10 hover:text-[#00FFC2] transition-colors">
                                                            {uploading === `bgImage-${idx}` ? <div className="w-4 h-4 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
                                                            <span className="text-[8px] font-bold uppercase">Upload</span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bgImage', idx)} />
                                                        </label>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input 
                                                        type="text" 
                                                        value={sub.bgImage || ''} 
                                                        onChange={e => updateSubitem(idx, 'bgImage', e.target.value)}
                                                        className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white text-[10px] focus:border-[#00FFC2]/30"
                                                        placeholder="Image URL (https://...)"
                                                    />
                                                    <p className="text-[9px] text-white/10 italic px-1">* 해당 카테고리 진입 시 헤더 배경으로 사용됩니다.</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                ))}
                                
                                {(formData.subitems || []).length === 0 && (
                                    <div className="text-center py-10 bg-black/20 border border-dashed border-white/10 rounded-2xl">
                                        <p className="text-white/20 text-xs font-bold uppercase tracking-widest"><AutoTranslatedText text="No sub-items added" /></p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-black/20">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer font-bold"><AutoTranslatedText text="Cancel" /></button>
                        <button type="submit" className="bg-[#00FFC2] text-[#0A0D17] px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all border-none cursor-pointer">
                            <AutoTranslatedText text={isEdit ? 'Update Content' : 'Create Content'} />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const NOTICE_FALLBACK: Notice[] = [
    { id: '1', title: { ko: '문화상점 그랜드 오픈 및 멤버십 혜택 안내', en: 'Grand Opening & Membership Benefits' }, category: '공지', date: '2024-03-01', content: { ko: '문화상점이 정식 오픈하였습니다. 멤버십 가입 시 다양한 혜택을 드립니다.' }, is_important: true },
    { id: '2', title: { ko: '봄 시즌 한정 예술품 입고 안내', en: 'Spring Season Limited Art Collection' }, category: '전시', date: '2024-03-10', content: { ko: '따스한 봄을 맞아 엄선된 예술가들의 작품이 새롭게 입고되었습니다.' }, is_important: false },
    { id: '3', title: { ko: '지하 주차장 보수 공사 일정 안내', en: 'Parking Lot Maintenance Schedule' }, category: '공지', date: '2024-03-15', content: { ko: '3월 25일부터 27일까지 주차장 일부 구역의 보수 공사가 진행됩니다.' }, is_important: false },
];

const NoticeManager = ({ agencies }: { agencies: any[] }) => {
    const { isAdmin } = useAdmin();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<any>(null);
    const { translatedText: searchNoticesPlaceholder } = useAutoTranslate("Search notices...");
    const { translatedText: allCategoriesNoticeLabel } = useAutoTranslate("모든 범주");

    useEffect(() => { fetchNotices(); }, []);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const data = await getNotices();
            setNotices(data && data.length > 0 ? data : NOTICE_FALLBACK);
        } catch {
            setNotices(NOTICE_FALLBACK);
        } finally {
            setLoading(false);
        }
    };

    const filteredNotices = notices.filter(n => {
        const matchesSearch = 
            displayLocalized(n.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
            displayLocalized(n.content).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || n.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(notices.map(n => n.category)));

    const { translateAsync } = useAutoTranslate(null);

    const handleDelete = async (id: any) => {
        const confirmMsg = await translateAsync('Delete this notice?');
        if (confirm(confirmMsg)) {
            try {
                await apiDeleteNotice(id);
                fetchNotices();
            } catch (err) { 
                const errMsg = await translateAsync('Delete failed');
                alert(errMsg); 
            }
        }
    };

    return (
        <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-white"><AutoTranslatedText text="Notice Management" /></h2>
                <button 
                    onClick={() => { setEditingNotice(null); setIsModalOpen(true); }}
                    className="bg-[#00FFC2] text-[#0A0D17] px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition-all"
                >
                    <Plus size={18} /> <AutoTranslatedText text="Add Notice" />
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input 
                        type="text" 
                        placeholder={searchNoticesPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FFC2]/50"
                    />
                </div>
                
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50 appearance-none min-w-[150px]"
                >
                    <option value="">{allCategoriesNoticeLabel}</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="bg-[#1A2420]/40 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4"><AutoTranslatedText text="Title" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Category" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Date" /></th>
                            {isAdmin && <th className="px-6 py-4"><AutoTranslatedText text="Agency" /></th>}
                            <th className="px-6 py-4 text-right"><AutoTranslatedText text="Actions" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredNotices.map(notice => (
                            <tr key={notice.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                                    {notice.is_important && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                    {displayLocalized(notice.title)}
                                </td>
                                <td className="px-6 py-4 text-white/40">{notice.category}</td>
                                <td className="px-6 py-4 text-white/40">{notice.date}</td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-[#00FFC2] font-bold text-xs">
                                        {agencies.find(a => Number(a.id) === Number(notice.agency_id))?.agency_name || <span className="text-white/20">Admin</span>}
                                    </td>
                                )}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setEditingNotice(notice); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#00FFC2]"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(notice.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="py-20 text-center text-white/20"><AutoTranslatedText text="Loading notices..." /></div>}
            </div>

            {isModalOpen && <NoticeFormModal notice={editingNotice} agencies={agencies} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchNotices(); }} />}
        </div>
    );
};

const NoticeFormModal = ({ notice, agencies, onClose, onSuccess }: any) => {
    const { isAdmin } = useAdmin();
    const { floors } = useFloors();
    const [formData, setFormData] = useState<any>(() => normalizeNoticeData(notice));

    const isEdit = !!notice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit) await apiUpdateNotice(notice.id, formData);
            else await apiCreateNotice(formData);
            onSuccess();
        } catch (err) { alert('Operation failed'); }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-2xl bg-[#1A2420] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-serif font-bold text-white mb-6 uppercase tracking-widest">
                    <AutoTranslatedText text={isEdit ? 'Edit Notice' : 'Add Notice'} />
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {isAdmin && (
                        <div>
                            <label className="text-xs font-bold text-[#00FFC2] uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="Agency Owner" /></label>
                            <select 
                                value={formData.agency_id || ''} 
                                onChange={e => setFormData({...formData, agency_id: e.target.value})}
                                className="w-full bg-black/40 border border-[#00FFC2]/30 rounded-xl p-4 text-[#00FFC2] focus:border-[#00FFC2]/50 font-bold"
                            >
                                <option value="">Admin (Default)</option>
                                {agencies.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.agency_name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Category" /></label>
                            <select 
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" 
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="GENERAL">GENERAL</option>
                                <option value="EVENT">EVENT</option>
                                {floors.map(f => (
                                    <option key={f.id} value={f.id}>{f.floor} - {typeof f.title === 'string' ? f.title : f.title.ko}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Date" /></label>
                            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="제목" /></label>
                        <input type="text" value={formData.title.ko} onChange={e => setFormData({...formData, title: {...formData.title, ko: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="내용" /></label>
                        <textarea rows={4} value={formData.content.ko} onChange={e => setFormData({...formData, content: {...formData.content, ko: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50 resize-none" required />
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={formData.is_important} onChange={e => setFormData({...formData, is_important: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-black/40 text-[#00FFC2] focus:ring-[#00FFC2]" />
                        <label className="text-sm text-white/60"><AutoTranslatedText text="Important Notice (Shows indicator)" /></label>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-white/40 hover:text-white transition-colors"><AutoTranslatedText text="Cancel" /></button>
                        <button type="submit" className="bg-[#00FFC2] text-[#0A0D17] px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all"><AutoTranslatedText text="Submit" /></button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const FAQ_FALLBACK = [
    { id: '1', question: { ko: '문화상점의 운영 시간은 어떻게 되나요?' }, answer: { ko: '저희 문화상점은 연중무휴로 오전 10시 30분부터 오후 8시까지 운영됩니다.' }, category: 'GENERAL', display_order: 1 },
    { id: '2', question: { ko: '주차는 가능한가요?' }, answer: { ko: '네, 상점 건물 지하 1층부터 3층까지 넓은 주차 공간이 마련되어 있습니다.' }, category: 'GENERAL', display_order: 2 },
    { id: '3', question: { ko: '멤버십 혜택은 무엇인가요?' }, answer: { ko: '문화상점 멤버십 회원이 되시면 모든 상품 구매 시 3% 포인트 적립, 생일 당일 10% 할인 쿠폰 발급 등의 혜택을 누리실 수 있습니다.' }, category: 'GENERAL', display_order: 3 },
    { id: '4', question: { ko: '상품권 사용이 가능한가요?' }, answer: { ko: '네, 문화상품권, 백화점 상품권 및 문화상점 전용 디지털 기프트카드를 모두 사용하실 수 있습니다.' }, category: 'GENERAL', display_order: 4 },
    { id: '5', question: { ko: '환불 및 교환 규정은 어떻게 되나요?' }, answer: { ko: '구매 후 7일 이내에 영수증과 미개봉 상태의 상품을 지참하시면 환불 및 교환이 가능합니다.' }, category: 'GENERAL', display_order: 5 },
];

const FAQManager = ({ agencies }: { agencies: any[] }) => {
    const { isAdmin } = useAdmin();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any>(null);
    const { translatedText: searchFaqsPlaceholder } = useAutoTranslate("Search FAQs...");
    const { translatedText: allCategoriesFaqLabel } = useAutoTranslate("모든 범주");

    useEffect(() => { fetchFaqs(); }, []);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const data = await getFaqs();
            setFaqs(data && data.length > 0 ? data : FAQ_FALLBACK as any);
        } catch {
            setFaqs(FAQ_FALLBACK as any);
        } finally {
            setLoading(false);
        }
    };

    const filteredFaqs = faqs.filter(f => {
        const matchesSearch = 
            displayLocalized(f.question).toLowerCase().includes(searchTerm.toLowerCase()) ||
            displayLocalized(f.answer).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || f.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(faqs.map(f => f.category || 'General')));

    const { translateAsync } = useAutoTranslate(null);

    const handleDelete = async (id: any) => {
        const confirmMsg = await translateAsync('Delete this FAQ?');
        if (confirm(confirmMsg)) {
            try {
                await apiDeleteFaq(id);
                fetchFaqs();
            } catch (err) { 
                const errMsg = await translateAsync('Delete failed');
                alert(errMsg); 
            }
        }
    };

    return (
        <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-white"><AutoTranslatedText text="FAQ Management" /></h2>
                <button 
                    onClick={() => { setEditingFaq(null); setIsModalOpen(true); }}
                    className="bg-[#00FFC2] text-[#0A0D17] px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition-all"
                >
                    <Plus size={18} /> <AutoTranslatedText text="Add FAQ" />
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input 
                        type="text" 
                        placeholder={searchFaqsPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FFC2]/50"
                    />
                </div>
                
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50 appearance-none min-w-[150px]"
                >
                    <option value="">{allCategoriesFaqLabel}</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="bg-[#1A2420]/40 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4"><AutoTranslatedText text="Question" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Category" /></th>
                            {isAdmin && <th className="px-6 py-4"><AutoTranslatedText text="Agency" /></th>}
                            <th className="px-6 py-4 text-right"><AutoTranslatedText text="Actions" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredFaqs.map(faq => (
                            <tr key={faq.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{displayLocalized(faq.question)}</td>
                                <td className="px-6 py-4 text-white/40">{faq.category || 'General'}</td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-[#00FFC2] font-bold text-xs">
                                        {agencies.find(a => Number(a.id) === Number(faq.agency_id))?.agency_name || <span className="text-white/20">Admin</span>}
                                    </td>
                                )}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setEditingFaq(faq); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#00FFC2]"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(faq.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="py-20 text-center text-white/20"><AutoTranslatedText text="Loading FAQs..." /></div>}
            </div>

            {isModalOpen && <FAQFormModal faq={editingFaq} agencies={agencies} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchFaqs(); }} />}
        </div>
    );
};

const FAQFormModal = ({ faq, agencies, onClose, onSuccess }: any) => {
    const { isAdmin } = useAdmin();
    const { floors } = useFloors();
    const [formData, setFormData] = useState<any>(() => normalizeFAQData(faq));

    const isEdit = !!faq;

    const { translateAsync } = useAutoTranslate(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit) await apiUpdateFaq(faq.id, formData);
            else await apiCreateFaq(formData);
            const successMsg = await translateAsync('Successfully saved');
            alert(successMsg);
            onSuccess();
        } catch (err) { 
            const errMsg = await translateAsync('Operation failed');
            alert(errMsg); 
        }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-2xl bg-[#1A2420] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-serif font-bold text-white mb-6 uppercase tracking-widest">
                    <AutoTranslatedText text={isEdit ? 'Edit FAQ' : 'Add FAQ'} />
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {isAdmin && (
                        <div>
                            <label className="text-xs font-bold text-[#00FFC2] uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="Agency Owner" /></label>
                            <select 
                                value={formData.agency_id || ''} 
                                onChange={e => setFormData({...formData, agency_id: e.target.value})}
                                className="w-full bg-black/40 border border-[#00FFC2]/30 rounded-xl p-4 text-[#00FFC2] focus:border-[#00FFC2]/50 font-bold"
                            >
                                <option value="">Admin (Default)</option>
                                {agencies.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.agency_name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Category" /></label>
                            <select 
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" 
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="GENERAL">GENERAL</option>
                                {floors.map(f => (
                                    <option key={f.id} value={f.id}>{f.floor} - {typeof f.title === 'string' ? f.title : f.title.ko}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Display Order" /></label>
                            <input type="number" value={formData.display_order} onChange={e => setFormData({...formData, display_order: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="질문" /></label>
                        <input type="text" value={formData.question.ko} onChange={e => setFormData({...formData, question: {...formData.question, ko: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="답변" /></label>
                        <textarea rows={4} value={formData.answer.ko} onChange={e => setFormData({...formData, answer: {...formData.answer, ko: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50 resize-none" required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-white/40 hover:text-white transition-colors"><AutoTranslatedText text="Cancel" /></button>
                        <button type="submit" className="bg-[#00FFC2] text-[#0A0D17] px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all"><AutoTranslatedText text="Submit" /></button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const OrderManager = ({ agencies }: { agencies: any[] }) => {
    const { isAdmin } = useAdmin();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this order?')) {
            try {
                await deleteOrder(id);
                fetchOrders();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = 
            o.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user_phone.includes(searchTerm) ||
            o.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.payment_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !selectedStatus || o.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const statusColors: any = {
        'PENDING': 'bg-yellow-500/20 text-yellow-500',
        'PAID': 'bg-green-500/20 text-green-500',
        'SHIPPED': 'bg-blue-500/20 text-blue-500',
        'DELIVERED': 'bg-purple-500/20 text-purple-500',
        'CANCELLED': 'bg-red-500/20 text-red-500'
    };

    return (
        <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-white"><AutoTranslatedText text="Order Management" /></h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FFC2]/50"
                        />
                    </div>
                    <select 
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#1A2420]/40 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-white/40 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Order Info</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                {isAdmin && <th className="px-6 py-4">Agency</th>}
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white text-xs font-mono">{order.payment_id}</span>
                                            <span className="text-white/30 text-[10px]">{new Date(order.created_at).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{order.user_name}</span>
                                            <span className="text-white/40 text-[10px]">{order.user_phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/60 text-sm whitespace-nowrap">{order.product_name}</td>
                                    <td className="px-6 py-4 text-white font-bold whitespace-nowrap">{order.price?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-[#00FFC2] font-bold text-xs whitespace-nowrap">
                                            {agencies.find(a => Number(a.id) === Number(order.agency_id))?.agency_name || 'Admin'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingOrder(order); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#00FFC2]"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(order.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="py-20 text-center text-white/20">Loading orders...</div>}
                {!loading && filteredOrders.length === 0 && <div className="py-20 text-center text-white/20">No orders found.</div>}
            </div>

            {isModalOpen && (
                <OrderEditModal 
                    order={editingOrder} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => { setIsModalOpen(false); fetchOrders(); }} 
                />
            )}
        </div>
    );
};

const OrderEditModal = ({ order, onClose, onSuccess }: any) => {
    const [status, setStatus] = useState(order.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, status);
            onSuccess();
        } catch (err) {
            alert('Update failed');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-[#1A2420] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-serif font-bold text-white mb-6 uppercase tracking-widest">Update Order Status</h3>
                
                <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-[10px] text-white/40 font-bold uppercase">Customer</span>
                            <span className="text-sm text-white font-bold">{order.user_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] text-white/40 font-bold uppercase">Product</span>
                            <span className="text-sm text-white/60">{order.product_name}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-2">
                            <span className="text-[10px] text-white/40 font-bold uppercase">Address</span>
                            <span className="text-xs text-white/40 max-w-[200px] text-right">{order.user_address}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase block">Status</label>
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button onClick={onClose} className="px-6 py-2 text-white/40 hover:text-white transition-colors">Cancel</button>
                        <button 
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="bg-[#00FFC2] text-[#0A0D17] px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {isUpdating ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const AgencyManager = () => {
    const [agencies, setAgencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgency, setEditingAgency] = useState<any>(null);

    useEffect(() => { fetchAgencies(); }, []);

    const fetchAgencies = async () => {
        setLoading(true);
        try {
            const data = await getAgencies();
            setAgencies(data);
        } catch {
            setAgencies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await updateAgencyStatus(id, status);
            fetchAgencies();
        } catch (err) { alert('Status update failed'); }
    };

    const handleDelete = async (id: number) => {
        if (confirm('모든 제품과 함께 에이전시 정보를 삭제하시겠습니까?')) {
            try {
                await deleteAgency(id);
                fetchAgencies();
            } catch (err) { alert('Delete failed'); }
        }
    };

    return (
        <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-white"><AutoTranslatedText text="Agency Management" /></h2>
                <button 
                    onClick={() => { setEditingAgency(null); setIsModalOpen(true); }}
                    className="bg-[#00FFC2] text-[#0A0D17] px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition-all"
                >
                    <Plus size={18} /> <AutoTranslatedText text="Add Agency" />
                </button>
            </div>

            <div className="bg-[#1A2420]/40 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4"><AutoTranslatedText text="Agency" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="ID / PW" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Contact" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Status" /></th>
                            <th className="px-6 py-4 text-right"><AutoTranslatedText text="Actions" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {agencies.map(agency => (
                            <tr key={agency.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold">{agency.agency_name}</span>
                                        <span className="text-white/30 text-[10px]">{new Date(agency.created_at).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white/60 text-xs font-mono">{agency.username}</span>
                                        <span className="text-white/90 text-sm font-mono select-all hover:text-[#00FFC2] transition-colors bg-white/5 px-2 py-0.5 rounded-md w-fit">{agency.password}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col text-[10px] text-white/60 space-y-0.5">
                                        <span className="flex items-center gap-1"><span className="text-white/20 italic">M:</span> {agency.phone_mobile || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                        agency.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                        agency.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {agency.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        <div className="flex gap-1 mr-2 border-r border-white/10 pr-2">
                                            {agency.status === 'PENDING' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(agency.id, 'APPROVED')} 
                                                        className="p-1.5 hover:bg-green-500/20 rounded-lg text-green-500/60 hover:text-green-400"
                                                        title="승인"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(agency.id, 'REJECTED')} 
                                                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-500/60 hover:text-red-400"
                                                        title="거절"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {(agency.status === 'APPROVED' || agency.status === 'REJECTED') && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(agency.id, 'PENDING')} 
                                                    className="p-1.5 hover:bg-yellow-500/20 rounded-lg text-yellow-500/60 hover:text-yellow-400"
                                                    title="대기로 변경"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <button onClick={() => { setEditingAgency(agency); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-[#00FFC2]"><Search size={16} /></button>
                                        <button onClick={() => handleDelete(agency.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="py-20 text-center text-white/20"><AutoTranslatedText text="Loading agencies..." /></div>}
            </div>

            {isModalOpen && (
                <AgencyFormModal 
                    agency={editingAgency} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => { setIsModalOpen(false); fetchAgencies(); }} 
                />
            )}
        </div>
    );
};

const AgencyFormModal = ({ agency, onClose, onSuccess }: any) => {
    const [formData, setFormData] = useState({
        username: agency?.username || '',
        password: '',
        agencyName: agency?.agency_name || '',
        birthDate: agency?.birth_date || '',
        phoneMobile: agency?.phone_mobile || ''
    });

    // Manual address entry enabled; no additional scripts needed.

    const isEdit = !!agency;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit) await updateAgency(agency.id, formData);
            else await createAgency(formData);
            onSuccess();
        } catch (err: any) { alert(err.message || 'Operation failed'); }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="relative w-full max-w-2xl bg-[#1A2420] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-white uppercase tracking-widest">
                        <AutoTranslatedText text={isEdit ? 'Agency Details / Edit' : 'Add Agency'} />
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Agency Name" /></label>
                                <input type="text" value={formData.agencyName} onChange={e => setFormData({...formData, agencyName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Username" /></label>
                                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text={isEdit ? "New Password (Optional)" : "Password"} /></label>
                                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required={!isEdit} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Birth Date" /></label>
                                <input type="text" placeholder="YYYY.MM.DD" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Phone (Mobile)" /></label>
                                <input type="text" value={formData.phoneMobile} onChange={e => setFormData({...formData, phoneMobile: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-white/40 hover:text-white transition-colors"><AutoTranslatedText text="Cancel" /></button>
                        <button type="submit" className="bg-[#00FFC2] text-[#0A0D17] px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all">
                            <AutoTranslatedText text={isEdit ? 'Save Changes' : 'Submit'} />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};


export const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isGlobalMenuOpen, setIsGlobalMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { floors } = useFloors();
    const { isAdmin, isAuthenticated, logout } = useAdmin();

    useEffect(() => {
        if (!isAuthenticated) navigate('/admin/login');
    }, [isAuthenticated, navigate]);

    const [agencies, setAgencies] = useState<any[]>([]);

    useEffect(() => {
        if (isAdmin) {
            fetchAgenciesList();
        }
    }, [isAdmin]);

    const fetchAgenciesList = async () => {
        try {
            const data = await getAgencies();
            setAgencies(data || []);
        } catch (err) {
            console.error('Failed to fetch agencies:', err);
        }
    };

    const tabs = [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        ...(isAdmin ? [
            { id: 'agencies', label: 'Agencies', icon: Layers },
            { id: 'floors', label: 'Floors', icon: Layers },
            { id: 'notices', label: 'Notices', icon: Megaphone },
            { id: 'faqs', label: 'FAQs', icon: HelpCircle }
        ] : []),
    ];

    return (
        <div className="min-h-screen bg-[#0A0D17] lg:flex relative overflow-x-hidden">
            {/* Mobile Sidebar Overlay (Left) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Global Category Menu Overlay (Right) */}
            <AnimatePresence>
                {isGlobalMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsGlobalMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120]"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-80 bg-[#1A2420] border-l border-white/10 z-[130] flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-lg font-serif font-bold text-white">Category Menu</h2>
                                <button 
                                    onClick={() => setIsGlobalMenuOpen(false)}
                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {floors.map(floor => (
                                    <div key={floor.id} className="space-y-3">
                                        <div className="flex items-center gap-2 text-[#00FFC2] font-bold text-sm tracking-widest uppercase opacity-80">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00FFC2]" />
                                            {floor.floor} | {displayLocalized(floor.title)}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 pl-4">
                                            {(floor.subitems || []).map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => navigate(`/category/${sub.id}`)}
                                                    className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-white/60 text-sm hover:text-white hover:bg-[#00FFC2]/10 transition-all border border-transparent hover:border-[#00FFC2]/20"
                                                >
                                                    {displayLocalized(sub.label)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/5">
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 text-white/80 font-bold hover:bg-white/10 transition-all"
                                >
                                    Go to Front Page
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-72 border-r border-white/5 bg-[#1A2420] flex flex-col z-[110] 
                transition-transform duration-300 transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 overflow-y-auto
            `}>
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#00FFC2]/10 rounded-xl flex items-center justify-center border border-[#00FFC2]/30">
                            <LayoutDashboard className="text-[#00FFC2]" />
                        </div>
                        <h1 className="text-xl font-serif font-bold text-white tracking-tight">
                            Admin Console
                        </h1>
                    </div>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">
                        HXVA ARCADE Management v1.0
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                                activeTab === tab.id 
                                ? 'bg-[#00FFC2] text-[#0A0D17] font-bold shadow-[0_0_20px_rgba(0,255,194,0.2)]' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={20} />
                            <span>{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight className="ml-auto" size={16} />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 mt-auto">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black/40">
                <header className="px-6 md:px-10 py-6 md:py-8 border-b border-white/5 flex justify-between items-center bg-[#1A2420]/20 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 lg:hidden text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-1">
                                Overview
                            </h2>
                            <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
                                {tabs.find(t => t.id === activeTab)?.label || ''}
                            </h3>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsGlobalMenuOpen(true)}
                        className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2 font-bold text-xs"
                    >
                        <span className="hidden sm:inline opacity-60">CATEGORIES</span>
                        <Menu size={24} />
                    </button>
                </header>

                <div className="p-10">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'products' && <ProductManager agencies={agencies} />}
                        {activeTab === 'orders' && <OrderManager agencies={agencies} />}
                        {activeTab === 'agencies' && <AgencyManager />}
                        {activeTab === 'floors' && <FloorManager />}

                        {activeTab === 'notices' && <NoticeManager agencies={agencies} />}
                        {activeTab === 'faqs' && <FAQManager agencies={agencies} />}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
