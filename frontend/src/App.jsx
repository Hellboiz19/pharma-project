
import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CartPage from "./pages/CartPage";
import ProductsPage from "./pages/ProductsPage";
import PaymentPage from "./pages/PaymentPage";
import "./App.css";

function App() {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

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
      console.error("Errore prodotti:", error);
      toast.error("Impossibile caricare i prodotti");
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/categories/");

      if (!res.ok) {
        throw new Error("Errore nel caricamento delle categorie");
      }

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Errore categorie:", error);
      toast.error("Impossibile caricare le categorie");
    }
  };

  useEffect(() => {
    if (location.pathname === "/") {
      refreshProducts();
      refreshCategories();
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.warning("Prodotto esaurito");
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productID === product.productID
      );

      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.warning("Hai raggiunto la quantità massima disponibile");
          return prev;
        }

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

    toast.success("Prodotto aggiunto al carrello!");
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
    setCart((prev) =>
      prev.filter((item) => item.productID !== productID)
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="container">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="colored"
      />

      <header className="navbar">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✚</span>
          <span>Pharma</span>
        </Link>

        <Link to="/cart" className="navbar-cart">
          <span>🛒</span>
          <span>Carrello</span>
          <span className="cart-count">{cartCount}</span>
        </Link>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <ProductsPage
              products={products}
              categories={categories}
              cart={cart}
              onAdd={addToCart}
            />
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
          element={
            <PaymentPage
              cart={cart}
              onClear={clearCart}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
