import { getRequest } from './apiRoute';

export interface BlogAuthor {
    id: number;
    name: string;
}

export interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    publishedAt: string | null;
    readingTime: number | null;
    tags: string[];
    author: BlogAuthor;
}

export interface BlogsResponse {
    data: {
        blogs: Blog[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalCount: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}

export const getBlogs = async (limit: number = 3): Promise<Blog[]> => {
    const apiUrl = process.env.APP_API_URL;
    const baseUrl = apiUrl?.startsWith('http') ? apiUrl : `http://${apiUrl}`;

    if (!apiUrl) {
        console.error('APP_API_URL is not defined in environment variables');
        return [];
    }

    const url = `${baseUrl}/blogs?limit=${limit}`;

    try {
        const response = await getRequest<BlogsResponse>(url);
        // Backend router returns { success: true, data: { blogs, pagination } }
        return (response as unknown as BlogsResponse)?.data?.blogs || [];
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
        return [];
    }
};
