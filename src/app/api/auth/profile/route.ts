import { NextRequest, NextResponse } from 'next/server';
import { getUserSessionFromCookies } from '@/lib/jwt';
import { UserRepository } from '@/server/repositories/user-repo';
import { AuthService } from '@/server/services/auth-service';
import { OrderService } from '@/server/services/order-service';

export async function GET(req: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const [user, orders] = await Promise.all([
      UserRepository.findById(session.id),
      OrderService.getUserOrders(session.id),
    ]);

    if (!user) {
      return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address || '',
          number: user.number || '',
        },
        orders,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getUserSessionFromCookies();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const address = String(body.address || '').trim();
    const number = String(body.number || '').trim();
    const oldPassword = body.oldPassword ? String(body.oldPassword) : undefined;
    const newPassword = body.newPassword ? String(body.newPassword) : undefined;

    if (!name) {
      return NextResponse.json({ status: 'error', message: 'Name cannot be empty' }, { status: 400 });
    }

    const result = await AuthService.updateUserProfile(session.id, {
      name,
      address,
      number,
      oldPassword,
      newPassword,
    });

    if (!result.success) {
      return NextResponse.json({ status: 'error', message: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success', message: result.message, data: { session: result.session } });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Server error' }, { status: 500 });
  }
}

