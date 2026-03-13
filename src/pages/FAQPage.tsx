import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';
import { getFaqs } from '../api/faqs';
import { FAQ } from '../types';

const FAQ_DATA = [
    {
        id: '1',
        question: '문화상점의 운영 시간은 어떻게 되나요?',
        answer: '저희 문화상점은 연중무휴로 오전 10시 30분부터 오후 8시까지 운영됩니다. 다만, 특별 행사가 있는 경우 운영 시간이 조정될 수 있으니 공지사항을 확인해 주시기 바랍니다.'
    },
    {
        id: '2',
        question: '주차는 가능한가요?',
        answer: '네, 상점 건물 지하 1층부터 3층까지 넓은 주차 공간이 마련되어 있습니다. 상품 구매 고객께는 구매 금액에 따라 최대 4시간까지 무료 주차권을 제공해 드립니다.'
    },
    {
        id: '3',
        question: '멤버십 혜택은 무엇인가요?',
        answer: '문화상점 멤버십 회원이 되시면 모든 상품 구매 시 3% 포인트 적립, 생일 당일 10% 할인 쿠폰 발급, 그리고 시즌별 한정품 우선 구매권 등의 혜택을 누리실 수 있습니다.'
    },
    {
        id: '4',
        question: '상품권 사용이 가능한가요?',
        answer: '네, 문화상품권, 백화점 상품권(신세계/롯데/현대) 및 문화상점 전용 디지털 기프트카드를 모두 사용하실 수 있습니다.'
    },
    {
        id: '5',
        question: '환불 및 교환 규정은 어떻게 되나요?',
        answer: '구매 후 7일 이내에 영수증과 미개봉 상태의 상품을 지참하시면 환불 및 교환이 가능합니다. 단, 일부 신선 제품이나 한정판 예술품의 경우 규정이 다를 수 있습니다.'
    }
];

const FAQPage: React.FC = () => {
    const { t } = useTranslation();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            try {
                const data = await getFaqs();
                if (data && data.length > 0) {
                    setFaqs(data);
                } else {
                    setFaqs(FAQ_DATA.map(f => ({ ...f, question: { ko: f.question }, answer: { ko: f.answer } })) as any);
                }
            } catch (error) {
                console.error('Failed to fetch faqs, using fallback:', error);
                setFaqs(FAQ_DATA.map(f => ({ ...f, question: { ko: f.question }, answer: { ko: f.answer } })) as any);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const displayLocalized = (text: any) => {
        if (!text) return '';
        if (typeof text === 'string') return text;
        return text.ko || text.en || Object.values(text)[0] || '';
    };

    return (
        <div className="min-h-screen bg-dancheong-deep-bg text-white pb-20">
            <div className="lossless-layout">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-dancheong-red/10 border border-dancheong-red/30 rounded-full text-dancheong-red text-xs font-bold tracking-widest uppercase mb-6"
                    >
                        <HelpCircle size={14} />
                        <AutoTranslatedText text="도움말" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif font-bold mb-6 tracking-tight"
                    >
                        <AutoTranslatedText text={t('footer.faq')} />
                    </motion.h1>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative group">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-dancheong-red/30 transition-all duration-300" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-dancheong-red transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder={t('faq.search_placeholder') || 'Search...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full relative bg-transparent border-none py-6 pl-16 pr-8 text-white focus:outline-none placeholder:text-white/20"
                    />
                </div>

                {/* FAQ List */}
                <div className="max-w-3xl mx-auto space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-white/20">Loading FAQs...</div>
                    ) : faqs.filter(faq =>
                        displayLocalized(faq.question).toLowerCase().includes(searchTerm.toLowerCase()) ||
                        displayLocalized(faq.answer).toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                        <div className="text-center py-20 text-white/20">No matching questions found.</div>
                    ) : faqs.filter(faq =>
                        displayLocalized(faq.question).toLowerCase().includes(searchTerm.toLowerCase()) ||
                        displayLocalized(faq.answer).toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((faq) => (
                        <div key={faq.id} className="relative overflow-hidden group">
                            <button
                                onClick={() => setOpenId(openId === String(faq.id) ? null : String(faq.id))}
                                className={`w-full text-left p-6 flex items-center justify-between transition-all relative z-10 ${openId === String(faq.id) ? 'bg-white/10 shadow-2xl' : 'bg-white/5 hover:bg-white/8'
                                    } rounded-2xl border border-white/10`}
                            >
                                <span className="text-lg font-medium group-hover:text-dancheong-red transition-colors">
                                    <AutoTranslatedText text={displayLocalized(faq.question)} />
                                </span>
                                <ChevronDown
                                    className={`transition-transform duration-300 ${openId === String(faq.id) ? 'rotate-180 text-dancheong-red' : 'text-white/20'}`}
                                    size={20}
                                />
                            </button>

                            <AnimatePresence>
                                {openId === String(faq.id) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-8 pb-10 text-white/60 leading-relaxed font-light italic border-x border-b border-white/10 rounded-b-2xl -mt-4 bg-white/5">
                                            <AutoTranslatedText text={displayLocalized(faq.answer)} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 text-center">
                    <p className="text-white/40 mb-6 font-light">
                        <AutoTranslatedText text="찾으시는 내용이 없으신가요?" />
                    </p>
                    <a
                        href="mailto:support@culturedpt.store"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-dancheong-red hover:bg-red-700 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-dancheong-red/20 transform hover:-translate-y-1"
                    >
                        <AutoTranslatedText text="1:1 문의하기" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
