import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

const translationCache = new Map<string, string>();

/**
 * i18n 리소스에서 한국어(ko) 값을 역조회하여 해당 i18n 키를 찾고,
 * 현재 언어의 번역 값을 반환합니다. Gemini API 의존 없이 동작합니다.
 */
function findTranslationByKoreanValue(koText: string, targetLang: string): string | null {
    if (!koText || targetLang === 'ko') return null;

    const koResources = i18n.getResourceBundle('ko', 'translation');
    const targetResources = i18n.getResourceBundle(targetLang, 'translation');

    if (!koResources || !targetResources) return null;

    // 재귀적으로 ko 리소스를 탐색하여 값이 일치하는 키 패스를 찾음
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

    // 대상 언어 리소스에서 동일 키 패스로 값 조회
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

export const useAutoTranslate = (text: string | null | undefined) => {
    const { i18n: i18nInstance } = useTranslation();
    const [translatedText, setTranslatedText] = useState<string>(text || '');
    const isLoading = false;
    const prevTextRef = useRef<string | null | undefined>(text);
    const prevLangRef = useRef<string>(i18nInstance.language);

    useEffect(() => {
        const translate = () => {
            if (!text) {
                setTranslatedText('');
                return;
            }

            // 한국어면 그대로 사용
            if (i18nInstance.language === 'ko') {
                setTranslatedText(text);
                return;
            }

            // 캐시 확인
            const cacheKey = `${text}_${i18nInstance.language}`;
            if (translationCache.has(cacheKey)) {
                setTranslatedText(translationCache.get(cacheKey) || text);
                return;
            }

            // i18n 리소스 역조회로 번역 시도
            const translated = findTranslationByKoreanValue(text, i18nInstance.language);
            if (translated) {
                translationCache.set(cacheKey, translated);
                setTranslatedText(translated);
                return;
            }

            // 번역을 찾지 못한 경우 원본 텍스트 사용
            setTranslatedText(text);
        };

        if (text !== prevTextRef.current || i18nInstance.language !== prevLangRef.current) {
            translate();
            prevTextRef.current = text;
            prevLangRef.current = i18nInstance.language;
        }
    }, [text, i18nInstance.language]);

    return { translatedText, isLoading };
};
