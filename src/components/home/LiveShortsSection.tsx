import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLiveShorts } from '../../api/media';
import { LiveShort } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Eye, MapPin, X, Play } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/free-mode';

const LiveShortItem: React.FC<{ item: LiveShort; index: number; onClick: () => void }> = ({ item, index, onClick }) => {
    const { i18n } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isHovered && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'AbortError') {
                        console.error('Auto-play failed', error);
                    }
                });
            }
        } else if (!isHovered && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // Reset video to start when not hovered
        }
    }, [isHovered]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="w-full aspect-[9/16] relative rounded-xl overflow-hidden group shadow-lg cursor-pointer bg-charcoal border border-white/5 mx-auto max-w-[320px] sm:max-w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Thumbnail Image */}
            <img
                src={item.thumbnailUrl}
                alt={getLocalizedText(item.title, i18n.language)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Video Element for Hover Play */}
            <video
                ref={videoRef}
                src={isHovered ? item.videoUrl : undefined}
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Play indicator icon to show it's a video */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play className="text-white fill-white ml-1" size={24} />
                </div>
            </div>

            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 z-10 pointer-events-none">
                <div className="flex items-center gap-1 text-white/70 text-[10px] md:text-xs mb-2 uppercase font-bold tracking-tighter bg-black/40 px-2 py-1 rounded-full w-fit backdrop-blur-sm">
                    <MapPin size={10} className="text-[#FF3D00]" />
                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                </div>
                <h4 className="text-white text-sm md:text-base font-bold leading-tight line-clamp-2 mb-2 break-words">
                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                </h4>
                <div className="flex items-center gap-1 text-[10px] md:text-xs text-white/60">
                    <Eye size={10} />
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
                    controls
                    className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
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
    const { t } = useTranslation();
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
        <section className="h-screen w-full snap-start bg-charcoal relative flex flex-col justify-center overflow-hidden py-16">
            <div className="container mx-auto px-6 mb-8 flex justify-between items-end shrink-0">
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
                        {t('shorts.title', '실시간 현장 쇼츠')}
                    </h3>
                </motion.div>
            </div>

            <div className="w-full pl-6 md:pl-12 lg:pl-24">
                <style>
                    {`
                    /* Wrapper와 Slide가 정확히 동일한 linear 속도로 움직여야 끊기는 역현상이 발생하지 않습니다 */
                    .smooth-swiper .swiper-wrapper,
                    .smooth-swiper .swiper-slide {
                        transition-timing-function: linear !important;
                    }
                    /* 개별 카드 투명도 조절 */
                    .smooth-swiper .swiper-slide {
                        opacity: 0.3;
                    }
                    .smooth-swiper .swiper-slide-next,
                    .smooth-swiper .swiper-slide-prev {
                        opacity: 0.7;
                    }
                    .smooth-swiper .swiper-slide-active {
                        opacity: 1;
                    }
                    `}
                </style>
                <Swiper
                    modules={[Autoplay, Navigation, Pagination, EffectCoverflow]}
                    effect="coverflow"
                    coverflowEffect={{
                        rotate: 35, // 둥글게 말리는 원형 회전 효과 강화
                        stretch: -20, // 카드를 모아 원기둥 형태 느낌 구성
                        depth: 400, // 깊이감을 늘려 완벽한 3D 형태로 구성
                        modifier: 1,
                        slideShadows: false, // 그림자 렌더링 연산 부하 및 잔상으로 인한 끊김 방지
                        scale: 0.85,
                    }}
                    spaceBetween={10}
                    slidesPerView={1.5}
                    centeredSlides={true}
                    loop={shorts.length >= 5}
                    speed={5000} // 일정하고 부드러운 속도
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true, // 호버 시 안정적인 정지
                    }}
                    breakpoints={{
                        480: { slidesPerView: 2.5 },
                        768: { slidesPerView: 3.5 },
                        1024: { slidesPerView: 5 }
                    }}
                    className="w-full pb-12 smooth-swiper"
                >
                    {/* 브라우저 디코더 한계 초과를 막기 위해 원본 배열만 렌더링 (Swiper Loop가 자동 복제 지원) */}
                    {shorts.map((item, index) => (
                        <SwiperSlide key={`${item.id}-${index}`}>
                            <LiveShortItem
                                item={item}
                                index={index}
                                onClick={() => setSelectedShort(item)}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
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
