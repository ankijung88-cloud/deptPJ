import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, Mail, Phone, Globe, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { BrandLogo } from '../components/common/BrandLogo';

const AgencyRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        agencyName: '',
        representative: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        category: 'Fashion',
        description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3); // Show success state
    };

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 selection:bg-dancheong-mugwort/20 selection:text-dancheong-ink">
            <div className="lossless-layout">
                {/* Header Context */}
                <div className="max-w-4xl mx-auto mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-dancheong-mugwort/10 border border-dancheong-mugwort/30 rounded-full text-dancheong-mugwort text-[10px] font-black tracking-widest uppercase mb-8"
                    >
                        <Building2 size={14} />
                        <AutoTranslatedText text="PARTNER REGISTRATION" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-serif font-black text-dancheong-ink mb-8 tracking-tighter leading-none"
                    >
                        <AutoTranslatedText text="전략적 파트너십 구축" />
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-dancheong-ink/40 font-light italic leading-relaxed max-w-2xl mx-auto"
                    >
                        <AutoTranslatedText text="몽땅쏙과 함께 새로운 브랜드 가치를 창출하고 글로벌 시장으로의 확장을 준비하십시오. 귀사의 기록은 몽땅쏙의 아카이브에 영구히 보존됩니다." />
                    </motion.p>
                </div>

                {/* Multi-step Form / Content */}
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white border border-dancheong-ink/5 rounded-[64px] p-8 md:p-16 shadow-[0_60px_120px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        {/* Decorative Pattern */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <BrandLogo size={300} />
                        </div>

                        {step === 1 ? (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                    <div className="space-y-12">
                                        <div>
                                            <h2 className="text-3xl font-black text-dancheong-ink mb-6 tracking-tight">
                                                <AutoTranslatedText text="입점 및 파트너 등록" />
                                            </h2>
                                            <div className="space-y-6">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 bg-dancheong-mugwort/10 rounded-2xl flex items-center justify-center shrink-0">
                                                        <ShieldCheck className="text-dancheong-mugwort" size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-dancheong-ink mb-1 uppercase tracking-tight"><AutoTranslatedText text="Verified Entry" /></h4>
                                                        <p className="text-xs text-dancheong-ink/40 font-light italic"><AutoTranslatedText text="엄격한 심사를 거쳐 프리미엄 브랜드 컬렉션에 등록됩니다." /></p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 bg-dancheong-ink/5 rounded-2xl flex items-center justify-center shrink-0">
                                                        <Globe className="text-dancheong-ink/30" size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-dancheong-ink mb-1 uppercase tracking-tight"><AutoTranslatedText text="Global Exposure" /></h4>
                                                        <p className="text-xs text-dancheong-ink/40 font-light italic"><AutoTranslatedText text="글로벌 시장을 겨냥한 다국어 큐레이션 서비스가 제공됩니다." /></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-dancheong-ink/5 rounded-[32px] border border-dancheong-ink/5 italic font-light text-dancheong-ink/50 text-sm leading-relaxed">
                                            <AutoTranslatedText text="등록 신청 후 영업일 기준 3~5일 내에 담당자의 개별 연락이 진행됩니다. 원활한 심사를 위해 정확한 정보를 입력해 주시기 바랍니다." />
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <button 
                                            onClick={() => setStep(2)}
                                            className="group w-full bg-dancheong-ink text-white py-8 rounded-[32px] text-xs font-black uppercase tracking-[0.5em] hover:bg-dancheong-mugwort transition-all shadow-2xl shadow-dancheong-ink/20 active:scale-95 flex items-center justify-center gap-6"
                                        >
                                            <AutoTranslatedText text="Registration Start" />
                                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform opacity-40" />
                                        </button>
                                        <p className="mt-8 text-center text-[10px] font-black text-dancheong-ink/20 uppercase tracking-[0.3em]">
                                            <AutoTranslatedText text="System Secure Connection Active" />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} className="space-y-12">
                                <div className="flex items-center justify-between mb-8">
                                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black text-dancheong-ink/30 uppercase tracking-widest hover:text-dancheong-mugwort transition-colors">
                                        <ChevronLeft size={16} /> <AutoTranslatedText text="Back" />
                                    </button>
                                    <div className="text-[10px] font-black text-dancheong-ink/20 uppercase tracking-[0.4em]">Section 02 / Archive Registry</div>
                                </div>

                                <div className="space-y-16">
                                    {/* Section 1: Identity */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
                                        <div className="lg:col-span-1">
                                            <h3 className="text-xl font-black text-dancheong-ink tracking-tight mb-2 uppercase">Brand Identity</h3>
                                            <p className="text-[10px] text-dancheong-ink/40 font-light italic leading-relaxed">
                                                귀사의 고유한 브랜드 정체성과 대표자 정보를 입력해 주십시오.
                                            </p>
                                        </div>
                                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/30 ml-4">Agency / Brand Name</label>
                                                <div className="relative group">
                                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-dancheong-ink/20 group-focus-within:text-dancheong-mugwort transition-colors" size={18} />
                                                    <input 
                                                        required
                                                        type="text" 
                                                        className="w-full bg-white/60 border border-dancheong-ink/15 rounded-3xl py-5 pl-16 pr-8 text-dancheong-ink placeholder:text-dancheong-ink/20 outline-none focus:border-dancheong-mugwort focus:ring-4 focus:ring-dancheong-mugwort/5 transition-all font-sans shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                        placeholder="Enter agency name"
                                                        value={formData.agencyName}
                                                        onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/30 ml-4">Representative</label>
                                                <div className="relative group">
                                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-dancheong-ink/20 group-focus-within:text-dancheong-mugwort transition-colors" size={18} />
                                                    <input 
                                                        required
                                                        type="text" 
                                                        className="w-full bg-white/60 border border-dancheong-ink/15 rounded-3xl py-5 pl-16 pr-8 text-dancheong-ink placeholder:text-dancheong-ink/20 outline-none focus:border-dancheong-mugwort focus:ring-4 focus:ring-dancheong-mugwort/5 transition-all font-sans shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                        placeholder="대표자 성함을 입력해 주십시오"
                                                        value={formData.representative}
                                                        onChange={(e) => setFormData({...formData, representative: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Communication */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-16 border-t border-dancheong-ink/5">
                                        <div className="lg:col-span-1">
                                            <h3 className="text-xl font-black text-dancheong-ink tracking-tight mb-2 uppercase">Communication</h3>
                                            <p className="text-[10px] text-dancheong-ink/40 font-light italic leading-relaxed">
                                                심사 결과 통보 및 공식 연락을 위한 채널을 등록해 주십시오.
                                            </p>
                                        </div>
                                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/30 ml-4">Corporate Email</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-dancheong-ink/20 group-focus-within:text-dancheong-mugwort transition-colors" size={18} />
                                                    <input 
                                                        required
                                                        type="email" 
                                                        className="w-full bg-white/60 border border-dancheong-ink/15 rounded-3xl py-5 pl-16 pr-8 text-dancheong-ink placeholder:text-dancheong-ink/20 outline-none focus:border-dancheong-mugwort focus:ring-4 focus:ring-dancheong-mugwort/5 transition-all font-sans shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                        placeholder="agency@example.com"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/30 ml-4">Contact Phone</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-dancheong-ink/20 group-focus-within:text-dancheong-mugwort transition-colors" size={18} />
                                                    <input 
                                                        required
                                                        type="tel" 
                                                        className="w-full bg-white/60 border border-dancheong-ink/15 rounded-3xl py-5 pl-16 pr-8 text-dancheong-ink placeholder:text-dancheong-ink/20 outline-none focus:border-dancheong-mugwort focus:ring-4 focus:ring-dancheong-mugwort/5 transition-all font-sans shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                        placeholder="+82-10-0000-0000"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/30 ml-4">Official Website</label>
                                                <div className="relative group">
                                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-dancheong-ink/20 group-focus-within:text-dancheong-mugwort transition-colors" size={18} />
                                                    <input 
                                                        type="url" 
                                                        className="w-full bg-white/60 border border-dancheong-ink/15 rounded-3xl py-5 pl-16 pr-8 text-dancheong-ink placeholder:text-dancheong-ink/20 outline-none focus:border-dancheong-mugwort focus:ring-4 focus:ring-dancheong-mugwort/5 transition-all font-sans shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                        placeholder="https://www.brand.com"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Section 3: Narrative */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-16 border-t border-dancheong-ink/5">
                                        <div className="lg:col-span-1">
                                            <h3 className="text-xl font-black text-dancheong-ink tracking-tight mb-2 uppercase">Brand Narrative</h3>
                                            <p className="text-[10px] text-dancheong-ink/40 font-light italic leading-relaxed">
                                                브랜드의 철학과 비전을 서술해 주십시오. 아카이브 큐레이션의 핵심 자료로 활용됩니다.
                                            </p>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/30 ml-4 mb-2 block">Vision / Description</label>
                                            <textarea 
                                                required
                                                className="w-full bg-white/60 border border-dancheong-ink/15 rounded-[32px] p-8 text-dancheong-ink placeholder:text-dancheong-ink/20 outline-none focus:border-dancheong-mugwort focus:ring-4 focus:ring-dancheong-mugwort/5 transition-all font-sans min-h-[200px] resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                placeholder="Describe your brand heritage and vision..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <p className="text-[10px] text-dancheong-ink/30 font-light italic max-w-sm">
                                        <AutoTranslatedText text="By submitting this registry, you agree to our heritage preservation terms and platform service agreements." />
                                    </p>
                                    <button 
                                        type="submit"
                                        className="px-16 py-6 bg-dancheong-ink text-white rounded-full text-xs font-black uppercase tracking-[0.4em] hover:bg-dancheong-mugwort transition-all shadow-xl shadow-dancheong-ink/10 active:scale-95 flex items-center gap-4"
                                    >
                                        <AutoTranslatedText text="Submit Registry" />
                                        <ArrowRight size={16} className="opacity-40" />
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center">
                                <div className="w-24 h-24 bg-dancheong-mugwort/10 border border-dancheong-mugwort/20 rounded-full flex items-center justify-center mx-auto mb-10">
                                    <CheckCircle2 className="text-dancheong-mugwort" size={48} />
                                </div>
                                <h2 className="text-4xl font-serif font-black text-dancheong-ink mb-6 tracking-tight">
                                    <AutoTranslatedText text="등록 신청 완료" />
                                </h2>
                                <p className="text-dancheong-ink/40 font-light italic text-xl mb-12 max-w-lg mx-auto">
                                    <AutoTranslatedText text="파트너 등록 신청이 성공적으로 접수되었습니다. 브랜드 큐레이션팀의 검토 후 연락드리겠습니다." />
                                </p>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="px-12 py-5 bg-dancheong-ink text-white rounded-full text-xs font-black uppercase tracking-[0.4em] hover:bg-dancheong-mugwort transition-all"
                                >
                                    <AutoTranslatedText text="Return to Main" />
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Support Links */}
                    <div className="mt-12 flex items-center justify-center gap-10">
                        <button 
                            onClick={() => navigate('/faq')}
                            className="text-[10px] font-black text-dancheong-ink/20 uppercase tracking-[0.2em] hover:text-dancheong-ink transition-colors"
                        >
                            <AutoTranslatedText text="Inquiry Support" />
                        </button>
                        <div className="w-1 h-1 bg-dancheong-ink/10 rounded-full" />
                        <button 
                            onClick={() => navigate('/faq')}
                            className="text-[10px] font-black text-dancheong-ink/20 uppercase tracking-[0.2em] hover:text-dancheong-ink transition-colors"
                        >
                            <AutoTranslatedText text="Documentation" />
                        </button>
                        <div className="w-1 h-1 bg-dancheong-ink/10 rounded-full" />
                        <button 
                            onClick={() => navigate('/admin/login')}
                            className="text-[10px] font-black text-dancheong-ink/20 uppercase tracking-[0.2em] hover:text-dancheong-ink transition-colors"
                        >
                            <AutoTranslatedText text="Status Check" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgencyRegisterPage;
