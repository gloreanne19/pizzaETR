'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, OptionGroup, OptionChoice } from '@/types/database';
import { useToast } from '@/context/ToastContext';

interface CategoryDetail {
  id?: number;
  name: string;
  image?: string;
  default_options?: string | null;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDetail[]>([
    { name: 'Pizza' },
  ]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Creation Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Default Options Template Modal
  const [editingTemplateCategory, setEditingTemplateCategory] = useState<CategoryDetail | null>(null);
  const [templateGroups, setTemplateGroups] = useState<OptionGroup[]>([]);

  // Delete Confirmation Modal
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

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
        setCategories(catData.data.categoriesDetailed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Card click navigation
  const handleCardClick = (catName: string) => {
    router.push(`/admin/products?category=${encodeURIComponent(catName)}`);
  };

  // Category Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || `Category "${clean}" created successfully.`, 'success');
        setNewCategoryName('');
        setIsCategoryModalOpen(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to create category', 'error');
      }
    } catch (e) {
      showToast('Error saving category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category handler (using custom modal)
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const catName = categoryToDelete;

    if (catName.toLowerCase() === 'pizza') {
      showToast('Default Pizza category cannot be deleted', 'warning');
      setCategoryToDelete(null);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories?name=${encodeURIComponent(catName)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || `Category "${catName}" removed successfully.`, 'info');
        setCategoryToDelete(null);
        fetchData();
      } else {
        showToast(data.message || 'Failed to delete category', 'error');
      }
    } catch (e) {
      showToast('Error deleting category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Template Modal
  const openTemplateModal = (e: React.MouseEvent, cat: CategoryDetail) => {
    e.stopPropagation();
    setEditingTemplateCategory(cat);
    let parsed: OptionGroup[] = [];
    if (cat.default_options) {
      try {
        const p = JSON.parse(cat.default_options);
        if (Array.isArray(p)) parsed = p;
      } catch (err) {
        parsed = [];
      }
    }
    setTemplateGroups(parsed);
  };

  const openDeleteModal = (e: React.MouseEvent, catName: string) => {
    e.stopPropagation();
    setCategoryToDelete(catName);
  };

  // Option Builder Actions for Template
  const addOptionGroup = () => {
    setTemplateGroups((prev) => [
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
    setTemplateGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGroupField = (index: number, field: keyof OptionGroup, value: any) => {
    setTemplateGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  };

  const addChoice = (groupIndex: number) => {
    setTemplateGroups((prev) =>
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
    setTemplateGroups((prev) =>
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
    setTemplateGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? { ...g, choices: g.choices.filter((_, ci) => ci !== choiceIndex) }
          : g
      )
    );
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplateCategory) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTemplateCategory.name,
          default_options: templateGroups,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message || `Customization template for "${editingTemplateCategory.name}" updated.`, 'success');
        setEditingTemplateCategory(null);
        fetchData();
      } else {
        showToast(data.message || 'Failed to update template', 'error');
      }
    } catch (e) {
      showToast('Error updating template', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
            Menu Categories
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Manage store departments, view product counts, and configure auto-fill customization templates
          </p>
        </div>

        <button onClick={() => setIsCategoryModalOpen(true)} className="btn">
          + Add New Category
        </button>
      </div>

      {loading ? (
        <p style={{ padding: '3rem 0', textAlign: 'center', color: '#888' }}>Loading categories...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {categories.map((cat) => {
            const count = products.filter(
              (p) => (p.category || 'Pizza').toLowerCase() === cat.name.toLowerCase()
            ).length;

            let parsedGroups: OptionGroup[] = [];
            if (cat.default_options) {
              try {
                const p = JSON.parse(cat.default_options);
                if (Array.isArray(p)) parsedGroups = p;
              } catch (e) { }
            }

            const isConfigured = parsedGroups.length > 0;

            return (
              <div
                key={cat.name}
                onClick={() => handleCardClick(cat.name)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#008C3B';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                      {cat.name}
                    </h3>
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}>
                      {count} {count === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  {/* Clean Configuration Status Badge */}
                  <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: isConfigured ? '#f0fdf4' : '#f8fafc',
                      color: isConfigured ? '#008C3B' : '#94a3b8',
                      border: isConfigured ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    }}>
                      {isConfigured
                        ? `Customization: Configured (${parsedGroups.length} group${parsedGroups.length === 1 ? '' : 's'})`
                        : 'Customization: Not configured'}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => openTemplateModal(e, cat)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#008C3B';
                      e.currentTarget.style.color = '#008C3B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.color = '#334155';
                    }}
                  >
                    Configure Template
                  </button>

                  {cat.name.toLowerCase() !== 'pizza' && (
                    <button
                      type="button"
                      onClick={(e) => openDeleteModal(e, cat.name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 8px',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Creation Modal with Outside-Click Dismiss */}
      {isCategoryModalOpen && (
        <div
          onClick={() => setIsCategoryModalOpen(false)}
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
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '2rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Create New Category
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label>Category Title</label>
                <input
                  type="text"
                  required
                  placeholder="Drinks, Meals, Burgers, Sides, Desserts"
                  className="form-control"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="btn"
                  style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn">
                  {submitting ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Replaces browser alert/confirm) with Outside-Click Dismiss */}
      {categoryToDelete && (
        <div
          onClick={() => setCategoryToDelete(null)}
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
              maxWidth: '440px',
              padding: '2rem',
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
              Delete Category
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Are you sure you want to delete category <strong>&quot;{categoryToDelete}&quot;</strong>? Existing products under this category will remain, but this category classification will be removed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="btn"
                style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={confirmDeleteCategory}
                className="btn"
                style={{ backgroundColor: '#dc2626', color: '#fff' }}
              >
                {submitting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Builder Modal with Outside-Click Dismiss */}
      {editingTemplateCategory && (
        <div
          onClick={() => setEditingTemplateCategory(null)}
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
              maxWidth: '650px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Customization Template for {editingTemplateCategory.name}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  These options will auto-fill every time a product is created under {editingTemplateCategory.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTemplateCategory(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTemplate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {templateGroups.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                      No default options configured. Products added to {editingTemplateCategory.name} will default to direct items without option groups.
                    </p>
                  </div>
                ) : (
                  templateGroups.map((grp, gIdx) => (
                    <div
                      key={grp.id || gIdx}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem',
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

                      <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid #008C3B' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          Choices and Additional Prices:
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
                  ))
                )}

                <button
                  type="button"
                  onClick={addOptionGroup}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px dashed #008C3B',
                    background: '#f0fdf4',
                    color: '#008C3B',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  + Add Option Group to Template
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingTemplateCategory(null)}
                  className="btn"
                  style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn">
                  {submitting ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
