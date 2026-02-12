import { getRequest } from './apiRoute';

export interface Brand {
    id: number;
    name: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BrandsResponse {
    brands: Brand[];
    pagination: {
        current: number;
        total: number;
        count: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export const getBrands = async (limit: number = 20): Promise<Brand[]> => {
    const apiUrl = process.env.APP_API_URL;
    const baseUrl = apiUrl?.startsWith('http') ? apiUrl : `http://${apiUrl}`;

    if (!apiUrl) {
        console.error('APP_API_URL is not defined in environment variables');
        return [];
    }

    const url = `${baseUrl}/brands?limit=${limit}&isActive=true`;

    try {
        const response = await getRequest<BrandsResponse>(url);
        // The API returns { brands: [...], pagination: {...} } or just [...] depending on implementation. 
        // Based on backend router for /brands (viewed earlier), it calls getAllBrands which likely returns { brands, pagination } or array. 
        // Let's assume standard response based on product pattern.
        return (response as unknown as BrandsResponse)?.brands || [];
    } catch (error) {
        console.error('Failed to fetch brands:', error);
        return [];
    }
};
