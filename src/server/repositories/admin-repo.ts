import { query } from '../db';
import { Admin } from '../db/schema';
import { ensureDatabaseSchema } from '../db/auto-migrate';
import { hashPassword } from '@/lib/jwt';

export class AdminRepository {
  static async findById(id: number): Promise<Admin | null> {
    await ensureDatabaseSchema();
    try {
      const rows = await query<Admin[]>('SELECT id, name, session_id FROM admin WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (err) {
      return null;
    }
  }

  static async findByName(name: string): Promise<Admin | null> {
    await ensureDatabaseSchema();
    const cleanName = (name || '').trim();
    if (!cleanName) return null;

    try {
      const rows = await query<Admin[]>('SELECT id, name, password, session_id FROM admin WHERE LOWER(name) = LOWER(?) LIMIT 1', [cleanName]);
      if (rows && rows.length > 0) return rows[0];

      // Auto-initialize root account if missing
      if (cleanName.toLowerCase() === 'root') {
        const rootHash = hashPassword('root123');
        const rootId = await this.create('root', rootHash);
        return { id: rootId, name: 'root', password: rootHash, session_id: null };
      }

      // Auto-initialize standard admin account if missing
      if (cleanName.toLowerCase() === 'admin') {
        const adminHash = hashPassword('admin123');
        const adminId = await this.create('admin', adminHash);
        return { id: adminId, name: 'admin', password: adminHash, session_id: null };
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  static async updateSessionId(id: number, sessionId: string | null): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      const result: any = await query('UPDATE admin SET session_id = ? WHERE id = ?', [sessionId, id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error updating admin session_id:', err);
      return false;
    }
  }

  static async create(name: string, passwordHash: string): Promise<number> {
    await ensureDatabaseSchema();
    const result: any = await query('INSERT INTO admin (name, password) VALUES (?, ?)', [
      name.trim(),
      passwordHash,
    ]);
    return result.insertId;
  }

  static async getAll(): Promise<Admin[]> {
    await ensureDatabaseSchema();
    try {
      return await query<Admin[]>('SELECT id, name, session_id FROM admin ORDER BY id ASC');
    } catch (err) {
      console.warn('Fallback AdminRepository.getAll:', err);
      return [];
    }
  }

  static async updateProfile(id: number, name: string, passwordHash?: string): Promise<boolean> {
    await ensureDatabaseSchema();
    if (passwordHash) {
      const result: any = await query('UPDATE admin SET name = ?, password = ? WHERE id = ?', [
        name.trim(),
        passwordHash,
        id,
      ]);
      return result.affectedRows > 0;
    } else {
      const result: any = await query('UPDATE admin SET name = ? WHERE id = ?', [name.trim(), id]);
      return result.affectedRows > 0;
    }
  }

  static async delete(id: number): Promise<boolean> {
    await ensureDatabaseSchema();
    try {
      const result: any = await query('DELETE FROM admin WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting admin:', err);
      return false;
    }
  }
}
