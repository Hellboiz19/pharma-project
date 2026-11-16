import { Link } from "react-router-dom";

function CartPage({ cart, onIncrease, onDecrease, onRemove, onClear }) {
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div>
        <h1>Il tuo carrello</h1>
        <p>Il carrello è vuoto.</p>
        <Link to="/" className="btn">Torna ai prodotti</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Il tuo carrello</h1>

      {cart.map((item) => (
        <div className="cart-row" key={item.productID}>
          {item.image && (
            <img className="cart-img" src={item.image} alt={item.name} />
          )}

          <div className="cart-info">
            <h3>{item.name}</h3>
            <p>{item.price.toFixed(2)} € l'uno</p>
          </div>

          <div className="cart-qty">
            <button onClick={() => onDecrease(item.productID)}>-</button>
            <span>{item.quantity}</span>
            <button
              onClick={() => onIncrease(item.productID)}
              disabled={item.quantity >= item.stock}
            >
              +
            </button>
          </div>

          <p className="cart-subtotal">
            {(item.price * item.quantity).toFixed(2)} €
          </p>

          <button className="remove" onClick={() => onRemove(item.productID)}>
            Rimuovi
          </button>
        </div>
      ))}

      <h2 className="total">Totale: {total.toFixed(2)} €</h2>

      <div className="cart-actions">
        <button className="btn secondary" onClick={onClear}>
          Svuota carrello
        </button>
        <Link to="/" className="btn">Continua gli acquisti</Link>
        <Link to="/payment" className="btn">Procedi al pagamento</Link>
      </div>
    </div>
  );
}

export default CartPage;