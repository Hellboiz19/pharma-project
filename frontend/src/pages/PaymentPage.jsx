import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import { getCartTotal, formatPrice } from "../utils";
import "./PaymentPage.css";

function readError(data) {
  if (data.error) return data.error;

  if (data.errors) return data.errors.join(" ");

  const messages = Object.values(data).flat().join(" ");

  return messages || "Si è verificato un errore. Riprova.";
}

function PaymentPage({ cart, onClear }) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [orderId, setOrderId] = useState(null);
  const [paidOrder, setPaidOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cashOrder, setCashOrder] = useState(null);

  const total = getCartTotal(cart);
  const shippingCost = deliveryMethod === "home" ? 5 : 0;
  const orderTotal = total + shippingCost;

  // Gestione dei campi del form
  const handleChange = (e) => {

    const { name, value } = e.target;

    let newValue = value;

    // Solo numeri nel numero della carta
    if (name === "cardNumber") {
      newValue = value.replace(/\D/g, "").slice(0, 16);
    }

    // Solo numeri nel CVV
    if (name === "cvv") {
      newValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setForm({
      ...form,
      [name]: newValue,
    });
  };

  // Invio del pagamento
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {

      let id = orderId;

      // Creo l'ordine solamente se non esiste già
      if (id === null) {

        const orderRes = await fetch(`${API_URL}/orders/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name: form.name,
            customer_email: form.email,
            customer_phone: form.phone,

            delivery_method: deliveryMethod,
            delivery_address:
              deliveryMethod === "home" ? deliveryAddress : "",

            payment_method: paymentMethod,

            items: cart.map((item) => ({
              productID: item.productID,
              quantity: item.quantity,
            })),
          }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          setError(readError(orderData));
          return;
        }

        id = orderData.id;
        setOrderId(id);

        if (paymentMethod === "cash") {
          setCashOrder(orderData);
          onClear();
          return;
        }
      }

      // Invio i dati della carta al backend
      const payRes = await fetch(
        `${API_URL}/orders/${id}/pay/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card_number: form.cardNumber,
            expiry: form.expiry,
            cvv: form.cvv,
          }),
        }
      );

      const payData = await payRes.json();

      if (!payRes.ok) {
        setError(readError(payData));
        return;
      }

      // Pagamento completato
      setPaidOrder(payData);

      // Svuoto il carrello
      onClear();

    } catch {

      setError(
        "Impossibile contattare il server. Controlla che Django sia acceso."
      );

    } finally {

      setLoading(false);

    }
  };

  // Ordine creato con pagamento in contanti
  if (cashOrder) {
    return (
      <div>
        <h1>Ordine ricevuto!</h1>

        <p>
          Grazie {cashOrder.customer_name}!
        </p>

        <p>
          Il tuo ordine n. <strong>{cashOrder.id}</strong> è stato creato.
        </p>

        <p>
          Pagamento: <strong>Contanti al ritiro in farmacia</strong>
        </p>

        <p>
          Stato ordine: <strong>{cashOrder.status}</strong>
        </p>

        <div className="summary">
          {cashOrder.items.map((item, index) => (
            <div className="summary-row" key={index}>
              <span>
                {item.name} × {item.quantity}
              </span>

              <span>
                {formatPrice(Number(item.unit_price) * item.quantity)}
              </span>
            </div>
          ))}

          <h3 className="summary-row">
            <span>Totale da pagare al ritiro</span>
            <span>{formatPrice(cashOrder.total)}</span>
          </h3>
        </div>

        <Link to="/" className="btn">
          Torna ai prodotti
        </Link>
      </div>
    );
  }

  // Schermata di pagamento riuscito
  if (paidOrder) {

    return (
      <div>

        <h1>Pagamento riuscito</h1>

        <p>
          Grazie {paidOrder.customer_name}! Il tuo ordine{" "}
          <strong>n. {paidOrder.id}</strong> è stato pagato.
        </p>

        <p>
          Codice transazione: {paidOrder.transaction_id}
        </p>

        <p>
          Stato ordine: <strong>{paidOrder.status}</strong>
        </p>

        <div className="summary">

          {paidOrder.items.map((item, index) => (

            <div className="summary-row" key={index}>

              <span>
                {item.name} × {item.quantity}
              </span>

              <span>
                {formatPrice(Number(item.unit_price) * item.quantity)}
              </span>

            </div>

          ))}

          <h3 className="summary-row">

            <span>Totale pagato</span>

            <span>
              {formatPrice(paidOrder.total)}
            </span>

          </h3>

        </div>

        <Link to="/" className="btn">
          Torna ai prodotti
        </Link>

      </div>
    );
  }

  // Carrello vuoto
  if (cart.length === 0) {

    return (
      <div>

        <h1>Pagamento</h1>

        <p>Il carrello è vuoto.</p>

        <Link to="/" className="btn">
          Torna ai prodotti
        </Link>

      </div>
    );
  }

  // Form di pagamento
  return (
    <div>

      <h1>Pagamento</h1>

      <div className="checkout">

        <form className="form" onSubmit={handleSubmit}>

          <h2>I tuoi dati</h2>

          <label>
            Nome e cognome

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Telefono

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>

          <h2>Modalità di consegna</h2>

          <div className="delivery-options">

            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryMethod"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                disabled={orderId !== null}
              />

              Ritiro in farmacia – Gratuito
            </label>

            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryMethod"
                checked={deliveryMethod === "home"}
                onChange={() => {
                  setDeliveryMethod("home");
                  setPaymentMethod("card");
                }}
                disabled={orderId !== null}
              />

              Spedizione a domicilio – 5,00 €
            </label>

          </div>

          {deliveryMethod === "home" && (
            <label className="delivery-address">
              Indirizzo di spedizione

              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Via, numero civico, città"
                required
                disabled={orderId !== null}
              />
            </label>
          )}

          <h2>Metodo di pagamento</h2>

          <div className="payment-method-options">

            <label className="delivery-option">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                disabled={orderId !== null}
              />

              Carta di pagamento (simulata)
            </label>

            {deliveryMethod === "pickup" && (
              <label className="delivery-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  disabled={orderId !== null}
                />

                Contanti al ritiro in farmacia
              </label>
            )}

          </div>

            
          {paymentMethod === "card" ? (
          <>
            <h2>Carta di pagamento (simulata)</h2>

            <p className="hint">
              Inserisci qualsiasi numero di carta di 16 cifre,
              una scadenza in formato MM/AA e un CVV di 3 cifre.
              Il pagamento è simulato.
            </p>

            <label>
              Numero di carta

              <input
                type="text"
                name="cardNumber"
                inputMode="numeric"
                placeholder="1234567890123456"
                maxLength={16}
                minLength={16}
                pattern="[0-9]{16}"
                value={form.cardNumber}
                onChange={handleChange}
                required
              />
            </label>

            <div className="form-row">
              <label>
                Scadenza (MM/AA)

                <input
                  type="text"
                  name="expiry"
                  placeholder="12/30"
                  maxLength={5}
                  pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                  value={form.expiry}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                CVV

                <input
                  type="text"
                  name="cvv"
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={3}
                  minLength={3}
                  pattern="[0-9]{3}"
                  value={form.cvv}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
          </>
        ) : (
          <p className="hint">
            Pagherai in contanti direttamente in farmacia
            quando ritirerai il tuo ordine.
          </p>
        )}

          {error && (
            <p className="error">{error}</p>
          )}

          <button
            className="btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Elaborazione..."
              : paymentMethod == "cash"
              ? "Conferma ordine"
              : `Paga ${formatPrice(orderTotal)}`}
          </button>

        </form>

        <div className="summary">

          <h2>Riepilogo</h2>

          {cart.map((item) => (

            <div className="summary-row" key={item.productID}>

              <span>
                {item.name} × {item.quantity}
              </span>

              <span>
                {formatPrice(item.price * item.quantity)}
              </span>

            </div>

          ))}
          
          <div className="summary-row">
            <span>Prodotti</span>
            <span>{formatPrice(total)}</span>
          </div>
    
          <div className="summary-row">
            <span>Spedizione</span>
            <span>{formatPrice(shippingCost)}</span>
          </div>

          <h3 className="summary-row">
            <span>Totale</span>
            <span>{formatPrice(orderTotal)}</span>
          </h3>

          <Link to="/cart">
            Torna al carrello
          </Link>

        </div>

      </div>

    </div>
  );
}

export default PaymentPage;
