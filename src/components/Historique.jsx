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
    const grouped = {};
    payments.forEach(payment => {
      const dateOnly = payment.date.split(',')[0];
      if (!grouped[dateOnly]) grouped[dateOnly] = [];
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

  const totalCB = paymentsHistory
    .filter(p => p.type === 'CB')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCash = paymentsHistory
    .filter(p => p.type === 'Espèces')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="historique-container">
      <h2>Historique des Transactions</h2>

      <div className="jours-wrapper">
        {sortedDates.map(date => {
          const payments = groupedPayments[date];
          const totalDayCB = payments.filter(p => p.type === 'CB').reduce((sum, p) => sum + p.amount, 0);
          const totalDayCash = payments.filter(p => p.type === 'Espèces').reduce((sum, p) => sum + p.amount, 0);

          return (
            <div key={date} className="jour-colonne">
              <div className="jour-header">{date}</div>
              <div className="transactions-colonne">
                {payments.map(p => (
                  <div key={p.id} className="transaction-ligne">
                    {p.amount.toFixed(2)} € – {p.type}
                  </div>
                ))}
              </div>
              <div className="recap-jour">
                💳 {totalDayCB.toFixed(2)} €<br />
                💵 {totalDayCash.toFixed(2)} €
              </div>
            </div>
          );
        })}
      </div>

      <div className="total-global-card">
        🧾 <strong>Total général</strong><br />
        💳 CB : {totalCB.toFixed(2)} €<br />
        💵 Espèces : {totalCash.toFixed(2)} €
      </div>

      <Link to="/" className="button" style={{ marginTop: '2rem' }}>
        Retour à la Caisse
      </Link>
    </div>
  );
}

export default Historique;