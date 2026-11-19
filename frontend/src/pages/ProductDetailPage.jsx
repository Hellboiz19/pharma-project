import { useParams, Link } from "react-router-dom";
import { BACKEND_URL } from "../config";
import "./ProductDetailPage.css";

function ProductDetailPage({ products, onAdd }) {
  const { productID } = useParams();

  const product = products.find(
    (p) => String(p.productID) === String(productID)
  );

  const recommendedProducts = [
    ...products.filter(
      (p) =>
        p.productID !== product.productID &&
        String(p.category) === String(product.category)
    ),
    ...products.filter(
      (p) =>
        p.productID !== product.productID &&
        String(p.category) !== String(product.category)
    ),
  ].slice(0, 4);

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
                  : `${BACKEND_URL}${product.image}`
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
          <br>
          
          </br>
          <button
            className="detail-add-button"
            onClick={() => onAdd(product)}
            disabled={product.quantity <= 0}
          >
            Aggiungi al carrello
          </button>
        </div>
        </div>

        {recommendedProducts.length > 0 && (
          <section className="recommended-section">
            <h2>Potrebbe interessarti anche</h2>

            <div className="recommended-grid">
              {recommendedProducts.map((p) => (
                <div className="recommended-card" key={p.productID}>
                  <Link to={`/product/${p.productID}`}>
                    {p.image && (
                      <img
                        src={
                          p.image.startsWith("http")
                            ? p.image
                            : `${BACKEND_URL}${p.image}`
                        }
                        alt={p.name}
                      />
                    )}
                  </Link>

                  <h3>{p.name}</h3>

                  <p>€ {Number(p.price).toFixed(2)}</p>

                  <Link
                    to={`/product/${p.productID}`}
                    className="recommended-link"
                  >
                    Scopri prodotto
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

export default ProductDetailPage;

