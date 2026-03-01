// -- Notification-service types --------------------------

export interface NotificationResponse {
    id: string;
    from: string;
    to: string;
    topic: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationPagedResponse {
    items: NotificationResponse[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface UpdatePreferencesRequest {
    preferences: Record<string, boolean>;
}

export interface NotificationPreferencesResponse {
    userId: string;
    preferences: Record<string, boolean>;
}
