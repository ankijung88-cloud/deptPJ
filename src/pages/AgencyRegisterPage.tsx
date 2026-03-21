import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Building, ArrowLeft, Loader2, CheckCircle2, Calendar, Phone, MapPin, Search } from 'lucide-react';
import { registerAgency } from '../api/auth';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

declare global {
    interface Window {
        daum: any;
    }
}

const AgencyRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        agencyName: '',
        birthDate: '',
        phoneMobile: '',
        phoneCompany: '',
        address: '',
        addressDetail: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Load Daum Postcode Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            const scripts = document.head.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                if (scripts[i].src.includes('postcode.v2.js')) {
                    document.head.removeChild(scripts[i]);
                }
            }
        };
    }, []);

    const handleAddressSearch = () => {
        if (!window.daum || !window.daum.Postcode) {
            setError('주소 검색 서비스를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        new window.daum.Postcode({
            oncomplete: (data: any) => {
                let fullAddress = data.address;
                let extraAddress = '';

                if (data.addressType === 'R') {
                    if (data.bname !== '') {
                        extraAddress += data.bname;
                    }
                    if (data.buildingName !== '') {
                        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                    }
                    fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
                }

                setFormData(prev => ({ ...prev, address: fullAddress }));
                // Auto-focus on detail address
                const detailInput = document.getElementById('addressDetail');
                if (detailInput) detailInput.focus();
            }
        }).open();
    };

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="min-h-screen bg-[#050505] relative overflow-hidden flex items-center justify-center py-20 px-6 font-sans">
            {/* Background Effects */}
            <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00FFC2]/5 rounded-full blur-[120px]" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00FFC2]/5 rounded-full blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full relative z-10"
            >
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/admin/login')}
                    className="flex items-center gap-2 text-dancheong-white/50 hover:text-[#00FFC2] transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">로그인으로 돌아가기</span>
                </button>

                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <div className="mb-10 text-center md:text-left">
                        <div className="w-16 h-16 bg-[#00FFC2]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                            <UserPlus className="text-[#00FFC2] w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">에이전시 파트너 등록</h1>
                        <p className="text-dancheong-white/50 text-sm">
                            디파트먼트의 파트너가 되어 제품을 등록하고 관리하세요.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm overflow-hidden"
                            >
                                <AutoTranslatedText text={error} />
                            </motion.div>
                        )}

                        <div className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">에이전시 명</label>
                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-dancheong-white/30 group-focus-within:text-[#00FFC2] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Agency Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all font-medium"
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all font-medium"
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all font-medium"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">생년월일</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-dancheong-white/30 group-focus-within:text-[#00FFC2] transition-colors" size={18} />
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all font-medium appearance-none"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">휴대폰 번호</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-dancheong-white/30 group-focus-within:text-[#00FFC2] transition-colors" size={18} />
                                    <input
                                        type="tel"
                                        placeholder="010-0000-0000"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all font-medium"
                                        value={formData.phoneMobile}
                                        onChange={(e) => setFormData({ ...formData, phoneMobile: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">회사 연락처</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-dancheong-white/30 group-focus-within:text-[#00FFC2] transition-colors" size={18} />
                                    <input
                                        type="tel"
                                        placeholder="02-000-0000"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all font-medium"
                                        value={formData.phoneCompany}
                                        onChange={(e) => setFormData({ ...formData, phoneCompany: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">회사 주소</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-dancheong-white/30 group-focus-within:text-[#00FFC2] transition-colors" size={18} />
                                        <input
                                            type="text"
                                            readOnly
                                            placeholder="검색 버튼을 눌러 주소를 입력하세요"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all font-medium cursor-pointer placeholder:text-white/20"
                                            value={formData.address}
                                            onClick={handleAddressSearch}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddressSearch}
                                        className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 flex items-center gap-2 font-bold whitespace-nowrap"
                                    >
                                        <Search size={18} />
                                        <span>검색</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dancheong-white/40 uppercase tracking-widest ml-1">상세 주소</label>
                                <input
                                    id="addressDetail"
                                    type="text"
                                    placeholder="상세 주소 입력"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-[#00FFC2]/50 focus:bg-white/10 transition-all font-medium"
                                    value={formData.addressDetail}
                                    onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00FFC2] hover:bg-[#00FFC2]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-5 rounded-xl transition-all shadow-[0_10px_30px_rgba(0,255,194,0.3)] flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span>가입 신청하기</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-dancheong-white/40 text-sm">
                            이미 계정이 있으신가요?{' '}
                            <Link to="/admin/login" className="text-[#00FFC2] hover:underline font-medium ml-1">
                                로그인
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center opacity-30">
                    <img src="/K로고.png" alt="Logo" className="h-10 mx-auto grayscale brightness-200" />
                </div>
            </motion.div>
        </div>
    );
};

export default AgencyRegisterPage;
