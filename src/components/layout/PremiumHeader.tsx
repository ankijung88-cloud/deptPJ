import React from 'react';
import { Search, User, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { FeaturedItem } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { LanguageSelector } from '../common/LanguageSelector';

interface PremiumHeaderProps {
    item?: FeaturedItem;
    onEdit?: () => void;
    canEdit?: boolean;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({ item }) => {
    const { i18n } = useTranslation();
    const location = useLocation();
    
    // Parse agencyId from current URL
    const queryParams = new URLSearchParams(location.search);
    const urlAgencyId = queryParams.get('agencyId');
    
    const metadata = (item?.metadata as any) || {};
    
    // Use metadata logo text if available, fallback to localStorage (agency brand), then title, then "여움"
    const titleText = metadata.headerLogoText || 
                      localStorage.getItem('agency_brand_name') || 
                      (item?.title ? getLocalizedText(item.title, i18n.language) : '여움');
    
    // Use metadata logo URL if available, fallback to localStorage (agency brand), then various fields
    const logoUrl = metadata.headerLogoUrl || 
                    localStorage.getItem('agency_brand_logo') || 
                    item?.thumbnailUrl || item?.imageUrl || item?.thumbnail_url || item?.image_url;

    // Helper to generate context-aware paths
    const getPath = (basePath: string) => {
        // Use agency_id from item if available, otherwise from URL
        const agencyId = item?.agency_id || urlAgencyId;
        if (agencyId) {
            return `${basePath}?agencyId=${agencyId}`;
        }
        return basePath;
    };

    const navLinks = metadata.navLinks || [
        { name: '큐레이션', path: getPath('/project-template/curation') },
        { name: '스킨케어', path: getPath('/project-template/skincare') },
        { name: '브랜드', path: getPath('/project-template/brand') },
        { name: '매거진', path: getPath('/project-template/magazine') },
        { name: '커뮤니티', path: getPath('/project-template/community') }
    ];

    const logoLink = getPath('/project-template');

    return (
        <header className="fixed top-0 left-0 w-full z-[100] bg-white/90 backdrop-blur-xl border-b border-[#2D2924]/5">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <Link to={logoLink} className="flex items-center gap-1.5 cursor-pointer group">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt={titleText} 
                                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                            />
                        ) : (
                            <span className="text-3xl font-serif font-black text-[#2D2924] tracking-tight transition-transform duration-300 group-hover:scale-105">
                                {titleText}
                            </span>
                        )}
                        {!logoUrl && <div className="w-2 h-2 bg-[#FF7F7F] rounded-full mt-2 shadow-[0_0_8px_rgba(255,127,127,0.4)]" />}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="hidden lg:flex items-center gap-16">
                    {navLinks.map((item: any) => (
                        <Link 
                            key={item.name} 
                            to={item.path} 
                            className="relative text-sm font-semibold text-[#2D2924]/70 hover:text-[#2D2924] transition-all duration-300 tracking-normal group whitespace-nowrap"
                        >
                            <AutoTranslatedText text={item.name} />
                            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#2D2924] transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                {/* Icons & Home Button */}
                <div className="flex items-center gap-6">
                    <Link 
                        to="/" 
                        className="hidden xl:flex items-center gap-2 px-5 py-2.5 bg-[#2D2924] text-white rounded-full text-[10px] font-black tracking-[0.15em] uppercase hover:bg-black transition-all shadow-md shadow-black/5 active:scale-95 group"
                    >
                        <AutoTranslatedText text="몽땅 홈" />
                        <span className="w-1.5 h-1.5 bg-[#FF7F7F] rounded-full group-hover:animate-pulse" />
                    </Link>

                    <div className="h-6 w-[1px] bg-[#2D2924]/10 hidden md:block" />

                    <div className="flex items-center gap-4 md:gap-2">
                        <LanguageSelector variant="premium" />

                        <div className="h-4 w-[1px] bg-[#2D2924]/5 mx-2 hidden sm:block" />

                        <button className="p-2 hover:bg-black/5 rounded-full transition-colors group">
                            <Search size={20} className="text-[#2D2924]/60 group-hover:text-[#2D2924] transition-colors" strokeWidth={1.5} />
                        </button>
                        <button className="p-2 hover:bg-black/5 rounded-full transition-colors group">
                            <User size={20} className="text-[#2D2924]/60 group-hover:text-[#2D2924] transition-colors" strokeWidth={1.5} />
                        </button>
                        <button className="p-2 hover:bg-black/5 rounded-full transition-colors group relative">
                            <ShoppingBag size={20} className="text-[#2D2924]/60 group-hover:text-[#2D2924] transition-colors" strokeWidth={1.5} />
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#FF7F7F] text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-sm">1</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>

    );
};
