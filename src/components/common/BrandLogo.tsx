import React from 'react';

interface BrandLogoProps {
    className?: string;
    size?: number | string;
    mode?: 'portal' | 'hub' | 'wordmark';
    color?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
    className = "", 
    size = 'auto'
}) => {
    return (
        <img 
            src="/sample.png" 
            alt="Brand Logo" 
            className={className} 
            style={{ height: size, width: 'auto', objectFit: 'contain' }} 
        />
    );
};
