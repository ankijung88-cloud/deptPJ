import { LocalizedString } from '../types';

export const getLocalizedText = (textObj: LocalizedString | string, lang: string): string => {
    if (typeof textObj === 'string') return textObj;

    // Check if the specific language exists
    const match = textObj[lang];
    if (match) {
        return match;
    }

    // Fallback chain: en -> ko -> first available key
    if (textObj.en) return textObj.en;
    if (textObj.ko) return textObj.ko;

    const keys = Object.keys(textObj);
    if (keys.length > 0) {
        const val = textObj[keys[0]];
        return val ? val : '';
    }

    return '';
};
