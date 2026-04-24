import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { FileText, Shield } from 'lucide-react';

const TermsPage: React.FC = () => {
    useTranslation();

    return (
        <div className="min-h-screen bg-white text-dancheong-ink pb-20">
            <div className="lossless-layout pt-32">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-dancheong-mugwort/10 border border-dancheong-mugwort/30 rounded-full text-dancheong-mugwort text-xs font-bold tracking-widest uppercase mb-6"
                    >
                        <FileText size={14} />
                        <AutoTranslatedText text="약관 및 정책" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-serif font-black mb-6 tracking-tight text-dancheong-ink"
                    >
                        <AutoTranslatedText text="이용약관" />
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-dancheong-ink/50 max-w-2xl mx-auto italic font-light text-lg"
                    >
                        <AutoTranslatedText text="몽땅쏙 서비스 이용에 관한 권리와 책임을 안내해 드립니다." />
                    </motion.p>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto bg-white border border-dancheong-ink/5 rounded-3xl p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Shield size={300} className="text-dancheong-ink" />
                    </div>

                    <div className="relative z-10 space-y-12 text-dancheong-ink/70 leading-relaxed font-light">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-serif font-bold text-dancheong-ink border-b border-dancheong-ink/5 pb-4"><AutoTranslatedText text="제 1 조 (목적)" /></h2>
                            <p className="text-lg"><AutoTranslatedText text="본 약관은 몽땅쏙(이하 '회사')가 운영하는 웹사이트 및 관련 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다." /></p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-serif font-bold text-dancheong-ink border-b border-dancheong-ink/5 pb-4"><AutoTranslatedText text="제 2 조 (용어의 정의)" /></h2>
                            <ul className="space-y-3 pl-2">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-dancheong-mugwort mt-2 shrink-0" />
                                    <AutoTranslatedText text="'서비스'란 회사가 제공하는 모든 문화 큐레이션 및 상품 구매 관련 웹 서비스를 의미합니다." />
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-dancheong-mugwort mt-2 shrink-0" />
                                    <AutoTranslatedText text="'이용자'란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다." />
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-serif font-bold text-dancheong-ink border-b border-dancheong-ink/5 pb-4"><AutoTranslatedText text="제 3 조 (약관의 명시와 개정)" /></h2>
                            <p className="text-lg"><AutoTranslatedText text="회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 관련 법령을 위배하지 않는 범위 내에서 약관을 개정할 수 있습니다." /></p>
                        </section>

                        <section className="mt-12 p-8 bg-dancheong-mugwort/[0.03] rounded-2xl border border-dancheong-mugwort/10 italic text-dancheong-mugwort/80 text-sm">
                            <p><AutoTranslatedText text="본 웹사이트는 포트폴리오 및 전시용 프로젝트로, 실제 상거래가 이루어지지 않는 데모 페이지입니다." /></p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
