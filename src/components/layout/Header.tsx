import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Search, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../utils/i18nUtils';

interface SubItem {
    id: string;
    label: string;
    path?: string;
}

interface NavItem {
    id: string;
    label: string;
    subitems: SubItem[];
}

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isGlobalMuted, setIsGlobalMuted] = useState(true);

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

    // Mobile menu state
    const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

    // Desktop dropdown state
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const { i18n } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
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
        // 전역 객체에 현재 Mute 상태를 기록하여 라우팅/슬라이드 변경 시에도 상태 유지
        if (typeof window !== 'undefined') {
            (window as any).__GLOBAL_MUTED__ = isGlobalMuted;
        }

        // 전역 음소거 상태가 변경될 때마다 화면 내 모든 비디오 엘리먼트에 토글을 적용합니다.
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.dataset.hasSound === 'true') {
                video.muted = isGlobalMuted;
            }
        });
    }, [isGlobalMuted]);

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsLangMenuOpen(false);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleLangMenu = () => setIsLangMenuOpen(!isLangMenuOpen);

    const toggleMobileSubMenu = (menu: string) => {
        setExpandedMobileMenu(expandedMobileMenu === menu ? null : menu);
    };

    const getCurrentLangLabel = () => {
        const current = supportedLanguages.find(lang => lang.code === i18n.language);
        return current ? current.label : 'English';
    };

    const navItems: NavItem[] = [
        {
            id: 'trend',
            label: '트렌드',
            subitems: [
                { id: 'global', label: '글로벌 K-컬처', path: '/category/global' },
                { id: 'heritage', label: '전통의 현대화', path: '/category/heritage' }
            ]
        },
        {
            id: 'popup',
            label: '팝업',
            subitems: [
                { id: 'exchange', label: '문화 교류 부스', path: '/category/exchange' },
                { id: 'collab', label: '협업 프로젝트', path: '/category/collab' }
            ]
        },
        {
            id: 'performance_exhibition',
            label: '공연/전시',
            subitems: [
                { id: 'traditional', label: '전통 예술', path: '/category/traditional' },
                { id: 'media', label: '현대 미디어 아트', path: '/category/media' }
            ]
        },
        {
            id: 'activity_style',
            label: '활동/스타일',
            subitems: [
                { id: 'class', label: '문화 체험 클래스', path: '/category/class' },
                { id: 'style', label: '글로벌 K-스타일', path: '/category/kstyle' }
            ]
        },
        {
            id: 'local',
            label: '로컬',
            subitems: [
                { id: 'heritage', label: '지역 문화 유산', path: '/category/local_heritage' },
                { id: 'travel', label: '여행 큐레이션', path: '/category/travel_curation' }
            ]
        }
    ];

    return (
        <>
            <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-black/40 backdrop-blur-md border-b border-white/10 h-16'
                : 'bg-transparent border-b border-transparent h-20'
                }`}>
                <div className={`container mx-auto px-4 relative flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
                    <Link to="/" className="flex items-center space-x-2 group">
                        <img src="/department_circle_logo.png" alt="department logo" className="h-[56px] w-[56px] object-contain transition-transform duration-300 group-hover:scale-110" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="absolute left-1/2 -translate-x-1/2 hidden xl:flex items-center gap-10 font-sans">
                        {navItems.map((item) => (
                            <div
                                key={item.id}
                                className="relative group desktop-nav-item"
                            >
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                                    className={`flex items-center text-[20px] font-bold text-white/70 hover:text-white transition-all duration-300 gap-2 px-4 ${isScrolled ? 'h-16' : 'h-20'}`}
                                >
                                    {item.label}
                                    <ChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-52 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 origin-top ${activeDropdown === item.id ? 'opacity-100 visible translate-y-2 scale-100' : 'opacity-0 invisible translate-y-0 scale-95'}`}>
                                    <div className="py-3 flex flex-col relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent">
                                        {item.subitems.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                to={sub.path || `/floor/${item.id}/articles?filter=${sub.id}`}
                                                className="px-5 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left relative group/item"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                <span className="relative z-10">{sub.label}</span>
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-dancheong-red transition-all duration-200 group-hover/item:h-3/5" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* User Actions & Utilities */}
                    <div className="hidden lg:flex items-center space-x-5 font-sans">
                        {/* Audio Control */}
                        <button
                            onClick={() => setIsGlobalMuted(!isGlobalMuted)}
                            className="flex items-center text-white/70 hover:text-white transition-colors gap-1"
                            title={isGlobalMuted ? '소리 켜기' : '소리 끄기'}
                        >
                            {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        <div className="h-4 w-[1px] bg-white/10" />

                        {/* Search */}
                        <div className="relative flex items-center justify-end">
                            <div
                                className={`flex items-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden rounded-full ${isSearchOpen ? 'bg-white w-[260px] px-3 py-1.5' : 'bg-transparent w-[28px] px-0 py-0'
                                    }`}
                            >
                                <button
                                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                                    className={`flex items-center justify-center shrink-0 transition-colors ${isSearchOpen ? 'text-black/80 hover:text-black mr-2' : 'text-white/70 hover:text-white'
                                        }`}
                                    title="검색"
                                >
                                    <Search size={20} />
                                </button>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="검색어를 입력하세요."
                                    className={`w-full bg-transparent text-black text-sm outline-none placeholder:text-gray-400 font-sans ${isSearchOpen ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                                {isSearchOpen && (
                                    <button
                                        onClick={() => setIsSearchOpen(false)}
                                        className="text-gray-400 hover:text-black shrink-0 ml-1"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={toggleLangMenu}
                                className="flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors gap-1"
                            >
                                <Globe size={18} />
                                <span className="hidden xl:inline">{getCurrentLangLabel()}</span>
                            </button>

                            {isLangMenuOpen && (
                                <div className="absolute top-full right-0 mt-4 w-36 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 overflow-hidden z-[60] transition-all duration-300 origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-2">
                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    {supportedLanguages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang.code)}
                                            className={`w-full text-left px-5 py-2.5 text-sm hover:bg-white/5 transition-all duration-200 relative group/lang ${i18n.language === lang.code ? 'text-dancheong-red font-medium' : 'text-white/50 hover:text-white'
                                                }`}
                                        >
                                            <span className="relative z-10">{lang.label}</span>
                                            {i18n.language === lang.code && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 bg-dancheong-red" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-3 lg:hidden relative">
                        {/* Audio Control for Mobile */}
                        <button
                            onClick={() => setIsGlobalMuted(!isGlobalMuted)}
                            className="text-white/70 hover:text-white transition-colors relative z-10"
                            title={isGlobalMuted ? '소리 켜기' : '소리 끄기'}
                        >
                            {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        <div className={`flex items-center absolute right-[3.5rem] transition-all duration-300 ease-in-out overflow-hidden rounded-full ${isSearchOpen ? 'bg-white w-[200px] pl-3 pr-2 py-1.5 opacity-100 visible' : 'bg-transparent w-0 opacity-0 invisible pl-0 py-1'
                            }`}
                        >
                            <Search size={18} className="text-black/80 shrink-0 mr-2" />
                            <input
                                ref={mobileSearchInputRef}
                                type="text"
                                placeholder="검색어를 입력하세요."
                                className="w-full bg-transparent text-black text-sm outline-none placeholder:text-gray-400 font-sans"
                            />
                        </div>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`transition-colors relative z-10 ${isSearchOpen ? 'text-white' : 'text-white/70 hover:text-white'}`}
                        >
                            {isSearchOpen ? <X size={22} /> : <Search size={22} />}
                        </button>
                        <button className="text-white relative z-10" onClick={toggleMenu}>
                            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 h-[calc(100vh-64px)] overflow-y-auto animate-in slide-in-from-right duration-300 font-sans">
                        <div className="flex flex-col p-6 space-y-6">
                            {navItems.map((item) => (
                                <div key={item.id}>
                                    <button
                                        onClick={() => toggleMobileSubMenu(item.id)}
                                        className="flex items-center justify-between w-full text-white/80 hover:text-white text-lg font-medium"
                                    >
                                        {item.label}
                                        <ChevronDown size={20} className={`transition-transform ${expandedMobileMenu === item.id ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expandedMobileMenu === item.id && (
                                        <div className="flex flex-col mt-3 pl-4 space-y-4 border-l border-white/10 ml-1">
                                            {item.subitems.map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    to={sub.path || `/floor/${item.id}/articles?filter=${sub.id}`}
                                                    className="text-white/60 hover:text-white text-base"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <hr className="border-white/10" />

                            {/* Mobile Language Selector */}
                            <div className="py-2">
                                <p className="text-xs text-white/40 mb-3 uppercase font-bold tracking-widest">Language</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {supportedLanguages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                changeLanguage(lang.code);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`text-center px-3 py-2 rounded-lg text-sm border ${i18n.language === lang.code
                                                ? 'border-dancheong-red text-dancheong-red bg-dancheong-red/10'
                                                : 'border-white/10 text-white/60'
                                                }`}
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
        </>
    );
};

export default Header;
