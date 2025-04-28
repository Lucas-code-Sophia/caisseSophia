function HeaderMenu({ setPage }) {
    return (
    <header style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem', background: '#eee' }}>
        <button onClick={() => setPage('caisse')}>Caisse</button>
        <button onClick={() => setPage('reglages')}>Réglages</button>
    </header>
    );
}

export default HeaderMenu;  