import type { SearchPagedResponse, SearchRequest } from '@/types';

import api from './client';

const BASE = '/api/search';

export const searchApi = {
    search: (data: SearchRequest) =>
        api.get<SearchPagedResponse>(BASE, { params: data }),
};
