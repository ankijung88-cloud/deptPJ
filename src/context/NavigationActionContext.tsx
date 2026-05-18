import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationActionContextType {
    action: React.ReactNode;
    setAction: (element: React.ReactNode) => void;
    breadcrumbTitle: string | null;
    setBreadcrumbTitle: (title: string | null) => void;
    isImmersive: boolean;
    setIsImmersive: (value: boolean) => void;
    isMeeting: boolean;
    setIsMeeting: (value: boolean) => void;
    isUiVisible: boolean;
    resetUiTimer: () => void;
    breadcrumbPath: any[];
    setBreadcrumbPath: (path: any[]) => void;
}

const NavigationActionContext = createContext<NavigationActionContextType | undefined>(undefined);

export const NavigationActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [action, setAction] = useState<React.ReactNode>(null);
    const [breadcrumbTitle, setBreadcrumbTitle] = useState<string | null>(null);
    const [isImmersive, setIsImmersive] = useState(false);
    const [isMeeting, setIsMeeting] = useState(false);
    const [isUiVisible, setIsUiVisible] = useState(true);
    const [breadcrumbPath, setBreadcrumbPath] = useState<any[]>([]);
    const uiTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const resetUiTimer = () => {
        setIsUiVisible(true);
        if (uiTimerRef.current) clearTimeout(uiTimerRef.current);
        uiTimerRef.current = setTimeout(() => {
            setIsUiVisible(false);
        }, 7000);
    };

    useEffect(() => {
        // Initial timer
        resetUiTimer();

        const handleActivity = () => {
            resetUiTimer();
        };

        // Standard activity events
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        return () => {
            if (uiTimerRef.current) clearTimeout(uiTimerRef.current);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
        };
    }, []);

    return (
        <NavigationActionContext.Provider value={{ 
            action, setAction, 
            breadcrumbTitle, setBreadcrumbTitle,
            isImmersive, setIsImmersive,
            isMeeting, setIsMeeting,
            isUiVisible, resetUiTimer,
            breadcrumbPath, setBreadcrumbPath
        }}>
            {children}
        </NavigationActionContext.Provider>
    );
};

/**
 * Hook for pages to set a custom action (like a back button) in the breadcrumbs bar.
 */
export const useSetNavigationAction = (element: React.ReactNode) => {
    const context = useContext(NavigationActionContext);
    if (!context) return;

    useEffect(() => {
        context.setAction(element);
        return () => context.setAction(null);
    }, [element, context.setAction]);
};

/**
 * Hook for pages to set a dynamic breadcrumb title (e.g., for detail pages).
 */
export const useSetBreadcrumbTitle = (title: string | null) => {
    const context = useContext(NavigationActionContext);
    if (!context) return;

    useEffect(() => {
        context.setBreadcrumbTitle(title);
        return () => context.setBreadcrumbTitle(null);
    }, [title, context.setBreadcrumbTitle]);
};

/**
 * Hook for pages to set immersive mode (hides header/footer).
 */
export const useImmersiveMode = (isImmersive: boolean) => {
    const context = useContext(NavigationActionContext);
    if (!context) return;

    useEffect(() => {
        context.setIsImmersive(isImmersive);
        return () => context.setIsImmersive(false);
    }, [isImmersive, context.setIsImmersive]);
};

/**
 * Hook for pages to set meeting mode flag.
 */
export const useMeetingMode = (isMeeting: boolean) => {
    const context = useContext(NavigationActionContext);
    if (!context) return;

    useEffect(() => {
        context.setIsMeeting(isMeeting);
        return () => context.setIsMeeting(false);
    }, [isMeeting, context.setIsMeeting]);
};

/**
 * Hook for pages to set a canonical breadcrumb path.
 */
export const useSetBreadcrumbPath = (path: any[]) => {
    const context = useContext(NavigationActionContext);
    if (!context) return;

    // Sanitize path for dependency tracking to avoid circular JSON errors on React Elements (e.g. <AutoTranslatedText />)
    const pathKey = JSON.stringify(path.map(p => ({
        id: p.id,
        type: p.type,
        label: typeof p.label === 'string' ? p.label : ''
    })));

    useEffect(() => {
        context.setBreadcrumbPath(path);
        return () => context.setBreadcrumbPath([]);
    }, [pathKey, context.setBreadcrumbPath]);
};

/**
 * Hook for the Breadcrumbs component to retrieve the current state.
 */
export const useNavigationState = () => {
    const context = useContext(NavigationActionContext);
    return {
        action: context?.action || null,
        breadcrumbTitle: context?.breadcrumbTitle || null,
        isImmersive: context?.isImmersive || false,
        setIsImmersive: context?.setIsImmersive || (() => {}),
        isMeeting: context?.isMeeting || false,
        setIsMeeting: context?.setIsMeeting || (() => {}),
        isUiVisible: context?.isUiVisible ?? true,
        resetUiTimer: context?.resetUiTimer || (() => {}),
        breadcrumbPath: context?.breadcrumbPath || []
    };
};
