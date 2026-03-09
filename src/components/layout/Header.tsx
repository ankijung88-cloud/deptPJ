import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { LanguageSelector } from '../common/LanguageSelector';

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
    const is3DStorePage = location.pathname === '/inspiration';
    const isAboutPage = location.pathname === '/about';

    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.dataset.hasSound === 'true') {
                video.muted = isGlobalMuted;
            }
        });
    }, [isGlobalMuted]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const toggleMobileSubMenu = (menu: string) => {
        setExpandedMobileMenu(expandedMobileMenu === menu ? null : menu);
    };

    const navItems: NavItem[] = [
        {
            id: 'floor1',
            level: 1,
            label: t('nav.floor1'),
            subitems: [
                { id: 'global', label: '글로벌 트렌드', path: '/category/global' },
                { id: 'window', label: '디지털 쇼윈도', path: '/category/window' },
                { id: 'f1_kpop', label: 'K-팝 스테이지', path: '/category/f1_kpop' },
                { id: 'f1_library', label: '트렌드 라이브러리', path: '/category/f1_library' },
                { id: 'f1_tech', label: '한류 테크존', path: '/category/f1_tech' }
            ]
        },
        {
            id: 'floor2',
            level: 2,
            label: t('nav.floor2'),
            subitems: [
                { id: 'sync', label: '시너지 공간', path: '/category/sync' },
                { id: 'pop', label: '다이내믹 팝업', path: '/category/pop' },
                { id: 'f2_lab', label: '브랜드 랩', path: '/category/f2_lab' },
                { id: 'f2_art', label: '아트 콜라보', path: '/category/f2_art' },
                { id: 'f2_gallery', label: '한정판 갤러리', path: '/category/f2_gallery' }
            ]
        },
        {
            id: 'floor3',
            level: 3,
            label: t('nav.floor3'),
            subitems: [
                { id: 'performance', label: '공연 실황', path: '/category/performance' },
                { id: 'exhibit', label: '가상 전시', path: '/category/exhibit' },
                { id: 'f3_media', label: '미디어 아트 홀', path: '/category/f3_media' },
                { id: 'f3_lounge', label: '아티스트 라운지', path: '/category/f3_lounge' },
                { id: 'f3_audio', label: '사운드 아카이브', path: '/category/f3_audio' }
            ]
        },
        {
            id: 'floor4',
            level: 4,
            label: t('nav.floor4'),
            subitems: [
                { id: 'talk', label: '문화 담론', path: '/category/talk' },
                { id: 'interview', label: '아티스트 인터뷰', path: '/category/interview' },
                { id: 'f4_plus', label: '토크 플러스', path: '/category/f4_plus' },
                { id: 'f4_book', label: '도서관 섹션', path: '/category/f4_book' },
                { id: 'f4_seminar', label: '세미나 룸', path: '/category/f4_seminar' }
            ]
        },
        {
            id: 'floor5',
            level: 5,
            label: t('nav.floor5'),
            subitems: [
                { id: 'archive', label: '패션 아카이브', path: '/category/archive' },
                { id: 'collection', label: '시즌 컬렉션', path: '/category/collection' },
                { id: 'f5_material', label: '소재 도서관', path: '/category/f5_material' },
                { id: 'f5_fitting', label: '피팅 스튜디오', path: '/category/f5_fitting' },
                { id: 'f5_textile', label: '텍스타일 룸', path: '/category/f5_textile' }
            ]
        },
        {
            id: 'floor6',
            level: 6,
            label: t('nav.floor6'),
            subitems: [
                { id: 'heritage', label: '지역 문화 유산', path: '/category/heritage' },
                { id: 'travel', label: '전략적 앵커', path: '/category/travel' },
                { id: 'f6_gourmet', label: '미식 아카이브', path: '/category/f6_gourmet' },
                { id: 'f6_craft', label: '지역 공예관', path: '/category/f6_craft' },
                { id: 'f6_tour', label: '헤리티지 투어', path: '/category/f6_tour' }
            ]
        }
    ];

    return (
        <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${isScrolled
            ? 'bg-[#1A2420]/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            : 'bg-gradient-to-b from-[#1E2924] to-[#1E2924]/90 shadow-[0_15px_40px_rgba(0,0,0,0.4)]'
            }`}
            style={{
                borderBottomLeftRadius: isScrolled ? '0' : '50% 16px',
                borderBottomRightRadius: isScrolled ? '0' : '50% 16px'
            }}
        >
            {/* Gyeongbokgung Eaves (Cheoma) Decoration Line */}
            <div className={`absolute bottom-0 left-0 right-0 pointer-events-none flex flex-col justify-end transition-opacity duration-700 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-full h-[1px] bg-dancheong-gold/40" />
                <div className="w-full h-[3px] bg-dancheong-red/90" />
                <div className="w-full h-[1px] bg-[#000000]/60" />
            </div>

            <div className={`max-w-[1800px] mx-auto px-6 lg:px-12 flex items-center justify-between transition-all duration-700 relative z-10 ${isScrolled ? 'h-16' : 'h-24'}`}>
                <Link to="/" className="flex items-center space-x-2 group magnetic-target">
                    <img src="/department_circle_logo.png" alt="department logo" className="h-[56px] w-[56px] object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
                </Link>

                {/* Desktop Navigation */}
                {!is3DStorePage && !isAboutPage && (
                    <nav className="hidden xl:flex items-center space-x-2 font-serif">
                        {navItems.map((item) => (
                            <div
                                key={item.id}
                                className="relative group desktop-nav-item"
                                onMouseEnter={() => setActiveDropdown(item.id)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    to={`/inspiration?floor=${item.level}`}
                                    className={`flex items-start text-[16px] xl:text-[18px] font-medium tracking-wider transition-colors duration-300 gap-1.5 px-3 xl:px-4 py-6 ${activeDropdown === item.id ? 'text-dancheong-gold' : 'text-dancheong-white/80 hover:text-dancheong-white'}`}
                                >
                                    <div className="flex flex-col text-left leading-tight">
                                        <span className="whitespace-nowrap font-bold text-dancheong-gold/60 text-[12px] mb-0.5">
                                            <AutoTranslatedText text={item.label.split(' | ')[0]} />
                                        </span>
                                        <div className="flex flex-col text-[14px] xl:text-[16px]">
                                            {item.label.split(' | ')[1].split(' ').map((word, idx) => (
                                                <span key={idx} className="whitespace-nowrap"><AutoTranslatedText text={word} /></span>
                                            ))}
                                        </div>
                                    </div>
                                    <ChevronDown size={12} className={`transition-transform duration-300 mt-1 shrink-0 ${activeDropdown === item.id ? 'rotate-180 text-dancheong-gold' : 'text-dancheong-white/50'}`} />
                                </Link>

                                {/* Dropdown Menu - Sub eaves style */}
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-52 bg-[#1A2420]/95 backdrop-blur-xl border-t-2 border-dancheong-red rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-400 origin-top ${activeDropdown === item.id ? 'opacity-100 visible translate-y-1 scale-100' : 'opacity-0 invisible -translate-y-2 scale-95'}`}>
                                    <div className="py-2 flex flex-col relative font-sans">
                                        {item.subitems.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                to={sub.path || `/floor/${item.id}/articles?filter=${sub.id}`}
                                                className="px-5 py-3 text-sm tracking-wide text-dancheong-white/70 hover:text-dancheong-gold hover:bg-white/5 transition-all duration-200 text-left relative group/item"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                <span className="relative z-10"><AutoTranslatedText text={sub.label} /></span>
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-dancheong-gold transition-all duration-300 group-hover/item:h-3/5" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </nav>
                )}

                {/* User Actions & Utilities */}
                {!isAboutPage && (
                    <div className="hidden lg:flex items-center space-x-6 font-sans">
                        <button
                            onClick={() => setIsGlobalMuted(!isGlobalMuted)}
                            className={`flex items-center transition-colors gap-1 p-2 ${is3DStorePage ? 'text-[#2c3e50]/70 hover:text-[#2c3e50]' : 'text-dancheong-white/70 hover:text-dancheong-gold'}`}
                            title={isGlobalMuted ? '소리 켜기' : '소리 끄기'}
                        >
                            {isGlobalMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>

                        <div className={`h-4 w-[1px] ${is3DStorePage ? 'bg-[#2c3e50]/30' : 'bg-dancheong-gold/30'}`} />

                        {/* Search */}
                        <div className="relative flex items-center justify-end">
                            <div
                                className={`flex items-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden rounded-full ${isSearchOpen ? 'bg-white/10 border border-dancheong-gold/40 backdrop-blur-md w-[260px] px-3 py-1.5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'bg-transparent border border-transparent w-[28px] px-0 py-0'
                                    }`}
                            >
                                <button
                                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                                    className={`flex items-center justify-center shrink-0 transition-colors ${isSearchOpen ? 'text-dancheong-gold mr-2' : (is3DStorePage ? 'text-[#2c3e50]/70 hover:text-[#2c3e50]' : 'text-dancheong-white/70 hover:text-dancheong-gold')
                                        }`}
                                    title="검색"
                                >
                                    <Search size={18} />
                                </button>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={i18n.language === 'ko' ? "검색어를 입력하세요." : "Enter search term..."}
                                    className={`w-full bg-transparent text-dancheong-white text-sm outline-none placeholder:text-dancheong-white/40 font-sans tracking-wide ${isSearchOpen ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                                {isSearchOpen && (
                                    <button
                                        onClick={() => setIsSearchOpen(false)}
                                        className="text-dancheong-white/50 hover:text-dancheong-gold shrink-0 ml-1 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="ml-auto"><LanguageSelector is3DStorePage={is3DStorePage} /></div>
                    </div>
                )}

                {/* Mobile Menu Button */}
                {!isAboutPage && (
                    <div className="flex items-center space-x-4 lg:hidden relative">
                        <button
                            onClick={() => setIsGlobalMuted(!isGlobalMuted)}
                            className={`transition-colors relative z-10 ${is3DStorePage ? 'text-[#2c3e50]/70 hover:text-[#2c3e50]' : 'text-dancheong-white/70 hover:text-dancheong-gold'}`}
                            title={isGlobalMuted ? '소리 켜기' : '소리 끄기'}
                        >
                            {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        <div className={`flex items-center absolute right-[3.5rem] transition-all duration-400 ease-in-out overflow-hidden rounded-full ${isSearchOpen ? 'bg-[#1A2420]/90 border border-dancheong-gold/30 backdrop-blur-md w-[200px] pl-3 pr-2 py-1.5 opacity-100 visible shadow-lg' : 'bg-transparent border border-transparent w-0 opacity-0 invisible pl-0 py-1'
                            }`}
                        >
                            <Search size={18} className="text-dancheong-gold shrink-0 mr-2" />
                            <input
                                ref={mobileSearchInputRef}
                                type="text"
                                placeholder="검색어를 입력하세요."
                                className="w-full bg-transparent text-dancheong-white text-sm outline-none placeholder:text-dancheong-white/40 font-sans tracking-wide"
                            />
                        </div>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`transition-colors relative z-10 ${isSearchOpen ? 'text-dancheong-gold' : (is3DStorePage ? 'text-[#2c3e50]/70 hover:text-[#2c3e50]' : 'text-dancheong-white/70 hover:text-dancheong-gold')}`}
                        >
                            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                        </button>
                        {!is3DStorePage && (
                            <button className="text-dancheong-white/90 hover:text-dancheong-gold transition-colors relative z-10" onClick={toggleMenu}>
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-[#1A2420]/95 backdrop-blur-2xl border-t-2 border-dancheong-red h-[calc(100vh-64px)] overflow-y-auto animate-in slide-in-from-right duration-300 font-sans shadow-inner">
                    <div className="flex flex-col p-6 space-y-6">
                        {navItems.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Link
                                        to={`/inspiration?floor=${item.level}`}
                                        className="text-dancheong-white/90 hover:text-dancheong-gold text-lg font-serif font-medium tracking-wide py-1 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <AutoTranslatedText text={item.label} />
                                    </Link>
                                    <button
                                        onClick={() => toggleMobileSubMenu(item.id)}
                                        className="p-2 text-dancheong-white/40 hover:text-dancheong-gold transition-colors"
                                    >
                                        <ChevronDown size={20} className={`transition-transform ${expandedMobileMenu === item.id ? 'rotate-180 text-dancheong-gold' : ''}`} />
                                    </button>
                                </div>
                                {expandedMobileMenu === item.id && (
                                    <div className="flex flex-col mt-3 pl-4 space-y-4 border-l-2 border-dancheong-gold/20 ml-1">
                                        {item.subitems.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                to={sub.path || `/floor/${item.id}/articles?filter=${sub.id}`}
                                                className="text-dancheong-white/60 hover:text-dancheong-gold text-base tracking-wide transition-colors"
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

                        {/* Mobile Language Selector */}
                        <div className="py-2">
                            <p className="text-xs text-dancheong-gold/60 mb-3 uppercase font-bold tracking-widest font-serif">Language</p>
                            <div className="grid grid-cols-3 gap-2">
                                {i18n.language && supportedLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            i18n.changeLanguage(lang.code);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`text-center px-2 py-2.5 rounded-lg text-[11px] transition-all tracking-wide ${i18n.language === lang.code
                                            ? 'bg-dancheong-red text-white font-bold shadow-lg shadow-dancheong-red/20'
                                            : 'bg-white/5 text-dancheong-white/60 hover:text-dancheong-gold hover:bg-white/10'
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
    );
};

export default Header;
