import React from 'react';

export const MongtangBrandLogo: React.FC<{ size?: number; className?: string }> = ({ 
    size = 400, 
    className = "" 
}) => {
    const navy = "#002B49";
    const orange = "#EBA432";
    
    return (
        <div className={`inline-block ${className}`}>
            <svg 
                width={size} 
                height={size * 0.45} 
                viewBox="0 0 500 180" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 몽 */}
                <g transform="translate(10, 20)">
                    {/* ㅁ - Top part, very thick and square-rounded */}
                    <rect x="25" y="10" width="60" height="45" rx="6" stroke={navy} strokeWidth="18" strokeLinejoin="round" />
                    {/* - (Horizontal bar) - Long and very thick */}
                    <line x1="5" y1="85" x2="105" y2="85" stroke={navy} strokeWidth="18" strokeLinecap="round" />
                    {/* ㅇ - Thick ring at the bottom */}
                    <circle cx="55" cy="125" r="32" stroke={navy} strokeWidth="18" />
                </g>

                {/* 땅 */}
                <g transform="translate(160, 20)">
                    {/* ㄸ - Two thick squares */}
                    <rect x="15" y="10" width="35" height="45" rx="4" stroke={navy} strokeWidth="18" strokeLinejoin="round" />
                    <rect x="65" y="10" width="35" height="45" rx="4" stroke={navy} strokeWidth="18" strokeLinejoin="round" />
                    {/* - (Horizontal bar) */}
                    <line x1="5" y1="85" x2="115" y2="85" stroke={navy} strokeWidth="18" strokeLinecap="round" />
                    {/* ㅇ */}
                    <circle cx="60" cy="125" r="32" stroke={navy} strokeWidth="18" />
                </g>

                {/* 쏙 */}
                <g transform="translate(320, 20)">
                    {/* ㅆ - Thick diagonal strokes */}
                    <path d="M25 10L45 55M90 10L70 55" stroke={navy} strokeWidth="18" strokeLinecap="round" />
                    {/* - (Horizontal bar) */}
                    <line x1="5" y1="85" x2="135" y2="85" stroke={navy} strokeWidth="18" strokeLinecap="round" />
                    {/* ㄱ - Thick L-shape */}
                    <path d="M35 110H95V145" stroke={navy} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Orange Accent - Thick pill shape angled at 45 degrees */}
                    <rect 
                        x="60" y="45" width="12" height="35" rx="6" 
                        fill={orange} 
                        transform="rotate(35, 66, 62.5)" 
                    />
                </g>
            </svg>
        </div>
    );
};



