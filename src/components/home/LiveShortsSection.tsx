import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLiveShorts } from '../../api/media';
import { LiveShort } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Eye, MapPin, X, Play, Volume2, VolumeX } from 'lucide-react';

const LiveShortItem: React.FC<{
    item: LiveShort;
    index: number;
    isHovered: boolean;
    onHover: () => void;
    onClick: () => void;
    isMobile: boolean;
}> = ({ item, index, isHovered, onHover, onClick, isMobile }) => {
    const { i18n } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isHovered && videoRef.current) {
            videoRef.current.play().catch(error => console.error('Auto-play failed', error));
        } else if (!isHovered && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isHovered]);

    // Responsive Mosaic Patterns for Mobile
    const mobileMosaicClasses = [
        "col-span-1 aspect-[9/16]",
        "col-span-1 aspect-[9/16] translate-y-8",
        "col-span-1 aspect-[9/16] -translate-y-4",
    ];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                layout: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.6 },
                y: { duration: 0.8, delay: index * 0.05 }
            }}
            className={`relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden cursor-none border border-dancheong-border 
                transition-all duration-1000 ease-[cubic-bezier(0.2,1,0.2,1)] 
                ${isMobile
                    ? `${mobileMosaicClasses[index % 3]} w-full z-10`
                    : isHovered
                        ? 'flex-[10] shadow-[0_0_100px_rgba(139,58,54,0.15)] z-20 border-dancheong-red/30'
                        : 'flex-1 opacity-30 hover:opacity-100 z-10 scale-[0.98]'
                }
            `}
            onMouseEnter={!isMobile ? onHover : undefined}
            onClick={onClick}
        >
            {/* Thumbnail Image */}
            <img
                src={item.thumbnailUrl}
                alt={getLocalizedText(item.title, i18n.language)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Video Element for Hover Play */}
            <video
                ref={videoRef}
                src={item.videoUrl}
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] ${isHovered ? 'opacity-100 scale-105 blur-0' : 'opacity-0 scale-100 blur-xl'}`}
            />

            {/* Liquid Glow Border (Active/Hover) */}
            {isHovered && (
                <motion.div
                    layoutId="liquid-glow"
                    className="absolute inset-0 border-[1px] border-dancheong-red/20 rounded-[inherit] z-30 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}

            {/* Content Details */}
            <div className={`absolute inset-0 flex flex-col justify-end p-6 md:p-14 z-20 pointer-events-none transition-all duration-1000 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <div className="flex items-center gap-3 text-white text-[9px] md:text-xs mb-4 uppercase font-bold tracking-[0.4em] bg-dancheong-deep-bg/60 px-4 py-2 rounded-full w-fit backdrop-blur-3xl border border-dancheong-border">
                    <MapPin size={10} className="text-dancheong-teal/60" />
                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                </div>
                <h4 className="text-white text-xl md:text-5xl font-serif font-black leading-[0.9] tracking-tighter mb-4 max-w-[90%]">
                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                </h4>
                <div className="flex items-center gap-4 text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase">
                    <Eye size={12} className="text-dancheong-blue/60" />
                    <AutoTranslatedText text={`${item.viewCount.toLocaleString()} 시청 중`} />
                </div>
            </div>

            {/* Inactive State: Vertical Label (Desktop Only) */}
            {!isMobile && !isHovered && (
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-dancheong-deep-bg/40 backdrop-blur-sm flex items-center justify-center border border-dancheong-border mb-24 opacity-40">
                        <Play className="text-white fill-white/10" size={10} />
                    </div>
                    <div className="w-full text-center transform -rotate-90 origin-center text-white/30 font-bold tracking-[0.6em] text-[10px] uppercase whitespace-nowrap absolute">
                        <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const VideoModal: React.FC<{ item: LiveShort; onClose: () => void }> = ({ item, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const { i18n } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-dancheong-deep-bg/95 backdrop-blur-3xl p-4 md:p-12"
            onClick={onClose}
        >
            <motion.button
                onClick={onClose}
                className="absolute top-6 right-6 md:top-10 md:right-10 text-white/40 hover:text-white transition-all z-[110] bg-dancheong-deep-bg/40 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border border-dancheong-border"
                whileHover={{ scale: 1.1, rotate: 90 }}
            >
                <X size={24} />
            </motion.button>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[450px] aspect-[9/16] bg-dancheong-deep-bg rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] border border-dancheong-border"
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    ref={videoRef}
                    src={item.videoUrl}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-cover"
                />

                {/* Void Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dancheong-deep-bg via-transparent to-dancheong-deep-bg/40 pointer-events-none" />

                <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-dancheong-deep-bg/60 px-4 py-2 rounded-full border border-dancheong-border backdrop-blur-3xl">
                            <MapPin size={10} className="text-dancheong-teal/60" />
                            <span className="text-[9px] font-bold tracking-widest text-white uppercase">{getLocalizedText(item.location, i18n.language)}</span>
                        </div>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="w-10 h-10 rounded-full bg-dancheong-deep-bg/40 flex items-center justify-center text-white/40 hover:text-white transition-colors border border-dancheong-border"
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-white text-3xl md:text-5xl font-serif font-black leading-[0.85] tracking-tighter">
                            <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                        </h2>
                        <div className="flex items-center gap-3 text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase">
                            <Eye size={12} className="text-dancheong-blue/40" />
                            <AutoTranslatedText text={`${item.viewCount.toLocaleString()} 시청 중`} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const LiveShortsSection: React.FC = () => {
    const [shorts, setShorts] = useState<LiveShort[]>([]);
    const [selectedShort, setSelectedShort] = useState<LiveShort | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        getLiveShorts().then(data => {
            // Take 7 items for the best visual balance
            setShorts(data.slice(0, 7));
        }).catch(err => console.error(err));
    }, []);

    return (
        <section className="w-full bg-dancheong-deep-bg relative flex flex-col justify-center py-16 md:py-24 overflow-hidden">
            {/* Background Texture - Dancheong Gradient */}
            <div className="absolute inset-x-0 top-0 h-[50vh] bg-gradient-to-b from-dancheong-red/[0.03] to-transparent pointer-events-none" />

            <div className="lossless-layout relative z-20 mb-16 md:mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <motion.span
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-2 h-2 bg-dancheong-red/40 rounded-full"
                        />
                        <span className="text-[10px] font-bold tracking-[0.6em] text-white/40 uppercase"><AutoTranslatedText text="Live Resonance" /></span>
                    </div>
                    <h3 className="text-5xl md:text-9xl font-serif font-black text-white tracking-tighter leading-none">
                        <AutoTranslatedText text="본질의 찰나" />
                    </h3>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/30 text-xs md:text-sm font-light italic tracking-widest max-w-sm leading-relaxed"
                >
                    <AutoTranslatedText text="공간의 흐름 속에 각인된 짧은 기록들. 시선을 머물러 고요한 움직임을 체험하십시오." />
                </motion.p>
            </div>

            {/* Content Container */}
            <div className={`relative z-20 px-6 md:px-24 ${isMobile ? 'h-auto' : 'h-[65vh]'}`}>
                <motion.div
                    layout
                    className={`flex gap-4 md:gap-6 w-full ${isMobile ? 'grid grid-cols-2' : 'flex-row h-full'}`}
                    onMouseLeave={() => !isMobile && setHoveredIndex(0)}
                >
                    <AnimatePresence>
                        {shorts.map((item, index) => (
                            <LiveShortItem
                                key={item.id}
                                item={item}
                                index={index}
                                isMobile={isMobile}
                                isHovered={hoveredIndex === index}
                                onHover={() => setHoveredIndex(index)}
                                onClick={() => setSelectedShort(item)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Bottom Status Marker */}
            <div className="lossless-layout mt-16 md:mt-24 flex justify-between items-center z-20">
                <div className="flex items-center gap-6">
                    <div className="h-[1px] w-20 bg-dancheong-border" />
                    <span className="text-[10px] text-white/20 font-bold tracking-widest uppercase"><AutoTranslatedText text="Dept. Archive 2026" /></span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/50 font-bold tracking-widest uppercase"><AutoTranslatedText text="Scroll for Essence" /></span>
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-[1px] h-6 bg-dancheong-red/20"
                    />
                </div>
            </div>

            <AnimatePresence>
                {selectedShort && (
                    <VideoModal
                        item={selectedShort!}
                        onClose={() => setSelectedShort(null)}
                    />
                )}
            </AnimatePresence>

            {/* Ambient Aura - Heritage Tones */}
            <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-dancheong-green/5 rounded-full blur-[180px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[1000px] h-[1000px] bg-dancheong-red/5 rounded-full blur-[250px] pointer-events-none -z-10" />
        </section>
    );
};
