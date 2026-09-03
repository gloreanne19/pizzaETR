import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/jwt';
import { CategoryRepository } from '@/server/repositories/category-repo';
import { sanitizeString } from '@/validation/common-schema';

export async function GET() {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const categoriesDetailed = await CategoryRepository.getAllDetailed();
    const categories = categoriesDetailed.map((c) => c.name);

    return NextResponse.json({
      status: 'success',
      data: {
        categories,
        categoriesDetailed,
      },
    });
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

    const body = await req.json();
    const name = sanitizeString(body?.name);
    const defaultOptions = body?.default_options ? JSON.stringify(body.default_options) : null;

    if (!name) {
      return NextResponse.json({ status: 'error', message: 'Category name is required' }, { status: 400 });
    }

    const success = await CategoryRepository.create(name, undefined, defaultOptions || undefined);
    if (!success) {
      return NextResponse.json({ status: 'error', message: 'Failed to create category' }, { status: 400 });
    }

    const categoriesDetailed = await CategoryRepository.getAllDetailed();
    return NextResponse.json({ status: 'success', message: 'Category added to database', data: { categoriesDetailed } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const name = sanitizeString(body?.name);
    const defaultOptions = body?.default_options ? (typeof body.default_options === 'string' ? body.default_options : JSON.stringify(body.default_options)) : null;

    if (!name) {
      return NextResponse.json({ status: 'error', message: 'Category name is required' }, { status: 400 });
    }

    const success = await CategoryRepository.updateDefaultOptions(name, defaultOptions);
    if (!success) {
      return NextResponse.json({ status: 'error', message: 'Failed to update category template' }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: `Customization template for "${name}" updated!` });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSession = getAdminSessionFromCookies();
    if (!adminSession) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ status: 'error', message: 'Category name is required' }, { status: 400 });
    }

    if (name.toLowerCase() === 'pizza') {
      return NextResponse.json({ status: 'error', message: 'Default Pizza category cannot be deleted' }, { status: 400 });
    }

    const success = await CategoryRepository.delete(name);
    return NextResponse.json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}
