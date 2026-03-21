import { useState, useEffect } from 'react';

/**
 * Hook to manage admin authentication state consistently across the app.
 */
export const useAdmin = () => {
    const [auth, setAuth] = useState<{
        isAuthenticated: boolean;
        role: 'admin' | 'agency' | null;
        user: any | null;
    }>(() => {
        const token = sessionStorage.getItem('admin_token');
        const userStr = sessionStorage.getItem('admin_user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        const isValidToken = !!(token && (token.startsWith('mock-admin-token-') || token.startsWith('mock-agency-token-')));
        
        return {
            isAuthenticated: isValidToken,
            role: user?.role || null,
            user: user
        };
    });

    const checkAdmin = () => {
        const token = sessionStorage.getItem('admin_token');
        const userStr = sessionStorage.getItem('admin_user');
        const user = userStr ? JSON.parse(userStr) : null;

        const isValidToken = !!(token && (token.startsWith('mock-admin-token-') || token.startsWith('mock-agency-token-')));
        
        setAuth({
            isAuthenticated: isValidToken,
            role: user?.role || null,
            user: user
        });
    };

    useEffect(() => {
        checkAdmin();
        window.addEventListener('storage', checkAdmin);
        window.addEventListener('admin-state-change', checkAdmin);
        return () => {
            window.removeEventListener('storage', checkAdmin);
            window.removeEventListener('admin-state-change', checkAdmin);
        };
    }, []);

    const logout = () => {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        setAuth({ isAuthenticated: false, role: null, user: null });
        window.dispatchEvent(new Event('admin-state-change'));
    };

    const login = (token: string, user: any) => {
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('admin_user', JSON.stringify(user));
        setAuth({ isAuthenticated: true, role: user.role, user: user });
        window.dispatchEvent(new Event('admin-state-change'));
    };

    return { 
        isAdmin: auth.isAuthenticated && auth.role === 'admin', 
        isAgency: auth.isAuthenticated && auth.role === 'agency',
        isAuthenticated: auth.isAuthenticated,
        role: auth.role,
        user: auth.user,
        logout, 
        login, 
        checkAdmin 
    };
};
