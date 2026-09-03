'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order, OrderItem } from '@/types/database';
import { useToast } from '@/context/ToastContext';

interface OrderWithItems extends Order {
  items?: OrderItem[];
}

// Audio Chime using Web Audio API (No external sound files required)
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Note 1: E5 (659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2: B5 (987Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.18);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.18);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Audio Context might be locked before first user interaction
  }
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Modals State
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithItems | null>(null);
  const [cancelCategory, setCancelCategory] = useState('Out of stock / ingredients unavailable');
  const [cancelCustomNotes, setCancelCustomNotes] = useState('');
  const [mapOrder, setMapOrder] = useState<OrderWithItems | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Real-time tracking
  const knownOrderIdsRef = useRef<Set<number>>(new Set());
  const isFirstFetchRef = useRef<boolean>(true);

  const { showToast } = useToast();

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (statusFilter) queryParams.set('status', statusFilter);
      if (typeFilter) queryParams.set('order_type', typeFilter);

      const res = await fetch(`/api/admin/orders?${queryParams.toString()}`);
      const data = await res.json();
      if (data.status === 'success' && data.data?.orders) {
        const fetchedOrders: OrderWithItems[] = data.data.orders;

        // Detect newly placed orders for real-time chime and toast
        if (!isFirstFetchRef.current) {
          const newOrders = fetchedOrders.filter((o) => !knownOrderIdsRef.current.has(o.id));
          if (newOrders.length > 0) {
            playOrderChime();
            showToast(`🔔 ${newOrders.length} new order(s) received in real-time!`, 'info');
          }
        }

        // Update known IDs set
        const newSet = new Set<number>();
        fetchedOrders.forEach((o) => newSet.add(o.id));
        knownOrderIdsRef.current = newSet;
        isFirstFetchRef.current = false;

        setOrders(fetchedOrders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [search, statusFilter, typeFilter, showToast]);

  // Initial fetch & filter debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  // Real-time background sync interval (every 4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateStatus = async (
    orderId: number,
    newStatus: 'pending' | 'ready' | 'completed' | 'cancelled',
    cancellationReason?: string
  ) => {
    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, cancellation_reason: cancellationReason }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || `Order #${orderId} status updated`, 'success');
        fetchOrders(true);
      } else {
        showToast(data.message || 'Failed to update order status', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error updating order status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const submitOrderCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToCancel) return;
    const finalReason = cancelCategory === 'Other (specify below)'
      ? (cancelCustomNotes.trim() || 'Order cancelled by store')
      : (cancelCustomNotes.trim() ? `${cancelCategory} — ${cancelCustomNotes.trim()}` : cancelCategory);

    setSubmitting(true);
    try {
      await handleUpdateStatus(orderToCancel.id, 'cancelled', finalReason);
      setOrderToCancel(null);
      setCancelCustomNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(`Order #${orderToDelete} deleted`, 'info');
        setOrderToDelete(null);
        fetchOrders(true);
      } else {
        showToast(data.message || 'Failed to delete order', 'error');
      }
    } catch (e) {
      showToast('Error deleting order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddressToClipboard = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    showToast('Address copied to clipboard!', 'info');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getStatusBadge = (order: Order) => {
    const status = order.order_status || (order.payment_status === 'completed' ? 'completed' : 'pending');
    switch (status) {
      case 'pending':
        return { label: 'Pending Review', bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
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
    <div>
      {/* Header & Live Real-Time Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
            Customer Orders Management
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Accept incoming orders, coordinate delivery & pickup fulfillment, and track live status
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#fff',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem',
      }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by customer name, phone, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '340px' }}
        />

        {/* Order Type Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Type:</span>
          <button
            type="button"
            onClick={() => setTypeFilter('')}
            style={{
              padding: '5px 12px',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: typeFilter === '' ? '#334155' : '#f1f5f9',
              color: typeFilter === '' ? '#fff' : '#475569',
            }}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('delivery')}
            style={{
              padding: '5px 12px',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: typeFilter === 'delivery' ? '#0284c7' : '#f1f5f9',
              color: typeFilter === 'delivery' ? '#fff' : '#475569',
            }}
          >
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('pickup')}
            style={{
              padding: '5px 12px',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: typeFilter === 'pickup' ? '#d97706' : '#f1f5f9',
              color: typeFilter === 'pickup' ? '#fff' : '#475569',
            }}
          >
            Store Pickup
          </button>
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: '', label: 'All Orders', activeBg: '#1e293b' },
            { id: 'pending', label: 'Pending Review', activeBg: '#f59e0b' },
            { id: 'ready', label: 'Ready / En Route', activeBg: '#6366f1' },
            { id: 'completed', label: 'Completed', activeBg: '#10b981' },
            { id: 'cancelled', label: 'Cancelled', activeBg: '#ef4444' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: statusFilter === tab.id ? tab.activeBg : '#f1f5f9',
                color: statusFilter === tab.id ? '#fff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        {loading && orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '3rem 0' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '3rem 0' }}>No customer orders found matching your filters</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Placed On</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Delivery Address</th>
                <th>Payment</th>
                <th>Items Ordered</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Record</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const badge = getStatusBadge(order);
                const currentStatus = order.order_status || (order.payment_status === 'completed' ? 'completed' : 'pending');
                const isPickup = order.order_type === 'pickup';
                const isBusy = processingId === order.id;

                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 800 }}>#{order.id}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(order.placed_on).toLocaleDateString()}<br />
                      {new Date(order.placed_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: isPickup ? '#fef3c7' : '#e0f2fe',
                        color: isPickup ? '#92400e' : '#0369a1',
                      }}>
                        {isPickup ? 'Pickup' : 'Delivery'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{order.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.number}</div>
                    </td>

                    {/* Clickable Address directly opening Map Modal */}
                    <td style={{ maxWidth: '220px', fontSize: '0.82rem', color: '#475569' }}>
                      <button
                        type="button"
                        onClick={() => setMapOrder(order)}
                        title="Click to view delivery location map"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: '#0284c7',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          lineHeight: '1.4',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          display: 'block',
                        }}
                      >
                        {order.address}
                      </button>
                      {order.delivery_notes && (
                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px', fontWeight: 500 }}>
                          Note: {order.delivery_notes}
                        </div>
                      )}
                    </td>

                    <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {order.method}
                    </td>

                    <td style={{ maxWidth: '220px', fontSize: '0.82rem' }}>
                      {order.items && order.items.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {order.items.map((it) => (
                            <li key={it.id} style={{ marginBottom: '2px' }}>
                              • <strong>{it.name}</strong> × {it.quantity} {it.size ? <span style={{ color: '#008C3B' }}>({it.size})</span> : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        order.total_products || '—'
                      )}
                    </td>

                    <td style={{ fontWeight: 800, color: '#008C3B', fontSize: '0.95rem' }}>
                      ₱{Number(order.total_price).toFixed(2)}
                    </td>

                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                      }}>
                        {badge.label}
                      </span>
                      {order.cancellation_reason && (
                        <div style={{
                          color: '#b91c1c',
                          fontSize: '0.73rem',
                          marginTop: '4px',
                          lineHeight: '1.3',
                          maxWidth: '160px',
                          fontWeight: 600,
                        }}>
                          Reason: {order.cancellation_reason}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {currentStatus === 'pending' && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#008C3B',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isBusy ? 'Saving...' : 'Accept Order'}
                          </button>
                        )}

                        {currentStatus === 'ready' && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#10b981',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isBusy ? 'Saving...' : 'Complete & Record Sale'}
                          </button>
                        )}

                        {currentStatus === 'pending' && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              setOrderToCancel(order);
                              setCancelCategory('Out of stock / ingredients unavailable');
                              setCancelCustomNotes('');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              textAlign: 'left',
                              padding: '2px 0',
                              fontWeight: 600,
                            }}
                          >
                            Cancel order...
                          </button>
                        )}

                        {currentStatus === 'completed' && (
                          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
                            Completed
                          </span>
                        )}

                        {currentStatus === 'cancelled' && (
                          <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>
                            Cancelled
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setOrderToDelete(order.id)}
                        className="delete-btn"
                        style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancellation Reason Modal */}
      {orderToCancel && (
        <div
          onClick={() => setOrderToCancel(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Cancel Order #{orderToCancel.id}
              </h2>
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Please specify the cancellation reason. This explanation will be saved and visible to the customer on their order history.
            </p>

            <form onSubmit={submitOrderCancellation}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>
                  Primary Cancellation Reason:
                </label>
                <select
                  value={cancelCategory}
                  onChange={(e) => setCancelCategory(e.target.value)}
                  className="form-control"
                  style={{ width: '100%' }}
                >
                  <option value="Out of stock / ingredients unavailable">Out of stock / ingredients unavailable</option>
                  <option value="Customer requested order cancellation">Customer requested order cancellation</option>
                  <option value="Delivery location unreachable / out of service radius">Delivery location unreachable / out of service radius</option>
                  <option value="Store currently closed / kitchen peak capacity reached">Store currently closed / kitchen peak capacity reached</option>
                  <option value="Duplicate or test order">Duplicate or test order</option>
                  <option value="Other (specify below)">Other (specify below)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>
                  Additional Notes / Details (Optional):
                </label>
                <textarea
                  value={cancelCustomNotes}
                  onChange={(e) => setCancelCustomNotes(e.target.value)}
                  className="form-control"
                  rows={3}
                  placeholder="Provide additional details or message for the customer..."
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="btn"
                  style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn"
                  style={{ backgroundColor: '#dc2626', color: '#fff' }}
                >
                  {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Location Modal (Exact Pinned Coordinates or Geocoded Address) */}
      {mapOrder && (() => {
        const hasExactCoords = typeof mapOrder.lat === 'number' && typeof mapOrder.lng === 'number' && !isNaN(mapOrder.lat) && !isNaN(mapOrder.lng);
        const mapSrc = hasExactCoords
          ? `https://maps.google.com/maps?q=${mapOrder.lat},${mapOrder.lng}&t=&z=18&ie=UTF8&iwloc=&output=embed`
          : `https://maps.google.com/maps?q=${encodeURIComponent(mapOrder.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        const googleMapsUrl = hasExactCoords
          ? `https://www.google.com/maps/search/?api=1&query=${mapOrder.lat},${mapOrder.lng}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapOrder.address)}`;
        const wazeUrl = hasExactCoords
          ? `https://waze.com/ul?ll=${mapOrder.lat},${mapOrder.lng}&navigate=yes`
          : `https://waze.com/ul?q=${encodeURIComponent(mapOrder.address)}`;

        return (
          <div
            onClick={() => setMapOrder(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '640px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#1e293b',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                      Pinned Delivery Location — Order #{mapOrder.id}
                    </h2>
                    {hasExactCoords && (
                      <span style={{
                        backgroundColor: '#10b981',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}>
                        Exact Pin
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px' }}>
                    Customer: <strong>{mapOrder.name}</strong> • Phone: <strong>{mapOrder.number}</strong> ({mapOrder.order_type === 'pickup' ? 'Store Pickup' : 'Delivery'})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMapOrder(null)}
                  style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#cbd5e1' }}
                >
                  ✕
                </button>
              </div>

              {/* Address Details Banner */}
              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                  EXACT PINNED ADDRESS:
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginTop: '2px', lineHeight: 1.5 }}>
                  {mapOrder.address}
                </div>
                {hasExactCoords && (
                  <div style={{ fontSize: '0.82rem', color: '#059669', marginTop: '4px', fontWeight: 700 }}>
                    GPS Coordinates: {Number(mapOrder.lat).toFixed(6)}, {Number(mapOrder.lng).toFixed(6)}
                  </div>
                )}
                {mapOrder.delivery_notes && (
                  <div style={{ fontSize: '0.84rem', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>
                    Landmark / Notes: {mapOrder.delivery_notes}
                  </div>
                )}
              </div>

              {/* Interactive Embedded Map */}
              <div style={{ width: '100%', height: '330px', backgroundColor: '#e2e8f0', position: 'relative' }}>
                <iframe
                  title="Delivery Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={mapSrc}
                  style={{ border: 0 }}
                />
              </div>

              {/* Navigation & Action Footer */}
              <div style={{
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                backgroundColor: '#fff',
              }}>
                <button
                  type="button"
                  onClick={() => copyAddressToClipboard(hasExactCoords ? `${mapOrder.address} (GPS: ${mapOrder.lat}, ${mapOrder.lng})` : mapOrder.address)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: copiedAddress ? '#dcfce7' : '#f1f5f9',
                    color: copiedAddress ? '#15803d' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {copiedAddress ? 'Copied' : 'Copy Address'}
                </button>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    Open in Google Maps &rarr;
                  </a>
                  <a
                    href={wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      backgroundColor: '#334155',
                      color: '#fff',
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    Open in Waze &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div
          onClick={() => setOrderToDelete(null)}
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
              Delete Order #{orderToDelete}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete Order #{orderToDelete}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="btn"
                style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={confirmDeleteOrder}
                className="btn"
                style={{ backgroundColor: '#dc2626', color: '#fff' }}
              >
                {submitting ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pulse Animation Style */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <React.Suspense fallback={<div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Loading orders...</div>}>
      <AdminOrdersContent />
    </React.Suspense>
  );
}
