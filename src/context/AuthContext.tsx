import React, { createContext, useContext, useEffect, useState } from 'react';

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: 'USER' | 'ADMIN';
    email?: string;
}

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    signIn: (token: string, userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');

                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    // In a real app, we might verify the token here
                    // For now, mapping simplified Profile based on User
                    setProfile({
                        id: parsedUser.id,
                        full_name: parsedUser.name,
                        avatar_url: null,
                        role: parsedUser.role || 'USER',
                        email: parsedUser.email
                    });
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const signIn = (token: string, userData: User) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
        setProfile({
            id: userData.id,
            full_name: userData.name,
            avatar_url: null,
            role: (userData as any).role || 'USER',
            email: userData.email
        });
    };

    const signOut = async () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setProfile(null);
        window.location.href = '/';
    };

    const value = {
        user,
        profile,
        loading,
        isAdmin: profile?.role?.toUpperCase() === 'ADMIN',
        signOut,
        signIn,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
