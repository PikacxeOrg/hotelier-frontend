// -- Search-service types --------------------------------

export interface SearchRequest {
    location?: string;
    numberOfGuests?: number;
    checkIn?: string;
    checkOut?: string;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    page: number;
    pageSize: number;
}

export interface SearchResponse {
    accommodationId: string;
    hostId: string;
    name: string;
    location: string;
    amenities: string[];
    pictures: string[];
    minGuests: number;
    maxGuests: number;
    autoApproval: boolean;
    unitPrice?: number;
    totalPrice?: number;
    averageRating: number;
    totalRatings: number;
}

export interface SearchPagedResponse {
    items: SearchResponse[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}
