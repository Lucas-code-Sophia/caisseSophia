import { useState, useEffect, useRef } from 'react';
import './Caisse.css';
import produitsParDefaut from './produits_sophia_vfinal.json';

function Caisse() {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedForPayment, setSelectedForPayment] = useState([]);
  const ticketRef = useRef(null);
  const [showTicketPreview, setShowTicketPreview] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      // Initialiser avec les produits du JSON + leur attribuer un ID unique s'ils n'en ont pas
      const produitsAvecId = produitsParDefaut.map((prod) => ({
        ...prod,
        id: prod.id || Date.now() + Math.random(), // pour éviter les doublons
      }));
      setProducts(produitsAvecId);
      localStorage.setItem('products', JSON.stringify(produitsAvecId));
    }
  }, []);  

  const [paymentsHistory, setPaymentsHistory] = useState(() => {
    const saved = localStorage.getItem('paymentsHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [cashPopup, setCashPopup] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  
  const handlePayment = (type, amount = selectedTotal) => {
    const newPayment = {
      id: Date.now(),
      amount: parseFloat(amount),
      type,
      date: new Date().toLocaleString(),
    };
  
    const updatedHistory = [...paymentsHistory, newPayment];
    setPaymentsHistory(updatedHistory);
    localStorage.setItem('paymentsHistory', JSON.stringify(updatedHistory));
  
    // Ensuite on enlève les éléments payés de la commande
    const updatedOrder = order.flatMap(item => {
      const selected = selectedForPayment.find(sel => sel.id === item.id);
      if (!selected) return item;
      const remainingQty = item.quantity - selected.quantitySelected;
      if (remainingQty > 0) {
        return { ...item, quantity: remainingQty };
      } else {
        return [];
      }
    });
  
    setOrder(updatedOrder);
    setSelectedForPayment([]);
    setShowPaymentPopup(false);
    setCashPopup(false);
    setCashReceived('');
  };  

  const generateTicketNumber = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const [ticketNumber, setTicketNumber] = useState(generateTicketNumber());

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

  const handleSelectItem = (productId, action) => {
    const currentItem = order.find((item) => item.id === productId);
    if (!currentItem) return;
  
    const currentSelection = selectedForPayment.find((item) => item.id === productId);
  
    if (currentSelection) {
      const newQuantity =
        action === 'add'
          ? Math.min(currentSelection.quantitySelected + 1, currentItem.quantity)
          : Math.max(currentSelection.quantitySelected - 1, 0);
  
      const updatedSelections = selectedForPayment
        .map(item => item.id === productId ? { ...item, quantitySelected: newQuantity } : item)
        .filter(item => item.quantitySelected > 0); // Enlève si quantité = 0
      setSelectedForPayment(updatedSelections);
    } else if (action === 'add') {
      setSelectedForPayment([...selectedForPayment, { id: productId, quantitySelected: 1 }]);
    }
  };  

  const handlePaySelected = () => {
    const updatedOrder = order.flatMap(item => {
      const selected = selectedForPayment.find(sel => sel.id === item.id);
      if (!selected) return item; // rien à changer

      const remainingQty = item.quantity - selected.quantitySelected;
      if (remainingQty > 0) {
        return { ...item, quantity: remainingQty };
      } else {
        return []; // Tout payé ➔ enlever le produit
      }
    });

    setOrder(updatedOrder);
    setSelectedForPayment([]);
  };

  const getSelectedQuantity = (productId) => {
    return selectedForPayment.find((item) => item.id === productId)?.quantitySelected || 0;
  };

  const selectedTotal = selectedForPayment.reduce((sum, sel) => {
    const product = order.find((item) => item.id === sel.id);
    if (!product) return sum;
    return sum + product.price * sel.quantitySelected;
  }, 0);

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePrint = () => {
    const printContent = ticketRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
  
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // pour éviter les bugs de styles après impression
  };

  return (
    <div className="caisse-container">
      {/* Partie commande */}
      <div className="commande-section">
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

                  {/* Sélection pour paiement */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '1rem' }}>
                    <button className="button-qty" onClick={() => handleSelectItem(item.id, 'remove')}
                      >-</button>
                    <span>{getSelectedQuantity(item.id)}</span>
                    <button className="button-qty" onClick={() => handleSelectItem(item.id, 'add')}
                      >+</button>
                  </div>
                </li>
              ))}
            </ul>
            <button className="button" onClick={() => setOrder([])} >
              Nouvelle commande
            </button>
            {order.length > 0 && (
              <button className="button" onClick={() => setShowTicketPreview(true)} >
                Imprimer le ticket
              </button>
            )}
          </>
        )}

        {/* Paiement partiel */}
        {selectedForPayment.length > 0 && (
          <div style={{ marginTop: '2rem', background: '#f8f8f8', padding: '1rem', borderRadius: '8px' }}>
            <h3>Sous-total sélectionné : {selectedTotal.toFixed(2)} €</h3>
            <button className="button" onClick={() => setShowPaymentPopup(true)} >
              Payer la sélection
            </button>
          </div>
        )}

        <h3 style={{ marginTop: '2rem' }}>Total : {total.toFixed(2)} €</h3>
      </div>

      {/* Partie produits par type */}
      <div className="produits-section">
        <div className="produits-list">
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
                      className="produit-card"
                      style={{
                        backgroundColor: prod.color,
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
        <div className="categories-menu">
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
                    {showTicketPreview && (
            <div className="ticket-popup" >
              <div className="ticket-content">
                <div ref={ticketRef} style={{ fontFamily: 'monospace', fontSize: '12px', color: 'black' }}>
                  <h2 style={{ textAlign: 'center' }}>SOPHIA</h2>
                  <p style={{ textAlign: 'center' }}>
                    67 boulevard de la plage<br />
                    33970 Cap-Ferret<br />
                    Tél : 0557182188
                  </p>
                  <p>
                    Ticket : {ticketNumber}<br />
                    {new Date().toLocaleString()}
                  </p>
                  <hr />
                  {order.map(item => (
                    <div key={item.id} style={{ marginBottom: '4px' }}>
                      {item.name} x{item.quantity} = {(item.price * item.quantity).toFixed(2)} €
                    </div>
                  ))}
                  <hr />

                  {/* TVA */}
                  {(() => {
                      const tva10TTC = order
                      .filter(i => parseFloat(i.tva) === 10)
                      .reduce((sum, i) => sum + (i.price * i.quantity), 0);

                    const tva20TTC = order
                      .filter(i => parseFloat(i.tva) === 20)
                      .reduce((sum, i) => sum + (i.price * i.quantity), 0);

                    const tva10Amount = (tva10TTC * 10) / 110;
                    const tva20Amount = (tva20TTC * 20) / 120;

                    const totalHT = (tva10TTC + tva20TTC) - (tva10Amount + tva20Amount);
                    const totalTTC = tva10TTC + tva20TTC;

                    return (
                      <>
                        <p>
                          T.V.A. 10% : {tva10Amount.toFixed(2)} €<br />
                          T.V.A. 20% : {tva20Amount.toFixed(2)} €
                        </p>
                        <p><strong>Total TTC : {totalTTC.toFixed(2)} €</strong></p>
                      </>
                    );
                  })()}
                  <hr />
                  <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Merci de nous avoir rendu visite chez Sophia,<br />
                    on attend déjà votre retour !
                  </p>
                  <p style={{ fontSize: '11px', textAlign: 'center' }}>
                    Horaires : Tous les jours de 12h à 15h et de 19h à 23h
                  </p>
                </div>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button onClick={handlePrint} style={{ marginRight: '1rem' }}>
                    🖨️ Imprimer le ticket
                  </button>
                  <button onClick={() => setShowTicketPreview(false)}>Fermer</button>
                </div>
              </div>
            </div>
          )}
        </div>
              {showPaymentPopup && (
        <div className="ticket-popup">
          <div className="ticket-content" style={{ textAlign: 'center' }}>
            <h3>Choisir mode de paiement</h3>
            <button className="button" onClick={() => handlePayment('CB')} style={{ margin: '0.5rem 0' }}>
              💳 CB ({selectedTotal.toFixed(2)}€)
            </button>
            <button className="button" onClick={() => setCashPopup(true)} style={{ margin: '0.5rem 0' }}>
              💵 Espèces
            </button>
            <br />
            <button className="button" onClick={() => setShowPaymentPopup(false)} style={{ marginTop: '1rem' }}>
              Annuler
            </button>
          </div>
        </div>
      )}
            {cashPopup && (
        <div className="ticket-popup">
          <div className="ticket-content" style={{ textAlign: 'center' }}>
            <h3>Montant donné en espèces</h3>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="Montant reçu (€)"
              style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
            />
            {cashReceived && (
              <p>
                Monnaie à rendre : {(cashReceived - selectedTotal).toFixed(2)} €
              </p>
            )}
            <button className="button" onClick={() => handlePayment('Espèces', cashReceived)} style={{ marginTop: '1rem' }}>
              Confirmer paiement
            </button>
            <br />
            <button className="button" onClick={() => setCashPopup(false)} style={{ marginTop: '1rem' }}>
              Annuler
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Caisse;