import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { useFloors } from '../../context/FloorContext';
import { createProduct, updateProduct, getProductById } from '../../api/products';
import { getAgencies } from '../../api/auth';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { TEMPLATE_CATEGORIES } from '../../utils/constants';
import { FeaturedItem } from '../../types';
import { normalizeLocalizedString } from '../../utils/i18nUtils';

interface ProductFormModalProps {
    product?: FeaturedItem | null;
    initialData?: Partial<FeaturedItem>;
    onClose: () => void;
    onSuccess: (updatedItem?: FeaturedItem) => void;
}

// normalizeLocalizedString moved to i18nUtils.ts


const normalizeProductData = (product: any, initialData?: any) => {
    return {
        id: product?.id || '',
        title: normalizeLocalizedString(product?.title || initialData?.title),
        description: normalizeLocalizedString(product?.description || initialData?.description),
        category: product?.category || initialData?.category || '',
        subcategory: product?.subcategory || initialData?.subcategory || '',
        image_url: product?.image_url || initialData?.image_url || '',
        image_url_2: product?.image_url_2 || initialData?.image_url_2 || '',
        price: product?.price || initialData?.price || 0,
        page_type: product?.page_type || initialData?.page_type || 'standard',
        parent_id: product?.parent_id || initialData?.parent_id || '',
        long_description: normalizeLocalizedString(product?.long_description || initialData?.long_description),
        detail_media_type: product?.detail_media_type || initialData?.detail_media_type || 'image',
        detail_media_url: product?.detail_media_url || initialData?.detail_media_url || '',
        metadata: product?.metadata || initialData?.metadata || {}
    };
};

