import type {
    CreateReservationRequest,
    ReservationResponse,
} from '@/types';

import api from './client';

const BASE = '/api/reservations';

export const reservationApi = {
    getMyReservations: (status?: string) =>
        api.get<ReservationResponse[]>(`${BASE}/mine`, { params: status ? { status } : undefined }),

    getHostReservations: (status?: string) =>
        api.get<ReservationResponse[]>(`${BASE}/host`, { params: status ? { status } : undefined }),

    getById: (id: string) =>
        api.get<ReservationResponse>(`${BASE}/${id}`),

    create: (data: CreateReservationRequest) =>
        api.post<ReservationResponse>(BASE, data),

    delete: (id: string) =>
        api.delete(`${BASE}/${id}`),

    approve: (id: string) =>
        api.put(`${BASE}/${id}/approve`),

    reject: (id: string, reason?: string) =>
        api.put(`${BASE}/${id}/reject`, { reason }),

    cancel: (id: string) =>
        api.put(`${BASE}/${id}/cancel`),

    getGuestHistory: (guestId: string) =>
        api.get<{ guestId: string; totalReservations: number; cancelledReservations: number }>(
            `${BASE}/guest-history/${guestId}`,
        ),

    getBookedRanges: (accommodationId: string) =>
        api.get<{ fromDate: string; toDate: string }[]>(`${BASE}/booked`, {
            params: { accommodationId },
        }),
};
