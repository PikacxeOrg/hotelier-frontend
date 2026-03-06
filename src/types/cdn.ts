// -- CDN-service types -----------------------------------

export interface AssetMetadata {
    assetId: string;
    ownerId: string;
    entityId?: string;
    originalFileName: string;
    contentType: string;
    sizeBytes: number;
    uploadedAt: string;
}

export interface UploadResponse {
    assetId: string;
    url: string;
    contentType: string;
    sizeBytes: number;
    uploadedAt: string;
}