export const ProductFormModal = ({ product, initialData, onClose, onSuccess }: ProductFormModalProps) => {
    const { isAdmin, isAgency, user } = useAdmin();
    const { floors } = useFloors();
    const [agencies, setAgencies] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>(() => {
        const data = normalizeProductData(product, initialData);
        return {
            ...data,
            agency_id: (product as any)?.agency_id || (initialData as any)?.agency_id || ''
        };
    });
    const [uploading, setUploading] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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
        setIsSaving(true);
        try {
            let finalFormData = { ...formData };
            if (!isEdit) {
                const isProjectTemplate = ['skincare', 'curation', 'brand', 'magazine', 'community', 'project_landing'].includes(formData.page_type);
                if (isProjectTemplate) {
                    const cleanId = formData.id.trim().replace(/-[0-9]+$/, '');
                    finalFormData.id = `${cleanId}-${Date.now()}`;
                }
            }

            if (isEdit) {
                const updated = await updateProduct(product!.id, finalFormData);
                onSuccess(updated);
            } else {
                const created = await createProduct(finalFormData);
                // For create, we might need to fetch the full object if created only has ID
                const fullItem = await getProductById(created.id);
                onSuccess(fullItem || undefined);
            }
        } catch (err: any) {
            console.error('[handleSubmit] Error:', err);
            alert(`Operation failed: ${err.message || JSON.stringify(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95" onClick={onClose} 
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white border border-dancheong-ink/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-dancheong-ink/10 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold text-dancheong-ink">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-dancheong-ink/40"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. ID & 2. Title */}
                        <div className="space-y-4">
                            {!isEdit && (
                                <div>
                                    <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block">1. Unique ID</label>
                                    <input 
                                        type="text" required
                                        value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}
                                        className="w-full bg-black/5 border border-dancheong-ink/10 rounded-xl p-4 text-dancheong-ink focus:border-[#00FFC2]/50"
                                        placeholder="e.g. k-heritage-001"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="2. 제목" /></label>
                                <input 
                                    type="text" required
                                    value={formData.title.ko} onChange={(e) => setFormData({...formData, title: {...formData.title, ko: e.target.value}})}
                                    className="w-full bg-black/5 border border-dancheong-ink/10 rounded-xl p-4 text-dancheong-ink focus:border-[#00FFC2]/50"
                                />
                            </div>
                        </div>

                        {/* 3. Category & 4. Subcategory */}
                        <div className="space-y-4">
                            {isAdmin && (
                                <div>
                                    <label className="text-xs font-bold text-dancheong-mugwort uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="Agency Owner" /></label>
                                    <select 
                                        value={formData.agency_id || ''} 
                                        onChange={(e) => setFormData({...formData, agency_id: e.target.value})}
                                        className="w-full bg-black/5 border border-dancheong-mugwort/30 rounded-xl p-4 text-dancheong-mugwort focus:border-[#00FFC2]/50 font-bold"
                                    >
                                        <option value="">Admin (Default)</option>
                                        {agencies.map(a => (
                                            <option key={a.id} value={a.id}>{a.agency_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="Page Type (Template)" /></label>
                                <select 
                                    value={formData.page_type || 'standard'} 
                                    onChange={(e) => setFormData({...formData, page_type: e.target.value})}
                                    className="w-full bg-black/5 border border-dancheong-ink/10 rounded-xl p-4 text-dancheong-ink focus:border-[#00FFC2]/50"
                                >
                                    <option value="standard">Standard (Default)</option>
                                    {(isAdmin || (isAgency && user?.has_project_template_access)) && (
                                        <>
                                            <option value="skincare">Skincare (Premium Template)</option>
                                            <option value="curation">Curation (Premium Template)</option>
                                            <option value="brand">Brand (Premium Template)</option>
                                            <option value="magazine">Magazine (Premium Template)</option>
                                            <option value="community">Community (Premium Template)</option>
                                            <option value="cinema">Cinema</option>
                                            <option value="museum">Museum</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="3. Category (Floor)" /></label>
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
                                    className="w-full bg-black/5 border border-dancheong-ink/10 rounded-xl p-4 text-dancheong-ink focus:border-[#00FFC2]/50"
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
                                <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="4. Subcategory ID" /></label>
                                <select 
                                    required
                                    value={formData.subcategory} 
                                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                                    className="w-full bg-black/5 border border-dancheong-ink/10 rounded-xl p-4 text-dancheong-ink focus:border-[#00FFC2]/50"
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
                        <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="5. 설명" /></label>
                        <textarea 
                            rows={4} required
                            value={formData.description.ko} onChange={(e) => setFormData({...formData, description: {...formData.description, ko: e.target.value}})}
                            className="w-full bg-black/5 border border-dancheong-ink/10 rounded-xl p-4 text-dancheong-ink focus:border-[#00FFC2]/50"
                        />
                    </div>

                    {/* Template specific fields: Parent ID */}
                    {TEMPLATE_CATEGORIES.includes(formData.category) && (
                        <div>
                            <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block">
                                <AutoTranslatedText text="Template Linked Parent ID (필수)" />
                            </label>
                            <input 
                                type="text" 
                                value={formData.parent_id || ''} 
                                onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                                className="w-full bg-black/5 border border-dancheong-mugwort/30 rounded-xl p-4 text-dancheong-ink focus:border-[#00FFC2]/50"
                                placeholder="연결할 상위 제품의 ID를 입력하세요 (예: car-care-exchange-week)"
                            />
                            <p className="text-[10px] text-dancheong-ink/30 mt-2 px-1">
                                * 템플릿(Cinema, Museum 등) 데이터는 상위 제품 ID가 정확히 입력되어야 해당 페이지에서 노출됩니다.
                            </p>
                        </div>
                    )}

                    {/* 5-2. Detailed Description */}
                    <div>
                        <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="5-2. 상세 설명 (상세 페이지용)" /></label>
                        <textarea 
                            rows={8}
                            value={formData.long_description.ko} onChange={(e) => setFormData({...formData, long_description: {...formData.long_description, ko: e.target.value}})}
                            className="w-full bg-black/5 border border-dancheong-ink/10 rounded-xl p-4 text-dancheong-ink focus:border-[#00FFC2]/50"
                            placeholder="상세 페이지 하단에 표시될 긴 설명을 입력하세요. 빈 칸인 경우 기본 하드코딩된 텍스트가 표시됩니다."
                        />
                    </div>

                    {/* 5-3. 상세 미디어 (상세 설명 하단) */}
                    <div>
                        <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="5-3. 상세 미디어 (상세 설명 하단)" /></label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-6 rounded-2xl border border-dancheong-ink/5">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-dancheong-ink/50 uppercase block tracking-wider">미디어 타입 (Media Type)</label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, detail_media_type: 'image'})}
                                        className={`flex-1 py-3 rounded-xl border transition-all font-bold ${formData.detail_media_type === 'image' ? 'bg-dancheong-ink text-white border-[#00FFC2]' : 'bg-black/5 text-dancheong-ink/40 border-dancheong-ink/10 hover:bg-dancheong-ink/5'}`}
                                    >
                                        이미지 (Image)
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, detail_media_type: 'video'})}
                                        className={`flex-1 py-3 rounded-xl border transition-all font-bold ${formData.detail_media_type === 'video' ? 'bg-dancheong-ink text-white border-[#00FFC2]' : 'bg-black/5 text-dancheong-ink/40 border-dancheong-ink/10 hover:bg-dancheong-ink/5'}`}
                                    >
                                        영상 (Video)
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-dancheong-ink/50 uppercase block tracking-wider">미디어 업로드 / URL (Upload / URL)</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative group">
                                        <input 
                                            type="text" 
                                            value={formData.detail_media_url || ''} 
                                            onChange={(e) => setFormData({...formData, detail_media_url: e.target.value})}
                                            className="w-full bg-black/5 border border-dancheong-ink/10 rounded-xl p-4 text-dancheong-ink text-xs focus:border-[#00FFC2]/50 pr-12"
                                            placeholder="https://..."
                                        />
                                        <label className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg cursor-pointer text-dancheong-ink/40 hover:text-dancheong-mugwort transition-all">
                                            {uploading === 'detail_media_url' ? <div className="w-4 h-4 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
                                            <input type="file" className="hidden" accept={formData.detail_media_type === 'video' ? "video/*" : "image/*"} onChange={(e) => handleFileUpload(e, 'detail_media_url')} />
                                        </label>
                                    </div>
                                </div>
                                <div className="p-4 bg-dancheong-ink/5 rounded-xl border border-dancheong-ink/10 min-h-[150px] flex items-center justify-center overflow-hidden">
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
                                        <span className="text-[10px] text-dancheong-ink/20 uppercase tracking-widest italic">미리보기 (No Preview)</span>
                                    )}
                                </div>
                                <p className="text-[9px] text-dancheong-ink/20 px-1 italic">
                                    * 상세 페이지 하단에 표시될 미디어입니다. {formData.detail_media_type === 'video' ? 'MP4/M4V 영상 권장.' : 'JPG/PNG 이미지 권장.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 6. Main Image */}
                        <div>
                            <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="6. Main Image" /></label>
                            <div className="space-y-4">
                                <div className="relative group aspect-video bg-black/5 border border-dancheong-ink/10 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {formData.image_url ? (
                                        <>
                                            <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-dancheong-ink text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                                                    <Upload size={18} />
                                                    <AutoTranslatedText text="Change Image" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url')} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-3 text-dancheong-ink/50 hover:text-dancheong-mugwort transition-colors">
                                            <div className="w-16 h-16 rounded-2xl bg-dancheong-ink/5 flex items-center justify-center">
                                                {uploading === 'image_url' ? <div className="w-8 h-8 border-4 border-[#00FFC2] border-t-transparent rounded-full animate-spin" /> : <Upload size={32} />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Main Image</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 7. Alt Image (Hover) */}
                        <div>
                            <label className="text-xs font-bold text-dancheong-ink/60 uppercase tracking-widest pl-1 mb-2 block"><AutoTranslatedText text="7. Hover Image (Option)" /></label>
                            <div className="space-y-4">
                                <div className="relative group aspect-video bg-black/5 border border-dancheong-ink/10 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {formData.image_url_2 ? (
                                        <>
                                            <img src={formData.image_url_2} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-dancheong-ink text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                                                    <Upload size={18} />
                                                    <AutoTranslatedText text="Change Image" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url_2')} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-3 text-dancheong-ink/50 hover:text-dancheong-mugwort transition-colors">
                                            <div className="w-16 h-16 rounded-2xl bg-dancheong-ink/5 flex items-center justify-center">
                                                {uploading === 'image_url_2' ? <div className="w-8 h-8 border-4 border-[#00FFC2] border-t-transparent rounded-full animate-spin" /> : <Upload size={32} />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Hover Image</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url_2')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-black/5 border-t border-dancheong-ink/10 flex justify-end gap-4">
                        <button 
                            type="button" onClick={onClose}
                            className="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-dancheong-ink/40 hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" disabled={isSaving}
                            className="px-10 py-3 rounded-xl bg-dancheong-ink text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all border border-[#00FFC2] shadow-[0_0_20px_rgba(0,255,194,0.2)] disabled:opacity-50"
                        >
                            {isSaving ? 'Processing...' : (isEdit ? 'Save Changes' : 'Create Product')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
