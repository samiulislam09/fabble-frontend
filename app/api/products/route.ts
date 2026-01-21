
import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/products';

export async function GET() {
    try {
        const products = await getProducts();
        if (!products) {
            return NextResponse.json({ products: [] }, { status: 500 });
        }
        return NextResponse.json(products.products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
