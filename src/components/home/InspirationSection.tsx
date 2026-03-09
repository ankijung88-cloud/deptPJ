import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { SUPABASE_MEDIA_URL } from '../../lib/supabaseClient';

export const InspirationSection: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const videoScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const moonOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={sectionRef}
            id="inspiration-discovery"
            className="w-full bg-dancheong-deep-bg overflow-hidden relative py-48 md:py-64 flex flex-col items-center justify-center"
        >
            {/* Background Narrative Calligraphy (Vertical) - Dancheong Yellow (Hwahwang) */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="absolute right-[5%] top-0 h-full flex flex-col justify-around py-20 pointer-events-none z-0 hidden lg:flex"
            >
                {['영감의 원천', '시간의 흐름', '공간의 미학'].map((text, i) => (
                    <span key={i} className="text-dancheong-vibrant-yellow/10 text-[5vh] font-serif font-black tracking-[1.2em] whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                        <AutoTranslatedText text={text} />
                    </span>
                ))}
            </motion.div>

            {/* Lunar Video Portal (Moon Jar Masking) - Dancheong Blue (Samcheong) Glow */}
            <motion.div
                style={{ opacity: moonOpacity }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-0"
            >
                <motion.div
                    style={{ scale: videoScale, WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                    className="w-[85vw] h-[85vw] md:w-[60vh] md:h-[60vh] rounded-full overflow-hidden border-[12px] border-dancheong-gold/20 relative shadow-2xl"
                >
                    <video
                        className="w-full h-full object-cover rounded-full"
                        style={{ clipPath: 'circle(50% at 50% 50%)' }}
                        src={`${SUPABASE_MEDIA_URL}/video/nature_meditation.mp4`}
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dancheong-deep-bg via-transparent to-dancheong-deep-bg" />
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>
            </motion.div>

            {/* Central Spatial Glass Card */}
            <div className="max-w-6xl mx-auto py-32 md:py-48 px-8 relative z-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                >
                    <h2 className="text-[10vw] font-serif font-black text-dancheong-white leading-none tracking-tighter mb-24 flex flex-col items-center">
                        <span className="text-4xl md:text-6xl mb-12 opacity-80 italic font-light"><AutoTranslatedText text="여백은 비어있음이 아니라" /></span>
                        <AutoTranslatedText text="채워진 침묵입니다" />
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center justify-center pt-24 border-t-4 border-dancheong-border">
                        <div className="space-y-6 text-center md:text-left">
                            <span className="text-xs font-black tracking-[1em] text-white opacity-60 uppercase">Heritage</span>
                            <p className="text-2xl md:text-4xl text-dancheong-white font-black leading-tight tracking-tighter">
                                <AutoTranslatedText text="전통의 결을 살린" /><br />
                                <AutoTranslatedText text="현대적 해석" />
                            </p>
                        </div>
                        <div className="space-y-6 text-center md:text-right">
                            <span className="text-xs font-black tracking-[1em] text-white opacity-60 uppercase">Innovation</span>
                            <p className="text-2xl md:text-4xl text-dancheong-white font-black leading-tight tracking-tighter">
                                <AutoTranslatedText text="경계를 허무는" /><br />
                                <AutoTranslatedText text="기술적 예술성" />
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Background Narrative Calligraphy (Vertical Left) - Dancheong Green (Noirok) */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                transition={{ duration: 2 }}
                className="absolute left-[5%] bottom-0 h-full flex flex-col justify-around py-20 pointer-events-none z-0 hidden lg:flex"
            >
                {['침묵의 소리', '시간의 깊이', '본질의 발견'].map((text, i) => (
                    <span key={i} className="text-dancheong-green/5 text-[4vh] font-serif font-bold tracking-[0.5em] whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                        <AutoTranslatedText text={text} />
                    </span>
                ))}
            </motion.div>
        </section>
    );
};
