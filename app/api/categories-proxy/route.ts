import { getCategories } from '@/lib/categories';
import { NextResponse } from 'next/server';

export async function GET() {
    const categoriesResponse = await getCategories();

    if (!categoriesResponse) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    return NextResponse.json(categoriesResponse.categories);
}
