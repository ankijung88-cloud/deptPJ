import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarIcon, Clock, MapPin } from 'lucide-react';

const EventDetailPage: React.FC = () => {
    const { id: _eventId } = useParams<{ id: string }>();
    const location = useLocation();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // location.state로 전달받은 이벤트 데이터
    const event = location.state as {
        title?: string;
        description?: string;
        date?: string;
        endDate?: string;
        imageUrl?: string;
        category?: string;
    } | null;

    const fallbackImage = 'https://images.unsplash.com/photo-1540575861501-7c00117fb3c9?q=80&w=800&auto=format&fit=crop';

    const title = event?.title || t('featured.event_ongoing', '이벤트');
    const description = event?.description || t('featured.event_ongoing_desc', '현재 진행 중인 특별한 이벤트입니다.');
    const imageUrl = (event?.imageUrl && (event.imageUrl.startsWith('http') || event.imageUrl.startsWith('/'))) ? event.imageUrl : fallbackImage;
    const dateStr = event?.date?.replace(/-/g, '.') || '';
    const endDateStr = event?.endDate?.replace(/-/g, '.') || '';
    const dateDisplay = endDateStr && endDateStr !== dateStr ? `${dateStr} — ${endDateStr}` : dateStr;
    const category = event?.category || 'ONGOING';

    const statusLabel = category === 'ARCHIVE' ? t('featured.archived', '종료') :
        category === 'ONGOING' ? t('featured.ongoing', '진행 중') :
            t('featured.upcoming', '예정');
    const statusColor = category === 'ARCHIVE' ? 'bg-red-500' :
        category === 'ONGOING' ? 'bg-blue-500' : 'bg-green-500';

    return (
        <div className="min-h-screen bg-charcoal text-white">
            {/* 히어로 이미지 */}
            <div className="relative w-full h-[50vh] md:h-[60vh]">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />

                {/* 뒤로가기 */}
                <button
                    onClick={() => navigate(-1)}
                    className="fixed top-[22px] left-6 z-[60] bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/80 transition-all shadow-lg"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* 상태 배지 */}
                <div className="absolute top-6 right-6 z-20">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white ${statusColor}`}>
                        {statusLabel}
                    </span>
                </div>
            </div>

            {/* 콘텐츠 */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-20"
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-6">{title}</h1>

                {/* 메타 정보 */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {dateDisplay && (
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                            <CalendarIcon size={16} className="text-dancheong-red" />
                            <span className="text-sm text-white/70">{dateDisplay}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                        <Clock size={16} className="text-dancheong-red" />
                        <span className="text-sm text-white/70">10:00 - 20:00</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                        <MapPin size={16} className="text-dancheong-red" />
                        <span className="text-sm text-white/70">DEPT 문화관</span>
                    </div>
                </div>

                {/* 설명 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
                    <h2 className="text-lg font-bold mb-4">{t('event.about', '이벤트 소개')}</h2>
                    <p className="text-white/60 leading-relaxed">{description}</p>
                </div>

                {/* 안내사항 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-lg font-bold mb-4">{t('event.notice', '안내사항')}</h2>
                    <ul className="space-y-3 text-white/60 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-dancheong-red mt-0.5">•</span>
                            <span>{t('event.notice_1', '사전 예약 시 우선 입장이 가능합니다.')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-dancheong-red mt-0.5">•</span>
                            <span>{t('event.notice_2', '현장 상황에 따라 입장이 제한될 수 있습니다.')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-dancheong-red mt-0.5">•</span>
                            <span>{t('event.notice_3', '문의: DEPT 고객센터 (02-1234-5678)')}</span>
                        </li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default EventDetailPage;
