'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HeartIcon, SearchIcon, ArrowLeftIcon } from '@/components/Icons';
import { getImageUrl } from '@/lib/image-helper';

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Pizza']);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('all');
  const { user, refreshStats } = useAuth();
  const { showToast } = useToast();

  const priceFilters = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₱200', value: '200' },
    { label: '₱200 - ₱400', value: '400' },
    { label: '₱400 - ₱600', value: '600' },
    { label: '₱600 & Above', value: '601' },
  ];

  // Fetch all products & categories
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set('search', searchTerm);
      if (selectedPriceTier !== 'all') queryParams.set('price', selectedPriceTier);
      if (selectedCategory) queryParams.set('category', selectedCategory);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setProducts(data.data.products || []);
        if (data.data.categories && data.data.categories.length > 0) {
          setCategories(data.data.categories);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedPriceTier, selectedCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchTerm('');
    setSelectedPriceTier('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    setSelectedPriceTier('all');
  };

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
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

  // Helper to find a representative image for category card
  const getCategoryHeroImage = (categoryName: string): string => {
    const matched = products.find(
      (p) => (p.category || 'Pizza').toLowerCase() === categoryName.toLowerCase() && p.image
    );
    if (matched) return getImageUrl(matched.image);
    return getImageUrl('Hawaiian.png');
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      {/* ------------------------------------------------------------- */}
      {/* 1. CATEGORY SELECTION HUB (Shown when no category is selected) */}
      {/* ------------------------------------------------------------- */}
      {!selectedCategory ? (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 className="heading" style={{ marginBottom: '0.75rem' }}>
              Select a <span>Menu Category</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Choose a category below to explore our fresh artisan offerings.
            </p>
          </div>

          {/* Quick Search across all products if user wants to search directly */}
          <div style={{
            maxWidth: '480px',
            margin: '0 auto 2.5rem',
            position: 'relative',
          }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search any item by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.75rem', borderRadius: '30px', height: '46px', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
            />
            <span style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              <SearchIcon size={18} />
            </span>
          </div>

          {/* If user typed a search term, show direct matching results */}
          {searchTerm.trim().length > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                  Search Results for "{searchTerm}" ({products.length})
                </h2>
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: '#008C3B', fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear Search
                </button>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '3rem 0' }}>Searching catalog...</p>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ color: '#334155' }}>No items found matching "{searchTerm}"</h3>
                  <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Try searching with different keywords or pick a category below.</p>
                </div>
              ) : (
                <div
                  className="four-col-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '1.5rem',
                    width: '100%',
                  }}
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="card-box"
                      onClick={() => router.push(`/product/${product.id}`)}
                      style={{ position: 'relative', display: 'flex', flexDirection: 'column', textAlign: 'left', cursor: 'pointer' }}
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
                              width: '36px',
                              height: '36px',
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
                            <HeartIcon size={18} fill={isFav ? '#dc2626' : 'none'} />
                          </button>
                        );
                      })()}

                      <img
                        src={`/uploaded_img/${product.image}`}
                        alt={product.name}
                        style={{ width: '100%', height: '170px', objectFit: 'contain', marginBottom: '0.75rem' }}
                      />

                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#008C3B', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '0.35rem' }}>
                        {product.category || 'Pizza'}
                      </span>

                      <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.35rem', textAlign: 'left', fontWeight: 800 }}>
                        {product.name}
                      </h3>

                      <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1rem', flex: 1, textAlign: 'left' }}>
                        {product.description || 'Prepared fresh to order.'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                            {product.has_customizations ? 'Starts at' : 'Price'}
                          </span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#008C3B' }}>
                            ₱{Number(product.price).toFixed(2)}
                          </span>
                        </div>
                        <Link
                          href={`/product/${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="btn"
                          style={{ padding: '0.55rem 1.15rem', fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                          ORDER NOW
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* 4-Column Category Grid: strictly 4 items per row; 1-3 items do not stretch into 2-4 column */
            <div
              className="four-col-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '1.5rem',
                width: '100%',
              }}
            >
              {categories.map((cat) => {
                const heroImg = getCategoryHeroImage(cat);

                return (
                  <div
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '2px solid #008C3B',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Category Thumbnail Image Container with White Background */}
                    <div style={{
                      backgroundColor: '#fff',
                      height: '170px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.25rem 1.25rem 0.5rem',
                    }}>
                      <img
                        src={heroImg}
                        alt={cat}
                        style={{
                          maxHeight: '140px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>

                    {/* Card Body with ONLY Title Category */}
                    <div style={{ padding: '1rem 1rem 1.25rem', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                        {cat}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* 2. CATEGORY SELECTED VIEW (Products within the chosen category) */
        /* ------------------------------------------------------------- */
        <div>
          {/* Breadcrumb / Back to Categories Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              onClick={handleBackToCategories}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                padding: '0.6rem 1.25rem',
                borderRadius: '24px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <ArrowLeftIcon size={16} />
              <span>All Categories</span>
            </button>

            {/* Category Quick Switcher Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map((c) => {
                const isActive = selectedCategory.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    onClick={() => handleSelectCategory(c)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isActive ? '1px solid #008C3B' : '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#008C3B' : '#fff',
                      color: isActive ? '#fff' : '#64748b',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="heading" style={{ margin: 0 }}>
              Our Fresh <span>{selectedCategory}</span>
            </h1>
          </div>

          {/* Search and Price Filter Controls */}
          <div style={{
            background: '#fff',
            padding: '1.25rem',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #e2e8f0',
          }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder={`Search ${selectedCategory.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', borderRadius: '30px' }}
              />
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999', display: 'flex', alignItems: 'center' }}>
                <SearchIcon size={16} />
              </span>
            </div>

            {/* Price Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {priceFilters.map((tier) => {
                const isSelected = selectedPriceTier === tier.value;
                return (
                  <button
                    key={tier.value}
                    onClick={() => setSelectedPriceTier(tier.value)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#1e293b' : '#f1f5f9',
                      color: isSelected ? '#fff' : '#475569',
                      border: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-Column Product Grid */}
          {loading ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '3rem 0' }}>Loading items...</p>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: '0.5rem', color: '#1e293b', fontWeight: 800 }}>No {selectedCategory.toLowerCase()} found</h3>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Try clearing filters or search keywords.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedPriceTier('all'); }}
                className="btn"
                style={{ marginTop: '1.5rem' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className="four-col-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '1.5rem',
                width: '100%',
              }}
            >
              {products.map((product) => (
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
                          width: '36px',
                          height: '36px',
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
                        <HeartIcon size={18} fill={isFav ? '#dc2626' : 'none'} />
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
                        fontSize: '0.72rem',
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
                      height: '180px',
                      objectFit: 'contain',
                      marginBottom: '0.75rem',
                      opacity: product.status && product.status !== 'available' ? 0.65 : 1,
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#008C3B', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>
                      {product.category || 'Pizza'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: '#222', marginBottom: '0.4rem', textAlign: 'left', fontWeight: 800 }}>
                    {product.name}
                  </h3>

                  <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '1.25rem', flex: 1, textAlign: 'left' }}>
                    {product.description || 'Prepared fresh with authentic quality ingredients.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                        {product.has_customizations ? 'Starts at' : 'Price'}
                      </span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#008C3B' }}>
                        ₱{Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    {product.status === 'available' || !product.status ? (
                      <Link
                        href={`/product/${product.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn"
                        style={{
                          padding: '0.6rem 1.25rem',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        ORDER NOW
                      </Link>
                    ) : (
                      <span style={{ backgroundColor: '#e2e8f0', color: '#64748b', padding: '0.55rem 1.1rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'not-allowed', textTransform: 'uppercase' }}>
                        {product.status === 'sold_out' ? 'Sold Out' : 'Unavailable'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}><p style={{ color: '#888' }}>Loading menu...</p></div>}>
      <MenuContent />
    </Suspense>
  );
}
