import { query } from '../db';
import { User, SavedAddress } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export class UserRepository {
  static async findById(id: number): Promise<User | null> {
    await ensureDatabaseSchema();
    try {
      const rows = await query<User[]>('SELECT id, name, email, address, number, saved_addresses FROM user WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    await ensureDatabaseSchema();
    try {
      const rows = await query<User[]>('SELECT * FROM user WHERE email = ? LIMIT 1', [email]);
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  static async create(name: string, email: string, passwordHash: string): Promise<number> {
    await ensureDatabaseSchema();
    const result: any = await query('INSERT INTO user (name, email, password) VALUES (?, ?, ?)', [
      name,
      email,
      passwordHash,
    ]);
    return result.insertId;
  }

  static async updateProfile(
    id: number,
    data: { name: string; address?: string; number?: string; passwordHash?: string; saved_addresses?: string }
  ): Promise<boolean> {
    await ensureDatabaseSchema();
    if (data.passwordHash) {
      const result: any = await query(
        'UPDATE user SET name = ?, address = ?, number = ?, saved_addresses = COALESCE(?, saved_addresses), password = ? WHERE id = ?',
        [data.name, data.address || null, data.number || null, data.saved_addresses || null, data.passwordHash, id]
      );
      return result.affectedRows > 0;
    } else {
      const result: any = await query(
        'UPDATE user SET name = ?, address = ?, number = ?, saved_addresses = COALESCE(?, saved_addresses) WHERE id = ?',
        [data.name, data.address || null, data.number || null, data.saved_addresses || null, id]
      );
      return result.affectedRows > 0;
    }
  }

  static async addSavedAddress(userId: number, address: SavedAddress): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      const user = await this.findById(userId);
      if (!user) return false;

      let existing: SavedAddress[] = [];
      if (user.saved_addresses) {
        try {
          const parsed = JSON.parse(user.saved_addresses);
          if (Array.isArray(parsed)) existing = parsed;
        } catch (e) {}
      }

      // Check if address with same label or text exists, update it, otherwise push
      const idx = existing.findIndex((a) => a.label.toLowerCase() === address.label.toLowerCase() || a.address === address.address);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...address };
      } else {
        existing.push(address);
      }

      const jsonStr = JSON.stringify(existing);
      const result: any = await query('UPDATE user SET saved_addresses = ?, address = ? WHERE id = ?', [jsonStr, address.address, userId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error saving address:', err);
      return false;
    }
  }

  static async getAll(): Promise<User[]> {
    await ensureDatabaseSchema();
    try {
      return await query<User[]>('SELECT id, name, email, address, number, saved_addresses FROM user ORDER BY id DESC');
    } catch (err) {
      console.warn('Fallback UserRepository.getAll:', err);
      return [];
    }
  }

  static async delete(id: number): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      await query('DELETE FROM cart WHERE user_id = ?', [id]);
      await query('DELETE FROM favorites WHERE user_id = ?', [id]);
      const result: any = await query('DELETE FROM user WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting user:', err);
      return false;
    }
  }
}
