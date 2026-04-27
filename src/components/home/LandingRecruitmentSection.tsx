import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const LandingRecruitmentSection: React.FC = () => {
    return (
        <section id="recruitment" className="relative w-full py-24 px-6 bg-transparent flex flex-col items-center">
            <div className="w-full max-w-6xl mx-auto relative z-10">
                {/* Background Details */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] rounded-full bg-dancheong-mugwort blur-[150px]"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-12 border-b-4 border-dancheong-ink pb-8"
                >
                    <span className="text-dancheong-mugwort text-sm md:text-base font-black tracking-[0.5em] uppercase mb-4 block"><AutoTranslatedText text="Operations & Recruitment" /></span>
                    <h2 className="text-3xl md:text-5xl font-black text-dancheong-ink leading-tight break-keep">
                        <AutoTranslatedText text="가상오피스 지원 및 입주기업 모집공고" />
                    </h2>
                    <p className="text-dancheong-ink opacity-80 mt-4 max-w-3xl text-sm md:text-lg break-keep leading-relaxed font-black">
                        <AutoTranslatedText text="시공간의 제약 없이 새로운 비즈니스를 전개하거나 창의적인 모임, 팝업 공간을 기획하고 싶으신 모든 분들을 모십니다. 몽땅쏙의 프리미엄 3D 공간과 함께 무한한 가능성의 여정을 시작해 보세요." />
                    </p>
                </motion.div>

                <div className="flex flex-col gap-8 md:gap-10">
                    {/* 모집 개요 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8 }}
                        className="heritage-card rounded-3xl p-6 md:p-10"
                    >
                        <h3 className="text-xl md:text-2xl font-black text-dancheong-ink mb-6 border-l-8 border-dancheong-mugwort pl-6 tracking-tight"><AutoTranslatedText text="1. 모집개요 및 신청자격" /></h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-dancheong-mugwort text-sm md:text-base font-black tracking-wide uppercase"><AutoTranslatedText text="지원 대상" /></h4>
                                <ul className="list-disc list-inside text-dancheong-ink space-y-3 text-base leading-relaxed break-keep font-black">
                                    <li><AutoTranslatedText text="프라이빗 모임, 촬영, 팝업스토어 기획을 위해 공간을 찾는 개인/기업." /></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-dancheong-mugwort text-sm md:text-base font-black tracking-wide uppercase"><AutoTranslatedText text="신청 자격 내용" /></h4>
                                <ul className="list-disc list-inside text-dancheong-ink space-y-3 text-base leading-relaxed break-keep font-black">
                                    <li><AutoTranslatedText text="개인, 소모임, 프로젝트 팀, 단체 및 기업 등 제한 없이 누구나 신청 가능" /></li>
                                    <li className="text-dancheong-navy font-black"><AutoTranslatedText text="※ 국세/지방세 체납 기업 및 제재 중인 기업 지원 불가" /></li>
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
                        className="heritage-card rounded-3xl p-6 md:p-10 overflow-hidden"
                    >
                        <h3 className="text-xl md:text-2xl font-black text-dancheong-ink mb-6 border-l-8 border-dancheong-navy pl-6 tracking-tight"><AutoTranslatedText text="2. 모집규모 및 주요 지원내용" /></h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-dancheong-ink border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b-4 border-dancheong-ink text-dancheong-ink font-black tracking-wide bg-dancheong-ink/[0.05]">
                                        <th className="py-5 px-6 whitespace-nowrap"><AutoTranslatedText text="구분" /></th>
                                        <th className="py-5 px-6 whitespace-nowrap"><AutoTranslatedText text="모집규모" /></th>
                                        <th className="py-5 px-6 whitespace-nowrap"><AutoTranslatedText text="비용안내" /></th>
                                        <th className="py-5 px-6 whitespace-nowrap"><AutoTranslatedText text="지원 혜택" /></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-4 divide-dancheong-ink/10">
                                    <tr className="hover:bg-dancheong-ink/[0.02] transition-colors">
                                        <td className="py-6 px-6 font-black whitespace-nowrap"><AutoTranslatedText text="프리미엄 공간지원" /></td>
                                        <td className="py-6 px-6 text-dancheong-ink whitespace-nowrap font-black"><AutoTranslatedText text="총 4개 호실 (4~8인실)" /></td>
                                        <td className="py-6 px-6 text-dancheong-ink whitespace-nowrap font-black"><AutoTranslatedText text="저렴한 기본 임차료/VAT" /></td>
                                        <td className="py-6 px-6 text-dancheong-ink break-keep font-black"><AutoTranslatedText text="몽땅쏙 등의 오프라인 지정 사무공간 지원 (일부 실사용료만 납부)" /></td>
                                    </tr>
                                    <tr className="bg-dancheong-navy/[0.05] hover:bg-dancheong-navy/[0.1] transition-colors">
                                        <td className="py-6 px-6 font-black text-dancheong-navy whitespace-nowrap"><AutoTranslatedText text="몽땅쏙 가상오피스" /></td>
                                        <td className="py-6 px-6 text-dancheong-navy font-black whitespace-nowrap"><AutoTranslatedText text="10개사 내외" /></td>
                                        <td className="py-6 px-6 font-black text-dancheong-mugwort whitespace-nowrap"><AutoTranslatedText text="전액 무상" /></td>
                                        <td className="py-6 px-6 text-dancheong-navy font-black break-keep"><AutoTranslatedText text="사업자등록용 비상주 주소지 사용권, 브랜드 전용 3D 가상 스페이스 환경 및 회의실 등 인프라 지원" /></td>
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
                        className="heritage-card rounded-3xl p-6 md:p-10"
                    >
                        <h3 className="text-xl md:text-2xl font-black text-dancheong-ink mb-8 border-l-8 border-dancheong-mugwort pl-6 tracking-tight"><AutoTranslatedText text="3. 신청방법 및 심사과정" /></h3>

                        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                            <div className="bg-white p-8 rounded-2xl border-4 border-dancheong-ink/10 relative overflow-hidden group shadow-lg">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-dancheong-mugwort/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="text-dancheong-mugwort text-4xl font-black mb-4 drop-shadow-[0_0_10px_rgba(79,109,91,0.2)]">01</div>
                                <h4 className="text-dancheong-ink font-black mb-3 text-lg"><AutoTranslatedText text="지원서류 이메일 접수" /></h4>
                                <p className="text-dancheong-ink/80 text-sm break-keep leading-relaxed font-black"><AutoTranslatedText text="사업계획서 및 구비서류를 압축(ZIP)하여 공고된 이메일로 온라인 제출" /></p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border-4 border-dancheong-ink/10 relative overflow-hidden group shadow-lg">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-dancheong-navy/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="text-dancheong-navy text-4xl font-black mb-4 drop-shadow-[0_0_10px_rgba(0,49,64,0.2)]">02</div>
                                <h4 className="text-dancheong-ink font-black mb-3 text-lg"><AutoTranslatedText text="서류 및 발표 평가" /></h4>
                                <p className="text-dancheong-ink/80 text-sm break-keep leading-relaxed font-black"><AutoTranslatedText text="사업성(40점), 시장전망(30점), 공간활용계획(30점)을 종합적으로 심사" /></p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border-4 border-dancheong-ink/10 relative overflow-hidden group shadow-lg">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-dancheong-mugwort/20 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="text-dancheong-mugwort text-4xl font-black mb-4 drop-shadow-[0_0_10px_rgba(79,109,91,0.3)]">03</div>
                                <h4 className="text-dancheong-ink font-black mb-3 text-lg"><AutoTranslatedText text="결과 통보 및 오리엔테이션" /></h4>
                                <p className="text-dancheong-ink/80 text-sm break-keep leading-relaxed font-black"><AutoTranslatedText text="선발 후 개별 안내, 신규 입주사 온라인/오프라인 간담회 진행" /></p>
                            </div>
                        </div>
                    </motion.div>
                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex justify-center pt-12"
                    >
                        <button 
                            onClick={() => window.location.href = 'mailto:contact@mongtangssok.com'}
                            className="group relative px-12 py-5 bg-dancheong-ink text-white rounded-full text-sm font-black uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(26,26,26,0.2)] active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <AutoTranslatedText text="지금 지원하기" />
                                <div className="w-6 h-[2px] bg-white/30 group-hover:w-10 transition-all duration-500" />
                            </span>
                            <div className="absolute inset-0 bg-dancheong-mugwort translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
