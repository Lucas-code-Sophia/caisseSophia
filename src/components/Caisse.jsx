import { useState, useEffect, useRef } from 'react';
import './Caisse.css';
import produitsParDefaut from './produits_sophia_vfinal.json';
import emailjs from '@emailjs/browser';

function Caisse() {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedForPayment, setSelectedForPayment] = useState([]);
  const ticketRef = useRef(null);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailToSend, setEmailToSend] = useState('');
  const [showDiversPopup, setShowDiversPopup] = useState(false);
  const [diversTitle, setDiversTitle] = useState('');
  const [diversPrice, setDiversPrice] = useState('');
  const [couverts, setCouverts] = useState(0); // valeur par défaut à 0
  const handlePrintInline = () => {
    const printContents = ticketRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
  
    const printContainer = document.createElement('div');
    printContainer.innerHTML = printContents;
    document.body.innerHTML = '';
    document.body.appendChild(printContainer);
  
    window.print();
  
    // Rétablir l'app après un court délai
    setTimeout(() => {
      document.body.innerHTML = originalContents;
    }, 100); // suffisant pour que l'impression démarre
  };  

  useEffect(() => {
    emailjs.init('E9IrqJu4dENA8QDPF');
    const saved = localStorage.getItem('products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      const produitsAvecId = produitsParDefaut.map((prod) => ({
        ...prod,
        id: prod.id || Date.now() + Math.random(),
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

    const updatedOrder = order.flatMap(item => {
      const selected = selectedForPayment.find(sel => sel.id === item.id);
      if (!selected) return item;
      const remainingQty = item.quantity - selected.quantitySelected;
      return remainingQty > 0 ? { ...item, quantity: remainingQty } : [];
    });

    setOrder(updatedOrder);
    setSelectedForPayment([]);
    setShowPaymentPopup(false);
    setCashPopup(false);
    setCashReceived('');
  };

  const generateTicketNumber = () => {
    return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  };

  const [ticketNumber, setTicketNumber] = useState(generateTicketNumber());
  const types = ['entrée', 'plat', 'dessert', 'soft', 'alcool', 'alcool supérieur', 'cocktail', 'vins', 'café', 'menu', 'autre'];

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const addToOrder = (product) => {
    const existingProduct = order.find((item) => item.id === product.id);
    setOrder(existingProduct
      ? order.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...order, { ...product, quantity: 1 }]);
  };

  const increaseQuantity = (productId) => {
    setOrder(order.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQuantity = (productId) => {
    setOrder(order.flatMap(item => {
      if (item.id === productId) {
        return item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : [];
      }
      return item;
    }));
  };

  const handleSelectItem = (productId, action) => {
    const currentItem = order.find((item) => item.id === productId);
    if (!currentItem) return;

    const currentSelection = selectedForPayment.find((item) => item.id === productId);
    if (currentSelection) {
      const newQuantity = action === 'add'
        ? Math.min(currentSelection.quantitySelected + 1, currentItem.quantity)
        : Math.max(currentSelection.quantitySelected - 1, 0);

      const updatedSelections = selectedForPayment
        .map(item => item.id === productId ? { ...item, quantitySelected: newQuantity } : item)
        .filter(item => item.quantitySelected > 0);
      setSelectedForPayment(updatedSelections);
    } else if (action === 'add') {
      setSelectedForPayment([...selectedForPayment, { id: productId, quantitySelected: 1 }]);
    }
  };

  const handlePaySelected = () => {
    const updatedOrder = order.flatMap(item => {
      const selected = selectedForPayment.find(sel => sel.id === item.id);
      if (!selected) return item;
      const remainingQty = item.quantity - selected.quantitySelected;
      return remainingQty > 0 ? { ...item, quantity: remainingQty } : [];
    });

    setOrder(updatedOrder);
    setSelectedForPayment([]);
  };

  const getSelectedQuantity = (productId) => {
    return selectedForPayment.find((item) => item.id === productId)?.quantitySelected || 0;
  };

  const selectedTotal = selectedForPayment.reduce((sum, sel) => {
    const product = order.find((item) => item.id === sel.id);
    return product ? sum + product.price * sel.quantitySelected : sum;
  }, 0);

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePrint = () => {
    const originalContents = document.body.innerHTML;
    const ticketContent = ticketRef.current.innerHTML;
  
    document.body.innerHTML = `
      <html>
        <head>
          <style>
            body {
              font-family: monospace;
              font-size: 12px;
              padding: 1rem;
            }
          </style>
        </head>
        <body>${ticketContent}</body>
      </html>
    `;
  
    window.print();

    const handlePrintInline = () => {
      const printWindow = window.open('', 'PRINT', 'height=600,width=400');
      if (!printWindow) return;
    
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket</title>
            <style>
              body {
                font-family: "Roboto Condensed", "Arial Narrow", monospace;
                font-size: 11px;
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${ticketRef.current.innerHTML}
          </body>
        </html>
      `);
    
      printWindow.document.close();
      printWindow.focus();
    
      printWindow.print();
      printWindow.close();
    };    
  
    // Restaure le contenu après impression
    setTimeout(() => {
      document.body.innerHTML = originalContents;
      window.location.reload(); // Recharge proprement la page
    }, 100);
  };  

  const sendPdfByEmail = async () => {
    const element = ticketRef.current;
  
    const opt = {
      margin: 0.2,
      filename: `ticket-${ticketNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a5', orientation: 'portrait' },
    };
  
    const pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
  
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onloadend = async () => {
      const base64Pdf = reader.result.split(',')[1];
  
      try {
        await emailjs.send('service_sophia', 'template_l1tzc55', {
          to_email: emailToSend,
          ticket_content: ticketRef.current.innerHTML,
        }, 'E9IrqJu4dENA8QDPF');
  
        alert(`PDF envoyé à ${emailToSend}`);
        setShowEmailPopup(false);
        setShowTicketPreview(false);
      } catch (error) {
        console.error('Erreur EmailJS :', error);
        alert('Erreur lors de l’envoi du PDF.');
      }
    };
  };  


  return (
    <div className="caisse-container">
      <div className="commande-section">
        <h2>Commande en cours</h2>
        {order.length === 0 ? (
          <p>Aucun produit sélectionné.</p>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {order.map((item) => (
                <li key={item.id} style={{ backgroundColor: item.color, padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{item.quantity}×</strong>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                    <span>{(item.price * item.quantity).toFixed(2)}€</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '1rem' }}>
                    <button className="button-qty" onClick={() => handleSelectItem(item.id, 'remove')}>-</button>
                    <span>{getSelectedQuantity(item.id)}</span>
                    <button className="button-qty" onClick={() => handleSelectItem(item.id, 'add')}>+</button>
                  </div>
                </li>
              ))}
            </ul>
            {order.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold' }}>Couverts :</label>
              <button onClick={() => setCouverts(Math.max(1, couverts - 1))}>➖</button>
              <input
                type="number"
                value={couverts}
                onChange={(e) => setCouverts(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '3rem', textAlign: 'center' }}
              />
              <button onClick={() => setCouverts(couverts + 1)}>➕</button>
            </div>
          )}
            <button className="button" style={{ marginRight: '1 rem' }} onClick={() => setOrder([])}>Nouvelle commande</button>
            {order.length > 0 && (
              <button className="button" onClick={() => setShowTicketPreview(true)}>Envoyer le ticket</button>
            )}
          </>
        )}

        {selectedForPayment.length > 0 && (
          <div style={{ marginTop: '2rem', background: '#f8f8f8', padding: '1rem', borderRadius: '8px' }}>
            <h3>Sous-total sélectionné : {selectedTotal.toFixed(2)} €</h3>
            <button className="button" onClick={() => setShowPaymentPopup(true)}>Payer la sélection</button>
          </div>
        )}

        <h3 style={{ marginTop: '2rem' }}>Total : {total.toFixed(2)} €</h3>
      </div>

      <div className="produits-section">
        <div className="produits-list">
          <h2>Produits disponibles</h2>
          {types.map((type) => (
            <div key={type} id={type} style={{ marginBottom: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid #ccc' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {products.filter((prod) => prod.type === type).map((prod) => (
                  <button key={prod.id} onClick={() => addToOrder(prod)} className="produit-card" style={{ backgroundColor: prod.color }}>
                    {prod.name}<br />{prod.price}€
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="categories-menu">
          <h3>Catégories</h3>
          {types.map((type) => (
            <a key={type} href={`#${type}`} style={{ display: 'block', marginBottom: '0.5rem', textDecoration: 'none', color: 'black' }}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </a>
          ))}
          <button className="button" onClick={() => setShowDiversPopup(true)}>➕ Divers</button>
          {showTicketPreview && (
            <div className="ticket-popup">
              <div className="ticket-content">
                <div ref={ticketRef} style={{ fontFamily: '"Roboto Condensed", "Arial Narrow", monospace', fontSize: '11px', color: 'black', padding: '4mm', boxSizing: 'border-box' }}>
                  <h2 style={{ textAlign: 'center' }}>SOPHIA</h2>
                  <p style={{ textAlign: 'center' }}>
                    67 BOULEVARD DE LA PLAGE<br />33970 CAP-FERRET<br />Tél : 0557182188<br />SARL LILY<br />SIRET : 94077148800027
                  </p>
                  <p style={{ textAlign: 'left', fontWeight: 'bold'}}>
                    Ticket : {ticketNumber}<br />{new Date().toLocaleString()}<br /> {couverts} couverts
                    - Administrateur A
                  <p style={{ textAlign: 'left', fontWeight: 'normal'}}>Prix en €</p>
                  <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '1rem' }}>JUSTIFICATIF</p>
                  </p>
                  <hr />
                  {order.map(item => (
                    <div key={item.id} style={{ marginBottom: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.name} x{item.quantity}</span>
                      <span>{(item.price * item.quantity).toFixed(2)}  €</span>
                      </div>
                    </div>
                  ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '25px', fontWeight: 'bold', fontFamily: '"Arial Narrow", "Roboto Condensed", sans-serif', margin: '1rem 0' }}>
                  <span>Total TTC Dû</span>
                  <span>{total.toFixed(2).replace('.', ',')}</span>
                </div>
                  <hr />
                  <table style={{ width: '100%', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr>
                      <th style={{ width: '25%', textAlign: 'left' }}>Taux</th>
                      <th style={{ width: '25%', textAlign: 'right' }}>HT</th>
                      <th style={{ width: '25%', textAlign: 'right' }}>TVA</th>
                      <th style={{ width: '25%', textAlign: 'right' }}>TTC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const tva10TTC = order.filter(i => parseFloat(i.tva) === 10).reduce((sum, i) => sum + (i.price * i.quantity), 0);
                        const tva20TTC = order.filter(i => parseFloat(i.tva) === 20).reduce((sum, i) => sum + (i.price * i.quantity), 0);

                        const tva10HT = tva10TTC / 1.10;
                        const tva10TVA = tva10TTC - tva10HT;

                        const tva20HT = tva20TTC / 1.20;
                        const tva20TVA = tva20TTC - tva20HT;

                        return (
                          <>
                            <tr>
                              <td style={{ textAlign: 'left' }}>10%</td>
                              <td style={{ textAlign: 'right' }}>{tva10HT.toFixed(2)}</td>
                              <td style={{ textAlign: 'right' }}>{tva10TVA.toFixed(2)}</td>
                              <td style={{ textAlign: 'right' }}>{tva10TTC.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td style={{ textAlign: 'left' }}>20%</td>
                              <td style={{ textAlign: 'right' }}>{tva20HT.toFixed(2)}</td>
                              <td style={{ textAlign: 'right' }}>{tva20TVA.toFixed(2)}</td>
                              <td style={{ textAlign: 'right' }}>{tva20TTC.toFixed(2)}</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                  <hr />
                  <p style={{ textAlign: 'left', marginTop: '1rem' }}>Merci de nous avoir rendu visite chez Sophia, on attend déjà votre retour !</p>
                  <p style={{ textAlign: 'right', fontSize: '10px', marginTop: '1rem' }}>Envoyé le : {new Date().toLocaleDateString()}</p>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button onClick={() => setShowEmailPopup(true)} >📩 Rentrer l'adresse email</button>
                  <button onClick={handlePrintInline} style={{ marginRight: '1rem', marginTop: '1rem' }} disabled>🖨️ Imprimer</button>
                  <button onClick={() => setShowTicketPreview(false)}>Fermer</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDiversPopup && (
  <div className="ticket-popup">
    <div className="ticket-content" style={{ textAlign: 'center' }}>
      <h3>Ajouter un article divers</h3>
      <input
        type="text"
        placeholder="Nom du produit"
        value={diversTitle}
        onChange={(e) => setDiversTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
      />
      <input
        type="number"
        placeholder="Prix (€)"
        value={diversPrice}
        onChange={(e) => setDiversPrice(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <button
        className="button"
        onClick={() => {
          if (!diversTitle || !diversPrice) return alert('Remplis les deux champs');
          addToOrder({
            name: diversTitle,
            price: parseFloat(diversPrice),
            type: 'divers',
            tva: 10,
            color: '#d3d3d3'
          });
          setDiversTitle('');
          setDiversPrice('');
          setShowDiversPopup(false);
        }}
      >
        ➕ Ajouter à la commande
      </button>
      <br />
      <button className="button" onClick={() => setShowDiversPopup(false)} style={{ marginTop: '1rem' }}>
        Annuler
      </button>
    </div>
  </div>
)}

      {showEmailPopup && (
        <div className="ticket-popup">
          <div className="ticket-content" style={{ textAlign: 'center' }}>
            <h3>Entrer l'adresse email du client</h3>
            <input
              type="email"
              value={emailToSend}
              onChange={(e) => setEmailToSend(e.target.value)}
              placeholder="ex : client@email.com"
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
            <button
              className="button"
              onClick={async () => {
                try {
                  await emailjs.send(
                    'service_sophia',
                    'template_l1tzc55',
                    {
                      to_email: emailToSend,
                      ticket_content: ticketRef.current.innerHTML,
                    },
                    'E9IrqJu4dENA8QDPF'
                  );
                  alert(`Ticket envoyé à ${emailToSend}`);
                  setShowEmailPopup(false);
                  setShowTicketPreview(false);
                } catch (error) {
                  console.error('Erreur EmailJS :', error);
                  alert('Erreur lors de l’envoi de l’email.');
                }
              }}
            >📤 Envoyer</button>
            <br />
            <button className="button" onClick={() => setShowEmailPopup(false)} style={{ marginTop: '1rem' }}>Annuler</button>
          </div>
        </div>
      )}

      {showPaymentPopup && (
        <div className="ticket-popup">
            <div className="ticket-content" style={{ textAlign: 'center' }}>
              <h3>Paiement de {selectedTotal.toFixed(2)} €</h3>
              <button className="button" onClick={() => setCashPopup(true)}>💶 Espèces</button>
              <button className="button" style={{ marginLeft: '1rem' }} onClick={() => handlePayment('CB')}>💳 Carte bancaire</button>
            </div>
          </div>
        )}
        
        {cashPopup && (
          <div className="ticket-popup">
            <div className="ticket-content" style={{ textAlign: 'center' }}>
              <h3>Montant à payer : {selectedTotal.toFixed(2)} €</h3>
              <input
                type="number"
                placeholder="Montant reçu"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
              />
              {parseFloat(cashReceived) >= selectedTotal && (
                <p>Rendu : {(parseFloat(cashReceived) - selectedTotal).toFixed(2)} €</p>
              )}
              <button className="button" onClick={() => handlePayment('Espèces', cashReceived)}>Valider le paiement</button>
              <br />
              <button className="button" onClick={() => { setCashPopup(false); setShowPaymentPopup(false); }} style={{ marginTop: '1rem' }}>Annuler</button>
            </div>
          </div>
        )}
            
    </div>
  );
}

export default Caisse;