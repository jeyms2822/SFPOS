import { useMemo } from 'react';

export default function Dashboard({ products, transactions }) {
  const stats = useMemo(() => {
    const today    = new Date().toDateString();
    const todayTxs = transactions.filter(t => new Date(t.timestamp).toDateString() === today);

    return {
      totalSales:    transactions.reduce((s, t) => s + t.total, 0),
      totalOrders:   transactions.length,
      totalItemsSold:transactions.reduce((s, t) => s + t.items.reduce((a, i) => a + i.quantity, 0), 0),
      lowStockItems: products.filter(p => p.stock <= p.lowStock),
      todaySales:    todayTxs.reduce((s, t) => s + t.total, 0),
      todayOrders:   todayTxs.length,
    };
  }, [products, transactions]);

  const recent = transactions.slice(0, 5);

  return (
    <div className="dashboard">
      <h2 className="section-title">Dashboard Overview</h2>

      {/* Summary cards */}
      <div className="summary-grid">
        <SummaryCard icon="💵" label="Today's Sales"  value={`₱${stats.todaySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} sub={`${stats.todayOrders} orders today`}           color="primary" />
        <SummaryCard icon="📈" label="Total Sales"    value={`₱${stats.totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} sub="All time"                                color="success" />
        <SummaryCard icon="🛒" label="Total Orders"   value={stats.totalOrders}    sub="Completed transactions"   color="info"    />
        <SummaryCard icon="📦" label="Items Sold"     value={stats.totalItemsSold} sub="Total quantity sold"       color="accent"  />
        <SummaryCard
          icon="⚠️"
          label="Low Stock"
          value={stats.lowStockItems.length}
          sub="Items need restocking"
          color={stats.lowStockItems.length > 0 ? 'warning' : 'success'}
          alert={stats.lowStockItems.length > 0}
        />
      </div>

      <div className="dashboard-bottom">
        {/* Recent transactions */}
        <div className="card dashboard-card">
          <h3 className="card-title">Recent Transactions</h3>
          {recent.length === 0 ? (
            <p className="empty-hint">No transactions yet. Start selling from the POS tab!</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Date &amp; Time</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(t => (
                    <tr key={t.id}>
                      <td><span className="receipt-tag">{t.receiptNumber}</span></td>
                      <td>{new Date(t.timestamp).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{t.items.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td>{t.paymentMethod}</td>
                      <td className="price-cell">₱{t.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock alert */}
        {stats.lowStockItems.length > 0 && (
          <div className="card dashboard-card">
            <h3 className="card-title">⚠️ Low Stock Alert</h3>
            <div className="low-stock-list">
              {stats.lowStockItems.map(p => (
                <div key={p.id} className="low-stock-row">
                  <span className="ls-emoji">{p.emoji}</span>
                  <div className="ls-info">
                    <p className="ls-name">{p.name}</p>
                    <p className="ls-qty">{p.stock} remaining (threshold: {p.lowStock})</p>
                  </div>
                  <span className={`stock-pill ${p.stock <= 0 ? 'out' : 'low'}`}>
                    {p.stock <= 0 ? 'Out of Stock' : 'Low'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, color, alert }) {
  return (
    <div className={`summary-card card ${color}${alert ? ' alert-card' : ''}`}>
      <div className="sc-icon">{icon}</div>
      <div className="sc-body">
        <p className="sc-label">{label}</p>
        <p className="sc-value">{value}</p>
        <p className="sc-sub">{sub}</p>
      </div>
    </div>
  );
}
