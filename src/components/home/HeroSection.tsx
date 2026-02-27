import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloorGuideModal } from '../common/FloorGuideModal';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
    { id: 1, src: '/video/trend.mp4', poster: '', hasSound: true, category: '트렌드' },
    { id: 2, src: '/video/popup_store.mp4', poster: '', hasSound: true, category: '팝업' },
    { id: 3, src: '/video/festival.mp4', poster: '', hasSound: true, category: '공연/전시' },
    { id: 4, src: '/video/experience.mp4', poster: '', hasSound: true, category: '활동/스타일' },
    { id: 5, src: '/video/travel.mp4', poster: '', hasSound: true, category: '로컬' }
];

export const HeroSection: React.FC = () => {
    const { t } = useTranslation();
    const [isFloorGuideModalOpen, setIsFloorGuideModalOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const handleVideoPlayback = (swiper: any) => {
        if (!swiper || !swiper.el) return;
        
        // 1. 모든 비디오를 일시 중지하고 무음 모드로 전환하여 무분별한 런타임 리소스 해제
        const allVideos = swiper.el.querySelectorAll('video');
        allVideos.forEach((v: HTMLVideoElement) => {
            v.pause();
            v.muted = true;
        });

        // 2. 현재 활성화된 슬라이드를 타켓팅 (정확한 Swiper 루프 돔)
        const activeSlide = swiper.el.querySelector('.swiper-slide-active');
        if (!activeSlide) return;

        const activeVideo = activeSlide.querySelector('video') as HTMLVideoElement;
        if (activeVideo) {
            // Header.tsx에서 세팅한 전역 음소거 상태(window.__GLOBAL_MUTED__) 연동
            const isMutedGlobally = typeof window !== 'undefined' ? (window as any).__GLOBAL_MUTED__ : true;
            activeVideo.muted = isMutedGlobally || activeVideo.dataset.hasSound !== 'true';

            // 안정적 재생 시도
            const playPromise = activeVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error("Autoplay prevented:", error);
                    activeVideo.muted = true; // 강제 무음 후 재시도
                    activeVideo.play().catch(e => console.error("Final play attempt failed:", e));
                });
            }
        }
    };

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
                /* Swiper Navigation Button States */
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
                    onSlideChange={(swiper) => {
                        setActiveIndex(swiper.realIndex);
                        // 슬라이드 전환 직후 즉시 재생 시도
                        handleVideoPlayback(swiper);
                        // 전환 애니메이션이 끝난 후에도 한번 더 재생 보장 (loop 복제 슬라이드 대응)
                        setTimeout(() => handleVideoPlayback(swiper), 100);
                        setTimeout(() => handleVideoPlayback(swiper), 900);
                    }}
                    onSwiper={(swiper) => {
                        // 초기 로딩 시 첫 번째 비디오 재생 보장
                        setTimeout(() => handleVideoPlayback(swiper), 300);
                        setTimeout(() => handleVideoPlayback(swiper), 1000);
                    }}
                    className="w-full h-full"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">
                            <video
                                muted={true}
                                playsInline={true}
                                autoPlay={true}
                                data-has-sound={slide.hasSound}
                                preload="auto" // 브라우저가 새 영상(4,5번)을 캐싱하지 않아 검은 화면에서 멈추는 오류 방지
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
                <div className="pointer-events-auto">
                    <motion.h1
                        key={activeIndex} // 리렌더링 시 애니메이션 재실행
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight"
                    >
                        {slides[activeIndex].category}
                    </motion.h1>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        onClick={() => setIsFloorGuideModalOpen(true)}
                        className="bg-dancheong-red hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-medium flex items-center space-x-2 transition-colors shadow-lg"
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
