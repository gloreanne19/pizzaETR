import { query } from '../db';
import { Order, OrderItem } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export class OrderRepository {
  static async create(
    data: {
      user_id: number;
      name: string;
      number: string;
      method: string;
      address: string;
      delivery_notes?: string;
      payment_proof?: string;
      order_type?: 'delivery' | 'pickup';
      order_status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
      lat?: number | null;
      lng?: number | null;
      total_products: string;
      total_price: number;
    },
    connection?: any
  ): Promise<number> {
    await ensureDatabaseSchema();
    const orderType = data.order_type || 'delivery';
    const orderStatus = data.order_status || 'pending';

    if (connection) {
      const [result]: any = await connection.execute(
        `INSERT INTO orders (user_id, name, number, method, address, delivery_notes, payment_proof, order_type, order_status, lat, lng, total_products, total_price, payment_status, placed_on)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          data.user_id,
          data.name,
          data.number,
          data.method,
          data.address,
          data.delivery_notes || null,
          data.payment_proof || null,
          orderType,
          orderStatus,
          data.lat ?? null,
          data.lng ?? null,
          data.total_products,
          data.total_price,
        ]
      );
      return result.insertId;
    }

    const result: any = await query(
      `INSERT INTO orders (user_id, name, number, method, address, delivery_notes, payment_proof, order_type, order_status, lat, lng, total_products, total_price, payment_status, placed_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        data.user_id,
        data.name,
        data.number,
        data.method,
        data.address,
        data.delivery_notes || null,
        data.payment_proof || null,
        orderType,
        orderStatus,
        data.lat ?? null,
        data.lng ?? null,
        data.total_products,
        data.total_price,
      ]
    );
    return result.insertId;
  }

  static async createItem(
    data: {
      order_id: number;
      product_id: number;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      customizations?: string;
    },
    connection?: any
  ): Promise<number> {
    await ensureDatabaseSchema();
    if (connection) {
      const [result]: any = await connection.execute(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, size, customizations)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.order_id,
          data.product_id,
          data.name,
          data.price,
          data.quantity,
          data.size || null,
          data.customizations || null,
        ]
      );
      return result.insertId;
    }

    const result: any = await query(
      `INSERT INTO order_items (order_id, product_id, name, price, quantity, size, customizations)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.order_id,
        data.product_id,
        data.name,
        data.price,
        data.quantity,
        data.size || null,
        data.customizations || null,
      ]
    );
    return result.insertId;
  }

  static async getByUserId(userId: number): Promise<Order[]> {
    await ensureDatabaseSchema();
    try {
      return await query<Order[]>('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
    } catch (err) {
      console.warn('Fallback OrderRepository.getByUserId:', err);
      return [];
    }
  }

  static async getAll(search?: string, status?: string, orderType?: string): Promise<Order[]> {
    await ensureDatabaseSchema();
    try {
      let sql = 'SELECT * FROM orders WHERE 1=1';
      const params: any[] = [];

      if (search) {
        sql += ' AND (name LIKE ? OR number LIKE ? OR address LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status && status !== 'all') {
        sql += ' AND (payment_status = ? OR order_status = ?)';
        params.push(status, status);
      }

      if (orderType && orderType !== 'all') {
        sql += ' AND order_type = ?';
        params.push(orderType);
      }

      sql += ' ORDER BY id DESC';
      return await query<Order[]>(sql, params);
    } catch (err) {
      console.warn('Fallback OrderRepository.getAll:', err);
      return [];
    }
  }

  static async findById(id: number): Promise<Order | null> {
    await ensureDatabaseSchema();
    try {
      const rows = await query<Order[]>('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  static async getItemsByOrderId(orderId: number, connection?: any): Promise<OrderItem[]> {
    await ensureDatabaseSchema();
    try {
      if (connection) {
        const [rows]: any = await connection.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        return rows as OrderItem[];
      }
      const rows = await query<OrderItem[]>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
      return rows;
    } catch (err) {
      return [];
    }
  }

  static async updatePaymentStatus(id: number, status: 'pending' | 'completed', connection?: any): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      if (connection) {
        const [result]: any = await connection.execute(
          'UPDATE orders SET payment_status = ? WHERE id = ?',
          [status, id]
        );
        return result.affectedRows > 0;
      }
      const result: any = await query(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error updating order payment status:', err);
      return false;
    }
  }

  static async updateOrderStatus(
    id: number,
    orderStatus: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled',
    paymentStatus?: 'pending' | 'completed',
    connection?: any,
    cancellationReason?: string | null
  ): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      let sql = 'UPDATE orders SET order_status = ?';
      const params: any[] = [orderStatus];

      if (paymentStatus) {
        sql += ', payment_status = ?';
        params.push(paymentStatus);
      }
      if (cancellationReason !== undefined) {
        sql += ', cancellation_reason = ?';
        params.push(cancellationReason || null);
      }
      sql += ' WHERE id = ?';
      params.push(id);

      if (connection) {
        const [result]: any = await connection.execute(sql, params);
        return result.affectedRows > 0;
      }
      const result: any = await query(sql, params);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error updating order status:', err);
      return false;
    }
  }

  static async delete(id: number): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      await query('DELETE FROM order_items WHERE order_id = ?', [id]);
      const result: any = await query('DELETE FROM orders WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting order:', err);
      return false;
    }
  }
}
