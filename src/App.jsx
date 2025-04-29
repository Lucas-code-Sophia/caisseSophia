import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Caisse from './components/Caisse';
import Reglages from './components/Reglages';
import Historique from './components/Historique';

function App() {
  return (
    <Router>
      <div style={{ padding: '1rem', background: '#f8f8f8', display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>🛒 Caisse</Link>
        <Link to="/reglages" style={{ textDecoration: 'none' }}>⚙️ Réglages</Link>
        <Link to="/historique" style={{ textDecoration: 'none' }}>🧾 Historique</Link>
      </div>

      <Routes>
        <Route path="/" element={<Caisse />} />
        <Route path="/reglages" element={<Reglages />} />
        <Route path="/historique" element={<Historique />} />
      </Routes>
    </Router>
  );
}

export default App;