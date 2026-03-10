import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';

const FAQ_DATA = [
    {
        id: 1,
        question: '방문 시 주차가 가능한가요?',
        answer: '네, department 건물 지하 2층부터 4층까지 대규모 주차 공간이 마련되어 있습니다. 상품 구매 또는 전시 관람 고객님께는 무료 주차 혜택을 드립니다.'
    },
    {
        id: 2,
        question: '전시 티켓 예매는 어떻게 하나요?',
        answer: '홈페이지 상단의 "스토어" 메뉴 또는 3F 티켓 예매 페이지에서 원하시는 전시를 선택하여 온라인으로 간편하게 예매하실 수 있습니다.'
    },
    {
        id: 3,
        question: '단체 관람 및 대관 문의는 어디로 하나요?',
        answer: '단체 관람(10인 이상)이나 공간 대관에 관한 문의는 푸터의 "SEND INQUIRY" 버튼을 통해 이메일을 보내주시거나, 고객센터(1544-0000)로 연락 주시면 상세히 안내해 드리겠습니다.'
    },
    {
        id: 4,
        question: '멤버십 혜택이 궁금합니다.',
        answer: 'department 멤버십에 가입하시면 모든 전시 10% 할인, 무료 도슨트 투어, VIP 라운지 이용 등 풍성한 혜택을 누리실 수 있습니다.'
    },
    {
        id: 5,
        question: '운영 시간은 어떻게 되나요?',
        answer: '매일 오전 10시 30분부터 오후 8시까지 운영하며, 금/토/일요일은 오후 8시 30분까지 연장 운영합니다. (백화점 휴점일 제외)'
    }
];

const FAQPage: React.FC = () => {
    const { t } = useTranslation();
    const [openId, setOpenId] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-dancheong-deep-bg text-white pt-32 pb-20">
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

                    {/* Search Bar Placeholder */}
                    <div className="max-w-xl mx-auto mt-10 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-8 text-sm focus:outline-none focus:border-dancheong-red/50 transition-all backdrop-blur-md"
                        />
                    </div>
                </div>

                {/* FAQ Accordion */}
                <div className="max-w-3xl mx-auto space-y-4">
                    {FAQ_DATA.map((faq) => (
                        <div key={faq.id} className="relative overflow-hidden group">
                            <button
                                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                                className={`w-full text-left p-6 flex items-center justify-between transition-all relative z-10 ${openId === faq.id ? 'bg-white/10 shadow-2xl' : 'bg-white/5 hover:bg-white/8'
                                    } rounded-2xl border border-white/10`}
                            >
                                <span className="text-lg font-medium group-hover:text-dancheong-red transition-colors">
                                    <AutoTranslatedText text={faq.question} />
                                </span>
                                <ChevronDown
                                    className={`transition-transform duration-300 ${openId === faq.id ? 'rotate-180 text-dancheong-red' : 'text-white/20'}`}
                                    size={20}
                                />
                            </button>

                            <AnimatePresence>
                                {openId === faq.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-8 pb-10 text-white/60 leading-relaxed font-light italic border-x border-b border-white/10 rounded-b-2xl -mt-4 bg-white/5">
                                            <AutoTranslatedText text={faq.answer} />
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
