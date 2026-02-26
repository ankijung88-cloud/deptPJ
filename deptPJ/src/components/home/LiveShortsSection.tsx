import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getLiveShorts } from '../../api/media';
import { LiveShort } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Eye, MapPin, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const LiveShortItem: React.FC<{ item: LiveShort; index: number; onClick: () => void }> = ({ item, index, onClick }) => {
    const { i18n } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="w-full aspect-square relative rounded-xl overflow-hidden group shadow-lg cursor-pointer bg-charcoal border border-white/5"
            onClick={onClick}
        >
            <img
                src={item.thumbnailUrl}
                alt={getLocalizedText(item.title, i18n.language)}
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute inset-0 flex flex-col justify-end p-3">
                <div className="flex items-center gap-1 text-white/50 text-[8px] mb-1 uppercase font-bold tracking-tighter">
                    <MapPin size={8} className="text-[#FF3D00]" />
                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                </div>
                <h4 className="text-white text-xs font-bold leading-tight line-clamp-1 mb-1">
                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                </h4>
                <div className="flex items-center gap-1 text-[8px] text-white/60">
                    <Eye size={8} />
                    {item.viewCount.toLocaleString()}
                </div>
            </div>
        </motion.div>
    );
};

const VideoModal: React.FC<{ item: LiveShort; onClose: () => void }> = ({ item, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { i18n } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-[101]"
            >
                <X size={32} />
            </button>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-[450px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    ref={videoRef}
                    src={item.videoUrl}
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-2 text-[#FF3D00] text-xs font-bold uppercase tracking-widest mb-3">
                        <MapPin size={12} />
                        <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                    </div>
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                        <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                    </h2>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Eye size={14} />
                        {item.viewCount.toLocaleString()} views
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const LiveShortsSection: React.FC = () => {
    const [shorts, setShorts] = useState<LiveShort[]>([]);
    const [selectedShort, setSelectedShort] = useState<LiveShort | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchShorts = async () => {
            try {
                const data = await getLiveShorts();
                if (mounted) setShorts(data);
            } catch (error) {
                console.error("Failed to fetch live shorts", error);
            }
        };
        fetchShorts();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <section className="min-h-screen w-full snap-start bg-black relative flex flex-col justify-center overflow-hidden pt-28 pb-12">
            <div className="container mx-auto px-6 mb-8 lg:mb-12 flex justify-between items-end shrink-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm font-bold tracking-widest text-[#FF3D00] mb-3 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#FF3D00] rounded-full animate-ping" />
                        Instant Live
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                        <AutoTranslatedText text="실시간 현장 쇼츠" />
                    </h3>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 h-auto md:h-[65vh] flex items-center">
                <div className="grid grid-cols-2 grid-rows-5 md:grid-cols-5 md:grid-rows-2 gap-4 md:gap-8 w-full">
                    {shorts.slice(0, 10).map((item, index) => (
                        <LiveShortItem
                            key={item.id}
                            item={item}
                            index={index}
                            onClick={() => setSelectedShort(item)}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedShort && (
                    <VideoModal
                        item={selectedShort}
                        onClose={() => setSelectedShort(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};
