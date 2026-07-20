import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    role: 'CLIENT',
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const res = await api.post('/auth/inscription', form);
      localStorage.setItem('token', res.data.access_token);
      navigate('/profil');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Nom</label><br />
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Email</label><br />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Mot de passe</label><br />
          <input
            type="password"
            name="motDePasse"
            value={form.motDePasse}
            onChange={handleChange}
            required
            minLength={6}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Téléphone (optionnel)</label><br />
          <input
            type="tel"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Je suis :</label><br />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="CLIENT">Client</option>
            <option value="ARTISAN">Artisan</option>
          </select>
        </div>

        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

        <button type="submit" disabled={chargement} style={{ width: '100%', padding: 10 }}>
          {chargement ? 'Création en cours...' : "S'inscrire"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Déjà un compte ? <Link to="/connexion">Se connecter</Link>
      </p>
    </div>
  );
}