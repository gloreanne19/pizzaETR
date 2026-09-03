'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, ProductStatus, OptionGroup, OptionChoice } from '@/types/database';
import { useToast } from '@/context/ToastContext';
import { getImageUrl } from '@/lib/image-helper';

interface CategoryDetail {
  id?: number;
  name: string;
  image?: string;
  default_options?: string | null;
}

function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesDetailed, setCategoriesDetailed] = useState<CategoryDetail[]>([
    { name: 'Pizza' },
    { name: 'Drinks' },
    { name: 'Meals' },
    { name: 'Burgers' },
    { name: 'Sides' },
    { name: 'Desserts' },
  ]);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold_out' | 'unavailable' | 'inactive'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(searchParams?.get('category') || 'all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pizza');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<ProductStatus>('available');
  const [hasCustomizations, setHasCustomizations] = useState(false);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      const [prodData, catData] = await Promise.all([
        prodRes.json(),
        catRes.json(),
      ]);

      if (prodData.status === 'success' && prodData.data) {
        setProducts(prodData.data.products || []);
      }
      if (catData.status === 'success' && catData.data?.categoriesDetailed) {
        setCategoriesDetailed(catData.data.categoriesDetailed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlCat = searchParams?.get('category');
    if (urlCat) {
      setSelectedCategoryFilter(urlCat);
    }
    fetchData();
  }, [searchParams]);

  // Helper to load template options from category definition
  const getTemplateForCategory = (catName: string): { hasCustom: boolean; groups: OptionGroup[] } => {
    const found = categoriesDetailed.find(
      (c) => c.name.toLowerCase() === catName.toLowerCase()
    );

    if (found && found.default_options) {
      try {
        const parsed: OptionGroup[] = JSON.parse(found.default_options);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            hasCustom: true,
            // Create fresh IDs for instances
            groups: parsed.map((g) => ({
              ...g,
              id: `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            })),
          };
        }
      } catch (e) { }
    }

    return {
      hasCustom: false,
      groups: [],
    };
  };

  const openAddModal = () => {
    const initialCategory = categoriesDetailed[0]?.name || 'Pizza';
    const tpl = getTemplateForCategory(initialCategory);

    setName('');
    setCategory(initialCategory);
    setPrice('');
    setStatus('available');
    setHasCustomizations(tpl.hasCustom);
    setOptionGroups(tpl.groups);
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category || 'Pizza');
    setPrice(String(p.price));
    setStatus(p.status || 'available');
    setHasCustomizations(Boolean(p.has_customizations));

    // Parse custom option groups if stored
    if (p.customization_options) {
      try {
        const parsed = JSON.parse(p.customization_options);
        if (Array.isArray(parsed)) {
          setOptionGroups(parsed);
        } else {
          setOptionGroups([]);
        }
      } catch (e) {
        setOptionGroups([]);
      }
    } else {
      setOptionGroups([]);
    }

    setDescription(p.description || '');
    setImageFile(null);
    setImagePreview(getImageUrl(p.image));
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    // Auto-inherit default template configured for this category
    const tpl = getTemplateForCategory(newCat);
    setHasCustomizations(tpl.hasCustom);
    setOptionGroups(tpl.groups);
  };

  // Option Builder Actions
  const addOptionGroup = () => {
    setOptionGroups((prev) => [
      ...prev,
      {
        id: `group_${Date.now()}`,
        title: 'New Option Group',
        type: 'single',
        required: false,
        choices: [
          { name: 'Option 1', price: 0 },
          { name: 'Option 2', price: 0 },
        ],
      },
    ]);
  };

  const removeOptionGroup = (index: number) => {
    setOptionGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGroupField = (index: number, field: keyof OptionGroup, value: any) => {
    setOptionGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  };

  const addChoice = (groupIndex: number) => {
    setOptionGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? { ...g, choices: [...g.choices, { name: '', price: 0 }] }
          : g
      )
    );
  };

  const updateChoice = (
    groupIndex: number,
    choiceIndex: number,
    field: keyof OptionChoice,
    value: any
  ) => {
    setOptionGroups((prev) =>
      prev.map((g, i) => {
        if (i !== groupIndex) return g;
        const newChoices = g.choices.map((c, ci) =>
          ci === choiceIndex
            ? { ...c, [field]: field === 'price' ? parseFloat(value) || 0 : value }
            : c
        );
        return { ...g, choices: newChoices };
      })
    );
  };

  const removeChoice = (groupIndex: number, choiceIndex: number) => {
    setOptionGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? { ...g, choices: g.choices.filter((_, ci) => ci !== choiceIndex) }
          : g
      )
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      showToast('Please select a product image', 'warning');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('status', status);
    formData.append('has_customizations', hasCustomizations ? 'true' : 'false');
    if (hasCustomizations && optionGroups.length > 0) {
      formData.append('customization_options', JSON.stringify(optionGroups));
    }
    formData.append('description', description);
    formData.append('image', imageFile);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Product added successfully!', 'success');
        setIsAddModalOpen(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to add product', 'error');
      }
    } catch (e) {
      showToast('Error saving product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('status', status);
    formData.append('has_customizations', hasCustomizations ? 'true' : 'false');
    if (hasCustomizations && optionGroups.length > 0) {
      formData.append('customization_options', JSON.stringify(optionGroups));
    } else {
      formData.append('customization_options', '');
    }
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Product updated successfully!', 'success');
        setEditingProduct(null);
        fetchData();
      } else {
        showToast(data.message || 'Failed to update product', 'error');
      }
    } catch (e) {
      showToast('Error updating product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (productId: number, newStatus: ProductStatus) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || 'Status updated', 'success');
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
        );
      } else {
        showToast(data.message || 'Failed to update status', 'error');
      }
    } catch (e) {
      showToast('Error updating product status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product? All related cart records will be cleared.')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast('Product deleted', 'info');
        fetchData();
      } else {
        showToast(data.message || 'Failed to delete', 'error');
      }
    } catch (e) {
      showToast('Error deleting product', 'error');
    }
  };

  const categories = categoriesDetailed.map((c) => c.name);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      (p.category && p.category.toLowerCase() === selectedCategoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const availableCount = products.filter((p) => p.status === 'available').length;
  const soldOutCount = products.filter((p) => p.status === 'sold_out').length;
  const unavailableCount = products.filter((p) => p.status === 'unavailable').length;
  const inactiveCount = products.filter((p) => p.status === 'inactive').length;

  const getCategoryBadge = (cat?: string) => {
    const val = cat || 'Pizza';
    return (
      <span style={{ backgroundColor: '#f0fdf4', color: '#008C3B', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
        {val}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
            Product Catalog & Inventory
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Manage products, configure dynamic sizes, flavors, and live availability
          </p>
        </div>
        <button onClick={openAddModal} className="btn">
          + Add New Product
        </button>
      </div>

      {/* Category Filter Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
          Category:
        </span>
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            backgroundColor: selectedCategoryFilter === 'all' ? '#008C3B' : '#fff',
            color: selectedCategoryFilter === 'all' ? '#fff' : '#475569',
            border: '1px solid #cbd5e1',
            transition: 'all 0.15s ease',
          }}
        >
          All Categories ({products.length})
        </button>
        {categories.map((cat) => {
          const isSel = selectedCategoryFilter.toLowerCase() === cat.toLowerCase();
          const count = products.filter((p) => (p.category || 'Pizza').toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: isSel ? '#008C3B' : '#fff',
                color: isSel ? '#fff' : '#475569',
                border: '1px solid #cbd5e1',
                transition: 'all 0.15s ease',
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Search and Status Filters */}
      <div style={{
        background: '#fff',
        padding: '1.25rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem',
      }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by product name, category, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '340px' }}
        />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'all' ? '#1e293b' : '#f1f5f9',
              color: statusFilter === 'all' ? '#fff' : '#475569',
              border: 'none',
            }}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'available' ? '#15803d' : '#dcfce7',
              color: statusFilter === 'available' ? '#fff' : '#15803d',
              border: 'none',
            }}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setStatusFilter('sold_out')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'sold_out' ? '#b45309' : '#fef3c7',
              color: statusFilter === 'sold_out' ? '#fff' : '#b45309',
              border: 'none',
            }}
          >
            Sold Out ({soldOutCount})
          </button>
          <button
            onClick={() => setStatusFilter('unavailable')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'unavailable' ? '#b91c1c' : '#fee2e2',
              color: statusFilter === 'unavailable' ? '#fff' : '#b91c1c',
              border: 'none',
            }}
          >
            Unavailable ({unavailableCount})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: statusFilter === 'inactive' ? '#475569' : '#f1f5f9',
              color: statusFilter === 'inactive' ? '#fff' : '#475569',
              border: 'none',
            }}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>Loading products catalog...</p>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#888' }}>
            <h3 style={{ color: '#333' }}>No products found</h3>
            <p style={{ marginTop: '0.5rem' }}>No products match your current criteria.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>Image</th>
                <th style={{ padding: '1rem' }}>Product Name</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Base Price</th>
                <th style={{ padding: '1rem' }}>Live Status</th>
                <th style={{ padding: '1rem' }}>Customization Options</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                let optionsCount = 0;
                if (p.customization_options) {
                  try {
                    const parsed = JSON.parse(p.customization_options);
                    if (Array.isArray(parsed)) optionsCount = parsed.length;
                  } catch (e) { }
                }

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      opacity: p.status === 'inactive' ? 0.6 : 1,
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {getCategoryBadge(p.category)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#008C3B', fontWeight: 800 }}>
                      ₱{Number(p.price).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <select
                        value={p.status || 'available'}
                        onChange={(e) => handleQuickStatusChange(p.id, e.target.value as ProductStatus)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="available">Available</option>
                        <option value="sold_out">Sold Out</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                      {optionsCount > 0 ? (
                        <span style={{ color: '#008C3B', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' }}>
                          {optionsCount} Custom Option {optionsCount === 1 ? 'Group' : 'Groups'}
                        </span>
                      ) : p.has_customizations ? (
                        <span style={{ color: '#0284c7', fontWeight: 600 }}>Standard Pizza Sizes</span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Direct Item (No Options)</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="option-btn"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="delete-btn"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Product Modal with Outside Click Close */}
      {(isAddModalOpen || editingProduct) && (
        <div
          onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              padding: '2rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
                {isAddModalOpen ? 'Add New Product' : 'Edit Product Details'}
              </h2>
              <button
                type="button"
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="E.g. Lemon Iced Tea, Crispy Chicken Wings, Cheese Burger, Hawaiian Special"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Category Selector strictly from existing Database categories */}
              <div className="form-group">
                <label>Product Category</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Base Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-control"
                    placeholder="E.g. 199.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Availability Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  >
                    <option value="available">Available (Live on Menu)</option>
                    <option value="sold_out">Sold Out (Visible, disabled order)</option>
                    <option value="unavailable">Unavailable (Temporarily not serving)</option>
                    <option value="inactive">Inactive (Completely hidden from menu)</option>
                  </select>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* UNIVERSAL CUSTOMIZATION ENGINE & DYNAMIC OPTION GROUPS BUILDER */}
              {/* ------------------------------------------------------------- */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      checked={hasCustomizations}
                      onChange={(e) => setHasCustomizations(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#008C3B' }}
                    />
                    Enable Customization Options (Sizes, Flavors, Add-ons)
                  </label>
                </div>

                {hasCustomizations && (
                  <div>
                    {/* Option Groups List */}
                    {optionGroups.map((grp, gIdx) => (
                      <div
                        key={grp.id || gIdx}
                        style={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <input
                            type="text"
                            required
                            placeholder="Group Title (e.g. Size / Volume, Flavor)"
                            value={grp.title}
                            onChange={(e) => updateGroupField(gIdx, 'title', e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.9rem' }}
                          />
                          <select
                            value={grp.type}
                            onChange={(e) => updateGroupField(gIdx, 'type', e.target.value)}
                            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          >
                            <option value="single">Single Choice (Radio)</option>
                            <option value="multiple">Multi Choice (Checkboxes)</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeOptionGroup(gIdx)}
                            style={{ color: '#dc2626', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', padding: '4px 8px' }}
                            title="Remove group"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Choices within this group */}
                        <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid #008C3B' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            Choices & Extra Costs:
                          </span>
                          {grp.choices.map((ch, cIdx) => (
                            <div key={cIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                              <input
                                type="text"
                                required
                                placeholder="Choice Name (e.g. 1L, Spicy, Extra Cheese)"
                                value={ch.name}
                                onChange={(e) => updateChoice(gIdx, cIdx, 'name', e.target.value)}
                                style={{ flex: 2, padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>+₱</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={ch.price}
                                  onChange={(e) => updateChoice(gIdx, cIdx, 'price', e.target.value)}
                                  style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeChoice(gIdx, cIdx)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px' }}
                                title="Remove choice"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addChoice(gIdx)}
                            style={{ background: 'none', border: 'none', color: '#008C3B', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', marginTop: '4px' }}
                          >
                            + Add Choice
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addOptionGroup}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px dashed #008C3B',
                        background: '#f0fdf4',
                        color: '#008C3B',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      + Add New Option Group
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Fresh ingredients, serving size details, flavor description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Product Image {isAddModalOpen ? '(Required)' : '(Optional - Leave blank to keep existing)'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control"
                  style={{ padding: '0.4rem' }}
                />
              </div>

              {imagePreview && (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="btn"
                  style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn"
                >
                  {submitting ? 'Saving...' : isAddModalOpen ? 'Create Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <React.Suspense fallback={<div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Loading products...</div>}>
      <AdminProductsContent />
    </React.Suspense>
  );
}
