import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { Lock, Eye } from 'lucide-react';

const PrivacyPage: React.FC = () => {
    const { t } = useTranslation();

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
                        <Lock size={14} />
                        <AutoTranslatedText text="개인정보처리방침" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif font-bold mb-6 tracking-tight"
                    >
                        {t('footer.privacy')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 max-w-2xl mx-auto italic font-light"
                    >
                        <AutoTranslatedText text="이용자님의 소중한 개인정보를 안전하게 보호하기 위해 최선을 다하고 있습니다." />
                    </motion.p>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Eye size={200} className="text-white" />
                    </div>

                    <div className="relative z-10 space-y-10 text-white/70 leading-relaxed font-light">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white"><AutoTranslatedText text="1. 수집하는 개인정보 항목" /></h2>
                            <p><AutoTranslatedText text="회사는 서비스 제공을 위해 최소한의 범위 내에서 다음과 같은 개인정보를 수집합니다." /></p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><AutoTranslatedText text="회원가입 시: 이메일 주소, 이름, 비밀번호" /></li>
                                <li><AutoTranslatedText text="서비스 이용 과정: IP 주소, 쿠키, 방문 기록 등" /></li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white"><AutoTranslatedText text="2. 개인정보의 이용 목적" /></h2>
                            <p><AutoTranslatedText text="수집된 개인정보는 회원 관리, 서비스 제공 및 개선, 고객 지원 등을 위해서만 이용됩니다." /></p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-white"><AutoTranslatedText text="3. 개인정보의 파기" /></h2>
                            <p><AutoTranslatedText text="회사는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 정보를 파기합니다." /></p>
                        </section>

                        <section className="space-y-4 text-sm bg-dancheong-red/5 p-6 rounded-xl border border-dancheong-red/10">
                            <p><AutoTranslatedText text="본 웹사이트는 학습 및 데모용 프로젝트로, 실제 개인정보를 상업적으로 이용하거나 외부로 유출하지 않습니다." /></p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
