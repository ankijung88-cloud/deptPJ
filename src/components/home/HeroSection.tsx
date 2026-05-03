import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroImage {
    id: number;
    image_url: string;
    display_order: number;
}

export const HeroSection: React.FC = () => {
    const [images, setImages] = useState<HeroImage[]>([
        { id: 1, image_url: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2560&auto=format&fit=crop', display_order: 0 },
        { id: 2, image_url: 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=2560&auto=format&fit=crop', display_order: 1 }
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right

    const normalizeUrl = (url: string | null | undefined): string => {
        if (!url) return '';
        // If it's already a full URL (including http/https), return as is
        if (url.startsWith('http')) return url;
        // If it starts with /uploads, it will be proxied by Vercel
        if (url.startsWith('/uploads')) return url;
        // Fallback for paths that might missing the leading slash
        if (url.startsWith('uploads')) return '/' + url;
        return url;
    };

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch('/api/hero');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setImages(data.map((img: any) => ({
                            ...img,
                            image_url: normalizeUrl(img.image_url)
                        })));
                    } else {
                        // Fallback images if API returns empty but OK
                        setImages([
                            { id: 1, image_url: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2560&auto=format&fit=crop', display_order: 0 },
                            { id: 2, image_url: 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=2560&auto=format&fit=crop', display_order: 1 }
                        ]);
                    }
                }
            } catch (error) {
                console.error('Error fetching hero images:', error);
                // Hardcoded fallback on error
                setImages([
                    { id: 1, image_url: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2560&auto=format&fit=crop', display_order: 0 }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchImages();
    }, []);

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prevIndex) => {
            let nextIndex = prevIndex + newDirection;
            if (nextIndex < 0) nextIndex = images.length - 1;
            if (nextIndex >= images.length) nextIndex = 0;
            return nextIndex;
        });
    };

    // Auto slide logic
    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(() => {
            paginate(1);
        }, 5000);
        return () => clearInterval(timer);
    }, [images, currentIndex]); // Reset timer on manual navigation

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    if (isLoading) {
        return (
            <section id="hero" className="relative h-[30vh] sm:h-screen w-full bg-dancheong-ivory animate-pulse" />
        );
    }

    if (images.length === 0) {
        return (
            <section id="hero" className="relative h-[30vh] sm:h-screen w-full flex items-center justify-center bg-dancheong-ivory">
                <div className="text-dancheong-ink/30 font-serif text-xl italic">
                    Ready for your promotional stories...
                </div>
            </section>
        );
    }

    return (
        <section id="hero" className="relative h-[40vh] sm:h-screen w-full overflow-hidden bg-white group/hero">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "tween", duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 1.4 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                >
                    {/* Background Image with Zoom Effect */}
                    <motion.div 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <img
                            src={images[currentIndex].image_url}
                            alt={`Promotion ${currentIndex + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                        />
                    </motion.div>

                    {/* Sophisticated Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-dancheong-ink/40 via-transparent to-transparent z-[2]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 z-[2]" />
                    
                    {/* Editorial Content Overlay */}
                    <div className="absolute inset-0 z-[10] flex items-center">
                        <div className="container mx-auto px-6 sm:px-12 lg:px-24">
                            <div className="max-w-4xl">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 1.2 }}
                                    className="flex flex-col gap-4 sm:gap-8"
                                >
                                    {/* Upper Branding */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-[1.5px] bg-white/60"></div>
                                        <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] text-white/80 uppercase">
                                            The New Narrative
                                        </span>
                                    </div>

                                    {/* Main Title - Serif & Bold */}
                                    <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-[10rem] font-serif font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl">
                                        Pure <br /> 
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Essence.</span>
                                    </h1>

                                    {/* Descriptive Subtext */}
                                    <p className="text-sm sm:text-xl md:text-2xl text-white/70 max-w-xl font-medium leading-tight italic">
                                        당신의 본연의 아름다움을 깨우는 <br className="hidden sm:block" />
                                        가장 순수하고 깊은 층별 큐레이션
                                    </p>

                                    {/* Call to Action Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-fit mt-4 sm:mt-8 px-8 sm:px-12 py-4 sm:py-6 bg-white text-dancheong-ink rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] hover:bg-dancheong-mugwort hover:text-white transition-all duration-500 shadow-2xl"
                                    >
                                        Explore Collection
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Minimalist */}
            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full border border-white/10 text-white/30 hover:text-white hover:bg-white/10 transition-all hidden sm:flex items-center justify-center opacity-0 group-hover/hero:opacity-100"
                        onClick={() => paginate(-1)}
                    >
                        <ChevronLeft size={24} strokeWidth={1.5} />
                    </button>
                    <button
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full border border-white/10 text-white/30 hover:text-white hover:bg-white/10 transition-all hidden sm:flex items-center justify-center opacity-0 group-hover/hero:opacity-100"
                        onClick={() => paginate(1)}
                    >
                        <ChevronRight size={24} strokeWidth={1.5} />
                    </button>
                </>
            )}

            {/* Pagination & Status */}
            <div className="absolute bottom-8 sm:bottom-16 left-6 sm:left-24 z-30 flex items-end gap-12">
                {/* Slender Dots */}
                <div className="flex items-center gap-4">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            className="group relative py-4"
                        >
                            <div className={`h-[1px] transition-all duration-700 ease-out ${
                                currentIndex === idx 
                                    ? 'bg-white w-12 sm:w-16' 
                                    : 'bg-white/20 w-4 sm:w-6 group-hover:bg-white/40'
                            }`} />
                        </button>
                    ))}
                </div>

                {/* Counter */}
                <div className="hidden md:block mb-4">
                    <span className="text-white/80 font-serif italic text-2xl">
                        {String(currentIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="mx-3 text-white/20 text-xs">/</span>
                    <span className="text-white/30 text-xs">
                        {String(images.length).padStart(2, '0')}
                    </span>
                </div>
            </div>
        </section>
    );
};
