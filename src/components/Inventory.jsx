import { useState } from 'react';
import { CATEGORIES, CATEGORY_COLORS } from '../data/products';

const EMPTY_FORM = { name: '', price: '', category: 'Iced Coffee', emoji: '☕', stock: '', lowStock: '5' };

export default function Inventory({ products, onAdd, onUpdate, onDelete, onDeleteAll }) {
  const [filterCat,   setFilterCat]   = useState('All');
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const filtered = filterCat === 'All' ? products : products.filter(p => p.category === filterCat);

  return (
    <div className="inventory">
      {/* Header */}
      <div className="inv-header">
        <h2 className="section-title">Inventory Management</h2>
        <div className="action-row">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Product</button>
          <button
            className="btn btn-danger"
            onClick={() => setDeleteAllOpen(true)}
            disabled={products.length === 0}
          >
            Delete All Products
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="inv-stats">
        <span className="inv-stat">Total Products: <strong>{products.length}</strong></span>
        <span className="inv-stat low">Low Stock: <strong>{products.filter(p => p.stock <= p.lowStock && p.stock > 0).length}</strong></span>
        <span className="inv-stat out">Out of Stock: <strong>{products.filter(p => p.stock <= 0).length}</strong></span>
      </div>

      {/* Category filter */}
      <div className="category-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${filterCat === cat ? 'active' : ''}`}
            onClick={() => setFilterCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table inv-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                editingId === p.id
                  ? <EditRow key={p.id} product={p}
                      onSave={upd => { onUpdate(p.id, upd); setEditingId(null); }}
                      onCancel={() => setEditingId(null)} />
                  : (
                    <tr key={p.id}>
                      <td>
                        <div className="prod-cell">
                          <span className="cell-emoji">{p.emoji}</span>
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="cat-pill"
                          style={{ background: `${CATEGORY_COLORS[p.category]}22`, color: CATEGORY_COLORS[p.category] }}>
                          {p.category}
                        </span>
                      </td>
                      <td>₱{p.price.toFixed(2)}</td>
                      <td>
                        <div className="stock-ctrl">
                          <button onClick={() => onUpdate(p.id, { stock: Math.max(0, p.stock - 1) })}>−</button>
                          <span className={p.stock <= p.lowStock ? 'low-num' : ''}>{p.stock}</span>
                          <button onClick={() => onUpdate(p.id, { stock: p.stock + 1 })}>+</button>
                        </div>
                      </td>
                      <td>{p.lowStock}</td>
                      <td>
                        <span className={`status-pill ${p.stock <= 0 ? 'out' : p.stock <= p.lowStock ? 'low' : 'ok'}`}>
                          {p.stock <= 0 ? 'Out of Stock' : p.stock <= p.lowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <div className="action-row">
                          <button className="icon-btn edit" onClick={() => setEditingId(p.id)} title="Edit">✏️</button>
                          <button className="icon-btn del"  onClick={() => setDeleteId(p.id)}  title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty-row">No products in this category</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add product modal */}
      {showForm && (
        <ProductFormModal
          onSave={p => { onAdd(p); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Confirm delete */}
      {deleteId && (
        <ConfirmModal
          message={`Delete "${products.find(p => p.id === deleteId)?.name}"? This cannot be undone.`}
          onConfirm={() => { onDelete(deleteId); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {deleteAllOpen && (
        <ConfirmModal
          title="Delete All Products"
          message={`Delete all ${products.length} products? This cannot be undone.`}
          onConfirm={() => {
            onDeleteAll();
            setDeleteAllOpen(false);
          }}
          onCancel={() => setDeleteAllOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Inline edit row ───────────────────────────────────────── */
function EditRow({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product.name, price: String(product.price),
    emoji: product.emoji, stock: String(product.stock), lowStock: String(product.lowStock),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.price) return;
    onSave({ name: form.name, price: parseFloat(form.price), emoji: form.emoji, stock: parseInt(form.stock) || 0, lowStock: parseInt(form.lowStock) || 0 });
  };

  return (
    <tr className="edit-row">
      <td><input className="tbl-input" value={form.emoji} onChange={e => set('emoji', e.target.value)} style={{ width: 48, textAlign: 'center' }} />
          <input className="tbl-input" value={form.name} onChange={e => set('name', e.target.value)} style={{ width: 130 }} /></td>
      <td>—</td>
      <td><input className="tbl-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} style={{ width: 80 }} /></td>
      <td><input className="tbl-input" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} style={{ width: 70 }} /></td>
      <td><input className="tbl-input" type="number" value={form.lowStock} onChange={e => set('lowStock', e.target.value)} style={{ width: 70 }} /></td>
      <td>—</td>
      <td>
        <div className="action-row">
          <button className="icon-btn save" onClick={handleSave}>✓</button>
          <button className="icon-btn cancel" onClick={onCancel}>✕</button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Add product modal ─────────────────────────────────────── */
function ProductFormModal({ onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    onSave({
      name:     form.name.trim(),
      price:    parseFloat(form.price),
      category: form.category,
      emoji:    form.emoji.trim() || '🍵',
      stock:    parseInt(form.stock) || 0,
      lowStock: parseInt(form.lowStock) || 5,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-body prod-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group emoji-group">
              <label>Emoji / Icon</label>
              <input value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="☕" maxLength={4} />
            </div>
            <div className="form-group flex-1">
              <label>Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Iced Latte" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Price (₱) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" min="0" step="0.01" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Qty</label>
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Low Stock Alert</label>
              <input type="number" value={form.lowStock} onChange={e => set('lowStock', e.target.value)} placeholder="5" min="0" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Confirm dialog ────────────────────────────────────────── */
function ConfirmModal({ title = 'Confirm Delete', message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{title}</h2></div>
        <div className="modal-body"><p>{message}</p></div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger"  onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
