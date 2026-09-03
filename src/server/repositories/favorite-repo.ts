import { query } from '../db';
import { Favorite } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export class FavoriteRepository {
  static async getByUserId(userId: number): Promise<Favorite[]> {
    await ensureDatabaseSchema();
    try {
      const rows = await query<any[]>(
        'SELECT id, user_id, COALESCE(product_id, pid) AS product_id, COALESCE(pid, product_id) AS pid, name, price, image FROM favorites WHERE user_id = ? ORDER BY id DESC',
        [userId]
      );
      return rows.map((r) => ({
        ...r,
        product_id: Number(r.product_id || r.pid),
      }));
    } catch (e) {
      console.warn('FavoriteRepository.getByUserId error:', e);
      return [];
    }
  }

  static async find(userId: number, productId: number): Promise<Favorite | null> {
    await ensureDatabaseSchema();
    try {
      const rows = await query<any[]>(
        'SELECT id, user_id, COALESCE(product_id, pid) AS product_id, name, price, image FROM favorites WHERE user_id = ? AND (product_id = ? OR pid = ?) LIMIT 1',
        [userId, productId, productId]
      );
      if (!rows || rows.length === 0) return null;
      return {
        ...rows[0],
        product_id: Number(rows[0].product_id || productId),
      };
    } catch (e) {
      return null;
    }
  }

  static async add(userId: number, productId: number, name: string, price: number, image: string): Promise<number> {
    await ensureDatabaseSchema();
    try {
      const result: any = await query(
        'INSERT INTO favorites (user_id, pid, product_id, name, price, image) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, productId, productId, name, price, image]
      );
      return result.insertId;
    } catch (err) {
      try {
        const res1: any = await query(
          'INSERT INTO favorites (user_id, pid, name, price, image) VALUES (?, ?, ?, ?, ?)',
          [userId, productId, name, price, image]
        );
        return res1.insertId;
      } catch (err2) {
        const res2: any = await query(
          'INSERT INTO favorites (user_id, product_id, name, price, image) VALUES (?, ?, ?, ?, ?)',
          [userId, productId, name, price, image]
        );
        return res2.insertId;
      }
    }
  }

  static async remove(userId: number, productId: number): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      const result: any = await query(
        'DELETE FROM favorites WHERE user_id = ? AND (product_id = ? OR pid = ?)',
        [userId, productId, productId]
      );
      return result.affectedRows > 0;
    } catch (e) {
      return false;
    }
  }
}
