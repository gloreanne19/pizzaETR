'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, OptionGroup, OptionChoice } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HeartIcon } from '@/components/Icons';
import { AddToCartModal, AddedCartItem } from '@/components/AddToCartModal';
import { getImageUrl } from '@/lib/image-helper';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const productId = parseInt(params.id, 10);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  // Dynamic Universal Options State
  const [customOptionGroups, setCustomOptionGroups] = useState<OptionGroup[]>([]);
  const [selectedSingle, setSelectedSingle] = useState<Record<string, OptionChoice>>({});
  const [selectedMulti, setSelectedMulti] = useState<Record<string, OptionChoice[]>>({});

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedItemModal, setAddedItemModal] = useState<AddedCartItem | null>(null);

  const { user, refreshStats } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Fetch product details
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.data) {
          const prod: Product = data.data.product;
          setProduct(prod);

          let optionGroupsToUse: OptionGroup[] = [];

          // Parse Custom Option Groups if configured
          if (prod.customization_options) {
            try {
              const parsed: OptionGroup[] = JSON.parse(prod.customization_options);
              if (Array.isArray(parsed) && parsed.length > 0) {
                optionGroupsToUse = parsed;
              }
            } catch (e) {
              optionGroupsToUse = [];
            }
          }

          // Fallback: If no option groups yet and product category is Pizza with customizations enabled
          if (optionGroupsToUse.length === 0 && prod.has_customizations && (prod.category || 'Pizza').toLowerCase().includes('pizza')) {
            optionGroupsToUse = [
              {
                id: 'pizza_crust_default',
                title: 'Select Crust Size',
                type: 'single',
                required: true,
                choices: [
                  { name: 'Solo (10")', price: 0 },
                  { name: 'Medium (12")', price: 80 },
                  { name: 'Family (14")', price: 150 },
                ],
              },
            ];
          }

          setCustomOptionGroups(optionGroupsToUse);

          // Initialize defaults
          const initialSingle: Record<string, OptionChoice> = {};
          const initialMulti: Record<string, OptionChoice[]> = {};

          optionGroupsToUse.forEach((grp) => {
            const key = grp.id || grp.title;
            if (grp.type === 'single' && grp.choices.length > 0) {
              initialSingle[key] = grp.choices[0];
            } else if (grp.type === 'multiple') {
              initialMulti[key] = [];
            }
          });

          setSelectedSingle(initialSingle);
          setSelectedMulti(initialMulti);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Check favorite status
    if (user) {
      fetch('/api/favorites')
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success' && data.data?.favorites) {
            const isFav = data.data.favorites.some(
              (f: any) => Number(f.product_id || f.pid) === productId
            );
            setIsFavorite(isFav);
          }
        })
        .catch(console.error);
    }
  }, [productId, user]);

  const toggleFavorite = async () => {
    if (!user) {
      showToast('Please sign in to save favorites', 'warning');
      return;
    }
    setTogglingFav(true);
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const nextState = data.action === 'added';
        setIsFavorite(nextState);
        showToast(data.message || (nextState ? 'Added to favorites!' : 'Removed from favorites'), 'success');
        refreshStats();
      } else {
        showToast(data.message || 'Failed to update favorites', 'error');
      }
    } catch (e) {
      showToast('Error updating favorites', 'error');
    } finally {
      setTogglingFav(false);
    }
  };

  const handleSelectSingleChoice = (groupId: string, choice: OptionChoice) => {
    setSelectedSingle((prev) => ({
      ...prev,
      [groupId]: choice,
    }));
  };

  const toggleMultiChoice = (groupId: string, choice: OptionChoice) => {
    setSelectedMulti((prev) => {
      const currentList = prev[groupId] || [];
      const exists = currentList.some((c) => c.name === choice.name);
      const updated = exists
        ? currentList.filter((c) => c.name !== choice.name)
        : [...currentList, choice];
      return {
        ...prev,
        [groupId]: updated,
      };
    });
  };

  // Pricing calculation
  const basePrice = product ? Number(product.price) : 0;
  let dynamicExtra = 0;

  // Sum from universal single choice groups
  Object.values(selectedSingle).forEach((c) => {
    dynamicExtra += Number(c.price || 0);
  });
  // Sum from universal multi choice groups
  Object.values(selectedMulti).forEach((choices) => {
    choices.forEach((c) => {
      dynamicExtra += Number(c.price || 0);
    });
  });

  const unitPrice = basePrice + dynamicExtra;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Please sign in to add items to your cart', 'warning');
      return;
    }
    if (!product) return;

    if (product.status && product.status !== 'available') {
      showToast(`This item is currently ${product.status.replace('_', ' ')}.`, 'error');
      return;
    }

    setAddingToCart(true);

    // Build human-readable option summary
    const optionDetails: string[] = [];
    if (customOptionGroups.length > 0) {
      Object.entries(selectedSingle).forEach(([_, choice]) => {
        if (choice && choice.name) {
          optionDetails.push(`${choice.name}${choice.price > 0 ? ` (+₱${Number(choice.price).toFixed(2)})` : ''}`);
        }
      });
      Object.entries(selectedMulti).forEach(([_, choices]) => {
        choices.forEach((c) => {
          if (c && c.name) {
            optionDetails.push(`${c.name}${c.price > 0 ? ` (+₱${Number(c.price).toFixed(2)})` : ''}`);
          }
        });
      });
    }

    const optionsSummary = optionDetails.length > 0 ? optionDetails.join(', ') : null;

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          options: optionsSummary,
          unit_price: unitPrice,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        showToast(`${product.name} added to cart!`, 'success');
        refreshStats();
        setAddedItemModal({
          name: product.name,
          image: product.image,
          quantity,
          options: optionsSummary,
          unitPrice,
          totalPrice: unitPrice * quantity,
        });
      } else {
        showToast(data.message || 'Failed to add item to cart', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error adding item to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Product Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested item does not exist or has been removed.</p>
        <Link href="/menu" className="btn" style={{ marginTop: '1.5rem' }}>
          &larr; Back to Menu
        </Link>
      </div>
    );
  }

  const isAvailable = !product.status || product.status === 'available';

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Back Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/menu"
          style={{
            color: '#008C3B',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}
        >
          &larr; Back to Menu
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        backgroundColor: '#fff',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
      }}>
        {/* Left: Product Image & Badges */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {!isAvailable && (
              <span style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: product.status === 'sold_out' ? '#ea580c' : '#dc2626',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                zIndex: 2,
              }}>
                {product.status === 'sold_out' ? 'Sold Out' : 'Unavailable'}
              </span>
            )}

            {/* Favorite Button on Image Card */}
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={togglingFav}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: isFavorite ? '#fee2e2' : '#fff',
                border: isFavorite ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                color: isFavorite ? '#dc2626' : '#64748b',
                transition: 'all 0.2s ease',
                zIndex: 3,
              }}
            >
              <HeartIcon size={22} fill={isFavorite ? '#dc2626' : 'none'} />
            </button>

            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '320px',
                objectFit: 'contain',
                opacity: !isAvailable ? 0.6 : 1,
              }}
            />
          </div>
          <span style={{
            marginTop: '1rem',
            backgroundColor: '#f0fdf4',
            color: '#008C3B',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
          }}>
            {product.category || 'Pizza'}
          </span>
        </div>

        {/* Right: Product Details & Dynamic Customizer */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
              {product.name}
            </h1>
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={togglingFav}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isFavorite ? '#fee2e2' : '#f8fafc',
                border: isFavorite ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '6px 14px',
                color: isFavorite ? '#dc2626' : '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <HeartIcon size={16} fill={isFavorite ? '#dc2626' : 'none'} />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {product.description || 'Prepared fresh with high quality ingredients and authentic recipe.'}
          </p>

          {/* Dynamic Option Groups Customizer */}
          {customOptionGroups.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {customOptionGroups.map((group) => {
                const groupKey = group.id || group.title;
                const isSingle = group.type === 'single';

                return (
                  <div key={groupKey} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        {group.title}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                        {isSingle ? (group.required ? 'Select 1 (Required)' : 'Select 1') : 'Multiple Optional'}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: '0.65rem',
                    }}>
                      {group.choices.map((choice, idx) => {
                        const isSelected = isSingle
                          ? selectedSingle[groupKey]?.name === choice.name
                          : (selectedMulti[groupKey] || []).some((c) => c.name === choice.name);

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (isSingle) {
                                handleSelectSingleChoice(groupKey, choice);
                              } else {
                                toggleMultiChoice(groupKey, choice);
                              }
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #008C3B' : '1px solid #cbd5e1',
                              backgroundColor: isSelected ? '#f0fdf4' : '#fff',
                              color: isSelected ? '#008C3B' : '#334155',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{choice.name}</span>
                            <span style={{ fontSize: '0.78rem', color: isSelected ? '#008C3B' : '#64748b', fontWeight: 600 }}>
                              {choice.price > 0 ? `+₱${Number(choice.price).toFixed(2)}` : 'Free'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pricing and Add to Cart Section */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '1.5rem',
            borderTop: '2px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', fontWeight: 600 }}>
                  Calculated Price:
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#008C3B' }}>
                  ₱{totalPrice.toFixed(2)}
                </span>
                {quantity > 1 && (
                  <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '8px' }}>
                    (₱{unitPrice.toFixed(2)} each)
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    color: '#334155',
                  }}
                >
                  -
                </button>
                <span style={{ padding: '8px 16px', fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    background: 'transparent',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    color: '#334155',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={!isAvailable || addingToCart}
              onClick={handleAddToCart}
              className="btn"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                justifyContent: 'center',
                backgroundColor: !isAvailable ? '#94a3b8' : '#008C3B',
                cursor: !isAvailable ? 'not-allowed' : 'pointer',
              }}
            >
              {addingToCart
                ? 'Adding to Cart...'
                : !isAvailable
                  ? 'Item Unavailable'
                  : `Add ${quantity} to Cart • ₱${totalPrice.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Add To Cart Confirmation Modal */}
      <AddToCartModal
        isOpen={!!addedItemModal}
        onClose={() => setAddedItemModal(null)}
        item={addedItemModal}
      />
    </div>
  );
}
