'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, loading, logoutAdmin } = useAuth();
  const [sessionTerminated, setSessionTerminated] = useState(false);

  const isLoginPage = pathname === '/admin/login';
  const isRoot = admin?.name?.toLowerCase() === 'root';

  useEffect(() => {
    if (!loading && !admin && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [admin, loading, isLoginPage, router]);

  // Route protection
  useEffect(() => {
    if (!loading && admin) {
      if (isRoot) {
        // Root is dedicated to Account Management & Root Profile
        const allowedPaths = ['/admin/accounts', '/admin/users', '/admin/profile'];
        if (!allowedPaths.includes(pathname) && pathname.startsWith('/admin')) {
          router.replace('/admin/accounts');
        }
      } else {
        // Standard admin is dedicated to Single Store Operations and cannot access accounts, users, or profile
        const forbiddenForAdmin = ['/admin/accounts', '/admin/users', '/admin/profile'];
        if (forbiddenForAdmin.includes(pathname)) {
          router.replace('/admin');
        }
      }
    }
  }, [isRoot, admin, loading, pathname, router]);

  // Heartbeat Single-Device Session Check
  useEffect(() => {
    if (!admin || isLoginPage) return;

    const verifySession = async () => {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.status === 401) {
          const data = await res.json().catch(() => ({}));
          if (data.code === 'CONCURRENT_LOGIN') {
            setSessionTerminated(true);
          }
        }
      } catch (e) {
        // Ignore network flakiness
      }
    };

    // Check on window focus and on periodic 15-second heartbeat
    const handleFocus = () => verifySession();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(verifySession, 15000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [admin, isLoginPage]);

  const handleDismissTerminated = async () => {
    setSessionTerminated(false);
    await logoutAdmin();
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#666' }}>
        Verifying administrator session...
      </div>
    );
  }

  // Root super-user manages customer, admin accounts, and root credentials
  // Standard operational admin manages single store operations (Dashboard, Orders, Products, Categories, Sales)
  const navItems = isRoot
    ? [
      { href: '/admin/accounts', label: 'Admin Accounts' },
      { href: '/admin/users', label: 'Customer Accounts' },
      { href: '/admin/profile', label: 'Root Profile' },
    ]
    : [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/orders', label: 'Orders' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/categories', label: 'Categories' },
      { href: '/admin/sales', label: 'Sales Reports' },
    ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      {/* Admin Sidebar Navigation */}
      <aside style={{
        width: '260px',
        backgroundColor: '#1e293b',
        color: '#fff',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Admin Brand */}
        <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #334155', marginBottom: '1.5rem' }}>
          <Link href={isRoot ? '/admin/accounts' : '/admin'} style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/images/pizzalogo32x32.png" alt="Paquito's Pizza" style={{ height: '28px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isRoot ? '#f59e0b' : '#4ade80' }}>
                {isRoot ? 'Root Controller' : "Paquito's Admin"}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {isRoot ? 'Account Authority' : 'Store Console'}
              </div>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  color: isActive ? '#fff' : '#cbd5e1',
                  backgroundColor: isActive ? (isRoot ? '#d97706' : '#008C3B') : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin Bottom Info */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              {isRoot ? 'Root Super-User' : 'Active Admin:'}
            </div>
            <div style={{ fontWeight: 700, color: isRoot ? '#fcd34d' : '#fff', fontSize: '0.95rem' }}>
              {admin?.name}
            </div>
          </div>
          <button
            onClick={logoutAdmin}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        {children}
      </main>

      {/* Concurrent Device Login Notice Modal */}
      {sessionTerminated && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              margin: '0 auto 1rem auto',
            }}>
              !
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
              Session Terminated
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
              This administrator account was just signed into from another computer or browser. Only one active device session is permitted at a time.
            </p>
            <button
              type="button"
              onClick={handleDismissTerminated}
              className="btn"
              style={{ width: '100%', justifyContent: 'center', backgroundColor: '#008C3B', color: '#fff', padding: '12px' }}
            >
              Back to Admin Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
