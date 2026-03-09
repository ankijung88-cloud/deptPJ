import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../utils/i18nUtils';

interface LanguageSelectorProps {
    variant?: 'header' | 'floating';
    is3DStorePage?: boolean;
}

/**
 * Reusable LanguageSelector component.
 * Supports a 'header' variant for the main navigation and a 'floating' variant for immersive pages.
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    variant = 'header',
    is3DStorePage = false
}) => {
    const { i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsMenuOpen(false);
    };

    const getCurrentLangLabel = () => {
        const current = supportedLanguages.find(lang => lang.code === i18n.language);
        return current ? current.label : 'English';
    };

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.lang-selector-container')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const isFloating = variant === 'floating';

    return (
        <div className={`lang-selector-container ${isFloating ? 'fixed top-6 right-0 z-[100]' : 'relative'}`}>
            <button
                onClick={toggleMenu}
                className={`flex items-center text-sm font-medium transition-colors gap-1.5 p-2 ${isFloating
                    ? 'bg-black/40 backdrop-blur-xl border border-white/10 border-r-0 text-white hover:bg-black/60 shadow-2xl px-4 py-2 rounded-l-full'
                    : (is3DStorePage ? 'rounded-full text-[#2c3e50]/70 hover:text-[#2c3e50]' : 'rounded-full text-dancheong-white/70 hover:text-dancheong-gold')
                    }`}
            >
                <Globe size={isFloating ? 20 : 18} />
                <span className={`${isFloating ? 'inline' : 'hidden xl:inline'} tracking-wider`}>
                    {getCurrentLangLabel()}
                </span>
            </button>

            {isMenuOpen && (
                <div className={`absolute right-0 mt-4 bg-[#1A2420]/95 backdrop-blur-xl border-t-2 border-dancheong-red shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3 z-[110] transition-all duration-300 origin-top-right animate-in fade-in zoom-in-95 font-sans ${isFloating ? 'w-[300px] top-full rounded-l-xl rounded-r-none border-r-0' : 'w-[420px] top-full rounded-b-xl'
                    }`}>
                    <div className={`grid ${isFloating ? 'grid-cols-2' : 'grid-cols-3'} gap-1`}>
                        {supportedLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`flex items-center px-4 py-2 text-xs hover:bg-white/5 rounded-lg transition-all duration-200 relative group/lang tracking-wide ${i18n.language === lang.code
                                    ? 'text-dancheong-gold font-bold bg-white/5'
                                    : 'text-dancheong-white/70 hover:text-dancheong-gold'
                                    }`}
                            >
                                <span className="relative z-10 truncate">{lang.label}</span>
                                {i18n.language === lang.code && (
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-[2px] h-2/5 bg-dancheong-red" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
