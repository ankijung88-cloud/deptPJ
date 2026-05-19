import React from 'react';
import { Search, User, ShoppingBag, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { FeaturedItem } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { EditableWrapper } from '../common/EditableWrapper';

interface PremiumHeaderProps {
    item?: FeaturedItem;
    onEdit?: () => void;
    canEdit?: boolean;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({ item, onEdit, canEdit }) => {
    const { i18n } = useTranslation();
    const location = useLocation();
    
    // Parse agencyId and category/subcategory contexts from current URL
    const queryParams = new URLSearchParams(location.search);
    const urlAgencyId = queryParams.get('agencyId');
    const urlCategory = queryParams.get('category');
    const urlSubcategory = queryParams.get('subcategory');
    
    const metadata = (item?.metadata as any) || {};
    const categoryKey = item?.category || urlCategory || '';
    const subcategoryKey = item?.subcategory || urlSubcategory || '';
    const scopeKey = subcategoryKey ? `${categoryKey}_${subcategoryKey}` : categoryKey;
    const storedNameKey = scopeKey ? `agency_brand_name_${scopeKey}` : 'agency_brand_name';
    const storedLogoKey = scopeKey ? `agency_brand_logo_${scopeKey}` : 'agency_brand_logo';
    const isLanding = item?.page_type === 'project_landing' || location.pathname.includes('/project-template');
    
    // Ensure we don't show "모든차서비스" or other default titles in agency context
    const getSafeTitle = () => {
        // 1. Priority: Explicitly set logo text in metadata (only if isLanding)
        if (isLanding && metadata.headerLogoText) return metadata.headerLogoText;
        
        // 2. Secondary: Stored brand name from agency settings (category-scoped)
        const storedName = localStorage.getItem(storedNameKey);
        if (storedName) return storedName;
        
        // 3. Check current item title (only if isLanding)
        const currentTitle = (isLanding && item?.title) ? getLocalizedText(item.title, i18n.language) : '';
        
        // 4. If it's a generic sample or agency context without branding, use "여움"
        const isGeneric = !currentTitle || 
                          currentTitle === '신선마트' || 
                          currentTitle === '모든차서비스' || 
                          currentTitle.includes('Sample');
        
        if (isGeneric || urlAgencyId || item?.agency_id || location.pathname.includes('/project-template')) {
            return '여움';
        }
        
        return currentTitle;
    };

    const titleText = getSafeTitle();
    
    // For logo URL, we want to be careful not to show a random product thumbnail as a store logo
    const logoUrl = (isLanding && metadata.headerLogoUrl) ? metadata.headerLogoUrl :
                    localStorage.getItem(storedLogoKey) || 
                    null;

    const getPath = (basePath: string) => {
        const agencyId = item?.agency_id || urlAgencyId;
        const category = item?.category || urlCategory;
        const subcategory = item?.subcategory || urlSubcategory;
        
        let path = basePath;
        const params = new URLSearchParams();
        
        if (agencyId) params.append('agencyId', String(agencyId));
        if (category) params.append('category', String(category));
        if (subcategory) params.append('subcategory', String(subcategory));
        
        const queryString = params.toString();
        if (queryString) {
            path = `${basePath}?${queryString}`;
        }
        return path;
    };

    const rawNavLinks = metadata.navLinks || [
        { name: '큐레이션', path: '/project-template/curation' },
        { name: '스킨케어', path: '/project-template/skincare' },
        { name: '브랜드', path: '/project-template/brand' },
        { name: '매거진', path: '/project-template/magazine' },
        { name: '커뮤니티', path: '/project-template/community' }
    ];

    // Ensure all nav links have the agency context
    const navLinks = rawNavLinks.map((link: any) => ({
        ...link,
        path: getPath(link.path.split('?')[0]) // Strip existing params and re-apply correctly
    }));

    const logoLink = getPath('/project-template');

    const handleLogoClick = (e: React.MouseEvent) => {
        // Only prevent redirection and scroll up smoothly if exactly on the main landing page
        if (location.pathname === '/project-template') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full z-[100] bg-white border-b border-[#2D2924]/5">
            <div className="max-w-[1920px] mx-auto px-8 h-[72px]">
                <EditableWrapper canEdit={!!canEdit} onEdit={onEdit} label="Navigation Settings" className="h-full">
                    <div className="w-full h-full flex items-center justify-between gap-4">
                        {/* Logo - Left aligned */}
                        <div className="flex items-center justify-start shrink-0">
                            <Link 
                                to={logoLink} 
                                onClick={handleLogoClick}
                                className="flex items-center gap-1 cursor-pointer group"
                            >
                                {logoUrl ? (
                                    <img 
                                        src={logoUrl} 
                                        alt={titleText} 
                                        className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                                    />
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[24px] font-bold text-[#2D2924] tracking-tighter leading-none">
                                            {titleText}
                                        </span>
                                        <div className="w-1.5 h-1.5 bg-[#FF7F7F] rounded-full translate-y-[1px]" />
                                    </div>
                                )}
                            </Link>
                        </div>

                        {/* Navigation - Perfectly Centered */}
                        <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-14">
                            {navLinks.map((link: any) => (
                                <Link 
                                    key={link.name} 
                                    to={link.path} 
                                    className="relative text-[14px] font-medium text-[#2D2924] hover:text-[#2D2924]/60 transition-all duration-300 tracking-tight whitespace-nowrap"
                                >
                                    <AutoTranslatedText text={link.name} />
                                </Link>
                            ))}
                        </nav>

                        {/* Icons & Home Button - Right aligned */}
                        <div className="flex items-center justify-end gap-3 md:gap-5 shrink-0">
                            {!urlAgencyId && (
                                <Link 
                                    to="/" 
                                    className="flex items-center gap-1.5 px-5 py-2 bg-[#2D2924] text-white rounded-full text-[12px] font-bold hover:bg-black transition-all group shrink-0"
                                >
                                    <AutoTranslatedText text="통합 홈" />
                                    <div className="w-1 h-1 bg-[#FF7F7F] rounded-full" />
                                </Link>
                            )}

                            <div className="h-4 w-[1px] bg-[#2D2924]/20 shrink-0" />

                            <div className="flex items-center gap-1.5 text-[#2D2924] text-[12px] cursor-pointer hover:text-[#2D2924]/60 transition-colors shrink-0">
                                <Globe size={16} strokeWidth={1.5} />
                                <AutoTranslatedText text="한국어" />
                            </div>

                            <div className="h-4 w-[1px] bg-[#2D2924]/20 shrink-0" />

                            <div className="flex items-center gap-0.5">
                                <button className="p-2 hover:bg-black/5 rounded-full transition-colors group">
                                    <Search size={20} className="text-[#2D2924] group-hover:text-[#2D2924]/60 transition-colors" strokeWidth={1.5} />
                                </button>
                                <button className="p-2 hover:bg-black/5 rounded-full transition-colors group">
                                    <User size={20} className="text-[#2D2924] group-hover:text-[#2D2924]/60 transition-colors" strokeWidth={1.5} />
                                </button>
                                <button className="p-2 hover:bg-black/5 rounded-full transition-colors group relative">
                                    <ShoppingBag size={20} className="text-[#2D2924] group-hover:text-[#2D2924]/60 transition-colors" strokeWidth={1.5} />
                                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#FF7F7F] text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white">
                                        1
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </EditableWrapper>
            </div>
        </header>

    );
};
