import { useState, useEffect } from 'react';

function Caisse() {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);

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
          return []; // On enlève complètement si quantité = 0
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
        )}
        <h3>Total : {total.toFixed(2)} €</h3>
      </div>

      {/* Partie produits */}
      <div style={{ flex: 1 }}>
        <h2>Produits disponibles</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {products.map((prod) => (
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
    </div>
  );
}

export default Caisse;