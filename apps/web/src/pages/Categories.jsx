import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import MapPicker from '../components/MapPicker';

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function Categories() {
  const token = localStorage.getItem('token');
  const user = token ? decodeToken(token) : null;
  const isArtisan = user && user.role === 'ARTISAN';

  // ==========================================
  // ETATS ARTISAN
  // ==========================================
  const [tousLesServices, setTousLesServices] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [mesServicesArtisan, setMesServicesArtisan] = useState([]);
  const [serviceSelectionne, setServiceSelectionne] = useState(null);
  const [filtreCategorie, setFiltreCategorie] = useState('ALL');
  const [rechercheService, setRechercheService] = useState('');

  // Formulaire Artisan
  const [formArtisan, setFormArtisan] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    localisation: '',
    prix: '',
  });
  const [chargementAction, setChargementAction] = useState(false);
  const [messageSucces, setMessageSucces] = useState('');
  const [messageErreur, setMessageErreur] = useState('');

  // ==========================================
  // ETATS CLIENT
  // ==========================================
  const [etapeClient, setEtapeClient] = useState(1);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [selectedServiceClient, setSelectedServiceClient] = useState(null);
  const [categoriesClient, setCategoriesClient] = useState([]);
  const [servicesClient, setServicesClient] = useState([]);
  const [servicesArtisansClient, setServicesArtisansClient] = useState([]);
  const [artisansDetails, setArtisansDetails] = useState({});
  const [selectedServiceArtisan, setSelectedServiceArtisan] = useState(null);
  const [formDemande, setFormDemande] = useState({ description: '', adresse: '' });
  const [envoiDemande, setEnvoiDemande] = useState(false);
  const [succesDemande, setSuccesDemande] = useState('');
  const [erreurDemande, setErreurDemande] = useState('');

  // Etat de chargement initial
  const [chargementInitial, setChargementInitial] = useState(true);
  const [erreurInitiale, setErreurInitiale] = useState('');

  useEffect(() => {
    if (isArtisan) {
      chargerEspaceArtisan();
    } else {
      chargerEspaceClient();
    }
  }, [isArtisan]);

  // ==========================================
  // CHARGEMENT DONNEES ARTISAN
  // ==========================================
  const chargerEspaceArtisan = async () => {
    setChargementInitial(true);
    setErreurInitiale('');
    try {
      // 1. Tous les services
      const resServices = await api.get('/services');
      setTousLesServices(resServices.data || []);

      // 2. Toutes les categories
      const resCategories = await api.get('/categories');
      const catMap = {};
      (resCategories.data || []).forEach((c) => {
        catMap[c.id] = c.nom;
      });
      setCategoriesMap(catMap);

      // 3. Mes services deja declares
      let myServices = [];
      try {
        const resMesServices = await api.get(`/services-artisans/artisan/${user.sub}`);
        myServices = resMesServices.data || [];
        setMesServicesArtisan(myServices);
      } catch (e) {
        setMesServicesArtisan([]);
      }

      // 4. Profil pour pre-remplir
      try {
        const resProfil = await api.get('/profil');
        const p = resProfil.data;
        const loc = (p.artisan && (p.artisan.localisation || p.artisan.ville)) ? (p.artisan.localisation || p.artisan.ville) : '';
        
        let nomPart = p.nom || '';
        let prenomPart = '';
        if (p.nom && p.nom.includes(' ')) {
          const parts = p.nom.split(' ');
          prenomPart = parts.slice(1).join(' ');
          nomPart = parts[0];
        }

        setFormArtisan((prev) => ({
          ...prev,
          nom: nomPart,
          prenom: prenomPart,
          telephone: p.telephone || '',
          localisation: loc || 'Tunis, Tunisie',
        }));
      } catch (e) {}

      // Selectionner automatiquement le premier service par defaut si disponible
      if (resServices.data && resServices.data.length > 0) {
        const premier = resServices.data[0];
        setServiceSelectionne(premier);
        const existant = myServices.find((sa) => sa.serviceId === premier.id);
        if (existant) {
          setFormArtisan((prev) => ({ ...prev, prix: existant.prix ? String(existant.prix) : '' }));
        }
      }
    } catch (err) {
      setErreurInitiale('Impossible de charger les services.');
    } finally {
      setChargementInitial(false);
    }
  };

  // Selection d'un service par l'artisan
  const handleChoisirService = (service) => {
    setServiceSelectionne(service);
    setMessageSucces('');
    setMessageErreur('');

    const existant = mesServicesArtisan.find((sa) => sa.serviceId === service.id);
    if (existant) {
      setFormArtisan((prev) => ({
        ...prev,
        prix: existant.prix ? String(existant.prix) : '',
      }));
    } else {
      setFormArtisan((prev) => ({
        ...prev,
        prix: '',
      }));
    }
  };

  // Soumission du formulaire Artisan
  const handleSubmitArtisan = async (e) => {
    e.preventDefault();
    if (!serviceSelectionne) {
      setMessageErreur('Veuillez sélectionner un type de service.');
      return;
    }

    if (!formArtisan.prix || Number(formArtisan.prix) <= 0) {
      setMessageErreur('Veuillez renseigner un prix valide en Dinars supérieur à 0.');
      return;
    }

    setChargementAction(true);
    setMessageSucces('');
    setMessageErreur('');

    try {
      // 1. Mettre a jour le profil (nom complet, telephone, localisation)
      const nomComplet = formArtisan.prenom.trim()
        ? `${formArtisan.nom.trim()} ${formArtisan.prenom.trim()}`
        : formArtisan.nom.trim();

      await api.patch('/profil', {
        nom: nomComplet,
        telephone: formArtisan.telephone,
        localisation: formArtisan.localisation,
      });

      // 2. Associer ou mettre a jour le service
      const existant = mesServicesArtisan.find((sa) => sa.serviceId === serviceSelectionne.id);

      if (existant) {
        // Mise a jour du prix
        await api.patch(`/services-artisans/${existant.id}`, {
          prix: Number(formArtisan.prix),
        });
        setMesServicesArtisan((prev) =>
          prev.map((sa) => (sa.id === existant.id ? { ...sa, prix: Number(formArtisan.prix) } : sa))
        );
        setMessageSucces(`Votre prestation "${serviceSelectionne.nom}" a été mise à jour avec succès à ${formArtisan.prix} DT (Dinars) !`);
      } else {
        // Creation nouvelle association
        const resAjout = await api.post('/services-artisans', {
          serviceId: serviceSelectionne.id,
          artisanId: user.sub,
          prix: Number(formArtisan.prix),
        });
        setMesServicesArtisan((prev) => [...prev, resAjout.data]);
        setMessageSucces(`Félicitations ! Le service "${serviceSelectionne.nom}" est désormais actif sur votre profil à ${formArtisan.prix} DT (Dinars).`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement de votre prestation.";
      setMessageErreur(msg);
    } finally {
      setChargementAction(false);
    }
  };

  // Suppression d'un service par l'artisan
  const handleSupprimerService = async (serviceArtisanId) => {
    if (!window.confirm('Voulez-vous vraiment retirer ce service de vos prestations ?')) return;

    setChargementAction(true);
    try {
      await api.delete(`/services-artisans/${serviceArtisanId}`);
      setMesServicesArtisan((prev) => prev.filter((sa) => sa.id !== serviceArtisanId));
      if (serviceSelectionne && mesServicesArtisan.some((sa) => sa.id === serviceArtisanId && sa.serviceId === serviceSelectionne.id)) {
        setFormArtisan((prev) => ({ ...prev, prix: '' }));
      }
      setMessageSucces('Le service a bien été retiré de votre catalogue.');
    } catch (err) {
      setMessageErreur('Impossible de supprimer ce service.');
    } finally {
      setChargementAction(false);
    }
  };

  // ==========================================
  // LOGIQUE CLIENT
  // ==========================================
  const chargerEspaceClient = async () => {
    setChargementInitial(true);
    setErreurInitiale('');
    try {
      const res = await api.get('/categories');
      setCategoriesClient(res.data || []);
    } catch (err) {
      setErreurInitiale('Impossible de charger les catégories.');
    } finally {
      setChargementInitial(false);
    }
  };

  const handleSelectCategorie = async (categorie) => {
    setSelectedCategorie(categorie);
    setSelectedServiceClient(null);
    setSuccesDemande('');
    setChargementInitial(true);
    setErreurInitiale('');
    try {
      const res = await api.get('/services');
      const filtres = (res.data || []).filter((s) => s.categorieId === categorie.id);
      setServicesClient(filtres);
      setEtapeClient(2);
    } catch (err) {
      setErreurInitiale('Impossible de charger les services.');
    } finally {
      setChargementInitial(false);
    }
  };

  const handleSelectServiceClient = async (service) => {
    setSelectedServiceClient(service);
    setSelectedServiceArtisan(null);
    setSuccesDemande('');
    setChargementInitial(true);
    setErreurInitiale('');
    try {
      const res = await api.get('/services-artisans');
      const filtres = (res.data || []).filter((sa) => sa.serviceId === service.id);
      setServicesArtisansClient(filtres);

      const uniqueArtisanIds = Array.from(new Set(filtres.map((sa) => sa.artisanId)));
      const detailsMap = { ...artisansDetails };

      await Promise.all(
        uniqueArtisanIds.map(async (artisanId) => {
          if (!detailsMap[artisanId]) {
            try {
              const userRes = await api.get(`/users/${artisanId}`);
              detailsMap[artisanId] = userRes.data;
            } catch (e) {
              detailsMap[artisanId] = { id: artisanId, nom: `Artisan #${artisanId}` };
            }
          }
        })
      );

      setArtisansDetails(detailsMap);
      setEtapeClient(3);
    } catch (err) {
      setErreurInitiale('Impossible de charger les artisans pour ce service.');
    } finally {
      setChargementInitial(false);
    }
  };

  const handleSubmitDemandeClient = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'CLIENT') return;

    setEnvoiDemande(true);
    setErreurDemande('');
    try {
      await api.post('/demandes', {
        description: formDemande.description,
        adresse: formDemande.adresse,
        clientId: user.sub,
        serviceArtisanId: selectedServiceArtisan.id,
      });

      setSuccesDemande("Votre demande a bien été envoyée ! Retrouvez-la dans l'onglet Mes demandes.");
      setSelectedServiceArtisan(null);
      setFormDemande({ description: '', adresse: '' });
    } catch (err) {
      setErreurDemande(err.response?.data?.message || "Erreur lors de l'envoi de la demande.");
    } finally {
      setEnvoiDemande(false);
    }
  };

  // Services filtres pour l'artisan
  const servicesFiltresArtisan = tousLesServices.filter((s) => {
    const matchCat = filtreCategorie === 'ALL' || String(s.categorieId) === String(filtreCategorie);
    const query = rechercheService.toLowerCase().trim();
    const matchQuery =
      !query ||
      (s.nom && s.nom.toLowerCase().includes(query)) ||
      (categoriesMap[s.categorieId] && categoriesMap[s.categorieId].toLowerCase().includes(query));
    return matchCat && matchQuery;
  });

  const categoriesUniques = Object.keys(categoriesMap).map((id) => ({
    id,
    nom: categoriesMap[id],
  }));

  // ==========================================
  // RENDU
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* ------------------------------------------------ */}
      {/* HERO BANNER                                      */}
      {/* ------------------------------------------------ */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isArtisan ? (
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 border border-accent-400/30 text-xs font-bold uppercase tracking-wider mb-3">
                Espace Artisan Professionnel
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
                Mes Services & <span className="text-accent-400">Tarifs en Dinars (DT)</span>
              </h1>
              <p className="text-primary-100 max-w-2xl mx-auto text-sm sm:text-base">
                Sélectionnez le type de service, définissez votre localisation sur la carte et indiquez votre tarif en Dinars.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
                Services & <span className="text-accent-400">Artisans Qualifiés</span>
              </h1>
              <p className="text-primary-100 max-w-2xl mx-auto text-sm sm:text-base">
                Trouvez les meilleurs artisans en Tunisie pour tous vos besoins du quotidien au meilleur prix en Dinars.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* CONTENU                                          */}
      {/* ------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {erreurInitiale && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {erreurInitiale}
          </div>
        )}

        {chargementInitial ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-medium">Chargement des données...</p>
          </div>
        ) : isArtisan ? (
          /* ======================================================== */
          /* VUE ARTISAN : CHOIX DU SERVICE + FORMULAIRE AVEC MAP     */
          /* ======================================================== */
          <div className="space-y-8">
            {/* Messages de retour */}
            {messageSucces && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">✓</span>
                  <p className="font-semibold text-sm sm:text-base">{messageSucces}</p>
                </div>
                <Link
                  to="/planning"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl transition whitespace-nowrap ml-4"
                >
                  Voir mon planning
                </Link>
              </div>
            )}

            {messageErreur && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 shadow-sm">
                <span className="text-xl">⚠️</span>
                <p className="font-medium text-sm">{messageErreur}</p>
              </div>
            )}

            {/* GRILLE 2 COLONNES : CHOIX DU SERVICE (GAUCHE) & FORMULAIRE + MAP (DROITE) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ------------------------------------------------ */}
              {/* COLONNE GAUCHE (5 col) : LISTE DES SERVICES      */}
              {/* ------------------------------------------------ */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">1. Choisissez un service</h2>
                    <p className="text-xs text-gray-500">Cliquez sur un service pour configurer votre offre</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg">
                    {tousLesServices.length} types
                  </span>
                </div>

                {/* Filtres par categorie */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setFiltreCategorie('ALL')}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                      filtreCategorie === 'ALL'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Tous
                  </button>
                  {categoriesUniques.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFiltreCategorie(c.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                        String(filtreCategorie) === String(c.id)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {c.nom}
                    </button>
                  ))}
                </div>

                {/* Recherche de service */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={rechercheService}
                    onChange={(e) => setRechercheService(e.target.value)}
                    placeholder="Filtrer un service..."
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Liste des services cliquables */}
                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                  {servicesFiltresArtisan.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">Aucun service trouvé.</p>
                  ) : (
                    servicesFiltresArtisan.map((service) => {
                      const estSelectionne = serviceSelectionne && serviceSelectionne.id === service.id;
                      const association = mesServicesArtisan.find((sa) => sa.serviceId === service.id);
                      const estPropose = !!association;
                      const nomCat = categoriesMap[service.categorieId] || 'Service';

                      return (
                        <div
                          key={service.id}
                          onClick={() => handleChoisirService(service)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition text-left flex items-center justify-between ${
                            estSelectionne
                              ? 'border-primary-600 bg-primary-50/70 shadow-sm ring-2 ring-primary-500/20'
                              : estPropose
                              ? 'border-green-200 bg-green-50/30 hover:border-green-300'
                              : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 pr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                {nomCat}
                              </span>
                              {estPropose && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800">
                                  ✓ Actif ({association.prix} DT)
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900">{service.nom}</h4>
                            {service.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{service.description}</p>
                            )}
                          </div>
                          <div className="text-gray-400 font-bold text-lg">
                            {estSelectionne ? '👉' : '›'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ------------------------------------------------ */}
              {/* COLONNE DROITE (7 col) : FORMULAIRE + CARTE      */}
              {/* ------------------------------------------------ */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
                    2. Détails de votre offre
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {serviceSelectionne ? serviceSelectionne.nom : 'Sélectionnez un service'}
                  </h2>
                  {serviceSelectionne && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-100 text-primary-800">
                        Catégorie : {categoriesMap[serviceSelectionne.categorieId] || 'Général'}
                      </span>
                      {mesServicesArtisan.some((sa) => sa.serviceId === serviceSelectionne.id) ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-800">
                          Ce service est déjà actif sur votre profil
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                          Nouveau service à ajouter
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitArtisan} className="space-y-5">
                  {/* Ligne Nom & Prenom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Nom de famille *
                      </label>
                      <input
                        type="text"
                        value={formArtisan.nom}
                        onChange={(e) => setFormArtisan({ ...formArtisan, nom: e.target.value })}
                        required
                        placeholder="Ex: Ben Salah"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formArtisan.prenom}
                        onChange={(e) => setFormArtisan({ ...formArtisan, prenom: e.target.value })}
                        required
                        placeholder="Ex: Karim"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50"
                      />
                    </div>
                  </div>

                  {/* Telephone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formArtisan.telephone}
                      onChange={(e) => setFormArtisan({ ...formArtisan, telephone: e.target.value })}
                      required
                      placeholder="Ex: 98 123 456 / 21 000 111"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Numéro joignable pour les interventions clients.</p>
                  </div>

                  {/* CARTE INTERACTIVE DE LOCALISATION */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Localisation & Zone d'intervention (Carte interactive) *
                    </label>
                    <MapPicker
                      value={formArtisan.localisation}
                      onChange={(lieu) => setFormArtisan((prev) => ({ ...prev, localisation: lieu }))}
                    />
                  </div>

                  {/* Prix en Dinars */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Tarif d'intervention (Prix en Dinars / DT) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formArtisan.prix}
                        onChange={(e) => setFormArtisan({ ...formArtisan, prix: e.target.value })}
                        required
                        placeholder="Ex: 50"
                        className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-bold text-primary-700"
                      />
                      <span className="absolute right-4 top-3.5 text-gray-700 font-extrabold text-sm">
                        DT
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Tarif de base ou forfait pour cette prestation en Dinars Tunisiens (DT).</p>
                  </div>

                  {/* Boutons de soumission */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={chargementAction || !serviceSelectionne}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {chargementAction ? (
                        <span>Enregistrement en cours...</span>
                      ) : mesServicesArtisan.some((sa) => serviceSelectionne && sa.serviceId === serviceSelectionne.id) ? (
                        <span>✓ Mettre à jour mon tarif ({formArtisan.prix || '0'} DT)</span>
                      ) : (
                        <span>+ Enregistrer & Proposer ce service</span>
                      )}
                    </button>

                    {serviceSelectionne && mesServicesArtisan.some((sa) => sa.serviceId === serviceSelectionne.id) && (
                      <button
                        type="button"
                        onClick={() => {
                          const assoc = mesServicesArtisan.find((sa) => sa.serviceId === serviceSelectionne.id);
                          if (assoc) handleSupprimerService(assoc.id);
                        }}
                        disabled={chargementAction}
                        className="py-3.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition"
                      >
                        Retirer ce service
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* ------------------------------------------------ */}
            {/* MES SERVICES ACTIFS (TABLEAU / RECAPITULATIF)    */}
            {/* ------------------------------------------------ */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mes Prestations Actives</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Prestations visibles sur votre profil avec leur tarif en Dinars (DT)
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 font-bold text-xs rounded-full">
                  {mesServicesArtisan.length} actif{mesServicesArtisan.length !== 1 ? 's' : ''}
                </span>
              </div>

              {mesServicesArtisan.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-base font-medium">Vous n'avez pas encore configuré de prestation.</p>
                  <p className="text-xs mt-1">Sélectionnez un service dans la liste ci-dessus et enregistrez votre tarif.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mesServicesArtisan.map((sa) => {
                    const infoService = tousLesServices.find((s) => s.id === sa.serviceId);
                    const nomService = infoService ? infoService.nom : `Service #${sa.serviceId}`;
                    const nomCat = infoService ? categoriesMap[infoService.categorieId] || 'Service' : 'Service';

                    return (
                      <div
                        key={sa.id}
                        className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-primary-300 transition flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                            {nomCat}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 mt-1">{nomService}</h4>
                          <p className="text-base font-extrabold text-primary-700 mt-1">
                            {sa.prix} <span className="text-xs font-normal text-gray-500">DT</span>
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (infoService) handleChoisirService(infoService);
                            }}
                            className="px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-lg text-primary-700 hover:bg-primary-50 font-medium transition"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSupprimerService(sa.id)}
                            className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VUE CLIENT : PARCOURS 3 ETAPES                           */
          /* ======================================================== */
          <div>
            {succesDemande && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">&#10003;</span>
                  <p className="font-medium">{succesDemande}</p>
                </div>
                <Link
                  to="/demandes"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  Voir mes demandes
                </Link>
              </div>
            )}

            {etapeClient === 1 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Nos catégories de services</h2>
                  <p className="text-gray-500 mt-1">Choisissez une catégorie pour découvrir les services disponibles</p>
                </div>

                {categoriesClient.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">Aucune catégorie disponible pour le moment.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categoriesClient.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCategorie(cat)}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-md p-6 text-center cursor-pointer transition border border-gray-100 hover:border-primary-300 group"
                      >
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl transition">
                          {cat.nom.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-primary-700 transition">
                          {cat.nom}
                        </h3>
                        <span className="text-xs text-primary-600 font-medium mt-3 inline-block group-hover:underline">
                          Voir les services &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {etapeClient === 2 && selectedCategorie && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <button
                      onClick={() => setEtapeClient(1)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 mb-2 transition"
                    >
                      &larr; Retour aux catégories
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Services en {selectedCategorie.nom}
                    </h2>
                    <p className="text-gray-500">Sélectionnez un service pour trouver un professionnel</p>
                  </div>
                  <span className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-full font-medium self-start sm:self-auto">
                    {servicesClient.length} prestation{servicesClient.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {servicesClient.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500 text-lg">Aucun service trouvé dans cette catégorie.</p>
                    <button
                      onClick={() => setEtapeClient(1)}
                      className="mt-4 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition"
                    >
                      Choisir une autre catégorie
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicesClient.map((s) => (
                      <div
                        key={s.id}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 flex flex-col justify-between transition hover:border-primary-300"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 font-bold flex items-center justify-center mb-4">
                            ⚙️
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{s.nom}</h3>
                          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            {s.description || 'Prestation professionnelle garantie par nos artisans partenaires qualifiés.'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectServiceClient(s)}
                          className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition shadow-sm flex items-center justify-center gap-2"
                        >
                          <span>Voir les artisans</span>
                          <span>&rarr;</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {etapeClient === 3 && selectedServiceClient && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <button
                      onClick={() => { setEtapeClient(2); setSelectedServiceArtisan(null); }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 mb-2 transition"
                    >
                      &larr; Retour aux services de {selectedCategorie ? selectedCategorie.nom : ''}
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Artisans proposant : {selectedServiceClient.nom}
                    </h2>
                    <p className="text-gray-500">Consultez les tarifs et réservez une intervention</p>
                  </div>
                  <span className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-full font-medium self-start sm:self-auto">
                    {servicesArtisansClient.length} artisan{servicesArtisansClient.length !== 1 ? 's' : ''} disponible{servicesArtisansClient.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {servicesArtisansClient.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500 text-lg">Aucun artisan ne propose ce service pour l'instant.</p>
                    <button
                      onClick={() => setEtapeClient(2)}
                      className="mt-4 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition"
                    >
                      Choisir un autre service
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicesArtisansClient.map((sa) => {
                      const artisanInfo = artisansDetails[sa.artisanId];
                      const artisanNom = artisanInfo ? artisanInfo.nom : `Artisan #${sa.artisanId}`;

                      return (
                        <div
                          key={sa.id}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-6 flex flex-col justify-between transition"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                {artisanNom.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{artisanNom}</h3>
                                <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                  Vérifié
                                </span>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3 mb-6">
                              <p className="text-xs text-gray-500 font-medium">Tarif annoncé pour ce service :</p>
                              <p className="text-2xl font-extrabold text-primary-700 mt-1">
                                {sa.prix} <span className="text-sm font-normal text-gray-600">DT</span>
                              </p>
                            </div>
                          </div>

                          <div>
                            {user && user.role === 'CLIENT' ? (
                              <button
                                onClick={() => {
                                  setSelectedServiceArtisan(sa);
                                  setErreurDemande('');
                                }}
                                className="w-full py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm transition shadow-sm"
                              >
                                Demander ce service
                              </button>
                            ) : (
                              <div className="text-center p-2 rounded-xl bg-gray-50 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">
                                  {!token
                                    ? 'Connectez-vous pour demander ce service.'
                                    : 'Réservé aux comptes clients.'}
                                </p>
                                {!token && (
                                  <Link
                                    to="/connexion"
                                    className="text-xs font-semibold text-primary-600 hover:underline"
                                  >
                                    Se connecter &rarr;
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL CLIENT : DEMANDE D'INTERVENTION                    */}
      {/* ======================================================== */}
      {selectedServiceArtisan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Demande d'intervention</h3>
              <button
                onClick={() => setSelectedServiceArtisan(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="bg-primary-50 rounded-xl p-3 mb-5 text-sm text-primary-800">
              <p><span className="font-semibold">Service :</span> {selectedServiceClient ? selectedServiceClient.nom : ''}</p>
              <p><span className="font-semibold">Artisan :</span> {artisansDetails[selectedServiceArtisan.artisanId] ? artisansDetails[selectedServiceArtisan.artisanId].nom : 'Artisan'}</p>
              <p><span className="font-semibold">Prix estimé :</span> {selectedServiceArtisan.prix} DT</p>
            </div>

            {erreurDemande && (
              <p className="text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg text-sm mb-4">
                {erreurDemande}
              </p>
            )}

            <form onSubmit={handleSubmitDemandeClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description de votre besoin *
                </label>
                <textarea
                  value={formDemande.description}
                  onChange={(e) => setFormDemande({ ...formDemande, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Précisez votre problème, les contraintes d'horaires..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de l'intervention *
                </label>
                <input
                  type="text"
                  value={formDemande.adresse}
                  onChange={(e) => setFormDemande({ ...formDemande, adresse: e.target.value })}
                  required
                  placeholder="Ex: 12 Rue de la Liberté, Tunis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedServiceArtisan(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoiDemande}
                  className="flex-1 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  {envoiDemande ? 'Envoi en cours...' : 'Confirmer la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}