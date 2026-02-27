import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
// import { useTranslation } from 'react-i18next'; // Unused

const AboutPage: React.FC = () => {
    // const { t } = useTranslation(); // Unused

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-24 min-h-screen bg-black text-white selection:bg-dancheong-red selection:text-white">
            {/* Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2560&auto=format&fit=crop"
                        alt="Department Store Aesthetic"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-4 inline-flex items-center gap-3"
                    >
                        <span className="w-12 h-[1px] bg-dancheong-red"></span>
                        <span className="text-sm font-bold tracking-[0.3em] text-dancheong-red uppercase">Identity & Philosophy</span>
                        <span className="w-12 h-[1px] bg-dancheong-red"></span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 tracking-tight drop-shadow-xl"
                    >
                        우리의 철학
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl md:text-2xl font-light text-white/50 max-w-3xl mx-auto italic"
                    >
                        "A Living Exhibition, curating your taste and experiences."
                    </motion.p>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-32 container mx-auto px-6 relative">
                {/* Background Typography */}
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-[0.02] select-none -z-10">
                    <span className="text-[20vw] font-serif font-bold whitespace-nowrap leading-none tracking-tighter">
                        CURATION
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="order-2 lg:order-1 relative z-10"
                    >
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-10 leading-tight">
                            전통의 굳은 깊이 위에<br />
                            <span className="text-dancheong-green">현대의 유려한 시각을 세우다.</span>
                        </h2>

                        <div className="space-y-8 text-lg text-white/60 font-light leading-relaxed">
                            <p className="relative">
                                <span className="absolute -left-6 top-0 text-4xl font-serif text-white/10">"</span>
                                department는 한국의 다채로운 문화 유산과 가장 트렌디한 감각이 만나는 프리미엄 아트 갤러리 백화점입니다.
                            </p>
                            <p>
                                우리는 문화를 단순히 진열하고 전시하는 것을 넘어, 관람객의 일상에 영감을 불어넣는 입체적인 '큐레이션 공간'을 지향합니다.
                                각 층마다 다르게 펼쳐지는 K-컬처, 예술, 라이프스타일을 통해 당신만의 취향을 재발견해보세요.
                            </p>
                            <p>
                                낡은 유리 진열장에서 벗어나, 살아 숨쉬는 일상 속 아름다움으로. department가 선보이는 새로운 문화적 사치를 경험하십시오.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="order-1 lg:order-2 relative aspect-[4/5] md:aspect-[3/4] rounded-[2rem] overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2560&auto=format&fit=crop"
                            alt="Curation Process"
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Glassmorphism Floating Badge */}
                        <div className="absolute bottom-8 left-8 right-8 bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl">
                            <h3 className="text-xl font-serif font-bold text-white mb-2">The Department Standard</h3>
                            <p className="text-sm text-white/50 font-light">엄격하게 선별된 갤러리 수준의 문화 경험</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-32 bg-charcoal/30 relative border-t border-white/5">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center mb-20 text-center">
                        <span className="text-sm font-bold tracking-[0.3em] text-dancheong-red uppercase mb-4 block">Core Values</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold">브랜드 핵심 가치</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        {[
                            {
                                id: '01',
                                title: 'Curation (큐레이션)',
                                subtitle: '엄선된 안목',
                                desc: '동시대 가장 감각적인 브랜드와 아티스트를 발굴하여, 공간 전체를 하나의 거대한 전시처럼 기획합니다.'
                            },
                            {
                                id: '02',
                                title: 'Aesthetic (심미성)',
                                subtitle: '디자인 철학',
                                desc: '머무는 곳곳에 미학적 디테일을 배치하여, 방문객의 시각적 기대치를 뛰어넘는 압도적인 아름다움을 선사합니다.'
                            },
                            {
                                id: '03',
                                title: 'Experience (경험)',
                                subtitle: '입체적 여정',
                                desc: '상품을 소비하는 행위를 넘어, 층별로 달라지는 오감의 자극을 통해 당신의 취향이 확장되는 경험을 제공합니다.'
                            }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
                                className="relative p-10 bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl group overflow-hidden"
                            >
                                {/* Hover background gradient effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-dancheong-red/5 to-dancheong-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                <span className="text-6xl font-serif font-bold text-white/5 block mb-8 transition-colors duration-500 group-hover:text-dancheong-red/20">{value.id}</span>

                                <h3 className="text-sm tracking-[0.2em] font-bold text-dancheong-green uppercase mb-2">
                                    {value.subtitle}
                                </h3>
                                <h4 className="text-2xl font-serif font-bold text-white mb-6">
                                    {value.title}
                                </h4>

                                <p className="text-white/50 font-light leading-relaxed group-hover:text-white/70 transition-colors duration-500">
                                    {value.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
