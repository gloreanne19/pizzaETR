import { FavoriteRepository } from '../repositories/favorite-repo';
import { ProductRepository } from '../repositories/product-repo';
import { Favorite } from '../db/schema';

export class FavoriteService {
  static async getFavorites(userId: number): Promise<Favorite[]> {
    return FavoriteRepository.getByUserId(userId);
  }

  static async toggleFavorite(userId: number, productId: number): Promise<{ success: boolean; message: string; action: 'added' | 'removed' }> {
    const existing = await FavoriteRepository.find(userId, productId);

    if (existing) {
      await FavoriteRepository.remove(userId, productId);
      return { success: true, message: 'Removed from favorites', action: 'removed' };
    }

    const product = await ProductRepository.findById(productId);
    if (!product) {
      return { success: false, message: 'Product not found', action: 'removed' };
    }

    await FavoriteRepository.add(userId, productId, product.name, product.price, product.image);
    return { success: true, message: 'Added to favorites!', action: 'added' };
  }
}

