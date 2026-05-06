import React from 'react';
import { useAutoTranslate } from '../../hooks/useAutoTranslate';
import { displayLocalized } from '../../utils/i18nUtils';

interface AutoTranslatedTextProps {
    text: any;
    className?: string;
    as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
    verticalRotateHyphen?: boolean;
}

/**
 * A component that automatically translates its children text using the useAutoTranslate hook.
 * It provides a seamless way to localize hardcoded English strings or dynamic content.
 */
export const AutoTranslatedText: React.FC<AutoTranslatedTextProps> = ({
    text,
    className,
    as: Component = 'span',
    verticalRotateHyphen
}) => {
    const { translatedText, isLoading } = useAutoTranslate(text);
    const Element = Component as React.ElementType;

    const renderText = () => {
        if (isLoading) {
            return <span className="opacity-50 animate-pulse">{displayLocalized(text)}</span>;
        }

        const displayText = translatedText || displayLocalized(text);

        if (verticalRotateHyphen && typeof displayText === 'string' && displayText.includes('-')) {
            const parts = displayText.split('-');
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

        return displayText;
    };

    return (
        <Element className={className}>
            {renderText()}
        </Element>
    );
};
