import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronRight, 
    BookOpen, Heart, Briefcase, Users, HandHeart, 
    LayoutGrid, MessageSquare,
    Video, Rotate3d, ShoppingBag, Ticket, MessageCircle, CalendarClock, Moon, ShoppingCart, Target, Play, MapPin, X, Sparkles
} from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { AnimatePresence } from 'framer-motion';

interface Category {
    id: string;
    label: string;
    desc: string;
    icon: any;
    color: string;
}

interface Meeting {
    id: string;
    title: string;
    location: string;
    category: string;
    image: string;
    participants: number;
    maxParticipants: number;
    avatars: string[];
}

interface Template {
    id: string;
    label: string;
    icon: any;
    color: string;
}

// Mock Data


const CATEGORIES: Category[] = [
    { id: 'meeting-room', label: '스터디', desc: '함께 공부하고 성장하는 공간', icon: BookOpen, color: 'bg-blue-50' },
    { id: 'audio-room', label: '취미·여가', desc: '좋아하는 걸 함께 즐겨요', icon: Heart, color: 'bg-pink-50' },
    { id: 'interview-room', label: '면접·취업', desc: '취업 준비부터 면접까지', icon: Briefcase, color: 'bg-orange-50' },
    { id: 'office', label: '회의·업무', desc: '효율적인 회의와 프로젝트 진행', icon: Users, color: 'bg-indigo-50' },
    { id: 'square', label: '봉사·활동', desc: '의미 있는 활동을 함께 실천해요', icon: HandHeart, color: 'bg-green-50' },
    { id: 'all', label: '전체 카테고리', desc: '더 많은 모임을 둘러보세요', icon: LayoutGrid, color: 'bg-gray-50' }
];

const MEETINGS: Meeting[] = [
    {
        id: 'm1',
        title: '데이터 분석 스터디 📊',
        location: '서울 강남구',
        category: '스터디',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
        participants: 24,
        maxParticipants: 30,
        avatars: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3']
    },
    {
        id: 'm2',
        title: '퇴근 후 서예 모임 🖋️',
        location: '서울 마포구',
        category: '취미·여가',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
        participants: 16,
        maxParticipants: 20,
        avatars: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5']
    },
    {
        id: 'm3',
        title: '모의 면접 스터디',
        location: '서울 서초구',
        category: '면접·취업',
        image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800',
        participants: 18,
        maxParticipants: 25,
        avatars: ['https://i.pravatar.cc/150?u=6', 'https://i.pravatar.cc/150?u=7', 'https://i.pravatar.cc/150?u=8']
    },
    {
        id: 'm4',
        title: '서비스 기획 프로젝트',
        location: '경기 성남시',
        category: '회의·업무',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
        participants: 10,
        maxParticipants: 15,
        avatars: ['https://i.pravatar.cc/150?u=9']
    }
];

const COMMUNITY_POSTS = [
    { id: 'c1', badge: '공지', title: '안전하고 즐거운 모임 문화를 위한 가이드', author: '몽땅쏙 운영팀', time: '2시간 전', comments: 12 },
    { id: 'c2', title: '면접 볼 때 긴장 덜 하는 방법 있나요? ••', author: '취뽀하자', time: '1시간 전', comments: 8 },
    { id: 'c3', title: '주말 등산 같이 가요! ⛰️', author: '산이좋아', time: '3시간 전', comments: 15 }
];

const TEMPLATES: Template[] = [
    { id: 'cinema', label: '감상하기', icon: Video, color: '#FF3B3B' },
    { id: 'museum', label: '전시보기', icon: Rotate3d, color: '#FFD600' },
    { id: 'store', label: '구매하기', icon: ShoppingBag, color: '#00FFC2' },
    { id: 'ticket', label: '예매하기', icon: Ticket, color: '#FF2E92' },
    { id: 'inquiry', label: '문의하기', icon: MessageCircle, color: '#4facfe' },
    { id: 'reservation', label: '예약하기', icon: CalendarClock, color: '#00f2fe' },
    { id: 'meeting', label: '회의참여', icon: Users, color: '#9B59B6' },
    { id: 'sindang', label: '신점보기', icon: Sparkles, color: '#FFD700' },
    { id: 'saju', label: '사주보기', icon: Moon, color: '#9C27B0' },
    { id: 'groupbuy', label: '공동구매', icon: ShoppingCart, color: '#FF6B6B' },
    { id: 'funding', label: '크라우드펀딩', icon: Target, color: '#10B981' },
    { id: 'audition', label: '오디션참가', icon: Play, color: '#FFD700' },
    { id: 'interview', label: '면접참여', icon: Briefcase, color: '#F1C40F' },
    { id: 'square', label: '광장입장', icon: MapPin, color: '#00FFC2' },
    { id: 'office', label: '사무실입장', icon: LayoutGrid, color: '#A29BFE' }
];


