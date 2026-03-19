import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationActionContextType {
    action: React.ReactNode;
    setAction: (element: React.ReactNode) => void;
    breadcrumbTitle: string | null;
    setBreadcrumbTitle: (title: string | null) => void;
    isImmersive: boolean;
    setIsImmersive: (value: boolean) => void;
    breadcrumbPath: any[];
    setBreadcrumbPath: (path: any[]) => void;
}

const NavigationActionContext = createContext<NavigationActionContextType | undefined>(undefined);

export const NavigationActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [action, setAction] = useState<React.ReactNode>(null);
    const [breadcrumbTitle, setBreadcrumbTitle] = useState<string | null>(null);
    const [isImmersive, setIsImmersive] = useState(false);
    const [breadcrumbPath, setBreadcrumbPath] = useState<any[]>([]);

    return (
        <NavigationActionContext.Provider value={{ 
            action, setAction, 
            breadcrumbTitle, setBreadcrumbTitle,
            isImmersive, setIsImmersive,
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
 * Hook for pages to set a canonical breadcrumb path.
 */
export const useSetBreadcrumbPath = (path: any[]) => {
    const context = useContext(NavigationActionContext);
    if (!context) return;

    useEffect(() => {
        context.setBreadcrumbPath(path);
        return () => context.setBreadcrumbPath([]);
    }, [JSON.stringify(path), context.setBreadcrumbPath]);
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
        breadcrumbPath: context?.breadcrumbPath || []
    };
};
