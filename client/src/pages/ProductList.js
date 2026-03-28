import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productApi, syncApi } from '../services/api';

const stockBadge = (s) => ({
  instock:     <span className="badge badge-green">In Stock</span>,
  outofstock:  <span className="badge badge-red">Out of Stock</span>,
  onbackorder: <span className="badge badge-yellow">Backorder</span>,
}[s] || null);

const statusBadge = (s) => ({
  published: <span className="badge badge-blue">Published</span>,
  draft:     <span className="badge badge-gray">Draft</span>,
  pending:   <span className="badge badge-yellow">Pending</span>,
}[s] || null);

export default function ProductList() {
  const [data, setData]       = useState({ products: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({ page, limit: 15, search: search || undefined, status: status || undefined });
      setData(res);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await productApi.delete(id);
      toast.success('Product deleted');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handlePush = async (id) => {
    try {
      await syncApi.push(id);
      toast.success('Pushed to WooCommerce');
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-title">Products <span style={{ color: 'var(--muted)', fontSize: 16 }}>({data.total})</span></div>
        <button className="btn-primary" onClick={() => navigate('/products/new')}>+ New Product</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input placeholder="Search products..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ maxWidth: 300 }} />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ maxWidth: 160 }}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : data.products.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            No products found.{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/products/new')}>Add one?</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Name', 'SKU', 'Price', 'Stock', 'Status', 'Synced', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.products.map((p, i) => (
                <tr key={p._id} style={{ borderBottom: i < data.products.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>{p.sku || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>₹{p.price?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '12px 16px' }}>{stockBadge(p.stockStatus)}</td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(p.status)}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                    {p.syncedAt ? new Date(p.syncedAt).toLocaleDateString() : <span style={{ color: 'var(--warning)' }}>Unsynced</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => navigate(`/products/${p._id}`)}>Edit</button>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--accent2)' }} onClick={() => handlePush(p._id)}>↑ Push</button>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--danger)' }} onClick={() => handleDelete(p._id, p.name)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={page === p ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '6px 12px', minWidth: 36 }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
