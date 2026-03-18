import { useState, useEffect } from 'react';
import { initialProducts } from './data/products';
import { APP_USERS } from './data/users';
import Dashboard     from './components/Dashboard';
import POSView       from './components/POSView';
import Inventory     from './components/Inventory';
import SalesHistory  from './components/SalesHistory';
import CheckoutModal from './components/CheckoutModal';
import ReceiptModal  from './components/ReceiptModal';
import LoginScreen   from './components/LoginScreen';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin'] },
  { id: 'pos',       label: 'POS',       icon: '🛒', roles: ['admin', 'cashier'] },
  { id: 'inventory', label: 'Inventory', icon: '📦', roles: ['admin'] },
  { id: 'sales',     label: 'Sales',     icon: '📋', roles: ['admin', 'cashier'] },
];

const TAX_RATE = 0.12;
const USER_SESSION_KEY = 'sip-current-user';

function loadLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function loadArrayLS(key, fallback) {
  const data = loadLS(key, fallback);
  return Array.isArray(data) ? data : fallback;
}

function normalizeProducts(products) {
  if (!Array.isArray(products) || products.length === 0) return initialProducts;

  return products
    .filter(p => p && typeof p === 'object')
    .map((p, index) => ({
      id: Number(p.id) || Date.now() + index,
      name: String(p.name || 'Unnamed Item'),
      price: Number(p.price) || 0,
      category: String(p.category || 'Coffee'),
      emoji: String(p.emoji || '☕'),
      stock: Math.max(0, Number(p.stock) || 0),
      lowStock: Math.max(0, Number(p.lowStock) || 5),
    }));
}

function normalizeTransactions(transactions) {
  if (!Array.isArray(transactions)) return [];

  return transactions
    .filter(t => t && typeof t === 'object')
    .map((t, index) => ({
      id: String(t.id || Date.now() + index),
      receiptNumber: String(t.receiptNumber || `SCR-${String(Date.now() + index).slice(-6)}`),
      items: Array.isArray(t.items) ? t.items : [],
      subtotal: Number(t.subtotal) || 0,
      tax: Number(t.tax) || 0,
      total: Number(t.total) || 0,
      amountReceived: Number(t.amountReceived) || 0,
      change: Number(t.change) || 0,
      paymentMethod: String(t.paymentMethod || 'Cash'),
      timestamp: t.timestamp || new Date().toISOString(),
    }));
}

function normalizeUserSession(user) {
  if (!user || typeof user !== 'object') return null;

  const username = String(user.username || '').trim().toLowerCase();
  const role = user.role === 'admin' || user.role === 'cashier' ? user.role : null;
  if (!username || !role) return null;

  return {
    username,
    role,
    displayName: String(user.displayName || (role === 'admin' ? 'Administrator' : 'Cashier')),
  };
}

