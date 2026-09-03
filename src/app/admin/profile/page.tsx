'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminProfilePage() {
  const { admin } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (admin) setName(admin.name);
  }, [admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPass && newPass !== confirmPass) {
      showToast('New passwords do not match!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          old_pass: oldPass || undefined,
          new_pass: newPass || undefined,
          confirm_pass: confirmPass || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Profile updated successfully!', 'success');
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error updating profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
          Admin Profile Settings
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>
          Update your username or change your administrator password
        </p>
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
      }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Username</label>
            <input
              type="text"
              required
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <hr style={{ margin: '1.75rem 0', borderColor: '#f1f5f9' }} />

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            Change Password (Optional)
          </h3>

          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter current password to change"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn"
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
          >
            {submitting ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

