import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, User, Calendar, Clock, Moon, Sun, Loader, X, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useImmersiveMode, useNavigationState } from '../context/NavigationActionContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

const VirtualSajuPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { resetUiTimer } = useNavigationState();
    const { translateAsync } = useAutoTranslate('');
    useImmersiveMode(true);

    const [formData, setFormData] = useState({
        name: '',
        gender: 'M',
        birthYear: '1990',
        birthMonth: '1',
        birthDay: '1',
        lunarSolar: 'solar',
        birthTime: '모름'
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const apiUrl = window.location.port === '5173'
                ? 'http://localhost:3000/api/saju'
                : '/api/saju';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setResult(data.data);
            } else {
                throw new Error(data.error || '오류가 발생했습니다.');
            }
        } catch (error: any) {
            console.error('Saju fetch error:', error);
            const errorMsg = await translateAsync(`사주 결과를 불러오는 중 문제가 발생했습니다:\n${error.message}`);
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render simple markdown without extra dependencies
    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            if (line.startsWith('###')) {
                return <h3 key={idx} className="text-xl font-bold mt-6 mb-3 text-[#FFD700]"><AutoTranslatedText text={line.replace(/###/g, '').trim()} /></h3>;
            }
            if (line.startsWith('##')) {
                return <h2 key={idx} className="text-2xl font-black mt-8 mb-4 tracking-tight text-[#FFD700] border-b border-white/10 pb-2"><AutoTranslatedText text={line.replace(/##/g, '').trim()} /></h2>;
            }
            if (line.startsWith('#')) {
                return <h1 key={idx} className="text-3xl font-black mt-10 mb-4 tracking-tighter text-white"><AutoTranslatedText text={line.replace(/#/g, '').trim()} /></h1>;
            }
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return <li key={idx} className="ml-4 mb-2 text-white/80 leading-relaxed"><AutoTranslatedText text={line.replace(/^[-*]\s/, '')} /></li>;
            }
            
            const boldRegex = /\*\*(.*?)\*\*/g;
            const parts = line.split(boldRegex);
            const lineContent = parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold"><AutoTranslatedText text={part} /></strong> : <AutoTranslatedText key={i} text={part} />);

            return line.trim() ? <p key={idx} className="mb-4 text-white/80 leading-relaxed">{lineContent}</p> : <br key={idx} />;
        });
    };

    return (
        <ErrorBoundary>
            <div 
                className="relative w-full h-screen bg-[#050505] overflow-hidden text-white font-sans"
                onMouseMove={() => resetUiTimer()}
                onMouseEnter={() => resetUiTimer()}
            >
                {/* Visual Background Pattern */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e]/50 via-[#050505] to-[#050505] mix-blend-screen" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9C27B0]/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#FFD700]/10 rounded-full blur-[100px] mix-blend-screen" />
                </div>

                {/* Header (Top UI) */}
                <header className="absolute top-0 inset-x-0 z-20 p-8 flex justify-between items-start pointer-events-auto">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(-1)}>
                        <div className="p-3 bg-[#111] border border-white/10 rounded-full group-hover:bg-[#FFD700]/20 transition-all">
                            <LogOut size={20} className="rotate-180 group-hover:text-[#FFD700]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <AutoTranslatedText text="명리학 사주상담소" />
                                <Sparkles size={20} className="text-[#FFD700]" />
                            </h1>
                            <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 text-[#FFD700]">
                                <AutoTranslatedText text="Four Pillars Destiney" />
                            </p>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="absolute inset-0 z-10 flex md:items-center justify-center pt-24 pb-32 px-6 overflow-y-auto pointer-events-auto custom-scrollbar">
                    <div className="w-full max-w-[1200px] mx-auto h-fit md:min-h-full flex flex-col md:flex-row items-stretch gap-8 relative py-8">
                        
                        {/* LEFT: Input Form */}
                        <motion.div 
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex-shrink-0 w-full md:w-[400px] bg-[#0a0a0a] border border-white/10 p-8 flex flex-col gap-8 rounded-[2rem] shadow-2xl h-fit relative md:sticky md:top-0"
                        >
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl font-bold tracking-tight text-white"><AutoTranslatedText text="나의 기운 알아보기" /></h2>
                                <p className="text-sm text-white/50"><AutoTranslatedText text="소중한 정보를 바탕으로 당신의 타고난 흐름과 잠재력을 해석합니다." /></p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                {/* Name */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest"><AutoTranslatedText text="이름 (Name)" /></label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#FFD700]/50 transition-colors placeholder:text-white/20"
                                            placeholder={t("Enter name")}
                                        />
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest"><AutoTranslatedText text="성별 (Gender)" /></label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 cursor-pointer">
                                            <input type="radio" name="gender" value="M" checked={formData.gender === 'M'} onChange={handleChange} className="hidden" />
                                            <div className={`py-3 text-center rounded-xl border transition-all ${formData.gender === 'M' ? 'border-[#FFD700] bg-[#FFD700]/10 text-white font-bold' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'}`}>
                                                <AutoTranslatedText text="남성" />
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <input type="radio" name="gender" value="F" checked={formData.gender === 'F'} onChange={handleChange} className="hidden" />
                                            <div className={`py-3 text-center rounded-xl border transition-all ${formData.gender === 'F' ? 'border-[#FFD700] bg-[#FFD700]/10 text-white font-bold' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'}`}>
                                                <AutoTranslatedText text="여성" />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Lunar/Solar */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest"><AutoTranslatedText text="음력/양력" /></label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 cursor-pointer">
                                            <input type="radio" name="lunarSolar" value="solar" checked={formData.lunarSolar === 'solar'} onChange={handleChange} className="hidden" />
                                            <div className={`flex items-center justify-center gap-2 py-3 text-center rounded-xl border transition-all ${formData.lunarSolar === 'solar' ? 'border-orange-500 bg-orange-500/10 text-white font-bold' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'}`}>
                                                <Sun size={16} className={formData.lunarSolar === 'solar' ? 'text-orange-500' : ''} />
                                                <AutoTranslatedText text="양력" />
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <input type="radio" name="lunarSolar" value="lunar" checked={formData.lunarSolar === 'lunar'} onChange={handleChange} className="hidden" />
                                            <div className={`flex items-center justify-center gap-2 py-3 text-center rounded-xl border transition-all ${formData.lunarSolar === 'lunar' ? 'border-blue-400 bg-blue-400/10 text-white font-bold' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'}`}>
                                                <Moon size={16} className={formData.lunarSolar === 'lunar' ? 'text-blue-400' : ''} />
                                                <AutoTranslatedText text="음력" />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Birth Date */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest"><AutoTranslatedText text="생년월일 (Date of Birth)" /></label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input 
                                                type="number" 
                                                name="birthYear"
                                                value={formData.birthYear}
                                                onChange={handleChange}
                                                min="1900" max="2026"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-2 focus:outline-none focus:border-[#FFD700]/50 placeholder:text-white/20 text-center"
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <select 
                                                name="birthMonth"
                                                value={formData.birthMonth}
                                                onChange={handleChange}
                                                className="w-full h-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#FFD700]/50 text-center appearance-none"
                                            >
                                                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                                    <option key={m} value={m} className="bg-gray-900 text-white">{m}월</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="relative flex-1">
                                            <select 
                                                name="birthDay"
                                                value={formData.birthDay}
                                                onChange={handleChange}
                                                className="w-full h-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#FFD700]/50 text-center appearance-none"
                                            >
                                                {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                                                    <option key={d} value={d} className="bg-gray-900 text-white">{d}일</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Birth Time */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest"><AutoTranslatedText text="태어난 시간 (선택)" /></label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                        <select 
                                            name="birthTime"
                                            value={formData.birthTime}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#FFD700]/50 appearance-none"
                                        >
                                            <option value="모름" className="bg-gray-900 text-white">모름</option>
                                            <option value="자시 (23:30 ~ 01:30)" className="bg-gray-900 text-white">자시 (23:30 ~ 01:30)</option>
                                            <option value="축시 (01:30 ~ 03:30)" className="bg-gray-900 text-white">축시 (01:30 ~ 03:30)</option>
                                            <option value="인시 (03:30 ~ 05:30)" className="bg-gray-900 text-white">인시 (03:30 ~ 05:30)</option>
                                            <option value="묘시 (05:30 ~ 07:30)" className="bg-gray-900 text-white">묘시 (05:30 ~ 07:30)</option>
                                            <option value="진시 (07:30 ~ 09:30)" className="bg-gray-900 text-white">진시 (07:30 ~ 09:30)</option>
                                            <option value="사시 (09:30 ~ 11:30)" className="bg-gray-900 text-white">사시 (09:30 ~ 11:30)</option>
                                            <option value="오시 (11:30 ~ 13:30)" className="bg-gray-900 text-white">오시 (11:30 ~ 13:30)</option>
                                            <option value="미시 (13:30 ~ 15:30)" className="bg-gray-900 text-white">미시 (13:30 ~ 15:30)</option>
                                            <option value="신시 (15:30 ~ 17:30)" className="bg-gray-900 text-white">신시 (15:30 ~ 17:30)</option>
                                            <option value="유시 (17:30 ~ 19:30)" className="bg-gray-900 text-white">유시 (17:30 ~ 19:30)</option>
                                            <option value="술시 (19:30 ~ 21:30)" className="bg-gray-900 text-white">술시 (19:30 ~ 21:30)</option>
                                            <option value="해시 (21:30 ~ 23:30)" className="bg-gray-900 text-white">해시 (21:30 ~ 23:30)</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="mt-4 w-full py-4 bg-gradient-to-r from-[#9C27B0] to-[#FFD700] p-[1px] rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-shadow group disabled:opacity-50"
                                >
                                    <div className="w-full h-full bg-black/80 px-6 py-3 rounded-2xl flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <Loader size={20} className="animate-spin text-[#FFD700]" />
                                                <span className="font-bold tracking-widest text-[#FFD700]"><AutoTranslatedText text="풀이 중..." /></span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={20} className="text-[#FFD700]" />
                                                <span className="font-bold tracking-widest text-white group-hover:text-[#FFD700] transition-colors"><AutoTranslatedText text="나의 운세 확인하기" /></span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        </motion.div>

                        {/* RIGHT: Result Viewer */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => isMobile && result && setIsModalOpen(true)}
                            className={`flex-1 bg-[#0a0a0a] border border-white/5 p-10 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden ${isMobile && result ? 'cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.98]' : ''}`}
                        >
                            {isMobile && result && (
                                <div className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-[#FFD700] animate-pulse">
                                    <Maximize2 size={18} />
                                </div>
                            )}
                            {!result && !loading && (
                                <div className="text-center opacity-30 flex flex-col items-center gap-4">
                                    <Moon size={48} className="text-[#FFD700] opacity-50" />
                                    <p className="text-lg tracking-widest"><AutoTranslatedText text="당신의 이야기가 펼쳐질 공간입니다." /></p>
                                </div>
                            )}

                            {loading && (
                                <div className="text-center flex flex-col items-center gap-6">
                                    <div className="w-24 h-24 border-4 border-[#9C27B0]/20 border-t-[#FFD700] rounded-full animate-spin" />
                                    <p className="text-[#FFD700] font-black tracking-[0.2em] animate-pulse">
                                        <AutoTranslatedText text="우주의 기운을 읽는 중입니다..." />
                                    </p>
                                </div>
                            )}

                            {result && !loading && (
                                <div className="absolute inset-0 p-10 overflow-y-auto custom-scrollbar text-left w-full max-w-[800px] mx-auto">
                                    <motion.div 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="mb-10 text-center"
                                    >
                                        <div className="inline-block px-4 py-1 border border-[#FFD700] rounded-full text-[#FFD700] text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                                            Analysis Completed
                                        </div>
                                        <h2 className="text-3xl font-black text-white"><span className="text-[#9C27B0]">{formData.name}</span> <AutoTranslatedText text="님을 위한 사주 풀이" /></h2>
                                    </motion.div>
                                    
                                    <div className="prose prose-invert prose-yellow max-w-none">
                                        {renderMarkdown(result)}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Mobile Result Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex-shrink-0 p-6 flex justify-between items-center border-b border-white/10 bg-[#0a0a0a]">
                                <div className="flex items-center gap-3">
                                    <Sparkles size={20} className="text-[#FFD700]" />
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        <span className="text-[#9C27B0]">{formData.name}</span>님 사주 풀이
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="max-w-[600px] mx-auto pb-20">
                                    <div className="prose prose-invert prose-yellow max-w-none">
                                        {renderMarkdown(result || '')}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Close Hint */}
                            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent pointer-events-none">
                                <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.3em]">
                                    Scroll to read all
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
};

export default VirtualSajuPage;
