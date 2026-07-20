import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
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
      const res = await api.post('/auth/connexion', form);
      localStorage.setItem('token', res.data.access_token);
      navigate('/profil');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Se connecter</h1>
      <form onSubmit={handleSubmit}>
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
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {erreur && <p style={{ color: 'red' }}>{erreur}</p>}

        <button type="submit" disabled={chargement} style={{ width: '100%', padding: 10 }}>
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
      </p>
    </div>
  );
}