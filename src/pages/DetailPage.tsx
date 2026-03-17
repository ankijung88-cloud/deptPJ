import React, { useEffect, useState } from 'react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Share2, X, Download, Loader2 } from 'lucide-react';
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
    const [downloading, setDownloading] = useState(false);

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

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-white bg-black">
                <Loader2 className="animate-spin text-[#00FFC2]" size={40} />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-white bg-black">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{t('common.item_not_found')}</h2>
                    <Link to="/" className="text-[#00FFC2] hover:underline">{t('common.back_home')}</Link>
                </div>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-black text-white">
            {/* Magazine Hero */}
            <div className="relative h-[80vh] w-full group overflow-hidden">
                <motion.div 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </motion.div>

                <div className="absolute inset-0 z-20 flex flex-col justify-end pb-20">
                    <div className="container mx-auto px-6">
                        <Link to="/" className="inline-flex items-center text-white/60 hover:text-[#00FFC2] mb-8 transition-colors">
                            <ArrowLeft size={20} className="mr-2" />
                            {t('common.back')}
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-4xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-4 py-1.5 rounded-full bg-[#00FFC2] text-black text-xs font-bold uppercase tracking-widest">
                                    {item.category}
                                </span>
                                {item.subcategory && (
                                    <span className="text-white/40 text-xs font-mono tracking-widest uppercase">
                                        / {item.subcategory}
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-5xl md:text-8xl font-serif font-black mb-8 leading-none tracking-tighter">
                                <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                            </h1>

                            <div className="flex flex-wrap gap-8 text-white/60 text-sm font-light">
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
                            <p className="text-2xl md:text-3xl leading-relaxed text-white/80 font-serif italic">
                                <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                            </p>
                        </section>

                        <div className="h-px w-full bg-white/5" />

                        <section className="prose prose-invert max-w-none">
                            <div className="text-lg leading-relaxed text-white/60 space-y-8 font-light">
                                <p>
                                    <AutoTranslatedText text="Explore the depths of traditional Korean aesthetics reimagined for the modern era. Handcrafted with precision and a deep respect for historical legacy, this piece represents more than just a functional object—it is a vessel of culture, carrying signatures of the past into the digital frontier." />
                                </p>
                                <p>
                                    <AutoTranslatedText text="Each element has been meticulously curated to provide an immersive experience that transcends simple viewing. We invite you to engage with the textures, the rhythms, and the silent stories embedded within the architecture of this presentation." />
                                </p>
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
                                    <button 
                                        onClick={handleShare}
                                        className="w-full py-4 bg-transparent border border-white/20 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                                    >
                                        <Share2 size={20} />
                                        <AutoTranslatedText text="Share Content" />
                                    </button>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-6 px-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Curated Category</span>
                                    <p className="text-white/80 font-medium tracking-wide"><AutoTranslatedText text={item.category} /></p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Platform ID</span>
                                    <p className="text-white/80 font-mono text-sm opacity-40">{item.id}</p>
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
                            className="relative bg-[#111] border border-white/10 w-full max-w-sm rounded-[2rem] p-8 space-y-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Share</h3>
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
                                    {copySuccess ? 'Copied!' : 'Copy Link'}
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
