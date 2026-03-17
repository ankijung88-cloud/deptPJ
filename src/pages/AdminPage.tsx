import React, { useState, useEffect } from 'react';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Upload
} from 'lucide-react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useFloors } from '../context/FloorContext';
import { getFeaturedProducts, deleteProduct, createProduct, updateProduct } from '../api/products';
import { 
    createFloorCategory, 
    updateFloorCategory, 
    deleteFloorCategory
} from '../api/categories';
import { getNotices, createNotice as apiCreateNotice, updateNotice as apiUpdateNotice, deleteNotice as apiDeleteNotice } from '../api/notices';
import { getFaqs, createFaq as apiCreateFaq, updateFaq as apiUpdateFaq, deleteFaq as apiDeleteFaq } from '../api/faqs';
import { FeaturedItem, Notice, FAQ } from '../types';

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

const normalizeProductData = (product: any) => {
    const defaultData = {
        id: generateUniqueId(),
        title: { ko: '', en: '' },
        category: '',
        subcategory: '',
        description: { ko: '', en: '' },
        image_url: '',
        thumbnail_url: '',
        event_date: { ko: '', en: '' },
        location: { ko: '', en: '' },
        price: '',
        video_url: '',
        long_description: { ko: '', en: '' },
        closed_days: []
    };
    if (!product) return defaultData;

    // FeaturedItem 타입(camelCase)과 DB 원본(snake_case) 모두 지원
    const image_url = product.image_url || product.imageUrl || '';
    const thumbnail_url = product.thumbnail_url || product.thumbnailUrl || '';
    const video_url = product.video_url || product.videoUrl || '';
    // event_date: FeaturedItem에서는 'date' 필드에 매핑됨
    const raw_event_date = product.event_date || product.date || '';
    // closed_days: FeaturedItem에서는 'closedDays' 필드에 매핑됨
    const raw_closed_days = product.closed_days || product.closedDays || [];

    return {
        ...defaultData,
        ...product,
        image_url,
        thumbnail_url,
        video_url,
        title: normalizeLocalizedString(product.title),
        description: normalizeLocalizedString(product.description),
        long_description: normalizeLocalizedString(product.long_description),
        event_date: normalizeLocalizedString(raw_event_date),
        location: normalizeLocalizedString(product.location),
        closed_days: Array.isArray(raw_closed_days) ? raw_closed_days : []
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
        content: normalizeLocalizedString(notice.content)
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
        answer: normalizeLocalizedString(faq.answer)
    };
};

