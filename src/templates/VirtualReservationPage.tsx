import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Loader2, Sparkles, MapPin, Info, Plus, Trash2, X, Settings2, Layers } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { getProductById } from '../api/products';
import { useSetBreadcrumbPath } from '../context/NavigationActionContext';
import { getLocalizedText } from '../utils/i18nUtils';
import { updateProduct } from '../api/products';
import { useAdmin } from '../hooks/useAdmin';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

export const VirtualReservationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAdmin, isAgency, user: currentUser } = useAdmin();
    const { translateAsync } = useAutoTranslate('');
    
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [booked, setBooked] = useState(false);

    // Reservation states
    const [step, setStep] = useState<'program' | 'calendar' | 'summary'>('program');
    const [selectedProgram, setSelectedProgram] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [guests, setGuests] = useState(1);

    // Admin/Agency management states
    const [canManage, setCanManage] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [programs, setPrograms] = useState<any[]>([]);
    const [slots, setSlots] = useState<string[]>([]);


    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;
            try {
                const data = await getProductById(id);
                if (data) {
                    setItem(data);
                    
                    const safeParse = (val: any) => {
                        if (!val) return null;
                        if (typeof val !== 'string') return val;
                        try {
                            const trimmed = val.trim();
                            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                                return JSON.parse(val);
                            }
                            return val;
                        } catch (e) {
                            return val;
                        }
                    };

                    const parsedPrograms = safeParse(data.reservation_programs);
                    const parsedSlots = safeParse(data.reservation_slots);

                    // Initialize programs and slots if not present
                    setPrograms(Array.isArray(parsedPrograms) && parsedPrograms.length > 0 
                        ? parsedPrograms 
                        : [
                            { id: 'p1', title: { ko: '기본 도슨트 투어', en: 'Basic Docent Tour' }, description: { ko: '전문 큐레이터와 함께하는 심도 있는 작품 해설 세션입니다.', en: 'In-depth artwork commentary with a professional curator.' }, price: data.price || '무료' },
                            { id: 'p2', title: { ko: '프리미엄 원데이 클래스', en: 'Premium One-day Class' }, description: { ko: '직접 장인의 기술을 배우고 체험해보는 특별한 시간입니다.', en: 'A special time to learn and experience the techniques of master craftsmen.' }, price: '120,000원' }
                        ]
                    );
                    setSlots(Array.isArray(parsedSlots) && parsedSlots.length > 0 
                        ? parsedSlots 
                        : ['10:00', '11:00', '13:00', '14:00', '15:00', '16:30', '18:00', '19:30']
                    );
                    // Set default date to tomorrow
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow.toISOString().split('T')[0]);
                }
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow.toISOString().split('T')[0]);
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    // Permission Check Effect
    useEffect(() => {
        if (!item) return;
        
        if (isAdmin) {
            setCanManage(true);
        } else if (isAgency && currentUser && String(currentUser.id) === String(item.agency_id)) {
            setCanManage(true);
        } else {
            setCanManage(false);
        }
    }, [item, isAdmin, isAgency, currentUser]);

    // Set Breadcrumb Path
    useSetBreadcrumbPath(item ? [
        { id: item.category, label: item.category, type: 'floor' },
        { id: item.subcategory, label: item.subcategory, type: 'category' },
        { id: 'detail', label: <AutoTranslatedText text="Details" />, type: 'detail' },
        { id: item.id, label: getLocalizedText(item.title, i18n.language), type: 'detail' },
        { id: 'reservation', label: <AutoTranslatedText text="Reservation" />, type: 'template' }
    ] : []);

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(`/detail/${id}`);
        }
    };

    const handleBook = async () => {
        if (!selectedTime) {
            const msg = await translateAsync('시간을 선택해주세요.');
            alert(msg);
            return;
        }
        setBooking(true);
        // Simulate booking
        setTimeout(() => {
            setBooking(false);
            setBooked(true);
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F2E7D5] flex items-center justify-center text-black">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await updateProduct(id!, {
                ...item,
                reservation_programs: programs,
                reservation_slots: slots
            });
            const newData = await getProductById(id!);
            if (newData) setItem(newData);
            setIsManageModalOpen(false);
        } catch (error) {
            console.error('Failed to save reservation settings:', error);
            const errorMsg = await translateAsync('저장에 실패했습니다.');
            alert(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <article className="min-h-screen text-black relative overflow-hidden font-sans bg-[#F2E7D5]">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-5 blur-[150px] bg-red-600" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-5 blur-[130px] bg-black" />
            </div>

            <header className="container mx-auto px-6 pt-24 pb-12 relative z-10 flex justify-between items-start">
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-black/40 hover:text-black transition-opacity uppercase text-[10px] font-black tracking-[0.4em]"
                >
                    <ArrowLeft size={16} />
                    <AutoTranslatedText text="Back" />
                </button>

                {canManage && (
                    <button 
                        onClick={() => setIsManageModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-black/10 hover:bg-red-600 hover:text-white text-black/60 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm focus:outline-none"
                    >
                        <Settings2 size={16} />
                        <AutoTranslatedText text="Manage Settings" />
                    </button>
                )}
            </header>

            <main className="container mx-auto px-6 pb-24 relative z-10">
                <div className="max-w-4xl mb-24">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="px-5 py-2 rounded-full bg-black/5 border border-black/10 text-[10px] font-black tracking-widest text-red-600 uppercase">
                            <AutoTranslatedText text="Exclusive Experience" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.8] tracking-tighter uppercase whitespace-pre-wrap break-keep text-black">
                         <AutoTranslatedText text="Reservation" />
                    </h1>
                    <p className="text-xl md:text-2xl font-serif italic text-black/40 max-w-2xl leading-relaxed border-l-4 border-red-600 pl-8">
                        <AutoTranslatedText text="Encounter the special moments where the artisan's breath dwells. A premium session is prepared just for you." />
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Reservation Form Column */}
                    <div className="lg:col-span-7 space-y-12">
                        <section className="bg-white border border-black/10 rounded-[3rem] p-10 md:p-16 shadow-2xl text-black">
                            <AnimatePresence mode="wait">
                                {booked ? (
                                    <motion.div 
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-20 text-center space-y-8"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 animate-pulse" />
                                            <div className="w-28 h-28 rounded-full bg-white border-2 border-red-600 flex items-center justify-center text-red-600 relative z-10">
                                                <Check size={56} strokeWidth={3} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-black uppercase tracking-tighter text-black"><AutoTranslatedText text="Reservation Confirmed" /></h2>
                                            <p className="text-black/40 leading-relaxed max-w-md mx-auto">
                                                <AutoTranslatedText text="Your reservation has been successfully completed. We will serve you politely according to your selected schedule." />
                                            </p>
                                        </div>
                                        <div className="bg-black/5 border border-black/10 rounded-3xl p-8 w-full max-w-sm space-y-4">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="opacity-40 font-bold uppercase tracking-widest">Date / Time</span>
                                                <span className="font-mono text-red-600">{selectedDate} / {selectedTime}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="opacity-40 font-bold uppercase tracking-widest">Guests</span>
                                                <span className="font-mono text-red-600">{guests} Persons</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="opacity-40 font-bold uppercase tracking-widest">Ref ID</span>
                                                <span className="font-mono text-black/20">RSV-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/detail/${id}`)}
                                            className="px-10 py-4 rounded-2xl bg-black text-white font-black uppercase tracking-[0.2em] hover:bg-red-600 active:scale-95 transition-all text-sm shadow-lg"
                                        >
                                            <AutoTranslatedText text="Return to Product" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Step 0: Program Selection */}
                                        {step === 'program' && (
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black">01</div>
                                                    <h3 className="text-xl font-bold uppercase tracking-tight text-black"><AutoTranslatedText text="Select Program" /></h3>
                                                </div>
                                                <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar pb-4">
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {programs.map((prog: any) => (
                                                            <button 
                                                                key={prog.id}
                                                                onClick={() => {
                                                                    setSelectedProgram(prog);
                                                                    setStep('calendar');
                                                                }}
                                                                className={`w-full text-left p-6 rounded-[1.5rem] border transition-all duration-300 group relative overflow-hidden bg-white ${
                                                                    selectedProgram?.id === prog.id 
                                                                        ? 'bg-red-600/10 border-red-600 ring-1 ring-red-600 shadow-[0_0_30px_rgba(220,38,38,0.05)]' 
                                                                        : 'bg-black/5 border-black/10 hover:border-black/30'
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <h4 className="text-xl font-black uppercase tracking-tight text-black">
                                                                        <AutoTranslatedText text={getLocalizedText(prog.title, i18n.language)} />
                                                                    </h4>
                                                                    <div className="text-base font-black text-red-600">{prog.price}</div>
                                                                </div>
                                                                <p className="text-xs text-black/40 leading-relaxed max-w-lg mb-4 line-clamp-2 group-hover:line-clamp-none transition-all">
                                                                    <AutoTranslatedText text={getLocalizedText(prog.description, i18n.language)} />
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <div className={`inline-flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase transition-colors ${
                                                                        selectedProgram?.id === prog.id ? 'text-red-600' : 'text-black/20 group-hover:text-red-600'
                                                                    }`}>
                                                                        <AutoTranslatedText text={selectedProgram?.id === prog.id ? "Selected" : "Select this program"} />
                                                                    </div>
                                                                    {selectedProgram?.id === prog.id && <Check size={14} className="text-red-600" />}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 1 & 2: Date & Time Selection */}
                                        {step === 'calendar' && (
                                            <div className="space-y-12">
                                                <button 
                                                    onClick={() => setStep('program')}
                                                    className="flex items-center gap-2 text-[10px] font-black tracking-widest text-red-600 uppercase hover:gap-4 transition-all"
                                                >
                                                    <ArrowLeft size={12} /> <AutoTranslatedText text="Back to Programs" />
                                                </button>

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black">02</div>
                                                        <h3 className="text-xl font-bold uppercase tracking-tight text-black"><AutoTranslatedText text="Select Date" /></h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                                                        <input 
                                                            type="date" 
                                                            value={selectedDate}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            onChange={e => setSelectedDate(e.target.value)}
                                                            className="w-full bg-black/5 border border-black/10 rounded-2xl p-6 text-xl font-mono text-black focus:border-red-600 focus:bg-white focus:outline-none transition-all placeholder-black/20"
                                                        />
                                                        <div className="p-6 rounded-2xl bg-black/5 border border-dashed border-black/10 flex flex-col justify-center">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-1">Operating Hours</span>
                                                            <span className="text-sm font-bold text-black/60">10:00 AM — 08:30 PM (Mon-Sun)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black">03</div>
                                                        <h3 className="text-xl font-bold uppercase tracking-tight text-black"><AutoTranslatedText text="Select Time Session" /></h3>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        {slots.map((time: string) => {
                                                            const isSelected = selectedTime === time;
                                                            return (
                                                                <button 
                                                                    key={time}
                                                                    onClick={() => setSelectedTime(time)}
                                                                    className={`py-4 rounded-xl border text-sm font-bold transition-all ${
                                                                        isSelected 
                                                                            ? 'bg-red-600 border-red-600 text-white shadow-lg' 
                                                                            : 'bg-black/5 border-black/10 text-black/40 hover:bg-black/10 hover:border-black/30'
                                                                    }`}
                                                                >
                                                                    {time}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black">04</div>
                                                        <h3 className="text-xl font-bold uppercase tracking-tight text-black"><AutoTranslatedText text="Number of Guests" /></h3>
                                                    </div>
                                                    <div className="flex items-center gap-8 bg-black/5 border border-black/10 rounded-2xl p-6 px-10 self-start inline-flex">
                                                        <button 
                                                            onClick={() => setGuests(Math.max(1, guests - 1))}
                                                            className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black/10 hover:text-white transition-colors text-black"
                                                        >-</button>
                                                        <div className="text-3xl font-black text-red-600 w-12 text-center">{guests}</div>
                                                        <button 
                                                            onClick={() => setGuests(Math.min(8, guests + 1))}
                                                            className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black/10 hover:text-white transition-colors text-black"
                                                        >+</button>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-4"><AutoTranslatedText text="Limit: 8 Persons" /></span>
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t border-black/5">
                                                    <button 
                                                        onClick={handleBook}
                                                        disabled={booking}
                                                        className="w-full py-8 rounded-[2rem] bg-black text-white font-black uppercase tracking-[0.4em] text-lg hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 relative group shadow-xl"
                                                    >
                                                        {booking ? (
                                                            <Loader2 className="animate-spin mx-auto text-white" size={32} />
                                                        ) : (
                                                            <>
                                                                <AutoTranslatedText text="RESERVE NOW" />
                                                                <Sparkles className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </AnimatePresence>
                        </section>
                    </div>

                    {/* Sidebar / Info Column */}
                    <div className="lg:col-span-5 lg:pl-10 space-y-16">
                        <section className="space-y-10">
                            <div>
                                <h2 className="text-[10px] font-black tracking-[0.4em] text-[#00FFC2] uppercase mb-4"><AutoTranslatedText text="Reservation Guidelines" /></h2>
                                <div className="space-y-6">
                                    <div className="flex gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                                         <MapPin className="text-[#00FFC2] shrink-0" size={24} />
                                         <div>
                                            <h4 className="text-sm font-bold mb-1 uppercase"><AutoTranslatedText text="Location" /></h4>
                                            <p className="text-xs text-white/40 leading-relaxed font-light"><AutoTranslatedText text="Premium Lounge 3F Exclusive Booth (Detailed location will be sent via reservation confirmation text.)" /></p>
                                         </div>
                                    </div>
                                    <div className="flex gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                                         <Info className="text-[#00FFC2] shrink-0" size={24} />
                                         <div>
                                            <h4 className="text-sm font-bold mb-1 uppercase"><AutoTranslatedText text="Notice" /></h4>
                                            <p className="text-xs text-white/40 leading-relaxed font-light"><AutoTranslatedText text="For smooth progress, please arrive 10 minutes before the reservation time. No-shows may restrict future reservations." /></p>
                                         </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Summary Card */}
                            {item && (
                                <div className="p-10 rounded-[3rem] bg-black/40 border border-white/10 relative overflow-hidden group">
                                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FFC2] to-transparent" />
                                     <img src={item.imageUrl} alt="" className="w-full h-64 object-cover rounded-2xl mb-8 opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                                     <div className="space-y-4">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] font-mono">Archive Entry / {item.id}</span>
                                        <h3 className="text-2xl font-black text-white"><AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} /></h3>
                                        
                                        {selectedProgram && (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-4">
                                                <div className="text-[10px] font-black text-[#00FFC2] uppercase tracking-[0.3em] mb-2">Selected Program</div>
                                                <h4 className="text-lg font-black text-white mb-2"><AutoTranslatedText text={getLocalizedText(selectedProgram.title, i18n.language)} /></h4>
                                                <div className="text-[10px] text-white/40 leading-relaxed font-light"><AutoTranslatedText text={getLocalizedText(selectedProgram.description, i18n.language)} /></div>
                                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                                    <span className="text-xs font-bold text-[#00FFC2]">{selectedProgram.price}</span>
                                                    <span className="text-[10px] font-black text-white/20 uppercase"><AutoTranslatedText text="Per Session" /></span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4">
                                            <div className="text-lg font-black text-[#00FFC2]">{selectedProgram ? selectedProgram.price : item.price}</div>
                                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.category}</div>
                                        </div>
                                     </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            {/* Management Modal */}
            <AnimatePresence>
                {isManageModalOpen && (
                    <div 
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsManageModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="w-full max-w-4xl bg-[#F2E7D5] border border-black/10 rounded-[3rem] overflow-hidden shadow-2xl relative text-black"
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setIsManageModalOpen(false)}
                                className="absolute top-8 right-8 text-black/40 hover:text-black transition-colors z-10"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-12 pb-8 flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-2 text-red-600 mb-2">
                                        <Settings2 size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]"><AutoTranslatedText text="Administration" /></span>
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter text-black"><AutoTranslatedText text="Reservation Manager" /></h2>
                                </div>
                                <button 
                                    onClick={() => {
                                        const newProg = { id: Date.now().toString(), title: { ko: '새 프로그램', en: 'New Program' }, description: { ko: '', en: '' }, price: '₩0' };
                                        setPrograms([...programs, newProg]);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-white border border-black/10 shadow-sm text-black hover:bg-black hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Plus size={14} /> <AutoTranslatedText text="Add Program" />
                                </button>
                            </div>

                            <div className="p-12 pt-8 overflow-y-auto max-h-[60vh] space-y-6">
                                <ManageReservationContent 
                                    programs={programs}
                                    setPrograms={setPrograms}
                                    slots={slots}
                                    setSlots={setSlots}
                                />
                            </div>

                            <div className="p-12 pt-8 flex justify-end gap-4 border-t border-black/5">
                                <button 
                                    onClick={() => handleSaveSettings()}
                                    disabled={isSaving}
                                    className="px-10 py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                                    <AutoTranslatedText text="Save All Changes" />
                                </button>
                                <button 
                                    onClick={() => setIsManageModalOpen(false)}
                                    className="px-10 py-4 rounded-2xl bg-white border border-black/10 text-black hover:bg-black/5 font-black uppercase tracking-[0.2em] text-xs transition-all shadow-sm"
                                >
                                    <AutoTranslatedText text="Cancel" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </article>
    );
};

// Sub-component for management content
const ManageReservationContent: React.FC<{
    programs: any[],
    setPrograms: (p: any[]) => void,
    slots: string[],
    setSlots: (s: string[]) => void
}> = ({ programs, setPrograms, slots, setSlots }) => {
    const { i18n } = useTranslation();

    return (
        <div className="space-y-12">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Layers size={18} className="text-[#00FFC2]" />
                        <h3 className="text-sm font-black uppercase tracking-widest"><AutoTranslatedText text="Programs" /></h3>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {programs.map(prog => (
                        <div key={prog.id} className="p-6 rounded-2xl bg-white border border-black/10 space-y-4 shadow-sm">
                            <div className="flex gap-4">
                                <input 
                                    className="flex-1 bg-black/5 border-none rounded-lg px-4 py-2 text-sm font-bold text-black"
                                    value={prog.title[i18n.language as 'ko' | 'en']}
                                    onChange={e => {
                                        const newProgs = programs.map(p => p.id === prog.id ? { ...p, title: { ...p.title, [i18n.language]: e.target.value } } : p);
                                        setPrograms(newProgs);
                                    }}
                                />
                                <input 
                                    className="w-32 bg-black/5 border-none rounded-lg px-4 py-2 text-sm font-bold text-red-600"
                                    value={prog.price}
                                    onChange={e => {
                                        const newProgs = programs.map(p => p.id === prog.id ? { ...p, price: e.target.value } : p);
                                        setPrograms(newProgs);
                                    }}
                                />
                                <button 
                                    onClick={() => setPrograms(programs.filter(p => p.id !== prog.id))}
                                    className="p-2 text-black/40 hover:text-red-600 transition-colors"
                                ><Trash2 size={16} /></button>
                            </div>
                            <textarea 
                                className="w-full bg-black/5 border-none rounded-lg px-4 py-2 text-xs text-black/40 min-h-[60px]"
                                value={prog.description[i18n.language as 'ko' | 'en']}
                                onChange={e => {
                                    const newProgs = programs.map(p => p.id === prog.id ? { ...p, description: { ...p.description, [i18n.language]: e.target.value } } : p);
                                    setPrograms(newProgs);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Check size={18} className="text-[#00FFC2]" />
                        <h3 className="text-sm font-black uppercase tracking-widest"><AutoTranslatedText text="Time Slots" /></h3>
                    </div>
                    <button 
                        onClick={() => setSlots([...slots, "10:00"])}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FFC2]/10 text-[#00FFC2] hover:bg-[#00FFC2]/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                        <Plus size={14} /> <AutoTranslatedText text="Add Slot" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {slots.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-2 pl-4">
                            <input 
                                value={slot}
                                onChange={e => {
                                    const updated = [...slots];
                                    updated[idx] = e.target.value;
                                    setSlots(updated);
                                }}
                                className="bg-transparent border-none text-white text-xs font-mono w-16 focus:outline-none"
                            />
                            <button 
                                onClick={() => setSlots(slots.filter((_, i) => i !== idx))}
                                className="p-2 hover:text-red-400 opacity-20 hover:opacity-100"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VirtualReservationPage;
