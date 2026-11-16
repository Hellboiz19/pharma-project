function ProductsPage({ products, cart, onAdd }) {
  return (
    <div>
      <h1>I nostri prodotti</h1>

      <div className="grid">
        {products.map((p) => {
          const item = cart.find((i) => i.productID === p.productID);
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
              {p.image && <img src={p.image} alt={p.name} />}
              <h3>{p.name}</h3>
              <p>{/*{p.desc}*/}</p>

              <p className="price">{p.price} €</p>
              
              <p>
                {p.quantity > 0
                  ? `Disponibili: ${p.quantity} unità`
                  : "Prodotto esaurito"}
              </p>

              {/*{p.allergies_desc && (
                <small>Allergie: {p.allergies_desc}</small>
              )} */}

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
    </div>
  );
}

export default ProductsPage;