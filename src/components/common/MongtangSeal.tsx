import React from 'react';
import { motion } from 'framer-motion';

interface MongtangSealProps {
    size?: number;
    className?: string;
    color?: string;
    animated?: boolean;
}

/**
 * MongtangSeal - A premium traditional Korean seal logo component.
 * Inspired by the user-provided "몽땅" seal image.
 */
export const MongtangSeal: React.FC<MongtangSealProps> = ({
    size = 120,
    className = "",
    color = "#C84B31", // Authentic Cinnabar Red
    animated = true
}) => {
    return (
        <motion.div 
            className={`relative flex items-center justify-center ${className}`}
            initial={animated ? { scale: 0.8, opacity: 0 } : false}
            animate={animated ? { scale: 1, opacity: 1 } : false}
            transition={{ duration: 0.8, ease: [0.2, 1, 0.3, 1] }}
            style={{ width: size, height: size }}
        >
            <svg 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Traditional Outer Frame - Ju-mun style */}
                <path 
                    d="M12 10C10 10 8 12 8 14V86C8 88 10 90 12 90H88C90 90 92 88 92 86V14C92 12 90 10 88 10H12ZM14 14H86V86H14V14Z" 
                    fill={color}
                    fillRule="evenodd"
                />
                
                {/* 몽 (Left Column) - Vertical Layout matching original image */}
                <g transform="translate(18, 15)">
                    {/* ㅁ (Top) */}
                    <path d="M4 2H24V14H4V2ZM8 6H20V10H8V6Z" fill={color} fillRule="evenodd" />
                    {/* ㅗ (Middle) */}
                    <path d="M12 14V22H16V14H12Z" fill={color} />
                    <path d="M4 22H24V26H4V22Z" fill={color} />
                    {/* ㅇ (Bottom) */}
                    <circle cx="14" cy="40" r="9" stroke={color} strokeWidth="5.5" />
                </g>

                {/* 땅 (Right Column) - Vertical Layout matching original image */}
                <g transform="translate(52, 15)">
                    {/* ㄸ (Top) */}
                    <path d="M2 2H12M2 6H12M2 10H12M2 2V14M12 2V14" stroke={color} strokeWidth="4.5" strokeLinecap="square" />
                    <path d="M16 2H26M16 6H26M16 10H26M16 2V14M26 2V14" stroke={color} strokeWidth="4.5" strokeLinecap="square" />
                    {/* ㅏ (Middle) */}
                    <path d="M28 2V28H33V2H28ZM33 12H38V16H33V12Z" fill={color} fillRule="evenodd" />
                    {/* ㅇ (Bottom) */}
                    <circle cx="15" cy="40" r="9" stroke={color} strokeWidth="5.5" />
                </g>

                {/* 쏙 (Bottom Connector/Signature style) */}
                <g transform="translate(14, 65) scale(0.95)">
                    {/* ㅆ */}
                    <path d="M10 0L4 12M22 0L28 12" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M45 0L39 12M57 0L63 12" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
                    {/* ㅗ */}
                    <path d="M30 15V22M10 22H60" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
                    {/* ㄱ */}
                    <path d="M25 30H45V40" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
                </g>

                {/* Distress Artifacts for Stamp Authenticity */}
                <path d="M10 12L12 10" stroke={color} strokeWidth="1" opacity="0.6" />
                <path d="M88 88L90 90" stroke={color} strokeWidth="1.5" opacity="0.4" />
                <path d="M15 88Q12 85 10 88" stroke={color} strokeWidth="0.5" opacity="0.5" />
            </svg>
        </motion.div>
    );
};
