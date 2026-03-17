import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Ticket, Plus } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

interface ThemeBookingContainerProps {
    parentId: string;
    isAdmin: boolean;
}

const ThemeBookingContainer: React.FC<ThemeBookingContainerProps> = ({ isAdmin }) => {

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-black/40 border border-white/10 rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                            <CalendarIcon size={24} className="text-[#00E0FF]" />
                            <AutoTranslatedText text="Select Date" />
                        </h3>
                        {isAdmin && (
                            <button className="text-[#00E0FF] hover:bg-[#00E0FF]/10 p-2 rounded-lg transition-colors">
                                <Plus size={20} />
                            </button>
                        )}
                    </div>
                    
                    {/* Simplified Calendar Placeholder */}
                    <div className="grid grid-cols-7 gap-2 mb-8">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                            <div key={d} className="text-center text-xs font-bold text-white/20 pb-4">{d}</div>
                        ))}
                        {Array.from({ length: 31 }, (_, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="aspect-square rounded-xl border border-white/5 flex items-center justify-center text-white/40 hover:border-[#00E0FF]/50 hover:text-[#00E0FF] transition-all"
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
                                <button key={time} className="py-3 px-4 rounded-xl border border-white/10 text-white/60 hover:border-[#00E0FF] hover:text-[#00E0FF] transition-all font-mono">
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-gradient-to-br from-[#00E0FF]/10 to-transparent border border-[#00E0FF]/20 rounded-3xl p-8 space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#00E0FF]/20 flex items-center justify-center">
                        <Ticket size={32} className="text-[#00E0FF]" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white">
                        <AutoTranslatedText text="Reservation" />
                    </h3>
                    <div className="space-y-4 text-white/60 text-sm font-light">
                        <div className="flex items-center gap-3">
                            <CalendarIcon size={16} /> <AutoTranslatedText text="Please select a date" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock size={16} /> <AutoTranslatedText text="Please select a time" />
                        </div>
                    </div>
                    <button className="w-full py-4 bg-[#00E0FF] text-black rounded-2xl font-bold text-lg shadow-xl shadow-[#00E0FF]/10 hover:brightness-110 transition-all opacity-50 cursor-not-allowed">
                        <AutoTranslatedText text="Confirm Booking" />
                    </button>
                    {isAdmin && (
                        <p className="text-xs text-[#00E0FF]/60 text-center italic">
                            * Management mode active: Admin can override slots.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThemeBookingContainer;
