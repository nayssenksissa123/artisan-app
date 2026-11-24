import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import MapPicker from '../components/MapPicker';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  LogOut,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Briefcase,
  MessageSquare,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function Profil() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = token ? decodeToken(token) : null;
  const isArtisan = user && user.role === 'ARTISAN';

  // ==========================================
  // ÉTATS GLOBAUX DU PROFIL
  // ==========================================
  const [chargementInitial, setChargementInitial] = useState(true);
  const [erreurInitiale, setErreurInitiale] = useState('');
  const [profil, setProfil] = useState(null);

  // Formulaire "Mes informations"
  const [formProfil, setFormProfil] = useState({
    nom: '',
    telephone: '',
    localisation: '',
  });
  const [sauvegardeProfilEnCours, setSauvegardeProfilEnCours] = useState(false);
  const [succesProfil, setSuccesProfil] = useState('');
  const [erreurProfil, setErreurProfil] = useState('');

  // ==========================================
  // ÉTATS ARTISAN : SERVICES ET TARIFS
  // ==========================================
  const [mesServicesArtisan, setMesServicesArtisan] = useState([]);
  const [tousLesServicesMap, setTousLesServicesMap] = useState({});
  const [prixEnCours, setPrixEnCours] = useState({});
  const [serviceActionId, setServiceActionId] = useState(null);
  const [succesService, setSuccesService] = useState('');
  const [erreurService, setErreurService] = useState('');

  // ==========================================
  // ÉTATS ARTISAN : AVIS
  // ==========================================
  const [mesAvis, setMesAvis] = useState([]);

  // Redirection si pas connecté
  useEffect(() => {
    if (!token || !user) {
      navigate('/connexion');
    }
  }, [token, user, navigate]);

  // Chargement de l'ensemble des données
  const chargerDonnees = async () => {
    if (!user) return;
    setChargementInitial(true);
    setErreurInitiale('');

    try {
      // 1. Profil utilisateur
      const resProfil = await api.get('/profil');
      const dataProfil = resProfil.data;
      setProfil(dataProfil);

      const locArtisan =
        dataProfil.artisan?.localisation || dataProfil.artisan?.ville || '';

      setFormProfil({
        nom: dataProfil.nom || '',
        telephone: dataProfil.telephone || '',
        localisation: locArtisan,
      });

      // 2. Si artisan : charger les services et les avis
      if (user.role === 'ARTISAN') {
        const artisanId = user.sub;

        // Requêtes en parallèle : services de l'artisan, catalogue complet, et avis
        const [resServicesArtisan, resTousServices, resAvis] = await Promise.all([
          api.get(`/services-artisans/artisan/${artisanId}`).catch(() => ({ data: [] })),
          api.get('/services').catch(() => ({ data: [] })),
          api.get(`/avis/artisan/${artisanId}`).catch(() => ({ data: [] })),
        ]);

        // Dictionnaire { serviceId: service } pour accès instantané
        const mapServices = {};
        (resTousServices.data || []).forEach((s) => {
          mapServices[s.id] = s;
        });
        setTousLesServicesMap(mapServices);

        // Liste des services de l'artisan et initialisation des prix d'édition
        const servicesList = resServicesArtisan.data || [];
        setMesServicesArtisan(servicesList);

        const initialPrix = {};
        servicesList.forEach((sa) => {
          initialPrix[sa.id] = sa.prix ?? '';
        });
        setPrixEnCours(initialPrix);

        // Avis reçus
        setMesAvis(resAvis.data || []);
      }
    } catch (err) {
      setErreurInitiale(
        err.response?.data?.message || 'Impossible de charger les données du profil.'
      );
    } finally {
      setChargementInitial(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      chargerDonnees();
    }
  }, []);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/connexion');
  };

  // Enregistrement des informations personnelles
  const handleSubmitProfil = async (e) => {
    e.preventDefault();
    setSuccesProfil('');
    setErreurProfil('');
    setSauvegardeProfilEnCours(true);

    try {
      const payload = {
        nom: formProfil.nom.trim(),
        telephone: formProfil.telephone.trim(),
      };

      if (isArtisan) {
        payload.localisation = formProfil.localisation;
      }

      const res = await api.patch('/profil', payload);
      setProfil(res.data);
      setSuccesProfil('Vos informations ont été mises à jour avec succès !');

      // Effacer le message après 4 secondes
      setTimeout(() => setSuccesProfil(''), 4000);
    } catch (err) {
      setErreurProfil(
        err.response?.data?.message || 'Erreur lors de la mise à jour de vos informations.'
      );
    } finally {
      setSauvegardeProfilEnCours(false);
    }
  };

  // Mise à jour du prix d'un service (Artisan)
  const handleUpdatePrixService = async (serviceArtisanId) => {
    const nouveauPrix = Number(prixEnCours[serviceArtisanId]);
    if (isNaN(nouveauPrix) || nouveauPrix <= 0) {
      setErreurService('Veuillez saisir un tarif valide supérieur à 0 DT.');
      return;
    }

    setServiceActionId(serviceArtisanId);
    setSuccesService('');
    setErreurService('');

    try {
      await api.patch(`/services-artisans/${serviceArtisanId}`, {
        prix: nouveauPrix,
      });

      setMesServicesArtisan((prev) =>
        prev.map((sa) => (sa.id === serviceArtisanId ? { ...sa, prix: nouveauPrix } : sa))
      );

      setSuccesService('Tarif enregistré avec succès !');
      setTimeout(() => setSuccesService(''), 3500);
    } catch (err) {
      setErreurService(
        err.response?.data?.message || 'Erreur lors de la modification du tarif.'
      );
    } finally {
      setServiceActionId(null);
    }
  };

  // Suppression d'un service (Artisan)
  const handleSupprimerService = async (serviceArtisanId, nomService) => {
    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir retirer le service "${nomService}" de vos prestations ?`
    );
    if (!confirmation) return;

    setServiceActionId(serviceArtisanId);
    setSuccesService('');
    setErreurService('');

    try {
      await api.delete(`/services-artisans/${serviceArtisanId}`);

      setMesServicesArtisan((prev) =>
        prev.filter((sa) => sa.id !== serviceArtisanId)
      );

      setSuccesService(`Le service "${nomService}" a été retiré.`);
      setTimeout(() => setSuccesService(''), 3500);
    } catch (err) {
      setErreurService(
        err.response?.data?.message || 'Impossible de retirer ce service.'
      );
    } finally {
      setServiceActionId(null);
    }
  };

  // Calcul de la note moyenne des avis
  const noteMoyenne =
    mesAvis.length > 0
      ? (
          mesAvis.reduce((acc, a) => acc + Number(a.note || 0), 0) / mesAvis.length
        ).toFixed(1)
      : null;

  // Affichage visuel des étoiles
  const renderEtoiles = (note, max = 5) => {
    const arrondi = Math.round(Number(note));
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((val) => (
          <Star
            key={val}
            className={`w-4 h-4 ${
              val <= arrondi
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!token || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50/60 pb-20 font-sans">
      {/* ------------------------------------------------ */}
      {/* HEADER BANNER                                    */}
      {/* ------------------------------------------------ */}
      <section className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-900 text-white py-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-extrabold text-white shadow-inner">
                {profil?.nom ? profil.nom.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {profil?.nom || 'Mon Profil'}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      isArtisan
                        ? 'bg-amber-400 text-amber-950 shadow-sm'
                        : 'bg-primary-100 text-primary-800'
                    }`}
                  >
                    {isArtisan ? <ShieldCheck className="w-3.5 h-3.5" /> : null}
                    {isArtisan ? 'Artisan Pro' : 'Client Particulier'}
                  </span>
                </div>
                <p className="text-primary-100 text-sm mt-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 opacity-80" />
                  {profil?.email || user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition backdrop-blur-sm shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* CONTENU PRINCIPAL                                */}
      {/* ------------------------------------------------ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {erreurInitiale && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-sm font-medium">{erreurInitiale}</div>
            <button
              onClick={chargerDonnees}
              className="text-xs bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
            >
              Réessayer
            </button>
          </div>
        )}

        {chargementInitial ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-medium">Chargement de votre profil...</p>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* SECTION 1 : MES INFORMATIONS PERSONNELLES (POUR TOUS)     */}
            {/* ======================================================== */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Mes informations</h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Gérez vos coordonnées et vos données de contact
                    </p>
                  </div>
                </div>
              </div>

              {succesProfil && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 shadow-sm animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-semibold">{succesProfil}</p>
                </div>
              )}

              {erreurProfil && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm font-medium">{erreurProfil}</p>
                </div>
              )}

              <form onSubmit={handleSubmitProfil} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formProfil.nom}
                        onChange={(e) =>
                          setFormProfil({ ...formProfil, nom: e.target.value })
                        }
                        placeholder="Ex: Mohamed Ben Salah"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium bg-gray-50/50 hover:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Numéro de téléphone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={formProfil.telephone}
                        onChange={(e) =>
                          setFormProfil({ ...formProfil, telephone: e.target.value })
                        }
                        placeholder="Ex: 98 123 456 / 21 000 111"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium bg-gray-50/50 hover:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Email (Lecture seule) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Adresse email <span className="text-gray-400 font-normal">(Non modifiable)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={profil?.email || user.email}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 cursor-not-allowed select-none"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    L'adresse email sert d'identifiant de connexion unique et ne peut pas être changée directement.
                  </p>
                </div>

                {/* Si ARTISAN : Champ Localisation avec MapPicker */}
                {isArtisan && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Localisation & Zone d'intervention *
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Positionnez votre zone de travail sur la carte ci-dessous pour que les clients de votre secteur puissent vous trouver facilement.
                    </p>
                    <MapPicker
                      value={formProfil.localisation}
                      onChange={(nouvelleLoc) =>
                        setFormProfil((prev) => ({ ...prev, localisation: nouvelleLoc }))
                      }
                    />
                  </div>
                )}

                {/* Bouton d'enregistrement et déconnexion */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={sauvegardeProfilEnCours}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {sauvegardeProfilEnCours
                      ? 'Enregistrement...'
                      : 'Enregistrer les modifications'}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 text-xs font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Se déconnecter de la session
                  </button>
                </div>
              </form>
            </div>

            {/* ======================================================== */}
            {/* SECTIONS SPÉCIFIQUES POUR L'ARTISAN                      */}
            {/* ======================================================== */}
            {isArtisan && (
              <>
                {/* ---------------------------------------------------- */}
                {/* SECTION 2 : MES SERVICES ET TARIFS                  */}
                {/* ---------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-600 flex items-center justify-center font-bold">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-900">
                            Mes services et tarifs
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700">
                            {mesServicesArtisan.length}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Ajustez directement vos prix en Dinars (DT) ou gérez votre catalogue
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold transition self-start sm:self-auto"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Ajouter un service
                    </Link>
                  </div>

                  {succesService && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3 shadow-sm animate-fadeIn">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm font-semibold">{succesService}</p>
                    </div>
                  )}

                  {erreurService && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm font-medium">{erreurService}</p>
                    </div>
                  )}

                  {mesServicesArtisan.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Briefcase className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-gray-800 mb-1">
                        Vous ne proposez aucun service pour le moment
                      </h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                        Découvrez notre catalogue pour ajouter vos compétences professionnelles et fixer vos tarifs en Dinars (DT).
                      </p>
                      <Link
                        to="/categories"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        Consulter les catégories de services
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {mesServicesArtisan.map((sa) => {
                        const serviceInfo = tousLesServicesMap[sa.serviceId];
                        const nomService = serviceInfo?.nom || `Prestation #${sa.serviceId}`;
                        const descriptionService = serviceInfo?.description;
                        const isSaving = serviceActionId === sa.id;

                        return (
                          <div
                            key={sa.id}
                            className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex-1 pr-2">
                              <h4 className="text-base font-bold text-gray-900">
                                {nomService}
                              </h4>
                              {descriptionService && (
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                  {descriptionService}
                                </p>
                              )}
                              <span className="inline-block mt-1 text-[11px] font-semibold text-gray-400">
                                Réf. prestation : #{sa.id}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              {/* Édition du prix */}
                              <div className="relative flex items-center">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={prixEnCours[sa.id] ?? ''}
                                  onChange={(e) =>
                                    setPrixEnCours({
                                      ...prixEnCours,
                                      [sa.id]: e.target.value,
                                    })
                                  }
                                  className="w-28 pl-3 pr-10 py-2 border border-gray-200 rounded-xl text-sm font-bold text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                  placeholder="Prix"
                                />
                                <span className="absolute right-3 text-xs font-bold text-gray-400 pointer-events-none">
                                  DT
                                </span>
                              </div>

                              {/* Bouton Enregistrer le prix */}
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleUpdatePrixService(sa.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {isSaving ? '...' : 'Enregistrer'}
                              </button>

                              {/* Bouton Retirer */}
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() =>
                                  handleSupprimerService(sa.id, nomService)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Retirer
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 3 : MES AVIS                                */}
                {/* ---------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-900">Mes avis</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800">
                            {mesAvis.length} avis
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Consultez vos retours clients et votre note globale
                        </p>
                      </div>
                    </div>

                    {/* Bloc résumé de la note moyenne */}
                    {mesAvis.length > 0 && (
                      <div className="flex items-center gap-3 bg-amber-50/60 border border-amber-200/60 px-4 py-2 rounded-2xl">
                        <div className="text-2xl font-black text-amber-900">
                          {noteMoyenne}
                        </div>
                        <div>
                          {renderEtoiles(noteMoyenne)}
                          <p className="text-[11px] font-semibold text-amber-800 mt-0.5">
                            {mesAvis.length} avis client{mesAvis.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {mesAvis.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 mb-1">
                        Aucun avis pour le moment
                      </h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        Les avis de vos clients apparaîtront ici après la réalisation de vos premières interventions.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mesAvis
                        .slice()
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((avisItem) => {
                          const nomClient =
                            avisItem.client?.utilisateur?.nom ||
                            `Client #${avisItem.clientId}`;
                          const dateFormatee = avisItem.date
                            ? new Date(avisItem.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : '';

                          return (
                            <div
                              key={avisItem.id}
                              className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-gray-50/80 transition"
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                                    {nomClient.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-bold text-gray-800">
                                    {nomClient}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {dateFormatee}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                {renderEtoiles(avisItem.note)}
                                <span className="text-xs font-bold text-gray-700">
                                  {avisItem.note}/5
                                </span>
                              </div>

                              {avisItem.commentaire ? (
                                <p className="text-xs sm:text-sm text-gray-600 italic">
                                  "{avisItem.commentaire}"
                                </p>
                              ) : (
                                <p className="text-xs text-gray-400 italic">
                                  Aucun commentaire textuel laissé.
                                </p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}