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
      const dateOnly = payment.date.split(' ')[0]; // Utiliser uniquement la date
      if (!grouped[dateOnly]) grouped[dateOnly] = [];
      grouped[dateOnly].push(payment);
    });
    return grouped;
  };

  const deletePayment = (id) => {
    const updated = paymentsHistory.filter(p => p.id !== id);
    setPaymentsHistory(updated);
    localStorage.setItem('paymentsHistory', JSON.stringify(updated));
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

    const exportPaymentsToCSV = () => {
      const headers = ['Date', 'Type', 'Montant (€)'];
      const rows = paymentsHistory.map(p => [p.date, p.type, p.amount.toFixed(2)]);
    
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');
    
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
    
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historique-paiements-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };    

    return (
      <div className="historique-container">
        <h2 className="title">Historique des Transactions</h2>
        {sortedDates.map(date => (
          <div key={date} className="section">
            <h3 className="subtitle">{date}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h4 className="subtitle">Espèces</h4>
                {groupedPayments[date].filter(p => p.type === 'Espèces').map((p, index) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
                    <span>{p.amount ? p.amount.toFixed(2) : '0.00'} €</span>
                    <button onClick={() => deletePayment(p.id)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'red' }}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="subtitle">Carte</h4>
                {groupedPayments[date].filter(p => p.type === 'CB').map((p, index) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
                    <span>{p.amount ? p.amount.toFixed(2) : '0.00'} €</span>
                    <button onClick={() => deletePayment(p.id)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'red' }}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
    
        <div style={{ marginTop: '2rem' }}>
          <strong>Total CB :</strong> {totalCB.toFixed(2)} €<br />
          <strong>Total Espèces :</strong> {totalCash.toFixed(2)} €
        </div>
    
        <button className="button" onClick={exportPaymentsToCSV} style={{ marginTop: '2rem', marginRight: '1rem' }}>
          4e4 Exporter en CSV
        </button>
    
        <Link to="/" className="button" style={{ marginTop: '2rem' }}>
          Retour à la Caisse
        </Link>
      </div>
    );    
}

export default Historique;