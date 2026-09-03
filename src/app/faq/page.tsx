'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How long does pizza delivery usually take?',
      a: 'Standard delivery time is between 30 to 45 minutes depending on traffic and order volume. All pizzas are baked fresh immediately after order confirmation.',
    },
    {
      q: 'Can I customize toppings and choose different crust sizes?',
      a: 'Yes! When you click on any pizza item from our menu, you can select your preferred size (e.g. Regular, Medium, Large) and add any combination of delicious extra toppings with real-time price updates.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD), GCash, Credit/Debit Cards, and PayPal. You can select your preferred payment method during checkout.',
    },
    {
      q: 'Is there a minimum order amount for delivery?',
      a: 'No minimum order required! However, delivery fees may vary slightly depending on your distance and delivery location.',
    },
    {
      q: 'How do I track my order status?',
      a: 'You can check the live progress of your order in the "My Orders" tab. Once our kitchen marks your payment and preparation complete, the status updates automatically to Completed.',
    },
    {
      q: 'Do you offer vegetarian and special diet options?',
      a: 'Yes, we have vegetarian options like Triple Cheese and Margherita, and you can customize any pizza with pure veggie toppings.',
    },
  ];

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', maxWidth: '850px' }}>
      <h1 className="heading">Frequently Asked <span>Questions</span></h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(idx)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isOpen ? '#f9fcf9' : '#fff',
                  borderBottom: isOpen ? '1px solid #eee' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: isOpen ? '#008C3B' : '#222' }}>
                  {faq.q}
                </span>
                <span style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: '#008C3B',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}>
                  ▼
                </span>
              </button>

              {isOpen && (
                <div style={{
                  padding: '1.25rem 1.5rem',
                  color: '#555',
                  lineHeight: 1.7,
                  fontSize: '1rem',
                  backgroundColor: '#fff',
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3.5rem', background: '#fff', padding: '2rem', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '1.3rem', color: '#222', marginBottom: '0.5rem' }}>Still have questions?</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Our team is always happy to assist you with special requests or catering orders.</p>
        <Link href="/menu" className="btn">
          Explore Pizzas &rarr;
        </Link>
      </div>
    </div>
  );
}

