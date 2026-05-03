import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Menu, X, Search, Volume2, VolumeX, Shield, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { LanguageSelector } from '../common/LanguageSelector';

const ADDITIONAL_NAV = [
    { path: '/notice', label: 'footer.notice' },
    { path: '/faq', label: 'footer.faq' },
    { path: '/inquiry', label: 'footer.inquiry' }
];

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
                backgroundColor: isScrolled ? '#FFFFFF' : '#F9F9F9',
                boxShadow: isScrolled ? '0 10px 30px rgba(23,23,23,0.05)' : 'none',
                borderBottom: `1px solid ${theme.borderColor}22`,
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.7s, box-shadow 0.7s'
            }}
        >
            <div className={`max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between transition-all duration-700 relative z-10 overflow-visible ${isScrolled ? 'h-14 sm:h-16' : 'h-20 sm:h-24'}`}>
                <Link to="/" className="flex items-center space-x-2 group magnetic-target">
                    <div className="sm:hidden">
                        <BrandLogo size={isScrolled ? 32 : 40} className="transition-all duration-500 group-hover:scale-105" />
                    </div>
                    <div className="hidden sm:block">
                        <BrandLogo size={isScrolled ? 48 : 64} className="transition-all duration-500 group-hover:scale-105" />
                    </div>
                </Link>

                {/* Desktop Navigation */}
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
                                                : '#FFFFFF',
                                            boxShadow: isActive
                                                ? `inset 0 0 0 1px ${theme.accentColor}`
                                                : 'inset 0 0 0 1.5px rgba(23,23,23,0.3)',
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

                                </div>
                            );
                        })}
                    </nav>
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
                                className={`flex items-center transition-colors gap-1 p-2 text-dancheong-ink`}
                                onMouseEnter={e => { e.currentTarget.style.color = theme.accentColor; }}
                                onMouseLeave={e => { e.currentTarget.style.color = ''; }}
                                title={isGlobalMuted ? t('nav.sound_on') : t('nav.sound_off')}
                            >
                                {isGlobalMuted ? <VolumeX size={20} strokeWidth={2.5} /> : <Volume2 size={20} strokeWidth={2.5} />}
                            </button>

                            <div className={`h-6 w-[2px] bg-dancheong-ink/20`} />

                            {/* Search */}
                            <div className="relative flex items-center justify-end">
                                <div
                                    className={`flex items-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden rounded-full ${isSearchOpen ? `bg-white w-[280px] px-4 py-2 shadow-xl` : 'bg-transparent border border-transparent w-[32px] px-0 py-0'
                                         }`}
                                    style={isSearchOpen ? { border: `2px solid #171717` } : {}}
                                >
                                    <button
                                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                                        className={`flex items-center justify-center shrink-0 transition-colors ${isSearchOpen ? 'mr-3 text-[#171717]' : 'text-dancheong-ink'}`}
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
                                <div className={`h-6 w-[2px] bg-dancheong-ink/20`} />
                                <LanguageSelector />
                            </div>

                            {/* Admin & Agency Controls */}
                            {(isAdminLoggedIn || isAgencyLoggedIn) && (
                                <div className="flex items-center gap-2">
                                    <div className={`h-4 w-[1px] bg-dancheong-gold/30`} />
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
                <div className="flex items-center space-x-3 sm:space-x-4 lg:hidden relative">
                        <button
                            onClick={() => {
                                const next = !isGlobalMuted;
                                setIsGlobalMuted(next);
                                localStorage.setItem('isGlobalMuted', String(next));
                                window.dispatchEvent(new CustomEvent('globalMuteChange', { detail: next }));
                            }}
                            className={`transition-colors relative z-10 text-dancheong-ink/70 active:scale-90`}
                            title={isGlobalMuted ? t('nav.sound_on') : t('nav.sound_off')}
                        >
                            {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        <div
                            className={`flex items-center absolute right-[3rem] sm:right-[3.5rem] transition-all duration-400 ease-in-out overflow-hidden rounded-full ${isSearchOpen ? 'pl-3 pr-2 py-1.5 opacity-100 visible shadow-lg w-[160px] sm:w-[200px]' : 'bg-transparent border border-transparent w-0 opacity-0 invisible pl-0 py-1'}`}
                            style={isSearchOpen ? { backgroundColor: `${theme.bgColor}`, border: `1.5px solid ${theme.accentColor}` } : {}}
                        >
                            <Search size={18} className="shrink-0 mr-2 text-dancheong-ink" />
                            <input
                                ref={mobileSearchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder={t('search.placeholder')}
                                className="w-full bg-transparent text-dancheong-ink text-xs sm:text-sm outline-none placeholder:text-dancheong-ink/30 font-sans tracking-wide"
                            />
                        </div>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`transition-colors relative z-10 text-dancheong-ink/70 active:scale-90`}
                        >
                            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                        </button>
                        <button
                                className="text-dancheong-ink/90 transition-colors relative z-10 active:scale-90"
                                onClick={toggleMenu}
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                    </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="lg:hidden absolute top-full inset-x-0 z-[9998] h-screen overflow-y-auto font-sans shadow-2xl"
                        style={{ backgroundColor: theme.bgColor, borderTop: `1px solid ${theme.accentColor}22` }}
                    >
                        <div className="flex flex-col p-6 space-y-6">
                            {navItems.map((item) => (
                                <div key={item.id} className="space-y-2">
                                    <Link
                                        to={`/floor/${item.id}`}
                                        className="text-dancheong-ink/90 text-lg font-serif font-medium tracking-wide py-1 transition-colors"
                                        onMouseEnter={e => e.currentTarget.style.color = theme.highlightColor}
                                        onMouseLeave={e => e.currentTarget.style.color = ''}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <AutoTranslatedText text={item.label} />
                                    </Link>
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

                            <div className="flex flex-col space-y-3 sm:space-y-4 px-2">
                                {ADDITIONAL_NAV.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-2xl sm:text-3xl font-serif font-black tracking-tighter hover:opacity-70 transition-opacity text-dancheong-ink uppercase"
                                    >
                                        <AutoTranslatedText text={t(item.label)} />
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-6 sm:pt-8 border-t border-dancheong-ink/10 space-y-4 sm:space-y-6">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-dancheong-ink/40">Language</span>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        {supportedLanguages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    i18n.changeLanguage(lang.code);
                                                    setIsMenuOpen(false);
                                                }}
                                                className={`text-xs sm:text-sm font-bold transition-colors ${i18n.language === lang.code ? 'text-dancheong-ink' : 'text-dancheong-ink/40'}`}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
