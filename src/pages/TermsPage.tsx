import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { FileText, Shield } from 'lucide-react';

const TermsPage: React.FC = () => {
    const { t } = useTranslation();

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
                        <FileText size={14} />
                        <AutoTranslatedText text="약관 및 정책" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif font-bold mb-6 tracking-tight"
                    >
                        {t('footer.terms')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 max-w-2xl mx-auto italic font-light"
                    >
                        <AutoTranslatedText text="Culture Dept. Store 서비스 이용에 관한 권리와 책임을 안내해 드립니다." />
                    </motion.p>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Shield size={200} className="text-white" />
                    </div>

                    <div className="relative z-10 space-y-10 text-white/70 leading-relaxed font-light">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white"><AutoTranslatedText text="제 1 조 (목적)" /></h2>
                            <p><AutoTranslatedText text="본 약관은 Culture Dept. Store(이하 '회사')가 운영하는 웹사이트 및 관련 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다." /></p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white"><AutoTranslatedText text="제 2 조 (용어의 정의)" /></h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><AutoTranslatedText text="'서비스'란 회사가 제공하는 모든 문화 큐레이션 및 상품 구매 관련 웹 서비스를 의미합니다." /></li>
                                <li><AutoTranslatedText text="'이용자'란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다." /></li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white"><AutoTranslatedText text="제 3 조 (약관의 명시와 개정)" /></h2>
                            <p><AutoTranslatedText text="회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 관련 법령을 위배하지 않는 범위 내에서 약관을 개정할 수 있습니다." /></p>
                        </section>

                        <section className="space-y-4 text-sm bg-white/5 p-6 rounded-xl italic">
                            <p><AutoTranslatedText text="본 웹사이트는 포트폴리오 및 전시용 프로젝트로, 실제 상거래가 이루어지지 않는 데모 페이지입니다." /></p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
