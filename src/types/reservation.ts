// -- Reservation-service types ---------------------------

export const ReservationStatus = {
    Pending: 'Pending',
    Approved: 'Approved',
    Denied: 'Denied',
    Cancelled: 'Cancelled',
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export interface CreateReservationRequest {
    accommodationId: string;
    fromDate: string;
    toDate: string;
    numOfGuests: number;
}

export interface ReservationResponse {
    id: string;
    userId: string;
    accommodationId: string;
    hostId: string;
    fromDate: string;
    toDate: string;
    numOfGuests: number;
    status: ReservationStatus;
    createdTimestamp: string;
}
