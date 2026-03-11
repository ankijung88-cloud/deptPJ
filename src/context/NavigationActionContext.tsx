import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationActionContextType {
    action: React.ReactNode;
    setAction: (element: React.ReactNode) => void;
}

const NavigationActionContext = createContext<NavigationActionContextType | undefined>(undefined);

export const NavigationActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [action, setAction] = useState<React.ReactNode>(null);

    return (
        <NavigationActionContext.Provider value={{ action, setAction }}>
            {children}
        </NavigationActionContext.Provider>
    );
};

/**
 * Hook for pages to set a custom action (like a back button) in the breadcrumbs bar.
 */
export const useSetNavigationAction = (element: React.ReactNode) => {
    const context = useContext(NavigationActionContext);
    if (!context) {
        // Silently fail if outside provider (optional, depends on architecture)
        return;
    }

    useEffect(() => {
        context.setAction(element);
        return () => context.setAction(null);
    }, [element, context.setAction]);
};

/**
 * Hook for the Breadcrumbs component to retrieve the current navigation action.
 */
export const useGetNavigationAction = () => {
    const context = useContext(NavigationActionContext);
    return context?.action || null;
};
