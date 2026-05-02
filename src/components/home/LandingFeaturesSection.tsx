import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Store, Briefcase, Users, CheckCircle2, Quote } from 'lucide-react';

const features = [
    {
        id: 'office',
        number: '01',
        icon: <Briefcase className="w-12 h-12 text-dancheong-mugwort" />,
        title: 'Spatial Productivity',
        korTitle: '압도적 생산성의 공간',
        subtitle: 'The Future of Workplace',
        desc: '단순한 화상 회의를 넘어선 초몰입형 워크스페이스. 물리적 사무실의 가치를 디지털로 완벽하게 치환합니다.',
        detailInfo: '집이나 카페 어디서든 사무실과 동일한 현장감을 제공합니다. 동료의 아바타를 통해 현재 상태를 직관적으로 파악하고, 별도의 화상 회의 링크 없이 즉각적으로 소통하며 업무의 흐름을 끊김 없이 유지할 수 있습니다.',
        benefits: [
            '집중을 위한 프라이빗 부스 시스템',
            '실시간 협업 도구(칸반, 화이트보드) 내장',
            '팀의 응집력을 높이는 2D 가상 오피스'
        ],
        gradient: 'from-dancheong-mugwort/20 to-transparent'
    },
    {
        id: 'commerce',
        number: '02',
        icon: <Store className="w-12 h-12 text-dancheong-navy" />,
        title: 'Immersive Sales',
        korTitle: '브랜드 가치를 높이는 경험형 커머스',
        subtitle: 'Immersive Shopping Experience',
        desc: '평면적인 쇼핑을 입체적인 브랜드 경험으로. 고객이 머물고 싶어 하는 인터랙티브 팝업 스토어를 구축하세요.',
        detailInfo: '브랜드의 철학과 감성을 담은 2D 공간에서 고객과 만나보세요. 단순한 클릭 이상의 경험을 제공하며, 고객이 공간에 머무는 시간과 행동을 분석하여 최적의 세일즈 전략을 세울 수 있도록 돕습니다.',
        benefits: [
            '실시간 소통이 가능한 라이브 쇼룸',
            '고객 행동 데이터 기반의 공간 최적화',
            '브랜드 정체성을 담은 커스텀 테마 지원'
        ],
        gradient: 'from-dancheong-navy/20 to-transparent'
    },
    {
        id: 'conference',
        number: '03',
        icon: <Users className="w-12 h-12 text-dancheong-ink" />,
        title: 'Infinite Scalability',
        korTitle: '언어와 국경을 넘는 무한한 확장성',
        subtitle: 'Limitless Collaboration',
        desc: '다국어 실시간 번역으로 전 세계와 연결됩니다. 대규모 컨퍼런스부터 기업 온보딩까지 경계 없이 개최하세요.',
        detailInfo: '언어는 더 이상 비즈니스의 장벽이 아닙니다. 실시간 AI 번역 엔진이 발표자의 음성을 즉각적으로 텍스트로 변환하고 수십 개의 언어로 송출하여, 전 세계 파트너들과 한 공간에 있는 듯한 경험을 선사합니다.',
        benefits: [
            'AI 기반 다국어 실시간 자막 및 번역',
            '초대형 행사를 위한 안정적인 프로젝션 시스템',
            '전 세계 어디서나 끊김 없는 연결성'
        ],
        gradient: 'from-dancheong-ink/20 to-transparent'
    }
];

