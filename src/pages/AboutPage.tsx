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
                    <img
                        src="https://images.unsplash.com/photo-1533552865985-703cb2c3dfb6?q=80&w=2560&auto=format&fit=crop"
                        alt="Cultural Heritage"
                        className="w-full h-full object-cover grayscale opacity-40"
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
                        className="text-xl md:text-2xl font-light text-white/70 max-w-3xl mx-auto"
                    >
                        전통의 깊이를 현대의 감각으로 담아내는 공간,<br />
                        문화백화점의 이야기를 들려드립니다.
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
                        <h2 className="text-3xl font-serif font-bold mb-8 text-dancheong-green">우리의 철학</h2>
                        <div className="space-y-6 text-lg text-white/70 leading-relaxed font-light">
                            <p>
                                대한민국은 찬란한 문화유산을 가진 나라입니다.
                                하지만 빠르게 변화하는 현대 사회 속에서 우리의 전통은 점차 잊혀가는 유물이 되어가기도 합니다.
                            </p>
                            <p>
                                문화백화점은 이러한 고민에서 시작되었습니다.
                                "어떻게 하면 전통 문화가 우리의 일상 속에 자연스럽게 스며들 수 있을까?"
                                우리는 전통을 박물관 속에 가두지 않고, 오늘의 라이프스타일로 재해석하여 새로운 생명력을 불어넣고자 합니다.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative aspect-square"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1543431690-3b6be2c3cb19?q=80&w=2560&auto=format&fit=crop"
                            alt="Philosophy"
                            className="w-full h-full object-cover rounded-2xl shadow-2xl"
                        />
                        <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-dancheong-red"></div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-dancheong-green"></div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-[#222]">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-serif font-bold mb-16 text-center">핵심 가치</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: '계승 (Inheritance)', desc: '장인의 정신과 전통의 기법을 온전히 보존하고 이어갑니다.' },
                            { title: '혁신 (Innovation)', desc: '한계 없는 상상력으로 전통을 현대적인 감각으로 재창조합니다.' },
                            { title: '공존 (Coexistence)', desc: '과거와 현재, 예술과 일상이 완벽하게 어우러지는 경험을 선사합니다.' }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="p-8 border border-white/10 hover:border-dancheong-green transition-colors group"
                            >
                                <h3 className="text-xl font-bold mb-4 group-hover:text-dancheong-green">{value.title}</h3>
                                <p className="text-white/60 font-light">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
