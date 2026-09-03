import { AdminRepository } from '../repositories/admin-repo';
import { hashPassword } from '@/lib/jwt';
import { Admin } from '../db/schema';

export class AdminService {
  static async getAllAdmins(includeRoot = false): Promise<Admin[]> {
    const admins = await AdminRepository.getAll();
    if (includeRoot) {
      return admins;
    }
    return admins.filter((a) => a.name.toLowerCase() !== 'root');
  }

  static async updateProfile(
    adminId: number,
    name: string,
    oldPass?: string,
    newPass?: string,
    confirmPass?: string
  ): Promise<{ success: boolean; message: string }> {
    const current = await AdminRepository.findById(adminId);
    if (!current) {
      return { success: false, message: 'Admin account not found' };
    }

    if (newPass) {
      if (!oldPass) {
        return { success: false, message: 'Please enter your current password to change it' };
      }
      if (newPass !== confirmPass) {
        return { success: false, message: 'Confirm password not matched!' };
      }

      const fullAdmin = await AdminRepository.findByName(current.name);
      if (fullAdmin?.password !== hashPassword(oldPass)) {
        return { success: false, message: 'Current password is incorrect' };
      }

      await AdminRepository.updateProfile(adminId, name, hashPassword(newPass));
      return { success: true, message: 'Profile and password updated successfully!' };
    }

    await AdminRepository.updateProfile(adminId, name);
    return { success: true, message: 'Profile username updated successfully!' };
  }

  static async updateAdminCredentialsByRoot(
    adminId: number,
    name: string,
    newPassword?: string
  ): Promise<{ success: boolean; message: string }> {
    const target = await AdminRepository.findById(adminId);
    if (!target) {
      return { success: false, message: 'Admin account not found' };
    }

    const cleanName = (name || '').trim();
    if (!cleanName) {
      return { success: false, message: 'Admin username cannot be empty' };
    }

    // Root username cannot be changed
    const finalName = target.name.toLowerCase() === 'root' ? 'root' : cleanName;

    // Check if new name is already taken by another admin
    if (finalName.toLowerCase() !== target.name.toLowerCase()) {
      const existing = await AdminRepository.findByName(finalName);
      if (existing && existing.id !== adminId) {
        return { success: false, message: `Username "${finalName}" is already taken by another administrator` };
      }
    }

    if (newPassword && newPassword.trim().length > 0) {
      const passwordHash = hashPassword(newPassword.trim());
      await AdminRepository.updateProfile(adminId, finalName, passwordHash);
      return { success: true, message: `Credentials updated successfully for "${finalName}" (username & password updated)` };
    }

    await AdminRepository.updateProfile(adminId, finalName);
    return { success: true, message: `Username updated successfully for "${finalName}"` };
  }

  static async deleteAdmin(id: number): Promise<{ success: boolean; message: string }> {
    const target = await AdminRepository.findById(id);
    if (!target) {
      return { success: false, message: 'Admin not found or already deleted' };
    }

    if (target.name.toLowerCase() === 'root') {
      return { success: false, message: 'The root super-administrator account cannot be deleted.' };
    }

    const deleted = await AdminRepository.delete(id);
    if (deleted) {
      return { success: true, message: `Admin account "${target.name}" deleted successfully` };
    }
    return { success: false, message: 'Failed to delete admin account' };
  }
}
