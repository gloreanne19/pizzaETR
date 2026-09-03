import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { ProductService } from '@/server/services/product-service';
import { validateProductInput } from '@/validation/product-schema';
import { saveUploadedFile } from '@/lib/storage';
import { ProductStatus } from '@/server/db/schema';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const validation = validateProductInput(body);
      if (!validation.valid || !validation.data) {
        return NextResponse.json({ status: 'error', message: validation.error }, { status: 400 });
      }

      const result = await ProductService.updateProduct(id, validation.data);
      if (!result.success) {
        return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
      }
      return NextResponse.json({ status: 'success', message: result.message });
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

    let imageFilename: string | undefined = undefined;
    if (imageFile && imageFile.size > 0) {
      imageFilename = await saveUploadedFile(imageFile, 'uploaded_img');
    }

    const result = await ProductService.updateProduct(id, {
      ...validation.data,
      image: imageFilename,
    });

    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    const body = await req.json();
    const status = body?.status as ProductStatus;

    if (!status || !['available', 'sold_out', 'unavailable', 'inactive'].includes(status)) {
      return NextResponse.json({ status: 'error', message: 'Invalid product status' }, { status: 400 });
    }

    const result = await ProductService.updateProductStatus(id, status);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    const result = await ProductService.deleteProduct(id);
    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: result.message });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
