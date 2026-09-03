import { query } from '../db';
import { Product, ProductStatus } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';
import { CategoryRepository } from './category-repo';

export class ProductRepository {
  static async getAll(
    search?: string,
    priceTier?: string,
    category?: string,
    includeInactive: boolean = false
  ): Promise<Product[]> {
    await ensureDatabaseSchema();

    try {
      let sql = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (!includeInactive) {
        sql += " AND (status != 'inactive' OR status IS NULL)";
      }

      if (category && category.toLowerCase() !== 'all') {
        sql += ' AND LOWER(category) = LOWER(?)';
        params.push(category);
      }

      if (search) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (priceTier === '200') {
        sql += ' AND price < 200';
      } else if (priceTier === '400') {
        sql += ' AND price BETWEEN 200 AND 400';
      } else if (priceTier === '600') {
        sql += ' AND price BETWEEN 400 AND 600';
      } else if (priceTier === '601') {
        sql += ' AND price > 600';
      }

      sql += ' ORDER BY id DESC';
      const rows = await query<Product[]>(sql, params);
      return rows.map((p) => ({
        ...p,
        category: p.category || 'Pizza',
        status: p.status || 'available',
        has_customizations: Boolean(p.has_customizations ?? (p.category?.toLowerCase() === 'pizza')),
        customization_options: p.customization_options || null,
      }));
    } catch (err) {
      console.warn('Fallback product query due to schema adaptation:', err);
      const fallbackRows = await query<Product[]>('SELECT * FROM products ORDER BY id DESC');
      let filtered = fallbackRows;
      if (!includeInactive) {
        filtered = filtered.filter((p) => p.status !== 'inactive');
      }
      if (search) {
        filtered = filtered.filter(
          (p) =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase())
        );
      }
      return filtered.map((p) => ({
        ...p,
        category: p.category || 'Pizza',
        status: p.status || 'available',
        has_customizations: Boolean(p.has_customizations ?? 1),
        customization_options: p.customization_options || null,
      }));
    }
  }

  static async getCategories(includeInactive: boolean = false): Promise<string[]> {
    return CategoryRepository.getAll();
  }

  static async findById(id: number, includeInactive: boolean = false): Promise<Product | null> {
    await ensureDatabaseSchema();

    let sql = 'SELECT * FROM products WHERE id = ?';
    const params: any[] = [id];

    if (!includeInactive) {
      sql += " AND (status != 'inactive' OR status IS NULL)";
    }

    sql += ' LIMIT 1';
    const rows = await query<Product[]>(sql, params);
    if (!rows[0]) return null;

    const p = rows[0];
    return {
      ...p,
      category: p.category || 'Pizza',
      status: p.status || 'available',
      has_customizations: Boolean(p.has_customizations ?? (p.category?.toLowerCase() === 'pizza')),
      customization_options: p.customization_options || null,
    };
  }

  static async create(data: {
    name: string;
    category?: string;
    price: number;
    status?: ProductStatus;
    has_customizations?: boolean;
    customization_options?: string | null;
    description?: string;
    image: string;
  }): Promise<number> {
    await ensureDatabaseSchema();

    const status = data.status || 'available';
    const category = data.category || 'Pizza';
    const has_customizations = data.has_customizations ? 1 : 0;
    const customization_options = data.customization_options || null;

    try {
      const result: any = await query(
        'INSERT INTO products (name, category, price, status, has_customizations, customization_options, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [data.name, category, data.price, status, has_customizations, customization_options, data.description || '', data.image]
      );
      return result.insertId;
    } catch (err) {
      const result: any = await query(
        'INSERT INTO products (name, price, status, description, image) VALUES (?, ?, ?, ?, ?)',
        [data.name, data.price, status, data.description || '', data.image]
      );
      return result.insertId;
    }
  }

  static async update(
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
  ): Promise<boolean> {
    await ensureDatabaseSchema();

    const status = data.status || 'available';
    const category = data.category || 'Pizza';
    const has_customizations = data.has_customizations ? 1 : 0;
    const customization_options = data.customization_options || null;

    try {
      if (data.image) {
        const result: any = await query(
          'UPDATE products SET name = ?, category = ?, price = ?, status = ?, has_customizations = ?, customization_options = ?, description = ?, image = ? WHERE id = ?',
          [data.name, category, data.price, status, has_customizations, customization_options, data.description || '', data.image, id]
        );
        return result.affectedRows > 0;
      } else {
        const result: any = await query(
          'UPDATE products SET name = ?, category = ?, price = ?, status = ?, has_customizations = ?, customization_options = ?, description = ? WHERE id = ?',
          [data.name, category, data.price, status, has_customizations, customization_options, data.description || '', id]
        );
        return result.affectedRows > 0;
      }
    } catch (err) {
      if (data.image) {
        const result: any = await query(
          'UPDATE products SET name = ?, price = ?, status = ?, description = ?, image = ? WHERE id = ?',
          [data.name, data.price, status, data.description || '', data.image, id]
        );
        return result.affectedRows > 0;
      } else {
        const result: any = await query(
          'UPDATE products SET name = ?, price = ?, status = ?, description = ? WHERE id = ?',
          [data.name, data.price, status, data.description || '', id]
        );
        return result.affectedRows > 0;
      }
    }
  }

  static async updateStatus(id: number, status: ProductStatus): Promise<boolean> {
    const result: any = await query('UPDATE products SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    await query('DELETE FROM cart WHERE pid = ?', [id]);
    await query('DELETE FROM favorites WHERE product_id = ?', [id]);
    const result: any = await query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
