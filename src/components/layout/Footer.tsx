import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-dancheong-deep-bg text-dancheong-white/60 py-24 relative overflow-hidden border-t border-dancheong-border">
            {/* Rising Glow Effect - Muted Red Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-dancheong-red/10 blur-[150px] rounded-t-full pointer-events-none z-0" />

            <div className="lossless-layout relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">

                    {/* Brand Meta */}
                    <div className="md:col-span-5 space-y-10">
                        <div className="flex items-center gap-6 mb-4">
                            <img src="/dept_logo.svg" alt="department logo" className="h-20 w-auto opacity-80" />
                            <div className="space-y-4">
                                <span className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase block"><AutoTranslatedText text="본질" /></span>
                                <h2 className="text-3xl font-serif font-black text-dancheong-white tracking-widest uppercase">
                                    <AutoTranslatedText text="백화점" />
                                </h2>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm font-light italic">
                            <AutoTranslatedText text={t('footer.description')} />
                        </p>
                        <div className="flex gap-8">
                            {['Instagram', 'Youtube', 'Pinterest'].map((social) => (
                                <a key={social} href="#" className="text-xs font-bold tracking-widest uppercase hover:text-dancheong-white transition-colors border-b border-transparent hover:border-dancheong-red/20 pb-1">
                                    <AutoTranslatedText text={social} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="md:col-span-2 space-y-8">
                        <h4 className="text-[10px] font-bold tracking-[0.3em] text-white uppercase"><AutoTranslatedText text={t('footer.shop')} /></h4>
                        <ul className="space-y-4 text-xs font-light tracking-wide">
                            <li><Link to="/floor/floor3/articles" className="hover:text-white transition-colors"><AutoTranslatedText text={t('nav.tickets')} /></Link></li>
                            <li><Link to="/floor/floor4/articles" className="hover:text-white transition-colors"><AutoTranslatedText text={t('nav.art')} /></Link></li>
                            <li><Link to="/floor/floor6/articles" className="hover:text-white transition-colors"><AutoTranslatedText text={t('nav.travel')} /></Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2 space-y-8">
                        <h4 className="text-[10px] font-bold tracking-[0.3em] text-white uppercase"><AutoTranslatedText text={t('footer.support')} /></h4>
                        <ul className="space-y-4 text-xs font-light tracking-wide">
                            <li><Link to="/notice" className="hover:text-white transition-colors"><AutoTranslatedText text={t('footer.notice')} /></Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors"><AutoTranslatedText text={t('footer.faq')} /></Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-bold tracking-[0.3em] text-dancheong-white uppercase"><AutoTranslatedText text={t('footer.contact')} /></h4>
                        <div className="space-y-4">
                            <span className="text-2xl font-serif font-bold text-dancheong-white block">1544-0000</span>
                            <p className="text-xs font-light leading-relaxed">
                                <AutoTranslatedText text={t('footer.weekdays')} />
                            </p>
                            <a
                                href="mailto:support@culturedpt.store"
                                className="inline-block text-[10px] font-black tracking-[0.3em] uppercase bg-dancheong-vibrant-red/10 hover:bg-dancheong-vibrant-red/20 text-white px-8 py-4 rounded-full border border-dancheong-vibrant-red/30 transition-all shadow-[0_0_20_rgba(161,45,39,0.2)] text-center"
                            >
                                <AutoTranslatedText text="문의 보내기" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-dancheong-border flex flex-col md:flex-row justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                    <p className="opacity-30"><AutoTranslatedText text={t('footer.copyright')} /></p>
                    <div className="flex space-x-8 mt-6 md:mt-0">
                        <Link to="/terms" className="hover:text-white transition-colors"><AutoTranslatedText text={t('footer.terms')} /></Link>
                        <Link to="/privacy" className="text-white/40 hover:text-white transition-colors"><AutoTranslatedText text={t('footer.privacy')} /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
