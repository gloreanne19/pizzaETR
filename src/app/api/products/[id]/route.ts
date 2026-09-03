import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/server/services/product-service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const details = await ProductService.getProductDetails(id);
    if (!details.product) {
      return NextResponse.json({ status: 'error', message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', data: details });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
