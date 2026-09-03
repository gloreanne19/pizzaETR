import { CartRepository } from '../repositories/cart-repo';
import { ProductRepository } from '../repositories/product-repo';
import { CartItem, OptionGroup } from '../db/schema';

export class CartService {
  static async getCart(userId: number): Promise<{ items: CartItem[]; grandTotal: number }> {
    const items = await CartRepository.getByUserId(userId);
    const grandTotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    return { items, grandTotal };
  }

  static async addToCart(
    userId: number,
    productId: number,
    quantity: number,
    options?: string | null,
    unitPriceOverride?: number
  ): Promise<{ success: boolean; message: string; cartId?: number }> {
    const product = await ProductRepository.findById(productId);
    if (!product || product.status === 'inactive') {
      return { success: false, message: 'Product not found or unavailable' };
    }

    if (product.status === 'sold_out') {
      return { success: false, message: 'Sorry, this item is currently sold out!' };
    }

    if (product.status === 'unavailable') {
      return { success: false, message: 'Sorry, this item is currently unavailable!' };
    }

    let calculatedUnitPrice = Number(product.price);
    if (unitPriceOverride && unitPriceOverride >= calculatedUnitPrice) {
      calculatedUnitPrice = Number(unitPriceOverride);
    }

    const optionsStr = options?.trim() || null;

    const existing = await CartRepository.findExistingItem(userId, productId, optionsStr);
    if (existing) {
      const newQty = Number(existing.quantity) + Number(quantity);
      await CartRepository.updateQuantity(existing.id, userId, newQty);
      return { success: true, message: 'Item quantity updated in cart!', cartId: existing.id };
    }

    const cartId = await CartRepository.addItem({
      user_id: userId,
      pid: productId,
      name: product.name,
      price: calculatedUnitPrice,
      quantity,
      image: product.image,
      options: optionsStr,
    });

    return { success: true, message: 'Added to cart successfully!', cartId };
  }

  static async updateQuantity(cartId: number, userId: number, quantity: number): Promise<{ success: boolean; message: string }> {
    const updated = await CartRepository.updateQuantity(cartId, userId, quantity);
    if (updated) return { success: true, message: 'Cart quantity updated' };
    return { success: false, message: 'Cart item not found' };
  }

  static async removeItem(cartId: number, userId: number): Promise<{ success: boolean; message: string }> {
    const removed = await CartRepository.removeItem(cartId, userId);
    if (removed) return { success: true, message: 'Item removed from cart' };
    return { success: false, message: 'Cart item not found' };
  }

  static async clearCart(userId: number): Promise<{ success: boolean; message: string }> {
    await CartRepository.clearUserCart(userId);
    return { success: true, message: 'Cart cleared successfully' };
  }
}
