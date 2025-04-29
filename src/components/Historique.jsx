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

  const groupByDate = (payments) => {
    const grouped = {}
    payments.forEach(payment => {
        const dateOnly = payment.date.split(',')[0];
        if (!grouped[dateOnly]) {
            grouped[dateOnly] = [];
        }
        grouped[dateOnly].push(payment);
    });

    return grouped;
    };

    const groupedPayments = groupByDate(paymentsHistory);

  const sortedDates = Object.keys(groupedPayments).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);
    return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
  });
        
  return (
    <div className="historique-container">
      <h2>Historique des Transactions</h2>

      {paymentsHistory.length === 0 ? (
        <p>Aucune transaction enregistrée pour le moment.</p>
      ) : (
        <>
          {sortedDates.map((date) => (
            <div key={date} className="historique-day">
              <h3>📅 {date}</h3>
              <ul className="historique-list">
                {groupedPayments[date]
                  .sort((a, b) => b.id - a.id)
                  .map((payment) => (
                    <li key={payment.id} className="historique-item">
                      <div>
                        <strong>{payment.amount.toFixed(2)}€</strong> - {payment.type}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'gray' }}>
                        {payment.date.split(',')[1]}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </>
      )}

      <Link to="/" className="button" style={{ marginTop: '2rem' }}>
        Retour à la Caisse
      </Link>
    </div>
  );
}

export default Historique;