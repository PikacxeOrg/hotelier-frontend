export * from './auth';
export * from './accommodation';
export * from './availability';
export * from './reservation';
export * from './rating';
export * from './notification';
export * from './search';
export * from './cdn';

/** Generic paginated response wrapper */
export interface PagedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}
