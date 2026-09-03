import { NextResponse } from 'next/server';
import { CategoryRepository } from '@/server/repositories/category-repo';

export async function GET() {
  try {
    const categories = await CategoryRepository.getAll();
    return NextResponse.json({ status: 'success', data: { categories } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

