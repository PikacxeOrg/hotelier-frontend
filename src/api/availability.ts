import type {
    AvailabilityResponse,
    CreateAvailabilityRequest,
    UpdateAvailabilityRequest,
} from '@/types';

import api from './client';

const BASE = '/api/availability';

export const availabilityApi = {
    getByAccommodation: (accommodationId: string, availableOnly?: boolean) =>
        api.get<AvailabilityResponse[]>(`${BASE}/accommodation/${accommodationId}`, {
            params: availableOnly != null ? { availableOnly } : undefined,
        }),

    getById: (id: string) =>
        api.get<AvailabilityResponse>(`${BASE}/${id}`),

    create: (data: CreateAvailabilityRequest) =>
        api.post<AvailabilityResponse>(BASE, data),

    update: (id: string, data: UpdateAvailabilityRequest) =>
        api.put<AvailabilityResponse>(`${BASE}/${id}`, data),

    delete: (id: string) =>
        api.delete(`${BASE}/${id}`),
};
