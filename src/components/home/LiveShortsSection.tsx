import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LIVE_SHORTS } from '../../data/mockData';
import { LiveShort } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Play, Pause, Eye, MapPin } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const LiveShortItem: React.FC<{ item: LiveShort; index: number }> = ({ item, index }) => {
    const { i18n } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-full aspect-[9/16] relative rounded-2xl overflow-hidden group shadow-2xl cursor-pointer"
            onClick={togglePlay}
        >
            {/* Video Player */}
            <video
                ref={videoRef}
                src={item.videoUrl}
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

            <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                    <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white flex items-center gap-1">
                        <Eye size={10} />
                        {item.viewCount.toLocaleString()}
                    </div>
                    {/* Play/Pause Button Indicator */}
                    <div className="p-2 bg-white/20 backdrop-blur-xl rounded-full text-white transition-opacity duration-300">
                        {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-1.5 text-white/50 text-[10px] mb-2 uppercase font-bold tracking-widest">
                        <MapPin size={10} className="text-[#FF3D00]" />
                        <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                    </div>
                    <h4 className="text-white text-lg font-bold leading-tight line-clamp-2">
                        <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                    </h4>
                </div>
            </div>
        </motion.div>
    );
};

export const LiveShortsSection: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <section className="h-screen w-full snap-start bg-black relative flex flex-col justify-center overflow-hidden pt-28 pb-8">
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

            <div className={`w-full px-6 py-4 cursor-grab active:cursor-grabbing ${isMobile ? 'h-[70vh]' : ''}`}>
                <Swiper
                    direction={isMobile ? 'vertical' : 'horizontal'}
                    modules={[FreeMode, Mousewheel]}
                    freeMode={true}
                    mousewheel={{ forceToAxis: true }}
                    spaceBetween={isMobile ? 12 : 16}
                    slidesPerView={isMobile ? 1.5 : 1.2}
                    breakpoints={{
                        640: { slidesPerView: 2.2, spaceBetween: 24, direction: 'horizontal' },
                        1024: { slidesPerView: 3.5, spaceBetween: 24, direction: 'horizontal' },
                        1280: { slidesPerView: 4.5, spaceBetween: 24, direction: 'horizontal' }
                    }}
                    className={`w-full ${isMobile ? 'h-full' : ''}`}
                >
                    {LIVE_SHORTS.map((item, index) => (
                        <SwiperSlide key={item.id} className={isMobile ? '!h-auto' : ''}>
                            <LiveShortItem item={item} index={index} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};
