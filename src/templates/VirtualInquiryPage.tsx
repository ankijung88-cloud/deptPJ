import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MessageCircle, Send, User, Mail, FileText, Check, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { getProductById } from '../api/products';
import { getJoseonTheme } from '../utils/themeUtils';
import { useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { getLocalizedText } from '../utils/i18nUtils';

export const VirtualInquiryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // Form states
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const theme = item?.category ? getJoseonTheme(item.category.replace('floor-', '')) : getJoseonTheme('1');

    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;
            try {
                const data = await getProductById(id);
                if (data) setItem(data);
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    // Set Breadcrumb Path
    useSetBreadcrumbPath(item ? [
        { id: item.category, label: item.category, type: 'floor' },
        { id: item.subcategory, label: item.subcategory, type: 'category' },
        { id: 'detail', label: <AutoTranslatedText text="상세" />, type: 'detail' },
        { id: item.id, label: getLocalizedText(item.title, i18n.language), type: 'detail' },
        { id: 'inquiry', label: <AutoTranslatedText text="문의하기" />, type: 'template' }
    ] : []);

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(`/detail/${id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate sending
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setForm({ name: '', email: '', subject: '', message: '' });
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-[#00FFC2]" size={40} />
            </div>
        );
    }

    return (
        <article className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: theme.bgColor }}>
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: theme.highlightColor }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px]" style={{ backgroundColor: theme.accentColor }} />
            </div>

            <header className="container mx-auto px-6 pt-24 pb-12 relative z-10">
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity uppercase text-[10px] font-black tracking-[0.4em]"
                >
                    <ArrowLeft size={16} />
                    <AutoTranslatedText text="Back to Detail" />
                </button>

                <div className="max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 leading-none tracking-tighter" style={{ color: theme.highlightColor }}>
                         <AutoTranslatedText text="문의하기" />
                    </h1>
                    <p className="text-xl md:text-2xl font-serif italic opacity-60 max-w-2xl leading-relaxed">
                        <AutoTranslatedText text="제품이나 서비스에 대해 궁금한 점이 있으신가요? 저희 전문가들이 상세히 안내해 드리겠습니다." />
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Form Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16 shadow-2xl space-y-10"
                    >
                        <AnimatePresence mode="wait">
                            {sent ? (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center space-y-6"
                                >
                                    <div className="w-24 h-24 rounded-full bg-[#00FFC2]/20 border border-[#00FFC2]/40 flex items-center justify-center text-[#00FFC2]">
                                        <Check size={48} />
                                    </div>
                                    <h2 className="text-3xl font-black"><AutoTranslatedText text="감사합니다!" /></h2>
                                    <p className="text-white/60"><AutoTranslatedText text="문의사항이 성공적으로 접수되었습니다. 곧 답변 드리겠습니다." /></p>
                                    <button 
                                        onClick={() => setSent(false)}
                                        className="px-8 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm font-bold uppercase tracking-widest"
                                    >
                                        <AutoTranslatedText text="추가 문의하기" />
                                    </button>
                                </motion.div>
                            ) : (
                                <form key="form" onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                                <User size={12} /> <AutoTranslatedText text="성함" />
                                            </label>
                                            <input 
                                                required
                                                type="text" 
                                                value={form.name}
                                                onChange={e => setForm({...form, name: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-white focus:outline-none transition-all"
                                                placeholder={t('common.name_placeholder') || 'Name'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                                <Mail size={12} /> <AutoTranslatedText text="이메일" />
                                            </label>
                                            <input 
                                                required
                                                type="email" 
                                                value={form.email}
                                                onChange={e => setForm({...form, email: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-white focus:outline-none transition-all"
                                                placeholder={t('common.email_placeholder') || 'Email'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <FileText size={12} /> <AutoTranslatedText text="제목" />
                                        </label>
                                        <input 
                                            required
                                            type="text" 
                                            value={form.subject}
                                            onChange={e => setForm({...form, subject: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-white focus:outline-none transition-all"
                                            placeholder={t('common.subject_placeholder') || 'Subject'}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <MessageCircle size={12} /> <AutoTranslatedText text="내용" />
                                        </label>
                                        <textarea 
                                            required
                                            rows={6}
                                            value={form.message}
                                            onChange={e => setForm({...form, message: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 focus:border-white focus:outline-none transition-all resize-none"
                                            placeholder={t('common.message_placeholder') || 'How can we help you?'}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={sending}
                                        className="w-full py-6 rounded-2xl bg-[#00FFC2] text-black font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {sending ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                <AutoTranslatedText text="보내는 중..." />
                                            </>
                                        ) : (
                                            <>
                                                <Send size={24} />
                                                <AutoTranslatedText text="문의 보내기" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Info Section */}
                    <div className="space-y-16 lg:pt-10">
                        <section className="space-y-8">
                            <div className="w-16 h-px bg-[#00FFC2]" />
                            <h2 className="text-3xl font-black uppercase tracking-tight"><AutoTranslatedText text="Why Inquiry?" /></h2>
                            <div className="space-y-10">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0" style={{ color: theme.highlightColor }}>
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-2"><AutoTranslatedText text="1:1 전문가 상담" /></h3>
                                        <p className="text-white/40 leading-relaxed text-sm"><AutoTranslatedText text="단순한 답변을 넘어 제품의 가공 방식, 재질, 역사적 배경 등 상세한 정보를 제공해 드립니다." /></p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0" style={{ color: theme.highlightColor }}>
                                        <Send size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-2"><AutoTranslatedText text="빠른 피드백" /></h3>
                                        <p className="text-white/40 leading-relaxed text-sm"><AutoTranslatedText text="접수된 문의는 24시간 이내에 담당 부서에서 확인 후 정중히 답변 드립니다." /></p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Product Card Highlight */}
                        {item && (
                            <section className="p-8 rounded-[2rem] bg-black/40 border border-white/10 flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black tracking-widest text-[#00FFC2] uppercase">
                                        <AutoTranslatedText text="Inquiring About" />
                                    </span>
                                    <h4 className="text-lg font-bold line-clamp-1"><AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} /></h4>
                                    <p className="text-xs text-white/40">{item.id}</p>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </article>
    );
};

export default VirtualInquiryPage;
