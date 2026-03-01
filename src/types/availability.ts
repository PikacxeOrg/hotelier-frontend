// -- Availability-service types --------------------------

export const PriceType = {
    PerGuest: 'PerGuest',
    PerUnit: 'PerUnit',
} as const;
export type PriceType = (typeof PriceType)[keyof typeof PriceType];

export interface CreateAvailabilityRequest {
    accommodationId: string;
    fromDate: string;
    toDate: string;
    price: number;
    priceType: PriceType;
    priceModifiers: Record<string, number>;
}

export interface UpdateAvailabilityRequest {
    fromDate?: string;
    toDate?: string;
    price?: number;
    priceType?: PriceType;
    priceModifiers?: Record<string, number>;
    isAvailable?: boolean;
}

export interface AvailabilityResponse {
    id: string;
    accommodationId: string;
    fromDate: string;
    toDate: string;
    price: number;
    priceType: PriceType;
    priceModifiers: Record<string, number>;
    isAvailable: boolean;
}
