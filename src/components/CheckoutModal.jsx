import { useState } from 'react';

const PAYMENT_METHODS = [
  { id: 'Cash',  icon: '💵' },
  { id: 'GCash', icon: '📱' },
  { id: 'Maya',  icon: '💜' },
  { id: 'Card',  icon: '💳' },
];

export default function CheckoutModal({ cart, subtotal, tax, total, onClose, onComplete }) {
  const [method,   setMethod]   = useState('Cash');
  const [received, setReceived] = useState('');

  const isCash     = method === 'Cash';
  const recvNum    = parseFloat(received) || 0;
  const change     = +(recvNum - total).toFixed(2);
  const canSubmit  = !isCash || recvNum >= total;

  // Quick amount shortcuts (exact + common bills)
  const quickAmounts = [...new Set([total, 100, 200, 500, 1000].filter(v => v >= total))]
    .sort((a, b) => a - b)
    .slice(0, 4);

  const handleComplete = () => {
    if (!canSubmit) return;
    onComplete({
      paymentMethod:   method,
      amountReceived:  isCash ? recvNum : total,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal checkout-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Checkout</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Order summary */}
          <div className="co-section">
            <h4 className="co-label">Order Summary</h4>
            <div className="co-items">
              {cart.map(item => (
                <div key={item.id} className="co-item">
                  <span className="co-item-name">{item.emoji} {item.name} × {item.quantity}</span>
                  <span className="co-item-total">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="co-totals">
              <div className="co-tot-row"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
              <div className="co-tot-row"><span>VAT (12%)</span><span>₱{tax.toFixed(2)}</span></div>
              <div className="co-tot-row grand"><span>Total</span><span>₱{total.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Payment method */}
          <div className="co-section">
            <h4 className="co-label">Payment Method</h4>
            <div className="pay-methods">
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm.id}
                  className={`pay-btn ${method === pm.id ? 'active' : ''}`}
                  onClick={() => setMethod(pm.id)}
                >
                  <span>{pm.icon}</span>
                  <span>{pm.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash section */}
          {isCash && (
            <div className="co-section cash-section">
              <h4 className="co-label">Cash Payment</h4>

              {/* Quick amount buttons */}
              <div className="quick-amounts">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    className={`quick-btn ${Number(received) === amt ? 'active' : ''}`}
                    onClick={() => setReceived(String(amt))}
                  >
                    ₱{amt % 1 === 0 ? amt : amt.toFixed(2)}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div className="amount-field">
                <label htmlFor="amt-input">Amount Received</label>
                <div className="amount-input-wrap">
                  <span className="peso-sign">₱</span>
                  <input
                    id="amt-input"
                    type="number"
                    value={received}
                    onChange={e => setReceived(e.target.value)}
                    placeholder={`${total.toFixed(2)}`}
                    min={total}
                    step="1"
                  />
                </div>
              </div>

              {/* Change display */}
              {recvNum > 0 && (
                <div className={`change-box ${change >= 0 ? 'positive' : 'negative'}`}>
                  <span className="change-label">Change</span>
                  <span className="change-val">
                    {change >= 0
                      ? `₱${change.toFixed(2)}`
                      : `⚠ Short by ₱${Math.abs(change).toFixed(2)}`
                    }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-success"
            onClick={handleComplete}
            disabled={!canSubmit}
          >
            ✓ Complete Order
          </button>
        </div>
      </div>
    </div>
  );
}
