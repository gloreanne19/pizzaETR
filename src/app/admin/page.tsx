'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardAnalytics } from '@/server/services/dashboard-service';

// Reusable Info Tooltip Component
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '6px' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <span
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          color: '#64748b',
          fontSize: '11px',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
          border: '1px solid #cbd5e1',
          userSelect: 'none',
        }}
      >
        ?
      </span>

      {show && (
        <span
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            lineHeight: '1.4',
            width: '220px',
            textAlign: 'left',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            pointerEvents: 'none',
            fontWeight: 400,
          }}
        >
          {text}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              marginLeft: '-5px',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#0f172a transparent transparent transparent',
            }}
          />
        </span>
      )}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.data?.stats) {
          setStats(data.data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: '#666', padding: '3rem 0', textAlign: 'center' }}>Loading dashboard analytics...</p>;
  }

  const statCards = [
    {
      title: 'Pending Orders',
      tooltip: 'Orders awaiting kitchen acceptance, currently preparing, or en route for delivery/pickup.',
      value: `${stats?.pendingOrdersCount || 0}`,
      subtext: `Queue Value: ₱${Number(stats?.pendingOrdersTotal || 0).toFixed(2)}`,
      color: '#f59e0b',
      link: '/admin/orders?status=pending',
    },
    {
      title: 'Completed Orders',
      tooltip: 'Total orders successfully delivered or collected by customers with payment confirmed.',
      value: `${stats?.completedOrdersCount || 0}`,
      subtext: `Delivered Value: ₱${Number(stats?.completedOrdersTotal || 0).toFixed(2)}`,
      color: '#10b981',
      link: '/admin/orders?status=completed',
    },
    {
      title: 'Total Sales Revenue',
      tooltip: 'Total cumulative revenue collected from all completed orders and recorded sales.',
      value: `₱${Number(stats?.totalSalesRevenue || 0).toFixed(2)}`,
      subtext: 'Accumulated store revenue',
      color: '#008C3B',
      link: '/admin/sales',
    },
    {
      title: 'Product Catalog',
      tooltip: 'Total food & beverage items listed in the database across all menu categories.',
      value: `${stats?.totalProductsCount || 0} Products`,
      subtext: `${stats?.availableProductsCount || 0} Live • ${stats?.soldOutProductsCount || 0} Sold Out • ${stats?.inactiveProductsCount || 0} Hidden`,
      color: '#3b82f6',
      link: '/admin/products',
    },
    {
      title: 'Registered Customers',
      tooltip: 'Total registered user accounts capable of ordering, customizing, and viewing history.',
      value: `${stats?.totalUsersCount || 0}`,
      subtext: 'Active customer accounts',
      color: '#8b5cf6',
      link: '/admin/users',
    },
    {
      title: 'Admin Accounts',
      tooltip: 'Authorized staff accounts with access to the store administration console.',
      value: `${stats?.totalAdminsCount || 0}`,
      subtext: 'Authorized managers',
      color: '#64748b',
      link: '/admin/accounts',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
            Store Operations Dashboard
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Real-time sales performance, inventory overview, and order fulfillment metrics
          </p>
        </div>
        <Link href="/admin/orders" className="btn">
          View All Orders &rarr;
        </Link>
      </div>

      {/* Analytics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        {statCards.map((card, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b' }}>
                    {card.title}
                  </span>
                  <InfoTooltip text={card.tooltip} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color, marginBottom: '0.25rem' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                {card.subtext}
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
              <Link
                href={card.link}
                style={{ fontSize: '0.82rem', fontWeight: 700, color: card.color, textDecoration: 'none' }}
              >
                View Details &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Operational KPIs & Category Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        {/* KPI Box 1: Financial & Performance Metrics */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Performance KPIs
            </h2>
            <InfoTooltip text="Core operational metrics tracking transaction quality, fulfillment efficiency, and stock status." />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Average Order Value (AOV)</span>
                <InfoTooltip text="Average gross revenue earned per completed order (Total Delivered Revenue ÷ Completed Orders)." />
              </div>
              <span style={{ fontWeight: 800, color: '#008C3B', fontSize: '1.1rem' }}>
                ₱{Number(stats?.averageOrderValue || 0).toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Order Fulfillment Rate</span>
                <InfoTooltip text="Percentage of customer orders successfully fulfilled and delivered without cancellation." />
              </div>
              <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '1.1rem' }}>
                {Number(stats?.fulfillmentRate || 0).toFixed(1)}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Total Processed Orders</span>
                <InfoTooltip text="Total volume of customer orders received by the store across all time." />
              </div>
              <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>
                {stats?.totalOrdersCount || 0}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Live Inventory Health</span>
                <InfoTooltip text="Active menu items currently available for ordering vs total catalog items." />
              </div>
              <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                {stats?.availableProductsCount || 0} / {stats?.totalProductsCount || 0} Available
              </span>
            </div>
          </div>
        </div>

        {/* KPI Box 2: Catalog Distribution Breakdown */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Category Distribution
              </h2>
              <InfoTooltip text="Distribution and percentage of catalog items across menu departments (Pizza, Drinks, Meals, etc.)." />
            </div>
            <Link href="/admin/categories" style={{ fontSize: '0.85rem', color: '#008C3B', fontWeight: 700, textDecoration: 'none' }}>
              Manage &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.categoryBreakdown && Object.entries(stats.categoryBreakdown).length > 0 ? (
              Object.entries(stats.categoryBreakdown).map(([cat, count]) => {
                const total = stats.totalProductsCount || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '3px' }}>
                      <span style={{ color: '#334155' }}>{cat}</span>
                      <span style={{ color: '#64748b' }}>{count} items ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#008C3B', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No category data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.75rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Recent Orders Activity
            </h2>
            <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: '#008C3B', fontWeight: 700, textDecoration: 'none' }}>
              View All Orders &rarr;
            </Link>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Order #</th>
                <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Placed On</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>#{order.id}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{order.name}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#008C3B' }}>
                    ₱{Number(order.total_price).toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: order.payment_status === 'completed' ? '#dcfce7' : '#fef3c7',
                      color: order.payment_status === 'completed' ? '#15803d' : '#b45309',
                    }}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(order.placed_on).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
