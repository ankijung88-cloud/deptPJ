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
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'ru', label: 'Русский' },
    { code: 'pt', label: 'Português' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pl', label: 'Polski' },
    { code: 'sv', label: 'Svenska' },
    { code: 'ar', label: 'العربية' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'fa', label: 'فارسی' },
    { code: 'he', label: 'עברית' },
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'th', label: 'ไทย' },
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'hi', label: 'हिन्दी' },
];
