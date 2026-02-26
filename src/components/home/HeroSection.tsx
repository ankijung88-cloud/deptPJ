import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloorGuideModal } from '../common/FloorGuideModal';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
    {
        id: 1,
        src: '/video/trend.mp4',
        poster: '',
        hasSound: false,
        titleKey: 'nav.trend',
        subKey: 'category.trend.description'
    },
    {
        id: 2,
        src: '/video/popup_store.mp4',
        poster: '',
        hasSound: true,
        titleKey: 'nav.store',
        subKey: 'category.community.description' // Or a better matching description
    },
    {
        id: 3,
        src: '/video/festival.mp4',
        poster: '',
        hasSound: false,
        titleKey: 'nav.tickets',
        subKey: 'category.tickets.description'
    },
    {
        id: 4,
        src: '/video/active.mp4',
        poster: '',
        hasSound: true,
        titleKey: 'nav.art',
        subKey: 'category.art.description'
    },
    {
        id: 5,
        src: '/video/travel.mp4',
        poster: '',
        hasSound: false,
        titleKey: 'nav.travel',
        subKey: 'category.travel.description'
    }
];

export const HeroSection: React.FC = () => {
    const { t } = useTranslation();
    const [isFloorGuideModalOpen, setIsFloorGuideModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleVideoPlayback = (swiper: any) => {
        if (!swiper || !swiper.el) return;

        // Sync local active index (realIndex accounts for loop)
        setActiveIndex(swiper.realIndex);

        // 모든 비디오 엘리먼트를 찾아서 정지 및 음소거
        const allVideos = swiper.el.querySelectorAll('video');
        allVideos.forEach((v: HTMLVideoElement) => {
            v.pause();
            v.muted = true;
        });

        // 현재 활성화된 슬라이드 내의 비디오만 재생
        const activeSlide = swiper.el.querySelector('.swiper-slide-active');
        if (!activeSlide) return;

        const activeVideo = activeSlide.querySelector('video') as HTMLVideoElement;
        if (activeVideo) {
            activeVideo.muted = activeVideo.dataset.hasSound !== 'true';
            const playPromise = activeVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.log("Autoplay prevented, retrying muted:", error);
                    activeVideo.muted = true;
                    activeVideo.play().catch(e => console.error("Final play attempt failed:", e));
                });
            }
        }
    };

    const currentSlide = slides[activeIndex];

    return (
        <section id="hero" className="relative h-screen w-full overflow-hidden bg-black snap-start">
            <style>{`
                .hero-pagination {
                    position: absolute !important;
                    bottom: 32px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: auto !important;
                    z-index: 50 !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                }
                .hero-pagination .swiper-pagination-bullet {
                    width: 12px;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.4);
                    opacity: 1;
                    transition: all 0.3s ease;
                    border-radius: 50%;
                    margin: 0 6px !important;
                    cursor: pointer;
                }
                .hero-pagination .swiper-pagination-bullet-active {
                    background: #ffffff;
                    transform: scale(1.3);
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
                }
                .hero-prev, .hero-next {
                    cursor: pointer !important;
                }
                .hero-prev.swiper-button-disabled, .hero-next.swiper-button-disabled {
                    opacity: 0.3;
                    cursor: not-allowed !important;
                    pointer-events: auto !important;
                }
            `}</style>

            {/* Swiper Container */}
            <div className="absolute inset-0 z-0">
                <Swiper
                    modules={[Navigation, Pagination, Keyboard]}
                    effect="slide"
                    slidesPerView={1}
                    loop={true}
                    speed={800}
                    allowTouchMove={true}
                    keyboard={{ enabled: true }}
                    navigation={{
                        prevEl: '.hero-prev',
                        nextEl: '.hero-next',
                    }}
                    pagination={{
                        el: '.hero-pagination',
                        clickable: true,
                        renderBullet: (index: number, className: string) => {
                            return `<button class="${className}" aria-label="${index + 1}번 슬라이드로 이동"></button>`;
                        }
                    }}
                    onSlideChangeTransitionEnd={handleVideoPlayback}
                    onSwiper={(swiper) => {
                        setTimeout(() => handleVideoPlayback(swiper), 300);
                    }}
                    className="w-full h-full"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">
                            <video
                                muted={!slide.hasSound}
                                data-has-sound={slide.hasSound}
                                playsInline
                                preload="auto"
                                loop
                                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 opacity-70"
                            >
                                <source src={slide.src} type="video/mp4" />
                            </video>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
            </div>

            {/* Content (Overlayed on top of Swiper) */}
            <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-center items-start pointer-events-none">
                <div className="pointer-events-auto h-[300px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="flex flex-col items-start"
                        >
                            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                                {t(currentSlide.titleKey)}
                            </h1>

                            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-light">
                                {t(currentSlide.subKey)}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        onClick={() => setIsFloorGuideModalOpen(true)}
                        className="bg-dancheong-red hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-medium flex items-center space-x-2 transition-colors shadow-lg w-fit"
                    >
                        <span>{t('hero.cta')}</span>
                        <ArrowRight size={20} />
                    </motion.button>
                </div>
            </div>

            {/* Custom Navigation Arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-between px-4 md:px-8 pointer-events-none">
                <button className="hero-prev pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white/70 hover:bg-black/50 hover:text-white transition-all backdrop-blur-sm" aria-label="이전 영상">
                    <ChevronLeft size={32} />
                </button>
                <button className="hero-next pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white/70 hover:bg-black/50 hover:text-white transition-all backdrop-blur-sm" aria-label="다음 영상">
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Custom Pagination Markers */}
            <div className="hero-pagination"></div>

            {/* Floor Guide Modal */}
            <FloorGuideModal isOpen={isFloorGuideModalOpen} onClose={() => setIsFloorGuideModalOpen(false)} />
        </section>
    );
};
