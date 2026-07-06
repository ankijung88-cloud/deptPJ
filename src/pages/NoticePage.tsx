import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { Megaphone, Calendar, ChevronRight } from 'lucide-react';
import { getNotices } from '../api/notices';
import { Notice } from '../types';

const NOTICES: Notice[] = [
    {
        id: '1',
        title: { ko: 'FLOOR C 그랜드 오픈 및 멤버십 혜택 안내', en: 'Grand Opening & Membership Benefits' },
        category: '공지',
        date: '2024-03-01',
        content: { ko: 'FLOOR C가 정식 오픈하였습니다. 멤버십 가입 시 다양한 혜택을 드립니다.' },
        is_important: true
    },
    {
        id: '2',
        title: { ko: '봄 시즌 한정 예술품 입고 안내', en: 'Spring Season Limited Art Collection' },
        category: '전시',
        date: '2024-03-10',
        content: { ko: '따스한 봄을 맞아 엄선된 예술가들의 작품이 새롭게 입고되었습니다.' },
        is_important: false
    },
    {
        id: '3',
        title: { ko: '지하 주차장 보수 공사 일정 안내', en: 'Parking Lot Maintenance Schedule' },
        category: '공지',
        date: '2024-03-15',
        content: { ko: '3월 25일부터 27일까지 주차장 일부 구역의 보수 공사가 진행됩니다.' },
        is_important: false
    }
];

const NoticePage: React.FC = () => {
    const { t } = useTranslation();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            setLoading(true);
            try {
                const data = await getNotices();
                if (data && data.length > 0) {
                    setNotices(data);
                } else {
                    setNotices(NOTICES);
                }
            } catch (error) {
                console.error('Failed to fetch notices, using fallback:', error);
                setNotices(NOTICES);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    useEffect(() => {
        if (!loading && window.location.hash) {
            const id = window.location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    }, [loading]);

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 text-dancheong-ink">
            <div className="lossless-layout">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 text-dancheong-mugwort text-sm font-black tracking-[0.4em] uppercase mb-6"
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
                        className="text-dancheong-ink/60 max-w-2xl mx-auto italic font-light"
                    >
                        <AutoTranslatedText text="FLOOR C의 새로운 소식과 안내사항을 전해드립니다." />
                    </motion.p>
                </div>

                {/* Notice List */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-dancheong-ink/20 uppercase tracking-[0.2em] text-xs font-bold leading-relaxed">
                            <AutoTranslatedText text="Loading notices..." />
                        </div>
                    ) : notices.length === 0 ? (
                        <div className="text-center py-20 text-dancheong-ink/20 italic font-light">
                            <AutoTranslatedText text="등록된 공지사항이 없습니다." />
                        </div>
                    ) : notices.map((notice, index) => (
                        <motion.div
                            key={notice.id}
                            id={`notice-${notice.id}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/60 border border-dancheong-ink/5 rounded-2xl transition-all duration-300 group-hover:border-dancheong-mugwort/30 shadow-sm group-hover:shadow-md" />
                            <div className="relative p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${notice.is_important ? 'bg-dancheong-mugwort text-white' : 'bg-dancheong-ink/5 text-dancheong-ink/60'
                                        }`}>
                                        <AutoTranslatedText text={notice.category} />
                                    </span>
                                    <h3 className="text-lg font-medium text-dancheong-ink group-hover:text-dancheong-mugwort transition-colors flex-grow">
                                        <AutoTranslatedText text={typeof notice.title === 'string' ? notice.title : (notice.title.ko || notice.title.en || '')} />
                                    </h3>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-6">
                                    <div className="flex items-center gap-2 text-dancheong-ink/40 text-xs font-light">
                                        <Calendar size={14} />
                                        <span>{notice.date}</span>
                                    </div>
                                    <ChevronRight className="text-dancheong-ink/20 group-hover:text-dancheong-mugwort transform group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination Placeholder */}
                <div className="mt-16 flex justify-center gap-2">
                    {[1, 2, 3].map(n => (
                        <button key={n} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${n === 1 ? 'bg-dancheong-mugwort text-white' : 'bg-dancheong-ink/10 text-dancheong-ink/40 hover:bg-dancheong-ink/20'
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
