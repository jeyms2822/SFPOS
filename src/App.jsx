import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, initialProducts } from './data/products';
import { APP_USERS } from './data/users';
import Dashboard     from './components/Dashboard';
import POSView       from './components/POSView';
import Inventory     from './components/Inventory';
import SalesHistory  from './components/SalesHistory';
import CheckoutModal from './components/CheckoutModal';
import ReceiptModal  from './components/ReceiptModal';
import LoginScreen   from './components/LoginScreen';
import {
  getStoreId,
  isCloudSyncEnabled,
  pullCloudState,
  pushCloudState,
  subscribeCloudState,
} from './lib/cloudSync';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin'] },
  { id: 'pos',       label: 'POS',       icon: '🛒', roles: ['admin', 'cashier'] },
  { id: 'inventory', label: 'Inventory', icon: '📦', roles: ['admin'] },
  { id: 'sales',     label: 'Sales',     icon: '📋', roles: ['admin', 'cashier'] },
];

const TAX_RATE = 0.12;
const USER_SESSION_KEY = 'sip-current-user';
const PRODUCTS_KEY = 'sip-products';
const TRANSACTIONS_KEY = 'sip-transactions';
const CLOUD_PUSH_DELAY_MS = 450;
const CLOUD_PULL_INTERVAL_MS = 4000;
const VALID_CATEGORIES = new Set(CATEGORIES.filter(c => c !== 'All'));

const LEGACY_CATEGORY_MAP = {
  Coffee: 'Hot Coffee',
  Tea: 'Milktea & Cheesecake Series',
  Food: 'Add Ons',
  Drinks: 'Fruit Soda',
};

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
    .map((p, index) => {
      const rawCategory = String(p.category || 'Iced Coffee');
      const mappedCategory = LEGACY_CATEGORY_MAP[rawCategory] || rawCategory;
      const category = VALID_CATEGORIES.has(mappedCategory) ? mappedCategory : 'Iced Coffee';

      return {
        id: Number(p.id) || Date.now() + index,
        name: String(p.name || 'Unnamed Item'),
        price: Number(p.price) || 0,
        category,
        emoji: String(p.emoji || '☕'),
        stock: Math.max(0, Number(p.stock) || 0),
        lowStock: Math.max(0, Number(p.lowStock) || 5),
      };
    });
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
      refunded: Boolean(t.refunded),
      refundedAt: t.refundedAt || null,
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

