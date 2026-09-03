import { query } from '../db';
import { CartItem } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export class CartRepository {
  static async getByUserId(userId: number): Promise<CartItem[]> {
    await ensureDatabaseSchema();
    const sql = `
      SELECT c.*
      FROM cart c
      WHERE c.user_id = ?
      ORDER BY c.id DESC
    `;
    const rows = await query<CartItem[]>(sql, [userId]);
    return rows.map((r) => ({
      ...r,
      options: r.options || (r.sizename ? `Size: ${r.sizename}` : null),
    }));
  }

  static async findExistingItem(
    userId: number,
    pid: number,
    options?: string | null
  ): Promise<CartItem | null> {
    await ensureDatabaseSchema();
    let sql = 'SELECT * FROM cart WHERE user_id = ? AND pid = ?';
    const params: any[] = [userId, pid];

    if (options) {
      sql += ' AND options = ?';
      params.push(options);
    } else {
      sql += ' AND (options IS NULL OR options = "")';
    }

    sql += ' LIMIT 1';
    const rows = await query<CartItem[]>(sql, params);
    return rows[0] || null;
  }

  static async addItem(data: {
    user_id: number;
    pid: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    options?: string | null;
    sizeID?: number | null;
    customIDS?: string;
  }): Promise<number> {
    await ensureDatabaseSchema();
    try {
      const result: any = await query(
        `INSERT INTO cart (user_id, pid, name, price, quantity, image, options, sizeID, customIDS)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.user_id,
          data.pid,
          data.name,
          data.price,
          data.quantity,
          data.image,
          data.options || null,
          data.sizeID || null,
          data.customIDS || '',
        ]
      );
      return result.insertId;
    } catch (err) {
      // Fallback query if options column wasn't added yet
      const result: any = await query(
        `INSERT INTO cart (user_id, pid, name, price, quantity, image, sizeID, customIDS)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.user_id,
          data.pid,
          data.name,
          data.price,
          data.quantity,
          data.image,
          data.sizeID || null,
          data.customIDS || '',
        ]
      );
      return result.insertId;
    }
  }

  static async updateQuantity(id: number, userId: number, quantity: number): Promise<boolean> {
    await ensureDatabaseSchema();
    const result: any = await query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [
      quantity,
      id,
      userId,
    ]);
    return result.affectedRows > 0;
  }

  static async removeItem(id: number, userId: number): Promise<boolean> {
    await ensureDatabaseSchema();
    const result: any = await query('DELETE FROM cart WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }

  static async clearUserCart(userId: number, connection?: any): Promise<boolean> {
    await ensureDatabaseSchema();
    const runner = connection || { execute: (sql: string, params: any[]) => query(sql, params) };
    const [result]: any = await runner.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
    return result.affectedRows > 0;
  }
}
