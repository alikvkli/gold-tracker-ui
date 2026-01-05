import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../lib/axiosBaseQuery';

// Define types based on detailed analysis of existing code
export interface Currency {
    id: number;
    code: string;
    name: string;
    type: string;
    buying: string;
    selling: string;
    last_updated_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Asset {
    id: number;
    currency_id: number;
    type: 'buy' | 'sell';
    amount: string;
    price: string;
    date: string;
    place: string | null;
    note: string | null;
    currency: {
        id: number;
        name: string;
        code: string;
        type: string;
    };
}

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface GetAssetsResponse {
    data: Asset[];
    pagination: Pagination;
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery({ baseUrl: '' }), // baseUrl handled by axios instance
    tagTypes: ['Assets', 'Currencies'],
    endpoints: (builder) => ({
        getAssets: builder.query<GetAssetsResponse, { page: number }>({
            query: ({ page }) => ({
                url: `/assets?page=${page}`,
                method: 'GET',
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Assets' as const, id })),
                        { type: 'Assets', id: 'LIST' },
                    ]
                    : [{ type: 'Assets', id: 'LIST' }],
        }),
        getAllAssets: builder.query<Asset[], void>({
            query: () => ({
                url: '/assets?per_page=10000',
                method: 'GET',
            }),
            transformResponse: (response: { data: Asset[] }) => response.data,
            providesTags: ['Assets'],
        }),
        getCurrencies: builder.query<Currency[], void>({
            query: () => ({
                url: '/currencies',
                method: 'GET',
            }),
            providesTags: ['Currencies'],
        }),
        addAsset: builder.mutation<Asset, Partial<Asset>>({
            query: (body) => ({
                url: '/assets',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: [{ type: 'Assets', id: 'LIST' }, 'Assets'],
        }),
        updateAsset: builder.mutation<Asset, { id: number; data: Partial<Asset> }>({
            query: ({ id, data }) => ({
                url: `/assets/${id}`,
                method: 'POST', // Using POST with _method: 'PUT' as per existing code
                data: { ...data, _method: 'PUT' },
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Assets', id }, { type: 'Assets', id: 'LIST' }, 'Assets'],
        }),
        deleteAsset: builder.mutation<void, number>({
            query: (id) => ({
                url: `/assets/${id}`,
                method: 'POST', // Using POST with _method: 'DELETE' as per existing code
                data: { _method: 'DELETE' },
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Assets', id }, { type: 'Assets', id: 'LIST' }, 'Assets'],
        }),
    }),
});

export const {
    useGetAssetsQuery,
    useGetAllAssetsQuery,
    useGetCurrenciesQuery,
    useAddAssetMutation,
    useUpdateAssetMutation,
    useDeleteAssetMutation,
} = apiSlice;
