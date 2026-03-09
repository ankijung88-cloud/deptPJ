import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI } from '@google/genai';

const translationCache = new Map<string, string>();

/**
 * Custom hook to automatically translate text using Google Gemini AI.
 * It handles caching, language changes, and provides a fallback to original text.
 */
export const useAutoTranslate = (text: string | null | undefined) => {
    const { i18n } = useTranslation();
    const [translatedText, setTranslatedText] = useState<string>(text || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const translate = async () => {
            if (!text || !text.trim()) {
                setTranslatedText(text || '');
                return;
            }

            const targetLang = i18n.language || 'ko';
            const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

            // Optimization: Skip translation if the text is already in the target language
            if ((targetLang === 'ko' && hasKorean) || (targetLang === 'en' && !hasKorean)) {
                setTranslatedText(text);
                return;
            }

            // Check translation cache
            const cacheKey = `${text}_${targetLang}`;
            if (translationCache.has(cacheKey)) {
                setTranslatedText(translationCache.get(cacheKey)!);
                return;
            }

            setIsLoading(true);

            try {
                const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
                if (!apiKey) throw new Error('API Key Missing');

                const ai = new GoogleGenAI({ apiKey });

                const prompt = `Translate the following text to ${targetLang}. 
                Output ONLY the translated text without any quotes or explanations.
                Text: ${text}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-3.1-pro-preview',
                    contents: prompt,
                });
                const translated = response.text?.trim();

                if (translated) {
                    translationCache.set(cacheKey, translated);
                    setTranslatedText(translated);
                }
            } catch (error) {
                console.warn('[AutoTranslate] Error:', error);

                // Final fallback: try gemini-1.5-flash if 2.0 fails
                try {
                    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
                    const ai = new GoogleGenAI({ apiKey: apiKey! });
                    const response = await ai.models.generateContent({
                        model: 'gemini-1.5-flash',
                        contents: `Translate to ${targetLang}: ${text}`,
                    });
                    const translated = response.text?.trim();
                    if (translated) {
                        translationCache.set(cacheKey, translated);
                        setTranslatedText(translated);
                        return;
                    }
                } catch (e2) {
                    // All AI attempts failed, stay with original
                }
                setTranslatedText(text);
            } finally {
                setIsLoading(false);
            }
        };

        translate();
    }, [text, i18n.language]);

    return { translatedText, isLoading };
};
