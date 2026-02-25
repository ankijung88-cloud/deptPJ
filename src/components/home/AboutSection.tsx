import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AboutSection: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <section className="h-screen w-full snap-start bg-charcoal overflow-hidden flex flex-col justify-center">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2"
                    >
                        <div className="relative">
                            <div className="relative aspect-video w-full rounded-lg shadow-2xl overflow-hidden group">
                                <iframe
                                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                                    src="./video/caravan_trip.mp4"
                                    title="Traditional Korean Aesthetic Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                                {/* Overlay to prevent interaction if desired, or allow it. Currently allowing interaction but adding a subtle overlay for consistent look until hovered? No, let's keep it clean. */}
                                <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-2/3 h-2/3 bg-dancheong-green/10 -z-10 rounded-lg"></div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2"
                    >
                        <h2 className="text-sm font-bold tracking-widest text-dancheong-green mb-4 uppercase">Heritage Hub</h2>
                        <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                            {t('about.title')}
                        </h3>
                        <div className="space-y-6 text-lg text-white/70 font-light leading-relaxed">
                            <p>
                                {t('about.description1')}
                            </p>
                            <p>
                                {t('about.description2')}
                            </p>
                        </div>

                        <div className="mt-12">
                            <button
                                onClick={() => navigate('/about')}
                                className="text-dancheong-green hover:text-white border border-dancheong-green hover:bg-dancheong-green px-8 py-3 rounded-none transition-all duration-300"
                            >
                                {t('about.cta')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
