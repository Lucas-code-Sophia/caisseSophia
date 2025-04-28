import { useState } from 'react';
import HeaderMenu from './components/HeaderMenu';
import Caisse from './components/Caisse';
import Reglages from './components/Reglages';

function App() {
  const [page, setPage] = useState('caisse'); // Par défaut on est sur "Caisse"

  return (
    <>
      <HeaderMenu setPage={setPage} />
      {page === 'caisse' && <Caisse />}
      {page === 'reglages' && <Reglages />}
    </>
  );
}

export default App;