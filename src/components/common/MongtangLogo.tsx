import React from 'react';

interface MongtangLogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    showSlogan?: boolean;
    variant?: 'modern' | 'seal';
}

export const MongtangLogo: React.FC<MongtangLogoProps> = ({ 
    className = "", 
    size = 120,
    showText = false, // Changed default to false
    showSlogan = false 
}) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="flex items-center gap-6">
                <img 
                    src="/stamplogo_clean.png" 
                    alt="Mongtang Seal"
                    style={{ height: size, width: 'auto', objectFit: 'contain' }}
                    className="select-none"
                />
                <img 
                    src="/titlelogo_clean.png" 
                    alt="Mongtang Title"
                    style={{ height: size * 0.7, width: 'auto', objectFit: 'contain' }}
                    className="select-none"
                />
            </div>
            
            {/* Text elements removed as per user request to use ONLY the seal as logo */}
            {showText && (
                <div className="mt-4 flex flex-col items-center">
                    <h2 
                        className="font-serif font-black tracking-tighter text-dancheong-ink"
                        style={{ fontSize: size * 0.25 }}
                    >
                        몽땅쏙
                    </h2>
                    {showSlogan && (
                        <p className="mt-2 text-[10px] text-dancheong-ink/60 font-medium tracking-widest uppercase">
                            공간에 가치를 채우다, 몽땅쏙
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
