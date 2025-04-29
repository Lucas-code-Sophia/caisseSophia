import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Caisse from './components/Caisse';
import Reglages from './components/Reglages';
import Historique from './components/Historique';
import './App.css'; // Nouveau fichier de style

function App() {
  return (
    <Router>
      <div className="navbar">
        <NavLink to="/" className="navlink" end>
          🛒 Caisse
        </NavLink>
        <NavLink to="/reglages" className="navlink">
          ⚙️ Réglages
        </NavLink>
        <NavLink to="/historique" className="navlink">
          🧾 Historique
        </NavLink>
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