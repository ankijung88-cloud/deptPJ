import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloors } from '../../context/FloorContext';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { ArrowRight } from 'lucide-react';

export const LandingFloorSection: React.FC = () => {
    const { floors, loading } = useFloors();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

    const displayFloors = React.useMemo(() => {
        if (!floors || floors.length === 0) return [];
        const sorted = [...floors].sort((a, b) => {
            const levelA = parseInt(a.floor) || 0;
            const levelB = parseInt(b.floor) || 0;
            return levelA - levelB;
        });
        return sorted;
    }, [floors]);

    if (loading && (!floors || floors.length === 0)) return null;

    return (
        <section id="floors" className="relative w-full sm:min-h-screen bg-transparent border-t border-dancheong-ink/5 overflow-hidden flex flex-col justify-center pt-16 pb-24 sm:py-40">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#FFD1D1]/10 blur-[150px] rounded-full opacity-30" />
                <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-dancheong-mugwort/5 blur-[150px] rounded-full opacity-30" />
            </div>

            <div className="container mx-auto px-4 sm:px-12 relative z-10">
                {/* Header: Editorial Style */}
                <header className="max-w-5xl mx-auto text-center mb-24 sm:mb-32">
                    <div className="flex flex-col items-center gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-[1px] bg-dancheong-ink/20" />
                            <span className="text-[10px] font-black tracking-[0.5em] text-dancheong-mugwort uppercase">
                                Floor Guide
                            </span>
                            <div className="w-12 h-[1px] bg-dancheong-ink/20" />
                        </div>
                    </div>

                    <h2 className="text-3xl sm:text-5xl lg:text-7xl font-serif font-black tracking-tighter leading-[1.1] text-dancheong-ink">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="block"
                        >
                            당신의 본연을 찾아가는
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            className="block italic text-dancheong-mugwort/80"
                        >
                            층별 큐레이션
                        </motion.span>
                    </h2>
                </header>

                {/* Modern Grid: Panoramic Overview */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 w-full">
                    {displayFloors.map((floor, index) => {
                        const isActive = hoveredFloor === floor.id;

                        return (
                            <motion.div
                                key={floor.id}
                                className="relative flex flex-col group cursor-pointer"
                                onMouseEnter={() => setHoveredFloor(floor.id)}
                                onMouseLeave={() => setHoveredFloor(null)}
                                onClick={() => navigate(`/floor/${floor.id}`)}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.8 }}
                            >
                                <div
                                    className={`w-full aspect-[3/4] p-6 sm:p-8 rounded-[3rem] transition-all duration-1000 relative overflow-hidden flex flex-col items-center text-center justify-between border ${isActive ? 'shadow-[0_50px_80px_rgba(0,0,0,0.08)] sm:-translate-y-8 bg-white' : 'shadow-sm bg-white/80 backdrop-blur-sm'}`}
                                    style={{
                                        borderColor: isActive ? floor.color : 'rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div className="relative z-10 flex flex-col items-center justify-between h-full w-full">
                                        <div className="flex flex-col items-center gap-2">
                                            <div
                                                className={`text-2xl sm:text-4xl font-serif italic transition-all duration-700 ${isActive ? 'scale-125 opacity-100' : 'opacity-20 text-dancheong-ink'}`}
                                                style={{ color: isActive ? floor.color : undefined }}
                                            >
                                                {floor.floor}
                                            </div>
                                            <div
                                                className={`h-[1px] transition-all duration-700 ${isActive ? 'w-12' : 'w-4'}`}
                                                style={{ backgroundColor: isActive ? floor.color : 'rgba(0,0,0,0.1)' }}
                                            />
                                        </div>

                                        <div className="flex-grow flex items-center justify-center w-full px-2">
                                            <h3 className={`text-sm sm:text-base font-bold tracking-tight leading-tight transition-all duration-700 ${isActive ? 'text-dancheong-ink' : 'text-dancheong-ink/40'}`}>
                                                <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                            </h3>
                                        </div>

                                        <div
                                            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-1000 relative rounded-full ${isActive ? 'scale-110 shadow-lg' : 'opacity-40'}`}
                                            style={{
                                                background: isActive 
                                                    ? `linear-gradient(135deg, ${floor.color} 0%, ${floor.color}ee 100%)`
                                                    : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                                boxShadow: isActive ? `0 10px 20px ${floor.color}40` : 'none'
                                            }}
                                        >
                                            <ArrowRight
                                                size={16}
                                                className={`transition-colors duration-700 ${isActive ? 'text-white' : 'text-dancheong-ink/60'}`}
                                            />
                                        </div>
                                    </div>

                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[40px] z-0"
                                            style={{ backgroundColor: `${floor.color}15` }}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-32 sm:mt-48 text-center">
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto text-base sm:text-lg text-dancheong-ink/40 font-medium italic leading-relaxed px-6"
                    >
                        <AutoTranslatedText text={"각 층의 아이콘을 터치하여 \n아름다움으로의 깊은 몰입을 경험해 보세요."} />
                    </motion.p>
                </div>
            </div>
        </section>
    );
};
