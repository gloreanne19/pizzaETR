'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Order, OrderItem } from '@/types/database';
import { UserIcon, OrdersIcon, PizzaSliceIcon } from '@/components/Icons';

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  address: string;
  number: string;
}

type OrderWithItems = Order & { items: OrderItem[] };

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setProfileData(json.data.user);
          setName(json.data.user.name || '');
          setAddress(json.data.user.address || '');
          setNumber(json.data.user.number || '');
          setOrders(json.data.orders || []);
        }
      } else if (res.status === 401) {
        // Not authenticated
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match!', 'warning');
      return;
    }

    if (newPassword && !oldPassword) {
      showToast('Please enter your current password to set a new password', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          number,
          oldPassword: oldPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Profile updated successfully!', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
        refreshUser();
      } else {
        showToast(json.message || 'Failed to update profile', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#888', fontSize: '1.2rem' }}>Loading your profile & order history...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          background: '#fff',
          maxWidth: '480px',
          margin: '0 auto',
          padding: '3rem 2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ color: '#1e293b', marginTop: '0.5rem', fontWeight: 800 }}>Please Sign In</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem', lineHeight: 1.6 }}>
            You need to be logged in to view your profile settings and complete order history.
          </p>
          <Link href="/" className="btn" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            Go to Homepage &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="heading" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
          Customer <span>Profile & History</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
          Manage your contact information, default delivery address, and view complete past order details.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Left Column: Edit Profile & Address Form */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#008C3B',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}>
              <UserIcon size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Personal Information
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Default details used for rapid pizza delivery checkout
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="E.g. Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                disabled
                className="form-control"
                value={profileData?.email || user.email || ''}
                style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Email address is permanently tied to your account
              </span>
            </div>

            <div className="form-group">
              <label>Default Contact Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="E.g. 0917 123 4567"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Default Delivery Address</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="House/Unit #, Street, Barangay, City, Landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                This address will auto-fill during your cart checkout
              </span>
            </div>

            {/* Password Change Toggle */}
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#008C3B',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {showPasswordChange ? '▼ Cancel Password Change' : '▶ Change Account Password'}
              </button>

              {showPasswordChange && (
                <div style={{
                  background: '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your existing password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter new secure password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
            >
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column: Complete Itemized Order History */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}>
                <OrdersIcon size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Order History & Receipts
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  {orders.length} total order{orders.length === 1 ? '' : 's'} placed
                </p>
              </div>
            </div>
            <Link href="/menu" className="option-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              + Order New Pizza
            </Link>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <h3 style={{ color: '#334155', fontWeight: 700 }}>No orders placed yet</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Your order receipts and itemized summaries will appear right here.
              </p>
              <Link href="/menu" className="btn" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                Explore Menu & Order Now &rarr;
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    padding: '1.25rem',
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  {/* Order Summary Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>
                        Order #{order.id}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                        Placed on: {new Date(order.placed_on).toLocaleDateString()} at {new Date(order.placed_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: order.payment_status === 'completed' ? '#dcfce7' : '#fef3c7',
                        color: order.payment_status === 'completed' ? '#15803d' : '#b45309',
                      }}>
                        {order.payment_status === 'completed' ? 'Paid / Delivered' : 'Payment Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                    <div>
                      <strong>Delivery Address:</strong> {order.address}
                    </div>
                    <div>
                      <strong>Contact:</strong> {order.number}
                    </div>
                    <div>
                      <strong>Payment Method:</strong> {order.method}
                    </div>
                  </div>

                  {/* Itemized Order Breakdown */}
                  {order.items && order.items.length > 0 && (
                    <div style={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Ordered Items ({order.items.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.88rem',
                              borderBottom: idx !== order.items.length - 1 ? '1px dashed #f1f5f9' : 'none',
                              paddingBottom: idx !== order.items.length - 1 ? '0.4rem' : '0',
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 700, color: '#1e293b' }}>
                                {item.name}
                              </span>
                              <span style={{ color: '#64748b', marginLeft: '6px' }}>
                                × {item.quantity}
                              </span>
                              {item.size && (
                                <span style={{ marginLeft: '6px', fontSize: '0.75rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                                  {item.size}
                                </span>
                              )}
                              {item.customizations && (
                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#008C3B', marginTop: '2px' }}>
                                  + Custom toppings: {item.customizations}
                                </span>
                              )}
                            </div>
                            <span style={{ fontWeight: 700, color: '#008C3B' }}>
                              ₱{Number(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Total */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', paddingTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Paid:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#008C3B' }}>
                      ₱{Number(order.total_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

