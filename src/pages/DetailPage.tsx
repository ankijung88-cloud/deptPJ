import React, { useEffect, useState, useMemo } from 'react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Loader2, LayoutGrid, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { getProductById } from '../api/products';
import { FeaturedItem } from '../types';
import { useFloors } from '../context/FloorContext';
import { useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { getJoseonThemeById, getJoseonTheme } from '../utils/themeUtils';
import { useAdmin } from '../hooks/useAdmin';
import { TemplateSwitchModal } from '../components/common/TemplateSwitchModal';

// Lazy load templates
const VirtualCinemaPage = React.lazy(() => import('../templates/VirtualCinemaPage'));
const VirtualMuseumPage = React.lazy(() => import('../templates/VirtualMuseumPage'));
const ShoppingMallPage = React.lazy(() => import('../templates/ShoppingMallPage'));
const VirtualMeetingPage = React.lazy(() => import('../templates/VirtualMeetingPage'));
const VirtualSajuPage = React.lazy(() => import('../templates/VirtualSajuPage'));
const VirtualInterviewPage = React.lazy(() => import('../templates/VirtualInterviewPage'));
const VirtualOfficePage = React.lazy(() => import('../templates/TeamWorkspacePage'));
const VirtualTicketPage = React.lazy(() => import('../templates/VirtualTicketPage'));
const VirtualInquiryPage = React.lazy(() => import('../templates/VirtualInquiryPage'));
const VirtualReservationPage = React.lazy(() => import('../templates/VirtualReservationPage'));
const GroupBuyPage = React.lazy(() => import('../templates/VirtualGroupBuyPage'));
const FundingPage = React.lazy(() => import('../templates/VirtualFundingPage'));
const ProjectLandingPage = React.lazy(() => import('../templates/ProjectLandingPage'));

export const DetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const navigate = useNavigate();
    
    const [item, setItem] = useState<FeaturedItem | null>(null);
    const [parentProduct, setParentProduct] = useState<FeaturedItem | null>(null);

    // Derived Floor Info
    const effectiveCategory = item?.category || parentProduct?.category;
    const floorNum = effectiveCategory?.replace('floor-', '') || '';
    
    // Theme selection: Use floor-based theme if available, otherwise fallback to ID-based
    const theme = useMemo(() => {
        if (floorNum && !isNaN(parseInt(floorNum))) {
            return getJoseonTheme(floorNum);
        }
        return getJoseonThemeById(id || '');
    }, [id, floorNum]);

    const [loading, setLoading] = useState(true);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateModalType, setTemplateModalType] = useState<'standard' | 'project'>('standard');
    const { isAdmin: isAdminLoggedIn, role, user } = useAdmin();
    const { floors } = useFloors();
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('isGlobalMuted');
        return saved === null ? true : saved === 'true';
    });


    // Set Breadcrumb Path
    const effectiveSubcategory = item?.subcategory || parentProduct?.subcategory;
    const currentFloor = floors.find(f => f.floor.toLowerCase() === effectiveCategory?.toLowerCase());
    const currentCategory = currentFloor?.subitems?.find(s => s.id === effectiveSubcategory);
    
    // Refined floor label logic to match the new theme expectation
    const floorLabel = floorNum ? `${t('common.floor', 'Floor')} ${floorNum}` : (currentFloor?.floor || effectiveCategory || '');

    useSetBreadcrumbPath(item ? [
        { id: currentFloor?.floor || effectiveCategory, label: floorLabel, type: 'floor' },
        { id: currentCategory?.id || effectiveSubcategory, label: currentCategory?.label || effectiveSubcategory, type: 'category' },
        { id: 'detail', label: t('common.detail', 'Detail'), type: 'detail' },
        { id: item.id, label: item.title, type: 'detail' }
    ] : []);


    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getProductById(id);
                if (data) {
                    // [REDIRECTION LOGIC] If it's a project-type template, redirect to the specific project path
                    if (data.page_type === 'skincare') {
                        navigate(`/project-template/product/${id}`, { replace: true });
                        return;
                    }
                    
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
    }, [id, navigate]);

    useEffect(() => {
        const handleGlobalMute = (e: any) => {
            setIsMuted(e.detail);
        };
        window.addEventListener('globalMuteChange', handleGlobalMute);
        return () => window.removeEventListener('globalMuteChange', handleGlobalMute);
    }, []);



    const handleBack = () => {
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

    const handleSelectTemplate = async (templateId: string) => {
        if (!item) return;
        
        try {
            const backendData = prepareDataForBackend(item as any, { 
                selected_templates: item.selected_templates 
            });
            (backendData as any).page_type = templateId;

            setItem({ ...item, page_type: templateId } as FeaturedItem);
            setIsTemplateModalOpen(false);

            const response = await fetch(`/api/products/${item.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: JSON.stringify(backendData)
            });

            if (!response.ok) {
                const msg = await translateAsync('서버 저장에 실패했습니다. 변경사항은 현재 세션에서만 유지됩니다.');
                alert(msg);
            }
        } catch (error) {
            console.error('Failed to switch template:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center" style={{ backgroundColor: theme.bgColor, color: theme.textPrimary }}>
                <Loader2 className="animate-spin" style={{ color: theme.highlightColor }} size={40} />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center" style={{ backgroundColor: theme.bgColor, color: theme.textPrimary }}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{t('common.item_not_found')}</h2>
                    <Link to="/inspiration" className="hover:underline font-bold text-lg" style={{ color: theme.highlightColor }}><AutoTranslatedText text={t('common.back_home')} /></Link>
                </div>
            </div>
        );
    }

    // Dynamic Template Rendering
    const renderTemplate = () => {
        const pageType = item?.page_type || 'standard';
        const is1F = item?.category === 'floor-1' || item?.category === 'f1';
        
        if (pageType === 'standard') return null;
        if (pageType === 'project_landing' && is1F) return null;

        const templateProps = {
            productId: item.id,
            item: item,
            theme: theme,
            onClose: handleBack
        };

        return (
            <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-black/5">
                    <Loader2 className="animate-spin text-neutral-400" size={40} />
                </div>
            }>
                {pageType === 'cinema' && <VirtualCinemaPage {...templateProps as any} />}
                {pageType === 'museum' && <VirtualMuseumPage {...templateProps as any} />}
                {pageType === 'store' && <ShoppingMallPage {...templateProps as any} />}
                {pageType === 'meeting' && <VirtualMeetingPage {...templateProps as any} />}
                {pageType === 'saju' && <VirtualSajuPage {...templateProps as any} />}
                {pageType === 'interview' && <VirtualInterviewPage {...templateProps as any} />}
                {pageType === 'office' && <VirtualOfficePage {...templateProps as any} />}
                {pageType === 'ticket' && <VirtualTicketPage {...templateProps as any} />}
                {pageType === 'inquiry' && <VirtualInquiryPage {...templateProps as any} />}
                {pageType === 'reservation' && <VirtualReservationPage {...templateProps as any} />}
                {pageType === 'groupbuy' && <GroupBuyPage {...templateProps as any} />}
                {pageType === 'funding' && <FundingPage {...templateProps as any} />}
                {pageType === 'project_landing' && !(item.category === 'floor-1' || item.category === 'f1') && <ProjectLandingPage {...templateProps as any} />}
            </React.Suspense>
        );
    };

    const renderTemplateSwitcher = (isFixed = true) => {
        if (!(isAdminLoggedIn || (role === 'agency' && String(item?.agency_id) === String(user?.id)))) return null;
        const pageType = item?.page_type || 'standard';
        if (pageType === 'meeting') return null;

        return (
            <div className={`${isFixed ? 'fixed top-40 right-10 z-[10000] flex flex-col items-end gap-4' : 'mb-10 flex flex-col gap-4'}`}>
                <button
                    onClick={() => {
                        setTemplateModalType('standard');
                        setIsTemplateModalOpen(true);
                    }}
                    className="py-3 px-6 rounded-full bg-white shadow-xl border border-black/5 hover:scale-105 transition-all group flex items-center gap-3 overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <LayoutGrid size={20} className="text-black relative z-10" />
                    <span className="text-sm font-bold tracking-tighter relative z-10"><AutoTranslatedText text="템플릿 선택" /></span>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>

                <button
                    onClick={() => {
                        setTemplateModalType('project');
                        setIsTemplateModalOpen(true);
                    }}
                    className="py-3 px-6 rounded-full bg-white shadow-xl border border-black/5 hover:scale-105 transition-all group flex items-center gap-3 overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Layout size={20} className="text-black relative z-10" />
                    <span className="text-sm font-bold tracking-tighter relative z-10"><AutoTranslatedText text="프로젝트형 템플릿 선택" /></span>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                </button>
            </div>
        );
    };

    const activeTemplate = renderTemplate();

    if (activeTemplate) {
        return (
            <div className="relative min-h-screen">
                {activeTemplate}
                {renderTemplateSwitcher(true)}
                <TemplateSwitchModal
                    isOpen={isTemplateModalOpen}
                    onClose={() => setIsTemplateModalOpen(false)}
                    onSelect={handleSelectTemplate}
                    currentTemplateId={item.page_type}
                    theme={theme}
                    filterType={templateModalType}
                />
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-transparent" style={{ color: theme.textPrimary }}>
            <div className="relative h-[45vh] w-full group overflow-hidden">
                <motion.div 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                        backgroundImage: `url(${item.imageUrl})`
                    }}
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
                            <span className="font-bold tracking-widest uppercase text-sm"><AutoTranslatedText text="Back" /></span>
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
                                    <span className="text-xs font-mono tracking-widest uppercase ml-2 opacity-40">
                                        / {item.subcategory}
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-5xl md:text-8xl font-serif font-black mb-8 leading-none tracking-tighter" style={{ color: theme.textPrimary }}>
                                <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                            </h1>

                            <div className="flex flex-wrap gap-8 text-sm font-light">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon size={16} style={{ color: theme.highlightColor }} />
                                    <AutoTranslatedText text={getLocalizedText(item.date, i18n.language)} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} style={{ color: theme.highlightColor }} />
                                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-8 space-y-16">
                        <section className="relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-1 opacity-30" style={{ backgroundColor: theme.highlightColor }} />
                            <p className="text-2xl md:text-3xl leading-tight font-serif italic whitespace-pre-wrap" style={{ color: theme.textSecondary }}>
                                <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                            </p>
                        </section>
                        <div className="h-px w-full" style={{ backgroundColor: `${theme.textPrimary}11` }} />
                        <section className="prose prose-invert max-w-none">
                            <div className="text-lg leading-tight space-y-8 font-light" style={{ color: theme.textSecondary }}>
                                {item.long_description ? (
                                    <div className="whitespace-pre-wrap">
                                        <AutoTranslatedText text={getLocalizedText(item.long_description, i18n.language)} />
                                    </div>
                                ) : (
                                    <>
                                        <p>
                                            <AutoTranslatedText text="Explore the depths of traditional Korean aesthetics reimagined for the modern era." />
                                        </p>
                                    </>
                                )}
                            </div>
                        </section>
                        {item.detail_media_url && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="w-full rounded-[2rem] overflow-hidden border border-white/5 bg-black/20"
                            >
                                {item.detail_media_type === 'video' ? (
                                    <video 
                                        src={item.detail_media_url} 
                                        controls 
                                        autoPlay 
                                        muted={isMuted} 
                                        loop 
                                        playsInline
                                        className="w-full h-auto block"
                                    />
                                ) : (
                                    <img 
                                        src={item.detail_media_url} 
                                        alt="" 
                                        className="w-full h-auto block"
                                    />
                                )}
                            </motion.div>
                        )}
                    </div>
                    <div className="lg:col-span-4 lg:pl-10">
                        <div className="sticky top-32 space-y-12">
                            <div className="space-y-6 px-4">
                                {renderTemplateSwitcher(false)}
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

            <TemplateSwitchModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleSelectTemplate}
                currentTemplateId={item.page_type}
                filterType={templateModalType}
                theme={theme}
            />
        </article>
    );
};

export default DetailPage;
