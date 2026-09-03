import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/server/services/product-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const price = searchParams.get('price') || undefined;
    const category = searchParams.get('category') || undefined;

    const { products, categories } = await ProductService.getProducts(search, price, category, false);
    return NextResponse.json({ status: 'success', data: { products, categories } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