export default function App() {
  const [activeTab,      setActiveTab]      = useState('pos');
  const [currentUser,    setCurrentUser]    = useState(() => normalizeUserSession(loadLS(USER_SESSION_KEY, null)));
  const [products,       setProducts]       = useState(() => normalizeProducts(loadArrayLS('sip-products', initialProducts)));
  const [cart,           setCart]           = useState([]);
  const [transactions,   setTransactions]   = useState(() => normalizeTransactions(loadArrayLS('sip-transactions', [])));
  const [checkoutOpen,   setCheckoutOpen]   = useState(false);
  const [receiptOpen,    setReceiptOpen]    = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  const allowedTabs = TABS.filter(t => t.roles.includes(currentUser?.role || ''));

  useEffect(() => {
    if (!currentUser) {
      try { localStorage.removeItem(USER_SESSION_KEY); }
      catch { /* ignore storage write issues to avoid crashing UI */ }
      return;
    }

    try { localStorage.setItem(USER_SESSION_KEY, JSON.stringify(currentUser)); }
    catch { /* ignore storage write issues to avoid crashing UI */ }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || allowedTabs.length === 0) return;
    if (!allowedTabs.some(t => t.id === activeTab)) {
      setActiveTab(allowedTabs[0].id);
    }
  }, [activeTab, allowedTabs, currentUser]);

  useEffect(() => {
    try { localStorage.setItem('sip-products', JSON.stringify(products)); }
    catch { /* ignore storage write issues to avoid crashing UI */ }
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem('sip-transactions', JSON.stringify(transactions)); }
    catch { /* ignore storage write issues to avoid crashing UI */ }
  }, [transactions]);

  const addToCart = (product) =>
    setCart(prev => {
      const found = prev.find(i => i.id === product.id);
      if (found) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });

  const updateCartQty = (id, delta) =>
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter(i => i.quantity > 0)
    );

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart      = ()   => setCart([]);

  const loginUser = ({ username, password }) => {
    const normalizedUsername = String(username || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');

    const found = APP_USERS.find(
      user => user.username === normalizedUsername && user.password === normalizedPassword,
    );

    if (!found) {
      return { ok: false, message: 'Invalid username or password.' };
    }

    setCurrentUser({
      username: found.username,
      role: found.role,
      displayName: found.displayName,
    });
    setActiveTab(found.role === 'admin' ? 'dashboard' : 'pos');
    return { ok: true };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCheckoutOpen(false);
    setReceiptOpen(false);
    setCurrentReceipt(null);
    clearCart();
    setActiveTab('pos');
  };

  const cartSubtotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartTax       = +(cartSubtotal * TAX_RATE).toFixed(2);
  const cartTotal     = +(cartSubtotal + cartTax).toFixed(2);
  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const completeCheckout = ({ amountReceived, paymentMethod }) => {
    const receipt = {
      id:            Date.now().toString(),
      receiptNumber: `SCR-${String(Date.now()).slice(-6)}`,
      items:         [...cart],
      subtotal:      cartSubtotal,
      tax:           cartTax,
      total:         cartTotal,
      amountReceived,
      change:        +(amountReceived - cartTotal).toFixed(2),
      paymentMethod,
      timestamp:     new Date().toISOString(),
    };
    setProducts(prev =>
      prev.map(p => {
        const ci = cart.find(i => i.id === p.id);
        return ci ? { ...p, stock: Math.max(0, p.stock - ci.quantity) } : p;
      })
    );
    setTransactions(prev => [receipt, ...prev]);
    setCurrentReceipt(receipt);
    clearCart();
    setCheckoutOpen(false);
    setReceiptOpen(true);
  };

  const openReceiptFromHistory = (tx) => { setCurrentReceipt(tx); setReceiptOpen(true); };

  const addProduct    = (p)       => setProducts(prev => [...prev, { ...p, id: Date.now() }]);
  const updateProduct = (id, upd) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...upd } : p));
  const deleteProduct = (id)      => setProducts(prev => prev.filter(p => p.id !== id));

  const lowStockCount = products.filter(p => p.stock <= p.lowStock).length;

  if (!currentUser) {
    return <LoginScreen onLogin={loginUser} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-icon">☕</span>
          <div>
            <h1 className="logo-name">Sip Up Coffee</h1>
            <p className="logo-sub">Point of Sale</p>
          </div>
        </div>
        <div className="header-meta">
          <span className={`hdr-badge ${currentUser.role === 'admin' ? 'info' : 'success'}`}>
            {currentUser.role === 'admin' ? 'Admin' : 'Cashier'}: {currentUser.displayName}
          </span>
          {lowStockCount > 0 && (
            <span className="hdr-badge warning">⚠️ {lowStockCount} Low Stock</span>
          )}
          <span className="hdr-date">
            {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button className="hdr-logout-btn" onClick={logoutUser}>Logout</button>
        </div>
      </header>

      <nav className="tab-nav desktop-nav">
        {allowedTabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {currentUser.role === 'admin' && activeTab === 'dashboard' && (
          <Dashboard products={products} transactions={transactions} />
        )}
        {activeTab === 'pos' && (
          <POSView
            products={products}
            cart={cart}
            cartSubtotal={cartSubtotal}
            cartTax={cartTax}
            cartTotal={cartTotal}
            cartItemCount={cartItemCount}
            onAddToCart={addToCart}
            onUpdateQty={updateCartQty}
            onRemoveItem={removeFromCart}
            onCheckout={() => setCheckoutOpen(true)}
            onClearCart={clearCart}
          />
        )}
        {currentUser.role === 'admin' && activeTab === 'inventory' && (
          <Inventory
            products={products}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        )}
        {activeTab === 'sales' && (
          <SalesHistory transactions={transactions} onViewReceipt={openReceiptFromHistory} />
        )}
      </main>

      <nav className="tab-nav mobile-nav">
        {allowedTabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          subtotal={cartSubtotal}
          tax={cartTax}
          total={cartTotal}
          onClose={() => setCheckoutOpen(false)}
          onComplete={completeCheckout}
        />
      )}

      {receiptOpen && currentReceipt && (
        <ReceiptModal receipt={currentReceipt} onClose={() => setReceiptOpen(false)} />
      )}
    </div>
  );
}


