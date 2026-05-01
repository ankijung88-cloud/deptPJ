import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Store, Briefcase, Users } from 'lucide-react';

const features = [
    {
        id: 'office',
        icon: <Briefcase className="w-8 h-8 text-dancheong-mugwort" />,
        title: 'Virtual Office',
        desc: '물리적 한계를 뛰어넘는 프라이빗 부스와 협업 툴(화면 공유, 칸반 보드)이 내장된 엔터프라이즈 화상 워크스페이스입니다.'
    },
    {
        id: 'commerce',
        icon: <Store className="w-8 h-8 text-dancheong-navy" />,
        title: 'Digital Commerce',
        desc: '2D 공간상에 구현된 인터랙티브 쇼룸과 팝업 스토어를 통해 고객에게 입체적인 브랜드 세일즈 경험을 직접 제공합니다.'
    },
    {
        id: 'conference',
        icon: <Users className="w-8 h-8 text-dancheong-navy" />,
        title: 'Global Conference',
        desc: '다국어 자동 실시간 번역과 발표자 프로젝터 연동을 지원하여 국경 없는 초대형 화상 회의 및 기업 온보딩 행사를 개최합니다.'
    }
];

export const LandingFeaturesSection: React.FC = () => {
    return (
        <section id="features" className="relative w-full pt-28 lg:pt-36 pb-24 px-6 bg-transparent flex flex-col items-center">
            <div className="max-w-6xl mx-auto w-full">
                {/* Visual Asset: Secondary Logo */}
                <div className="flex justify-center mb-10 lg:mb-16">
                    <BrandLogo variant="seal" size={160} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h3 className="text-dancheong-mugwort text-[10px] sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-4">
                        <AutoTranslatedText text="Explore Business Solutions" />
                    </h3>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl text-dancheong-ink font-bold tracking-tighter">
                        <AutoTranslatedText text="비즈니스를 위한 다목적 공간 플랫폼" />
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="heritage-card rounded-2xl p-8 shadow-sm group"
                        >
                            <div className="mb-6 p-4 bg-dancheong-ink/5 rounded-full inline-block group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-black text-dancheong-ink mb-3 tracking-wide">
                                <AutoTranslatedText text={feature.title} />
                            </h4>
                            <p className="text-dancheong-ink text-sm leading-tight break-keep font-medium">
                                <AutoTranslatedText text={feature.desc} />
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
