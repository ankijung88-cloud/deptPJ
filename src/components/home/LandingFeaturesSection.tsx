import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Store, Briefcase, Users, CheckCircle2, Quote } from 'lucide-react';

// Helpers for localized text (consistent with AdminPage)
const displayLocalized = (text: any) => {
    if (!text) return '';
    if (typeof text === 'string') {
        try {
            if (text.trim().startsWith('{')) {
                const parsed = JSON.parse(text);
                return parsed.ko || parsed.en || '';
            }
        } catch (e) { return text; }
        return text;
    }
    return text.ko || text.en || '';
};


const staticFeatures = [
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
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await fetch('/api/landing-features');
                const data = await response.json();
                if (data && Array.isArray(data) && data.length > 0) {
                    setFeatures(data);
                } else {
                    setFeatures(staticFeatures);
                }
            } catch (err) {
                console.error('Failed to fetch features:', err);
                setFeatures(staticFeatures);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatures();
    }, []);

    if (loading) return null;

    return (
        <section className="relative py-24 lg:py-64 overflow-hidden bg-transparent">
            {/* Ambient Lighting for Features */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-dancheong-mugwort/5 blur-[150px] rounded-full opacity-30" />
                <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-[#FFD1D1]/10 blur-[150px] rounded-full opacity-30" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-32 lg:mb-56">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-4 mb-4">
                            <div className="w-8 h-[1px] bg-dancheong-mugwort"></div>
                            <span className="text-[10px] font-black tracking-[0.5em] text-dancheong-mugwort uppercase">Philosophy</span>
                            <div className="w-8 h-[1px] bg-dancheong-mugwort"></div>
                        </div>
                        <h2 className="text-3xl sm:text-5xl lg:text-7xl text-dancheong-ink font-serif font-black tracking-tighter leading-[1.1] max-w-5xl mx-auto">
                            <AutoTranslatedText text="아름다움 그 이상의 가치를" />
                            <br />
                            <span className="text-dancheong-mugwort/80 italic">Experience the Essence</span>
                        </h2>
                        <p className="text-dancheong-ink/50 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed italic">
                            <AutoTranslatedText text="본연의 아름다움이 피어나는 순간을 위해" />
                            <br />
                            <AutoTranslatedText text="우리는 공간에 철학을 담습니다." />
                        </p>
                    </motion.div>
                </div>

                <div className="space-y-48 lg:space-y-80">
                    {features.map((feature, idx) => {
                        const subtitle = displayLocalized(feature.subtitle);
                        const korTitle = displayLocalized(feature.kor_title || feature.korTitle);
                        const description = displayLocalized(feature.description || feature.desc);
                        const detailInfo = displayLocalized(feature.detail_info || feature.detailInfo);
                        const benefits = Array.isArray(feature.benefits)
                            ? feature.benefits
                            : (typeof feature.benefits === 'string' ? JSON.parse(feature.benefits) : []);

                        return (
                            <motion.div
                                key={feature.id || idx}
                                initial={{ opacity: 0, y: 80 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-20 lg:gap-40`}
                            >
                                {/* Visual Side: Soft & Organic */}
                                <div className="flex-1 w-full relative">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="aspect-[4/5] bg-white rounded-[4rem] sm:rounded-[6rem] p-0 flex items-center justify-center group overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.06)] relative"
                                    >
                                        <div className="absolute inset-0 z-0">
                                            {feature.media_url ? (
                                                feature.media_type === 'video' ? (
                                                    <video
                                                        src={feature.media_url}
                                                        autoPlay muted loop playsInline
                                                        className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <img
                                                        src={feature.media_url}
                                                        alt=""
                                                        className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                                                    />
                                                )
                                            ) : (
                                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20`} />
                                            )}
                                        </div>

                                        {/* Soft Glow Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-dancheong-ink/20 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-1000" />
                                        
                                        {/* Floating Badge */}
                                        <div className="absolute top-12 left-12 z-20">
                                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                                                <span className="text-white font-serif italic text-xl">{feature.number}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                    
                                    {/* Subtle Shadow/Glow behind card */}
                                    <div className="absolute -inset-10 bg-dancheong-mugwort/5 blur-[80px] rounded-full z-[-1] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                </div>

                                {/* Feature Content: Editorial & Clean */}
                                <div className="flex-1 space-y-12 text-left">
                                    <div className="space-y-6">
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            className="text-[10px] font-black uppercase tracking-[0.4em] text-dancheong-mugwort/60"
                                        >
                                            {subtitle}
                                        </motion.div>
                                        <h4 className="text-3xl lg:text-5xl font-serif font-black text-dancheong-ink tracking-tighter leading-tight">
                                            <AutoTranslatedText text={korTitle} />
                                        </h4>
                                    </div>

                                    <div className="h-[1px] w-24 bg-dancheong-ink/10"></div>

                                    <p className="text-dancheong-ink/60 text-base lg:text-xl leading-relaxed break-keep font-medium italic">
                                        <AutoTranslatedText text={description} />
                                    </p>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="bg-white/40 backdrop-blur-md p-8 lg:p-12 rounded-[3rem] border border-white shadow-sm relative overflow-hidden"
                                    >
                                        <Quote className="absolute top-8 right-8 w-12 h-12 text-dancheong-ink/5" />
                                        <p className="relative z-10 text-dancheong-ink/80 text-sm lg:text-lg leading-loose break-keep font-medium">
                                            <AutoTranslatedText text={detailInfo} />
                                        </p>
                                    </motion.div>

                                    <div className="grid grid-cols-1 gap-6 pt-4">
                                        {benefits.map((benefit: string, bIdx: number) => (
                                            <motion.div
                                                key={bIdx}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.2 + (bIdx * 0.1) }}
                                                className="flex items-center gap-4 group/benefit"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-dancheong-mugwort group-hover/benefit:scale-[2] transition-transform duration-500" />
                                                <span className="text-dancheong-ink/80 font-bold text-sm lg:text-base tracking-tight">
                                                    <AutoTranslatedText text={benefit} />
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom CTA Hook */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-64 text-center max-w-3xl mx-auto border-t border-dancheong-ink/5 pt-32"
            >
                <h4 className="text-2xl lg:text-4xl font-serif font-black text-dancheong-ink/80 mb-12 leading-snug">
                    <AutoTranslatedText text="지금 바로 당신만의 특별한 공간을" />
                    <br />
                    <span className="text-dancheong-mugwort/80 italic">Experience the Difference</span>
                </h4>
                <div className="flex flex-wrap justify-center gap-8">
                    <div className="px-10 py-5 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white flex items-center gap-4 shadow-sm group hover:bg-white transition-all duration-500">
                        <Users className="text-dancheong-mugwort" />
                        <span className="font-bold text-dancheong-ink/70">1,000+ 기업 도입</span>
                    </div>
                    <div className="px-10 py-5 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white flex items-center gap-4 shadow-sm group hover:bg-white transition-all duration-500">
                        <Store className="text-dancheong-navy" />
                        <span className="font-bold text-dancheong-ink/70">2,500+ 가상 상점</span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};
