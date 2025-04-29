import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Historique.css';

function Historique() {
  const [paymentsHistory, setPaymentsHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('paymentsHistory');
    if (saved) {
      setPaymentsHistory(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="historique-container">
      <h2>Historique des Transactions</h2>

      {paymentsHistory.length === 0 ? (
        <p>Aucune transaction enregistrée pour le moment.</p>
      ) : (
        <ul className="historique-list">
          {paymentsHistory
            .sort((a, b) => b.id - a.id) // Plus récents en haut
            .map((payment) => (
              <li key={payment.id} className="historique-item">
                <div>
                  <strong>{payment.amount.toFixed(2)}€</strong> - {payment.type}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'gray' }}>
                  {payment.date}
                </div>
              </li>
          ))}
        </ul>
      )}

      <Link to="/" className="button" style={{ marginTop: '2rem' }}>
        Retour à la Caisse
      </Link>
    </div>
  );
}

export default Historique;