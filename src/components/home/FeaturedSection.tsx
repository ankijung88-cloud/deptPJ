import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EventsDashboard from '../../pages/EventsDashboard';

export const FeaturedSection: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="min-h-[100dvh] w-full snap-start bg-[#2a2a2a] relative flex flex-col justify-center overflow-hidden pt-24 pb-12">
            {/* 헤더 */}
            <div className="container mx-auto px-6 mb-6 shrink-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm font-bold tracking-widest text-dancheong-red mb-3 uppercase flex items-center gap-2">
                        <CalendarIcon size={16} /> Promotion & Events
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                        {t('featured.title', '추천 & 이벤트')}
                    </h3>
                </motion.div>
            </div>

            {/* 이벤트 캘린더 + 상태 탭 */}
            <div className="container mx-auto px-6 flex-1 min-h-0">
                <EventsDashboard />
            </div>
        </section>
    );
};
