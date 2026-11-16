import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation} from "react-router-dom";
import CartPage from "./pages/CartPage";
import ProductsPage from "./pages/ProductsPage";
import PaymentPage from "./pages/PaymentPage";
import "./App.css";


function App() {
  const location = useLocation();
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const refreshProducts = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/products/");

    if (!res.ok) {
      throw new Error("Errore nel caricamento dei prodotti");
    }

    const data = await res.json();
    setProducts(data);

  } catch (error) {
    console.error("Errore:", error);
  }
};

useEffect(() => {
  if (location.pathname === "/") {
    refreshProducts();
  }
}, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productID === product.productID);

      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((item) =>
          item.productID === product.productID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          productID: product.productID,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          stock: product.quantity,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (productID) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productID === productID && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productID) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productID === productID
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productID) => {
    setCart((prev) => prev.filter((item) => item.productID !== productID));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    
    <div className="container">
      <title>Pharma</title>
      <header className="header">
        <Link to="/" className="logo">Farmacia</Link>
        <Link to="/cart" className="cart-link">Carrello ({cartCount})</Link>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <ProductsPage products={products} cart={cart} onAdd={addToCart} />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onRemove={removeFromCart}
              onClear={clearCart}
            />
          }
        />
        <Route
          path="/payment"
          element={<PaymentPage cart={cart} onClear={clearCart} />}
        />
      </Routes>
    </div>
  );
}

export default App;