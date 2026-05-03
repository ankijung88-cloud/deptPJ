import React from 'react';

interface BrandLogoProps {
    className?: string;
    size?: number | string;
    variant?: 'full' | 'seal';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
    className = "", 
    size = 48,
    variant = 'full'
}) => {
    const heightValue = size;

    return (
        <div className={`flex items-center gap-2 sm:gap-3 ${className}`} style={{ mixBlendMode: 'multiply' }}>
            <img 
                src="/mongdanglogo.png" 
                alt="MONGTANG Logo"
                style={{ 
                    height: typeof heightValue === 'number' ? `${heightValue * 0.75}px` : `calc(${heightValue} * 0.75)`, 
                    width: 'auto', 
                    objectFit: 'contain',
                    filter: 'contrast(1.1) brightness(1.05) drop-shadow(0 0 10px rgba(255,255,255,0.8))'
                }}
                className="select-none transition-all duration-500"
            />
            {variant === 'full' && (
                <span 
                    className="font-serif font-bold sm:font-black italic tracking-[0.05em] sm:tracking-[0.2em] text-dancheong-ink select-none whitespace-nowrap transition-all duration-500"
                    style={{ 
                        fontSize: typeof heightValue === 'number' ? `${heightValue * 0.5}px` : `calc(${heightValue} * 0.5)`,
                        lineHeight: 1,
                        textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)'
                    }}
                >
                    <span className="sm:hidden" style={{ fontSize: typeof heightValue === 'number' ? `${heightValue * 0.45}px` : `calc(${heightValue} * 0.45)` }}>MONGTANG</span>
                    <span className="hidden sm:inline">MONGTANG</span>
                </span>
            )}
        </div>
    );
};




