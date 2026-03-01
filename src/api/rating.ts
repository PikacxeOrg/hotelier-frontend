import type {
    CreateRatingRequest,
    RatingResponse,
    RatingSummaryResponse,
    UpdateRatingRequest,
} from '@/types';

import api from './client';

const BASE = '/api/ratings';

export const ratingApi = {
    getByTarget: (targetId: string, targetType?: string) =>
        api.get<RatingResponse[]>(`${BASE}/target/${targetId}`, {
            params: targetType ? { targetType } : undefined,
        }),

    getSummary: (targetId: string, targetType?: string) =>
        api.get<RatingSummaryResponse>(`${BASE}/target/${targetId}/summary`, {
            params: targetType ? { targetType } : undefined,
        }),

    getById: (id: string) =>
        api.get<RatingResponse>(`${BASE}/${id}`),

    getMine: () =>
        api.get<RatingResponse[]>(`${BASE}/mine`),

    create: (data: CreateRatingRequest) =>
        api.post<RatingResponse>(BASE, data),

    update: (id: string, data: UpdateRatingRequest) =>
        api.put<RatingResponse>(`${BASE}/${id}`, data),

    delete: (id: string) =>
        api.delete(`${BASE}/${id}`),
};
