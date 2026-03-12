import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI } from '@google/genai';
import i18n from '../i18n';

const translationCache = new Map<string, string>();

/**
 * i18n 리소스에서 한국어(ko) 값을 역조회하여 해당 i18n 키를 찾고,
 * 현재 언어의 번역 값을 반환합니다.
 */
function findTranslationByKoreanValue(koText: string, targetLang: string): string | null {
    if (!koText) return null;

    const langCode = targetLang.split('-')[0];
    if (langCode === 'ko') return null;

    const koResources = i18n.getResourceBundle('ko', 'translation');
    const targetResources = i18n.getResourceBundle(langCode, 'translation');

    if (!koResources || !targetResources) return null;

    // Helper to find key path for a given value
    const findKeyPath = (obj: any, targetValue: string, path: string[] = []): string[] | null => {
        for (const [key, value] of Object.entries(obj)) {
            if (value === targetValue) {
                return [...path, key];
            }
            if (typeof value === 'object' && value !== null) {
                const found = findKeyPath(value, targetValue, [...path, key]);
                if (found) return found;
            }
        }
        return null;
    }

    const keyPath = findKeyPath(koResources, koText);
    if (!keyPath) return null;

    let targetVal: any = targetResources;
    for (const k of keyPath) {
        if (targetVal && typeof targetVal === 'object' && k in targetVal) {
            targetVal = targetVal[k];
        } else {
            return null;
        }
    }

    return typeof targetVal === 'string' ? targetVal : null;
}

/**
 * Custom hook to automatically translate text using Google Gemini AI.
 * It handles caching, language changes, and provides a fallback to local i18n resources.
 */
export const useAutoTranslate = (text: string | null | undefined, targetLangOverride?: string) => {
    const { i18n: i18nInstance } = useTranslation();
    const [translatedText, setTranslatedText] = useState<string>(text || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Sync state immediately when input text or language switch occurs
    useEffect(() => {
        if (text) setTranslatedText(text);
    }, [text, targetLangOverride]);

    // Get primary language code (e.g., 'en-US' -> 'en')
    const getTargetLang = () => {
        const fullLang = targetLangOverride || i18nInstance.language || 'ko';
        return fullLang.split('-')[0];
    };

    const targetLang = getTargetLang();

    // Mapping for prompt quality - 21 supported languages in i18n/index.ts
    const langNames: Record<string, string> = {
        'en': 'English',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'ru': 'Russian',
        'pt': 'Portuguese',
        'nl': 'Dutch',
        'pl': 'Polish',
        'sv': 'Swedish',
        'ar': 'Arabic',
        'tr': 'Turkish',
        'fa': 'Persian (Farsi)',
        'he': 'Hebrew',
        'vi': 'Vietnamese',
        'th': 'Thai',
        'id': 'Indonesian',
        'hi': 'Hindi',
        'ko': 'Korean'
    };

    const targetLangName = langNames[targetLang] || targetLang;

    useEffect(() => {
        const translate = async () => {
            if (!text || !text.trim()) {
                setTranslatedText(text || '');
                return;
            }

            // 0. Skip if text is already in target language (very basic check)
            if (targetLang === 'en' && !/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text) && !/[ぁ-んァ-ヶ]/.test(text)) {
                // Input is likely already English
                setTranslatedText(text);
                return;
            }

            if (targetLang === 'ko' && /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
                // Input is likely already Korean
                setTranslatedText(text);
                return;
            }

            // Check translation cache
            const cacheKey = `${text}_${targetLang}`;
            if (translationCache.has(cacheKey)) {
                setTranslatedText(translationCache.get(cacheKey)!);
                return;
            }

            // 1단계: i18n 리소스 역조회로 번역 시도
            const localTranslated = findTranslationByKoreanValue(text, targetLang);
            if (localTranslated) {
                translationCache.set(cacheKey, localTranslated);
                setTranslatedText(localTranslated);
                return;
            }

            // 2단계: Gemini AI를 통한 실시간 번역
            setIsLoading(true);
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

                if (!apiKey) {
                    console.warn('[AutoTranslate] No API Key provided. AI Translation skipped.');
                    setIsLoading(false);
                    return;
                }

                const ai = new GoogleGenAI({
                    apiKey,
                    apiVersion: 'v1'
                });

                const prompt = `Translate the following short product title to ${targetLangName}. 
                Output ONLY the translated text without any quotes or explanations.
                If the text is already in ${targetLangName}, return it exactly as is.
                Text: ${text}`;

                // Try Gemini 2.0 Flash first, then 1.5 Flash as fallback
                let translated = '';
                try {
                    const response: any = await ai.models.generateContent({
                        model: 'gemini-2.0-flash',
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    });
                    
                    // The SDK uses a getter for .text
                    translated = response.text;
                } catch (e) {
                    console.warn('[AutoTranslate] Gemini 2.0 failed, trying 1.5:', e);
                    const response: any = await ai.models.generateContent({
                        model: 'gemini-1.5-flash',
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    });
                    translated = response.text;
                }

                if (translated) {
                    const finalResult = translated.trim().replace(/^["']|["']$/g, '');
                    translationCache.set(cacheKey, finalResult);
                    setTranslatedText(finalResult);
                } else {
                    throw new Error('Empty response from AI');
                }
            } catch (error) {
                console.error('[AutoTranslate] AI Translation failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        translate();
    }, [text, i18nInstance.language, targetLangOverride]);

    return { translatedText, isLoading };
};

