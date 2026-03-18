export default function Cart({
  cart, cartSubtotal, cartTax, cartTotal,
  onUpdateQty, onRemoveItem, onCheckout, onClearCart,
}) {
  return (
    <div className="cart">
      <div className="cart-header">
        <h3 className="cart-title">Current Order</h3>
        {cart.length > 0 && (
          <button className="clear-cart-btn" onClick={onClearCart}>Clear all</button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <span className="empty-icon">🛒</span>
          <p className="empty-title">Cart is empty</p>
          <p className="empty-hint">Tap a product to add it</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <span className="ci-emoji">{item.emoji}</span>
                <div className="ci-info">
                  <p className="ci-name">{item.name}</p>
                  <p className="ci-price">₱{item.price.toFixed(2)}</p>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>+</button>
                </div>
                <div className="ci-total">
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  <button className="rm-btn" onClick={() => onRemoveItem(item.id)} aria-label="Remove item">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-totals">
            <div className="tot-row">
              <span>Subtotal</span>
              <span>₱{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="tot-row">
              <span>VAT (12%)</span>
              <span>₱{cartTax.toFixed(2)}</span>
            </div>
            <div className="tot-row grand">
              <span>Total</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button className="checkout-btn" onClick={onCheckout}>
            Checkout &rarr; ₱{cartTotal.toFixed(2)}
          </button>
        </>
      )}
    </div>
  );
}
