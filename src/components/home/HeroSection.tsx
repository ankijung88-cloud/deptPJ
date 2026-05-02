import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroImage {
    id: number;
    image_url: string;
    display_order: number;
}

export const HeroSection: React.FC = () => {
    const [images, setImages] = useState<HeroImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

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

    // Auto slide logic
    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images]);

    if (isLoading) {
        return (
            <section id="hero" className="relative h-[25vh] sm:h-screen w-full bg-dancheong-ivory animate-pulse" />
        );
    }

    // Fallback if no images are registered
    if (images.length === 0) {
        return (
            <section id="hero" className="relative h-[25vh] sm:h-screen w-full flex items-center justify-center bg-dancheong-ivory">
                <div className="text-dancheong-ink/30 font-serif text-xl italic">
                    Ready for your promotional stories...
                </div>
            </section>
        );
    }

    return (
        <section id="hero" className="relative h-[25vh] sm:h-screen w-full overflow-hidden bg-dancheong-ivory">
            <AnimatePresence mode="wait">
                <motion.div
                    key={images[currentIndex].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={images[currentIndex].image_url}
                        alt={`Promotion ${currentIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                    {/* Subtle Overlay for better aesthetics */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Dots Pagination */}
            {images.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
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
