import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-[#F2E7D5] text-dancheong-ink/70 py-24 relative overflow-hidden border-t border-dancheong-ink/5">
            <div className="lossless-layout relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">

                    {/* Brand Meta */}
                    <div className="md:col-span-6 space-y-10">
                        <div className="flex items-center gap-6 mb-4">
                            <BrandLogo size={60} />
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm font-medium italic text-dancheong-ink/60">
                            <AutoTranslatedText text={t('footer.description')} />
                        </p>
                        <div className="flex gap-8">
                            {['Instagram', 'Youtube', 'Pinterest'].map((social) => (
                                <a key={social} href="#" className="text-xs font-black tracking-widest uppercase text-dancheong-ink/50 hover:text-dancheong-mugwort transition-colors border-b-2 border-transparent hover:border-dancheong-mugwort pb-1">
                                    <AutoTranslatedText text={social} />
                                </a>
                            ))}
                        </div>
                    </div>


                    <div className="md:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-black tracking-[0.3em] text-dancheong-ink/30 uppercase"><AutoTranslatedText text={t('footer.support')} /></h4>
                        <ul className="space-y-4 text-xs font-black tracking-wide text-dancheong-ink/60">
                            <li><Link to="/notice" className="hover:text-dancheong-ink transition-colors"><AutoTranslatedText text={t('footer.notice')} /></Link></li>
                            <li><Link to="/faq" className="hover:text-dancheong-ink transition-colors"><AutoTranslatedText text={t('footer.faq')} /></Link></li>
                            <li><Link to="/agency/register" className="hover:text-dancheong-ink transition-colors"><AutoTranslatedText text={t('footer.partnership')} /></Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-black tracking-[0.3em] text-dancheong-ink/30 uppercase"><AutoTranslatedText text={t('footer.contact')} /></h4>
                        <div className="space-y-4">
                            <span className="text-2xl font-serif font-black text-dancheong-ink/80 block"><AutoTranslatedText text="1544-0000" /></span>
                            <p className="text-xs font-medium leading-relaxed text-dancheong-ink/50">
                                <AutoTranslatedText text={t('footer.weekdays')} />
                            </p>
                            <div className="flex flex-col gap-3">
                                <a
                                    href="mailto:support@viastation.com"
                                    className="inline-block text-[10px] font-black tracking-[0.3em] uppercase bg-dancheong-mugwort hover:bg-dancheong-ink text-white px-8 py-4 rounded-full transition-all shadow-xl shadow-dancheong-mugwort/10 text-center whitespace-nowrap"
                                >
                                    <AutoTranslatedText text={t('footer.inquiry')} />
                                </a>
                                <a
                                    href="https://open.kakao.com/o/sLEAsasi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-[10px] font-black tracking-[0.3em] uppercase bg-[#FEE500] hover:bg-[#FAD000] text-[#3c1e1e] px-8 py-4 rounded-full transition-all shadow-xl shadow-yellow-500/10 text-center whitespace-nowrap"
                                >
                                    <AutoTranslatedText text={t('footer.kakao_inquiry')} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Info Bar */}
                <div className="pt-12 border-t border-dancheong-ink/5 flex flex-col md:flex-row flex-wrap gap-x-8 gap-y-2 text-[10px] font-black text-dancheong-ink/30 uppercase tracking-widest mb-8">
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
