import { useNavigate } from 'react-router-dom';

export default function Profil() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  if (!token) {
    navigate('/connexion');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/connexion');
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Mon profil</h1>
      <p>Tu es bien connecté(e) ! 🎉</p>
      <p style={{ wordBreak: 'break-all', fontSize: 12, color: '#666' }}>
        Token : {token.substring(0, 40)}...
      </p>
      <button onClick={handleLogout} style={{ padding: 10 }}>
        Se déconnecter
      </button>
    </div>
  );
}