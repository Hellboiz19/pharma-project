import { useParams, Link } from "react-router-dom";
import "./ProductDetailPage.css";

function ProductDetailPage({ products, onAdd }) {
  const { productID } = useParams();

  const product = products.find(
    (p) => p.productID === p.productID
  );

  if (!product) {
    return (
      <div className="product-detail-container">
        <h2>Prodotto non trovato</h2>
        <Link to="/">Torna al catalogo</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <Link to="/" className="back-link">
        ← Torna al catalogo
      </Link>

      <div className="product-detail">
        <div className="product-detail-image">
          {product.image ? (
            <img
              src={
                product.image.startsWith("http")
                  ? product.image
                  : `http://127.0.0.1:8000${product.image}`
              }
              alt={product.name}
            />
          ) : (
            <div className="no-image">Immagine non disponibile</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>

          <p className="detail-price">
            € {Number(product.price).toFixed(2)}
          </p>

          <p className="detail-description">
            {product.desc}
          </p>

          <div className="detail-section">
            <h3>Allergie e avvertenze</h3>
            <p>{product.allergies_desc || "Informazioni non disponibili."}</p>
          </div>

          <div className="detail-stock">
            {product.quantity > 0
              ? `Disponibili: ${product.quantity} pezzi`
              : "Prodotto esaurito"}
          </div>

          <button
            className="detail-add-button"
            onClick={() => onAdd(product)}
            disabled={product.quantity <= 0}
          >
            Aggiungi al carrello
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

