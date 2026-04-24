import React from 'react';
import { motion } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Layers, Network, Globe, Shield } from 'lucide-react';

const archFeatures = [
    {
        id: 'engine',
        icon: <Layers className="w-6 h-6 text-dancheong-mugwort" />,
        title: 'Immersive 3D Engine',
        desc: 'Three.js 및 WebGL 기반의 고성능 최적화 렌더링 파이프라인. 별도 클라이언트 설치 없이 웹 브라우저만으로 압도적인 몰입감의 가상 환경(Virtual Space)을 구축합니다.'
    },
    {
        id: 'webrtc',
        icon: <Network className="w-6 h-6 text-dancheong-navy" />,
        title: 'Real-time WebRTC',
        desc: '소켓 기반 초저지연 실시간 양방향 통신망. 미팅룸 화상 채팅, 다크 테마 기반 프라이빗 워크스페이스 내 화면 공유 등 글로벌 비대면 협업 인프라를 완벽하게 지원합니다.'
    },
    {
        id: 'global',
        icon: <Globe className="w-6 h-6 text-dancheong-mugwort" />,
        title: 'Global i18n & Localization',
        desc: '문맥 인지형 실시간 자동 번역 시스템(AutoTranslatedText)과 다국어 언어팩 동적 로딩을 결합하여, 글로벌 클라이언트와의 비즈니스 미팅에서 언어의 장벽을 허뭅니다.'
    },
    {
        id: 'security',
        icon: <Shield className="w-6 h-6 text-dancheong-navy" />,
        title: 'Enterprise-grade Security',
        desc: '분산 토큰 인증 기반 보안 구조 및 철저한 세션 캡슐화. 각 기업 고객별로 완벽히 분리된 프라이빗 포털 환경을 제공하여 핵심 비즈니스 데이터를 보호합니다.'
    }
];

export const LandingArchitectureSection: React.FC = () => {
    return (
        <section className="relative w-full py-32 px-6 bg-white flex flex-col items-center border-t border-dancheong-ink/5">
            <div className="max-w-6xl mx-auto w-full relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/3 sticky top-32"
                    >
                        <h3 className="text-dancheong-mugwort text-sm tracking-[0.3em] uppercase mb-4">
                            <AutoTranslatedText text="System Architecture" />
                        </h3>
                        <h2 className="text-3xl md:text-5xl text-dancheong-ink font-bold mb-6 tracking-tight leading-tight">
                            <AutoTranslatedText text="강력하고 유연한" /><br />
                            <AutoTranslatedText text="플랫폼 인프라" />
                        </h2>
                        <p className="text-dancheong-ink/50 leading-relaxed font-light break-keep">
                            <AutoTranslatedText text="단순한 보여주기식 3D 모델링에서 벗어나, 기업의 실질적인 생산성 향상과 글로벌 비즈니스 영위를 돕기 위한 핵심 기반 기술 4가지를 유기적으로 통합했습니다." />
                        </p>
                    </motion.div>

                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {archFeatures.map((feature, idx) => (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="bg-white border border-dancheong-ink/5 rounded-[2rem] p-8 hover:border-dancheong-ink/20 transition-all duration-300 group shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-dancheong-ink/5 rounded-full blur-[50px] group-hover:bg-dancheong-ink/10 transition-colors" />
                                <div className="mb-6 p-4 rounded-full inline-flex bg-dancheong-ink/5 border border-dancheong-ink/5">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-dancheong-ink mb-4 tracking-wide">
                                    <AutoTranslatedText text={feature.title} />
                                </h4>
                                <p className="text-dancheong-ink/50 text-sm leading-relaxed break-keep font-light">
                                    <AutoTranslatedText text={feature.desc} />
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
