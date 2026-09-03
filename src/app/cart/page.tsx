'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartItem, SavedAddress } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { TrashIcon, CartIcon } from '@/components/Icons';
import { getImageUrl } from '@/lib/image-helper';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Delivery / Pickup Form State
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [method, setMethod] = useState<'cod' | 'gcash' | 'bank'>('cod');

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [addressLabel, setAddressLabel] = useState('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  // Map & Pin State
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 14.5995, // Default Manila
    lng: 120.9842,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Pickup notes
  const [pickupNotes, setPickupNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const { user, refreshStats } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const fetchCartAndProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [cartRes, meRes] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/auth/me'),
      ]);

      const [cartData, meData] = await Promise.all([
        cartRes.json(),
        meRes.json(),
      ]);

      if (cartData.status === 'success' && cartData.data) {
        setCartItems(dataOrEmpty(cartData.data.items));
        setGrandTotal(cartData.data.grandTotal || 0);
      }

      if (meData.status === 'success' && meData.data?.user) {
        const u = meData.data.user;
        if (u.name) setName(u.name);
        if (u.number) setNumber(u.number);

        let parsedAddrs: SavedAddress[] = [];
        if (u.saved_addresses) {
          try {
            const p = JSON.parse(u.saved_addresses);
            if (Array.isArray(p)) parsedAddrs = p;
          } catch (e) { }
        } else if (u.address) {
          parsedAddrs = [{ id: 'default_home', label: 'Home', address: u.address }];
        }

        setSavedAddresses(parsedAddrs);
        if (parsedAddrs.length > 0) {
          setSelectedAddressId(parsedAddrs[0].id);
          setAddressText(parsedAddrs[0].address);
          setDeliveryNotes(parsedAddrs[0].details || '');
          if (parsedAddrs[0].lat && parsedAddrs[0].lng) {
            setMapCoordinates({ lat: parsedAddrs[0].lat, lng: parsedAddrs[0].lng });
          }
        } else if (u.address) {
          setAddressText(u.address);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const dataOrEmpty = (items: any) => (Array.isArray(items) ? items : []);

  useEffect(() => {
    fetchCartAndProfile();
  }, [user]);

  // Handle saved address selection
  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setAddressText(addr.address);
    setDeliveryNotes(addr.details || '');
    if (addr.lat && addr.lng) {
      setMapCoordinates({ lat: addr.lat, lng: addr.lng });
    }
  };

  // Handle new address selection
  const handleSelectNewAddress = () => {
    setSelectedAddressId('custom');
    setAddressText('');
    setDeliveryNotes('');
    setAddressLabel('Home');
  };

  // Geolocation pin locator
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCoordinates({ lat: latitude, lng: longitude });

        // Reverse geocode via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setAddressText(data.display_name);
            showToast('Location pinned successfully!', 'success');
          }
        } catch (err) {
          setAddressText(`Pinned Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        showToast('Unable to retrieve your current location. Please search or enter manually.', 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Address search via Nominatim
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingMap(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        setMapCoordinates({ lat, lng });
        setAddressText(item.display_name);
        showToast('Location found and pinned on map!', 'success');
      } else {
        showToast('Location not found. Try entering landmark or street name.', 'warning');
      }
    } catch (err) {
      showToast('Failed to search map address', 'error');
    } finally {
      setIsSearchingMap(false);
    }
  };

  const updateQuantity = async (cartId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1 || newQty > 100) return;

    try {
      const res = await fetch(`/api/cart/${cartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        fetchCartAndProfile();
        refreshStats();
      }
    } catch (e) {
      showToast('Failed to update quantity', 'error');
    }
  };

  const removeItem = async (cartId: number) => {
    if (!confirm('Remove this item from your cart?')) return;
    try {
      const res = await fetch(`/api/cart/${cartId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Item removed from cart', 'info');
        fetchCartAndProfile();
        refreshStats();
      }
    } catch (e) {
      showToast('Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    if (!confirm('Clear your entire cart?')) return;
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      if (res.ok) {
        showToast('Cart cleared', 'info');
        fetchCartAndProfile();
        refreshStats();
      }
    } catch (e) {
      showToast('Failed to clear cart', 'error');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      showToast('Your cart is empty!', 'warning');
      return;
    }

    if (orderType === 'delivery' && (!addressText || addressText.trim().length < 5)) {
      showToast('Please specify a delivery address or pin your location on the map.', 'warning');
      return;
    }

    setPlacingOrder(true);

    const fullAddress = orderType === 'delivery'
      ? addressText.trim()
      : `Store Pickup (Collection Counter)${pickupNotes ? ` - Notes: ${pickupNotes}` : ''}`;

    const effectiveMethodName = method === 'cod'
      ? (orderType === 'delivery' ? 'Cash on Delivery' : 'Cash on Pickup')
      : (method === 'gcash' ? 'GCash' : 'Bank Transfer');

    const effectiveLabel = selectedAddressId === 'custom'
      ? (addressLabel === 'Custom' ? customLabel.trim() || 'Other' : addressLabel)
      : '';

    try {
      const payload: any = {
        name: name.trim(),
        number: number.trim(),
        method: effectiveMethodName,
        order_type: orderType,
        address: fullAddress,
        delivery_notes: deliveryNotes.trim() || undefined,
        lat: mapCoordinates?.lat ?? undefined,
        lng: mapCoordinates?.lng ?? undefined,
        save_address_label: saveAddressToProfile && effectiveLabel ? effectiveLabel : undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Order placed successfully! We will review and prepare it soon.', 'success');
        refreshStats();
        router.push('/orders');
      } else {
        showToast(data.message || 'Failed to place order', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Order placement error', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!user && !loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h2 style={{ marginTop: '1rem', color: '#1e293b', fontWeight: 800 }}>Please Sign In</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>You must be logged in to view your cart and place orders.</p>
        <Link href="/menu" className="btn" style={{ marginTop: '2rem' }}>
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <h1 className="heading">Your Shopping <span>Cart</span></h1>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#888', padding: '3rem 0' }}>Loading your cart...</p>
      ) : cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', background: '#fff', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: '1rem', color: '#1e293b', fontWeight: 800 }}>Your cart is currently empty</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Discover our freshly prepared food catalog and customize your order!</p>
          <Link href="/menu" className="btn" style={{ marginTop: '2rem' }}>
            Browse Menu &rarr;
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
          {/* Left Column: Cart Items List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#222' }}>
                Cart Items ({cartItems.length})
              </h2>
              <button onClick={clearCart} style={{ background: 'none', color: '#e74c3c', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                Clear All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  />

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#222', fontWeight: 800 }}>{item.name}</h3>
                    {item.options ? (
                      <p style={{ fontSize: '0.85rem', color: '#008C3B', fontWeight: 600, margin: '2px 0 6px 0' }}>
                        {item.options}
                      </p>
                    ) : item.sizename ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 6px 0' }}>
                        Size: {item.sizename}
                      </p>
                    ) : null}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: '#008C3B', fontSize: '1.1rem' }}>
                        ₱{Number(item.price).toFixed(2)}
                      </span>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity, -1)}
                          style={{ border: 'none', background: '#f5f5f5', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          -
                        </button>
                        <span style={{ padding: '4px 12px', fontSize: '0.9rem', fontWeight: 700 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity, 1)}
                          style={{ border: 'none', background: '#f5f5f5', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    title="Remove item"
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Checkout Form */}
          <div>
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              position: 'sticky',
              top: '90px',
            }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#222', marginBottom: '1.25rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.75rem' }}>
                Order Checkout
              </h2>

              {/* Order Type Toggle */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                backgroundColor: '#f1f5f9',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '1.5rem',
              }}>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    backgroundColor: orderType === 'delivery' ? '#008C3B' : 'transparent',
                    color: orderType === 'delivery' ? '#fff' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    backgroundColor: orderType === 'pickup' ? '#008C3B' : 'transparent',
                    color: orderType === 'pickup' ? '#fff' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Store Pickup
                </button>
              </div>

              <form onSubmit={handleCheckout}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Enter recipient name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    placeholder="E.g. 09123456789"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </div>

                {/* Delivery Location Section with Saved Addresses & Map Pinning */}
                {orderType === 'delivery' ? (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', margin: 0 }}>
                        Delivery Destination
                      </label>
                    </div>

                    {/* Saved Address Selection Chips */}
                    {savedAddresses.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                          Select Saved Address:
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {savedAddresses.map((addr) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleSelectSavedAddress(addr)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: selectedAddressId === addr.id ? '2px solid #008C3B' : '1px solid #cbd5e1',
                                backgroundColor: selectedAddressId === addr.id ? '#f0fdf4' : '#fff',
                                color: selectedAddressId === addr.id ? '#008C3B' : '#334155',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                              }}
                            >
                              {addr.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleSelectNewAddress}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              border: selectedAddressId === 'custom' ? '2px solid #008C3B' : '1px dashed #94a3b8',
                              backgroundColor: selectedAddressId === 'custom' ? '#f0fdf4' : '#f8fafc',
                              color: selectedAddressId === 'custom' ? '#008C3B' : '#64748b',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                            }}
                          >
                            + New Address / Pin
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Map Search and Pin Controls */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      padding: '0.85rem',
                      marginBottom: '1rem',
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search street, building, or landmark..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleSearchAddress}
                          disabled={isSearchingMap}
                          style={{
                            padding: '0 12px',
                            backgroundColor: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isSearchingMap ? 'Searching...' : 'Search'}
                        </button>
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isLocating}
                          style={{
                            padding: '0 12px',
                            backgroundColor: '#008C3B',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isLocating ? 'Locating...' : 'Pin My GPS'}
                        </button>
                      </div>

                      {/* Interactive Map Pin Preview via OpenStreetMap Embed */}
                      <div style={{ borderRadius: '8px', overflow: 'hidden', height: '160px', position: 'relative', border: '1px solid #cbd5e1' }}>
                        <iframe
                          title="Delivery Location Map"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoordinates.lng - 0.008}%2C${mapCoordinates.lat - 0.005}%2C${mapCoordinates.lng + 0.008}%2C${mapCoordinates.lat + 0.005}&layer=mapnik&marker=${mapCoordinates.lat}%2C${mapCoordinates.lng}`}
                          style={{ border: 0 }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          color: '#475569',
                          fontWeight: 600,
                        }}>
                          Pin: {mapCoordinates.lat.toFixed(4)}, {mapCoordinates.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address Field */}
                    <div className="form-group">
                      <label>Complete Street / Location Address</label>
                      <textarea
                        required
                        className="form-control"
                        rows={2}
                        placeholder="E.g. Unit 4B Sunshine Towers, 123 Pizza Boulevard, Barangay San Antonio, Makati"
                        value={addressText}
                        onChange={(e) => setAddressText(e.target.value)}
                        style={{ fontSize: '0.9rem', resize: 'vertical' }}
                      />
                    </div>

                    {/* Optional Delivery Information & Instructions */}
                    <div className="form-group">
                      <label>Additional Delivery Information / Landmarks (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="E.g. Ring bell at green gate, leave with building lobby guard"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                      />
                    </div>

                    {/* Address Label & Save to Profile (when custom address is entered) */}
                    {selectedAddressId === 'custom' && (
                      <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.85rem',
                        marginBottom: '1rem',
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                          Save As Label:
                        </span>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          {['Home', 'Work', 'Condo', 'Other'].map((lbl) => (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => setAddressLabel(lbl)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '16px',
                                border: addressLabel === lbl ? '2px solid #008C3B' : '1px solid #cbd5e1',
                                backgroundColor: addressLabel === lbl ? '#f0fdf4' : '#fff',
                                color: addressLabel === lbl ? '#008C3B' : '#334155',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                              }}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>

                        {addressLabel === 'Other' && (
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Custom Label Name (e.g. Grandma's House, Studio)"
                            value={customLabel}
                            onChange={(e) => setCustomLabel(e.target.value)}
                            style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}
                          />
                        )}

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={saveAddressToProfile}
                            onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                          />
                          Save this address to my profile for future orders
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label>Pickup Instructions / Notes (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="E.g. Pickup at 6:30 PM, please prepare utensils"
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                    />
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginTop: '0.75rem',
                      fontSize: '0.85rem',
                      color: '#166534',
                    }}>
                      <strong>Store Counter Collection:</strong> Your order will be prepared fresh upon confirmation. You can collect it directly at the main store counter.
                    </div>
                  </div>
                )}

                {/* Payment Method Section */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                  <label style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', display: 'block', marginBottom: '0.75rem' }}>
                    Payment Option
                  </label>

                  {/* Payment Method Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setMethod('cod')}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: method === 'cod' ? '2px solid #008C3B' : '1px solid #cbd5e1',
                        backgroundColor: method === 'cod' ? '#f0fdf4' : '#fff',
                        color: method === 'cod' ? '#008C3B' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {orderType === 'delivery' ? 'Cash on Delivery' : 'Cash on Pickup'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('gcash')}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: method === 'gcash' ? '2px solid #008C3B' : '1px solid #cbd5e1',
                        backgroundColor: method === 'gcash' ? '#f0fdf4' : '#fff',
                        color: method === 'gcash' ? '#008C3B' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      GCash (E-Wallet)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('bank')}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: method === 'bank' ? '2px solid #008C3B' : '1px solid #cbd5e1',
                        backgroundColor: method === 'bank' ? '#f0fdf4' : '#fff',
                        color: method === 'bank' ? '#008C3B' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      Bank Transfer
                    </button>
                  </div>
                </div>

                {/* Grand Total Summary */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '10px',
                  margin: '1.5rem 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#444' }}>Grand Total:</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#008C3B' }}>
                    ₱{grandTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="btn"
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
                >
                  {placingOrder ? 'Processing Order...' : orderType === 'delivery' ? 'Confirm Delivery Order' : 'Confirm Pickup Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
