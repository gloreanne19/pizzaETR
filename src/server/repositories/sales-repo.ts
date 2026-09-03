import { query } from '../db';
import { Sale } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export class SalesRepository {
  static async create(
    data: {
      product_id: number;
      price: number;
      qty: number;
      sizeID?: string;
      cusIDs?: string;
    },
    connection?: any
  ): Promise<number> {
    await ensureDatabaseSchema();
    try {
      if (connection) {
        const [result]: any = await connection.execute(
          `INSERT INTO sales (product_id, price, qty, sizeID, cusIDs, date)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            data.product_id,
            data.price,
            data.qty,
            data.sizeID || '',
            data.cusIDs || '',
          ]
        );
        return result.insertId;
      }

      const result: any = await query(
        `INSERT INTO sales (product_id, price, qty, sizeID, cusIDs, date)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          data.product_id,
          data.price,
          data.qty,
          data.sizeID || '',
          data.cusIDs || '',
        ]
      );
      return result.insertId;
    } catch (err) {
      console.error('Error creating sales entry:', err);
      return 0;
    }
  }

  static async getSales(productName?: string, startDate?: string, endDate?: string): Promise<Sale[]> {
    await ensureDatabaseSchema();
    try {
      let sql = `
        SELECT s.*, p.name as product_name, p.category as product_category
        FROM sales s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (productName) {
        sql += ' AND p.name LIKE ?';
        params.push(`%${productName}%`);
      }

      if (startDate) {
        sql += ' AND s.date >= ?';
        params.push(`${startDate} 00:00:00`);
      }

      if (endDate) {
        sql += ' AND s.date <= ?';
        params.push(`${endDate} 23:59:59`);
      }

      sql += ' ORDER BY s.id DESC';
      return await query<Sale[]>(sql, params);
    } catch (err) {
      console.warn('Fallback SalesRepository.getSales:', err);
      return [];
    }
  }
}
