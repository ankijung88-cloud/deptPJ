import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

export const AboutSection: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const SUPABASE_MEDIA_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/dept-media`;

    return (
        <section className="h-screen w-full snap-start bg-black overflow-hidden flex flex-col justify-center relative">
            {/* Background Narrative Typography */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center pointer-events-none opacity-[0.03] select-none">
                <span className="text-[25vw] font-serif font-bold whitespace-nowrap leading-none tracking-tighter text-white">
                    HERITAGE
                </span>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

                    {/* Media Layer Group (Left) */}
                    <div className="w-full lg:w-3/5 relative min-h-[400px] md:min-h-[500px]">
                        {/* Main Media Layer */}
                        <motion.div
                            initial={{ opacity: 0, x: -60, y: 20 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative z-20 w-4/5 aspect-[16/10] rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] group border border-white/10"
                        >
                            <video
                                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                                src={`${SUPABASE_MEDIA_URL}/video/k-culture.mp4`}
                                autoPlay
                                muted
                                loop
                                playsInline
                            ></video>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
                        </motion.div>

                        {/* Secondary Design Elements (Overlapping) */}
                        <motion.div
                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                            className="absolute -bottom-8 right-0 md:right-10 z-30 w-1/2 aspect-square rounded-2xl overflow-hidden border border-dancheong-red/20 shadow-2xl backdrop-blur-sm shadow-dancheong-red/10"
                        >
                            <video
                                className="w-full h-full object-cover opacity-80"
                                src={`${SUPABASE_MEDIA_URL}/video/modern_tradition.mp4`}
                                autoPlay
                                muted
                                loop
                                playsInline
                            ></video>
                            <div className="absolute inset-0 bg-dancheong-red/10 mix-blend-overlay" />
                        </motion.div>

                        {/* Floating Decorative Box */}
                        <motion.div
                            initial={{ opacity: 0, y: -40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="absolute -top-10 left-20 w-32 h-32 bg-dancheong-green/10 -z-10 rounded-full blur-3xl"
                        ></motion.div>
                    </div>

                    {/* Content Layer (Right) */}
                    <div className="w-full lg:w-2/5 lg:-ml-20 relative z-40">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-charcoal/40 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-3xl shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-8 h-[1px] bg-dancheong-red"></span>
                                <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] text-dancheong-red uppercase">
                                    Identity & Heritage
                                </h2>
                            </div>

                            <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                                {t('about.title')}
                            </h3>

                            <div className="space-y-6 text-base md:text-lg text-white/60 font-light leading-relaxed">
                                <p className="relative">
                                    <span className="absolute -left-6 top-0 text-3xl font-serif text-dancheong-red/30">"</span>
                                    {t('about.description1')}
                                </p>
                                <p>
                                    {t('about.description2')}
                                </p>
                            </div>

                            <div className="mt-12 group">
                                <button
                                    onClick={() => navigate('/about')}
                                    className="relative flex items-center space-x-4 bg-white/5 hover:bg-dancheong-red text-white py-4 px-8 rounded-full overflow-hidden transition-all duration-500 shadow-xl"
                                >
                                    <span className="font-medium tracking-wider">{t('about.cta')}</span>
                                    <div className="w-8 h-8 rounded-full bg-dancheong-red group-hover:bg-white flex items-center justify-center transition-colors duration-500">
                                        <ArrowUpRight className="text-white group-hover:text-dancheong-red" size={18} />
                                    </div>
                                    {/* Liquid Background Hover Effect */}
                                    <div className="absolute inset-0 bg-dancheong-red -z-10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                                </button>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* Corner Decorative Element */}
            <div className="absolute right-0 bottom-0 opacity-10">
                <div className="w-64 h-64 bg-dancheong-red rounded-tl-full blur-[100px]" />
            </div>
        </section>
    );
};
