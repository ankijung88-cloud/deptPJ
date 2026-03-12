import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { Users, Target, Layers, Box, Activity, Globe, Code2, Cpu, Layout, Play, Cloud, Award, Palette, Heart, ShieldCheck, Calendar, TrendingUp, Home } from 'lucide-react';

const Slide = ({ children, className = "", bgColor = "transparent", id, title, icon: Icon }: { children: React.ReactNode, className?: string, bgColor?: string, id?: string, title?: string, icon?: any }) => (
    <section className={`w-full min-h-[100dvh] flex flex-col items-center snap-start snap-always relative px-4 md:px-12 py-8 md:py-12 ${className}`} style={{ backgroundColor: bgColor }}>
        <div className="w-full max-w-6xl mx-auto relative z-10 flex-1 flex flex-col">
            {id && title && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-6 shrink-0 border-b border-white/10 pb-4 w-full"
                >
                    <span className="text-dancheong-red text-sm font-bold tracking-[0.3em] uppercase block mb-3">{id}.</span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold flex items-center gap-4 break-keep">
                        {Icon && <Icon className="w-10 h-10 text-dancheong-gold opacity-50 shrink-0" />}
                        <AutoTranslatedText text={title} />
                    </h2>
                </motion.div>
            )}
            <div className="flex-1 flex flex-col justify-center">
                {children}
            </div>
        </div>
    </section>
);

const FadeInContent = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={`border-l-2 border-white/10 pl-6 md:pl-12 py-2 relative ${className}`}
        >
            <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-dancheong-red shadow-[0_0_10px_rgba(235,59,45,0.8)]"></div>
            {children}
        </motion.div>
    );
};

