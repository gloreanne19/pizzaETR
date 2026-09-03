'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginAdmin } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await loginAdmin(name, pass);
    setSubmitting(false);

    if (res.success) {
      showToast('Admin login successful! Redirecting...', 'success');
      router.push('/admin');
    } else {
      showToast(res.message || 'Incorrect username or password', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      padding: '1.5rem',
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid #334155',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/images/pizzalogo32x32.png" alt="Paquito's Pizza" style={{ height: '42px', marginBottom: '0.5rem' }} />
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, marginTop: '0.25rem' }}>
            Admin Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Paquito's Pizza Management Console
          </p>
        </div>

        <form onSubmit={handleAdminLogin}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
              Admin Username
            </label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Enter admin username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#fff',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="Enter password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#fff',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              backgroundColor: '#008C3B',
              justifyContent: 'center',
            }}
          >
            {submitting ? 'Verifying...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}

