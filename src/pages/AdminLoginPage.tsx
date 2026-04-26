import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { useTranslation } from 'react-i18next';
import { Lock, User, ShieldCheck, ArrowRight, Building2, Globe } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { BrandLogo } from '../components/common/BrandLogo';

const AdminLoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAdmin();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (identifier === 'admin' && password === 'admin1234') {
                login(`mock-admin-token-${Date.now()}`, { role: 'admin', name: 'Master Admin' });
                navigate('/admin');
            } else if (identifier === 'agency' && password === 'agency1234') {
                login(`mock-agency-token-${Date.now()}`, { role: 'agency', name: 'Partner Agency', agency_name: 'Partner Agency' });
                navigate('/admin');
            } else {
                setError('Invalid credentials. Please check your ID and password.');
            }
        } catch (err) {
            setError('System error. Access denied.');
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex relative overflow-hidden font-serif selection:bg-dancheong-mugwort/20 selection:text-dancheong-ink">
            {/* Heritage Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-dancheong-mugwort/20" />
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Globe size={400} className="text-dancheong-ink" />
            </div>

            {/* Left Side: Editorial Context */}
            <div className="hidden lg:flex w-1/2 p-20 flex-col justify-between relative z-10">
                <div>
                    <BrandLogo size={140} />
                    <div className="mt-16 max-w-lg">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-7xl font-black text-dancheong-ink tracking-tighter leading-[0.85] mb-8"
                        >
                            <AutoTranslatedText text="ADMINISTRATIVE PORTAL" />
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-dancheong-ink/40 font-light italic leading-relaxed"
                        >
                            <AutoTranslatedText text="본 시스템은 몽땅쏙 플랫폼의 아카이브 및 큐레이션을 관리하기 위한 통합 관리자 환경입니다. 인가된 사용자만 접근이 가능합니다." />
                        </motion.p>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-dancheong-ink/20">Security Protocol</span>
                        <span className="text-xs font-bold text-dancheong-mugwort uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={14} /> Encrypted Access
                        </span>
                    </div>
                    <div className="w-px h-12 bg-dancheong-ink/5" />
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-dancheong-ink/20 leading-loose">
                        © 2024 몽땅쏙 HERITAGE<br />ALL RIGHTS RESERVED.
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white border border-dancheong-ink/20 rounded-[48px] p-10 lg:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.04)] relative">
                        {/* Mobile Logo */}
                        <div className="lg:hidden mb-12 flex justify-center">
                            <BrandLogo size={80} />
                        </div>

                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-dancheong-ink tracking-tight mb-2">
                                <AutoTranslatedText text="관리자 로그인" />
                            </h2>
                            <p className="text-dancheong-ink/40 text-sm italic font-light">
                                <AutoTranslatedText text="자격 증명을 입력하여 아카이브에 접속하십시오." />
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/30 ml-2">Identifier</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-dancheong-ink/40 group-focus-within:text-dancheong-mugwort transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="Enter your ID"
                                        className="w-full bg-white border border-dancheong-ink/20 rounded-2xl py-4 pl-14 pr-6 text-dancheong-ink placeholder:text-dancheong-ink/40 outline-none focus:border-dancheong-mugwort focus:ring-4 focus:ring-dancheong-mugwort/5 transition-all font-sans shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/30 ml-2">Secret Code</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-dancheong-ink/40 group-focus-within:text-dancheong-mugwort transition-colors" size={18} />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white border border-dancheong-ink/20 rounded-2xl py-4 pl-14 pr-6 text-dancheong-ink placeholder:text-dancheong-ink/40 outline-none focus:border-dancheong-mugwort focus:ring-4 focus:ring-dancheong-mugwort/5 transition-all font-sans shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button 
                                type="submit"
                                className="w-full bg-dancheong-ink text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.4em] hover:bg-dancheong-mugwort transition-all shadow-xl shadow-dancheong-ink/10 active:scale-95 flex items-center justify-center gap-4 mt-8"
                            >
                                <AutoTranslatedText text="Enter Portal" />
                                <ArrowRight size={16} className="opacity-40" />
                            </button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-dancheong-ink/5 flex items-center justify-center gap-6">
                            <button 
                                onClick={() => navigate('/agency/register')}
                                className="text-[10px] font-black text-dancheong-ink/40 uppercase tracking-widest hover:text-dancheong-mugwort transition-colors flex items-center gap-2"
                            >
                                <Building2 size={14} />
                                <AutoTranslatedText text="Partner Registration" />
                            </button>
                            <div className="w-1 h-1 bg-dancheong-ink/10 rounded-full" />
                            <button 
                                onClick={() => navigate('/')}
                                className="text-[10px] font-black text-dancheong-ink/40 uppercase tracking-widest hover:text-dancheong-mugwort transition-colors"
                            >
                                <AutoTranslatedText text="Return Home" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
