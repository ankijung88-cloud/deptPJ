import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const LandingRecruitmentSection: React.FC = () => {
    return (
        <section className="relative w-full py-24 px-6 bg-[#0A100D] flex flex-col items-center">
            <div className="w-full max-w-6xl mx-auto relative z-10">
                {/* Background Details */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] rounded-full bg-dancheong-gold blur-[150px] animate-pulse"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-12 border-b border-white/10 pb-8"
                >
                    <span className="text-dancheong-gold text-sm md:text-base font-bold tracking-[0.5em] uppercase mb-4 block drop-shadow-md">Operations & Recruitment</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight break-keep drop-shadow-lg">
                        <AutoTranslatedText text="가상오피스 지원 및 입주기업 모집공고" />
                    </h2>
                    <p className="text-white/60 mt-4 max-w-3xl text-sm md:text-lg break-keep leading-relaxed font-medium">
                        <AutoTranslatedText text="시공간의 제약 없이 새로운 비즈니스를 전개하거나 창의적인 모임, 팝업 공간을 기획하고 싶으신 모든 분들을 모십니다. DEPART의 프리미엄 3D 공간과 함께 무한한 가능성의 여정을 시작해 보세요." />
                    </p>
                </motion.div>

                <div className="flex flex-col gap-8 md:gap-10">
                    {/* 모집 개요 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl"
                    >
                        <h3 className="text-xl md:text-2xl font-black text-white mb-6 border-l-4 border-dancheong-red pl-4 tracking-tight"><AutoTranslatedText text="1. 모집개요 및 신청자격" /></h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-dancheong-gold text-sm md:text-base font-bold tracking-wide"><AutoTranslatedText text="지원 대상" /></h4>
                                <ul className="list-disc list-inside text-white/80 space-y-3 text-sm leading-relaxed break-keep">
                                    <li><AutoTranslatedText text="프라이빗 모임, 촬영, 팝업스토어 기획을 위해 공간을 찾는 개인/기업." /></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-dancheong-gold text-sm md:text-base font-bold tracking-wide"><AutoTranslatedText text="신청 자격 내용" /></h4>
                                <ul className="list-disc list-inside text-white/80 space-y-3 text-sm leading-relaxed break-keep">
                                    <li><AutoTranslatedText text="개인, 소모임, 프로젝트 팀, 단체 및 기업 등 제한 없이 누구나 신청 가능" /></li>
                                    <li className="text-dancheong-red/80 font-medium"><AutoTranslatedText text="※ 국세/지방세 체납 기업 및 제재 중인 기업 지원 불가" /></li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* 지원 규모 및 내용 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl overflow-hidden"
                    >
                        <h3 className="text-xl md:text-2xl font-black text-white mb-6 border-l-4 border-[#00FFC2] pl-4 tracking-tight"><AutoTranslatedText text="2. 모집규모 및 주요 지원내용" /></h3>
                        <div className="overflow-x-auto mix-blend-screen">
                            <table className="w-full text-left text-sm text-white border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b-2 border-white/20 text-white/60 font-bold tracking-wide bg-white/[0.02]">
                                        <th className="py-5 px-6 whitespace-nowrap"><AutoTranslatedText text="구분" /></th>
                                        <th className="py-5 px-6 whitespace-nowrap"><AutoTranslatedText text="모집규모" /></th>
                                        <th className="py-5 px-6 whitespace-nowrap"><AutoTranslatedText text="비용안내" /></th>
                                        <th className="py-5 px-6 whitespace-nowrap"><AutoTranslatedText text="지원 혜택" /></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-5 px-6 font-medium whitespace-nowrap"><AutoTranslatedText text="프리미엄 공간지원" /></td>
                                        <td className="py-5 px-6 text-white/70 whitespace-nowrap"><AutoTranslatedText text="총 4개 호실 (4~8인실)" /></td>
                                        <td className="py-5 px-6 text-white/70 whitespace-nowrap"><AutoTranslatedText text="저렴한 기본 임차료/VAT" /></td>
                                        <td className="py-5 px-6 text-white/70 break-keep"><AutoTranslatedText text="DEPART 등의 오프라인 지정 사무공간 지원 (일부 실사용료만 납부)" /></td>
                                    </tr>
                                    <tr className="bg-[#00FFC2]/5 hover:bg-[#00FFC2]/10 transition-colors">
                                        <td className="py-5 px-6 font-bold text-[#00FFC2] whitespace-nowrap"><AutoTranslatedText text="DEPART 가상오피스" /></td>
                                        <td className="py-5 px-6 text-[#00FFC2]/90 font-medium whitespace-nowrap"><AutoTranslatedText text="10개사 내외" /></td>
                                        <td className="py-5 px-6 font-black text-dancheong-gold whitespace-nowrap"><AutoTranslatedText text="전액 무상" /></td>
                                        <td className="py-5 px-6 text-[#00FFC2]/70 break-keep"><AutoTranslatedText text="사업자등록용 비상주 주소지 사용권, 브랜드 전용 3D 가상 스페이스 환경 및 회의실 등 인프라 지원" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* 심사 및 일정 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl"
                    >
                        <h3 className="text-xl md:text-2xl font-black text-white mb-8 border-l-4 border-dancheong-gold pl-4 tracking-tight"><AutoTranslatedText text="3. 신청방법 및 심사과정" /></h3>

                        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                            <div className="bg-black/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-dancheong-gold/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="text-dancheong-gold text-4xl font-black mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">01</div>
                                <h4 className="text-white font-bold mb-3 text-lg"><AutoTranslatedText text="지원서류 이메일 접수" /></h4>
                                <p className="text-white/60 text-sm break-keep leading-relaxed"><AutoTranslatedText text="사업계획서 및 구비서류를 압축(ZIP)하여 공고된 이메일로 온라인 제출" /></p>
                            </div>
                            <div className="bg-black/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FFC2]/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="text-[#00FFC2] text-4xl font-black mb-4 drop-shadow-[0_0_15px_rgba(0,255,194,0.3)]">02</div>
                                <h4 className="text-white font-bold mb-3 text-lg"><AutoTranslatedText text="서류 및 발표 평가" /></h4>
                                <p className="text-white/60 text-sm break-keep leading-relaxed"><AutoTranslatedText text="사업성(40점), 시장전망(30점), 공간활용계획(30점)을 종합적으로 심사" /></p>
                            </div>
                            <div className="bg-black/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-dancheong-red/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="text-dancheong-red text-4xl font-black mb-4 drop-shadow-[0_0_15px_rgba(235,59,45,0.3)]">03</div>
                                <h4 className="text-white font-bold mb-3 text-lg"><AutoTranslatedText text="결과 통보 및 오리엔테이션" /></h4>
                                <p className="text-white/60 text-sm break-keep leading-relaxed"><AutoTranslatedText text="선발 후 개별 안내, 신규 입주사 온라인/오프라인 간담회 진행" /></p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
