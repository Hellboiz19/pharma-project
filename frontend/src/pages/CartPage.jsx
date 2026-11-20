import { Link } from "react-router-dom";
import { getCartTotal, formatPrice } from "../utils";
import "./CartPage.css";

function CartPage({ cart, onIncrease, onDecrease, onRemove, onClear }) {
  const total = getCartTotal(cart);

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
            <p>{formatPrice(item.price)} l'uno</p>
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
            {formatPrice(item.price * item.quantity)}
          </p>

          <button className="remove" onClick={() => onRemove(item.productID)}>
            Rimuovi
          </button>
        </div>
      ))}

      <h2 className="total">Totale: {formatPrice(total)}</h2>

      <div className="cart-actions">
        <button className="btn secondary" onClick={onClear}>
          Svuota carrello
        </button>
        <Link to="/" className="btn">Continua gli acquisti</Link>
        <Link to="/payment" className="btn">
          Procedi al checkout
        </Link>
      </div>
    </div>
  );
}

export default CartPage;