import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLiveShorts } from '../../api/media';
import { LiveShort } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Eye, MapPin, X, Play } from 'lucide-react';

const LiveShortItem: React.FC<{ item: LiveShort; index: number; isHovered: boolean; onHover: () => void; onClick: () => void }> = ({ item, index, isHovered, onHover, onClick }) => {
    const { i18n } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isHovered && videoRef.current) {
            videoRef.current.play().catch(error => console.error('Auto-play failed', error));
        } else if (!isHovered && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // Reset video to start when not hovered
        }
    }, [isHovered]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.8,
                delay: index * 0.1
            }}
            className={`relative h-full min-w-0 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border border-white/5 
                transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] origin-center
                ${isHovered ? 'flex-[6] sm:flex-[5] lg:flex-[6] shadow-[0_0_50px_rgba(255,61,0,0.15)] z-10' : 'flex-1 opacity-70 hover:opacity-100 z-0'}
            `}
            onMouseEnter={onHover}
            onClick={onClick}
        >
            {/* Thumbnail Image */}
            <img
                src={item.thumbnailUrl}
                alt={getLocalizedText(item.title, i18n.language)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Video Element for Hover Play */}
            <video
                ref={videoRef}
                src={item.videoUrl}
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
            />

            <div className={`absolute inset-0 transition-all duration-700 ${isHovered ? 'bg-gradient-to-t from-black/90 via-black/20 to-transparent' : 'bg-black/40'}`} />

            {/* Content Details - Only fully visible when hovered */}
            <div className={`absolute inset-0 flex flex-col justify-end p-4 md:p-10 z-20 pointer-events-none transition-all duration-700 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="flex items-center gap-2 text-white/90 text-[10px] md:text-sm mb-2 md:mb-4 uppercase font-bold tracking-[0.2em] bg-black/40 px-3 md:px-4 py-1.5 md:py-2 rounded-full w-fit backdrop-blur-md border border-white/10 shadow-xl">
                    <MapPin size={12} className="text-dancheong-red" />
                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                </div>
                <h4 className="text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight line-clamp-2 mb-2 md:mb-4 drop-shadow-lg max-w-[95%]">
                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                </h4>
                <div className="flex items-center gap-2 text-[10px] md:text-sm text-white/50 font-medium tracking-widest hidden sm:flex">
                    <Eye size={14} className="text-white/40" />
                    {item.viewCount.toLocaleString()} VIEWS
                </div>
            </div>

            {/* Unhovered state icon & small title */}
            <div className={`absolute inset-0 flex flex-col justify-end items-center pb-8 md:pb-10 transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg mb-0 md:mb-6">
                    <Play className="text-white fill-white ml-0.5 md:ml-1 opacity-50" size={14} />
                </div>
                <div className="hidden sm:block w-full truncate px-4 text-center transform -rotate-90 origin-center text-white/60 font-bold tracking-widest text-xs lg:text-sm uppercase whitespace-nowrap absolute top-1/2 -translate-y-1/2">
                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-[101]"
            >
                <X size={32} />
            </button>

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.5, type: "spring", damping: 25 }}
                className="relative w-full max-w-[450px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    ref={videoRef}
                    src={item.videoUrl}
                    autoPlay
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
                    <div className="flex items-center gap-2 text-[#FF3D00] text-xs font-bold uppercase tracking-widest mb-3 bg-black/50 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <MapPin size={12} />
                        <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                    </div>
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-4 drop-shadow-lg">
                        <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                    </h2>
                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium tracking-wider">
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
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(7);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            let newItems = 7; // Desktop
            if (width < 640) newItems = 3;      // Mobile
            else if (width < 1024) newItems = 5; // Tablet

            setItemsPerPage(prev => {
                if (prev !== newItems) {
                    setCurrentPage(0); // Viewport 변경 시 페이지 초기화
                    setHoveredIndex(0); // 포커스 초기화
                    return newItems;
                }
                return prev;
            });
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let mounted = true;
        const fetchShorts = async () => {
            try {
                const data = await getLiveShorts();
                if (mounted) {
                    let displayData = [...data];
                    // 테스트 용도로 데이터가 부족할 경우 의도적으로 10개 이상으로 복제
                    if (displayData.length > 0 && displayData.length < 15) {
                        while (displayData.length < 15) {
                            displayData.push(data[displayData.length % data.length]);
                        }
                    }
                    setShorts(displayData);
                    setHoveredIndex(0); // 첫 번째 카드를 기본 포커스로 설정
                }
            } catch (error) {
                console.error("Failed to fetch live shorts", error);
            }
        };
        fetchShorts();
        return () => {
            mounted = false;
        };
    }, []);

    const totalPages = Math.ceil(shorts.length / itemsPerPage);
    const currentShorts = shorts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handleCardClick = (item: LiveShort, index: number) => {
        // 모바일/터치 환경: 클릭(터치) 시 현재 아이템이 활성화(팽창)되어 있지 않다면 먼저 팽창시키고, 이미 팽창된 상태에서 클릭하면 모달 오픈
        if (hoveredIndex === index) {
            setSelectedShort(item);
        } else {
            setHoveredIndex(index);
        }
    };

    return (
        <section className="h-[100dvh] min-h-[500px] w-full snap-start bg-black relative flex flex-col justify-center py-6 sm:py-10 md:py-20 lg:py-24 overflow-hidden">
            <div className="container mx-auto px-6 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 z-20">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 bg-[#FF3D00] rounded-full animate-ping" />
                        <h2 className="text-sm font-bold tracking-[0.3em] text-[#FF3D00] uppercase">
                            Instant Live
                        </h2>
                    </div>
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight">
                        <AutoTranslatedText text="실시간 현장 쇼츠" />
                    </h3>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-white/40 text-sm md:text-base font-light mt-4 sm:mt-0 tracking-widest hidden sm:block pr-6 lg:pr-12"
                >
                    마우스를 올려 생생한 현장을 확인하세요
                </motion.p>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-20 px-6 md:px-12 lg:px-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage} /* 페이지가 바뀔 때마다 트리거 */
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-row h-full gap-2 md:gap-4 lg:gap-6 w-full"
                        onMouseLeave={() => setHoveredIndex(0)}
                    >
                        {currentShorts.map((item, index) => (
                            <LiveShortItem
                                key={`${item.id}-${currentPage}-${index}`}
                                item={item}
                                index={index}
                                isHovered={hoveredIndex === index}
                                onHover={() => setHoveredIndex(index)}
                                onClick={() => handleCardClick(item, index)}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="container mx-auto px-6 mt-8 flex justify-center items-center gap-3 z-20">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrentPage(idx);
                                setHoveredIndex(0); // 페이지 변경 시 포커스 초기화
                            }}
                            className={`transition-all duration-300 rounded-full ${currentPage === idx
                                ? 'w-10 h-2 bg-[#FF3D00] shadow-[0_0_10px_rgba(255,61,0,0.5)]'
                                : 'w-2 h-2 bg-white/20 hover:bg-white/50'
                                }`}
                            aria-label={`Go to page ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedShort && (
                    <VideoModal
                        item={selectedShort}
                        onClose={() => setSelectedShort(null)}
                    />
                )}
            </AnimatePresence>

            {/* Ambient Lighting Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0" />
        </section>
    );
};
