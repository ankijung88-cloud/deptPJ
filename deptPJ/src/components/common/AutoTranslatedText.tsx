import React from 'react';
import { useAutoTranslate } from '../../hooks/useAutoTranslate';

interface AutoTranslatedTextProps {
    text: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
}

export const AutoTranslatedText: React.FC<AutoTranslatedTextProps> = ({ text, className, as = 'span' }) => {
    const { translatedText, isLoading } = useAutoTranslate(text);
    const Component = as as React.ElementType;

    return (
        <Component className={className}>
            {isLoading ? (
                <span className="opacity-50 animate-pulse">{text}</span>
            ) : (
                translatedText
            )}
        </Component>
    );
};