export const MongtangLanding: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('popular');
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
    const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
    const [creationState, setCreationState] = useState<{ step: 'none' | 'category' | 'title' | 'template', categoryId?: string, title?: string } | null>(null);

    const handleCategoryClick = (id: string) => {
        if (id === 'all') {
            navigate('/floor-guide');
            return;
        }

        const templateMap: { [key: string]: string } = {
            'meeting-room': 'meeting',
            'audio-room': 'cinema',
            'interview-room': 'interview',
            'office': 'office',
            'square': 'square'
        };

        const template = templateMap[id];
        if (template) {
            // Navigate to a featured category item with this template
            navigate(`/category/${id}`);
        } else {
            navigate(`/category/${id}`);
        }
    };

    const handleMeetingClick = (meeting: any) => {
        // Show template selector modal
        setSelectedMeeting(meeting);
    };

    const applyTemplate = (templateId: string) => {
        if (!selectedMeeting) return;
        navigate(`/detail/${selectedMeeting.id}/${templateId}`);
        setSelectedMeeting(null);
    };

    return (
        <div className="bg-[#F8F6F2] min-h-screen text-[#1A1A1A] pb-12">
            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 space-y-6">
                {/* Hero Section */}
                <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[500px]">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-start space-y-4"
                    >
                        <div className="space-y-2">
                             <h1 className="text-2xl lg:text-3xl leading-relaxed tracking-tight flex flex-col gap-4 mt-0">
                                <span className="font-gungsuh font-medium text-black whitespace-nowrap"><AutoTranslatedText text="모든 모임이 몽땅 다 들어있는 곳," /></span>
                                <img 
                                    src="/logo.png" 
                                    alt="몽땅쏙" 
                                    className="h-12 lg:h-16 w-auto object-contain block -ml-[6px]"
                                />
                            </h1>
                            <div className="text-xl text-black/70 font-sans font-medium max-w-md leading-relaxed space-y-2 mt-6">
                                <p><AutoTranslatedText text="스터디부터 면접, 회의까지" /></p>
                                <p><AutoTranslatedText text="원하는 모임을 찾고, 함께 성장하세요." /></p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button 
                                onClick={() => setIsDiscoveryOpen(true)}
                                className="px-10 py-5 bg-[#1A3C5E] text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20"
                            >
                                <AutoTranslatedText text="모임 찾기" />
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-4 border-[#F8F6F2] overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=hero${i}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <span className="opacity-40 font-bold"><AutoTranslatedText text="지금 이 순간에도" /></span><br />
                                <span className="font-black text-[#1A3C5E]"><AutoTranslatedText text="2,345개" /></span>
                                <span className="opacity-60 font-bold"><AutoTranslatedText text="의 모임이 활발히 진행 중이에요!" /></span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-[4/3] rounded-[48px] overflow-hidden shadow-2xl max-w-lg lg:ml-auto"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200" 
                            alt="Hero" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>

                </section>

                {/* Category Section */}
                <section className="pt-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {CATEGORIES.map((cat, i) => (
                        <motion.div 
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`group cursor-pointer rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-xl ${cat.color} border border-transparent hover:border-black/5`}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <cat.icon size={28} className="text-[#1A3C5E]" />
                            </div>
                            <h3 className="text-lg font-gungsuh mb-2"><AutoTranslatedText text={cat.label} /></h3>
                            <p className="text-xs opacity-40 leading-relaxed font-bold"><AutoTranslatedText text={cat.desc} /></p>
                        </motion.div>
                    ))}
                </section>

                {/* Popular Meetings Section */}
                <section className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-gungsuh tracking-tight"><AutoTranslatedText text="지금 인기 있는 모임" /></h2>
                            <span className="text-2xl opacity-20">🪷</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-black/5 shadow-sm">
                            <button 
                                onClick={() => setFilter('popular')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'popular' ? 'bg-[#1A3C5E] text-white shadow-lg' : 'hover:bg-gray-50 opacity-40'}`}
                            >
                                <AutoTranslatedText text="인기순" />
                            </button>
                            <button 
                                onClick={() => setFilter('new')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'new' ? 'bg-[#1A3C5E] text-white shadow-lg' : 'hover:bg-gray-50 opacity-40'}`}
                            >
                                <AutoTranslatedText text="최신순" />
                            </button>
                            <div className="h-4 w-[1px] bg-black/10 mx-2" />
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold opacity-40 hover:opacity-100 transition-all">
                                <AutoTranslatedText text="전체 지역" />
                                <ChevronRight size={16} className="rotate-90" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {MEETINGS.map((meeting, i) => (
                            <motion.div 
                                key={meeting.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => handleMeetingClick(meeting)}
                                className="group cursor-pointer bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 border border-black/5"
                            >
                                <div className="aspect-[4/3] relative overflow-hidden">
                                    <img 
                                        src={meeting.image} 
                                        alt={meeting.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                                            <AutoTranslatedText text={meeting.category} />
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-gungsuh tracking-tight group-hover:text-[#1A3C5E] transition-colors">
                                            <AutoTranslatedText text={meeting.title} />
                                        </h3>
                                        <p className="text-sm opacity-40 font-bold"><AutoTranslatedText text={meeting.location} /></p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-black/5">
                                        <div className="flex -space-x-2">
                                            {meeting.avatars.map((av, idx) => (
                                                <div key={idx} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                                                    <img src={av} alt="participant" />
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold opacity-40">
                                                +{meeting.participants - meeting.avatars.length}
                                            </div>
                                        </div>
                                        <div className="text-xs font-black">
                                            <span className="text-[#1A3C5E]">{meeting.participants}</span>
                                            <span className="opacity-20 mx-1">/</span>
                                            <span className="opacity-40">{meeting.maxParticipants}명</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-8">
                        <button className="px-10 py-5 bg-white border border-black/10 rounded-2xl font-black text-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-3">
                            <AutoTranslatedText text="더 많은 모임 보기" />
                            <ChevronRight size={18} className="opacity-40" />
                        </button>
                    </div>
                </section>

                {/* Community Section */}
                <section className="space-y-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-gungsuh tracking-tight"><AutoTranslatedText text="커뮤니티 최신글" /></h2>
                            <span className="text-2xl opacity-20">🪷</span>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-black opacity-40 hover:opacity-100 transition-all group">
                            <AutoTranslatedText text="더보기" />
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {COMMUNITY_POSTS.map((post, i) => (
                            <motion.div 
                                key={post.id}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group cursor-pointer bg-white p-8 rounded-[32px] border border-black/5 hover:shadow-xl transition-all"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        {post.badge && (
                                            <span className="px-2.5 py-1 rounded-md bg-[#1A3C5E]/10 text-[#1A3C5E] text-[10px] font-black">
                                                <AutoTranslatedText text={post.badge} />
                                            </span>
                                        )}
                                        <h3 className="text-lg font-gungsuh tracking-tight line-clamp-1 group-hover:text-[#1A3C5E] transition-colors">
                                            <AutoTranslatedText text={post.title} />
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs opacity-40 font-bold">
                                            <AutoTranslatedText text={post.author} />
                                            <span className="opacity-20">•</span>
                                            <AutoTranslatedText text={post.time} />
                                        </div>
                                        <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <MessageSquare size={14} />
                                            <span className="text-xs font-black">{post.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            {/* User Discovery Modal */}
            {isDiscoveryOpen && (
                <div 
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsDiscoveryOpen(false)}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white w-full max-w-4xl rounded-[48px] overflow-hidden shadow-2xl p-12 flex flex-col max-h-[85vh]"
                    >
                        <button 
                            onClick={() => setIsDiscoveryOpen(false)}
                            className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors z-50"
                        >
                            <X size={24} className="opacity-40 hover:opacity-100 transition-opacity" />
                        </button>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="p-6 rounded-full bg-gray-50 text-gray-300">
                                <LayoutGrid size={48} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-black/80">준비 중인 기능입니다</h3>
                                <p className="text-sm text-black/40">곧 카테고리별 모임 찾기 기능이 업데이트될 예정입니다.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Template Selection Modal */}
            <AnimatePresence>
                {selectedMeeting && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMeeting(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl p-12"
                        >
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMeeting(null);
                                }}
                                className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors z-50"
                            >
                                <X size={24} className="opacity-40 hover:opacity-100 transition-opacity" />
                            </button>

                            <div className="space-y-10">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-[#1A3C5E] uppercase tracking-widest opacity-40">
                                        <AutoTranslatedText text="템플릿 선택 사용" />
                                    </h3>
                                    <h2 className="text-3xl font-black tracking-tight">
                                        <AutoTranslatedText text={selectedMeeting.title} />
                                    </h2>
                                    <p className="text-sm opacity-60 font-medium">
                                        <AutoTranslatedText text="원하는 테마의 템플릿을 선택하여 제품을 체험해보세요." />
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                    {TEMPLATES.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            onClick={() => applyTemplate(tpl.id)}
                                            className="group flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] border border-black/5 hover:border-[#1A3C5E] hover:bg-gray-50 transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <tpl.icon size={24} style={{ color: tpl.color }} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 group-hover:text-[#1A3C5E] transition-all">
                                                <AutoTranslatedText text={tpl.label} />
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-black/5 flex justify-end">
                                    <button 
                                        onClick={() => navigate(`/detail/${selectedMeeting.id}`)}
                                        className="px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                                    >
                                        <AutoTranslatedText text="상세 정보 보기" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}


                {/* Creation Wizard Modal (Admin/Agency Only) */}
                {creationState && creationState.step !== 'none' && (
                    <div 
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
                        onClick={() => setCreationState(null)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl p-12"
                        >
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCreationState(null);
                                }}
                                className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors z-50"
                            >
                                <X size={24} className="opacity-40 hover:opacity-100 transition-opacity" />
                            </button>

                            <div className="space-y-10">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-[#1A3C5E] uppercase tracking-widest opacity-40">
                                        <AutoTranslatedText text={
                                            creationState.step === 'category' ? "STEP 1: 공간 선택" : 
                                            creationState.step === 'title' ? "STEP 2: 타이틀 등록" : 
                                            "STEP 3: 템플릿 선택"
                                        } />
                                    </h3>
                                    <h2 className="text-3xl font-black tracking-tight">
                                        <AutoTranslatedText text={
                                            creationState.step === 'category' ? "어떤 공간에서 모임을 시작할까요?" : 
                                            creationState.step === 'title' ? "공간의 이름을 정해주세요" :
                                            "어떤 방식으로 소통하고 싶으신가요?"
                                        } />
                                    </h2>
                                    <p className="text-sm opacity-60 font-medium">
                                        <AutoTranslatedText text="7F 커뮤니케이션 라운지의 최적화된 가상 공간을 제공합니다." />
                                    </p>
                                </div>

                                {creationState.step === 'category' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {CATEGORIES.filter(c => c.id !== 'all').map((cat: Category) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCreationState({ ...creationState, step: 'title', categoryId: cat.id })}
                                                className="group flex items-center gap-4 p-6 rounded-[2rem] border border-black/5 hover:border-[#1A3C5E] hover:bg-gray-50 transition-all text-left"
                                            >
                                                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <cat.icon size={28} className="text-[#1A3C5E]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold text-[#1A3C5E]">
                                                        <AutoTranslatedText text={cat.label} />
                                                    </span>
                                                    <span className="text-xs opacity-40 font-medium">
                                                        <AutoTranslatedText text={cat.desc} />
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : creationState.step === 'title' ? (
                                    <div className="space-y-8 py-4">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black uppercase tracking-widest opacity-40">
                                                <AutoTranslatedText text="공간 타이틀" />
                                            </label>
                                            <input 
                                                type="text" 
                                                autoFocus
                                                value={creationState.title || ''}
                                                onChange={(e) => setCreationState({ ...creationState, title: e.target.value })}
                                                placeholder="예: 우리 팀 아지트, OO 브랜드 전시관"
                                                className="w-full text-2xl font-bold bg-gray-50 border-none rounded-3xl p-8 focus:ring-2 focus:ring-[#1A3C5E] transition-all placeholder:opacity-20"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center pt-6 border-t border-black/5">
                                            <button 
                                                onClick={() => setCreationState({ ...creationState, step: 'category' })}
                                                className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                                            >
                                                <AutoTranslatedText text="이전 단계로" />
                                            </button>
                                            <button 
                                                disabled={!creationState.title?.trim()}
                                                onClick={() => setCreationState({ ...creationState, step: 'template' })}
                                                className="px-8 py-4 bg-[#1A3C5E] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100"
                                            >
                                                <AutoTranslatedText text="다음 단계로" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                            {TEMPLATES.map((tpl: Template) => (
                                                <button
                                                    key={tpl.id}
                                                    onClick={() => {
                                                        navigate(`/detail/${creationState.categoryId}/${tpl.id}`);
                                                        setCreationState(null);
                                                    }}
                                                    className="group flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] border border-black/5 hover:border-[#1A3C5E] hover:bg-gray-50 transition-all"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <tpl.icon size={24} style={{ color: tpl.color }} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 group-hover:text-[#1A3C5E] transition-all">
                                                        <AutoTranslatedText text={tpl.label} />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center pt-6 border-t border-black/5">
                                            <button 
                                                onClick={() => setCreationState({ ...creationState, step: 'title' })}
                                                className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                                            >
                                                <AutoTranslatedText text="이전 단계로" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
