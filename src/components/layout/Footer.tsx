import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-dancheong-ivory text-dancheong-ink/80 py-24 relative overflow-hidden border-t border-dancheong-ink/10">
            <div className="lossless-layout relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">

                    {/* Brand Meta */}
                    <div className="md:col-span-6 space-y-10">
                        <div className="flex items-center gap-6 mb-4">
                            <BrandLogo size={60} color="#171717" className="opacity-100" />
                            <div className="space-y-4">
                                <span className="text-[10px] font-black tracking-[0.5em] text-[#171717] uppercase block"><AutoTranslatedText text="Essence" /></span>
                                <h2 className="text-3xl font-serif font-black text-[#171717] tracking-widest uppercase">
                                    DEPART
                                </h2>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm font-medium italic text-[#171717]/80">
                            <AutoTranslatedText text={t('footer.description')} />
                        </p>
                        <div className="flex gap-8">
                            {['Instagram', 'Youtube', 'Pinterest'].map((social) => (
                                <a key={social} href="#" className="text-xs font-black tracking-widest uppercase text-[#171717] hover:text-[#4F6D5B] transition-colors border-b-2 border-transparent hover:border-[#4F6D5B] pb-1">
                                    <AutoTranslatedText text={social} />
                                </a>
                            ))}
                        </div>
                    </div>


                    <div className="md:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-black tracking-[0.3em] text-[#171717] uppercase"><AutoTranslatedText text={t('footer.support')} /></h4>
                        <ul className="space-y-4 text-xs font-black tracking-wide text-[#171717]/70">
                            <li><Link to="/notice" className="hover:text-[#171717] transition-colors"><AutoTranslatedText text={t('footer.notice')} /></Link></li>
                            <li><Link to="/faq" className="hover:text-[#171717] transition-colors"><AutoTranslatedText text={t('footer.faq')} /></Link></li>
                            <li><Link to="/agency/register" className="hover:text-[#171717] transition-colors"><AutoTranslatedText text={t('footer.partnership')} /></Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-black tracking-[0.3em] text-[#171717] uppercase"><AutoTranslatedText text={t('footer.contact')} /></h4>
                        <div className="space-y-4">
                            <span className="text-2xl font-serif font-black text-[#171717] block">1544-0000</span>
                            <p className="text-xs font-medium leading-relaxed text-[#171717]/70">
                                <AutoTranslatedText text={t('footer.weekdays')} />
                            </p>
                            <a
                                href="mailto:support@viastation.com"
                                className="inline-block text-[10px] font-black tracking-[0.3em] uppercase bg-[#4F6D5B] hover:bg-[#171717] text-white px-8 py-4 rounded-full transition-all shadow-[0_10px_30px_rgba(79,109,91,0.3)] text-center"
                            >
                                <AutoTranslatedText text="Send Inquiry" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Business Info Bar */}
                <div className="pt-12 border-t border-dancheong-ink/10 flex flex-col md:flex-row flex-wrap gap-x-8 gap-y-2 text-[10px] font-black text-[#171717] uppercase tracking-widest mb-8">
                    <span><AutoTranslatedText text={t('footer.representative')} /></span>
                    <span><AutoTranslatedText text={t('footer.business_id')} /></span>
                    <span><AutoTranslatedText text={t('footer.mail_order_id')} /></span>
                    <span><AutoTranslatedText text={t('footer.address')} /></span>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                    <p className="opacity-40"><AutoTranslatedText text={t('footer.copyright')} /></p>
                    <div className="flex space-x-8 mt-6 md:mt-0">
                        <Link to="/terms" className="hover:text-dancheong-ink transition-colors"><AutoTranslatedText text={t('footer.terms')} /></Link>
                        <Link to="/privacy" className="text-dancheong-ink/60 hover:text-dancheong-ink transition-colors"><AutoTranslatedText text={t('footer.privacy')} /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
