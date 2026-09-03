'use client';

import React, { useState, useEffect } from 'react';
import { Sale } from '@/types/database';
import { useToast } from '@/context/ToastContext';

interface SalesSummary {
  totalRevenue: number;
  totalQuantity: number;
  totalTransactions: number;
  productBreakdown: Record<string, { qty: number; revenue: number }>;
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [productName, setProductName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { showToast } = useToast();

  const fetchSales = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (productName) queryParams.set('product_name', productName);
      if (startDate) queryParams.set('start_date', startDate);
      if (endDate) queryParams.set('end_date', endDate);

      const res = await fetch(`/api/admin/sales?${queryParams.toString()}`);
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setSales(data.data.sales || []);
        setSummary(data.data.summary || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSales();
    }, 250);
    return () => clearTimeout(timer);
  }, [productName, startDate, endDate]);

  const resetFilters = () => {
    setProductName('');
    setStartDate('');
    setEndDate('');
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    if (sales.length === 0) {
      showToast('No sales records to export.', 'warning');
      return;
    }

    const headers = ['Sale ID', 'Date & Time', 'Product Name', 'Size / Options', 'Quantity', 'Unit Price (PHP)', 'Total (PHP)'];
    const rows = sales.map((s) => [
      `#${s.id}`,
      `"${new Date(s.date).toLocaleString().replace(/"/g, '""')}"`,
      `"${(s.product_name || `Product #${s.product_id}`).replace(/"/g, '""')}"`,
      `"${(s.sizeID || 'Standard').replace(/"/g, '""')}"`,
      s.qty,
      Number(s.price).toFixed(2),
      (Number(s.price) * Number(s.qty)).toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sales report exported to CSV / Excel!', 'success');
  };

  // Export to PDF / Print Report
  const handlePrintPDF = () => {
    if (sales.length === 0) {
      showToast('No sales records to print.', 'warning');
      return;
    }
    window.print();
  };

  return (
    <div>
      <style jsx global>{`
        @media print {
          body {
            background-color: #fff !important;
            color: #000 !important;
          }
          nav, aside, .no-print, button, input {
            display: none !important;
          }
          .table-container, .print-card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
            Sales & Revenue Analytics
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Track sales performance, completed orders revenue, and product trends across all departments
          </p>
        </div>

        {/* Export Buttons */}
        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn"
            style={{ backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Export to Excel / CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="btn"
            style={{ backgroundColor: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        <div className="print-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Period Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#008C3B', marginTop: '4px' }}>
            ₱{Number(summary?.totalRevenue || 0).toFixed(2)}
          </div>
        </div>

        <div className="print-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Products Sold</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6', marginTop: '4px' }}>
            {summary?.totalQuantity || 0} units
          </div>
        </div>

        <div className="print-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Sales Transactions</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
            {summary?.totalTransactions || 0}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="no-print" style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        marginBottom: '2rem',
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
            Filter by Product
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search product name..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
            Start Date
          </label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
            End Date
          </label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          onClick={resetFilters}
          className="option-btn"
          style={{ padding: '0.75rem 1.25rem', backgroundColor: '#94a3b8' }}
        >
          Reset Filters
        </button>
      </div>

      {/* Sales Transactions Table */}
      <div className="table-container">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
          Sales Transactions ({sales.length})
        </h2>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '3rem 0' }}>Loading sales...</p>
        ) : sales.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No sales recorded for the selected period</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Size / Options</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>#{s.id}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>{s.product_name || `Product #${s.product_id}`}</td>
                  <td>{s.sizeID || 'Standard'}</td>
                  <td style={{ fontWeight: 600 }}>{s.qty}</td>
                  <td>₱{Number(s.price).toFixed(2)}</td>
                  <td style={{ fontWeight: 800, color: '#008C3B' }}>
                    ₱{(Number(s.price) * Number(s.qty)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
