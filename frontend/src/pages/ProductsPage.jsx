import { useState } from "react";

function ProductsPage({ products, categories, cart, onAdd }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" ||
      String(p.category) === String(selectedCategory);

    const matchesSearch = (p.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

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
        {filteredProducts.map((p) => {
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
              {p.image && (
                <img src={p.image} alt={p.name} />
              )}

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
    </div>
  );
}

export default ProductsPage;
