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
        <h2>Historique des Transactions</h2>
    
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead><tr>
        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Type</th>
        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Montant (€)</th>
        <th style={{ border: '1px solid #ccc', padding: '8px' }}>❌</th>
        </tr>
        </thead>
        <tbody>
          {paymentsHistory.map((p) => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.date}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.type}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.amount.toFixed(2)}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                <button onClick={() => deletePayment(p.id)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'red' }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
    
        <div style={{ marginTop: '2rem' }}>
          <strong>Total CB :</strong> {totalCB.toFixed(2)} €<br />
          <strong>Total Espèces :</strong> {totalCash.toFixed(2)} €
        </div>
    
        <button className="button" onClick={exportPaymentsToCSV} style={{ marginTop: '2rem', marginRight: '1rem' }}>
          📤 Exporter en CSV
        </button>
    
        <Link to="/" className="button" style={{ marginTop: '2rem' }}>
          Retour à la Caisse
        </Link>
      </div>
    );    
}

export default Historique;