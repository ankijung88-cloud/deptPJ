import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroImage {
    id: number;
    image_url: string;
    display_order: number;
}

export const HeroSection: React.FC = () => {
    const [images, setImages] = useState<HeroImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch('/api/hero');
                if (response.ok) {
                    const data = await response.json();
                    setImages(data);
                }
            } catch (error) {
                console.error('Error fetching hero images:', error);
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
        <section id="hero" className="relative h-[30vh] sm:h-screen w-full overflow-hidden bg-dancheong-ivory group/hero">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "tween", duration: 1.5, ease: [0.25, 1, 0.5, 1] },
                        opacity: { duration: 1.2, ease: "easeInOut" }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(_, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        if (swipe < -10000) {
                            paginate(1);
                        } else if (swipe > 10000) {
                            paginate(-1);
                        }
                    }}
                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                >
                    <img
                        src={images[currentIndex].image_url}
                        alt={`Promotion ${currentIndex + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Desktop Only */}
            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/10 hover:bg-black/30 text-white transition-all hidden sm:flex items-center justify-center opacity-0 group-hover/hero:opacity-100"
                        onClick={() => paginate(-1)}
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/10 hover:bg-black/30 text-white transition-all hidden sm:flex items-center justify-center opacity-0 group-hover/hero:opacity-100"
                        onClick={() => paginate(1)}
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            {/* Dots Pagination */}
            {images.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            className="group relative py-2"
                            aria-label={`Go to slide ${idx + 1}`}
                        >
                            <div className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ease-out ${
                                currentIndex === idx 
                                    ? 'bg-white w-6 sm:w-8 shadow-lg' 
                                    : 'bg-white/40 w-1 sm:w-1.5 group-hover:bg-white/60'
                            }`} />
                        </button>
                    ))}
                </div>
            )}

            {/* Slide Counter - Subtle */}
            <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 z-30 hidden sm:block">
                <div className="text-white/80 font-serif text-[10px] sm:text-sm tracking-widest bg-black/20 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-white/10">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                </div>
            </div>
        </section>
    );
};
