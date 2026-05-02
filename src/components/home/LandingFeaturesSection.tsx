import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Store, Briefcase, Users, ArrowRight } from 'lucide-react';

const features = [
    {
        id: 'office',
        number: '01',
        icon: <Briefcase className="w-12 h-12 text-dancheong-mugwort" />,
        title: 'Virtual Office',
        subtitle: 'The Future of Workplace',
        desc: '물리적 한계를 뛰어넘는 프라이빗 부스와 협업 툴(화면 공유, 칸반 보드)이 내장된 엔터프라이즈 화상 워크스페이스입니다.'
    },
    {
        id: 'commerce',
        number: '02',
        icon: <Store className="w-12 h-12 text-dancheong-navy" />,
        title: 'Digital Commerce',
        subtitle: 'Immersive Shopping Experience',
        desc: '2D 공간상에 구현된 인터랙티브 쇼룸과 팝업 스토어를 통해 고객에게 입체적인 브랜드 세일즈 경험을 직접 제공합니다.'
    },
    {
        id: 'conference',
        number: '03',
        icon: <Users className="w-12 h-12 text-dancheong-navy" />,
        title: 'Global Conference',
        subtitle: 'Limitless Collaboration',
        desc: '다국어 자동 실시간 번역과 발표자 프로젝터 연동을 지원하여 국경 없는 초대형 화상 회의 및 기업 온보딩 행사를 개최합니다.'
    }
];

export const LandingFeaturesSection: React.FC = () => {
    return (
        <section id="features" className="relative w-full pt-28 lg:pt-36 pb-32 px-6 bg-transparent flex flex-col items-center overflow-hidden">
            <div className="max-w-5xl mx-auto w-full">
                {/* Visual Asset: Secondary Logo */}
                <div className="flex justify-center mb-16 lg:mb-24">
                    <BrandLogo variant="seal" size={120} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24 lg:mb-32"
                >
                    <h3 className="text-dancheong-mugwort text-[11px] font-black tracking-[0.5em] uppercase mb-6">
                        <AutoTranslatedText text="Explore Business Solutions" />
                    </h3>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl text-dancheong-ink font-bold tracking-tighter leading-[1.1]">
                        <AutoTranslatedText text="비즈니스를 위한 다목적 공간 플랫폼" />
                    </h2>
                </motion.div>

                <div className="space-y-32 lg:space-y-48">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}
                        >
                            {/* Visual Side */}
                            <div className="flex-1 w-full relative">
                                <div className="aspect-[4/3] bg-dancheong-ink/5 rounded-[40px] flex items-center justify-center group overflow-hidden border border-dancheong-ink/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-dancheong-ivory/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        className="relative z-10"
                                    >
                                        {feature.icon}
                                    </motion.div>
                                    <span className="absolute bottom-10 right-10 text-8xl font-black text-dancheong-ink/5 select-none">
                                        {feature.number}
                                    </span>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 space-y-6 text-center lg:text-left">
                                <div className="inline-block px-3 py-1 rounded-full bg-dancheong-mugwort/10 text-dancheong-mugwort text-[10px] font-black uppercase tracking-widest mb-2">
                                    {feature.subtitle}
                                </div>
                                <h4 className="text-3xl lg:text-4xl font-black text-dancheong-ink tracking-tight">
                                    <AutoTranslatedText text={feature.title} />
                                </h4>
                                <div className="h-1 w-12 bg-dancheong-mugwort/20 hidden lg:block" />
                                <p className="text-dancheong-ink/70 text-lg lg:text-xl leading-relaxed break-keep font-serif italic">
                                    <AutoTranslatedText text={feature.desc} />
                                </p>
                                <button className="group flex items-center gap-2 text-dancheong-mugwort font-black text-sm uppercase tracking-widest hover:gap-4 transition-all mx-auto lg:mx-0 pt-4">
                                    <span>Learn More</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
