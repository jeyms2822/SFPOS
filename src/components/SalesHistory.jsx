import { useMemo, useState } from 'react';

function getDateKey(timestamp) {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return 'unknown';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey) {
  if (dateKey === 'unknown') return 'Unknown Date';
  const d = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'Unknown Date';
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SalesHistory({ transactions, onViewReceipt }) {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');

  const dailySummary = useMemo(() => {
    const byDate = new Map();

    for (const tx of transactions) {
      const dateKey = getDateKey(tx.timestamp);
      const existing = byDate.get(dateKey) || {
        dateKey,
        dateLabel: formatDateLabel(dateKey),
        transactions: 0,
        itemsSold: 0,
        revenue: 0,
      };

      existing.transactions += 1;
      existing.itemsSold += tx.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      existing.revenue += Number(tx.total || 0);
      byDate.set(dateKey, existing);
    }

    return Array.from(byDate.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [transactions]);

  const filtered = transactions.filter(t =>
    (selectedDate === 'all' || getDateKey(t.timestamp) === selectedDate) &&
    (
      t.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
      t.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0);
  const totalItemsSold = transactions.reduce((s, t) => s + t.items.reduce((a, i) => a + i.quantity, 0), 0);

  return (
    <div className="sales-history">
      <div className="sh-header">
        <h2 className="section-title">Sales History</h2>
        <div className="sh-meta">
          <span className="sh-stat">
            <strong>{transactions.length}</strong> transactions
          </span>
          <span className="sh-stat">
            <strong>₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> total revenue
          </span>
          <span className="sh-stat">
            <strong>{totalItemsSold}</strong> items sold
          </span>
        </div>
      </div>

      <div className="sh-filters">
        {/* Search bar */}
        <div className="search-bar" style={{ maxWidth: 360 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by receipt #, product, or payment…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="date-filter">
          <label htmlFor="sales-date-filter">Date</label>
          <select
            id="sales-date-filter"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          >
            <option value="all">All Dates</option>
            {dailySummary.map(day => (
              <option key={day.dateKey} value={day.dateKey}>{day.dateLabel}</option>
            ))}
          </select>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: 48 }}>📋</p>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No sales yet</p>
          <p style={{ color: 'var(--text-muted)' }}>Complete a transaction from the POS tab to see history here.</p>
        </div>
      ) : (
        <>
          <div className="card sh-daily-card">
            <h3 className="card-title">Transactions by Date</h3>
            <div className="table-wrapper">
              <table className="data-table sh-daily-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transactions</th>
                    <th>Items Sold</th>
                    <th>Revenue</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySummary.map(day => (
                    <tr key={day.dateKey}>
                      <td>{day.dateLabel}</td>
                      <td>{day.transactions}</td>
                      <td className="daily-items-sold">{day.itemsSold}</td>
                      <td className="price-cell">₱{day.revenue.toFixed(2)}</td>
                      <td>
                        <button className="view-receipt-btn" onClick={() => setSelectedDate(day.dateKey)}>
                          View Date
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="table-wrapper">
              <table className="data-table sh-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Date &amp; Time</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Subtotal</th>
                    <th>VAT</th>
                    <th>Total</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => {
                    const d = new Date(t.timestamp);
                    return (
                      <tr key={t.id}>
                        <td><span className="receipt-tag">{t.receiptNumber}</span></td>
                        <td>
                          <div className="date-cell">
                            <span>{d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="time-sub">{d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td>
                          <div className="items-cell">
                            {t.items.slice(0, 2).map((i, idx) => (
                              <span key={idx} className="item-chip">{i.emoji} {i.name} ×{i.quantity}</span>
                            ))}
                            {t.items.length > 2 && (
                              <span className="item-chip more">+{t.items.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`pay-tag ${t.paymentMethod.toLowerCase()}`}>{t.paymentMethod}</span>
                        </td>
                        <td>₱{Number(t.subtotal).toFixed(2)}</td>
                        <td>₱{Number(t.tax).toFixed(2)}</td>
                        <td className="price-cell">₱{Number(t.total).toFixed(2)}</td>
                        <td>
                          <button
                            className="view-receipt-btn"
                            onClick={() => onViewReceipt(t)}
                            title="View Receipt"
                          >
                            🧾 View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="empty-row">No results for the selected date/filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
