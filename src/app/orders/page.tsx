'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, OrderItem } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { OrderCardSkeleton } from '@/components/Skeletons';

interface OrderWithItems extends Order {
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.data?.orders) {
          setOrders(data.data.orders);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h2 style={{ marginTop: '1rem', color: '#1e293b', fontWeight: 800 }}>Please Sign In</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>You must be logged in to view your order history.</p>
        <Link href="/menu" className="btn" style={{ marginTop: '2rem' }}>
          Explore Menu
        </Link>
      </div>
    );
  }

  const getStatusBadge = (order: Order) => {
    const status = order.order_status || (order.payment_status === 'completed' ? 'completed' : 'pending');
    switch (status) {
      case 'pending':
        return { label: 'Pending Review', bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'preparing':
        return { label: 'Baking & Preparing', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'ready':
        return {
          label: order.order_type === 'pickup' ? 'Ready for Pickup' : 'En Route',
          bg: '#e0e7ff',
          color: '#3730a3',
          border: '#c7d2fe',
        };
      case 'completed':
        return { label: 'Completed', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
      case 'cancelled':
        return { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      default:
        return { label: status, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <h1 className="heading">My <span>Order History</span></h1>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', background: '#fff', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: '1rem', color: '#1e293b', fontWeight: 800 }}>No orders placed yet</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>When you place orders, track their preparation and delivery status here in real time.</p>
          <Link href="/menu" className="btn" style={{ marginTop: '2rem' }}>
            Explore Menu &rarr;
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const badge = getStatusBadge(order);
            const isPickup = order.order_type === 'pickup';

            return (
              <div
                key={order.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.3rem', color: '#1e293b', fontWeight: 800, margin: 0 }}>
                        Order #{order.id}
                      </h3>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: isPickup ? '#fef3c7' : '#e0f2fe',
                        color: isPickup ? '#92400e' : '#0369a1',
                        border: isPickup ? '1px solid #fde68a' : '1px solid #bae6fd',
                      }}>
                        {isPickup ? 'Store Pickup' : 'Home Delivery'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                      Placed on: {new Date(order.placed_on).toLocaleDateString()} at {new Date(order.placed_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      backgroundColor: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#008C3B' }}>
                      ₱{Number(order.total_price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery / Pickup Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}>
                  <div><strong style={{ color: '#475569' }}>Customer:</strong> {order.name} ({order.number})</div>
                  <div><strong style={{ color: '#475569' }}>Payment Method:</strong> {order.method}</div>
                  <div>
                    <strong style={{ color: '#475569' }}>{isPickup ? 'Collection Point' : 'Delivery Address'}:</strong> {order.address}
                    {order.delivery_notes && <div style={{ color: '#0284c7', fontSize: '0.8rem', marginTop: '2px', fontWeight: 600 }}>Note: {order.delivery_notes}</div>}
                  </div>
                </div>

                {/* Cancellation Reason Notice */}
                {order.cancellation_reason && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: '#991b1b',
                    fontSize: '0.88rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{ fontWeight: 800 }}>Reason for Cancellation:</span> {order.cancellation_reason}
                  </div>
                )}

                {/* Ordered Items */}
                {order.items && order.items.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 700 }}>
                      Ordered Items:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.4rem 0',
                            borderBottom: '1px dashed #f1f5f9',
                            fontSize: '0.9rem',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#1e293b' }}>{item.name}</strong> × {item.quantity}
                            {item.size && <span style={{ color: '#008C3B', fontWeight: 600, marginLeft: '6px' }}>({item.size})</span>}
                          </div>
                          <div style={{ fontWeight: 700, color: '#334155' }}>
                            ₱{Number(item.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
