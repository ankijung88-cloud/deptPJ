import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, ArrowRight, Loader2, Mail } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { signIn } = useAuth();
    type ViewType = 'LOGIN' | 'SIGNUP' | 'FIND_ID' | 'FORGOT_PASSWORD';
    const [view, setView] = useState<ViewType>('LOGIN');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Prevent scrolling when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset state on close
            setError(null);
            setSuccessMessage(null);
            setEmail('');
            setPassword('');
            setName('');
            setView('LOGIN');
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleFindId = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            const response = await api.get(`/api/auth/find-id`, { params: { name } });
            if (response.data && response.data.email) {
                setSuccessMessage(t('auth.find_email_success', { email: response.data.email }));
            } else {
                setError(t('auth.find_email_not_found'));
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || t('auth.error_generic'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            await api.post('/api/auth/forgot-password', { email });
            setSuccessMessage(t('auth.reset_password_sent'));
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || t('auth.error_generic'));
        } finally {
            setIsLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            if (view === 'LOGIN') {
                const response = await api.post('/api/auth/login', {
                    email,
                    password,
                });
                const { token, user } = response.data;
                signIn(token, user);
                onClose();
            } else if (view === 'SIGNUP') {
                await api.post('/api/auth/register', {
                    email,
                    password,
                    name
                });
                setSuccessMessage(t('auth.signup_success_check_email'));
                // Automaticaly switching to login after registration or similar can be handled
            }
        } catch (err: any) {
            console.error('Auth Error:', err);
            const message = err.response?.data?.message || err.message;
            setError(message || t('auth.error_generic'));
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = () => {
        let title = '';
        let subtitle = t('auth.welcome');

        switch (view) {
            case 'LOGIN': title = t('auth.login_title'); break;
            case 'SIGNUP': title = t('auth.register_title'); break;
            case 'FIND_ID': title = t('auth.find_id'); subtitle = "가입 시 입력한 이름을 입력해 주세요."; break;
            case 'FORGOT_PASSWORD': title = t('auth.forgot_password'); subtitle = "비밀번호 재설정을 위해 이메일을 입력해 주세요."; break;
        }

        return (
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-white mb-2">{title}</h2>
                <p className="text-white/60 text-sm">{subtitle}</p>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] grid place-items-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a1a1a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 relative"
                        >
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/korean-pattern.png')]"></div>

                            {/* Close Button (X) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-[60]"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-8 md:p-10 relative z-10">
                                {renderHeader()}

                                {error && (
                                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                {successMessage ? (
                                    <div className="mb-6 space-y-4 text-center">
                                        <div className="p-4 bg-dancheong-green/10 border border-dancheong-green/20 rounded-lg text-dancheong-green text-sm">
                                            {successMessage}
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="w-full bg-dancheong-red hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all"
                                        >
                                            닫기
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Form Views */}
                                        {view === 'FIND_ID' ? (
                                            <form className="space-y-6" onSubmit={handleFindId}>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-dancheong-green uppercase tracking-wider block">{t('auth.name')}</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder={t('auth.name')}
                                                            required
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-dancheong-green focus:ring-1 focus:ring-dancheong-green transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <button type="submit" disabled={isLoading} className="w-full bg-dancheong-red hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : t('auth.submit')}
                                                </button>
                                                <div className="text-center">
                                                    <button type="button" onClick={() => setView('LOGIN')} className="text-white/40 hover:text-white text-sm">로그인으로 돌아가기</button>
                                                </div>
                                            </form>
                                        ) : view === 'FORGOT_PASSWORD' ? (
                                            <form className="space-y-6" onSubmit={handleForgotPassword}>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-dancheong-green uppercase tracking-wider block">{t('auth.email')}</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            placeholder="example@email.com"
                                                            required
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-dancheong-green focus:ring-1 focus:ring-dancheong-green transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <button type="submit" disabled={isLoading} className="w-full bg-dancheong-red hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : t('auth.submit')}
                                                </button>
                                                <div className="text-center">
                                                    <button type="button" onClick={() => setView('LOGIN')} className="text-white/40 hover:text-white text-sm">로그인으로 돌아가기</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <form className="space-y-6" onSubmit={handleSubmit}>
                                                {view === 'SIGNUP' && (
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-dancheong-green uppercase tracking-wider block">{t('auth.name')}</label>
                                                        <div className="relative">
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                                            <input
                                                                type="text"
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                                placeholder={t('auth.name')}
                                                                required
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-dancheong-green focus:ring-1 focus:ring-dancheong-green transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-dancheong-green uppercase tracking-wider block">{t('auth.email')}</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            placeholder="example@email.com"
                                                            autoComplete="email"
                                                            required
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-dancheong-green focus:ring-1 focus:ring-dancheong-green transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-dancheong-green uppercase tracking-wider block">{t('auth.password')}</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                                        <input
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            autoComplete={view === 'LOGIN' ? "current-password" : "new-password"}
                                                            required
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-dancheong-green focus:ring-1 focus:ring-dancheong-green transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {view === 'LOGIN' && (
                                                    <div className="flex items-center justify-center text-sm">
                                                        <div className="flex items-center gap-4">
                                                            <button type="button" onClick={() => setView('FIND_ID')} className="text-white/60 hover:text-white transition-colors">{t('auth.find_id')}</button>
                                                            <span className="text-white/20">|</span>
                                                            <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-white/60 hover:text-white transition-colors">{t('auth.forgot_password')}</button>
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full bg-dancheong-red hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? (
                                                        <Loader2 size={20} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            {view === 'LOGIN' ? t('auth.login') : t('auth.signup')}
                                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </button>

                                            </form>
                                        )}
                                    </>
                                )}

                                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                                    <p className="text-white/60 text-sm">
                                        {view === 'LOGIN' ? t('auth.no_account') : t('auth.have_account')}
                                        <button
                                            onClick={() => {
                                                setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                                                setError(null);
                                                setSuccessMessage(null);
                                            }}
                                            className="text-dancheong-red font-bold hover:underline ml-1"
                                        >
                                            {view === 'LOGIN' ? t('auth.register') : t('auth.login')}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;

