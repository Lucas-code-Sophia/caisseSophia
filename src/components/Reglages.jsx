import { useState } from "react";

function Reglages() {
    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('products');
        return savedProducts ? JSON.parse(savedProducts) : [];
      });

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('entrée');
  const [color, setColor] = useState('rose clair'); // couleur par défaut (nom)

  const types = ['entrée', 'plat', 'dessert', 'soft', 'alcool', 'café', 'boisson', 'menu', 'autre'];

  // Liste des couleurs avec noms
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

  const handleAddProduct = () => {
    if (!name || !price || !type || !color) {
      alert('Merci de remplir tous les champs.');
      return;
    }

    // Trouver la valeur hexadécimale correspondante
    const selectedColor = colors.find(c => c.name === color)?.value || '#ffffff';

    const newProduct = {
      id: Date.now(),
      name,
      price: parseFloat(price),
      type,
      color: selectedColor,
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    // Réinitialiser le formulaire
    setName('');
    setPrice('');
    setType('entrée');
    setColor('rose clair');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Réglages - Ajouter un produit</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '300px' }}>
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

        {/* Menu déroulant pour Type */}
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Menu déroulant pour Couleur */}
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          {colors.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <button onClick={handleAddProduct}>Ajouter le produit</button>
      </div>

      <hr />

      <h3>Produits ajoutés :</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map((prod) => (
          <li key={prod.id} style={{ backgroundColor: prod.color, padding: '0.5rem', margin: '0.25rem 0' }}>
            {prod.name} - {prod.price}€ ({prod.type})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reglages;