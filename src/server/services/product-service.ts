import { ProductRepository } from '../repositories/product-repo';
import { Product, ProductStatus } from '../db/schema';

export class ProductService {
  static async getProducts(
    search?: string,
    priceTier?: string,
    category?: string,
    includeInactive: boolean = false
  ): Promise<{ products: Product[]; categories: string[] }> {
    const [products, categories] = await Promise.all([
      ProductRepository.getAll(search, priceTier, category, includeInactive),
      ProductRepository.getCategories(includeInactive),
    ]);
    return { products, categories };
  }

  static async getCategories(includeInactive: boolean = false): Promise<string[]> {
    return ProductRepository.getCategories(includeInactive);
  }

  static async getProductDetails(id: number, includeInactive: boolean = false): Promise<{ product: Product | null }> {
    const product = await ProductRepository.findById(id, includeInactive);
    return { product };
  }

  static async createProduct(data: {
    name: string;
    category?: string;
    price: number;
    status?: ProductStatus;
    has_customizations?: boolean;
    customization_options?: string | null;
    description?: string;
    image: string;
  }): Promise<{ success: boolean; message: string; productId?: number }> {
    const productId = await ProductRepository.create(data);
    return { success: true, message: 'New product added successfully!', productId };
  }

  static async updateProduct(
    id: number,
    data: {
      name: string;
      category?: string;
      price: number;
      status?: ProductStatus;
      has_customizations?: boolean;
      customization_options?: string | null;
      description?: string;
      image?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const updated = await ProductRepository.update(id, data);
    if (updated) {
      return { success: true, message: 'Product updated successfully!' };
    }
    return { success: false, message: 'Product not found or update failed' };
  }

  static async updateProductStatus(id: number, status: ProductStatus): Promise<{ success: boolean; message: string }> {
    const updated = await ProductRepository.updateStatus(id, status);
    if (updated) {
      return { success: true, message: `Product marked as ${status.replace('_', ' ')}!` };
    }
    return { success: false, message: 'Product not found or status update failed' };
  }

  static async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    const deleted = await ProductRepository.delete(id);
    if (deleted) {
      return { success: true, message: 'Product deleted successfully' };
    }
    return { success: false, message: 'Product not found' };
  }
}
