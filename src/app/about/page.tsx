'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      <h1 className="heading">About <span>Paquito's Pizza</span></h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        alignItems: 'center',
        background: '#fff',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        marginBottom: '3rem',
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#222', marginBottom: '1.25rem', fontWeight: 800 }}>
            Passionate About Authentic Homemade Crusts
          </h2>
          <p style={{ color: '#666', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1rem' }}>
            At <strong>Paquito's Pizza</strong>, we believe every memorable gathering starts with a handcrafted, oven-baked pizza. From slow-fermented handmade dough to vine-ripened tomatoes and freshly grated mozzarella, every slice tells a story of passion and quality.
          </p>
          <p style={{ color: '#666', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '2rem' }}>
            Whether you are dining with family, grabbing a quick lunch, or hosting a celebration with friends, our kitchen is dedicated to delivering culinary delight with warm hospitality and fast, piping-hot delivery.
          </p>
          <Link href="/menu" className="btn" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
            Order Your Pizza &rarr;
          </Link>
        </div>

        <div style={{ textAlign: 'center' }}>
          <img
            src="/images/PIZZABG.png"
            alt="Authentic Homemade Pizza"
            style={{
              maxWidth: '100%',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            }}
          />
        </div>
      </div>

      {/* 3 Step Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '2rem',
        textAlign: 'center',
        marginTop: '3rem',
      }}>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <img src="/images/order to bake.png" alt="Order to Bake" style={{ height: '70px', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#222', marginBottom: '0.5rem' }}>Handcrafted On Order</h3>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>We only bake upon your order to guarantee peak crust crispiness and melted cheese freshness.</p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <img src="/images/dine-delivery.png" alt="Express Delivery" style={{ height: '70px', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#222', marginBottom: '0.5rem' }}>Hot & Express Delivery</h3>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Insulated thermal packaging keeps your food steaming hot straight from oven to table.</p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <img src="/images/Share with friends.png" alt="Share Joy" style={{ height: '70px', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#222', marginBottom: '0.5rem' }}>Satisfaction Guaranteed</h3>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Thousands of happy customers choose Paquito's Pizza for birthdays, parties, and family dinners.</p>
        </div>
      </div>
    </div>
  );
}

