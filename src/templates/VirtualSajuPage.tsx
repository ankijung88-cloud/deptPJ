import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, User, Calendar, Clock, Moon, Sun, Loader } from 'lucide-react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useImmersiveMode, useNavigationState } from '../context/NavigationActionContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

const VirtualSajuPage: React.FC = () => {
    const navigate = useNavigate();
    const { resetUiTimer } = useNavigationState();
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
            alert(`사주 결과를 불러오는 중 문제가 발생했습니다:\n${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render simple markdown without extra dependencies
    const renderMarkdown = (text: string) => {
        // Split text by lines
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            if (line.startsWith('###')) {
                return <h3 key={idx} className="text-xl font-bold mt-6 mb-3 text-[#FFD700]">{line.replace(/###/g, '').trim()}</h3>;
            }
            if (line.startsWith('##')) {
                return <h2 key={idx} className="text-2xl font-black mt-8 mb-4 tracking-tight text-[#FFD700] border-b border-white/10 pb-2">{line.replace(/##/g, '').trim()}</h2>;
            }
            if (line.startsWith('#')) {
                return <h1 key={idx} className="text-3xl font-black mt-10 mb-4 tracking-tighter text-white">{line.replace(/#/g, '').trim()}</h1>;
            }
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return <li key={idx} className="ml-4 mb-2 text-white/80 leading-relaxed">{line.replace(/^[-*]\s/, '')}</li>;
            }
            // Add bold text replacement
            const boldRegex = /\*\*(.*?)\*\*/g;
            const parts = line.split(boldRegex);
            const lineContent = parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part);

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
                        <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full group-hover:bg-[#FFD700]/20 transition-all">
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
                            className="flex-shrink-0 w-full md:w-[400px] bg-black/60 backdrop-blur-3xl border border-white/10 p-8 flex flex-col gap-8 rounded-[2rem] shadow-2xl h-fit relative md:sticky md:top-0"
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
                                            placeholder="이름 입력"
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
                                    <div className="w-full h-full bg-black/50 backdrop-blur-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-3">
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
                            className="flex-1 bg-black/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden"
                        >
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
                                        <h2 className="text-3xl font-black text-white"><span className="text-[#9C27B0]">{formData.name}</span>님을 위한 사주 풀이</h2>
                                    </motion.div>
                                    
                                    <div className="prose prose-invert prose-yellow max-w-none">
                                        {renderMarkdown(result)}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

            </div>
        </ErrorBoundary>
    );
};

export default VirtualSajuPage;
