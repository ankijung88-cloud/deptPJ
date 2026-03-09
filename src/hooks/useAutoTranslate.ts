import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI } from '@google/genai';
import i18n from 'i18next';

const translationCache = new Map<string, string>();

/**
 * i18n 리소스에서 한국어(ko) 값을 역조회하여 해당 i18n 키를 찾고,
 * 현재 언어의 번역 값을 반환합니다.
 */
function findTranslationByKoreanValue(koText: string, targetLang: string): string | null {
    if (!koText || targetLang === 'ko') return null;

    const koResources = i18n.getResourceBundle('ko', 'translation');
    const targetResources = i18n.getResourceBundle(targetLang, 'translation');

    if (!koResources || !targetResources) return null;

    function searchValue(obj: any, target: string, path: string[]): string[] | null {
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (typeof val === 'string') {
                if (val === target) {
                    return [...path, key];
                }
            } else if (typeof val === 'object' && val !== null) {
                const found = searchValue(val, target, [...path, key]);
                if (found) return found;
            }
        }
        return null;
    }

    const keyPath = searchValue(koResources, koText, []);
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
export const useAutoTranslate = (text: string | null | undefined) => {
    const { i18n: i18nInstance } = useTranslation();
    const [translatedText, setTranslatedText] = useState<string>(text || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const translate = async () => {
            if (!text || !text.trim()) {
                setTranslatedText(text || '');
                return;
            }

            const targetLang = i18nInstance.language || 'ko';

            // 한국어면 그대로 사용
            if (targetLang === 'ko') {
                setTranslatedText(text);
                return;
            }

            // Check translation cache
            const cacheKey = `${text}_${targetLang}`;
            if (translationCache.has(cacheKey)) {
                setTranslatedText(translationCache.get(cacheKey)!);
                return;
            }

            // 1단계: i18n 리소스 역조회로 번역 시도 (가장 빠르고 정확함)
            const localTranslated = findTranslationByKoreanValue(text, targetLang);
            if (localTranslated) {
                translationCache.set(cacheKey, localTranslated);
                setTranslatedText(localTranslated);
                return;
            }

            // 2단계: Gemini AI를 통한 실시간 번역
            setIsLoading(true);
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY || 'AIzaSyCTpbR424w2vIVEoab53Ng79k6QJjqQmDM';

                const ai = new GoogleGenAI({ apiKey });

                const prompt = `Translate the following Korean text to ${targetLang}. 
                Output ONLY the translated text without any quotes or explanations.
                Text: ${text}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-1.5-flash', // 안정적인 기본 모델 사용
                    contents: prompt,
                });
                const translated = response.text?.trim();

                if (translated) {
                    translationCache.set(cacheKey, translated);
                    setTranslatedText(translated);
                } else {
                    throw new Error('Empty response from AI');
                }
            } catch (error) {
                console.warn('[AutoTranslate] AI Translation failed, falling back to original:', error);
                setTranslatedText(text);
            } finally {
                setIsLoading(false);
            }
        };

        translate();
    }, [text, i18nInstance.language]);

    return { translatedText, isLoading };
};

