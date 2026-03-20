import { useState, useEffect } from 'react';

/**
 * Hook to manage admin authentication state consistently across the app.
 */
export const useAdmin = () => {
    const [isAdmin, setIsAdmin] = useState(() => {
        const token = localStorage.getItem('admin_token');
        return !!(token && token.startsWith('mock-admin-token-'));
    });

    const checkAdmin = () => {
        const token = localStorage.getItem('admin_token');
        // Robust check: token must exist and follow the expected mock prefix for this project.
        if (token && token.startsWith('mock-admin-token-')) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };

    useEffect(() => {
        checkAdmin();
        
        // Listen for changes in other tabs/windows
        window.addEventListener('storage', checkAdmin);
        
        // Custom event for same-tab updates (e.g. after login/logout)
        window.addEventListener('admin-state-change', checkAdmin);
        
        return () => {
            window.removeEventListener('storage', checkAdmin);
            window.removeEventListener('admin-state-change', checkAdmin);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setIsAdmin(false);
        // Trigger event for common components
        window.dispatchEvent(new Event('admin-state-change'));
    };

    const login = (token: string, user?: any) => {
        localStorage.setItem('admin_token', token);
        if (user) localStorage.setItem('admin_user', JSON.stringify(user));
        setIsAdmin(true);
        window.dispatchEvent(new Event('admin-state-change'));
    };

    return { isAdmin, logout, login, checkAdmin };
};
