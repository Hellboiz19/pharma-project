import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ProductsPage.css";

function ProductsPage({ products, categories, cart, onAdd }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 6;

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" ||
      String(p.category) === String(selectedCategory);

    const matchesSearch = (p.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div>
      <h1>I nostri prodotti</h1>

      <div className="catalog-filters">
        <input
          type="text"
          placeholder="Cerca un prodotto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Tutte le categorie</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <p className="results-count">
        Prodotti trovati: {filteredProducts.length}
      </p>

      <div className="grid">
        {currentProducts.map((p) => {
          const item = cart.find(
            (i) => i.productID === p.productID
          );

          const inCart = item ? item.quantity : 0;
          const soldOut = p.quantity <= 0;
          const maxReached = soldOut || inCart >= p.quantity;

          let buttonText = "Aggiungi al carrello";

          if (soldOut) {
            buttonText = "Esaurito";
          } else if (maxReached) {
            buttonText = "Massimo raggiunto";
          }

          return (
            <div className="card" key={p.productID}>
              <Link to={`/product/${p.productID}`}>
                {p.image && (
                  <img src={p.image} alt={p.name} />
                )}          
              </Link>

              <h3>{p.name}</h3>

              <p className="price">{p.price} €</p>

              <button
                className="btn"
                onClick={() => onAdd(p)}
                disabled={maxReached}
              >
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <p>Nessun prodotto trovato.</p>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            Precedente
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={
                currentPage === index + 1 ? "active-page" : ""
              }
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Successiva
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
