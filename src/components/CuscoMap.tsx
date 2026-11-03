import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Maximize2, Minimize2, Crosshair, MapPin } from 'lucide-react';
import L from 'leaflet';

export const CuscoMap: React.FC = () => {
  const { repartidores } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const clientMarkerRef = useRef<L.Marker | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const hayOnline = repartidores.some(r => r.online);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([-13.525, -71.975], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Driver Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    repartidores.forEach(rep => {
      const customIcon = L.divIcon({
        className: 'custom-gps-container',
        html: `
          <div class="custom-gps-marker">
            <div class="gps-radar-pulse"></div>
            <div class="fire-flame-emitter">🔥</div>
            <div class="lion-badge-circle">🦁</div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      const popupContent = `
        <div style="font-family:system-ui; font-size:12px; line-height:1.4;">
          <strong style="color:#6b21a8; font-size:13px;">🛵 LeoGas Flota: ${rep.nombre}</strong><br>
          <span style="color:${rep.online ? '#15803d' : '#dc2626'}; font-weight:bold;">
            ● ${rep.online ? 'En Servicio' : 'Desconectado'}
          </span><br>
          <span>Etapa: ${rep.etapaSecuencia === 1 ? '1. En Camino' : rep.etapaSecuencia === 2 ? '2. En Puerta' : '3. Completado'}</span>
        </div>
      `;

      if (!markersRef.current[rep.id]) {
        const marker = L.marker([rep.lat, rep.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
        markersRef.current[rep.id] = marker;
      } else {
        const marker = markersRef.current[rep.id];
        marker.setLatLng([rep.lat, rep.lng]);
        marker.setIcon(customIcon);
        marker.setPopupContent(popupContent);
      }
    });
  }, [repartidores]);

  // Center user location
  const handleCenterUser = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });

        const map = mapInstanceRef.current;
        if (!map) return;

        if (!clientMarkerRef.current) {
          const homeIcon = L.divIcon({
            html: `
              <div style="background:#2563eb; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">
                🏠
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });

          clientMarkerRef.current = L.marker([lat, lng], { icon: homeIcon })
            .addTo(map)
            .bindPopup('<b>📍 Tu Ubicación (Entrega)</b>')
            .openPopup();
        } else {
          clientMarkerRef.current.setLatLng([lat, lng]).openPopup();
        }

        map.setView([lat, lng], 15);
      },
      () => {
        alert('No se pudo obtener la ubicación GPS.');
      }
    );
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  };

  return (
    <section className="max-w-6xl mx-auto my-6 px-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-700" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Flota de Reparto en Tiempo Real (Cusco)
            </h3>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold">
            <span
              className={`flex items-center gap-1.5 transition ${
                hayOnline ? 'text-emerald-700 font-extrabold opacity-100' : 'text-slate-400 opacity-40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              En Línea
            </span>
            <span className="text-slate-300">|</span>
            <span
              className={`flex items-center gap-1.5 transition ${
                !hayOnline ? 'text-red-600 font-extrabold opacity-100' : 'text-slate-400 opacity-40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Fuera de Ruta
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div
          className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none'
              : 'h-[360px] sm:h-[400px] border border-slate-200 shadow-inner'
          }`}
        >
          {/* Controls Floating */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="bg-white/95 backdrop-blur-xs border border-purple-700 text-purple-800 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md hover:bg-purple-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Reducir' : 'Ampliar Mapa'}</span>
            </button>

            <button
              type="button"
              onClick={handleCenterUser}
              className="bg-white/95 backdrop-blur-xs border border-blue-600 text-blue-700 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md hover:bg-blue-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Mi Ubicación</span>
            </button>
          </div>

          {/* Leaflet DOM div */}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        <p className="text-[11px] text-slate-500 mt-2 text-center sm:text-left">
          💡 Visualiza los vehículos de reparto activos en Cusco. Haz clic en un repartidor para ver su estado y ruta.
        </p>
      </div>
    </section>
  );
};
