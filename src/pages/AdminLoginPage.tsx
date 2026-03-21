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
                        <AutoTranslatedText text="Partner Access" />
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
        </div>
    );
};

export default AdminLoginPage;
