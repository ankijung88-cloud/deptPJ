import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-[#222222] text-white/60 py-12 border-t border-white/5">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <div className="flex items-center space-x-2 mb-4">
                        <img src="/department_circle_logo.png" alt="department logo" className="h-[56px] w-[56px] object-contain" />
                        <span className="text-xl font-serif font-bold text-white">department</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                        {t('footer.description')}
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-medium mb-4">{t('footer.shop')}</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/tickets" className="hover:text-dancheong-red transition-colors">{t('nav.tickets')}</Link></li>
                        <li><Link to="/art" className="hover:text-dancheong-red transition-colors">{t('nav.art')}</Link></li>
                        <li><Link to="/travel" className="hover:text-dancheong-red transition-colors">{t('nav.travel')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-medium mb-4">{t('footer.support')}</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/notice" className="hover:text-dancheong-red transition-colors">{t('footer.notice')}</Link></li>
                        <li><Link to="/faq" className="hover:text-dancheong-red transition-colors">{t('footer.faq')}</Link></li>
                        <li><Link to="/contact" className="hover:text-dancheong-red transition-colors">{t('footer.inquiry')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-medium mb-4">{t('footer.contact')}</h4>
                    <p className="text-sm">
                        Customer Center<br />
                        <span className="text-lg font-bold text-white block my-1">1544-0000</span>
                        {t('footer.weekdays')}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs">
                <p>{t('footer.copyright')}</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <Link to="/terms" className="hover:text-white">{t('footer.terms')}</Link>
                    <Link to="/privacy" className="hover:text-white font-bold">{t('footer.privacy')}</Link>
                </div>
            </div>
        </footer>
    );
};
