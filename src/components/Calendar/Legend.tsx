import React from 'react';
import { useTranslation } from 'react-i18next';

const Legend: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-8 mt-5 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-400" style={{ boxShadow: '0 0 6px rgba(248,113,113,0.5)' }} />
        <span className="text-sm text-white/60 font-medium">{t('calendar.ended', '종료')}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-blue-400" style={{ boxShadow: '0 0 6px rgba(96,165,250,0.5)' }} />
        <span className="text-sm text-white/60 font-medium">{t('calendar.ongoing', '진행 중')}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.5)' }} />
        <span className="text-sm text-white/60 font-medium">{t('calendar.upcoming', '예정')}</span>
      </div>
    </div>
  );
};

export default Legend;
