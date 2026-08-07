import { useState } from 'react';

const artisansDemo = [
  { id: 1, nom: 'Karim Ben Salah', specialite: 'Plombier', ville: 'Tunis', note: 4.8, avis: 32, disponible: true },
  { id: 2, nom: 'Amira Trabelsi', specialite: 'Électricienne', ville: 'Sfax', note: 4.9, avis: 47, disponible: true },
  { id: 3, nom: 'Youssef Gharbi', specialite: 'Peintre', ville: 'Sousse', note: 4.6, avis: 21, disponible: false },
  { id: 4, nom: 'Salma Jendoubi', specialite: 'Jardinière', ville: 'Ariana', note: 4.7, avis: 18, disponible: true },
];

function Etoiles({ note }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= Math.round(note) ? 'text-accent-500' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.538-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.813 9.385c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
        </svg>
      ))}
    </div>
  );
}

function ArtisanCard({ artisan }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {artisan.nom.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{artisan.nom}</h3>
              <p className="text-sm text-gray-500">{artisan.specialite}</p>
            </div>
          </div>
          {artisan.disponible ? (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
              Disponible
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
              Occupé
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Etoiles note={artisan.note} />
          <span className="text-sm text-gray-600">
            {artisan.note} ({artisan.avis} avis)
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {artisan.ville}
        </div>

        <button className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition">
          Voir le profil
        </button>
      </div>
    </div>
  );
}

export default function Artisans() {
  const [ville, setVille] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Trouvez un artisan près de chez vous
          </h1>
          <p className="text-gray-500">{artisansDemo.length} artisans disponibles</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Filtrer par ville..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Toutes les catégories</option>
            <option>Plomberie</option>
            <option>Électricité</option>
            <option>Peinture</option>
            <option>Jardinage</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artisansDemo
            .filter((a) => a.ville.toLowerCase().includes(ville.toLowerCase()))
            .map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
        </div>
      </div>
    </div>
  );
}
