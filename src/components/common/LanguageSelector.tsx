import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../utils/i18nUtils';

interface LanguageSelectorProps {
    variant?: 'header' | 'floating';
}

/**
 * Reusable LanguageSelector component.
 * Supports a 'header' variant for the main navigation and a 'floating' variant for immersive pages.
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    variant = 'header'
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
        <div className={`lang-selector-container pointer-events-auto ${isFloating ? 'fixed bottom-6 right-6 md:top-32 md:right-8 md:bottom-auto z-[10000]' : 'relative'}`}>
            <button
                onClick={toggleMenu}
                className={`flex items-center text-sm font-medium transition-colors gap-1.5 p-2 ${isFloating
                    ? 'bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-white hover:bg-zinc-800 shadow-2xl px-3 md:px-5 py-2.5 rounded-full active:scale-95 transition-transform'
                    : 'rounded-full text-[#171717]/80 hover:text-[#171717]'
                    }`}
            >
                <Globe size={isFloating ? 20 : 18} />
                <span className={`${isFloating ? 'hidden md:inline' : 'hidden xl:inline'} tracking-wider`}>
                    {getCurrentLangLabel()}
                </span>
            </button>

            {isMenuOpen && (
                <div className={`absolute right-0 bg-zinc-900 backdrop-blur-2xl border-t-2 border-dancheong-red shadow-[0_30px_80px_rgba(0,0,0,0.7)] p-4 z-[10000] transition-all duration-300 origin-bottom-right md:origin-top-right animate-in fade-in zoom-in-95 font-sans ${isFloating ? 'w-[280px] md:w-[320px] bottom-full md:bottom-auto md:top-full mb-4 md:mb-0 md:mt-4 rounded-xl md:rounded-l-xl md:rounded-r-none border-r-0' : 'w-[450px] top-full mt-4 rounded-b-xl'
                    }`}>
                    <div className={`grid ${isFloating ? 'grid-cols-2' : 'grid-cols-3'} gap-1`}>
                        {supportedLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`flex items-center px-4 py-2.5 text-xs hover:bg-white/10 rounded-lg transition-all duration-300 relative group/lang tracking-wider ${i18n.language === lang.code
                                    ? 'text-[#D4AF37] font-extrabold bg-white/10'
                                    : 'text-zinc-400 hover:text-white hover:translate-x-1'
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
