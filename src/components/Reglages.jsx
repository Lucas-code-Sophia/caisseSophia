import { useState } from 'react';

function Reglages() {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('entrée');
  const [color, setColor] = useState('rose clair');
  const [tva, setTva] = useState(10);

  const [editProductId, setEditProductId] = useState(null); // Stocker juste l'ID
  const [productToEdit, setProductToEdit] = useState(null); // Nouveau : le produit à modifier

  const types = ['entrée', 'plat', 'dessert', 'soft', 'alcool', 'café', 'boisson', 'menu', 'autre'];

  const colors = [
    { name: 'rose clair', value: '#f8d7da' },
    { name: 'vert clair', value: '#d4edda' },
    { name: 'bleu clair', value: '#d1ecf1' },
    { name: 'jaune pâle', value: '#fff3cd' },
    { name: 'orange pâle', value: '#f8d7b5' },
    { name: 'bleu pâle', value: '#cce5ff' },
    { name: 'gris clair', value: '#e2e3e5' },
    { name: 'jaune pastel', value: '#f0e68c' },
    { name: 'bleu pastel', value: '#add8e6' },
    { name: 'rose pastel', value: '#ffb6c1' },
    { name: 'lavande', value: '#e6e6fa' },
    { name: 'rose léger', value: '#ffe4e1' },
  ];

  const resetForm = () => {
    setName('');
    setPrice('');
    setType('entrée');
    setColor('rose clair');
    setTva(10);
    setEditProductId(null);
    setProductToEdit(null); // RESET aussi
  };

  const handleAddOrUpdateProduct = () => {
    if (!name || !price || !type || !color || !tva) {
      alert('Merci de remplir tous les champs.');
      return;
    }

    const selectedColor = colors.find(c => c.name === color)?.value || '#ffffff';

    if (editProductId !== null) {
      const updatedProducts = products.map((prod) =>
        prod.id === editProductId
          ? { ...prod, name, price: parseFloat(price), type, color: selectedColor, tva: parseFloat(tva) }
          : prod
      );
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    } else {
      const newProduct = {
        id: Date.now(),
        name,
        price: parseFloat(price),
        type,
        color: selectedColor,
        tva: parseFloat(tva),
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }

    resetForm();
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter((prod) => prod.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    if (editProductId === id) {
      resetForm();
    }
  };

  const handleClickProduct = (product) => {
    setProductToEdit(product); // ➔ Maintenant on stocke l'objet à éditer
  };

  const handleSaveEdit = () => {
    const selectedColor = colors.find(c => c.name === productToEdit.color)?.value || productToEdit.color;

    const updatedProducts = products.map((prod) =>
      prod.id === productToEdit.id
        ? { ...prod, ...productToEdit, color: selectedColor }
        : prod
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    resetForm();
  };

  const handleChangeEdit = (field, value) => {
    setProductToEdit(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', minHeight: '90vh' }}>
      
      {/* Partie gauche - Formulaire classique */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2>Ajouter un produit</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Nom du produit"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Prix"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              {colors.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="TVA (%)"
              value={tva}
              onChange={(e) => setTva(e.target.value)}
            />

            <button onClick={handleAddOrUpdateProduct}>
              {editProductId !== null ? 'Enregistrer les modifications' : 'Ajouter le produit'}
            </button>

            {editProductId !== null && (
              <button onClick={resetForm} style={{ backgroundColor: 'lightgray', marginTop: '0.5rem' }}>
                Annuler la modification
              </button>
            )}
          </div>
        </div>

        {/* Partie droite - Liste produits */}
        <div style={{ flex: 2 }}>
          <h2>Produits existants</h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleClickProduct(prod)}
                style={{
                  width: '150px',
                  height: '140px',
                  backgroundColor: prod.color,
                  borderRadius: '8px',
                  padding: '0.5rem',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(prod.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: 'red'
                  }}
                >
                  🗑️
                </button>
                <div style={{ fontWeight: 'bold' }}>{prod.name}</div>
                <div>{prod.price}€</div>
                <div style={{ fontSize: '0.8rem' }}>{prod.type}</div>
                <div style={{ fontSize: '0.7rem' }}>TVA : {prod.tva}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulaire édition */}
      {productToEdit && (
        <div style={{ backgroundColor: '#f2f2f2', padding: '1rem', borderRadius: '10px' }}>
          <h2>Modifier le produit</h2>
          <input
            type="text"
            value={productToEdit.name}
            onChange={(e) => handleChangeEdit('name', e.target.value)}
            placeholder="Nom"
          />
          <input
            type="number"
            value={productToEdit.price}
            onChange={(e) => handleChangeEdit('price', e.target.value)}
            placeholder="Prix"
          />
          <input
            type="text"
            value={productToEdit.type}
            onChange={(e) => handleChangeEdit('type', e.target.value)}
            placeholder="Type"
          />
          <input
            type="text"
            value={productToEdit.color}
            onChange={(e) => handleChangeEdit('color', e.target.value)}
            placeholder="Couleur"
          />
          <input
            type="number"
            value={productToEdit.tva}
            onChange={(e) => handleChangeEdit('tva', e.target.value)}
            placeholder="TVA"
          />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleSaveEdit} style={{ marginRight: '1rem' }}>Enregistrer</button>
            <button onClick={() => setProductToEdit(null)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reglages;