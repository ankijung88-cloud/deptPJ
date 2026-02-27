import React from 'react';
import { useAutoTranslate } from '../../hooks/useAutoTranslate';

interface AutoTranslatedTextProps {
    text: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
    verticalRotateHyphen?: boolean;
}

export const AutoTranslatedText: React.FC<AutoTranslatedTextProps> = ({ text, className, as = 'span', verticalRotateHyphen }) => {
    const { translatedText, isLoading } = useAutoTranslate(text);
    const Component = as as React.ElementType;

    const renderText = () => {
        if (isLoading) {
            return <span className="opacity-50 animate-pulse">{text}</span>;
        }

        if (verticalRotateHyphen && typeof translatedText === 'string' && translatedText.includes('-')) {
            const parts = translatedText.split('-');
            return (
                <>
                    {parts.map((part, i) => (
                        <React.Fragment key={i}>
                            {part}
                            {i < parts.length - 1 && (
                                <span className="inline-block rotate-90" style={{ transformOrigin: 'center', margin: '2px 0' }}>
                                    -
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </>
            );
        }

        return translatedText;
    };

    return (
        <Component className={className}>
            {renderText()}
        </Component>
    );
};
