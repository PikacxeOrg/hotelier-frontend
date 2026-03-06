import type {
    NotificationPagedResponse,
    NotificationPreferencesResponse,
    UpdatePreferencesRequest,
} from '@/types';

import api from './client';

const BASE = '/api/notifications';

export const notificationApi = {
    getAll: (params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) =>
        api.get<NotificationPagedResponse>(BASE, { params }),

    getUnreadCount: () =>
        api.get<{ unreadCount: number }>(`${BASE}/unread-count`),

    markAsRead: (id: string) =>
        api.put(`${BASE}/${id}/read`),

    markAllAsRead: () =>
        api.put<{ markedAsRead: number }>(`${BASE}/read-all`),

    delete: (id: string) =>
        api.delete(`${BASE}/${id}`),

    getPreferences: () =>
        api.get<NotificationPreferencesResponse>(`${BASE}/preferences`),

    updatePreferences: (data: UpdatePreferencesRequest) =>
        api.put<NotificationPreferencesResponse>(`${BASE}/preferences`, data),
};
