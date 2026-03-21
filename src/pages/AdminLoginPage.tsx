import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight } from 'lucide-react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAdmin } from '../hooks/useAdmin';

export const AdminLoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
    const [recoveryType, setRecoveryType] = useState<'ID' | 'PASSWORD'>('ID');
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAdmin();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login for:', username);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            console.log('Login response status:', response.status);

            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error(`Server returned non-JSON response (${response.status})`);
            }

            if (data.success) {
                console.log('Login successful');
                // Use hook's login for consistency
                login(data.token, data.user);
                navigate('/admin');
            } else {
                console.warn('Login failed:', data.message);
                setError(data.message || 'Login failed: Invalid credentials');
            }
        } catch (err: any) {
            console.error('Login error detail:', err);
            setError(`Error: ${err.message || 'Connection failed. Please check your network.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0D17] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#1A2420]/80 backdrop-blur-xl border border-[#00FFC2]/20 p-8 rounded-3xl"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#00FFC2]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#00FFC2]/30">
                        <Lock className="text-[#00FFC2]" size={32} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">
                        <AutoTranslatedText text="Admin Access" />
                    </h1>
                    <p className="text-white/40 text-sm">
                        <AutoTranslatedText text="Please enter your credentials to manage products." />
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            <AutoTranslatedText text="Username" />
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FFC2]/50 transition-colors"
                                placeholder="Admin ID"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                            <AutoTranslatedText text="Password" />
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FFC2]/50 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <button type="button" onClick={() => { setRecoveryType('ID'); setIsRecoveryOpen(true); }} className="hover:text-[#00FFC2] transition-colors">아이디 찾기</button>
                        <span className="text-white/10">|</span>
                        <button type="button" onClick={() => { setRecoveryType('PASSWORD'); setIsRecoveryOpen(true); }} className="hover:text-[#00FFC2] transition-colors">비밀번호 찾기</button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20"
                        >
                            <AutoTranslatedText text={error} />
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#00FFC2] text-[#0A0D17] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00FFC2]/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-[#0A0D17]/30 border-t-[#0A0D17] rounded-full animate-spin" />
                        ) : (
                            <>
                                <AutoTranslatedText text="Login" />
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-white/5">
                    <p className="text-white/40 text-sm">
                        에이전시 파트너이신가요?{' '}
                        <Link to="/register" className="text-[#00FFC2] hover:underline font-medium ml-1">
                            파트너 등록 신청하기
                        </Link>
                    </p>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/30 hover:text-white/60 text-sm transition-colors"
                    >
                        <AutoTranslatedText text="Back to Home" />
                    </button>
                </div>
            </motion.div>

            {isRecoveryOpen && (
                <FindAccountModal 
                    type={recoveryType} 
                    onClose={() => setIsRecoveryOpen(false)} 
                />
            )}
        </div>
    );
};

const FindAccountModal = ({ type, onClose }: { type: 'ID' | 'PASSWORD', onClose: () => void }) => {
    const [subType, setSubType] = useState<'ID' | 'PASSWORD'>(type);
    const [formData, setFormData] = useState({ agencyName: '', phoneMobile: '', username: '', newPassword: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleFindID = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/find-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agencyName: formData.agencyName, phoneMobile: formData.phoneMobile })
            });
            const data = await res.json();
            if (data.success) setResult(data.username);
            else setError(data.message);
        } catch { setError('Connection failed'); }
        finally { setLoading(false); }
    };

    const handleResetPW = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) setResult('success');
            else setError(data.message);
        } catch { setError('Connection failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-[#1A2420] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex gap-4 mb-8">
                    <button onClick={() => { setSubType('ID'); setResult(null); setError(''); }} className={`flex-1 pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${subType === 'ID' ? 'text-[#00FFC2] border-b-2 border-[#00FFC2]' : 'text-white/20'}`}>아이디 찾기</button>
                    <button onClick={() => { setSubType('PASSWORD'); setResult(null); setError(''); }} className={`flex-1 pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${subType === 'PASSWORD' ? 'text-[#00FFC2] border-b-2 border-[#00FFC2]' : 'text-white/20'}`}>비밀번호 재설정</button>
                </div>

                {result ? (
                    <div className="text-center py-6">
                        {subType === 'ID' ? (
                            <>
                                <p className="text-white/40 text-sm mb-4">입력하신 정보와 일치하는 아이디입니다.</p>
                                <div className="bg-black/40 rounded-xl p-4 text-white font-mono text-lg mb-8">{result}</div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="w-8 h-8 text-green-500">✓</div>
                                </div>
                                <p className="text-white text-lg font-bold mb-8">비밀번호가 재설정되었습니다.</p>
                            </>
                        )}
                        <button onClick={onClose} className="w-full bg-[#00FFC2] text-[#0A0D17] font-bold py-4 rounded-xl">확인</button>
                    </div>
                ) : (
                    <form onSubmit={subType === 'ID' ? handleFindID : handleResetPW} className="space-y-4">
                        {subType === 'PASSWORD' && (
                            <input type="email" placeholder="아이디 (이메일)" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white" required />
                        )}
                        <input type="text" placeholder="에이전시 명" value={formData.agencyName} onChange={e => setFormData({...formData, agencyName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white" required />
                        <input type="text" placeholder="휴대폰 번호 (010-0000-0000)" value={formData.phoneMobile} onChange={e => setFormData({...formData, phoneMobile: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white" required />
                        {subType === 'PASSWORD' && (
                            <input type="password" placeholder="새 비밀번호" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white" required />
                        )}
                        
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                        
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-4 text-white/40 font-bold">취소</button>
                            <button type="submit" disabled={loading} className="flex-2 bg-[#00FFC2] text-[#0A0D17] font-bold py-4 px-8 rounded-xl disabled:opacity-50">
                                {loading ? '처리 중...' : (subType === 'ID' ? '아이디 찾기' : '비밀번호 재설정')}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};


export default AdminLoginPage;
