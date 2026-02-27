import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Play } from 'lucide-react';

export const AboutSection: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section ref={sectionRef} className="relative w-full h-[100dvh] snap-start bg-[#1a1a1a] overflow-hidden flex items-center justify-center">
            {/* Subtle Background Styling */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03)_0%,transparent_100%)]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 w-full h-full flex flex-col justify-center gap-6 lg:gap-10 pt-20 pb-8">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 w-full justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:w-5/12 shrink-0"
                    >
                        <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] text-dancheong-red mb-4 uppercase flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-dancheong-red inline-block"></span>
                            Brand Concept
                        </h2>

                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-[1.3]">
                            {t('about.title', '일상에 스며드는\n감각적 영감').split('\n').map((line, idx) => (
                                <React.Fragment key={idx}>
                                    {idx === 1 ? <span className="text-white block mt-2">{line}</span> : line}
                                </React.Fragment>
                            ))}
                        </h3>

                        <div className="space-y-4 text-base lg:text-lg text-white/60 font-light leading-relaxed mb-8 flex flex-col gap-1">
                            <p className="border-l-2 border-white/20 pl-4">
                                {t('about.description1', 'DEPARTMENT은 한국의 다채로운 매력과 글로벌 K-트렌드를 한곳에 모은 프리미엄 컬처 스토어입니다.')}
                            </p>
                            <p className="border-l-2 border-white/20 pl-4">
                                {t('about.description2', '물건이 아닌 영감을 큐레이션하며, 층마다 새롭게 펼쳐지는 당신만의 문화적 취향을 발견해 보세요.')}
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/about')}
                            className="group inline-flex items-center justify-center space-x-3 text-white border border-white/30 hover:bg-white hover:text-black hover:border-white px-6 py-3 lg:px-8 lg:py-4 rounded-full transition-all duration-300 backdrop-blur-md shadow-lg"
                        >
                            <span className="font-medium tracking-wide">{t('about.cta', '공간 안내 보기')}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    {/* Right: Video & Design Elements */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 50, scale: 0.95 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="lg:w-7/12 relative w-full"
                    >
                        {/* Decorative Background Accents */}
                        <div className="absolute -top-16 -right-16 w-72 h-72 bg-dancheong-red/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
                        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-dancheong-green/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

                        {/* Video Container Frame */}
                        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-black/50 backdrop-blur-sm z-10 p-2 lg:p-3">
                            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner">
                                <video
                                    src="/video/caravan_trip.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[1.5s] ease-out"
                                />

                                {/* Overlay Gradient for Premium Feel */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-black/20 pointer-events-none" />

                                {/* Subtle Play Indicator in Corner */}
                                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
