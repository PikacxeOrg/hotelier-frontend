import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { ReactNode } from "react";

import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserProfile,
} from "@/types";
import { authApi, usersApi } from "@/api";

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function storeTokens(res: AuthResponse) {
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshProfile = useCallback(async () => {
        try {
            const { data } = await usersApi.getProfile();
            setUser(data);
        } catch {
            setUser(null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
    }, []);

    // Hydrate on mount
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            refreshProfile().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [refreshProfile]);

    const login = useCallback(async (data: LoginRequest) => {
        const { data: res } = await authApi.login(data);
        storeTokens(res);
        setUser(res.user);
    }, []);

    const register = useCallback(async (data: RegisterRequest) => {
        const { data: res } = await authApi.register(data);
        storeTokens(res);
        setUser(res.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
    }, []);

    const value = useMemo<AuthState>(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            refreshProfile,
        }),
        [user, isLoading, login, register, logout, refreshProfile],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
