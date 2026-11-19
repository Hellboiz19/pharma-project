// Calcolo del totale del carrello
export const getCartTotal = (cart) =>
  cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

// Formattazione dei prezzi
export const formatPrice = (value) =>
  `${Number(value).toFixed(2)} €`;