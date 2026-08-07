import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/connexion');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-primary-700">
              Proxi<span className="text-accent-500">Pro</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-primary-700 font-medium transition">
              Accueil
            </Link>
            <Link to="/artisans" className="text-gray-600 hover:text-primary-700 font-medium transition">
              Trouver un artisan
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-primary-700 font-medium transition">
              Services
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <>
                <Link
                  to="/profil"
                  className="text-gray-600 hover:text-primary-700 font-medium transition"
                >
                  Mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="text-gray-600 hover:text-primary-700 font-medium transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium transition shadow-sm"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
