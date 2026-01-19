import { getRequest } from './apiRoute';

export interface Category {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    sortOrder: number;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
    parent: Category | null;
    children: Category[];
    _count: {
        products: number;
    };
}

export interface CategoriesResponse {
    categories: Category[];
    pagination: {
        current: number;
        total: number;
        count: number;
    };
}

export const getCategories = async (): Promise<CategoriesResponse | undefined> => {
    const apiUrl = process.env.APP_API_URL;
    const baseUrl = apiUrl?.startsWith('http') ? apiUrl : `http://${apiUrl}`;

    if (!apiUrl) {
        console.error('APP_API_URL is not defined in environment variables');
        return undefined;
    }

    const url = `${baseUrl}/categories`;

    try {
        const response = await getRequest<CategoriesResponse>(url);
        // Assuming the API returns the exact shape of CategoriesResponse
        return response as unknown as CategoriesResponse;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return undefined;
    }
};
