'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { FavoritesDrawer } from './FavoritesDrawer';
import {
  HeartIcon,
  CartIcon,
  UserIcon,
  ChevronDownIcon,
  OrdersIcon,
  LogoutIcon,
} from './Icons';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, admin, stats, logoutUser } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside (must be called unconditionally before any early return)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If path is admin route, navbar is handled by AdminLayout
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'About Us' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        zIndex: 9999,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img src="/images/pizzalogo32x32.png" alt="Paquito's Pizza" style={{ height: '36px' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#008C3B', letterSpacing: '-0.5px' }}>
              Paquito's <span style={{ color: '#e74c3c' }}>Pizza</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: isActive ? '#008C3B' : '#333',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '1rem',
                    padding: '0.4rem 0',
                    borderBottom: isActive ? '2px solid #008C3B' : '2px solid transparent',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Favorites Icon Button with red fill on hover */}
            <button
              onClick={() => {
                if (!user) setAuthModalOpen(true);
                else setFavDrawerOpen(true);
              }}
              title="Favorites"
              className="nav-icon-btn nav-fav-btn"
              style={{
                position: 'relative',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '10px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                transition: 'all 0.2s ease',
              }}
            >
              <HeartIcon size={20} />
              {stats.favoritesCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#e11d48',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 2px 5px rgba(225, 29, 72, 0.4)',
                }}>
                  {stats.favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Icon Button */}
            <Link
              href="/cart"
              title="Shopping Cart"
              className="nav-icon-btn nav-cart-btn"
              style={{
                position: 'relative',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '10px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              }}
            >
              <CartIcon size={21} />
              {stats.cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#008C3B',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 2px 5px rgba(0, 140, 59, 0.4)',
                }}>
                  {stats.cartCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown or Sign In Button */}
            {user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: userMenuOpen ? '#f1f5f9' : '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '24px',
                    padding: '6px 12px 6px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#008C3B',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  <span style={{
                    transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#64748b',
                    display: 'flex',
                  }}>
                    <ChevronDownIcon size={14} />
                  </span>
                </button>

                {/* Dropdown Menu: Only My Profile, Order History, and Logout */}
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    border: '1px solid #e2e8f0',
                    padding: '0.5rem',
                    zIndex: 10000,
                    animation: 'fadeIn 0.15s ease-out',
                  }}>
                    {/* User Info Header */}
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.25rem' }}>
                      <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', margin: 0 }}>
                        {user.name}
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email || 'Customer Account'}
                      </p>
                    </div>

                    {/* Option 1: My Profile */}
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <UserIcon size={16} /> My Profile
                    </Link>

                    {/* Option 2: Order History */}
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <OrdersIcon size={16} /> Order History
                    </Link>

                    <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.35rem 0' }} />

                    {/* Option 3: Logout */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logoutUser();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'none',
                        color: '#e11d48',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff1f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogoutIcon size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.9rem' }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Global CSS for icon hover fill */}
      <style jsx global>{`
        .nav-fav-btn:hover .heart-icon,
        .card-fav-btn:hover .heart-icon {
          fill: #e11d48 !important;
          stroke: #e11d48 !important;
          transform: scale(1.15);
        }
        .nav-fav-btn:hover {
          background-color: #fff1f2 !important;
          border-color: #fecdd3 !important;
        }
        .nav-cart-btn:hover {
          background-color: #f0fdf4 !important;
          border-color: #bbf7d0 !important;
          color: #008C3B !important;
        }
      `}</style>

      {/* Modals & Drawers */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <FavoritesDrawer isOpen={favDrawerOpen} onClose={() => setFavDrawerOpen(false)} />
    </>
  );
};
