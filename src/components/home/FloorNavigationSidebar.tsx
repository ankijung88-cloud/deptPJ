import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

interface FloorNavigationSidebarProps {
    selectedFloor: number | null;
    onSelectFloor: (level: number) => void;
}

const SIDEBAR_FLOORS = [
    { level: 6, label: '6F', title: '지역 유산' },
    { level: 5, label: '5F', title: '패션 아카이브' },
    { level: 4, label: '4F', title: '문화 토크' },
    { level: 3, label: '3F', title: '공연 & 전시' },
    { level: 2, label: '2F', title: '협업 & 팝업' },
    { level: 1, label: '1F', title: 'K-컬처 트랜드' },
];

export const FloorNavigationSidebar: React.FC<FloorNavigationSidebarProps> = ({
    selectedFloor,
    onSelectFloor
}) => {
    return (
        <div className="fixed left-12 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-10">
            {SIDEBAR_FLOORS.map((floor) => {
                const isActive = selectedFloor === floor.level;

                return (
                    <motion.div
                        key={floor.level}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (6 - floor.level) * 0.1 }}
                        className="group flex items-center cursor-pointer"
                        onClick={() => onSelectFloor(floor.level)}
                    >
                        {/* Floor Number with Glow */}
                        <div className="relative">
                            <span 
                                className={`text-4xl md:text-5xl font-black font-serif italic transition-all duration-500 ${
                                    isActive 
                                        ? 'text-[#00FFC2] drop-shadow-[0_0_15px_rgba(0,255,194,0.8)]' 
                                        : 'text-white group-hover:text-[#00FFC2]/80 group-hover:drop-shadow-[0_0_10px_rgba(0,255,194,0.4)]'
                                }`}
                                style={{
                                    textShadow: isActive ? '0 0 20px rgba(0, 255, 194, 0.6)' : 'none'
                                }}
                            >
                                {floor.label}
                            </span>
                        </div>

                        {/* Vertical Line Separator */}
                        <div 
                            className={`mx-4 h-8 w-[2px] transition-all duration-500 ${
                                isActive ? 'bg-[#00FFC2]' : 'bg-white/20 group-hover:bg-white/40'
                            }`}
                        />

                        {/* Floor Title */}
                        <span 
                            className={`text-sm md:text-base font-bold tracking-widest transition-all duration-500 uppercase ${
                                isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                            }`}
                        >
                            <AutoTranslatedText text={floor.title} />
                        </span>

                        {/* Hover/Active Indicator dot */}
                        {isActive && (
                            <motion.div 
                                layoutId="active-dot"
                                className="ml-4 w-1.5 h-1.5 rounded-full bg-[#00FFC2] shadow-[0_0_8px_#00FFC2]"
                            />
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};
