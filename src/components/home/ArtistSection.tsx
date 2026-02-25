import React from 'react';
import { motion } from 'framer-motion';
import { ARTISTS_OF_THE_YEAR } from '../../data/mockData';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const ArtistSection: React.FC = () => {
    const { i18n } = useTranslation();

    return (
        <section className="h-screen w-full snap-start bg-black relative flex flex-col justify-center overflow-hidden">
            <div className="container mx-auto px-6 mb-12 flex justify-between items-end">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl"
                >
                    <h2 className="text-sm font-bold tracking-widest text-dancheong-red mb-3 uppercase">Creative Visionaries</h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                        <AutoTranslatedText text="올해의 아티스트 10인" />
                    </h3>
                </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 h-[70vh] w-full px-4 gap-4">
                {ARTISTS_OF_THE_YEAR.map((artist, index) => (
                    <motion.div
                        key={artist.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group overflow-hidden rounded-xl bg-charcoal border border-white/5"
                    >
                        <img
                            src={artist.imageUrl}
                            alt={getLocalizedText(artist.name, i18n.language)}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                        {/* Info (Glassmorphism) */}
                        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="backdrop-blur-md bg-white/10 border border-white/10 p-4 rounded-lg">
                                <span className="text-[10px] text-dancheong-red font-bold uppercase tracking-tighter mb-1 block">
                                    <AutoTranslatedText text={getLocalizedText(artist.type, i18n.language)} />
                                </span>
                                <h4 className="text-white font-bold text-lg mb-2">
                                    <AutoTranslatedText text={getLocalizedText(artist.name, i18n.language)} />
                                </h4>
                                <p className="text-white/60 text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    <AutoTranslatedText text={getLocalizedText(artist.description, i18n.language)} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
