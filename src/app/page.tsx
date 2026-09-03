'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HeartIcon } from '@/components/Icons';
import { AddToCartModal, AddedCartItem } from '@/components/AddToCartModal';
import { getImageUrl } from '@/lib/image-helper';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [addedItemModal, setAddedItemModal] = useState<AddedCartItem | null>(null);
  const { user, refreshStats } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const quickOrder = async (product: Product) => {
    if (!user) {
      showToast('Please sign in to order!', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(`Added ${product.name} to cart!`, 'success');
        refreshStats();
        setAddedItemModal({
          name: product.name,
          image: product.image,
          quantity: 1,
          unitPrice: Number(product.price),
          totalPrice: Number(product.price),
        });
      } else {
        showToast(data.message || 'Failed to add to cart', 'error');
      }
    } catch (e) {
      showToast('Error ordering product', 'error');
    }
  };

  const slides = [
    {
      image: '/images/home-img-1.png',
      subtitle: 'YES WE HAVE THE',
      title: 'BEST HOMEMADE PIZZA',
      btnText: 'View Our Menu',
      link: '/menu',
    },
    {
      image: '/images/Hawaiian1.png',
      subtitle: 'CLASSIC FAVORITE',
      title: 'Hawaiian Special',
      btnText: 'Order Hawaiian',
      link: '/menu',
    },
    {
      image: '/images/Triple Cheese.png',
      subtitle: 'MELTY & CHEESY',
      title: 'Triple Cheese Feast',
      btnText: 'Taste Triple Cheese',
      link: '/menu',
    },
  ];

  // Auto-advance slider every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Fetch featured products for preview
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.data?.products) {
          setFeaturedProducts(data.data.products.slice(0, 6));
        }
      })
      .catch(console.error);

    if (user) {
      fetch('/api/favorites')
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success' && data.data?.favorites) {
            setFavoriteIds(data.data.favorites.map((f: any) => Number(f.product_id || f.pid)));
          }
        })
        .catch(console.error);
    } else {
      setFavoriteIds([]);
    }
  }, [user]);

  const toggleFavorite = async (productId: number) => {
    if (!user) {
      showToast('Please sign in to save favorites', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const isAdded = data.action === 'added';
        setFavoriteIds((prev) =>
          isAdded ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
        showToast(data.message || (isAdded ? 'Added to favorites!' : 'Removed from favorites'), 'success');
        refreshStats();
      } else {
        showToast(data.message || 'Failed to update favorites', 'error');
      }
    } catch (e) {
      showToast('Failed to update favorites', 'error');
    }
  };

  return (
    <div>
      {/* Hero Carousel Section */}
      <section style={{
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.86), rgba(245, 247, 245, 0.92)), url('/images/pizza_background_1_5.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '3.5rem 1.5rem',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Hero Content */}
          <div style={{ flex: '1 1 400px', animation: 'fadeIn 0.5s ease-in' }}>
            <span style={{
              color: '#e74c3c',
              fontWeight: 700,
              letterSpacing: '2px',
              fontSize: '1rem',
              textTransform: 'uppercase',
            }}>
              {slides[currentSlide].subtitle}
            </span>
            <h1 style={{
              fontSize: '3.2rem',
              fontWeight: 900,
              color: '#222',
              lineHeight: 1.15,
              margin: '0.8rem 0 1.5rem',
            }}>
              {slides[currentSlide].title}
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '480px' }}>
              Hand-tossed dough, slow-simmered rich tomato sauce, and premium mozzarella baked to golden perfection.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href={slides[currentSlide].link} className="btn" style={{ padding: '0.9rem 2rem', fontSize: '1.1rem' }}>
                {slides[currentSlide].btnText} &rarr;
              </Link>
              <Link href="/about" style={{ color: '#008C3B', fontWeight: 700, padding: '0.8rem 1rem' }}>
                Learn Our Story
              </Link>
            </div>

            {/* Slider Dots Indicator */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '2.5rem' }}>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: idx === currentSlide ? '28px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    backgroundColor: idx === currentSlide ? '#008C3B' : '#ccc',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Hero Pizza Image */}
          <div style={{ flex: '1 1 350px', textAlign: 'center' }}>
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              style={{
                maxWidth: '100%',
                maxHeight: '380px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.18))',
                animation: 'slideIn 0.5s ease',
              }}
            />
          </div>
        </div>
      </section>

      {/* 3 Step Process Highlight */}
      <section style={{ backgroundColor: '#fff', padding: '3rem 1.5rem', borderBottom: '1px solid #eee' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div style={{ padding: '1.5rem' }}>
            <img src="/images/order to bake.png" alt="Order & Bake" style={{ height: '70px', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#222' }}>1. Custom Bake</h3>
            <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.95rem' }}>Choose your size and customize with delicious toppings.</p>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <img src="/images/dine-delivery.png" alt="Fast Delivery" style={{ height: '70px', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#222' }}>2. Fast Delivery</h3>
            <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.95rem' }}>Hot, fresh, and delivered right to your doorstep in minutes.</p>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <img src="/images/Share with friends.png" alt="Enjoy Pizza" style={{ height: '70px', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#222' }}>3. Enjoy & Share</h3>
            <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.95rem' }}>Gather family and friends to share the best pizza in town.</p>
          </div>
        </div>
      </section>

      {/* Featured Pizzas Section */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <h2 className="heading">Featured <span>Pizzas</span></h2>

        {featuredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading delicious pizzas...</p>
        ) : (
          <div className="grid-container">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="card-box"
                onClick={() => router.push(`/product/${product.id}`)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {(() => {
                  const isFav = favoriteIds.includes(product.id);
                  return (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      className="card-fav-btn"
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: isFav ? '#fee2e2' : '#fff',
                        border: isFav ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        color: isFav ? '#dc2626' : '#64748b',
                        transition: 'all 0.2s ease',
                        zIndex: 2,
                      }}
                    >
                      <HeartIcon size={19} fill={isFav ? '#dc2626' : 'none'} />
                    </button>
                  );
                })()}

                {/* Status Badge */}
                {product.status && product.status !== 'available' && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      backgroundColor: product.status === 'sold_out' ? '#ea580c' : '#dc2626',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      zIndex: 2,
                    }}
                  >
                    {product.status === 'sold_out' ? 'Sold Out' : 'Unavailable'}
                  </span>
                )}

                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'contain',
                    marginBottom: '1rem',
                    opacity: product.status && product.status !== 'available' ? 0.7 : 1,
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008C3B', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>
                    {product.category || 'Pizza'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', color: '#222', marginBottom: '0.5rem', textAlign: 'left' }}>
                  {product.name}
                </h3>

                <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '1rem', minHeight: '40px', textAlign: 'left', flex: 1 }}>
                  {product.description || 'Freshly made with authentic ingredients and quality flavors.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                      {product.has_customizations ? 'Starting from' : 'Price'}
                    </span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#008C3B' }}>
                      ₱{Number(product.price).toFixed(2)}
                    </span>
                  </div>
                  {product.status === 'available' || !product.status ? (
                    <Link
                      href={`/product/${product.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="btn"
                      style={{
                        padding: '0.65rem 1.35rem',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      ORDER NOW
                    </Link>
                  ) : (
                    <span style={{ backgroundColor: '#e2e8f0', color: '#64748b', padding: '0.6rem 1.2rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'not-allowed', textTransform: 'uppercase' }}>
                      {product.status === 'sold_out' ? 'Sold Out' : 'Unavailable'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/menu" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Explore Full Menu &rarr;
          </Link>
        </div>
      </section>

      {/* Add To Cart Confirmation Modal */}
      <AddToCartModal
        isOpen={!!addedItemModal}
        onClose={() => setAddedItemModal(null)}
        item={addedItemModal}
      />
    </div>
  );
}

