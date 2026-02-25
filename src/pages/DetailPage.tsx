import React, { useEffect, useState } from 'react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Share2, X, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { getProductById } from '../api/products';
import { FeaturedItem } from '../types';





export const DetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const [item, setItem] = useState<FeaturedItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [activeMedia, setActiveMedia] = useState<'video' | 'image'>('image');
    const [downloading, setDownloading] = useState(false);

    // Update active media when item changes
    useEffect(() => {
        if (item?.videoUrl) {
            setActiveMedia('video');
        } else {
            setActiveMedia('image');
        }
    }, [item]);

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

    const handleShare = () => {
        setShowShareModal(true);
    };

    const handleShareSNS = (platform: 'facebook' | 'twitter' | 'more') => {
        if (!item) return;
        const url = window.location.href;
        const title = getLocalizedText(item.title, i18n.language);

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
                break;
            case 'more':
                if (navigator.share) {
                    navigator.share({ title, url }).catch(console.error);
                } else {
                    handleCopyLink();
                }
                break;
        }
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

    const proceedToDownload = async () => {
        if (!item) return;
        const url = activeMedia === 'video' ? (item.videoUrl || item.imageUrl) : item.imageUrl;
        if (!url) return;

        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            window.open(url, '_blank');
            return;
        }

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

    const handleDownload = () => {
        proceedToDownload();
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-white bg-charcoal">
                <div className="text-center">
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-white bg-charcoal">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{t('common.item_not_found')}</h2>
                    <Link to="/" className="text-dancheong-red hover:underline">{t('common.back_home')}</Link>
                </div>
            </div>
        );
    }

    return (
        <article className="pt-20 min-h-screen bg-charcoal text-white">
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
                    <div className="container mx-auto px-6 h-full flex flex-col justify-end">
                        <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors pointer-events-auto">
                            <ArrowLeft size={20} className="mr-2" />
                            {t('common.back')}
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pointer-events-auto"
                        >
                            <div className="inline-block border-b-2 border-dancheong-red mb-4 pb-1">
                                <span className="text-xl font-serif font-bold tracking-wider">
                                    {(() => {
                                        const displayKey = (item as any).subcategory || item.category;
                                        return t(`nav.${displayKey.toLowerCase()}`) || displayKey;
                                    })()}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4"><AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} /></h1>

                            <div className="flex flex-wrap gap-6 text-white/80 text-sm">
                                <div className="flex items-center">
                                    <CalendarIcon size={16} className="mr-2 text-dancheong-green" />
                                    <AutoTranslatedText text={getLocalizedText(item.date, i18n.language)} />
                                </div>
                                <div className="flex items-center">
                                    <MapPin size={16} className="mr-2 text-dancheong-green" />
                                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent h-[40%] mt-auto" />
            </div>

            {/* Content Body */}
            <div className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold font-serif mb-6 border-l-4 border-dancheong-green pl-4">{t('common.detail_intro')}</h3>
                        <p className="text-lg leading-relaxed text-white/80 whitespace-pre-line min-h-[500px]">
                            <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                        </p>
                    </section>
                </div>

                {/* Sidebar / CTA - Sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        {/* Price Card */}
                        <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5 shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-white/60">{t('common.price')}</span>
                                <span className="text-xl font-bold text-dancheong-red">
                                    {(() => {
                                        const priceText = getLocalizedText(item.price, i18n.language);
                                        const displayPrice = /^[0-9,]+$/.test(priceText) ? `${priceText}원` : priceText;
                                        return <AutoTranslatedText text={displayPrice} />;
                                    })()}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5 shadow-2xl">
                            {item.category === 'Style' && (
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="w-full py-4 rounded-lg font-bold text-lg mb-4 transition-all shadow-lg flex items-center justify-center bg-dancheong-green hover:bg-green-700 text-white"
                                >
                                    {downloading ? (
                                        <Loader2 size={24} className="animate-spin mr-2" />
                                    ) : (
                                        <Download size={24} className="mr-2" />
                                    )}
                                    {t('common.download')}
                                </button>
                            )}

                            <button
                                onClick={handleShare}
                                className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center"
                            >
                                <Share2 size={18} className="mr-2" />
                                {t('common.share')}
                            </button>
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
                            className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Share2 size={20} className="text-white/60" />
                                    <h2 className="text-lg font-bold">{t('common.share_modal.title')}</h2>
                                </div>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Preview Card */}
                                <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5 group">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm truncate mb-1 text-white">
                                            {getLocalizedText(item.title, i18n.language)}
                                        </h3>
                                        <p className="text-white/40 text-[10px] truncate">
                                            {window.location.href}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-white p-1 rounded-lg flex-shrink-0 shadow-lg">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`}
                                            alt="QR Code"
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>

                                {/* Link Copy Section */}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-1">Share using link</p>
                                    <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden group">
                                        <div className="flex-1 p-4 overflow-hidden text-xs text-white/60 whitespace-nowrap mask-fade-right">
                                            {window.location.href}
                                        </div>
                                        <button
                                            onClick={handleCopyLink}
                                            className={`px-5 py-4 font-bold text-[10px] transition-all transform active:scale-95 whitespace-nowrap min-w-[80px] ${copySuccess
                                                ? 'bg-dancheong-green text-white'
                                                : 'bg-white/20 hover:bg-white/30 text-white border-l border-white/10'
                                                }`}
                                        >
                                            {copySuccess ? t('common.share_modal.copied') : t('common.share_modal.copy_link')}
                                        </button>
                                    </div>
                                </div>

                                {/* SNS Selection */}
                                <div className="space-y-3">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-1">Share using apps</p>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { id: 'facebook', icon: 'f', bg: '#1877F2', label: t('common.share_modal.sns.facebook') },
                                            { id: 'twitter', icon: '𝕏', bg: '#000000', label: t('common.share_modal.sns.twitter'), font: 'serif' },
                                            { id: 'linkedin', icon: 'in', bg: '#0A66C2', label: 'LinkedIn' },
                                            { id: 'more', icon: '...', bg: 'rgba(255,255,255,0.1)', label: t('common.share_modal.sns.more') }
                                        ].map((sns) => (
                                            <div key={sns.id} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => handleShareSNS(sns.id as any)}>
                                                <div
                                                    style={{ backgroundColor: sns.bg }}
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                                                >
                                                    <span className={`font-bold text-xl ${sns.font === 'serif' ? 'font-serif' : ''}`}>{sns.icon}</span>
                                                </div>
                                                <span className="text-[10px] text-white/40 group-hover:text-white transition-colors">
                                                    {sns.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="h-6 bg-gradient-to-t from-white/5 to-transparent mt-4" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </article>
    );
};

export default DetailPage;
