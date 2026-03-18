import { useState } from 'react';
import { CATEGORIES, CATEGORY_COLORS } from '../data/products';
import Cart from './Cart';

export default function POSView({
  products, cart,
  cartSubtotal, cartTax, cartTotal, cartItemCount,
  onAddToCart, onUpdateQty, onRemoveItem, onCheckout, onClearCart,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [cartOpen,         setCartOpen]         = useState(false);

  const filtered = products.filter(p => {
    const matchCat  = selectedCategory === 'All' || p.category === selectedCategory;
    const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchName;
  });

  return (
    <div className="pos-view">
      {/* ── Product panel ───────────────────────────────────── */}
      <div className="products-panel">
        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Category filters */}
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={
                selectedCategory === cat && cat !== 'All'
                  ? { background: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat], color: '#fff' }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="empty-grid">
            <span>🔍</span>
            <p>No products found</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                cartQty={cart.find(i => i.id === product.id)?.quantity ?? 0}
                onAdd={() => onAddToCart(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop cart sidebar ─────────────────────────────── */}
      <aside className="cart-panel desktop-cart">
        <Cart
          cart={cart}
          cartSubtotal={cartSubtotal}
          cartTax={cartTax}
          cartTotal={cartTotal}
          onUpdateQty={onUpdateQty}
          onRemoveItem={onRemoveItem}
          onCheckout={onCheckout}
          onClearCart={onClearCart}
        />
      </aside>

      {/* ── Mobile cart FAB ──────────────────────────────────── */}
      <button className="cart-fab" onClick={() => setCartOpen(true)}>
        🛒
        {cartItemCount > 0 && <span className="fab-badge">{cartItemCount}</span>}
      </button>

      {/* ── Mobile bottom sheet ──────────────────────────────── */}
      {cartOpen && (
        <div className="sheet-overlay" onClick={() => setCartOpen(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <h3>Cart ({cartItemCount} item{cartItemCount !== 1 ? 's' : ''})</h3>
              <button className="sheet-close" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <Cart
              cart={cart}
              cartSubtotal={cartSubtotal}
              cartTax={cartTax}
              cartTotal={cartTotal}
              onUpdateQty={onUpdateQty}
              onRemoveItem={onRemoveItem}
              onCheckout={() => { setCartOpen(false); onCheckout(); }}
              onClearCart={onClearCart}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Product Card ──────────────────────────────────────────── */
function ProductCard({ product, cartQty, onAdd }) {
  const isOut  = product.stock <= 0;
  const isLow  = product.stock > 0 && product.stock <= product.lowStock;
  const color  = CATEGORY_COLORS[product.category] ?? '#6F4E37';

  return (
    <div className={`product-card${isOut ? ' oos' : ''}`}>
      <div className="prod-img" style={{ background: `${color}18` }}>
        <span className="prod-emoji">{product.emoji}</span>
        {cartQty > 0  && <span className="cart-badge">{cartQty}</span>}
        {isLow        && <span className="stock-flag low">Low</span>}
        {isOut        && <span className="stock-flag out">Out</span>}
      </div>
      <div className="prod-body">
        <p className="prod-name">{product.name}</p>
        <p className="prod-cat">{product.category}</p>
        <div className="prod-footer">
          <span className="prod-price">₱{product.price.toFixed(2)}</span>
          <button
            className="add-btn"
            onClick={onAdd}
            disabled={isOut}
            style={isOut ? {} : { background: color }}
            aria-label={`Add ${product.name} to cart`}
          >
            {isOut ? '—' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}
