// -- Identity-service types ------------------------------

export const UserType = {
    Guest: 'Guest',
    Host: 'Host',
} as const;
export type UserType = (typeof UserType)[keyof typeof UserType];

export interface RegisterRequest {
    username: string;
    password: string;
    name: string;
    lastName: string;
    email: string;
    address: string;
    userType: UserType;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: UserProfile;
}

export interface RefreshTokenRequest {
    accessToken: string;
    refreshToken: string;
}

export interface UserProfile {
    id: string;
    username: string;
    name: string;
    lastName: string;
    email: string;
    address: string;
    userType: UserType;
    notificationPreferences: Record<string, boolean>;
}

export interface UpdateProfileRequest {
    name?: string;
    lastName?: string;
    email?: string;
    address?: string;
}

export interface UpdateCredentialsRequest {
    username?: string;
    newPassword?: string;
    currentPassword: string;
}
