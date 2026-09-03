'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname && pathname.startsWith('/admin')) return null;

  return (
    <footer style={{
      backgroundColor: '#222',
      color: '#eee',
      marginTop: 'auto',
      padding: '3rem 1.5rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2.5rem',
        borderBottom: '1px solid #444',
        paddingBottom: '2.5rem',
      }}>
        {/* Brand Column */}
        <div>
          <h3 style={{ color: '#008C3B', fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
            Paquito's Pizza
          </h3>
          <p style={{ color: '#aaa', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Serving the finest handmade, woodfired Italian & special specialty pizzas crafted with 100% fresh, authentic ingredients.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Home</Link></li>
            <li><Link href="/menu" style={{ color: '#aaa', textDecoration: 'none' }}>Pizza Menu</Link></li>
            <li><Link href="/orders" style={{ color: '#aaa', textDecoration: 'none' }}>My Orders</Link></li>
            <li><Link href="/about" style={{ color: '#aaa', textDecoration: 'none' }}>About Our Story</Link></li>
            <li><Link href="/faq" style={{ color: '#aaa', textDecoration: 'none' }}>Frequently Asked Questions</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Store Hours & Delivery
          </h4>
          <p style={{ color: '#aaa', lineHeight: 1.8, fontSize: '0.95rem' }}>
            Monday – Sunday: 10:00 AM – 10:00 PM<br />
            Fast Delivery & Pickup Available<br />
            Contact: support@paquitospizza.com
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#777', fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} Paquito's Pizza. All rights reserved.
      </div>
    </footer>
  );
};

