import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { motion, useInView } from 'framer-motion';
import { getFloorCategories } from '../../api/categories';
import { FloorCategory } from '../../types';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nParams';
import { Link } from 'react-router-dom';

// 개별 카드 컴포넌트 — 마우스 기반 3D 틸트 애니메이션
const FloorCard: React.FC<{
    floor: FloorCategory;
    index: number;
    total: number;
    language: string;
}> = ({ floor, index, total, language }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // 병풍 각도
    const isEven = index % 2 === 0;
    const baseRotateY = isEven ? 4 : -4;
    const originX = isEven ? 'right' : 'left';

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // 틸트 각도 계산 (수평 ±12°, 수직 ±8°)
        const tiltX = (y - 0.5) * -16;
        const tiltY = (x - 0.5) * 24;

        // 호버 시 병풍 펼침 (기본 회전 해제 + 마우스 틸트)
        setTransform(
            `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`
        );

        // 광택 효과
        setGlare({ x: x * 100, y: y * 100, opacity: 0.15 });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setTransform('');
        setGlare({ x: 50, y: 50, opacity: 0 });
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    // 등장 애니메이션 — 바깥에서 접혀서 펼쳐지는 병풍
    const cardVariants = {
        hidden: {
            rotateY: index < total / 2 ? -90 : 90,
            opacity: 0,
            scale: 0.8,
        },
        visible: {
            rotateY: baseRotateY,
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 60,
                damping: 15,
                delay: index * 0.12,
            }
        }
    };

    return (
        <motion.div
            ref={cardRef}
            variants={cardVariants}
            className="flex-1 h-full relative group overflow-hidden rounded-sm"
            style={{
                transformOrigin: `${originX} center`,
                transform: isHovered ? transform : `rotateY(${baseRotateY}deg)`,
                boxShadow: isHovered
                    ? '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,115,85,0.15), inset 0 0 30px rgba(0,0,0,0.2)'
                    : isEven
                        ? 'inset -8px 0 20px rgba(0,0,0,0.4), 4px 0 15px rgba(0,0,0,0.3)'
                        : 'inset 8px 0 20px rgba(0,0,0,0.4), -4px 0 15px rgba(0,0,0,0.3)',
                transition: isHovered ? 'box-shadow 0.4s ease' : 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                borderLeft: '1px solid rgba(139,115,85,0.3)',
                borderRight: '1px solid rgba(139,115,85,0.3)',
                zIndex: isHovered ? 10 : 1,
                willChange: 'transform',
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link to={`/floor/${floor.id}`} className="block w-full h-full">
                {/* Background Image — 호버 시 깊이감 있는 확대 */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${floor.bgImage})`,
                        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                >
                    <div
                        className="absolute inset-0 transition-all duration-700"
                        style={{
                            background: isHovered
                                ? 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)'
                                : 'rgba(0,0,0,0.5)',
                        }}
                    />
                </div>

                {/* 3D 광택(글레어) 효과 */}
                <div
                    className="absolute inset-0 z-30 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
                        transition: 'opacity 0.3s ease',
                    }}
                />

                {/* 병풍 접힌 부분 장식선 */}
                <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-amber-900/30 to-transparent z-20" />
                <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-amber-900/30 to-transparent z-20" />

                {/* 상단/하단 금박 장식선 */}
                <div
                    className="absolute top-0 left-0 right-0 h-[1px] z-20"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
                        opacity: isHovered ? 1 : 0.3,
                        transition: 'opacity 0.5s ease',
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 right-0 h-[1px] z-20"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
                        opacity: isHovered ? 1 : 0.3,
                        transition: 'opacity 0.5s ease',
                    }}
                />

                {/* Content — 3D 레이어링 효과 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                    {/* 층 번호 — 먼 배경 레이어 */}
                    <motion.span
                        className="text-8xl md:text-9xl font-serif font-bold block mb-4 transition-all duration-500"
                        style={{
                            color: isHovered ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                            transform: isHovered ? 'translateZ(20px) scale(1.1)' : 'translateZ(0)',
                            textShadow: isHovered ? '0 0 40px rgba(212,175,55,0.2)' : 'none',
                            transition: 'all 0.5s ease',
                        }}
                    >
                        {floor.floor}
                    </motion.span>

                    {/* 제목 — 중간 레이어 */}
                    <motion.h3
                        className="text-base md:text-xl lg:text-2xl font-serif font-bold mb-4 break-words leading-snug px-2 transition-all duration-500"
                        style={{
                            color: isHovered ? '#7ecda0' : '#ffffff',
                            transform: isHovered ? 'translateZ(40px) translateY(-4px)' : 'translateZ(0)',
                            transition: 'all 0.4s ease',
                        }}
                    >
                        <AutoTranslatedText text={getLocalizedText(floor.title, language)} />
                    </motion.h3>

                    {/* 설명 — 전면 레이어 */}
                    <motion.p
                        className="text-sm max-w-[280px] mx-auto break-words"
                        style={{
                            color: 'rgba(255,255,255,0.6)',
                            opacity: isHovered ? 1 : 0,
                            transform: isHovered ? 'translateZ(60px) translateY(0)' : 'translateZ(0) translateY(16px)',
                            transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                        }}
                    >
                        <AutoTranslatedText text={getLocalizedText(floor.description, language)} />
                    </motion.p>

                    {/* 화살표 아이콘 — 가장 앞 레이어 */}
                    <motion.div
                        className="mt-8"
                        style={{
                            opacity: isHovered ? 1 : 0,
                            transform: isHovered ? 'translateZ(80px) rotate(0deg)' : 'translateZ(0) rotate(-45deg)',
                            transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                        }}
                    >
                        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-white/5">
                            <ArrowUpRight className="text-white" size={18} />
                        </div>
                    </motion.div>
                </div>
            </Link>
        </motion.div>
    );
};

export const FloorGuideSection: React.FC = () => {
    const { i18n } = useTranslation();
    const [floors, setFloors] = useState<FloorCategory[]>([]);
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    useEffect(() => {
        let mounted = true;
        const fetchFloors = async () => {
            try {
                const data = await getFloorCategories();
                const sorted = data.sort((a, b) => {
                    const numA = parseInt(a.floor.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.floor.replace(/\D/g, '')) || 0;
                    return numA - numB;
                });
                if (mounted) setFloors(sorted);
            } catch (error) {
                console.error("Error fetching floors", error);
            }
        };
        fetchFloors();
        return () => { mounted = false; };
    }, []);

    const containerVariants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.08 }
        }
    };

    return (
        <motion.section
            ref={sectionRef}
            className="w-full snap-start bg-charcoal overflow-hidden flex"
            style={{ height: '100dvh', padding: '60px 48px', gap: '8px', perspective: '1200px' }}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
        >
            {floors.map((floor, index) => (
                <FloorCard
                    key={floor.floor}
                    floor={floor}
                    index={index}
                    total={floors.length}
                    language={i18n.language}
                />
            ))}
        </motion.section>
    );
};
