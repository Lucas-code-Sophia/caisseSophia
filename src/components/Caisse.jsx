import { useState, useEffect } from 'react';

function Caisse() {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);

  const types = ['entrée', 'plat', 'dessert', 'soft', 'alcool', 'café', 'boisson', 'menu', 'autre'];

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const addToOrder = (product) => {
    const existingProduct = order.find((item) => item.id === product.id);
    if (existingProduct) {
      setOrder(order.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrder([...order, { ...product, quantity: 1 }]);
    }
  };

  const increaseQuantity = (productId) => {
    setOrder(order.map(item =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQuantity = (productId) => {
    setOrder(order.flatMap(item => {
      if (item.id === productId) {
        if (item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        } else {
          return []; // Supprime l'élément si 0
        }
      }
      return item;
    }));
  };

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      {/* Partie commande */}
      <div style={{ flex: 1 }}>
        <h2>Commande en cours</h2>
        {order.length === 0 ? (
          <p>Aucun produit sélectionné.</p>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {order.map((item) => (
                <li
                  key={item.id}
                  style={{
                    backgroundColor: item.color,
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>
                      {item.quantity}×
                    </strong>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                    <span>{(item.price * item.quantity).toFixed(2)}€</span>
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={() => setOrder([])} style={{ marginTop: '1rem' }}>
              Nouvelle commande
            </button>
          </>
        )}
        <h3>Total : {total.toFixed(2)} €</h3>
      </div>

      {/* Partie produits par type */}
      <div style={{ flex: 2, display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 4 }}>
          <h2>Produits disponibles</h2>
          {types.map((type) => (
            <div key={type} id={type} style={{ marginBottom: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid #ccc' }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {products
                  .filter((prod) => prod.type === type)
                  .map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => addToOrder(prod)}
                      style={{
                        backgroundColor: prod.color,
                        border: '1px solid #ccc',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        width: '120px',
                        height: '70px'
                      }}
                    >
                      {prod.name}<br />{prod.price}€
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Menu sticky à droite */}
        <div style={{ flex: 1, position: 'sticky', top: '1rem', background: '#f8f8f8', padding: '1rem', borderRadius: '8px' }}>
          <h3>Catégories</h3>
          {types.map((type) => (
            <a
              key={type}
              href={`#${type}`}
              style={{ display: 'block', marginBottom: '0.5rem', textDecoration: 'none', color: 'black' }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Caisse;