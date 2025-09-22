import { useState } from 'react';
import './Reglages.css';
import produitsParDefaut from './produits_sophia_vfinal.json';

function Reglages() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
  
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Générer des IDs uniques aux produits par défaut
      const produitsInitialises = produitsParDefaut.map(p => ({
        ...p,
        id: Date.now() + Math.random(),
      }));
  
      localStorage.setItem('products', JSON.stringify(produitsInitialises));
      return produitsInitialises;
    }
  });  

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('entrée');
  const [color, setColor] = useState('rose clair');
  const [tva, setTva] = useState(10);

  const [editProductId, setEditProductId] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);

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
    setProductToEdit(null);
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
    setEditProductId(product.id);
    setProductToEdit(product);
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
    <div className="reglages-container">
      <div className="reglages-main" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="formulaire-ajout">
          <h2>Ajouter un produit</h2>

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

        <div className="produits-existants">
          <h2>Produits existants</h2>

          <div className="produits-grille">
            {products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleClickProduct(prod)}
                className="produit-carte"
                style={{ backgroundColor: prod.color }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(prod.id);
                  }}
                  className="produit-supprimer"
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

      {productToEdit && (
        <div className="edition-formulaire">
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