import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
// import { useTranslation } from 'react-i18next'; // Unused

const AboutPage: React.FC = () => {
    // const { t } = useTranslation(); // Unused

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-24 min-h-screen bg-[#1a1a1a] text-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <video
                        src="/video/caravan_trip.mp4"
                        className="w-full h-full object-cover grayscale opacity-30"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a1a]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif font-bold mb-6"
                    >
                        브랜드 스토리
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl md:text-2xl font-light text-white/70 max-w-3xl mx-auto leading-relaxed"
                    >
                        일상에 스며드는 감각적 영감,<br />
                        프리미엄 컬처 스토어 DEPARTMENT의 이야기를 들려드립니다.
                    </motion.p>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 100 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="h-1 bg-dancheong-red mx-auto mt-12"
                    />
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl font-serif font-bold mb-8 text-dancheong-green">감각적 영감이 머무는 곳</h2>
                        <div className="space-y-6 text-lg text-white/80 leading-relaxed font-light break-keep">
                            <p>
                                DEPARTMENT은 시간을 초월한 고유의 미학과 동시대의 트렌드가 조화롭게 공존하는 프리미엄 컬처 스토어입니다.
                            </p>
                            <p>
                                단순한 소비의 공간을 넘어, 당신의 일상에 낯설고도 우아한 영감을 제안합니다. 매장 곳곳에 스며든 예술적 큐레이션 속에서 오직 당신만을 위한 새로운 취향을 발견해 보세요.
                            </p>
                            <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                                <p className="text-white/60">
                                    <strong className="text-dancheong-red font-normal mr-2">계승</strong>시간이 빚어낸 전통의 깊이를 온전히 보존합니다.
                                </p>
                                <p className="text-white/60">
                                    <strong className="text-dancheong-green font-normal mr-2">혁신</strong>현대의 감각으로 재해석하여 새로운 가치를 더합니다.
                                </p>
                                <p className="text-white/60">
                                    <strong className="text-blue-400 font-normal mr-2">공존</strong>서로 다른 취향과 세계가 자연스럽게 어우러집니다.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative aspect-square"
                    >
                        <div className="w-full h-full bg-black/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]"></div>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white/20 tracking-[0.3em] z-10">DEPARTMENT</h3>
                        </div>
                        <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-dancheong-red"></div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-dancheong-green"></div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
