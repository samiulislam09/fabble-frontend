import { getRequest } from './apiRoute';

export interface Carousel {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    cta: string;
    image: string;
    link: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CarouselResponse {
    success: boolean;
    data: {
        carousels: Carousel[];
        total: number;
    };
}

export const getCarousels = async (): Promise<Carousel[] | undefined> => {
    const apiUrl = process.env.APP_API_URL;
    const baseUrl = apiUrl?.startsWith('http') ? apiUrl : `http://${apiUrl}`;

    if (!apiUrl) {
        console.error('APP_API_URL is not defined in environment variables');
        return undefined;
    }

    const url = `${baseUrl}/carousels/public`;

    try {
        const response = await getRequest<CarouselResponse>(url);
        // The API uses a standard success/data structure wrapper
        // Check if response has success: true or access data directly depending on how getRequest behaves (it returns .data usually)
        // Based on previous files, getRequest returns response.data directly.
        // So response here IS the object { success: true, data: { ... } }

        // Let's cast to unknown first to be safe
        const res = response as unknown as CarouselResponse;
        return res?.data?.carousels;
    } catch (error) {
        console.error('Failed to fetch carousels:', error);
        return undefined;
    }
};
