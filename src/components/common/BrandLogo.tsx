import React from 'react';

interface BrandLogoProps {
    className?: string;
    size?: number | string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
    className = "", 
    size = 48
}) => {
    const heightValue = typeof size === 'number' ? size : 48;

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <img 
                src="/stamplogo_clean.png" 
                alt="Mongtang Seal"
                style={{ height: heightValue, width: 'auto', objectFit: 'contain' }}
                className="select-none"
            />
            <img 
                src="/titlelogo_clean.png" 
                alt="Mongtang Title"
                style={{ height: heightValue * 0.7, width: 'auto', objectFit: 'contain' }}
                className="select-none"
            />
        </div>
    );
};