// Components for different sections
const ProductManager = () => {
    const { floors } = useFloors();
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const { translatedText: searchPlaceholder } = useAutoTranslate("Search products...");
    const { translatedText: allFloorsLabel } = useAutoTranslate("모든 층");
    const { translatedText: allCategoriesLabel } = useAutoTranslate("모든 카테고리");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        fetchProducts();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFloor, selectedSubcategory]);

    const fetchProducts = async () => {
        setLoading(true);
        const data = await getFeaturedProducts();
        setProducts(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = 
            displayLocalized(p.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFloor = !selectedFloor || p.category === selectedFloor;
        const matchesSub = !selectedSubcategory || p.subcategory === selectedSubcategory;
        
        return matchesSearch && matchesFloor && matchesSub;
    });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-white"><AutoTranslatedText text="Product Management" /></h2>
                <button 
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    className="bg-[#00FFC2] text-[#0A0D17] px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition-all"
                >
                    <Plus size={18} /> <AutoTranslatedText text="Add Product" />
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
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
                
                <div className="flex gap-4">
                    <select 
                        value={selectedFloor}
                        onChange={(e) => {
                            setSelectedFloor(e.target.value);
                            setSelectedSubcategory('');
                        }}
                        className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50 appearance-none min-w-[150px]"
                    >
                        <option value="">{allFloorsLabel}</option>
                        {floors.map(f => (
                            <option key={f.id} value={f.id}>{f.floor} - {displayLocalized(f.title)}</option>
                        ))}
                    </select>

                    <select 
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-white focus:outline-none focus:border-[#00FFC2]/50 appearance-none min-w-[150px]"
                        disabled={!selectedFloor}
                    >
                        <option value="">{allCategoriesLabel}</option>
                        {selectedFloor && floors.find(f => f.id === selectedFloor)?.subitems?.map(s => (
                            <option key={s.id} value={s.id}>{displayLocalized(s.label)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-[#1A2420]/40 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/40 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4"><AutoTranslatedText text="Image" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Title" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Floor" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Category" /></th>
                            <th className="px-6 py-4 text-right"><AutoTranslatedText text="Actions" /></th>
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
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: floors.find(f => f.id === product.category)?.color || '#333' }}></div>
                                        <span className="text-white font-bold">
                                            {(() => {
                                                const floor = floors.find(f => f.id === product.category);
                                                return floor ? `${floor.floor}` : displayLocalized(product.category);
                                            })()}
                                        </span>
                                        <span className="text-white/40 text-xs">
                                            {(() => {
                                                const floor = floors.find(f => f.id === product.category);
                                                return floor ? displayLocalized(floor.title) : '';
                                            })()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-white/60">
                                    {(() => {
                                        const floor = floors.find(f => f.id === product.category);
                                        const sub = floor?.subitems?.find(s => s.id === product.subcategory);
                                        return sub ? displayLocalized(sub.label) : displayLocalized(product.subcategory);
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
                    <div className="py-20 text-center text-white/20"><AutoTranslatedText text="Loading products..." /></div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl px-6 py-4">
                    <div className="text-white/40 text-sm">
                        <AutoTranslatedText text="Showing" /> <span className="text-white font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> <AutoTranslatedText text="to" /> <span className="text-white font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> <AutoTranslatedText text="of" /> <span className="text-white font-medium">{filteredProducts.length}</span> <AutoTranslatedText text="results" />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-xl bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors border border-white/5"
                        >
                            <AutoTranslatedText text="Previous" />
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
                            <AutoTranslatedText text="Next" />
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
    const { floors } = useFloors();
    const [formData, setFormData] = useState<any>(() => normalizeProductData(product));
    const [uploading, setUploading] = useState<string | null>(null);

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
                body: uploadData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload Error:', errorText);
                throw new Error(`Server responded with ${response.status}`);
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
        console.log('[handleSubmit] formData:', JSON.stringify(formData, null, 2));
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
                        <AutoTranslatedText text={isEdit ? 'Edit Product' : 'Add New Product'} />
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. ID & 2. Title */}
                        <div className="space-y-4">
                            {!isEdit && (
                                <div>
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="1. Unique ID" /></label>
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
                                    {floors.find(f => f.id === formData.category)?.subitems?.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                            {typeof sub.label === 'string' ? sub.label : sub.label.ko}
                                        </option>
                                    ))}
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

                        {/* 7. Thumbnail Image */}
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="7. Thumbnail Image" /></label>
                            <div className="space-y-4">
                                <div className="relative group w-32 aspect-square bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {formData.thumbnail_url ? (
                                        <>
                                            <img src={formData.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer p-2 bg-[#00FFC2] text-[#0A0D17] rounded-lg transition-all">
                                                    <Upload size={16} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail_url')} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-2 text-white/20 hover:text-[#00FFC2] transition-colors">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                                {uploading === 'thumbnail_url' ? <div className="w-6 h-6 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin" /> : <Upload size={24} />}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase"><AutoTranslatedText text="Upload" /></span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail_url')} />
                                        </label>
                                    )}
                                </div>
                                <input 
                                    type="text" placeholder="Thumbnail URL"
                                    value={formData.thumbnail_url} onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
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
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="12. Video URL" /></label>
                            <input 
                                type="text" 
                                value={formData.video_url || ''} onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50"
                                placeholder="https://youtube.com/..."
                            />
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

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this floor content?')) {
            try {
                await deleteFloorCategory(id);
                refreshFloors();
            } catch (err) {
                alert('Delete failed');
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
                            <th className="px-6 py-4"><AutoTranslatedText text="Thumbnail" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Floor" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Title" /></th>
                            <th className="px-6 py-4"><AutoTranslatedText text="Description" /></th>
                            <th className="px-6 py-4 text-right"><AutoTranslatedText text="Actions" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {floors.map(floor => (
                            <tr key={floor.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                                        {floor.bgImage ? (
                                            <img src={floor.bgImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border border-white/20" />
                                        )}
                                    </div>
                                </td>
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
        bg_image: '',
        subitems: [],
        color: '',
        video_url: ''
    });

    useEffect(() => {
        if (floor) {
            setFormData({
                id: floor.id || '',
                floor: floor.floor || '',
                title: floor.title || { ko: '', en: '' },
                description: floor.description || { ko: '', en: '' },
                bg_image: floor.bgImage || '',
                subitems: floor.subitems || [],
                color: floor.color || '',
                video_url: floor.videoUrl || ''
            });
        }
    }, [floor]);

    const [uploading, setUploading] = useState<string | null>(null);

    const isEdit = !!floor;

    const handleSubitemFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(`subitem-${index}`);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            if (data.url) {
                console.log(`Subitem ${index} uploaded success:`, data.url);
                const newSubitems = [...(formData.subitems || [])];
                newSubitems[index] = { ...newSubitems[index], bgImage: data.url };
                setFormData({ ...formData, subitems: newSubitems });
            }
        } catch (err: any) {
            alert(`Upload failed: ${err.message}`);
        } finally {
            setUploading(null);
        }
    };

    const addSubitem = () => {
        const newSubitems = [...(formData.subitems || []), { id: '', label: { ko: '' }, bgImage: '' }];
        setFormData({ ...formData, subitems: newSubitems });
    };

    const updateSubitem = (index: number, field: string, value: any) => {
        const newSubitems = [...(formData.subitems || [])];
        if (field === 'label') {
            newSubitems[index] = { ...newSubitems[index], label: { ...newSubitems[index].label, ko: value } };
        } else {
            newSubitems[index] = { ...newSubitems[index], [field]: value };
        }
        setFormData({ ...formData, subitems: newSubitems });
    };

    const removeSubitem = (index: number) => {
        const newSubitems = formData.subitems.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, subitems: newSubitems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('--- Submitting Floor Data ---');
        console.log('Target ID:', floor?.id);
        console.log('Payload:', formData);
        
        try {
            if (isEdit) {
                try {
                    await updateFloorCategory(floor.id, formData);
                    console.log('Update successful');
                    alert('Successfully updated!');
                } catch (updateErr: any) {
                    console.warn('Update failed, checking if creation is needed:', updateErr.message);
                    // If 404, it means it was fallback data and doesn't exist in DB yet. Try creating.
                    if (updateErr.message?.includes('404') || 
                        updateErr.message?.toLowerCase().includes('not found') ||
                        updateErr.message?.includes('No category found')) {
                        console.log('Update target not found (404), attempting to create new record...');
                        await createFloorCategory(formData);
                        console.log('Creation successful');
                        alert('Successfully created new record for this floor!');
                    } else {
                        throw updateErr;
                    }
                }
            } else {
                await createFloorCategory(formData);
                console.log('Creation successful');
                alert('Successfully created!');
            }
            onSuccess();
        } catch (err: any) {
            console.error('Submit Error Details:', err);
            alert(`Operation failed: ${err.message || 'Unknown error'}`);
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
                        <AutoTranslatedText text={isEdit ? 'Edit Floor Content' : 'Add Floor Content'} />
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 border-none bg-transparent cursor-pointer"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex flex-col gap-8 flex-1 overflow-y-auto pr-2 custom-scrollbar p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Floor Level (e.g. 6F)" /></label>
                                <input type="text" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="ID (Unique)" /></label>
                                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" disabled={isEdit} required />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="제목" /></label>
                            <input type="text" value={formData.title.ko || ''} onChange={e => setFormData({...formData, title: {...formData.title, ko: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Theme Color (HEX)" /></label>
                                <div className="flex gap-2">
                                    <input type="text" value={formData.color || ''} onChange={e => setFormData({...formData, color: e.target.value})} className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-[#00FFC2]/50" placeholder="#00FFC2" />
                                    <div className="w-14 h-14 rounded-xl border border-white/10" style={{ backgroundColor: formData.color || '#000' }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block"><AutoTranslatedText text="Video URL (m4v/mp4)" /></label>
                                <input type="text" value={formData.video_url || ''} onChange={e => setFormData({...formData, video_url: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00FFC2]/50" placeholder="https://..." />
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
                                        
                                        <div>
                                            <label className="text-[10px] font-bold text-white/20 uppercase mb-2 block">Background Image</label>
                                            <div className="flex gap-4 items-center">
                                                <div className="w-24 h-16 bg-black/40 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center relative group/img">
                                                    {sub.bgImage ? (
                                                        <>
                                                            <img src={sub.bgImage} className="w-full h-full object-cover" />
                                                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                                <Upload size={14} className="text-white" />
                                                                <input type="file" className="hidden" accept="image/*" onChange={e => handleSubitemFileUpload(e, idx)} />
                                                            </label>
                                                        </>
                                                    ) : (
                                                        <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                                                            {uploading === `subitem-${idx}` ? (
                                                                <div className="w-5 h-5 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <Upload size={18} className="text-white/20" />
                                                            )}
                                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleSubitemFileUpload(e, idx)} />
                                                        </label>
                                                    )}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={sub.bgImage || ''} 
                                                    onChange={e => updateSubitem(idx, 'bgImage', e.target.value)}
                                                    className="flex-1 bg-black/20 border border-white/5 rounded-xl p-3 text-white text-xs focus:border-[#00FFC2]/30"
                                                    placeholder="Background Image URL"
                                                />
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

const NoticeManager = () => {
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

    const handleDelete = async (id: any) => {
        if (confirm('Delete this notice?')) {
            try {
                await apiDeleteNotice(id);
                fetchNotices();
            } catch (err) { alert('Delete failed'); }
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

            {isModalOpen && <NoticeFormModal notice={editingNotice} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchNotices(); }} />}
        </div>
    );
};

const NoticeFormModal = ({ notice, onClose, onSuccess }: any) => {
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

const FAQManager = () => {
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

    const handleDelete = async (id: any) => {
        if (confirm('Delete this FAQ?')) {
            try {
                await apiDeleteFaq(id);
                fetchFaqs();
            } catch (err) { alert('Delete failed'); }
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
                            <th className="px-6 py-4 text-right"><AutoTranslatedText text="Actions" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredFaqs.map(faq => (
                            <tr key={faq.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{displayLocalized(faq.question)}</td>
                                <td className="px-6 py-4 text-white/40">{faq.category || 'General'}</td>
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

            {isModalOpen && <FAQFormModal faq={editingFaq} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchFaqs(); }} />}
        </div>
    );
};

const FAQFormModal = ({ faq, onClose, onSuccess }: any) => {
    const { floors } = useFloors();
    const [formData, setFormData] = useState<any>(() => normalizeFAQData(faq));

    const isEdit = !!faq;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit) await apiUpdateFaq(faq.id, formData);
            else await apiCreateFaq(formData);
            onSuccess();
        } catch (err) { alert('Operation failed'); }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-2xl bg-[#1A2420] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-serif font-bold text-white mb-6 uppercase tracking-widest">
                    <AutoTranslatedText text={isEdit ? 'Edit FAQ' : 'Add FAQ'} />
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
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


export const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('products');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) navigate('/admin/login');
    }, [navigate]);


    const tabs = [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'floors', label: 'Floors', icon: Layers },
        { id: 'notices', label: 'Notices', icon: Megaphone },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    ];

    return (
        <div className="min-h-screen bg-[#0A0D17] flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-[#1A2420]/40 flex flex-col">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#00FFC2]/10 rounded-xl flex items-center justify-center border border-[#00FFC2]/30">
                            <LayoutDashboard className="text-[#00FFC2]" />
                        </div>
                        <h1 className="text-xl font-serif font-bold text-white tracking-tight">
                            <AutoTranslatedText text="Admin Console" />
                        </h1>
                    </div>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">
                        <AutoTranslatedText text="Dept. Management v1.0" />
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                                activeTab === tab.id 
                                ? 'bg-[#00FFC2] text-[#0A0D17] font-bold shadow-[0_0_20px_rgba(0,255,194,0.2)]' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={20} />
                            <span><AutoTranslatedText text={tab.label} /></span>
                            {activeTab === tab.id && <ChevronRight className="ml-auto" size={16} />}
                        </button>
                    ))}
                </nav>



            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black/40">
                <header className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-[#1A2420]/20 backdrop-blur-md sticky top-0 z-50">
                    <div>
                        <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.3em] mb-1">
                            <AutoTranslatedText text="Overview" />
                        </h2>
                        <h3 className="text-2xl font-serif font-bold text-white">
                            <AutoTranslatedText text={tabs.find(t => t.id === activeTab)?.label || ''} />
                        </h3>
                    </div>
                </header>

                <div className="p-10">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'products' && <ProductManager />}
                        {activeTab === 'floors' && <FloorManager />}

                        {activeTab === 'notices' && <NoticeManager />}
                        {activeTab === 'faqs' && <FAQManager />}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
