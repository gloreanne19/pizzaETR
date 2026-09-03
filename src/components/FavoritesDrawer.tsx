'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Favorite } from '@/types/database';
import { HeartIcon, TrashIcon } from './Icons';
import { getImageUrl } from '@/lib/image-helper';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ isOpen, onClose }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, refreshStats } = useAuth();
  const { showToast } = useToast();

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setFavorites(json.data.favorites || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchFavorites();
  }, [isOpen, user]);

  const removeFavorite = async (productId: number) => {
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
        refreshStats();
        showToast('Removed from favorites', 'info');
      }
    } catch (e) {
      showToast('Failed to remove favorite', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 99998,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div style={{
        background: '#fff',
        width: '100%',
        maxWidth: '380px',
        height: '100%',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideLeft 0.3s ease-out',
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartIcon filled size={20} /> My Favorites ({favorites.length})
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
          >
            &times;
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#888' }}>Loading favorites...</p>
          ) : favorites.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '3rem' }}>
              <p style={{ marginTop: '1rem', fontWeight: 600, color: '#475569' }}>No favorites added yet!</p>
              <Link
                href="/menu"
                onClick={onClose}
                className="btn"
                style={{ marginTop: '1.5rem', display: 'inline-block' }}
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                  }}
                >
                  <img
                    src={getImageUrl(fav.image)}
                    alt={fav.name}
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', color: '#222' }}>{fav.name}</h4>
                    <p style={{ color: '#008C3B', fontWeight: 700 }}>₱{Number(fav.price).toFixed(2)}</p>
                    <Link
                      href={`/product/${fav.product_id}`}
                      onClick={onClose}
                      style={{ fontSize: '0.85rem', color: '#3498db', fontWeight: 600 }}
                    >
                      Configure & Order &rarr;
                    </Link>
                  </div>
                  <button
                    onClick={() => removeFavorite(fav.product_id)}
                    title="Remove from favorites"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e11d48',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
