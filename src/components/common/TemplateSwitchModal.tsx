import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Rotate3d, ShoppingBag, Ticket, MessageCircle, CalendarClock, Users, Moon, ShoppingCart, Target, Briefcase, LayoutGrid, Layout } from 'lucide-react';

import { AutoTranslatedText } from './AutoTranslatedText';

interface TemplateSwitchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (templateId: string) => void;
    currentTemplateId?: string | null;
    theme: {
        bgColor: string;
        textPrimary: string;
        textSecondary: string;
        highlightColor: string;
        color3: string;
    };
}

export const TEMPLATES = [
    { id: 'standard', label: '기본 소개', icon: Layout, color: '#666666', description: '매거진 스타일의 기본 제품 소개 페이지' },
    { id: 'cinema', label: '감상하기', icon: Video, color: '#FF3B3B', description: '몰입형 비디오 및 미디어 감상 공간' },
    { id: 'museum', label: '전시보기', icon: Rotate3d, color: '#FFD600', description: '3D 오브젝트 및 작품 전시를 위한 가상 뮤지엄' },
    { id: 'store', label: '구매하기', icon: ShoppingBag, color: '#00FFC2', description: '편리한 쇼핑 및 결제 기능을 갖춘 쇼핑몰' },
    { id: 'ticket', label: '예매하기', icon: Ticket, color: '#FF2E92', description: '공연 및 이벤트 티켓 예매 전용 템플릿' },
    { id: 'inquiry', label: '문의하기', icon: MessageCircle, color: '#4facfe', description: '1:1 상담 및 상세 문의를 위한 고객 접점' },
    { id: 'reservation', label: '예약하기', icon: CalendarClock, color: '#00f2fe', description: '실시간 일정 확인 및 서비스 예약 시스템' },
    { id: 'meeting', label: '회의참여', icon: Users, color: '#9B59B6', description: '화상 회의 및 실시간 협업을 위한 가상 회의실' },
    { id: 'saju', label: '사주보기', icon: Moon, color: '#9C27B0', description: '운세 및 사주 풀이를 위한 신비로운 분위기의 공간' },
    { id: 'groupbuy', label: '공동구매', icon: ShoppingCart, color: '#FF6B6B', description: '함께 사면 더 저렴한 공동구매 전용 페이지' },
    { id: 'funding', label: '크라우드펀딩', icon: Target, color: '#10B981', description: '새로운 프로젝트의 시작을 돕는 펀딩 플랫폼' },
    { id: 'interview', label: '면접참여', icon: Briefcase, color: '#F1C40F', description: '가상 면접 및 채용 상담을 위한 오피스 공간' },
    { id: 'office', label: '사무실입장', icon: LayoutGrid, color: '#A29BFE', description: '우리 팀만의 독립된 가상 작업 공간' }
];

export const TemplateSwitchModal: React.FC<TemplateSwitchModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentTemplateId,
    theme
}) => {

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl border"
                        style={{ 
                            backgroundColor: theme.bgColor, 
                            borderColor: theme.color3,
                            color: theme.textPrimary 
                        }}
                    >
                        {/* Header */}
                        <div className="p-8 md:p-12 border-b flex justify-between items-start" style={{ borderColor: `${theme.textPrimary}11` }}>
                            <div>
                                <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tighter mb-4">
                                    <AutoTranslatedText text="Choose Layout Template" />
                                </h2>
                                <p className="text-lg opacity-60 font-light">
                                    <AutoTranslatedText text="Select a template that best fits your product's experience." />
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-4 rounded-full hover:bg-black/5 transition-colors"
                            >
                                <X size={32} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-12 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                {TEMPLATES.map((tpl) => {
                                    const isActive = (currentTemplateId || 'standard') === tpl.id;
                                    
                                    return (
                                        <button
                                            key={tpl.id}
                                            onClick={() => onSelect(tpl.id)}
                                            className={`flex flex-col items-start p-8 rounded-3xl border-2 text-left transition-all group relative overflow-hidden ${
                                                isActive 
                                                    ? 'shadow-xl scale-[1.02]' 
                                                    : 'hover:border-opacity-50 hover:bg-black/5'
                                            }`}
                                            style={{ 
                                                borderColor: isActive ? tpl.color : `${theme.textPrimary}11`,
                                                backgroundColor: isActive ? `${tpl.color}11` : 'transparent'
                                            }}
                                        >
                                            {isActive && (
                                                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                                                    <AutoTranslatedText text="Active" />
                                                </div>
                                            )}
                                            
                                            <div className="mb-6 p-4 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                                                <tpl.icon size={32} style={{ color: tpl.color }} />
                                            </div>
                                            
                                            <h3 className="text-xl font-bold mb-2">
                                                <AutoTranslatedText text={tpl.label} />
                                            </h3>
                                            
                                            <p className="text-sm opacity-60 leading-relaxed font-light">
                                                <AutoTranslatedText text={tpl.description} />
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="p-8 bg-black/5 text-center text-xs opacity-40 font-mono tracking-widest uppercase">
                            Premium Design System • v2.0
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
