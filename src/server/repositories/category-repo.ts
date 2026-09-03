import { query } from '../db';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export interface CategoryDetail {
  id?: number;
  name: string;
  image?: string;
  default_options?: string | null;
}

export class CategoryRepository {
  static async getAll(): Promise<string[]> {
    await ensureDatabaseSchema();
    try {
      const catRows = await query<{ name: string }[]>('SELECT name FROM categories ORDER BY name ASC');
      const prodRows = await query<{ category: string }[]>("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ''");

      const set = new Set<string>();
      set.add('Pizza');
      catRows.forEach((r) => { if (r.name) set.add(r.name); });
      prodRows.forEach((r) => { if (r.category) set.add(r.category); });

      return Array.from(set);
    } catch (err) {
      console.warn('Fallback CategoryRepository.getAll query:', err);
      return ['Pizza', 'Drinks', 'Meals', 'Burgers', 'Sides', 'Desserts'];
    }
  }

  static async getAllDetailed(): Promise<CategoryDetail[]> {
    await ensureDatabaseSchema();
    try {
      const catRows = await query<CategoryDetail[]>('SELECT id, name, image, default_options FROM categories ORDER BY name ASC');
      return catRows;
    } catch (err) {
      console.warn('Fallback CategoryRepository.getAllDetailed query:', err);
      return [
        { name: 'Pizza', default_options: '[{"id":"pizza_crust","title":"Select Crust Size","type":"single","required":true,"choices":[{"name":"Solo (10\\")","price":0},{"name":"Medium (12\\")","price":80},{"name":"Family (14\\")","price":150}]}]' },
        { name: 'Drinks', default_options: '[{"id":"drink_size","title":"Select Size / Volume","type":"single","required":true,"choices":[{"name":"500ml","price":0},{"name":"1 Liter","price":35},{"name":"1.5 Liters","price":60}]}]' },
        { name: 'Burgers', default_options: '[{"id":"burger_style","title":"Choose Style","type":"single","required":false,"choices":[{"name":"Classic","price":0},{"name":"With Melted Cheese","price":25},{"name":"Double Patty","price":60}]}]' },
        { name: 'Meals', default_options: '[{"id":"flavor","title":"Choose Flavor / Spice Level","type":"single","required":false,"choices":[{"name":"Original (Mild)","price":0},{"name":"Spicy","price":0},{"name":"Extra Hot","price":10}]}]' },
        { name: 'Sides', default_options: '[]' },
        { name: 'Desserts', default_options: '[]' },
      ];
    }
  }

  static async create(name: string, image?: string, defaultOptions?: string): Promise<boolean> {
    await ensureDatabaseSchema();
    const cleanName = name.trim();
    if (!cleanName) return false;

    try {
      await query('INSERT IGNORE INTO categories (name, image, default_options) VALUES (?, ?, ?)', [
        cleanName,
        image || null,
        defaultOptions || null,
      ]);
      return true;
    } catch (err) {
      console.error('Error creating category:', err);
      return false;
    }
  }

  static async updateDefaultOptions(name: string, defaultOptions: string | null): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      const result: any = await query('UPDATE categories SET default_options = ? WHERE LOWER(name) = LOWER(?)', [
        defaultOptions,
        name,
      ]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error updating category default options:', err);
      return false;
    }
  }

  static async delete(name: string): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      const result: any = await query('DELETE FROM categories WHERE LOWER(name) = LOWER(?)', [name]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting category:', err);
      return false;
    }
  }
}
