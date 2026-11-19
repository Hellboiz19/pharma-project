
import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { API_URL } from "./config";
import CartPage from "./pages/CartPage";
import ProductsPage from "./pages/ProductsPage";
import PaymentPage from "./pages/PaymentPage";
import ProductDetailPage from "./pages/ProductDetailPage";

import "./App.css";

async function loadData(path, setter, errorMessage) {
  try {
    const response = await fetch(`${API_URL}${path}`);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const data = await response.json();
    setter(data);

  } catch (error) {
    console.error(error);
    toast.error(errorMessage);
  }
}

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

  // Caricamento dati in base alla pagina visitata
  useEffect(() => {
    const isHomePage = location.pathname === "/";
    const isProductDetail = location.pathname.startsWith("/product/");

    if (isHomePage || isProductDetail) {
      loadData(
        "/products/",
        setProducts,
        "Impossibile caricare i prodotti"
      );
    }

    if (isHomePage) {
      loadData(
        "/categories/",
        setCategories,
        "Impossibile caricare le categorie"
      );
    }
  }, [location.pathname]);

  // Salvataggio carrello nel localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Aggiunta prodotto al carrello
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

  // Aumento quantità
  const increaseQuantity = (productID) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productID === productID && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Diminuzione quantità
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

  // Rimozione prodotto
  const removeFromCart = (productID) => {
    setCart((prev) =>
      prev.filter((item) => item.productID !== productID)
    );
  };

  // Svuotamento carrello
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
        {/* Catalogo prodotti */}
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

        {/* Dettaglio prodotto */}
        <Route
          path="/product/:productID"
          element={
            <ProductDetailPage
              products={products}
              onAdd={addToCart}
            />
          }
        />

        {/* Carrello */}
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

        {/* Pagamento */}
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
