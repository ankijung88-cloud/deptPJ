import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Building, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { registerAgency } from '../api/auth';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

const AgencyRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        agencyName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await registerAgency(formData);
            setSuccess(true);
            setTimeout(() => navigate('/admin/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full backdrop-blur-2xl bg-white/5 border border-[#00FFC2]/30 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(0,255,194,0.1)]"
                >
                    <div className="w-20 h-20 bg-[#00FFC2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-[#00FFC2] w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">가입 신청 완료</h2>
                    <p className="text-dancheong-white/60 mb-8 leading-relaxed">
                        에이전시 등록 신청이 정상적으로 완료되었습니다.<br />
                        관리자의 승인 후 로그인이 가능합니다.
                    </p>
                    <div className="text-sm text-[#00FFC2] animate-pulse">
                        3초 후 로그인 페이지로 이동합니다...
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden flex items-center justify-center p-6 font-sans">
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00FFC2]/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00FFC2]/5 rounded-full blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/admin/login')}
                    className="flex items-center gap-2 text-dancheong-white/50 hover:text-[#00FFC2] transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">로그인으로 돌아가기</span>
                </button>

                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                    <div className="mb-10">
                        <div className="w-16 h-16 bg-[#00FFC2]/10 rounded-2xl flex items-center justify-center mb-6">
                            <UserPlus className="text-[#00FFC2] w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">에이전시 파트너 등록</h1>
                        <p className="text-dancheong-white/50 text-sm">
                            디파트먼트의 파트너가 되어 제품을 등록하고 관리하세요.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm overflow-hidden"
                            >
                                <AutoTranslatedText text={error} />
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">에이전시 명</label>
                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-dancheong-white/30 group-focus-within:text-[#00FFC2] transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Agency Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all"
                                    value={formData.agencyName}
                                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">아이디 (이메일)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dancheong-white/30 group-focus-within:text-[#00FFC2] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email Address"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">비밀번호</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dancheong-white/30 group-focus-within:text-[#00FFC2] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="Password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00FFC2] hover:bg-[#00FFC2]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-[0_10px_20px_rgba(0,255,194,0.2)] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>가입 신청하기</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-dancheong-white/40 text-sm">
                            이미 계정이 있으신가요?{' '}
                            <Link to="/admin/login" className="text-[#00FFC2] hover:underline font-medium ml-1">
                                로그인
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center opacity-30">
                    <img src="/K로고.png" alt="Logo" className="h-8 mx-auto grayscale brightness-200" />
                </div>
            </motion.div>
        </div>
    );
};

export default AgencyRegisterPage;
