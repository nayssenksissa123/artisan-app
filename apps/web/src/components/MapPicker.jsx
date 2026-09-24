import { useEffect, useRef, useState } from 'react';

// Villes principales avec coordonnees
const VILLES_TUNISIE = [
  { nom: 'Tunis', lat: 36.8065, lng: 10.1815 },
  { nom: 'Ariana', lat: 36.8665, lng: 10.1647 },
  { nom: 'La Marsa', lat: 36.8782, lng: 10.3247 },
  { nom: 'Sousse', lat: 35.8256, lng: 10.6084 },
  { nom: 'Sfax', lat: 34.7406, lng: 10.7603 },
  { nom: 'Bizerte', lat: 37.2746, lng: 9.8739 },
  { nom: 'Nabeul', lat: 36.4561, lng: 10.7376 },
  { nom: 'Monastir', lat: 35.7779, lng: 10.8262 },
];

export default function MapPicker({ value, onChange, onCoordsChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [estCharge, setEstCharge] = useState(false);
  const [rechercheLieu, setRechercheLieu] = useState('');
  const [chargementGeocoding, setChargementGeocoding] = useState(false);
  const [positionActuelle, setPositionActuelle] = useState({ lat: 36.8065, lng: 10.1815 });

  // Charger Leaflet CSS et JS via CDN
  useEffect(() => {
    let scriptTag = null;
    let linkTag = null;

    const chargerLeaflet = () => {
      if (!document.getElementById('leaflet-css')) {
        linkTag = document.createElement('link');
        linkTag.id = 'leaflet-css';
        linkTag.rel = 'stylesheet';
        linkTag.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkTag);
      }

      if (window.L) {
        initMap();
      } else {
        if (!document.getElementById('leaflet-js')) {
          scriptTag = document.createElement('script');
          scriptTag.id = 'leaflet-js';
          scriptTag.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          scriptTag.onload = () => initMap();
          document.body.appendChild(scriptTag);
        } else {
          const checkL = setInterval(() => {
            if (window.L) {
              clearInterval(checkL);
              initMap();
            }
          }, 100);
        }
      }
    };

    chargerLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return;

    const L = window.L;

    // Fix icone par defaut de Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const initLat = positionActuelle.lat;
    const initLng = positionActuelle.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initLat, initLng],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);
    marker.bindPopup('<b>Zone d\'intervention</b><br>Déplacez le marqueur').openPopup();

    // Ecouteur clic sur la carte
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      deplacerMarqueur(lat, lng, true);
    });

    // Ecouteur fin de glissement du marqueur
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      deplacerMarqueur(lat, lng, true);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    setEstCharge(true);
  };

  // Deplacer le marqueur et faire le geocoding inverse
  const deplacerMarqueur = async (lat, lng, faireGeocoding = true) => {
    setPositionActuelle({ lat, lng });
    if (onCoordsChange) onCoordsChange({ lat, lng });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.bindPopup(`<b>Position choisie</b><br>${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([lat, lng]);
    }

    if (faireGeocoding) {
      setChargementGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        const data = await response.json();
        if (data && data.address) {
          const ville =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.municipality ||
            data.address.county ||
            '';
          const quartier = data.address.suburb || data.address.neighbourhood || '';
          const lieuFormate = [quartier, ville, 'Tunisie'].filter(Boolean).join(', ');

          if (lieuFormate) {
            onChange(lieuFormate);
          }
        }
      } catch (err) {
        // En cas de probleme de reseau vers Nominatim, fallback coordonnees
      } finally {
        setChargementGeocoding(false);
      }
    }
  };

  // Selection rapide d'une ville
  const choisirVille = (ville) => {
    deplacerMarqueur(ville.lat, ville.lng, false);
    onChange(`${ville.nom}, Tunisie`);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([ville.lat, ville.lng], 13);
    }
  };

  // Recherche libre d'un lieu
  const handleRechercheLieu = async (e) => {
    e.preventDefault();
    if (!rechercheLieu.trim()) return;

    setChargementGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          rechercheLieu + ', Tunisie'
        )}&limit=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const results = await response.json();
      if (results && results.length > 0) {
        const item = results[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        deplacerMarqueur(lat, lng, false);
        onChange(item.display_name.split(',').slice(0, 3).join(','));
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
        }
      }
    } catch (e) {
    } finally {
      setChargementGeocoding(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Barre de selection de ville rapide */}
      <div>
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
          Sélection rapide d'une ville :
        </span>
        <div className="flex flex-wrap gap-1.5">
          {VILLES_TUNISIE.map((v) => (
            <button
              key={v.nom}
              type="button"
              onClick={() => choisirVille(v)}
              className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-300 text-gray-700 transition"
            >
              📍 {v.nom}
            </button>
          ))}
        </div>
      </div>

      {/* Recherche d'adresse sur la carte */}
      <div className="flex gap-2">
        <input
          type="text"
          value={rechercheLieu}
          onChange={(e) => setRechercheLieu(e.target.value)}
          placeholder="Chercher un quartier ou une ville sur la carte..."
          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
        <button
          type="button"
          onClick={handleRechercheLieu}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
        >
          {chargementGeocoding ? 'Recherche...' : 'Centrer la carte'}
        </button>
      </div>

      {/* Conteneur de la carte Leaflet */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-300 shadow-inner h-64 bg-gray-100">
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '256px' }} />

        {/* Overlay d'aide */}
        <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-700 shadow-sm border border-gray-200 pointer-events-none">
          👆 Cliquez pour placer le marqueur
        </div>

        {chargementGeocoding && (
          <div className="absolute inset-0 z-[500] bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-700 bg-white px-3 py-1.5 rounded-lg shadow border border-gray-100">
              Détection de l'adresse en cours...
            </span>
          </div>
        )}
      </div>

      {/* Champ texte de localisation liee */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
          Adresse / Localisation retenue :
        </label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            placeholder="Ex: Tunis, Centre Ville, Tunisie"
            className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium text-gray-900 bg-white"
          />
          <span className="absolute right-3 top-2.5 text-base">📍</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          L'adresse se met à jour automatiquement quand vous cliquez sur la carte ou vous pouvez la peaufiner manuellement.
        </p>
      </div>
    </div>
  );
}
