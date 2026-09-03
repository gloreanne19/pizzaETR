'use client';

import React, { useState, useEffect } from 'react';
import { Admin } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AdminTableSkeleton } from '@/components/Skeletons';

export default function AdminAccountsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Register
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [cpass, setCpass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal State for Edit Credentials
  const [adminToEdit, setAdminToEdit] = useState<Admin | null>(null);
  const [editName, setEditName] = useState('');
  const [editPass, setEditPass] = useState('');
  const [editCpass, setEditCpass] = useState('');
  const [editing, setEditing] = useState(false);

  // Modal State for Delete
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { admin: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const isRoot = currentAdmin?.name?.toLowerCase() === 'root';

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/accounts');
      const data = await res.json();
      if (data.status === 'success' && data.data?.admins) {
        setAdmins(data.data.admins);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== cpass) {
      showToast('Confirm password does not match!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pass, cpass }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('New admin registered successfully!', 'success');
        setIsModalOpen(false);
        setName('');
        setPass('');
        setCpass('');
        fetchAdmins();
      } else {
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error creating admin', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (admin: Admin) => {
    setAdminToEdit(admin);
    setEditName(admin.name);
    setEditPass('');
    setEditCpass('');
  };

  const handleSaveEditCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToEdit) return;

    if (editPass && editPass !== editCpass) {
      showToast('New password confirmation does not match!', 'warning');
      return;
    }

    setEditing(true);
    try {
      const res = await fetch(`/api/admin/accounts/${adminToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          newPass: editPass ? editPass : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Administrator credentials updated!', 'success');
        setAdminToEdit(null);
        fetchAdmins();
      } else {
        showToast(data.message || 'Failed to update credentials', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error updating credentials', 'error');
    } finally {
      setEditing(false);
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    if (adminToDelete.name.toLowerCase() === 'root') {
      showToast('The root super-administrator cannot be deleted!', 'error');
      setAdminToDelete(null);
      return;
    }

    if (currentAdmin && currentAdmin.id === adminToDelete.id) {
      showToast('You cannot delete your own active admin session!', 'warning');
      setAdminToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/accounts/${adminToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(`Admin account "${adminToDelete.name}" deleted`, 'info');
        setAdminToDelete(null);
        fetchAdmins();
      } else {
        showToast(data.message || 'Failed to delete', 'error');
      }
    } catch (e) {
      showToast('Error deleting admin', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
            Administrator Accounts Authority
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Root Authority: Manage, modify credentials, and delete administrator accounts.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn">
          + Register New Admin
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <AdminTableSkeleton rows={4} columns={3} />
        ) : admins.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No admin accounts found</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Username</th>
                <th>Role & Privilege</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isTargetRoot = a.name.toLowerCase() === 'root';
                const isCurrent = currentAdmin?.id === a.id;

                return (
                  <tr key={a.id}>
                    <td>#{a.id}</td>
                    <td style={{ fontWeight: 700 }}>
                      {a.name} {isCurrent && <span style={{ color: '#008C3B', fontSize: '0.85rem' }}>(You)</span>}
                    </td>
                    <td>
                      {isTargetRoot ? (
                        <span style={{
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                        }}>
                          Root Super-User
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #e2e8f0',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}>
                          Standard Admin
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(a)}
                          className="btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.82rem',
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                          }}
                        >
                          Edit Credentials
                        </button>
                        {isTargetRoot ? (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                            Protected
                          </span>
                        ) : isCurrent ? (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAdminToDelete(a)}
                            className="delete-btn"
                            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Admin Credentials Modal */}
      {adminToEdit && (
        <div
          onClick={() => setAdminToEdit(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              padding: '2rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                Edit Admin Credentials
              </h2>
              <button
                type="button"
                onClick={() => setAdminToEdit(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditCredentials}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  required
                  disabled={adminToEdit.name.toLowerCase() === 'root'}
                  className="form-control"
                  placeholder="Admin username"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                {adminToEdit.name.toLowerCase() === 'root' && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    The root account username is immutable.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>New Password (leave blank to keep unchanged)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={editPass}
                  onChange={(e) => setEditPass(e.target.value)}
                />
              </div>

              {editPass && (
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Confirm new password"
                    value={editCpass}
                    onChange={(e) => setEditCpass(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAdminToEdit(null)}
                  className="btn"
                  style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="btn"
                  style={{ flex: 1, justifyContent: 'center', backgroundColor: '#008C3B', color: '#fff' }}
                >
                  {editing ? 'Saving...' : 'Update Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Confirmation Modal */}
      {adminToDelete && (
        <div
          onClick={() => setAdminToDelete(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              padding: '2rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
              Delete Administrator
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Are you sure you want to delete admin account <strong>"{adminToDelete.name}"</strong>? This administrator will lose all system access.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="btn"
                style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteAdmin}
                className="btn"
                style={{ backgroundColor: '#dc2626', color: '#fff' }}
              >
                {deleting ? 'Deleting...' : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Admin Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              padding: '2rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                Register New Administrator
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegisterAdmin}>
              <div className="form-group">
                <label>Admin Username</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Enter username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="Enter password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="Confirm password"
                  value={cpass}
                  onChange={(e) => setCpass(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn"
                  style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
