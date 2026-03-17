import React, { useEffect, useState, useMemo } from 'react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, ShoppingCart, Ticket, Eye, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { getProductById } from '../api/products';
import { FeaturedItem } from '../types';
import { getJoseonThemeById, getFloorBySubId } from '../utils/themeUtils';
import { useFloors } from '../context/FloorContext';
import { useSetBreadcrumbTitle } from '../context/NavigationActionContext';





export const DetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const { floors } = useFloors();
    const [item, setItem] = useState<FeaturedItem | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // Set breadcrumb title
    const displayName = item ? getLocalizedText(item.title, i18n.language) : null;
    useSetBreadcrumbTitle(displayName);


    // Theme Detection Logic
    const pageTheme = useMemo(() => {
        if (!item) return 'promo'; // Default if item is not loaded yet
        if (item.pageType) return item.pageType;
        
        const titleKo = (typeof item.title === 'string' ? item.title : item.title.ko) || '';
        
        if (titleKo.includes('판매') || titleKo.includes('마켓') || titleKo.includes('Shop')) return 'sale';
        if (titleKo.includes('전시') || titleKo.includes('갤러리') || titleKo.includes('Exhibit')) return 'exhibit';
        if (titleKo.includes('예매') || titleKo.includes('티켓') || titleKo.includes('Booking')) return 'booking';
        if (titleKo.includes('홍보') || titleKo.includes('안내') || titleKo.includes('Promo')) return 'promo';
        
        return 'promo'; // Default fallback
    }, [item]);

    const themeConfig = {
        sale: {
            icon: ShoppingCart,
            label: '구매하기',
            color: '#00FFC2',
            action: () => alert('구매 페이지로 이동합니다.')
        },
        exhibit: {
            icon: Eye,
            label: '3D 전시 입장하기',
            color: '#FF00E5',
            action: () => navigate('/inspiration')
        },
        booking: {
            icon: Ticket,
            label: '티켓 예매하기',
            color: '#00E0FF',
            action: () => alert('예매 페이지로 이동합니다.')
        },
        promo: {
            icon: ArrowRight,
            label: '상세 보기',
            color: '#FFFFFF',
            action: () => navigate(-1)
        }
    }[pageTheme] || { icon: ArrowRight, label: '상세 보기', color: '#FFFFFF', action: () => {} };

    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getProductById(id);
                setItem(data);
            } catch (error) {
                console.error('Failed to fetch product detail:', error);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchItem();
    }, [id]);

    const floorNumber = item ? (getFloorBySubId(item.subcategory || '') || '1') : '1';
    const theme = getJoseonThemeById(id || '', floorNumber);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center" style={theme.bgStyle}>
                <div className="text-center">
                    <p className="animate-pulse text-lg font-bold" style={theme.accentStyle}>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <article className="min-h-screen" style={theme.bgStyle}>
                {/* Placeholder Hero */}
                <div className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center bg-black/40">
                    <div className="absolute inset-x-0 top-0 bottom-16 z-20">
                        <div className="lossless-layout mx-auto px-6 h-full flex flex-col justify-end">
                            <Link 
                                to="/inspiration" 
                                state={{ fromGallery: true }}
                                className="inline-flex items-center text-white/40 hover:text-white mb-6 transition-colors"
                            >
                                <ArrowLeft size={20} className="mr-2" />
                                <AutoTranslatedText text={t('common.back')} />
                            </Link>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="inline-block border-b-2 mb-4 pb-1 opacity-30" style={{ borderBottomColor: theme.accentColor }}>
                                    <span className="text-xl font-serif font-bold tracking-wider" style={theme.accentStyle}>
                                        <AutoTranslatedText text="DEPT. ARCHIVE" />
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 opacity-50" style={theme.textPrimaryStyle}>
                                    <AutoTranslatedText text="기록 수집 중입니다" />
                                </h1>
                                <div className="flex gap-4 items-center text-white/30 text-xs font-bold tracking-[0.3em] uppercase">
                                    <Calendar size={14} />
                                    <span>Updating soon</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>Curation process 85%</span>
                                    {/* Action Button Area */}
                                    <div className="pt-6">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={themeConfig.action}
                                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-black/40 transition-all border-none cursor-pointer"
                                            style={{ 
                                                backgroundColor: themeConfig.color,
                                                color: '#000'
                                            }}
                                        >
                                            <themeConfig.icon size={22} />
                                            <span><AutoTranslatedText text={themeConfig.label} /></span>
                                        </motion.button>
                                        
                                        {pageTheme === 'exhibit' && (
                                            <p className="mt-3 text-[10px] text-white/30 text-center font-bold tracking-widest uppercase">
                                                * 가상 현실에서의 몰입형 전시 경험을 제공합니다
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    {/* Background Texture Placeholder */}
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:24px_24px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                </div>

                {/* Placeholder Content */}
                <div className="mx-auto px-6 py-24 relative max-w-4xl text-center">
                    <div className="w-20 h-20 rounded-full border border-dashed border-white/20 flex items-center justify-center mx-auto mb-10" style={{ borderColor: `${theme.accentColor}44` }}>
                        <Play size={32} className="opacity-10 translate-x-1" style={{ color: theme.accentColor }} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold mb-6" style={theme.textPrimaryStyle}>
                        <AutoTranslatedText text="이곳은 곧 새로운 이야기로 채워질 예정입니다." />
                    </h2>
                    <p className="text-white/40 text-lg font-light leading-relaxed max-w-2xl mx-auto mb-12">
                        <AutoTranslatedText text="큐레이터들이 현재 해당 주제와 관련된 고유한 헤리티지와 현대적인 영감을 수집하고 있습니다. 곧 완성된 아카이브로 찾아뵙겠습니다." />
                    </p>
                    <Link
                        to="/inspiration"
                        className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm font-bold tracking-widest uppercase opacity-60 hover:opacity-100"
                        style={{ color: theme.accentColor }}
                    >
                        <AutoTranslatedText text="Go Back to Inspiration" />
                    </Link>
                </div>
            </article>
        );
    }

    return (
        <article className="min-h-screen" style={theme.bgStyle}>
            {/* Header / Hero */}
            <div className="relative h-[60vh] w-full group">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 top-0 bottom-16 z-20 pointer-events-none">
                    <div className="lossless-layout mx-auto px-6 h-full flex flex-col justify-end">
                        <Link 
                            to={`/category/${item.subcategory}`} 
                            state={{ fromGallery: true }}
                            className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors pointer-events-auto"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            <AutoTranslatedText text={t('common.back')} />
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pointer-events-auto"
                        >
                            <div className="inline-block border-b-2 mb-4 pb-1" style={{ borderBottomColor: theme.accentColor }}>
                                <span className="text-xl font-serif font-bold tracking-wider" style={theme.accentStyle}>
                                    {(() => {
                                        const displayKey = (item as any).subcategory || item.category;
                                        
                                        // Try to find the label from our dynamic floors first
                                        for (const floor of floors) {
                                            const sub = floor.subitems?.find((s: any) => s.id === displayKey);
                                            if (sub) return <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />;
                                        }

                                        const key = `nav.${displayKey.toLowerCase()}`;
                                        const translated = t(key);
                                        const fallbackText = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
                                        const textToDisplay = translated === key ? fallbackText : translated;
                                        
                                        // If it's still a long ID-like string, just show a generic "Archive"
                                        if (textToDisplay.length > 20) return <AutoTranslatedText text="Archive" />;
                                        
                                        return <AutoTranslatedText text={textToDisplay} />;
                                    })()}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4" style={theme.textPrimaryStyle}><AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} /></h1>

                            <div className="flex flex-wrap gap-6 text-white/80 text-sm">
                                <div className="flex items-center">
                                    <Calendar size={16} className="mr-2" style={theme.accentStyle} />
                                    <AutoTranslatedText text={getLocalizedText(item.date, i18n.language)} />
                                </div>
                                <div className="flex items-center">
                                    <MapPin size={16} className="mr-2" style={theme.accentStyle} />
                                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute inset-0 z-0 pointer-events-none h-[40%] mt-auto" style={{ background: `linear-gradient(to top, ${theme.bgColor}cc, transparent)` }} />
            </div>

            {/* Content Body */}
            <div className="mx-auto px-6 py-12 relative max-w-4xl">
                {/* Colored accent band at top */}
                <div className="h-1 w-full rounded mb-8" style={{ background: `linear-gradient(to right, ${theme.accentColor}, ${theme.color4}, ${theme.color5})` }} />
                <div className="space-y-8">
                    <section className="rounded-2xl p-8" style={{ backgroundColor: theme.color1, border: `1px solid ${theme.color3}` }}>
                        <p className="text-lg leading-relaxed whitespace-pre-line min-h-[500px]" style={{ color: theme.textSecondary }}>
                            <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                        </p>
                    </section>
                    
                    {/* Floating Action Button for the main section */}
                    <div className="flex justify-center pt-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={themeConfig.action}
                            className="px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-4 transition-all border-none cursor-pointer"
                            style={{ 
                                backgroundColor: themeConfig.color,
                                color: '#000',
                                boxShadow: `0 20px 40px ${themeConfig.color}33`
                            }}
                        >
                            <themeConfig.icon size={24} />
                            <span><AutoTranslatedText text={themeConfig.label} /></span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default DetailPage;