const AboutPage: React.FC = () => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [videoError, setVideoError] = React.useState(false);
    const [videoLoaded, setVideoLoaded] = React.useState(false);
    const { scrollYProgress } = useScroll({ container: containerRef });
    const yHero = useTransform(scrollYProgress, [0, 0.1], [0, 200]);
    const navigate = useNavigate();

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo(0, 0);
        }
    }, []);

    const teamMembers = [
        { name: "안기정", role: "사이트 제작 (Frontend & Architecture)" },
        { name: "정효린", role: "영상 제작 (Video Production)" },
        { name: "박시환", role: "영상 제작 (Video & Motion)" },
        { name: "박보승", role: "3D 그래픽 효과 (WebGL & Assets)" },
        { name: "김예리", role: "디자인 기획 (UI/UX Branding)" }
    ];

    const techStacks = [
        { id: "06-1", title: "프론트엔드 프레임워크", desc: "React 18, TypeScript, Vite으로 구성된 고성능 SPA 환경." },
        { id: "06-2", title: "백엔드 & DB", desc: "Supabase (PostgreSQL) 실시간 데이터 동기화 및 에지 펑션." },
        { id: "06-3", title: "3D & 그래픽", desc: "Three.js & Spline을 활용한 브라우저 네이티브 렌더링." },
    ];

    return (
        <div ref={containerRef} className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory bg-[#1A2420] text-white font-sans selection:bg-dancheong-red/30 relative scroll-smooth">

            <button
                onClick={() => navigate('/')}
                className="fixed top-6 right-6 md:top-10 md:right-10 z-[100] p-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-black/60 hover:border-white/30 transition-all shadow-lg group"
                aria-label={t('common.back_home')}
            >
                <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            {/* 01. Hero / Title Section */}
            <Slide className="border-b border-white/5 !px-0 !py-0 overscroll-none" id="01">
                <motion.div style={{ y: yHero }} className="absolute inset-0 z-0 bg-[#0A100D]">
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        onLoadedData={() => setVideoLoaded(true)}
                        onError={() => setVideoError(true)}
                        className={`w-full h-full object-cover mix-blend-screen scale-105 transition-opacity duration-1000 ${videoLoaded ? 'opacity-40' : 'opacity-0'}`}
                    >
                        <source src="https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/main_hero.mp4" type="video/mp4" />
                    </video>
                    {/* Fallback pattern if video fails */}
                    {(videoError || !videoLoaded) && (
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0" style={{ 
                                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(235,59,45,0.1) 1px, transparent 0)`,
                                backgroundSize: '40px 40px'
                            }} />
                            <div className="absolute inset-0 bg-gradient-to-br from-dancheong-red/5 to-transparent animate-pulse" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1A2420]/80 via-[#1A2420]/40 to-[#1A2420]"></div>
                </motion.div>
                <div className="relative z-10 text-center px-6 mt-16 flex-1 flex flex-col justify-center items-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                        <span className="text-dancheong-red text-sm font-bold tracking-[0.5em] uppercase block mb-6 drop-shadow-lg"><AutoTranslatedText text="01. 프로젝트 발표" /></span>
                        <h1 className="text-6xl md:text-[8rem] font-serif font-black mb-6 tracking-tighter leading-[1.1] drop-shadow-2xl">
                            <span className="text-dancheong-red"><AutoTranslatedText text="백화점" /></span><br /><AutoTranslatedText text="OF K-CULTURE" />
                        </h1>
                        <p className="text-2xl md:text-3xl font-light text-white/90 italic max-w-3xl mx-auto break-keep drop-shadow-md">
                            <AutoTranslatedText text="전통과 현대가 만나는 3D 인터랙티브 가상 백화점" />
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                    >
                        <span className="text-xs tracking-[0.3em] uppercase text-white/50 mb-2"><AutoTranslatedText text="아래로 스크롤" /></span>
                        <div className="w-[1px] h-12 bg-gradient-to-b from-dancheong-gold to-transparent"></div>
                    </motion.div>
                </div>
            </Slide>

            {/* 02. Team */}
            <Slide bgColor="#161e1b" id="02" title="참여 인원 및 역할 (Team Members)" icon={Users}>
                <FadeInContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-4">
                        {teamMembers.map((member, idx) => (
                            <div key={idx} className="group cursor-pointer">
                                <div className="aspect-square bg-white/5 rounded-2xl mb-4 overflow-hidden border border-white/10 relative transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(212,175,55,0.15)] group-hover:border-dancheong-gold/50">
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm">
                                        <p className="text-center text-xs font-bold text-dancheong-gold px-2 break-keep"><AutoTranslatedText text={member.role} /></p>
                                    </div>
                                    <Users size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-white/30" />
                                </div>
                                <h3 className="text-xl font-bold"><AutoTranslatedText text={member.name} /></h3>
                                <p className="text-white/40 text-xs mt-1 truncate"><AutoTranslatedText text={member.role.split('(')[0]} /></p>
                            </div>
                        ))}
                    </div>
                </FadeInContent>
            </Slide>

            {/* 03. Project Overview */}
            <Slide id="03" title="프로젝트 개요 (Project Overview)" icon={Target}>
                <FadeInContent>
                    <div className="flex flex-col gap-10 mt-2 w-full">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-2xl font-bold mb-4 text-white"><AutoTranslatedText text="프로젝트 요약 (Executive Summary)" /></h3>
                                <p className="text-white/80 font-light text-lg leading-relaxed bg-white/5 p-8 rounded-3xl border border-white/5 h-full">
                                    <AutoTranslatedText text="K-컬처의 예술적 가치와 다양한 브랜드를 한 공간에 담아낸 웹 기반 가상 백화점입니다." /><br /><br />
                                    <AutoTranslatedText text="사용자는 브라우저 상에서 직접 3D 전시 공간을 탐험하며, 평면적인 e-commerce의 한계를 넘는 혁신적인 인터랙티브 소비 경험을 만나게 됩니다." />
                                </p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-4 text-dancheong-gold"><AutoTranslatedText text="기획 의도 (Planning Intention)" /></h3>
                                <div className="bg-gradient-to-r from-white/[0.05] to-transparent border-l-4 border-dancheong-gold p-8 rounded-r-3xl h-full flex items-center">
                                    <p className="text-white/80 font-light text-lg leading-relaxed text-left">
                                        <AutoTranslatedText text="K-팝, K-뷰티, K-푸드 등 다각화된 한국 문화를 '층(Floor)'이라는 공간적 메타포로 통합하여, 몰입감 넘치는 탐험 경험과 직관적인 정보 큐레이션을 동시에 제공합니다." />
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10 pt-8 border-t border-white/10">
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-dancheong-red"><AutoTranslatedText text="시장의 문제점 (Problem)" /></h3>
                                <ul className="list-none space-y-4 text-white/70 font-light text-base text-left bg-black/40 p-6 rounded-2xl border border-white/5 h-full">
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-red mt-2 shrink-0" /><span className="flex-1 text-left"><AutoTranslatedText text="기존 아카이브 사이트들의 평면적인 정보 나열 방식" /></span></li>
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-red mt-2 shrink-0" /><span className="flex-1 text-left"><AutoTranslatedText text="오프라인 매장 방문 없이 느낄 수 없는 브랜드 공간 철학의 부재" /></span></li>
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-red mt-2 shrink-0" /><span className="flex-1 text-left"><AutoTranslatedText text="글로벌 사용자들을 위한 통합된 하이엔드 온라인 쇼룸 부족" /></span></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-dancheong-gold"><AutoTranslatedText text="선정 배경 (Background)" /></h3>
                                <ul className="list-none space-y-4 text-white/70 font-light text-base text-left bg-black/40 p-6 rounded-2xl border border-white/5 h-full">
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-gold mt-2 shrink-0" /><span className="flex-1"><AutoTranslatedText text="전 세계적 K-문화 확산에 따른 프리미엄 메타-컬처 플랫폼의 필요성 증대" /></span></li>
                                    <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-dancheong-gold mt-2 shrink-0" /><span className="flex-1"><AutoTranslatedText text="비대면 시대 이후, 공간 메타포(Spatial Metaphor)를 활용한 3D 웹 인터랙션 트렌드 부상" /></span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </FadeInContent>
            </Slide>

            {/* 04. Core Theme & Target Audience */}
            <Slide bgColor="#161e1b" id="04" title="프로젝트 핵심 주제 및 타겟 고객층 (Core Theme & Target Audience)" icon={ShieldCheck}>
                <div className="flex flex-col gap-12 mt-4">
                    <FadeInContent>
                        <div className="bg-gradient-to-br from-black/60 to-black/20 p-12 md:p-20 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
                            <Globe className="absolute -right-20 -bottom-20 w-[30rem] h-[30rem] text-white/5" strokeWidth={1} />
                            <div className="relative z-10">
                                <h3 className="text-4xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-dancheong-gold to-white">
                                    <AutoTranslatedText text="Virtual Cultural Department Store" />
                                </h3>
                                <p className="text-xl text-white/80 font-light break-keep leading-relaxed max-w-3xl">
                                    <AutoTranslatedText text="1층부터 6층까지 각기 다른 K-테마의 디지털 스토어를 입체화. 기존의 스크롤 중심 웹페이지에서 벗어나, 층을 이동하는 형태의 탐험 심리를 자극합니다." />
                                </p>
                            </div>
                        </div>
                    </FadeInContent>

                    <FadeInContent delay={0.2}>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                <h4 className="text-2xl font-bold mb-4 text-dancheong-gold">Global MZ</h4>
                                <p className="text-base text-white/70 break-keep leading-relaxed"><AutoTranslatedText text="K-컬처에 열광하는" /><br /><AutoTranslatedText text="전 세계 트렌드 세터" /></p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                <h4 className="text-2xl font-bold mb-4 text-white">Luxury Consumers</h4>
                                <p className="text-base text-white/70 break-keep leading-relaxed"><AutoTranslatedText text="디지털 환경에서도" /><br /><AutoTranslatedText text="하이엔드 미학을 소비하는 층" /></p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                <h4 className="text-2xl font-bold mb-4 text-dancheong-red">Brands & Creators</h4>
                                <p className="text-base text-white/70 break-keep leading-relaxed"><AutoTranslatedText text="온라인 프리미엄 쇼룸" /><br /><AutoTranslatedText text="구축을 원하는 파트너" /></p>
                            </div>
                        </div>
                    </FadeInContent>
                </div>
            </Slide>

            {/* 05. Design Concept & Visual Fusion */}
            <Slide id="05" title="디자인 컨셉 및 시각적 표현 (Design Concept & Visual Fusion)" icon={Palette}>
                <FadeInContent>
                    <p className="text-white/80 font-light text-xl md:text-2xl leading-relaxed break-keep mt-2 max-w-4xl">
                        <AutoTranslatedText text="단청(Dancheong)의 딥 그린, 강렬한 레드, 금빛 포인트를 차용하여 현대의 다크 모드 환경에 최적화된" /><br />
                        <span className="text-dancheong-gold font-bold text-2xl md:text-3xl mt-2 inline-block"><AutoTranslatedText text=' 가장 현대적인 방식의 전통"' /></span><AutoTranslatedText text="을 시각화." />
                    </p>
                </FadeInContent>

                <FadeInContent delay={0.2}>
                    <div className="relative w-full aspect-[21/7] rounded-[2rem] overflow-hidden bg-[#0d1210] border border-white/10 flex items-center justify-center group mt-4 px-8 md:px-16">
                        {/* Inline SVG for 100% Reliability: Design Fusion Metaphor (High Visibility) */}
                        <svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-80 transition-transform duration-[3s] group-hover:scale-105">
                            {/* Traditional Dancheong Roof Curve */}
                            <path d="M50 80 Q 200 40, 400 80 T 750 80" stroke="#C5A15A" strokeWidth="3" strokeLinecap="round" opacity="1" />
                            <path d="M50 100 Q 200 60, 400 100 T 750 100" stroke="#C5A15A" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                            <path d="M50 120 Q 200 80, 400 120 T 750 120" stroke="#C5A15A" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

                            {/* Modern Mobile UI Frames (Paralleling the Curves) */}
                            <rect x="250" y="50" width="80" height="140" rx="12" stroke="white" strokeWidth="1.5" opacity="0.4" />
                            <rect x="360" y="30" width="80" height="140" rx="12" stroke="white" strokeWidth="2.5" opacity="0.8" />
                            <rect x="470" y="50" width="80" height="140" rx="12" stroke="white" strokeWidth="1.5" opacity="0.4" />

                            {/* Connectors / Metaphoric Flow */}
                            <path d="M30 100 L 770 100" stroke="white" strokeWidth="0.3" strokeDasharray="8 8" opacity="0.2" />
                            <path d="M360 100 L 400 100" stroke="white" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.8" />
                            <circle cx="400" cy="100" r="3" fill="#E62E2E" className="animate-pulse" /> { /* Dancheong Red Point */}
                        </svg>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 md:left-12 z-10 max-w-xl backdrop-blur-md bg-black/40 p-5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-bold text-dancheong-gold uppercase tracking-[0.3em] mb-2"><AutoTranslatedText text="Concept Reference" /></p>
                            <p className="text-white/90 font-light text-sm md:text-base break-keep leading-normal"><AutoTranslatedText text="스마트폰 스크린 속 현대적 여백의 미학(UI)과 단청 지붕의 섬세한 기하학적 구조가 평행선을 달리는 고도화된 메타포 시각화." /></p>
                        </div>
                    </div>
                </FadeInContent>
            </Slide>

            {/* 06. Tech Ecosystem & Architecture */}
            <Slide bgColor="#131916" id="06" title="기술 생태계 및 아키텍처 (Tech Ecosystem & Architecture)" icon={Layers} className="!py-12">
                <FadeInContent>
                    {/* Architecture Diagram */}
                    <div className="relative w-full aspect-[21/7] max-h-[35vh] rounded-[1.5rem] overflow-hidden bg-black border border-white/10 flex items-center justify-center p-3 mt-2 group">
                        {/* Inline SVG for 100% Reliability: Architecture Sketch (High Visibility) */}
                        <svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-x-0 top-0 w-full h-full opacity-80 mix-blend-screen transition-transform duration-[2s] group-hover:scale-105">
                            <path d="M0 40 L800 40 M0 200 L800 200" stroke="white" strokeWidth="0.8" strokeDasharray="10 10" />
                            <circle cx="150" cy="120" r="80" stroke="white" strokeWidth="0.4" />
                            <circle cx="400" cy="120" r="100" stroke="white" strokeWidth="0.5" />
                            <circle cx="650" cy="120" r="80" stroke="white" strokeWidth="0.4" />
                            <path d="M150 120 L400 120 L650 120" stroke="white" strokeWidth="0.5" strokeDasharray="5 5" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2420]/80 to-[#1A2420]/20 backdrop-blur-[2px]"></div>
                        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-2 justify-between select-none scale-90 md:scale-100">
                            <div className="bg-black/80 backdrop-blur-xl p-3 rounded-xl border border-white/20 flex-1 flex flex-col items-center justify-center shadow-2xl">
                                <Cloud size={28} className="mb-1 text-dancheong-red" strokeWidth={1} />
                                <h4 className="font-bold text-sm mb-0.5"><AutoTranslatedText text="Supabase" /></h4>
                                <p className="text-[9px] text-white/50 text-center leading-tight"><AutoTranslatedText text="실시간 DB & 스토리지" /><br /><AutoTranslatedText text="인증 / 에지 펑션" /></p>
                            </div>
                            <div className="hidden md:flex items-center text-white/30"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                            <div className="bg-black/80 backdrop-blur-xl p-3 rounded-xl border border-white/20 flex-1 flex flex-col items-center justify-center shadow-2xl scale-105 z-10">
                                <Cpu size={28} className="mb-1 text-dancheong-gold" strokeWidth={1} />
                                <h4 className="font-bold text-sm mb-0.5"><AutoTranslatedText text="Vite + React" /></h4>
                                <p className="text-[9px] text-white/50 text-center leading-tight"><AutoTranslatedText text="핵심 SPA 엔진" /><br /><AutoTranslatedText text="TypeScript / Context API" /></p>
                            </div>
                            <div className="hidden md:flex items-center text-white/30"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                            <div className="bg-black/80 backdrop-blur-xl p-3 rounded-xl border border-white/20 flex-1 flex flex-col items-center justify-center shadow-2xl">
                                <Layout size={28} className="mb-1 text-dancheong-green" strokeWidth={1} />
                                <h4 className="font-bold text-sm mb-0.5"><AutoTranslatedText text="Tailwind + Framer" /></h4>
                                <p className="text-[9px] text-white/50 text-center leading-tight"><AutoTranslatedText text="Glassmorphism UI 레이어" /><br /><AutoTranslatedText text="마이크로 인터랙션" /></p>
                            </div>
                        </div>
                    </div>

                    {/* Tech Stacks & AI Pipeline Grid */}
                    <div className="grid md:grid-cols-5 gap-3 mt-3">
                        {/* Tech Stacks (3 cards) */}
                        {techStacks.map((t) => (
                            <div key={t.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-center h-full min-h-[100px]">
                                <h4 className="font-bold text-[11px] text-dancheong-gold mb-1"><AutoTranslatedText text={t.title} /></h4>
                                <p className="text-white/60 font-light text-[10px] leading-snug"><AutoTranslatedText text={t.desc} /></p>
                            </div>
                        ))}
                        {/* AI Pipeline (2 cards) */}
                        <div className="p-4 bg-gradient-to-br from-blue-900/10 to-cyan-900/10 rounded-xl border border-blue-500/20 shadow-lg min-h-[100px] flex flex-col justify-center">
                            <h4 className="text-[11px] font-bold mb-1 text-blue-400"><AutoTranslatedText text="AI Translation" /></h4>
                            <p className="text-[10px] text-white/60 font-light leading-snug"><AutoTranslatedText text="자체 구축한 i18n 파이프라인과 LLM을 결합하여 실시간 다국어 번역 적용." /></p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-900/10 to-pink-900/10 rounded-xl border border-purple-500/20 shadow-lg min-h-[100px] flex flex-col justify-center">
                            <h4 className="text-[11px] font-bold mb-1 text-purple-400"><AutoTranslatedText text="Code Optimization" /></h4>
                            <p className="text-[10px] text-white/60 font-light leading-snug"><AutoTranslatedText text="AI 에이전트 협업으로 복잡한 3D 렌더링 로직 고속 구축." /></p>
                        </div>
                    </div>
                </FadeInContent>
            </Slide>

            {/* 07. Dev Tools */}
            <Slide bgColor="#161e1b" id="07" title="개발 장비 및 핵심 툴 (Dev Tools)" icon={Box}>
                <FadeInContent>
                    <div className="flex flex-wrap gap-6 mt-6 w-full max-w-4xl mx-auto items-center justify-center">
                        {['VSCode', 'Antigravity', 'Git / GitHub', 'Premiere Pro', 'Nano Banana', 'Flow', 'Grok', 'Spline 3D', 'Three.js', 'Figma', 'Supabase Edge'].map((tool, idx) => (
                            <motion.span
                                key={tool}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="px-8 py-4 bg-white/5 backdrop-blur-sm rounded-full text-lg font-bold border border-white/10 hover:border-dancheong-gold hover:text-dancheong-gold hover:bg-white/10 transition-all cursor-default shadow-lg"
                            >
                                {tool}
                            </motion.span>
                        ))}
                    </div>
                </FadeInContent>
            </Slide>

            {/* 08. Purpose */}
            <Slide id="08" title="개발 목적 및 주안점 (Project Purpose)" icon={Target}>
                <div className="grid md:grid-cols-2 gap-16 mt-4">
                    <FadeInContent>
                        <h4 className="font-bold text-2xl text-white mb-4 flex items-center gap-3"><Heart className="w-6 h-6 text-dancheong-red" /> <AutoTranslatedText text="감성적 웹 경험의 극대화" /></h4>
                        <p className="text-white/70 font-light text-xl break-keep leading-relaxed mt-4 bg-black/40 p-8 rounded-3xl border border-white/10"><AutoTranslatedText text="웹페이지가 단순히 정보를 열람하는 문서를 넘어, 마우스를 얹는 순간부터 물리적으로 상호작용하는 '감각적 몰입 매체' 역할을 하도록 심혈을 기울여 설계했습니다." /></p>
                    </FadeInContent>
                    <FadeInContent delay={0.2}>
                        <h4 className="font-bold text-2xl text-white mb-4 flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-dancheong-gold" /> <AutoTranslatedText text="개발적 허들의 극복" /></h4>
                        <p className="text-white/70 font-light text-xl break-keep leading-relaxed mt-4 bg-black/40 p-8 rounded-3xl border border-white/10"><AutoTranslatedText text="웹 브라우저 상에서 무거운 그래픽 엔진(Three.js/비디오)과 SPA의 라우팅 상태 관리가 충돌하지 않도록 컴포넌트 생명 주기를 통제하고 고도의 메모리 최적화 기법을 확보했습니다." /></p>
                    </FadeInContent>
                </div>
            </Slide>

            {/* 09. Timeline */}
            <Slide bgColor="#131916" id="09" title="개발 타임라인 (Project Timeline)" icon={Calendar}>
                <FadeInContent>
                    <div className="relative border-l-2 border-white/10 ml-6 md:ml-12 mt-6 space-y-12 max-w-3xl">
                        {[
                            { step: 'Phase 1. Planning', desc: '요구사항 분석, 벤치마킹, 디자인 철학 확립' },
                            { step: 'Phase 2. Design', desc: 'UI/UX 기획, 컴포넌트 구조화, 반응형 목업 제작' },
                            { step: 'Phase 3. Assets & 3D', desc: '3D 오브젝트 제작 및 WebGL 포트팅, Video 렌더링 삽입' },
                            { step: 'Phase 4. Development', desc: 'Supabase DB 통신 세팅, i18n 파이프라인 연결, 동적 라우팅' },
                            { step: 'Phase 5. Polish', desc: '모션 애니메이션 (Framer) 섬세화 적용 및 QA/종합 배포' },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className="pl-12 relative group"
                            >
                                <div className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-[#1A2420] border-2 border-dancheong-gold transition-transform duration-300 group-hover:scale-150 group-hover:bg-dancheong-gold"></div>
                                <h4 className="text-2xl font-bold mb-2 text-white group-hover:text-dancheong-gold transition-colors"><AutoTranslatedText text={s.step} /></h4>
                                <p className="text-lg text-white/50"><AutoTranslatedText text={s.desc} /></p>
                            </motion.div>
                        ))}
                    </div>
                </FadeInContent>
            </Slide>

            {/* 10. 6-Tier Architecture */}
            <Slide id="10" title="6단계 공간 컨텐츠 구조 (6F Building Meta)" icon={Layers}>
                <FadeInContent>
                    <div className="grid md:grid-cols-2 gap-16 items-center bg-black/40 p-12 rounded-[2.5rem] border border-white/10 mt-6 backdrop-blur-xl">
                        <div>
                            <p className="text-white/80 text-xl font-light mb-10 break-keep leading-relaxed"><AutoTranslatedText text="물리적 백화점 건축의 수직적 계층 구조를 차용하여, 하이엔드 럭셔리부터 로컬 헤리티지까지 체계적이고 직관적인 데이터 라우팅을 설계했습니다." /></p>
                            <div className="space-y-4">
                                {[
                                    { n: '6F', t: '로컬 헤리티지 (Local Heritage)', c: 'border-dancheong-gold' },
                                    { n: '5F', t: '패션 아카이브 (Fashion)', c: 'border-white/20' },
                                    { n: '4F', t: '컬처 토크 (Culture Talk)', c: 'border-white/20' },
                                    { n: '3F', t: '퍼포먼스 & 전시 (Performance)', c: 'border-white/20' },
                                    { n: '2F', t: '콜라보레이션 & 팝업 (Popup)', c: 'border-white/20' },
                                    { n: '1F', t: '글로벌 K-트렌드 (Global Trend)', c: 'border-dancheong-red' }
                                ].map((f, i) => (
                                    <div key={i} className={`flex items-center gap-4 px-6 py-4 bg-white/5 rounded-xl border border-white/5 border-l-4 ${f.c} hover:bg-white/10 transition-colors cursor-default`}>
                                        <span className="font-black text-xl w-8 text-white/40">{f.n}</span>
                                        <span className="font-bold text-lg"><AutoTranslatedText text={f.t} /></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative aspect-[3/4] bg-gradient-to-b from-white/5 to-[#0a0a0a] rounded-[2rem] flex flex-col items-center justify-center border border-white/10 overflow-hidden shadow-2xl group/img p-4 md:p-8">
                            {/* Inline SVG Blueprint for 100% Reliability (High Visibility) */}
                            <svg viewBox="0 0 200 280" className="w-full h-full opacity-85 mix-blend-screen transition-transform duration-[3s] group-hover/img:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M40 240L160 240L160 200L40 200Z" stroke="white" strokeWidth="0.8" />
                                <path d="M40 200L160 200L160 160L40 160Z" stroke="white" strokeWidth="0.8" />
                                <path d="M40 160L160 160L160 120L40 120Z" stroke="white" strokeWidth="0.8" />
                                <path d="M40 120L160 120L160 80L40 80Z" stroke="white" strokeWidth="0.8" />
                                <path d="M40 80L160 80L160 40L40 40Z" stroke="white" strokeWidth="0.8" />
                                <path d="M40 40L160 40L160 10L40 10Z" stroke="white" strokeWidth="0.8" />

                                {/* Structural Vertical Lines */}
                                <path d="M60 10L60 240 M100 10L100 240 M140 10L140 240" stroke="white" strokeWidth="0.3" strokeDasharray="3 3" opacity="0.5" />

                                {/* Floor Labels */}
                                <text x="170" y="225" fill="white" fontSize="11" className="font-serif font-bold">1F</text>
                                <text x="170" y="185" fill="white" fontSize="11" className="font-serif font-bold">2F</text>
                                <text x="170" y="145" fill="white" fontSize="11" className="font-serif font-bold">3F</text>
                                <text x="170" y="105" fill="white" fontSize="11" className="font-serif font-bold">4F</text>
                                <text x="170" y="65" fill="white" fontSize="11" className="font-serif font-bold">5F</text>
                                <text x="170" y="25" fill="white" fontSize="11" className="font-serif font-bold">6F</text>

                                {/* Technical Grid Accents */}
                                <circle cx="40" cy="240" r="2" fill="#C5A15A" />
                                <circle cx="160" cy="240" r="2" fill="#C5A15A" />
                                <path d="M15 240L35 240 M165 240L185 240" stroke="#C5A15A" strokeWidth="0.8" />
                            </svg>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111] via-[#111]/90 to-transparent pt-32 pb-8 flex justify-center backdrop-blur-[1px]">
                                <span className="font-bold tracking-[0.4em] text-dancheong-gold/80 text-[10px] md:text-xs uppercase">Architecture Concept</span>
                            </div>
                        </div>
                    </div>
                </FadeInContent>
            </Slide>

            {/* 11. Features Overview */}
            <Slide bgColor="#161e1b" id="11" title="핵심 기능 및 특징 (Features Overview)" icon={Award}>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 mt-4">
                    <FadeInContent>
                        <h4 className="font-bold text-xl text-white mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-dancheong-green" /> <AutoTranslatedText text="글로벌 인터내셔널라이제이션 (i18n)" /></h4>
                        <p className="text-white/70 font-light text-lg border-l-4 border-dancheong-green pl-6 py-4 bg-gradient-to-r from-dancheong-green/10 to-transparent rounded-r-2xl break-keep"><AutoTranslatedText text="사용자의 접속 지역과 디바이스 설정을 감지하여, 한국어, 영어, 다국어로 즉각 치환되는 Context Provider 기반 다국어 라우팅을 구현했습니다." /></p>
                    </FadeInContent>

                    <FadeInContent delay={0.1}>
                        <h4 className="font-bold text-xl text-white mb-3 flex items-center gap-2"><Layers className="w-5 h-5 text-dancheong-gold" /> <AutoTranslatedText text="인터랙티브 3D 포털" /></h4>
                        <div className="bg-white/5 p-8 rounded-3xl h-full border border-white/5 text-lg font-light text-white/70 break-keep">
                            <AutoTranslatedText text="스크롤 가속도에 반응하는 터널형 3D 오브젝트를 Three.js로 배치. 마치 사용자가 가상의 출입문(Gateway)을 직접 뚫고 들어가는 듯한 마찰력 있는 물리적 착각을 유도합니다." />
                        </div>
                    </FadeInContent>

                    <FadeInContent>
                        <h4 className="font-bold text-xl text-white mb-3 flex items-center gap-2"><Layout className="w-5 h-5 text-white/50" /> <AutoTranslatedText text="Glassmorphism UI" /></h4>
                        <div className="bg-white/5 p-8 rounded-3xl h-full border border-white/5 text-lg font-light text-white/70 break-keep">
                            <AutoTranslatedText text="반투명도, 블러(Backdrop-blur), 그리고 미세한 인셋 쉐도우를 혼합 적용. 다이내믹한 렌더 영상 위에 UI 요소들이 유리판처럼 둥둥 떠 있는 입체감 혹은 프리미엄 무드를 달성합니다." />
                        </div>
                    </FadeInContent>

                    <FadeInContent delay={0.1}>
                        <h4 className="font-bold text-xl text-white mb-3 flex items-center gap-2"><Play className="w-5 h-5 text-dancheong-red" /> <AutoTranslatedText text="Micro-Interactions" /></h4>
                        <div className="bg-white/5 p-8 rounded-3xl h-full border border-white/5 text-lg font-light text-white/70 break-keep">
                            <AutoTranslatedText text="스무스 스크롤 제어, 공간 동기화 마우스 포인터, 그리고 자석(Magnetic) 버튼 애니메이션. 사용자의 미세한 시선과 액션 조각 하나에도 살아 숨쉬듯 기민하게 반응합니다." />
                        </div>
                    </FadeInContent>
                </div>
            </Slide>

            {/* 12. The Value Ecosystem */}
            <Slide id="12" title="가치 생태계 (The Value Ecosystem)" icon={Activity}>
                <FadeInContent>
                    <div className="relative bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-[3rem] p-12 md:p-24 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden mt-6 min-h-[500px] flex items-center">
                        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center scale-150 md:scale-100 mix-blend-screen">
                            <div className="absolute w-[45vw] md:w-[35vw] h-[45vw] md:h-[35vw] rounded-full border-[2px] border-white ml-[-15vw] mb-[10vw]"></div>
                            <div className="absolute w-[45vw] md:w-[35vw] h-[45vw] md:h-[35vw] rounded-full border-[2px] border-dancheong-gold mr-[-15vw] mb-[10vw]"></div>
                            <div className="absolute w-[45vw] md:w-[35vw] h-[45vw] md:h-[35vw] rounded-full border-[2px] border-dancheong-red mt-[15vw]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 relative z-10 w-full">
                            <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 border-t-4 border-t-white hover:-translate-y-2 transition-transform duration-500">
                                <h3 className="text-3xl font-bold mb-6 text-white text-center"><AutoTranslatedText text="사용자" /><br /><span className="text-lg opacity-50 font-light"><AutoTranslatedText text="(Users)" /></span></h3>
                                <ul className="text-base font-light text-white/80 space-y-4 list-disc list-outside ml-4 marker:text-white/50">
                                    <li><AutoTranslatedText text="단순 정보 소비를 넘어 디지털 탐험을 통한 심미적 만족감 극대화." /></li>
                                    <li><AutoTranslatedText text="이 사이트를 유영하는 행위 자체만으로 고품격 문화 페르소나 획득." /></li>
                                </ul>
                            </div>
                            <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 border-t-4 border-t-dancheong-gold hover:-translate-y-2 transition-transform duration-500">
                                <h3 className="text-3xl font-bold mb-6 text-dancheong-gold text-center"><AutoTranslatedText text="브랜드 & 아티스트" /><br /><span className="text-lg opacity-50 font-light text-white"><AutoTranslatedText text="(Brands)" /></span></h3>
                                <ul className="text-base font-light text-white/80 space-y-4 list-disc list-outside ml-4 marker:text-dancheong-gold">
                                    <li><AutoTranslatedText text="프리미엄 에디토리얼 기반 글로벌 하이엔드 채널 확보." /></li>
                                    <li><AutoTranslatedText text="물리적 국경을 초월하여 글로벌 찐팬(Fandom)과의 직접적이고 감각적인 양방향 교감." /></li>
                                </ul>
                            </div>
                            <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 border-t-4 border-t-dancheong-red hover:-translate-y-2 transition-transform duration-500 md:translate-y-12">
                                <h3 className="text-3xl font-bold mb-6 text-dancheong-red text-center"><AutoTranslatedText text="플랫폼 데이터" /><br /><span className="text-lg opacity-50 font-light text-white"><AutoTranslatedText text="(Data)" /></span></h3>
                                <ul className="text-base font-light text-white/80 space-y-4 list-disc list-outside ml-4 marker:text-dancheong-red">
                                    <li><AutoTranslatedText text="공간 메타포(1F~6F) 기반 사용자 체류 및 이동 경로 입체 분석." /></li>
                                    <li><AutoTranslatedText text="글로벌 문화 소비 패턴을 선별하여 미래 큐레이션 알고리즘 선점." /></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </FadeInContent>
            </Slide>

            {/* 13. Business Roadmap */}
            <Slide bgColor="#131916" id="13" title="비즈니스 진화 로드맵 (Business Evolution)" icon={TrendingUp}>
                <FadeInContent>
                    <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-12 md:p-20 border border-white/10 text-center mt-6 shadow-2xl">
                        <h3 className="text-3xl md:text-5xl font-light italic text-white/90 mb-20 leading-tight">
                            <AutoTranslatedText text='"기술과 예술의 경계를 허무는' /><br /><AutoTranslatedText text=' 디지털 문법의 새로운 질서, "' /><span className="font-serif font-bold text-dancheong-gold"><AutoTranslatedText text="백화점" /></span><AutoTranslatedText text='"' />
                        </h3>
                        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 text-left relative">
                            <div className="hidden md:block absolute top-[50%] left-[10%] right-[10%] h-1 bg-gradient-to-r from-white/10 via-dancheong-gold/30 to-white/10 -z-10 blur-sm"></div>

                            <div className="flex-1 bg-gradient-to-b from-black/80 to-[#111] p-10 rounded-3xl border border-white/10 relative group hover:border-white transition-all duration-500 hover:-translate-y-4 shadow-xl">
                                <div className="text-[6rem] font-black text-white/5 absolute -top-6 -right-2 group-hover:text-white/10 transition-colors select-none">1</div>
                                <h4 className="font-bold text-2xl mb-4 z-10 relative text-white pt-6">Phase 1:<br /><span className="text-xl font-light opacity-80"><AutoTranslatedText text="브랜드 구축" /></span></h4>
                                <p className="text-base font-light text-white/60 z-10 relative break-keep leading-relaxed mt-6"><AutoTranslatedText text="글로벌 K-문화 큐레이션 및 하이엔드 디지털 매거진으로서의 압도적 입지 확립." /></p>
                            </div>

                            <div className="flex-1 bg-gradient-to-b from-black/80 to-[#111] p-10 rounded-3xl border border-dancheong-gold/30 relative group hover:border-dancheong-gold transition-all duration-500 md:mt-16 hover:-translate-y-4 shadow-xl shadow-dancheong-gold/5">
                                <div className="text-[6rem] font-black text-dancheong-gold/5 absolute -top-6 -right-2 group-hover:text-dancheong-gold/10 transition-colors select-none">2</div>
                                <h4 className="font-bold text-2xl mb-4 z-10 relative text-dancheong-gold pt-6">Phase 2:<br /><span className="text-xl font-light opacity-80 text-white"><AutoTranslatedText text="인터랙티브 교류" /></span></h4>
                                <p className="text-base font-light text-white/60 z-10 relative break-keep leading-relaxed mt-6"><AutoTranslatedText text="아티스트와 글로벌 팬덤 간 영감 공유 및 실시간 양방향 커뮤니티(Talk) 확장." /></p>
                            </div>

                            <div className="flex-1 bg-gradient-to-b from-black/80 to-[#111] p-10 rounded-3xl border border-dancheong-red/30 relative group hover:border-dancheong-red transition-all duration-500 md:mt-32 hover:-translate-y-4 shadow-xl shadow-dancheong-red/10">
                                <div className="text-[6rem] font-black text-dancheong-red/5 absolute -top-6 -right-2 group-hover:text-dancheong-red/10 transition-colors select-none">3</div>
                                <h4 className="font-bold text-2xl mb-4 z-10 relative text-dancheong-red pt-6">Phase 3:<br /><span className="text-xl font-light opacity-80 text-white"><AutoTranslatedText text="생태계 확장" /></span></h4>
                                <p className="text-base font-light text-white/60 z-10 relative break-keep leading-relaxed mt-6"><AutoTranslatedText text="온·오프라인 문화 이벤트 통합 예매 관리 및 글로벌 커머스 비즈니스 모델 단행." /></p>
                            </div>
                        </div>
                    </div>
                </FadeInContent>
            </Slide>

            {/* 14. Expected Effects */}
            <Slide id="14" title="기대 효과 및 실무 활용성 (Expected Effects)" icon={Code2}>
                <div className="grid md:grid-cols-2 gap-12 mt-4">
                    <FadeInContent>
                        <h4 className="font-bold text-2xl text-dancheong-gold mb-4">기대 효과 (End-User B2C)</h4>
                        <div className="p-10 bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/10 h-full mt-2 hover:bg-black/60 transition-colors">
                            <h4 className="font-bold text-2xl mb-6 text-white"><AutoTranslatedText text="차세대 이커머스 트렌드 선도" /></h4>
                            <p className="text-white/70 font-light text-lg leading-relaxed break-keep">
                                <AutoTranslatedText text="무한 스크롤에 지친 사용자들에게 '가상 백화점 워크스루(Walk-through)'라는 참신한 패러다임을 제시하며 체류 시간을 비약적으로 늘립니다. 클릭과 마우스 궤적 하나하나가 층간 이동이 되는 마법 같은 브랜드 스토리를 전달합니다." />
                            </p>
                        </div>
                    </FadeInContent>
                    <FadeInContent delay={0.2}>
                        <h4 className="font-bold text-2xl text-dancheong-red mb-4">실무 활용성 (Agency B2B)</h4>
                        <div className="p-10 bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/10 h-full mt-2 hover:bg-black/60 transition-colors">
                            <h4 className="font-bold text-2xl mb-6 text-white"><AutoTranslatedText text="확장형 SaaS 쇼룸 템플릿 확보" /></h4>
                            <p className="text-white/70 font-light text-lg leading-relaxed break-keep">
                                <AutoTranslatedText text="프론트엔드 최적화(React+Framer)와 실시간 DB(Supabase)가 단단히 결합된 이 구조는 언제든 타 브랜드나 기업형 컨텐츠의 '가상 쇼룸 템플릿'으로 패키징 복제가 용이하여 비즈니스 에이전시의 강력한 수주 무기가 됩니다." />
                            </p>
                        </div>
                    </FadeInContent>
                </div>
            </Slide>

            {/* 15. Conclusion & Vision */}
            <Slide bgColor="#111" id="15" title="결론 및 비전 (Beyond Web)" icon={Award}>
                <FadeInContent className="!border-l-0 !pl-0 text-center w-full">
                    <div className="py-24 w-full relative">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center opacity-[0.03] select-none pointer-events-none font-serif font-black text-[20vw] leading-none whitespace-nowrap z-0">VISION</div>
                        <div className="relative z-10 max-w-4xl mx-auto mt-8">
                            <h2 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-10">
                                <AutoTranslatedText text='"공간을 렌더링하다,' /><br /><AutoTranslatedText text='문화를 혁신하다."' />
                            </h2>
                            <p className="text-2xl text-white/60 font-light break-keep leading-relaxed mb-16">
                                <AutoTranslatedText text="DEPT. 프로젝트는 단순한 코딩을 넘어 하나의 하이엔드 브랜드를 런칭하는 마스터피스입니다. 웹 공간의 한계를 부수고, 가장 현대적인 기술 위에 찬란한 문화를 세웁니다." />
                            </p>
                            <button onClick={() => window.location.href = '/inspiration'} className="px-16 py-6 border border-dancheong-red/50 bg-dancheong-red/10 text-dancheong-red font-bold tracking-[0.2em] text-lg uppercase rounded-full hover:bg-dancheong-red hover:text-white hover:scale-105 hover:shadow-[0_0_40px_rgba(235,59,45,0.6)] backdrop-blur-md transition-all duration-500">
                                <AutoTranslatedText text="가상 공간으로 입장하기" />
                            </button>
                        </div>
                    </div>
                </FadeInContent>
            </Slide>
        </div>
    );
};

export default AboutPage;
