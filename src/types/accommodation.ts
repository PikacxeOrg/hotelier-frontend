// -- Accommodation-service types -------------------------

export interface CreateAccommodationRequest {
    name: string;
    location: string;
    amenities: string[];
    minGuests: number;
    maxGuests: number;
    autoApproval: boolean;
}

export interface UpdateAccommodationRequest {
    name?: string;
    location?: string;
    amenities?: string[];
    minGuests?: number;
    maxGuests?: number;
    autoApproval?: boolean;
}

export interface AccommodationResponse {
    id: string;
    name: string;
    location: string;
    amenities: string[];
    pictures: string[];
    minGuests: number;
    maxGuests: number;
    hostId: string;
    autoApproval: boolean;
}
