import React from 'react';

interface BrandLogoProps {
    className?: string;
    size?: number | string;
    mode?: 'portal' | 'hub' | 'wordmark';
    color?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
    className = "", 
    size = 'auto', 
    mode = 'portal',
    color = 'currentColor' 
}) => {
    // Portal (Circular minimal icon)
    if (mode === 'portal') {
        return (
            <svg 
                viewBox="0 0 100 100" 
                className={className} 
                style={{ height: size, width: 'auto' }}
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="1.5" strokeDasharray="4 2" className="opacity-30" />
                <path d="M50 20V35M50 65V80M20 50H35M65 50H80" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <path d="M35 35L42 42M58 58L65 65M65 35L58 42M42 58L35 65" stroke={color} strokeWidth="2" strokeLinecap="round" />
                <circle cx="50" cy="50" r="8" fill={color} />
                <circle cx="50" cy="50" r="15" stroke={color} strokeWidth="1" className="animate-pulse" />
            </svg>
        );
    }

    // Hub (Interconnected lines)
    if (mode === 'hub') {
        return (
            <svg 
                viewBox="0 0 140 100" 
                className={className} 
                style={{ height: size, width: 'auto' }}
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M20 50L45 25H95L120 50L95 75H45L20 50Z" stroke={color} strokeWidth="2" />
                <circle cx="45" cy="25" r="4" fill={color} />
                <circle cx="95" cy="25" r="4" fill={color} />
                <circle cx="120" cy="50" r="4" fill={color} />
                <circle cx="95" cy="75" r="4" fill={color} />
                <circle cx="45" cy="75" r="4" fill={color} />
                <circle cx="20" cy="50" r="4" fill={color} />
                <path d="M45 25V75M95 25V75M20 50H120" stroke={color} strokeWidth="0.5" className="opacity-40" />
            </svg>
        );
    }

    // Wordmark (Minimalist Type)
    return (
        <div className={`flex flex-col items-start leading-none tracking-tighter ${className}`} style={{ height: size }}>
            <span className="text-xl font-black uppercase" style={{ color }}>DEPART</span>
            <div className="h-[2px] w-full mt-1 opacity-50" style={{ backgroundColor: color }} />
            <span className="text-[0.4rem] font-mono mt-1 opacity-40 uppercase tracking-widest" style={{ color }}>Connected Archive Platform</span>
        </div>
    );
};
