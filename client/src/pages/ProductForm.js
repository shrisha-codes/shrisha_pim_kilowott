import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productApi } from '../services/api';

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{children}</div>
);

const Section = ({ title, children }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
  </div>
);

const inputStyle = {
  background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
  borderRadius: 8, padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none',
  fontFamily: 'var(--font)', transition: 'border-color 0.2s',
};
const onFocus = (e) => (e.target.style.borderColor = 'var(--accent)');
const onBlur  = (e) => (e.target.style.borderColor = 'var(--border)');

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Individual state per field — prevents full re-render on each keystroke (fixes focus-loss bug)
  const [name,        setName]        = useState('');
  const [sku,         setSku]         = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [salePrice,   setSalePrice]   = useState('');
  const [stockStatus, setStockStatus] = useState('instock');
  const [stockQty,    setStockQty]    = useState(0);
  const [categories,  setCategories]  = useState('');
  const [status,      setStatus]      = useState('draft');
  const [attributes,  setAttributes]  = useState([]);
  const [attrName,    setAttrName]    = useState('');
  const [attrValue,   setAttrValue]   = useState('');
  const [loading,     setLoading]     = useState(isEdit);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    productApi.getOne(id)
      .then((p) => {
        setName(p.name || '');
        setSku(p.sku || '');
        setDescription(p.description || '');
        setPrice(p.price ?? '');
        setSalePrice(p.salePrice ?? '');
        setStockStatus(p.stockStatus || 'instock');
        setStockQty(p.stockQty || 0);
        setCategories((p.categories || []).join(', '));
        setStatus(p.status || 'draft');
        setAttributes(p.attributes || []);
      })
      .catch((e) => { toast.error(e.message); navigate('/products'); })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const addAttribute = useCallback(() => {
    if (!attrName.trim() || !attrValue.trim()) return;
    setAttributes((prev) => [...prev, { name: attrName.trim(), value: attrValue.trim() }]);
    setAttrName('');
    setAttrValue('');
  }, [attrName, attrValue]);

  const removeAttribute = useCallback((i) => {
    setAttributes((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name, sku, description, stockStatus, status,
        price:      price     ? parseFloat(price)     : undefined,
        salePrice:  salePrice ? parseFloat(salePrice) : null,
        stockQty:   parseInt(stockQty) || 0,
        categories: categories ? categories.split(',').map((c) => c.trim()).filter(Boolean) : [],
        attributes,
      };
      if (isEdit) await productApi.update(id, payload);
      else        await productApi.create(payload);
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/products');
    } catch (e) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{isEdit ? 'Edit Product' : 'New Product'}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>
            {isEdit ? `Editing · ${id}` : 'Add a new product to your catalog'}
          </div>
        </div>
        <button className="btn-ghost" onClick={() => navigate('/products')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <Section title="Basic Information">
          <Field label="Product Name *">
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)}
              onFocus={onFocus} onBlur={onBlur} required placeholder="e.g. Classic White Tee" />
          </Field>
          <Row>
            <Field label="SKU">
              <input style={inputStyle} value={sku} onChange={(e) => setSku(e.target.value)}
                onFocus={onFocus} onBlur={onBlur} placeholder="CWT-001" />
            </Field>
            <Field label="Status">
              <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}
                onFocus={onFocus} onBlur={onBlur}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
              </select>
            </Field>
          </Row>
          <Field label="Description">
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
              value={description} onChange={(e) => setDescription(e.target.value)}
              onFocus={onFocus} onBlur={onBlur} placeholder="Product description..." />
          </Field>
        </Section>

        <Section title="Pricing">
          <Row>
            <Field label="Regular Price (₹)">
              <input style={inputStyle} type="number" min="0" step="0.01"
                value={price} onChange={(e) => setPrice(e.target.value)}
                onFocus={onFocus} onBlur={onBlur} placeholder="0.00" />
            </Field>
            <Field label="Sale Price (₹)">
              <input style={inputStyle} type="number" min="0" step="0.01"
                value={salePrice} onChange={(e) => setSalePrice(e.target.value)}
                onFocus={onFocus} onBlur={onBlur} placeholder="0.00" />
            </Field>
          </Row>
        </Section>

        <Section title="Inventory">
          <Row>
            <Field label="Stock Status">
              <select style={inputStyle} value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}
                onFocus={onFocus} onBlur={onBlur}>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
                <option value="onbackorder">On Backorder</option>
              </select>
            </Field>
            <Field label="Stock Quantity">
              <input style={inputStyle} type="number" min="0"
                value={stockQty} onChange={(e) => setStockQty(e.target.value)}
                onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </Row>
        </Section>

        <Section title="Organisation">
          <Field label="Categories (comma separated)">
            <input style={inputStyle} value={categories} onChange={(e) => setCategories(e.target.value)}
              onFocus={onFocus} onBlur={onBlur} placeholder="Apparel, Summer Collection" />
          </Field>
        </Section>

        <Section title="Attributes">
          <div style={{ display: 'flex', gap: 10 }}>
            <input style={inputStyle} placeholder="Name (e.g. Color)"
              value={attrName} onChange={(e) => setAttrName(e.target.value)}
              onFocus={onFocus} onBlur={onBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttribute(); } }} />
            <input style={inputStyle} placeholder="Value (e.g. Red)"
              value={attrValue} onChange={(e) => setAttrValue(e.target.value)}
              onFocus={onFocus} onBlur={onBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttribute(); } }} />
            <button type="button" className="btn-ghost" onClick={addAttribute}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>+ Add</button>
          </div>
          {attributes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {attributes.map((a, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(79,127,255,0.12)', color: 'var(--accent)', borderRadius: 20, fontSize: 12, border: '1px solid rgba(79,127,255,0.2)' }}>
                  <span style={{ fontWeight: 500 }}>{a.name}:</span> {a.value}
                  <span onClick={() => removeAttribute(i)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 15, lineHeight: 1 }}>×</span>
                </span>
              ))}
            </div>
          )}
        </Section>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
          <button type="button" className="btn-ghost" onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving} style={{ minWidth: 150 }}>
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
