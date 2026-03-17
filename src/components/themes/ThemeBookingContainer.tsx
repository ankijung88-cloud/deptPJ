import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Ticket, Plus } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { FeaturedItem } from '../../types';
import { JoseonTheme } from '../../utils/themeUtils';

interface ThemeBookingContainerProps {
    item: FeaturedItem;
    theme: JoseonTheme;
    isAdmin: boolean;
}

const ThemeBookingContainer: React.FC<ThemeBookingContainerProps> = ({ item, theme, isAdmin }) => {
    const { i18n } = useTranslation();
    const accentColor = theme.accentColor;

    return (
        <div className="space-y-12">
            <header className="max-w-4xl mx-auto text-center space-y-4 mb-16">
                <span className="font-bold tracking-[0.3em] uppercase text-xs" style={{ color: accentColor }}>Service Reservation</span>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-white">
                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                </h1>
                <p className="text-white/40 text-lg max-w-2xl mx-auto">
                    <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-black/40 border border-white/10 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                                <CalendarIcon size={24} style={{ color: accentColor }} />
                                <AutoTranslatedText text="Select Date" />
                            </h3>
                            {isAdmin && (
                                <button className="hover:bg-white/5 p-2 rounded-lg transition-colors" style={{ color: accentColor }}>
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2 mb-8">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-center text-xs font-bold text-white/20 pb-4">{d}</div>
                            ))}
                            {Array.from({ length: 31 }, (_, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.1, borderColor: accentColor, color: accentColor }}
                                    whileTap={{ scale: 0.9 }}
                                    className="aspect-square rounded-xl border border-white/5 flex items-center justify-center text-white/40 transition-all font-mono"
                                >
                                    {i + 1}
                                </motion.button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-white mb-4">
                                <AutoTranslatedText text="Available Slots" />
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {['10:00', '13:00', '15:00', '17:00'].map(time => (
                                    <button 
                                        key={time} 
                                        className="py-3 px-4 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all font-mono"
                                        style={{ borderImage: `linear-gradient(to right, ${accentColor}33, transparent) 1` }}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 blur-[100px] opacity-20" style={{ backgroundColor: accentColor }} />
                        
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}22` }}>
                            <Ticket size={32} style={{ color: accentColor }} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white">
                            <AutoTranslatedText text="Reservation Summary" />
                        </h3>
                        <div className="space-y-4 text-white/60 text-sm font-light">
                            <div className="flex items-center gap-3">
                                <CalendarIcon size={16} /> <AutoTranslatedText text="Please select a date" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock size={16} /> <AutoTranslatedText text="Please select a time" />
                            </div>
                        </div>
                        <button 
                            className="w-full py-4 text-black rounded-2xl font-bold text-lg shadow-xl transition-all opacity-50 cursor-not-allowed"
                            style={{ backgroundColor: accentColor }}
                        >
                            <AutoTranslatedText text="Confirm Booking" />
                        </button>
                        {isAdmin && (
                            <p className="text-xs text-center italic opacity-40">
                                * Management mode active: Admin can override slots.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeBookingContainer;
