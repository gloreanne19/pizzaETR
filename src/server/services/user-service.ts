import { UserRepository } from '../repositories/user-repo';
import { CartRepository } from '../repositories/cart-repo';
import { FavoriteRepository } from '../repositories/favorite-repo';
import { OrderRepository } from '../repositories/order-repo';
import { User } from '../db/schema';

export class UserService {
  static async getUserProfileWithStats(userId: number): Promise<{ user: User | null; stats: { cartCount: number; favoritesCount: number; ordersCount: number } }> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      return { user: null, stats: { cartCount: 0, favoritesCount: 0, ordersCount: 0 } };
    }

    const [cart, favorites, orders] = await Promise.all([
      CartRepository.getByUserId(userId),
      FavoriteRepository.getByUserId(userId),
      OrderRepository.getByUserId(userId),
    ]);

    return {
      user,
      stats: {
        cartCount: cart.length,
        favoritesCount: favorites.length,
        ordersCount: orders.length,
      },
    };
  }

  static async getAllUsers(): Promise<User[]> {
    return UserRepository.getAll();
  }

  static async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const deleted = await UserRepository.delete(id);
    if (deleted) {
      return { success: true, message: 'User account and associated cart/favorites deleted' };
    }
    return { success: false, message: 'User not found or already deleted' };
  }
}

