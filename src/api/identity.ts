import type {
    AuthResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    UpdateCredentialsRequest,
    UpdateProfileRequest,
    UserProfile,
} from '@/types';

import api from './client';

const BASE = '/api/identity';

export const authApi = {
    register: (data: RegisterRequest) =>
        api.post<AuthResponse>(`${BASE}/auth/register`, data),

    login: (data: LoginRequest) =>
        api.post<AuthResponse>(`${BASE}/auth/login`, data),

    refresh: (data: RefreshTokenRequest) =>
        api.post<AuthResponse>(`${BASE}/auth/refresh`, data),
};

export const usersApi = {
    getProfile: () =>
        api.get<UserProfile>(`${BASE}/users/me`),

    updateProfile: (data: UpdateProfileRequest) =>
        api.put<UserProfile>(`${BASE}/users/me`, data),

    updateCredentials: (data: UpdateCredentialsRequest) =>
        api.put(`${BASE}/users/me/credentials`, data),

    deleteAccount: () =>
        api.delete(`${BASE}/users/me`),

    getById: (id: string) =>
        api.get<UserProfile>(`${BASE}/users/${id}`),
};
