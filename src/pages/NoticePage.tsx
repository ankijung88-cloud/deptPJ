import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { Megaphone, Calendar, ChevronRight } from 'lucide-react';

const NOTICES = [
    {
        id: 1,
        title: 'Culture Dept. Store 그랜드 오픈 안내',
        date: '2026.03.10',
        category: '공지',
        important: true
    },
    {
        id: 2,
        title: '4F 컬처 토크: 명인과의 대화 예약 시작',
        date: '2026.03.08',
        category: '이벤트',
        important: false
    },
    {
        id: 3,
        title: '시스템 점검으로 인한 서비스 일시 중단 안내',
        date: '2026.03.05',
        category: '점검',
        important: false
    },
    {
        id: 4,
        title: '6F 로컬 헤리티지: 서촌 산책 투어 코스 업데이트',
        date: '2026.03.01',
        category: '새소식',
        important: false
    }
];

const NoticePage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-dancheong-deep-bg text-white pt-32 pb-20">
            <div className="lossless-layout">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 text-dancheong-red text-sm font-black tracking-[0.4em] uppercase mb-6"
                        style={{ textShadow: '0 0 15px rgba(235, 59, 45, 0.4)' }}
                    >
                        <Megaphone size={16} />
                        <AutoTranslatedText text="공지사항" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif font-black mb-10 tracking-tight"
                    >
                        <AutoTranslatedText text={t('footer.notice')} />
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 max-w-2xl mx-auto italic font-light"
                    >
                        <AutoTranslatedText text="Department의 새로운 소식과 안내사항을 전해드립니다." />
                    </motion.p>
                </div>

                {/* Notice List */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {NOTICES.map((notice, index) => (
                        <motion.div
                            key={notice.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl transition-all duration-300 group-hover:bg-white/10 group-hover:border-dancheong-red/30" />
                            <div className="relative p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${notice.important ? 'bg-dancheong-red text-white' : 'bg-white/10 text-white/60'
                                        }`}>
                                        <AutoTranslatedText text={notice.category} />
                                    </span>
                                    <h3 className="text-lg font-medium text-white group-hover:text-dancheong-red transition-colors flex-grow">
                                        <AutoTranslatedText text={notice.title} />
                                    </h3>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-6">
                                    <div className="flex items-center gap-2 text-white/40 text-xs font-light">
                                        <Calendar size={14} />
                                        <span>{notice.date}</span>
                                    </div>
                                    <ChevronRight className="text-white/20 group-hover:text-dancheong-red transform group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination Placeholder */}
                <div className="mt-16 flex justify-center gap-2">
                    {[1, 2, 3].map(n => (
                        <button key={n} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${n === 1 ? 'bg-dancheong-red text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NoticePage;
