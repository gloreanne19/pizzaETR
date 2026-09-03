import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { ProductService } from '@/server/services/product-service';
import { validateProductInput } from '@/validation/product-schema';
import { saveUploadedFile } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const { products, categories } = await ProductService.getProducts(search, undefined, category, true); // true = include inactive for admin

    return NextResponse.json({ status: 'success', data: { products, categories } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const name = formData.get('name');
    const category = formData.get('category');
    const price = formData.get('price');
    const status = formData.get('status');
    const has_customizations = formData.get('has_customizations') === 'true' || formData.get('has_customizations') === '1';
    const customization_options = formData.get('customization_options') as string | null;
    const description = formData.get('description');
    const imageFile = formData.get('image') as File | null;

    const validation = validateProductInput({ name, category, price, status, has_customizations, customization_options, description });
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ status: 'error', message: validation.error }, { status: 400 });
    }

    if (!imageFile) {
      return NextResponse.json({ status: 'error', message: 'Product image is required' }, { status: 400 });
    }

    const imageFilename = await saveUploadedFile(imageFile, 'uploaded_img');
    const result = await ProductService.createProduct({
      ...validation.data,
      image: imageFilename,
    });

    return NextResponse.json({ status: 'success', message: result.message, data: { productId: result.productId } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
