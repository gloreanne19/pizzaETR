'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/database';
import { useToast } from '@/context/ToastContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Customer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [cpass, setCpass] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete Customer Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.status === 'success' && data.data?.users) {
        setUsers(data.data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== cpass) {
      showToast('Confirm password does not match!', 'warning');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, pass, cpass }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Customer account created!', 'success');
        setIsAddModalOpen(false);
        setName('');
        setEmail('');
        setPass('');
        setCpass('');
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to create customer', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error creating customer', 'error');
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(`Customer account "${userToDelete.name}" deleted`, 'info');
        setUserToDelete(null);
        fetchUsers();
      } else {
        showToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (e) {
      showToast('Error deleting user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
            Registered Customer Accounts
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Root Authority: Manage customer registrations and account records
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="btn"
        >
          + Add New Customer
        </button>
      </div>

      <div style={{
        background: '#fff',
        padding: '1rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '1.5rem',
      }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search customers by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '360px' }}
        />
      </div>

      <div className="table-container">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '3rem 0' }}>Loading customer accounts...</p>
        ) : filteredUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No customer accounts found</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setUserToDelete(u)}
                      className="delete-btn"
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      Delete Customer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add New Customer Modal */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
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
                Add New Customer Account
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCustomer}>
              <div className="form-group">
                <label>Customer Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="Enter customer email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="Enter account password"
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
                  placeholder="Confirm account password"
                  value={cpass}
                  onChange={(e) => setCpass(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn"
                  style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {creating ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {userToDelete && (
        <div
          onClick={() => setUserToDelete(null)}
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
              Delete Customer Account
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete customer <strong>"{userToDelete.name}"</strong> ({userToDelete.email})? All associated cart items and favorites will be deleted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="btn"
                style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteUser}
                className="btn"
                style={{ backgroundColor: '#dc2626', color: '#fff' }}
              >
                {deleting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
