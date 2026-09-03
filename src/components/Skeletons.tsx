'use client';

import React from 'react';

/**
 * Skeleton placeholder for a single food / product card
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      className="card-box"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        position: 'relative',
        minHeight: '380px',
      }}
    >
      {/* Category Tag */}
      <div className="skeleton" style={{ width: '60px', height: '18px', borderRadius: '12px', marginBottom: '1rem', alignSelf: 'flex-start' }} />

      {/* Product Image Circle/Box */}
      <div className="skeleton" style={{ width: '160px', height: '160px', borderRadius: '50%', marginBottom: '1.25rem' }} />

      {/* Product Title */}
      <div className="skeleton" style={{ width: '80%', height: '22px', borderRadius: '4px', marginBottom: '0.5rem' }} />

      {/* Price */}
      <div className="skeleton" style={{ width: '40%', height: '20px', borderRadius: '4px', marginBottom: '1rem' }} />

      {/* Action Buttons */}
      <div style={{ width: '100%', display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <div className="skeleton" style={{ flex: 1, height: '40px', borderRadius: '8px' }} />
        <div className="skeleton" style={{ flex: 1, height: '40px', borderRadius: '8px' }} />
      </div>
    </div>
  );
};

/**
 * Grid of product card skeletons
 */
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="four-col-grid" style={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Category Pills in Menu
 */
export const CategoryPillsSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
      {[80, 100, 90, 110, 85, 95].map((width, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{ width: `${width}px`, height: '42px', borderRadius: '24px' }}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton for Product Detail Page
 */
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="container" style={{ maxWidth: '1000px', padding: '3rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Large Product Image Box */}
        <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', maxHeight: '450px' }} />

        {/* Product Config Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="skeleton" style={{ width: '100px', height: '24px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ width: '85%', height: '36px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '40%', height: '32px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '100%', height: '60px', borderRadius: '6px' }} />

          {/* Option Group 1 */}
          <div style={{ marginTop: '1rem' }}>
            <div className="skeleton" style={{ width: '140px', height: '20px', marginBottom: '0.75rem', borderRadius: '4px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="skeleton" style={{ height: '50px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '50px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '50px', borderRadius: '8px' }} />
            </div>
          </div>

          {/* Option Group 2 */}
          <div>
            <div className="skeleton" style={{ width: '160px', height: '20px', marginBottom: '0.75rem', borderRadius: '4px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div className="skeleton" style={{ height: '50px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '50px', borderRadius: '8px' }} />
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="skeleton" style={{ width: '100%', height: '52px', borderRadius: '8px', marginTop: '1.5rem' }} />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Customer Orders List
 */
export const OrderCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: '140px', height: '24px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '90px', height: '24px', borderRadius: '12px' }} />
      </div>
      <div className="skeleton" style={{ width: '60%', height: '18px', marginBottom: '0.75rem', borderRadius: '4px' }} />
      <div className="skeleton" style={{ width: '80%', height: '18px', marginBottom: '1.25rem', borderRadius: '4px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
        <div className="skeleton" style={{ width: '110px', height: '26px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
      </div>
    </div>
  );
};

/**
 * Skeleton for Admin Tables (Products, Orders, Accounts, Users)
 */
export const AdminTableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  return (
    <div style={{ width: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      {/* Table Controls Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div className="skeleton" style={{ width: '220px', height: '40px', borderRadius: '8px' }} />
        <div className="skeleton" style={{ width: '140px', height: '40px', borderRadius: '8px' }} />
      </div>

      {/* Table Rows Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '15px',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="skeleton" style={{ height: '22px', borderRadius: '4px' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Admin Dashboard Metric Cards
 */
export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card-box"
            style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'left', minHeight: '120px' }}
          >
            <div className="skeleton" style={{ width: '120px', height: '16px', marginBottom: '0.75rem', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '6px' }} />
          </div>
        ))}
      </div>

      {/* Table Section */}
      <AdminTableSkeleton rows={4} columns={5} />
    </div>
  );
};

/**
 * Skeleton for Cart Page
 */
export const CartPageSkeleton: React.FC = () => {
  return (
    <div className="container" style={{ maxWidth: '1000px', padding: '2rem 1.5rem' }}>
      <div className="skeleton" style={{ width: '200px', height: '36px', margin: '0 auto 2rem auto', borderRadius: '6px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '8px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '70%', height: '20px', marginBottom: '8px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '40%', height: '18px', borderRadius: '4px' }} />
              </div>
              <div className="skeleton" style={{ width: '70px', height: '36px', borderRadius: '6px' }} />
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <div className="skeleton" style={{ width: '140px', height: '24px', marginBottom: '1.25rem', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '100%', height: '20px', marginBottom: '0.75rem', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '100%', height: '20px', marginBottom: '1.5rem', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
};
