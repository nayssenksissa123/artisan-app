import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Home() {
  const [recherche, setRecherche] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Trouvez le bon artisan, <span className="text-accent-400">pres de chez vous</span>
          </h1>
          <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
            Plombiers, electriciens, peintres... Des professionnels verifies pour tous vos besoins.
          </p>

          <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Quel service recherchez-vous ?"
              className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none"
            />
            <Link
              to="/categories"
              className="px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold transition text-center"
            >
              Rechercher
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Nos categories de services
            </h2>
            <p className="text-gray-500 text-sm mt-1">Cliquez sur une categorie pour decouvrir les services et artisans</p>
          </div>
          <Link to="/categories" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Voir tout &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {['Plomberie', 'Electricite', 'Peinture', 'Jardinage', 'Menage', 'Bricolage', 'Serrurerie', 'Climatisation'].map((cat) => (
            <Link
              to="/categories"
              key={cat}
              className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 text-center cursor-pointer transition border border-gray-100 hover:border-primary-200 block group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl transition">
                {cat.charAt(0)}
              </div>
              <p className="font-medium text-gray-700 group-hover:text-primary-700 transition">{cat}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vous etes artisan ?
          </h2>
          <p className="text-gray-600 mb-6">
            Rejoignez ProxiPro et developpez votre clientele pres de chez vous.
          </p>
          <Link
            to="/inscription"
            className="inline-block px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition shadow-sm"
          >
            Creer mon compte artisan
          </Link>
        </div>
      </section>
    </div>
  );
}