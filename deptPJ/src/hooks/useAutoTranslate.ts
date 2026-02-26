import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const translationCache = new Map<string, string>();

export const useAutoTranslate = (text: string | null | undefined) => {
    const { i18n } = useTranslation();
    const [translatedText, setTranslatedText] = useState<string>(text || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const prevTextRef = useRef<string | null | undefined>(text);
    const prevLangRef = useRef<string>(i18n.language);

    useEffect(() => {
        const translate = async () => {
            if (!text) {
                setTranslatedText('');
                return;
            }

            // If language is Korean, use original text (assuming source is Korean)
            if (i18n.language === 'ko') {
                setTranslatedText(text);
                return;
            }

            // Check cache
            const cacheKey = `${text}_${i18n.language}`;
            if (translationCache.has(cacheKey)) {
                setTranslatedText(translationCache.get(cacheKey) || text);
                return;
            }

            setIsLoading(true);
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
                if (!apiKey) {
                    console.warn('VITE_GOOGLE_AI_API_KEY is not set');
                    setTranslatedText(text);
                    return;
                }

                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const prompt = `Translate the following text to ${i18n.language}.
                Maintain the original tone and context.
                Return only the translated text.
                
                Text to translate:
                ${text}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const translated = response.text().trim();

                translationCache.set(cacheKey, translated);
                setTranslatedText(translated);
            } catch (error) {
                console.error('Auto-translation failed:', error);
                // Fallback to original text on error
                setTranslatedText(text);
            } finally {
                setIsLoading(false);
            }
        };

        // Trigger translation if text changed or language changed
        if (text !== prevTextRef.current || i18n.language !== prevLangRef.current) {
            translate();
            prevTextRef.current = text;
            prevLangRef.current = i18n.language;
        }
    }, [text, i18n.language]);

    return { translatedText, isLoading };
};
