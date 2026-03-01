import type {
    AccommodationResponse,
    CreateAccommodationRequest,
    UpdateAccommodationRequest,
} from '@/types';

import api from './client';

const BASE = '/api/accommodations';

export const accommodationApi = {
    getAll: (params?: { location?: string; guests?: number; amenity?: string }) =>
        api.get<AccommodationResponse[]>(BASE, { params }),

    getByHost: (hostId: string) =>
        api.get<AccommodationResponse[]>(`${BASE}/host/${hostId}`),

    getMine: () =>
        api.get<AccommodationResponse[]>(`${BASE}/mine`),

    getById: (id: string) =>
        api.get<AccommodationResponse>(`${BASE}/${id}`),

    create: (data: CreateAccommodationRequest) =>
        api.post<AccommodationResponse>(BASE, data),

    update: (id: string, data: UpdateAccommodationRequest) =>
        api.put<AccommodationResponse>(`${BASE}/${id}`, data),

    delete: (id: string) =>
        api.delete(`${BASE}/${id}`),
};
