import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Volume2, VolumeX, Shield, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { LanguageSelector } from '../common/LanguageSelector';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { getJoseonThemeById, getFloorBySubId } from '../../utils/themeUtils';
import { useNavigationState } from '../../context/NavigationActionContext';
import { useAdmin } from '../../hooks/useAdmin';
import { useFloors } from '../../context/FloorContext';
import { getLocalizedText } from '../../utils/i18nUtils';
import { BrandLogo } from '../common/BrandLogo';

interface SubItem {
    id: string;
    label: string;
    path?: string;
}

interface NavItem {
    id: string;
    level: number;
    label: string;
    subitems: SubItem[];
}

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isImmersive, breadcrumbPath, isUiVisible, resetUiTimer } = useNavigationState();

    // Dynamic Theme Detection
    const getThemeData = () => {
        const path = location.pathname;
        if (path.startsWith('/category/')) {
            const subId = path.split('/')[2];
            return { id: subId, floor: getFloorBySubId(subId) || '1' };
        }
        if (path.startsWith('/floor/')) {
            const floorId = path.split('/')[2] || '1';
            return { id: floorId, floor: floorId.charAt(0) || '1' };
        }
        if (path.startsWith('/detail/')) {
            // Priority 1: Check breadcrumbPath for floor info
            const floorItem = breadcrumbPath.find(p => p.type === 'floor');
            if (floorItem && floorItem.id) {
                const floorId = floorItem.id.toString();
                const floorNum = floorId.replace('floor-', '');
                if (!isNaN(parseInt(floorNum))) {
                    return { id: floorId, floor: floorNum };
                }
            }
            // Fallback: itemId as id, default floor
            const itemId = path.split('/')[2] || '';
            return { id: itemId, floor: 'default' };
        }
        return { id: '', floor: 'default' };
    };

    const theme = useMemo(() => {
        const { id: themeId, floor: themeFloor } = getThemeData();
        return getJoseonThemeById(themeId, themeFloor);
    }, [location.pathname, breadcrumbPath]);

    const is3DStorePage = location.pathname === '/inspiration';


    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    useEffect(() => {
        const handleTopZoneReveal = (e: MouseEvent) => {
            if (e.clientY < 60) {
                resetUiTimer();
            }
        };

        window.addEventListener('mousemove', handleTopZoneReveal);
        return () => {
            window.removeEventListener('mousemove', handleTopZoneReveal);
        };
    }, [resetUiTimer]);

    const [isGlobalMuted, setIsGlobalMuted] = useState(() => {
        const saved = localStorage.getItem('isGlobalMuted');
        return saved === null ? true : saved === 'true';
    });

    const { isAdmin: isAdminLoggedIn, isAgency: isAgencyLoggedIn, user, logout } = useAdmin();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setIsSearchOpen(false);
            setSearchTerm('');
            setIsMenuOpen(false);
        }
    };

    const searchInputRef = useRef<HTMLInputElement>(null);
    const mobileSearchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearchOpen) {
            setTimeout(() => {
                if (window.innerWidth < 1024 && mobileSearchInputRef.current) {
                    mobileSearchInputRef.current.focus();
                } else if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        }
    }, [isSearchOpen]);

    const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
    const { floors } = useFloors();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.desktop-nav-item')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const syncVideos = () => {
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                if (video.dataset.hasSound === 'true') {
                    video.muted = isGlobalMuted;
                }
            });
        };

        syncVideos();

        // MutationObserver to handle dynamic videos (e.g., modals, lazy-loaded components)
        const observer = new MutationObserver(syncVideos);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-has-sound']
        });

        return () => observer.disconnect();
    }, [isGlobalMuted]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const toggleMobileSubMenu = (menu: string) => {
        setExpandedMobileMenu(expandedMobileMenu === menu ? null : menu);
    };

    const navItems: NavItem[] = useMemo(() => {
        // Sort floors by numeric level (1, 2, 3...) ascending
        const sortedFloors = [...floors].sort((a, b) => {
            const levelA = parseInt(a.floor.replace(/[^0-9]/g, '')) || 0;
            const levelB = parseInt(b.floor.replace(/[^0-9]/g, '')) || 0;
            return levelA - levelB;
        });

        return sortedFloors.map(floor => ({
            id: floor.id,
            level: parseInt(floor.floor.replace(/[^0-9]/g, '')) || 0,
            label: `${floor.floor.toUpperCase().includes('F') ? floor.floor : floor.floor + 'F'} | ${getLocalizedText(floor.title, i18n.language)}`,
            subitems: (floor.subitems || []).map(sub => ({
                id: sub.id,
                label: getLocalizedText(sub.label, i18n.language),
                path: `/category/${sub.id}`
            }))
        }));
    }, [floors, i18n.language]);

    // if (isImmersive) return null; // Logic moved to Layout.tsx for more granular control

    return (
        <header
            className={`fixed top-0 inset-x-0 z-[9999] transition-all duration-700 ${(!isUiVisible && isImmersive) ? '-translate-y-full' : 'translate-y-0'}`}
            onMouseEnter={() => resetUiTimer()}
            onMouseLeave={() => resetUiTimer()}
            style={{
                backgroundColor: isScrolled ? `rgba(255, 255, 255, 0.6)` : `rgba(242, 231, 213, 0.4)`,
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: isScrolled ? '0 10px 30px rgba(23,23,23,0.05)' : 'none',
                borderBottom: `1px solid ${theme.borderColor}22`,
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.7s, box-shadow 0.7s'
            }}
        >
            <div className={`max-w-[1800px] mx-auto px-6 lg:px-12 flex items-center justify-between transition-all duration-700 relative z-10 overflow-visible ${isScrolled ? 'h-16' : 'h-24'}`}>
                <Link to="/" className="flex items-center space-x-2 group magnetic-target">
                    <BrandLogo size={isScrolled ? 48 : 64} color={theme.accentColor} className="transition-all duration-500 group-hover:scale-105" />
                </Link>

                {/* Desktop Navigation */}
                {!is3DStorePage && (
                    <nav className="hidden xl:flex items-center space-x-8 font-serif">
                        {navItems.map((item) => {
                            const floorNum = item.label.split(' | ')[0];   // "1F"
                            const floorTitle = item.label.split(' | ')[1]; // "K-컬처 트렌드"
                            const isActive = activeDropdown === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className="relative flex flex-col items-center desktop-nav-item"
                                    onMouseEnter={() => setActiveDropdown(item.id)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    {/* Elevator button (Direct link to 2D Floor Guide) */}
                                    <Link
                                        to={`/floor/${item.id}`}
                                        className="flex items-center justify-center w-[60px] h-[60px] rounded-full my-4 transition-all duration-300 select-none cursor-pointer no-underline group/btn"
                                        style={{
                                            background: isActive
                                                ? theme.accentColor
                                                : 'rgba(255, 255, 255, 0.4)',
                                            boxShadow: isActive
                                                ? `inset 0 0 0 1px ${theme.accentColor}`
                                                : 'inset 0 0 0 1.5px rgba(23,23,23,0.3)',
                                            backdropFilter: 'blur(8px)',
                                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        }}
                                        onClick={() => {
                                            setActiveDropdown(null);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        <span
                                            className="font-black text-[18px] tracking-widest transition-colors duration-300"
                                            style={{
                                                color: isActive ? theme.bgColor : '#171717',
                                            }}
                                        >
                                            {floorNum}
                                        </span>
                                    </Link>

                                    <div
                                        className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap text-[18px] font-black tracking-widest text-center !break-keep ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
                                        style={{ color: theme.accentColor, whiteSpace: 'nowrap' }}
                                    >
                                        <AutoTranslatedText text={floorTitle} className="!whitespace-nowrap" />
                                    </div>

                                    <div
                                        className={`absolute top-full left-1/2 -translate-x-1/2 w-48 rounded-b-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 origin-top ${isActive ? 'opacity-100 visible mt-10 scale-100' : 'opacity-0 invisible mt-8 scale-95'}`}
                                        style={{ backgroundColor: theme.bgColor, borderTop: `2px solid ${theme.accentColor}`, border: `1px solid rgba(23,23,23,0.1)` }}
                                    >
                                        <div className="py-2 flex flex-col relative font-sans">
                                            {item.subitems.map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    to={`/category/${sub.id}`}
                                                    className="px-5 py-3 text-sm tracking-wide text-dancheong-ink/70 hover:bg-dancheong-ink/5 transition-all duration-200 text-left relative group/item"
                                                    onMouseEnter={e => (e.currentTarget.style.color = theme.accentColor)}
                                                    onMouseLeave={e => (e.currentTarget.style.color = '')}
                                                    onClick={() => setActiveDropdown(null)}
                                                >
                                                    <span className="relative z-10"><AutoTranslatedText text={sub.label} /></span>
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 transition-all duration-300 group-hover/item:h-3/5" style={{ backgroundColor: theme.accentColor }} />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                )}

                {/* User Actions & Utilities */}
                <div className="hidden lg:flex flex-col items-end space-y-1 py-2 font-sans">
                        {/* Compact Breadcrumbs in Top Right */}
                        <div className="opacity-100 transition-opacity">
                            <Breadcrumbs />
                        </div>

                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => {
                                    const next = !isGlobalMuted;
                                    setIsGlobalMuted(next);
                                    localStorage.setItem('isGlobalMuted', String(next));
                                    window.dispatchEvent(new CustomEvent('globalMuteChange', { detail: next }));
                                }}
                                className={`flex items-center transition-colors gap-1 p-2 ${is3DStorePage ? 'text-[#171717]/80 hover:text-[#171717]' : 'text-dancheong-ink'}`}
                                onMouseEnter={e => { if (!is3DStorePage) e.currentTarget.style.color = theme.accentColor; }}
                                onMouseLeave={e => { if (!is3DStorePage) e.currentTarget.style.color = ''; }}
                                title={isGlobalMuted ? t('nav.sound_on') : t('nav.sound_off')}
                            >
                                {isGlobalMuted ? <VolumeX size={20} strokeWidth={2.5} /> : <Volume2 size={20} strokeWidth={2.5} />}
                            </button>

                            <div className={`h-6 w-[2px] ${is3DStorePage ? 'bg-[#171717]/20' : 'bg-dancheong-ink/20'}`} />

                            {/* Search */}
                            <div className="relative flex items-center justify-end">
                                <div
                                    className={`flex items-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden rounded-full ${isSearchOpen ? `bg-white w-[280px] px-4 py-2 shadow-xl` : 'bg-transparent border border-transparent w-[32px] px-0 py-0'
                                         }`}
                                    style={isSearchOpen ? { border: `2px solid #171717` } : {}}
                                >
                                    <button
                                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                                        className={`flex items-center justify-center shrink-0 transition-colors ${isSearchOpen ? 'mr-3 text-[#171717]' : (is3DStorePage ? 'text-[#171717]/80 hover:text-[#171717]' : 'text-dancheong-ink')}`}
                                        title={t('nav.search')}
                                    >
                                        <Search size={20} strokeWidth={2.5} />
                                    </button>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleSearch}
                                        placeholder={t('search.placeholder')}
                                        className={`w-full bg-transparent text-[#171717] text-sm outline-none placeholder:text-[#171717]/40 font-black tracking-wide ${isSearchOpen ? 'opacity-100' : 'opacity-0'
                                             }`}
                                    />
                                    {isSearchOpen && (
                                        <button
                                            onClick={() => setIsSearchOpen(false)}
                                            className="text-[#171717]/50 shrink-0 ml-2 transition-colors hover:text-[#171717]"
                                        >
                                            <X size={18} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="ml-auto flex items-center gap-4">
                                <div className={`h-6 w-[2px] ${is3DStorePage ? 'bg-[#171717]/20' : 'bg-dancheong-ink/20'}`} />
                                <LanguageSelector />
                            </div>

                            {/* Admin & Agency Controls */}
                            {(isAdminLoggedIn || isAgencyLoggedIn) && (
                                <div className="flex items-center gap-2">
                                    <div className={`h-4 w-[1px] ${is3DStorePage ? 'bg-[#2c3e50]/30' : 'bg-dancheong-gold/30'}`} />
                                    {isAdminLoggedIn ? (
                                        <Link
                                            to="/admin"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                                            style={{ color: '#00FFC2', border: '1px solid #00FFC233', background: '#00FFC210' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#00FFC225')}
                                            onMouseLeave={e => (e.currentTarget.style.background = '#00FFC210')}
                                        >
                                            <Shield size={13} />
                                            <AutoTranslatedText text="Admin" />
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/admin"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                                            style={{ color: '#00FFC2', border: '1px solid #00FFC233', background: '#00FFC210' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#00FFC225')}
                                            onMouseLeave={e => (e.currentTarget.style.background = '#00FFC210')}
                                        >
                                            <Shield size={13} />
                                            <AutoTranslatedText text={user?.agency_name || user?.name || 'Agency'} />
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-red-400/80 hover:text-red-400 transition-all"
                                        style={{ border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.12)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.05)')}
                                    >
                                        <LogOut size={13} />
                                        <AutoTranslatedText text="Logout" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center space-x-4 lg:hidden relative">
                        <button
                            onClick={() => {
                                const next = !isGlobalMuted;
                                setIsGlobalMuted(next);
                                localStorage.setItem('isGlobalMuted', String(next));
                                window.dispatchEvent(new CustomEvent('globalMuteChange', { detail: next }));
                            }}
                            className={`transition-colors relative z-10 ${is3DStorePage ? 'text-[#2c3e50]/70 hover:text-[#2c3e50]' : 'text-dancheong-white/70'}`}
                            onMouseEnter={e => { if (!is3DStorePage) e.currentTarget.style.color = theme.highlightColor; }}
                            onMouseLeave={e => { if (!is3DStorePage) e.currentTarget.style.color = ''; }}
                            title={isGlobalMuted ? t('nav.sound_on') : t('nav.sound_off')}
                        >
                            {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        <div
                            className={`flex items-center absolute right-[3.5rem] transition-all duration-400 ease-in-out overflow-hidden rounded-full ${isSearchOpen ? 'pl-3 pr-2 py-1.5 opacity-100 visible shadow-lg w-[200px]' : 'bg-transparent border border-transparent w-0 opacity-0 invisible pl-0 py-1'}`}
                            style={isSearchOpen ? { backgroundColor: `${theme.bgColor}`, border: `1px solid ${theme.accentColor}55` } : {}}
                        >
                            <Search size={18} className="shrink-0 mr-2" style={theme.highlightStyle} />
                            <input
                                ref={mobileSearchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder={t('search.placeholder')}
                                className="w-full bg-transparent text-dancheong-white text-sm outline-none placeholder:text-dancheong-white/40 font-sans tracking-wide"
                            />
                        </div>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`transition-colors relative z-10 ${is3DStorePage ? 'text-[#2c3e50]/70 hover:text-[#2c3e50]' : 'text-dancheong-white/70'}`}
                            style={isSearchOpen ? theme.highlightStyle : {}}
                        >
                            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                        </button>
                        {!is3DStorePage && (
                            <button
                                className="text-dancheong-white/90 transition-colors relative z-10"
                                onMouseEnter={e => e.currentTarget.style.color = theme.highlightColor}
                                onMouseLeave={e => e.currentTarget.style.color = ''}
                                onClick={toggleMenu}
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        )}
                    </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div
                    className={`lg:hidden h-[calc(100vh-64px)] overflow-y-auto animate-in slide-in-from-right duration-300 font-sans shadow-inner`}
                    style={{ backgroundColor: `${theme.bgColor}`, borderTop: `2px solid ${theme.accentColor}` }}
                >
                    <div className="flex flex-col p-6 space-y-6">
                        {navItems.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Link
                                        to={`/floor/${item.id}`}
                                        className="text-dancheong-white/90 text-lg font-serif font-medium tracking-wide py-1 transition-colors"
                                        onMouseEnter={e => e.currentTarget.style.color = theme.highlightColor}
                                        onMouseLeave={e => e.currentTarget.style.color = ''}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <AutoTranslatedText text={item.label} />
                                    </Link>
                                    <button
                                        onClick={() => toggleMobileSubMenu(item.id)}
                                        className="p-2 text-dancheong-white/40 transition-colors"
                                        onMouseEnter={e => e.currentTarget.style.color = theme.highlightColor}
                                        onMouseLeave={e => e.currentTarget.style.color = ''}
                                    >
                                        <ChevronDown size={20} className={`transition-transform ${expandedMobileMenu === item.id ? 'rotate-180' : ''}`} style={expandedMobileMenu === item.id ? theme.highlightStyle : {}} />
                                    </button>
                                </div>
                                {expandedMobileMenu === item.id && (
                                    <div className={`flex flex-col mt-3 pl-4 space-y-4 ml-1`} style={{ borderLeft: `2px solid ${theme.accentColor}33` }}>
                                        {item.subitems.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                to={`/category/${sub.id}`}
                                                className="text-dancheong-white/60 text-base tracking-wide transition-colors"
                                                onMouseEnter={e => e.currentTarget.style.color = theme.highlightColor}
                                                onMouseLeave={e => e.currentTarget.style.color = ''}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <AutoTranslatedText text={sub.label} />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <hr className="border-dancheong-gold/10 my-4" />

                        {/* Mobile Admin & Agency Controls */}
                        {(isAdminLoggedIn || isAgencyLoggedIn) && (
                            <div className="flex flex-col gap-2 pb-2">
                                {isAdminLoggedIn ? (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm"
                                        style={{ color: '#00FFC2', border: '1px solid #00FFC233', background: '#00FFC210' }}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Shield size={16} />
                                        <AutoTranslatedText text="Admin Management Page" />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm"
                                        style={{ color: '#00FFC2', border: '1px solid #00FFC233', background: '#00FFC210' }}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Shield size={16} />
                                        <AutoTranslatedText text={user?.agency_name || user?.name || 'Agency'} />
                                    </Link>
                                )}
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-red-400"
                                    style={{ border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}
                                >
                                    <LogOut size={16} />
                                    <AutoTranslatedText text="Logout" />
                                </button>
                            </div>
                        )}

                        <hr className="border-dancheong-gold/10 my-4" />

                        {/* Mobile Language Selector */}
                        <div className="py-2">
                            <p className="text-xs text-dancheong-white/60 mb-3 uppercase font-bold tracking-widest font-serif" style={{ color: `${theme.accentColor}99` }}>{t('nav.language')}</p>
                            <div className="grid grid-cols-3 gap-2">
                                {i18n.language && supportedLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            i18n.changeLanguage(lang.code);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`text-center px-2 py-2.5 rounded-lg text-[11px] transition-all tracking-wide text-dancheong-white/60 hover:bg-white/10`}
                                        style={i18n.language === lang.code ? { ...theme.bgHighlightStyle, color: 'white', fontWeight: 'bold' } : {}}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
