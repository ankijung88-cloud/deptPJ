import { LocalizedString } from '../types';

export const getLocalizedText = (obj: LocalizedString | string | null | undefined, lang: string): string => {
    if (!obj) return '';

    // If it's a string, check if it's stringified JSON
    if (typeof obj === 'string') {
        if (obj.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(obj);
                // Recursively call to handle potentially nested JSON
                return getLocalizedText(parsed, lang);
            } catch (e) {
                // If parsing fails, treat as a regular string
                return obj;
            }
        }
        return obj;
    }

    // Now we know it's a LocalizedString object
    const target = obj as any;

    // Exact match
    if (target[lang]) return target[lang];

    // Partial match (e.g., 'ko-KR' -> 'ko')
    const shortLang = lang.split('-')[0];
    if (target[shortLang]) return target[shortLang];

    // Fallback to 'ko' or 'en' or first available
    return target['ko'] || target['en'] || Object.values(target)[0] as string || '';
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
