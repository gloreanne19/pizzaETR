'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/image-helper';

export interface AddedCartItem {
  name: string;
  image: string;
  quantity: number;
  options?: string | null;
  unitPrice: number;
  totalPrice: number;
}

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AddedCartItem | null;
}

export function AddToCartModal({ isOpen, onClose, item }: AddToCartModalProps) {
  const router = useRouter();

  if (!isOpen || !item) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1.5rem',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          maxWidth: '460px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          ✕
        </button>

        {/* Success Check Badge */}
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 900,
            margin: '0 auto 1rem',
          }}
        >
          ✓
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.4rem' }}>
          Added to Cart!
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
          What would you like to do next?
        </p>

        {/* Item Summary Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'left',
            marginBottom: '1.5rem',
          }}
        >
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              padding: '4px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Quantity: <strong>{item.quantity}</strong>
            </div>
            {item.options && (
              <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '2px', fontWeight: 600, lineHeight: 1.3 }}>
                {item.options}
              </div>
            )}
          </div>
          <div style={{ fontWeight: 800, color: '#008C3B', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
            ₱{item.totalPrice.toFixed(2)}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/cart');
            }}
            className="btn"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 800,
              backgroundColor: '#008C3B',
              color: '#fff',
            }}
          >
            Proceed to Checkout &rarr;
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/menu');
            }}
            className="btn"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
            }}
          >
            Order More / View Menu
          </button>
        </div>
      </div>
    </div>
  );
}

