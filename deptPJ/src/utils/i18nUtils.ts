import { LocalizedString } from '../types';

export const getLocalizedText = (obj: LocalizedString | string, lang: string): string => {
    if (typeof obj === 'string') return obj;
    if (!obj) return '';

    // Exact match
    if (obj[lang]) return obj[lang];

    // Partial match (e.g., 'ko-KR' -> 'ko')
    const shortLang = lang.split('-')[0];
    if (obj[shortLang]) return obj[shortLang];

    // Fallback to 'ko' or 'en' or first available
    return obj['ko'] || obj['en'] || Object.values(obj)[0] || '';
};

export const supportedLanguages = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
];
