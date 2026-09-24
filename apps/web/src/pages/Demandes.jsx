import { useState, useEffect } from 'react';
import api from '../api/client';

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export default function Demandes() {
  const token = localStorage.getItem('token');
  const user = token ? decodeToken(token) : null;
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [form, setForm] = useState({ description: '', adresse: '', serviceArtisanId: '' });

  const charger = async () => {
    if (!user) return;
    setChargement(true);
    try {
      const url = user.role === 'ARTISAN'
        ? '/demandes/artisan/' + user.sub
        : '/demandes/client/' + user.sub;
      const res = await api.get(url);
      setDemandes(res.data);
    } catch (err) {
      setErreur('Impossible de charger les demandes.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      await api.post('/demandes', {
        description: form.description,
        adresse: form.adresse,
        clientId: user.sub,
        serviceArtisanId: Number(form.serviceArtisanId),
      });
      setForm({ description: '', adresse: '', serviceArtisanId: '' });
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la creation.');
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/demandes/${id}/statut`, { statut, artisanId: user.role === 'ARTISAN' ? user.sub : undefined });
      charger();
    } catch (err) {
      setErreur('Erreur lors de la mise a jour du statut.');
    }
  };

  const annuler = async (id) => {
    try {
      await api.patch(`/demandes/${id}/annuler`);
      charger();
    } catch (err) {
      setErreur("Erreur lors de l'annulation.");
    }
  };

  const getStatutBadge = (statut) => {
    const couleurs = {
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
      ACCEPTEE: 'bg-green-100 text-green-800',
      REFUSEE: 'bg-red-100 text-red-800',
      EN_COURS: 'bg-blue-100 text-blue-800',
      TERMINEE: 'bg-gray-100 text-gray-800',
      ANNULEE: 'bg-gray-200 text-gray-500',
    };
    const labels = {
      EN_ATTENTE: 'En attente',
      ACCEPTEE: 'Acceptee',
      REFUSEE: 'Refusee',
      EN_COURS: 'En cours',
      TERMINEE: 'Terminee',
      ANNULEE: 'Annulee',
    };
    return statut;
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <p className="text-gray-500 text-lg">Connecte-toi pour voir tes demandes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes demandes</h1>

      {user.role === 'CLIENT' && (
        <form onSubmit={handleCreate} className="mb-10 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouvelle demande</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Service Artisan</label>
            <input
              type="number"
              value={form.serviceArtisanId}
              onChange={(e) => setForm({ ...form, serviceArtisanId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
          >
            Envoyer la demande
          </button>
        </form>
      )}

      {erreur && <p className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-6">{erreur}</p>}

      {chargement ? (
        <p className="text-gray-500 text-center py-10">Chargement...</p>
      ) : demandes.length === 0 ? (
        <p className="text-gray-500 text-center py-10">Aucune demande pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {demandes.map((d) => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{d.id}</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    d.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                    d.statut === 'ACCEPTEE' ? 'bg-green-100 text-green-800' :
                    d.statut === 'REFUSEE' ? 'bg-red-100 text-red-800' :
                    d.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                    d.statut === 'TERMINEE' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {d.statut === 'EN_ATTENTE' ? 'En attente' :
                     d.statut === 'ACCEPTEE' ? 'Acceptee' :
                     d.statut === 'REFUSEE' ? 'Refusee' :
                     d.statut === 'EN_COURS' ? 'En cours' :
                     d.statut === 'TERMINEE' ? 'Terminee' :
                     d.statut === 'ANNULEE' ? 'Annulee' : d.statut}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {d.dateCreation ? new Date(d.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
              </div>

              {d.client?.utilisateur && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
                    {d.client.utilisateur.nom?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{d.client.utilisateur.nom}</p>
                    <p className="text-xs text-gray-500">{d.client.utilisateur.email}</p>
                  </div>
                </div>
              )}

              {d.serviceArtisan?.service && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Service :</span> {d.serviceArtisan.service.nom}
                  {d.serviceArtisan.prix && (
                    <span className="ml-2 text-primary-600 font-semibold">{d.serviceArtisan.prix} DT</span>
                  )}
                </p>
              )}

              <p className="text-gray-700 mb-1"><span className="font-medium">Description :</span> {d.description}</p>
              <p className="text-gray-600 text-sm"><span className="font-medium">Adresse :</span> {d.adresse}</p>

              <div className="flex gap-2 mt-4">
                {user.role === 'ARTISAN' && d.statut === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => changerStatut(d.id, 'ACCEPTEE')}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => changerStatut(d.id, 'REFUSEE')}
                      className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                    >
                      Refuser
                    </button>
                  </>
                )}
                {user.role === 'ARTISAN' && d.statut === 'ACCEPTEE' && (
                  <button
                    onClick={() => changerStatut(d.id, 'TERMINEE')}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Marquer terminee
                  </button>
                )}
                {user.role === 'CLIENT' && ['EN_ATTENTE', 'ACCEPTEE'].includes(d.statut) && (
                  <button
                    onClick={() => annuler(d.id)}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}