function formatSyncTimestamp(value) {
  if (!value) return 'Not yet';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not yet';
  return d.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function App() {
  const cloudEnabled = isCloudSyncEnabled();
  const [activeTab,      setActiveTab]      = useState('pos');
  const [currentUser,    setCurrentUser]    = useState(() => normalizeUserSession(loadLS(USER_SESSION_KEY, null)));
  const [products,       setProducts]       = useState(() => normalizeProducts(loadArrayLS(PRODUCTS_KEY, initialProducts)));
  const [cart,           setCart]           = useState([]);
  const [transactions,   setTransactions]   = useState(() => normalizeTransactions(loadArrayLS(TRANSACTIONS_KEY, [])));
  const [checkoutOpen,   setCheckoutOpen]   = useState(false);
  const [receiptOpen,    setReceiptOpen]    = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [syncState,      setSyncState]      = useState(cloudEnabled ? 'connecting' : 'local');
  const [networkOnline,  setNetworkOnline]  = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [lastSyncedAt,   setLastSyncedAt]   = useState(null);

  const productsRef = useRef(products);
  const transactionsRef = useRef(transactions);
  const cloudReadyRef = useRef(!cloudEnabled);
  const applyingRemoteRef = useRef(false);
  const cloudWriteTimerRef = useRef(null);
  const cloudPullingRef = useRef(false);
  const hasPendingLocalChangesRef = useRef(false);
  const lastCloudStampRef = useRef(null);

  const allowedTabs = TABS.filter(t => t.roles.includes(currentUser?.role || ''));

  const markPendingLocalChanges = () => {
    hasPendingLocalChangesRef.current = true;
  };

  const applyCloudSnapshot = (cloudState) => {
    if (!cloudState) return;

    lastCloudStampRef.current = cloudState.updatedAt;
    setLastSyncedAt(cloudState.updatedAt || new Date().toISOString());
    applyingRemoteRef.current = true;
    setProducts(normalizeProducts(cloudState.products));
    setTransactions(normalizeTransactions(cloudState.transactions));
    setTimeout(() => { applyingRemoteRef.current = false; }, 0);
  };

  const pullLatestCloudState = async () => {
    if (!cloudEnabled || cloudPullingRef.current) return;
    if (hasPendingLocalChangesRef.current) return;

    cloudPullingRef.current = true;
    try {
      const cloudState = await pullCloudState();
      if (!cloudState) return;
      if (cloudState.updatedAt && cloudState.updatedAt === lastCloudStampRef.current) return;

      applyCloudSnapshot(cloudState);
      setSyncState('live');
    } catch (error) {
      console.error('Cloud sync pull failed:', error);
      setSyncState('error');
    } finally {
      cloudPullingRef.current = false;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const markOnline = () => setNetworkOnline(true);
    const markOffline = () => setNetworkOnline(false);

    window.addEventListener('online', markOnline);
    window.addEventListener('offline', markOffline);

    return () => {
      window.removeEventListener('online', markOnline);
      window.removeEventListener('offline', markOffline);
    };
  }, []);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    transactionsRef.current = transactions;
  }, [transactions]);

  useEffect(() => {
    if (!cloudEnabled) return undefined;

    let cancelled = false;

    const bootstrapCloud = async () => {
      try {
        const cloudState = await pullCloudState();
        if (cancelled) return;

        if (cloudState) {
          applyCloudSnapshot(cloudState);
        } else {
          const stamp = await pushCloudState({
            products: productsRef.current,
            transactions: transactionsRef.current,
          });
          lastCloudStampRef.current = stamp;
          setLastSyncedAt(stamp);
        }

        setSyncState('live');
      } catch (error) {
        console.error('Cloud sync bootstrap failed:', error);
        setSyncState('error');
      } finally {
        cloudReadyRef.current = true;
      }
    };

    const unsubscribe = subscribeCloudState((cloudState) => {
      if (cancelled) return;
      if (hasPendingLocalChangesRef.current) return;
      if (cloudState.updatedAt && cloudState.updatedAt === lastCloudStampRef.current) return;

      applyCloudSnapshot(cloudState);
      setSyncState('live');
    });

    bootstrapCloud();

    const intervalId = setInterval(() => {
      if (!networkOnline || cancelled) return;
      pullLatestCloudState();
    }, CLOUD_PULL_INTERVAL_MS);

    return () => {
      cancelled = true;
      unsubscribe();
      clearInterval(intervalId);
      if (cloudWriteTimerRef.current) {
        clearTimeout(cloudWriteTimerRef.current);
        cloudWriteTimerRef.current = null;
      }
    };
  }, [cloudEnabled, networkOnline]);

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
    try { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }
    catch { /* ignore storage write issues to avoid crashing UI */ }
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions)); }
    catch { /* ignore storage write issues to avoid crashing UI */ }
  }, [transactions]);

  useEffect(() => {
    if (!cloudEnabled || !cloudReadyRef.current || applyingRemoteRef.current) return undefined;

    if (cloudWriteTimerRef.current) {
      clearTimeout(cloudWriteTimerRef.current);
      cloudWriteTimerRef.current = null;
    }

    const payload = {
      products,
      transactions,
    };

    cloudWriteTimerRef.current = setTimeout(async () => {
      try {
        const stamp = await pushCloudState(payload);
        lastCloudStampRef.current = stamp;
        setLastSyncedAt(stamp);
        hasPendingLocalChangesRef.current = false;
        setSyncState('live');
      } catch (error) {
        console.error('Cloud sync push failed:', error);
        setSyncState('error');
      }
    }, CLOUD_PUSH_DELAY_MS);

    return () => {
      if (cloudWriteTimerRef.current) {
        clearTimeout(cloudWriteTimerRef.current);
        cloudWriteTimerRef.current = null;
      }
    };
  }, [cloudEnabled, products, transactions]);

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

  const retryCloudSync = async () => {
    if (!cloudEnabled) return;

    if (cloudWriteTimerRef.current) {
      clearTimeout(cloudWriteTimerRef.current);
      cloudWriteTimerRef.current = null;
    }

    setSyncState('connecting');
    try {
      if (hasPendingLocalChangesRef.current) {
        const stamp = await pushCloudState({
          products: productsRef.current,
          transactions: transactionsRef.current,
        });
        lastCloudStampRef.current = stamp;
        setLastSyncedAt(stamp);
        hasPendingLocalChangesRef.current = false;
      } else {
        const cloudState = await pullCloudState();
        if (cloudState) {
          applyCloudSnapshot(cloudState);
        } else {
          const stamp = await pushCloudState({
            products: productsRef.current,
            transactions: transactionsRef.current,
          });
          lastCloudStampRef.current = stamp;
          setLastSyncedAt(stamp);
        }
      }
      setSyncState('live');
    } catch (error) {
      console.error('Cloud sync retry failed:', error);
      setSyncState('error');
    }
  };

  const cartSubtotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartTax       = +(cartSubtotal * TAX_RATE).toFixed(2);
  const cartTotal     = +(cartSubtotal + cartTax).toFixed(2);
  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const completeCheckout = ({ amountReceived, paymentMethod }) => {
    markPendingLocalChanges();
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
      refunded:      false,
      refundedAt:    null,
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

  const refundTransaction = (transactionId) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return { ok: false, message: 'Transaction not found.' };
    if (tx.refunded) return { ok: false, message: 'This transaction is already refunded.' };

    markPendingLocalChanges();

    setProducts(prev =>
      prev.map(product => {
        const soldItem = tx.items.find(item => item.id === product.id);
        if (!soldItem) return product;
        const qty = Math.max(0, Number(soldItem.quantity) || 0);
        return { ...product, stock: product.stock + qty };
      })
    );

    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === transactionId
          ? { ...transaction, refunded: true, refundedAt: new Date().toISOString() }
          : transaction,
      )
    );

    return { ok: true };
  };

  const resetSalesHistory = () => {
    markPendingLocalChanges();
    setTransactions([]);
    setReceiptOpen(false);
    setCurrentReceipt(null);
    return { ok: true };
  };

  const openReceiptFromHistory = (tx) => { setCurrentReceipt(tx); setReceiptOpen(true); };

  const addProduct = (p) => {
    markPendingLocalChanges();
    setProducts(prev => [...prev, { ...p, id: Date.now() }]);
  };

  const updateProduct = (id, upd) => {
    markPendingLocalChanges();
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...upd } : p));
  };

  const deleteProduct = (id) => {
    markPendingLocalChanges();
    setProducts(prev => prev.filter(p => p.id !== id));
  };

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
          <span className={`hdr-badge ${syncState === 'error' ? 'warning' : 'success'}`}>
            {cloudEnabled
              ? (syncState === 'connecting' ? `Syncing ${getStoreId()}...` : syncState === 'error' ? 'Sync Error' : `Realtime ${getStoreId()}`)
              : 'Local Only'}
          </span>
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

      <div className="sync-status-panel">
        <div className="sync-status-row">
          <span className="sync-status-label">Sync</span>
          <span className={`sync-status-pill ${syncState}`}>
            {cloudEnabled
              ? (syncState === 'connecting' ? 'Connecting' : syncState === 'error' ? 'Sync Error' : 'Realtime Connected')
              : 'Local Only'}
          </span>
        </div>

        <div className="sync-status-row">
          <span className="sync-status-label">Network</span>
          <span className={`sync-status-pill ${networkOnline ? 'online' : 'offline'}`}>
            {networkOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="sync-status-row grow">
          <span className="sync-status-label">Last Synced</span>
          <span className="sync-status-value">{formatSyncTimestamp(lastSyncedAt)}</span>
        </div>

        {cloudEnabled && (
          <button
            className="sync-retry-btn"
            onClick={retryCloudSync}
            disabled={!networkOnline || syncState === 'connecting'}
          >
            Retry
          </button>
        )}
      </div>

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
          <SalesHistory
            transactions={transactions}
            onViewReceipt={openReceiptFromHistory}
            onRefund={refundTransaction}
            onResetSales={resetSalesHistory}
            canManageSales={currentUser.role === 'admin'}
          />
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


