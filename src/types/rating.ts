// -- Rating-service types --------------------------------

export const RatingTargetType = {
    Host: 'Host',
    Accommodation: 'Accommodation',
} as const;
export type RatingTargetType = (typeof RatingTargetType)[keyof typeof RatingTargetType];

export interface CreateRatingRequest {
    targetId: string;
    targetType: RatingTargetType;
    score: number;
    comment?: string;
}

export interface UpdateRatingRequest {
    score?: number;
    comment?: string;
}

export interface RatingResponse {
    id: string;
    guestId: string;
    targetId: string;
    targetType: RatingTargetType;
    score: number;
    comment?: string;
    createdTimestamp: string;
    modifiedTimestamp: string;
}

export interface RatingSummaryResponse {
    targetId: string;
    averageScore: number;
    totalRatings: number;
}
