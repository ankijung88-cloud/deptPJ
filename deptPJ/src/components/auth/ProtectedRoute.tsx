import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { user, isAdmin, loading } = useAuth();
    const location = useLocation();

    const [showReset, setShowReset] = React.useState(false);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setTimeout(() => setShowReset(true), 3000);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    const handleForceLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-charcoal text-white font-serif">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-dancheong-red border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white/60 mb-4 animate-pulse">Verifying access...</p>
                    {showReset && (
                        <div className="flex flex-col items-center gap-2 animate-fade-in">
                            <p className="text-white/40 text-xs">응답이 지연되고 있습니다.</p>
                            <button
                                onClick={handleForceLogout}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors border border-white/10"
                            >
                                Force Logout (다시 로그인)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        // If they are logged in but not an admin, redirect to home or an "Unauthorized" page
        // For now, redirecting to home.
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
