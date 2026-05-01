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
        <div className={`flex items-center gap-4 ${className}`} style={{ mixBlendMode: 'multiply' }}>
            <img 
                src="/mongdanglogo.png" 
                alt="Mongtangssok Logo"
                style={{ 
                    height: typeof heightValue === 'number' ? `${heightValue}px` : heightValue, 
                    width: 'auto', 
                    objectFit: 'contain',
                    filter: 'contrast(1.1) brightness(1.05)'
                }}
                className="select-none"
            />
            {variant === 'full' && (
                <img 
                    src="/titlelogo_clean.png" 
                    alt="Mongtang Title"
                    style={{ 
                        height: typeof heightValue === 'number' ? `${heightValue * 0.7}px` : `calc(${heightValue} * 0.7)`, 
                        width: 'auto', 
                        objectFit: 'contain',
                        filter: 'contrast(1.1) brightness(1.05)'
                    }}
                    className="select-none"
                />
            )}
        </div>
    );
};