export const LandingFeaturesSection: React.FC = () => {
    return (
        <section id="features" className="relative w-full pt-28 lg:pt-40 pb-32 px-6 bg-transparent flex flex-col items-center overflow-hidden">
            {/* Background Texture / Motif */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-[0.03] pointer-events-none select-none">
                <div className="absolute top-20 left-10 w-96 h-96 border-[40px] border-dancheong-ink rounded-full" />
                <div className="absolute bottom-40 right-10 w-64 h-64 border-[20px] border-dancheong-mugwort rotate-45" />
            </div>

            <div className="max-w-6xl mx-auto w-full relative z-10">
                {/* Promotional Header */}
                <div className="flex flex-col items-center mb-24 lg:mb-36 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <BrandLogo variant="seal" size={140} />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <h3 className="text-dancheong-mugwort text-[12px] font-black tracking-[0.6em] uppercase">
                            <AutoTranslatedText text="Why Mongtangssok?" />
                        </h3>
                        <h2 className="text-3xl sm:text-4xl lg:text-6xl text-dancheong-ink font-bold tracking-tighter leading-[1.1] max-w-4xl mx-auto">
                            <AutoTranslatedText text="당신의 비즈니스가 이곳에서 시작되어야 하는 이유" />
                        </h2>
                        <p className="text-dancheong-ink/60 text-base lg:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                            <AutoTranslatedText text="단순한 도구를 넘어 비즈니스의 새로운 지평을 여는 올인원 공간 솔루션을 경험하세요." />
                        </p>
                    </motion.div>
                </div>

                {/* Vertical Feature Narrative */}
                <div className="space-y-40 lg:space-y-64">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-32`}
                        >
                            {/* Visual Side (The Wow factor) */}
                            <div className="flex-1 w-full relative">
                                <motion.div 
                                    whileHover={{ y: -10 }}
                                    className="aspect-[5/4] bg-white heritage-border rounded-[48px] p-8 lg:p-12 flex items-center justify-center group overflow-hidden shadow-2xl relative"
                                >
                                    {/* Glassmorphism Circle */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-40`} />
                                    <div className="absolute inset-0 backdrop-blur-[2px]" />
                                    
                                    <div className="relative z-10 flex flex-col items-center gap-8">
                                        <motion.div 
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.4, type: "spring" }}
                                            className="p-10 bg-white rounded-full shadow-lg border border-dancheong-ink/5"
                                        >
                                            {feature.icon}
                                        </motion.div>
                                        <div className="text-center">
                                            <span className="text-dancheong-ink/10 text-9xl font-black absolute -top-10 -right-10 select-none group-hover:text-dancheong-ink/20 transition-colors duration-500">
                                                {feature.number}
                                            </span>
                                            <h5 className="text-xl font-black text-dancheong-ink/40 tracking-widest uppercase mb-2">
                                                {feature.subtitle}
                                            </h5>
                                        </div>
                                    </div>
                                    
                                    {/* Decorative Motif */}
                                    <div className="absolute bottom-10 left-10 w-20 h-20 border border-dancheong-ink/10 rounded-full flex items-center justify-center opacity-40">
                                        <div className="w-10 h-10 border border-dancheong-ink/10 rotate-45" />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Promotional Content Side */}
                            <div className="flex-1 space-y-8 text-center lg:text-left">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-dancheong-mugwort/5 text-dancheong-mugwort border border-dancheong-mugwort/10">
                                        <span className="w-2 h-2 rounded-full bg-dancheong-mugwort animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-widest">{feature.title}</span>
                                    </div>
                                    <h4 className="text-2xl lg:text-3xl font-black text-dancheong-ink tracking-tight leading-tight">
                                        <AutoTranslatedText text={feature.korTitle} />
                                    </h4>
                                </div>
                                
                                <p className="text-dancheong-ink/70 text-base lg:text-lg leading-relaxed break-keep font-medium">
                                    <AutoTranslatedText text={feature.desc} />
                                </p>

                                {/* Detailed Info Block */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-dancheong-ink/[0.03] p-6 lg:p-8 rounded-[32px] border border-dancheong-ink/5 relative overflow-hidden"
                                >
                                    <Quote className="absolute top-4 right-4 w-10 h-10 text-dancheong-ink/5" />
                                    <p className="relative z-10 text-dancheong-ink/80 text-base leading-loose break-keep italic font-medium">
                                        <AutoTranslatedText text={feature.detailInfo} />
                                    </p>
                                </motion.div>

                                {/* Benefits List */}
                                <div className="space-y-4 pt-4">
                                    {feature.benefits.map((benefit, bIdx) => (
                                        <motion.div 
                                            key={bIdx}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.5 + (bIdx * 0.1) }}
                                            className="flex items-center gap-3 justify-center lg:justify-start"
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-dancheong-mugwort" />
                                            <span className="text-dancheong-ink/80 font-semibold text-base">
                                                <AutoTranslatedText text={benefit} />
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom CTA Hook */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-64 text-center max-w-3xl mx-auto border-t border-dancheong-ink/10 pt-24"
            >
                <h4 className="text-2xl lg:text-3xl font-black text-dancheong-ink/80 mb-8 leading-snug">
                    <AutoTranslatedText text="지금 바로 비즈니스의 새로운 기준을 경험해 보세요." />
                </h4>
                <div className="flex flex-wrap justify-center gap-6">
                    <div className="px-8 py-4 bg-white heritage-border rounded-2xl flex items-center gap-3">
                        <Users className="text-dancheong-mugwort" />
                        <span className="font-bold">1,000+ 기업 도입</span>
                    </div>
                    <div className="px-8 py-4 bg-white heritage-border rounded-2xl flex items-center gap-3">
                        <Store className="text-dancheong-navy" />
                        <span className="font-bold">2,500+ 가상 상점</span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};


