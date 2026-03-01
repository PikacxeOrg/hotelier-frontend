import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts";

import LoadingScreen from "./LoadingScreen";

interface Props {
    children: React.ReactNode;
}

/**
 * Wraps routes that require authentication.
 * Redirects to /login if not authenticated.
 */
export default function ProtectedRoute({ children }: Props) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <LoadingScreen />;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
