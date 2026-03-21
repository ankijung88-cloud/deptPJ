import React, { useEffect, useState } from 'react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Share2, X, Download, Loader2, Video, Rotate3d, ShoppingBag, Ticket, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { getProductById } from '../api/products';
import { FeaturedItem, SelectedTemplate } from '../types';
import { useFloors } from '../context/FloorContext';
import { useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { getJoseonThemeById } from '../utils/themeUtils';
import { useAdmin } from '../hooks/useAdmin';

export const DetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const theme = getJoseonThemeById(id || '');
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [item, setItem] = useState<FeaturedItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
    const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
    const { isAdmin: isAdminLoggedIn, role, user } = useAdmin();
    const { floors } = useFloors();
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);

    // Set Breadcrumb Path
    const effectiveCategory = item?.category || parentProduct?.category;
    const effectiveSubcategory = item?.subcategory || parentProduct?.subcategory;
    const currentFloor = floors.find(f => f.floor.toLowerCase() === effectiveCategory?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === effectiveSubcategory);
    
    const floorNum = effectiveCategory?.replace('floor-', '') || currentFloor?.floor?.replace('F', '').replace('f', '') || '';
    const floorLabel = floorNum ? `바닥-${floorNum}` : (currentFloor?.floor || effectiveCategory || '');

    useSetBreadcrumbPath(item ? [
        { id: currentFloor?.floor || effectiveCategory, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || effectiveSubcategory, label: currentCategory?.label || effectiveSubcategory, type: 'category' },
        { id: 'detail', label: '상세', type: 'detail' },
        { id: item.id, label: item.title, type: 'detail' }
    ] : []);


    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getProductById(id);
                if (data) {
                    setItem(data);
                    
                    // Fetch parent if parent_id exists
                    if (data.parent_id) {
                        const parentData = await getProductById(data.parent_id);
                        if (parentData) setParentProduct(parentData);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product detail:', error);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchItem();
    }, [id]);

    useEffect(() => {
        if (item?.selected_templates) {
            try {
                const templates = typeof item.selected_templates === 'string' 
                    ? JSON.parse(item.selected_templates) 
                    : item.selected_templates;
                
                // Ensure unique template IDs
                const uniqueTemplates = (templates || []).reduce((acc: SelectedTemplate[], current: SelectedTemplate) => {
                    const x = acc.find(item => item.id === current.id);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                }, []);
                
                setSelectedTemplates(uniqueTemplates);
            } catch (e) {
                console.error('Failed to parse selected_templates:', e);
                setSelectedTemplates([]);
            }
        } else {
            setSelectedTemplates([]);
        }
    }, [item]);

    const handleBack = () => {
        // Simple heuristic to check if we can go back in history
        // If we are at the first entry of the session, just fallback
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
            return;
        }

        if (item?.parent_id) {
            const templateKeywords = ['cinema', 'museum', 'store', 'ticket'];
            const template = templateKeywords.find(k => 
                item.category?.toLowerCase().includes(k) || 
                item.subcategory?.toLowerCase().includes(k)
            );
            
            if (template) {
                navigate(`/detail/${item.parent_id}/${template}`);
                return;
            }
        }
        
        if (currentFloor) {
            navigate(`/inspiration?floor=${currentFloor.floor.toLowerCase()}`);
        } else {
            navigate('/inspiration');
        }
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleDownload = async () => {
        if (!item) return;
        const url = item.videoUrl || item.imageUrl;
        if (!url) return;

        try {
            setDownloading(true);
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1].split('?')[0] || `download-${item.id}`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank');
        } finally {
            setDownloading(false);
        }
    };

    const prepareDataForBackend = (baseItem: FeaturedItem, overrides: Partial<any> = {}) => {
        return {
            title: baseItem.title,
            category: overrides.category || baseItem.category,
            subcategory: baseItem.subcategory,
            description: baseItem.description,
            long_description: baseItem.long_description,
            image_url: baseItem.imageUrl,
            thumbnail_url: baseItem.thumbnailUrl,
            side_image_url: baseItem.sideImageUrl,
            back_image_url: baseItem.backImageUrl,
            event_date: baseItem.date,
            location: baseItem.location,
            price: baseItem.price,
            closed_days: JSON.stringify(baseItem.closedDays),
            video_url: baseItem.videoUrl,
            page_type: (baseItem as any).page_type,
            parent_id: (baseItem as any).parent_id,
            theme_data: (baseItem as any).theme_data,
            selected_templates: JSON.stringify(overrides.selected_templates || baseItem.selected_templates)
        };
    };

    const handleApplyTemplate = async (templateType: string) => {
        if (!item) return;
        
        try {
            setApplyingTemplate(templateType);
            // ONLY add to DB if it's not already in the selected list
            const isAlreadySelected = selectedTemplates.some(t => t.id === templateType);
            let success = true;
            
            if (!isAlreadySelected) {
                const newTemplates = [...selectedTemplates, { id: templateType, status: 'visible' }];
                const backendData = prepareDataForBackend(item, { 
                    selected_templates: newTemplates 
                });

                const response = await fetch(`/api/products/${item.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                    },
                    body: JSON.stringify(backendData)
                });
                success = response.ok;
            }

            if (success) {
                const routes: { [key: string]: string } = {
        cinema: `/detail/${item.id}/cinema`,
        museum: `/detail/${item.id}/museum`,
        store: `/detail/${item.id}/store`,
        ticket: `/detail/${item.id}/ticket`
    };
                navigate(routes[templateType], { 
                    state: { 
                        initialId: item.id, 
                        parentId: item.id,
                        parentTitle: getLocalizedText(item.title, i18n.language)
                    } 
                });
            } else {
                alert('템플릿 적용에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to apply template:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setApplyingTemplate(null);
        }
    };

    const saveTemplatesToDb = async (templates: SelectedTemplate[]) => {
        if (!item) return;
        try {
            const backendData = prepareDataForBackend(item, { selected_templates: templates });
            await fetch(`/api/products/${item.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: JSON.stringify(backendData)
            });
        } catch (error) {
            console.error('Failed to save templates:', error);
        }
    };

    const toggleTemplateSelection = (templateType: string) => {
        const isSelected = selectedTemplates.some(t => t.id === templateType);
        const newTemplates: SelectedTemplate[] = isSelected 
            ? selectedTemplates.filter(t => t.id !== templateType)
            : [...selectedTemplates, { id: templateType, status: 'visible' }];
        
        setSelectedTemplates(newTemplates);
        saveTemplatesToDb(newTemplates);
    };

    const toggleTemplateStatus = (templateId: string) => {
        const newTemplates: SelectedTemplate[] = selectedTemplates.map(t => 
            t.id === templateId 
                ? { ...t, status: t.status === 'visible' ? 'hidden' : 'visible' }
                : t
        );
        setSelectedTemplates(newTemplates);
        saveTemplatesToDb(newTemplates);
    };

    const deleteTemplateByAdmin = (templateId: string) => {
        const newTemplates = selectedTemplates.filter(t => t.id !== templateId);
        setSelectedTemplates(newTemplates);
        saveTemplatesToDb(newTemplates);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-white" style={{ backgroundColor: theme.bgColor }}>
                <Loader2 className="animate-spin text-[#00FFC2]" size={40} />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-white" style={{ backgroundColor: theme.bgColor }}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{t('common.item_not_found')}</h2>
                    <Link to="/inspiration" className="text-[#00FFC2] hover:underline font-bold text-lg"><AutoTranslatedText text={t('common.back_home')} /></Link>
                </div>
            </div>
        );
    }

    return (
        <article className="min-h-screen text-white" style={{ backgroundColor: theme.bgColor }}>
            {/* Magazine Hero */}
            <div className="relative h-[80vh] w-full group overflow-hidden">
                <motion.div 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                >
                    <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to top, ${theme.bgColor}, ${theme.bgColor}33, transparent)` }} />
                </motion.div>

                <div className="absolute inset-0 z-[50] flex flex-col justify-end pb-20">
                    <div className="container mx-auto px-6">
                        <button 
                            onClick={handleBack}
                            className="inline-flex items-center mb-8 transition-colors group relative z-[60]"
                            style={{ color: `${theme.highlightColor}de` }}
                        >
                            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold tracking-widest uppercase text-sm">{t('common.back')}</span>
                        </button>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-4xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <button 
                                    onClick={handleBack}
                                    className="px-4 py-1.5 rounded-full text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 relative z-[60]"
                                    style={{ backgroundColor: theme.highlightColor, boxShadow: `0 0 15px ${theme.glowColor}` }}
                                >
                                    <AutoTranslatedText text="아카이브" /> {floorLabel}
                                </button>
                                {item.subcategory && (
                                    <span className="text-white/40 text-xs font-mono tracking-widest uppercase ml-2">
                                        / {item.subcategory}
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-5xl md:text-8xl font-serif font-black mb-8 leading-none tracking-tighter">
                                <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                            </h1>

                            <div className="flex flex-wrap gap-8 text-sm font-light" style={{ color: theme.textSecondary }}>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-[#00FFC2]" />
                                    <AutoTranslatedText text={getLocalizedText(item.date, i18n.language)} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-[#00FFC2]" />
                                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                
                {/* Decorative scale lines */}
                <div className="absolute left-0 right-0 bottom-0 h-1 space-x-1 flex px-6 pb-2 opacity-20">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className={`h-full bg-white ${i % 10 === 0 ? 'w-0.5 alpha-80' : 'w-px alpha-40'}`} />
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <div className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Description Column */}
                    <div className="lg:col-span-8 space-y-16">
                        <section className="relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-[#00FFC2] opacity-30" />
                            <p className="text-2xl md:text-3xl leading-relaxed font-serif italic" style={{ color: theme.textSecondary }}>
                                <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                            </p>
                        </section>

                        <div className="h-px w-full bg-white/5" />

                        <section className="prose prose-invert max-w-none">
                            <div className="text-lg leading-relaxed space-y-8 font-light" style={{ color: theme.textSecondary }}>
                                {item.long_description ? (
                                    <div className="whitespace-pre-wrap">
                                        <AutoTranslatedText text={getLocalizedText(item.long_description, i18n.language)} />
                                    </div>
                                ) : (
                                    <>
                                        <p>
                                            <AutoTranslatedText text="Explore the depths of traditional Korean aesthetics reimagined for the modern era. Handcrafted with precision and a deep respect for historical legacy, this piece represents more than just a functional object—it is a vessel of culture, carrying signatures of the past into the digital frontier." />
                                        </p>
                                        <p>
                                            <AutoTranslatedText text="Each element has been meticulously curated to provide an immersive experience that transcends simple viewing. We invite you to engage with the textures, the rhythms, and the silent stories embedded within the architecture of this presentation." />
                                        </p>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="lg:col-span-4 lg:pl-10">
                        <div className="sticky top-32 space-y-12">
                            {/* Price / Action Card */}
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{t('common.price')}</span>
                                    <div className="text-3xl font-serif font-bold text-[#00FFC2]">
                                        <AutoTranslatedText text={getLocalizedText(item.price, i18n.language)} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {item.videoUrl && (
                                        <button 
                                            onClick={handleDownload}
                                            disabled={downloading}
                                            className="w-full py-4 bg-[#00FFC2] text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                                        >
                                            {downloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                                            <AutoTranslatedText text="Resource Asset Download" />
                                        </button>
                                    )}
                                    {selectedTemplates
                                        .filter((tpl, index, self) => 
                                            tpl.status === 'visible' && 
                                            self.findIndex(t => t.id === tpl.id) === index
                                        )
                                        .map((tpl) => {
                                            const tplInfo = [
                                                { id: 'cinema', label: '감상하기', icon: Video, color: '#FF3B3B' },
                                                { id: 'museum', label: '전시보기', icon: Rotate3d, color: '#FFD600' },
                                                { id: 'store', label: '구매하기', icon: ShoppingBag, color: '#00FFC2' },
                                                { id: 'ticket', label: '예매하기', icon: Ticket, color: '#FF2E92' }
                                            ].find(t => t.id === tpl.id);
                                            
                                            if (!tplInfo) return null;

                                            return (
                                                <button 
                                                    key={tpl.id}
                                                    onClick={() => handleApplyTemplate(tpl.id)}
                                                    disabled={applyingTemplate !== null}
                                                    className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all disabled:opacity-50 group"
                                                >
                                                    {applyingTemplate === tpl.id ? <Loader2 size={20} className="animate-spin" /> : <tplInfo.icon size={20} style={{ color: tplInfo.color }} />}
                                                    <AutoTranslatedText text={tplInfo.label} />
                                                    {/* DEBUG MARKER - To verify update */}
                                                    <span className="sr-only">v2</span>
                                                </button>
                                            );
                                        })}
                                    <button 
                                        onClick={handleShare}
                                        className="w-full py-4 bg-transparent border border-white/20 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                                    >
                                        <Share2 size={20} />
                                        <AutoTranslatedText text="Share Content" />
                                    </button>
                                </div>
                            </div>

                            {/* Template Usage Card */}
                            {(isAdminLoggedIn || (role === 'agency' && String(item?.agency_id) === String(user?.id))) && (
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-[#00FFC2] uppercase tracking-[0.2em]"><AutoTranslatedText text="템플릿 선택 사용" /></span>
                                        <p className="text-xs text-white/40"><AutoTranslatedText text="원하는 테마의 템플릿을 선택하여 제품을 체험해보세요." /></p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'cinema', label: '감상하기', icon: Video, color: '#FF3B3B' },
                                            { id: 'museum', label: '전시보기', icon: Rotate3d, color: '#FFD600' },
                                            { id: 'store', label: '구매하기', icon: ShoppingBag, color: '#00FFC2' },
                                            { id: 'ticket', label: '예매하기', icon: Ticket, color: '#FF2E92' }
                                        ].map((tpl) => {
                                            const selectedTpl = selectedTemplates.find(t => t.id === tpl.id);
                                            const isSelected = !!selectedTpl;
                                            const isHidden = selectedTpl?.status === 'hidden';

                                            return (
                                                <div key={tpl.id} className="space-y-2">
                                                    <button
                                                        onClick={() => toggleTemplateSelection(tpl.id)}
                                                        className={`w-full flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all relative group ${
                                                            isSelected 
                                                                ? 'bg-white/10 border-[#00FFC2] shadow-[0_0_20px_rgba(0,255,194,0.1)]' 
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <div className="absolute top-3 right-3">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                                isSelected ? 'bg-[#00FFC2] border-[#00FFC2]' : 'border-white/20'
                                                            }`}>
                                                                {isSelected && <Check size={10} className="text-black" strokeWidth={4} />}
                                                            </div>
                                                        </div>
                                                        <tpl.icon size={24} style={{ color: tpl.color }} className={`${isSelected ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                                        <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${
                                                            isSelected ? 'text-white' : 'text-white/40'
                                                        }`}>
                                                            {tpl.label}
                                                        </span>
                                                        {isHidden && (
                                                            <span className="absolute top-2 left-2 bg-red-500 text-[8px] px-1 rounded uppercase font-bold">Hidden</span>
                                                        )}
                                                    </button>
                                                    
                                                    {isSelected && (
                                                        <div className="flex gap-1">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); toggleTemplateStatus(tpl.id); }}
                                                                className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider"
                                                            >
                                                                {isHidden ? <AutoTranslatedText text="Unhide" /> : <AutoTranslatedText text="Hide" />}
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); deleteTemplateByAdmin(tpl.id); }}
                                                                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg text-[9px] font-bold uppercase"
                                                            >
                                                                <AutoTranslatedText text="Del" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Additional Info */}
                            <div className="space-y-6 px-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}><AutoTranslatedText text="Curated Category" /></span>
                                    <p className="font-medium tracking-wide" style={{ color: theme.textSecondary }}><AutoTranslatedText text={item.category} /></p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}><AutoTranslatedText text="Platform ID" /></span>
                                    <p className="font-mono text-sm opacity-40" style={{ color: theme.textSecondary }}>{item.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowShareModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative border w-full max-w-sm rounded-[2rem] p-8 space-y-8 shadow-2xl"
                            style={{ backgroundColor: theme.color1, borderColor: theme.color3 }}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold"><AutoTranslatedText text="Share" /></h3>
                                <button onClick={() => setShowShareModal(false)} className="text-white/40 hover:text-white"><X size={24}/></button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden text-xs text-white/40 font-mono truncate">
                                    {window.location.href}
                                </div>
                                <button 
                                    onClick={handleCopyLink}
                                    className={`w-full py-4 ${copySuccess ? 'bg-[#00FFC2]' : 'bg-white'} text-black rounded-2xl font-bold transition-all`}
                                >
                                    {copySuccess ? <AutoTranslatedText text="Copied!" /> : <AutoTranslatedText text="Copy Link" />}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </article>
    );
};

export default DetailPage;
