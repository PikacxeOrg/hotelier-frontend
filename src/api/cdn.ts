import type { AssetMetadata, UploadResponse } from '@/types';

import api from './client';

const BASE = '/api/cdn';

export const cdnApi = {
    upload: (file: File, entityId?: string) => {
        const form = new FormData();
        form.append('files', file);
        if (entityId) form.append('entityId', entityId);
        return api.post<UploadResponse[]>(BASE, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    getMetadata: (assetId: string) =>
        api.get<AssetMetadata>(`${BASE}/${assetId}/metadata`),

    listByEntity: (entityId: string) =>
        api.get<AssetMetadata[]>(`${BASE}/entity/${entityId}`),

    listMine: () =>
        api.get<AssetMetadata[]>(`${BASE}/mine`),

    getUrl: (assetId: string) => `${BASE}/${assetId}`,

    delete: (assetId: string) =>
        api.delete(`${BASE}/${assetId}`),
};
