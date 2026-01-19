import { getRequest } from './apiRoute';

export interface ProductDimensions {
  width: number;
  height: number;
  length: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  description: string;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBrand {
  id: number;
  name: string;
  description: string;
  logo: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  comparePrice: string | null;
  costPrice: string;
  sku: string;
  barcode: string;
  weight: string;
  dimensions: ProductDimensions;
  isActive: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[];
  images: string[];
  categoryId: number;
  brandId: number;
  createdAt: string;
  updatedAt: string;
  category: ProductCategory;
  brand: ProductBrand;
  variants: any[];
  _count: {
    variants: number;
  };
}

export interface Pagination {
  current: number;
  total: number;
  count: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export const getProducts = async (): Promise<ProductsResponse | undefined> => {
  const apiUrl = process.env.APP_API_URL;
  const baseUrl = apiUrl?.startsWith('http') ? apiUrl : `http://${apiUrl}`;

  // Fallback if env not set
  if (!apiUrl) {
    console.error('APP_API_URL is not defined in environment variables');
    return undefined;
  }

  const url = `${baseUrl}/products`;

  try {
    // The getRequest returns the response body directly which matches ProductsResponse structure
    const response = await getRequest<ProductsResponse>(url);
    // Cast to unknown first if strict type checking complains about proper ApiResponse shape
    // Based on user request, we assume the API returns the JSON structure comprising products and pagination
    return response as unknown as ProductsResponse;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return undefined;
  }
};


