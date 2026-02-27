import { LocalizedString } from '../types';

export const getLocalizedText = (obj: LocalizedString | string, lang: string): string => {
    if (typeof obj === 'string') return obj;
    if (!obj) return '';

    // Exact match
    const exactMatch = obj[lang];
    if (exactMatch) return exactMatch;

    // Partial match (e.g., 'ko-KR' -> 'ko')
    const shortLang = lang.split('-')[0];
    const shortMatch = obj[shortLang];
    if (shortMatch) return shortMatch;

    // Fallback: prefer 'en' for non-Korean languages, then 'ko'
    if (shortLang === 'ko') {
        return obj['ko'] || obj['en'] || Object.values(obj)[0] || '';
    }
    return obj['en'] || obj['ko'] || Object.values(obj)[0] || '';
};

export const supportedLanguages = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
    { code: 'th', label: 'ภาษาไทย' },
];
