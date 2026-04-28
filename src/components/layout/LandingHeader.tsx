import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { LanguageSelector } from '../common/LanguageSelector';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const LandingHeader: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setIsMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const navItems = [
        { id: 'hero', label: t('hero.vision') },
        { id: 'floors', label: t('floor_guide') },
        { id: 'features', label: t('hero.features') },
        { id: 'partners', label: t('hero.partners') },
        { id: 'recruitment', label: t('hero.philosophy') }
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled
                    ? 'py-3 bg-white shadow-md border-b border-dancheong-ink/5'
                    : 'py-6 bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo Section - Left */}
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <BrandLogo size={40} />
                </div>

                {/* Navigation Links & Buttons - Right */}
                <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
                    <nav className="hidden xl:flex items-center gap-6 md:gap-8 border-r border-dancheong-ink/10 pr-10">
                        {navItems.filter(item => item.id !== 'floors').map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="group relative px-2 py-1"
                            >
                                <span className="text-xs sm:text-sm font-black text-dancheong-ink/60 group-hover:text-dancheong-ink transition-colors duration-300 uppercase tracking-widest">
                                    {item.label}
                                </span>
                                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-dancheong-mugwort transition-all duration-300 group-hover:w-full" />
                            </button>
                        ))}
                    </nav>

                    <div className="hidden xl:flex items-center gap-4">
                        <LanguageSelector variant="landing" />
                        <button
                            onClick={() => scrollToSection('floors')}
                            className="text-xs sm:text-sm font-black text-dancheong-ink/60 hover:text-dancheong-ink transition-colors duration-300 uppercase tracking-widest px-2"
                        >
                            {t('floor_guide')}
                        </button>
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="heritage-button-outline px-6 py-2.5 text-[10px] sm:text-xs font-black rounded-full border border-dancheong-ink/20 hover:border-dancheong-ink transition-all duration-500 tracking-widest uppercase bg-white"
                        >
                            <AutoTranslatedText text={t('hero.story')} />
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="xl:hidden flex items-center gap-3">
                        <LanguageSelector variant="landing" />
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-dancheong-ink p-2 -mr-2"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="xl:hidden bg-white border-t border-dancheong-ink/5 overflow-hidden"
                    >
                        <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="text-left py-2 font-bold text-dancheong-ink/80 text-sm"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <hr className="border-dancheong-ink/10" />
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    navigate('/admin/login');
                                }}
                                className="heritage-button-outline px-6 py-3 text-xs font-black rounded-full border border-dancheong-ink/20 text-center uppercase"
                            >
                                <AutoTranslatedText text={t('hero.story')} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default LandingHeader;
