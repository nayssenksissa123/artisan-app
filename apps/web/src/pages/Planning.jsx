import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function Planning() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = token ? decodeToken(token) : null;
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  // Acces reserve aux artisans
  if (!user || user.role !== 'ARTISAN') {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Acces reserve</h2>
          <p className="text-yellow-700">Cette page est reservee aux artisans. Connecte-toi avec un compte artisan pour acceder a ton planning.</p>
        </div>
      </div>
    );
  }

  const charger = async () => {
    setChargement(true);
    setErreur('');
    try {
      const res = await api.get('/demandes/artisan/' + user.sub);
      // Filtrer pour ne garder que ACCEPTEE et EN_COURS
      const filtrees = res.data.filter(function(d) {
        return d.statut === 'ACCEPTEE' || d.statut === 'EN_COURS';
      });
      setDemandes(filtrees);
    } catch (err) {
      setErreur('Impossible de charger le planning.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(function() { charger(); }, []);

  const marquerTerminee = async (id) => {
    try {
      await api.patch('/demandes/' + id + '/statut', { statut: 'TERMINEE', artisanId: user.sub });
      charger();
    } catch (err) {
      setErreur('Erreur lors de la mise a jour du statut.');
    }
  };

  const getStatutBadge = (statut) => {
    if (statut === 'ACCEPTEE') {
      return <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Acceptee</span>;
    }
    if (statut === 'EN_COURS') {
      return <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">En cours</span>;
    }
    return <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{statut}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon planning</h1>
          <p className="text-gray-500 mt-1">Interventions acceptees et en cours</p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {demandes.length} intervention{demandes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {erreur && <p className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-6">{erreur}</p>}

      {chargement ? (
        <p className="text-gray-500 text-center py-10">Chargement...</p>
      ) : demandes.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-lg">Aucune intervention prevue pour le moment.</p>
          <p className="text-gray-400 text-sm mt-1">Les demandes acceptees apparaitront ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {demandes.map(function(d) {
            return (
              <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{d.id}</span>
                    {getStatutBadge(d.statut)}
                  </div>
                  <span className="text-xs text-gray-400">
                    {d.dateCreation ? new Date(d.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </span>
                </div>

                {d.client && d.client.utilisateur && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
                      {d.client.utilisateur.nom ? d.client.utilisateur.nom.charAt(0).toUpperCase() : '?'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{d.client.utilisateur.nom}</p>
                      <p className="text-xs text-gray-500">{d.client.utilisateur.email}</p>
                    </div>
                  </div>
                )}

                {d.serviceArtisan && d.serviceArtisan.service && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Service :</span> {d.serviceArtisan.service.nom}
                    {d.serviceArtisan.prix && (
                      <span className="ml-2 text-primary-600 font-semibold">{d.serviceArtisan.prix} DT</span>
                    )}
                  </p>
                )}

                <p className="text-gray-700 mb-1"><span className="font-medium">Description :</span> {d.description}</p>
                <p className="text-gray-600 text-sm mb-4"><span className="font-medium">Adresse :</span> {d.adresse}</p>

                <button
                  onClick={function() { marquerTerminee(d.id); }}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Marquer terminee
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}