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
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

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
          <strong style="color:#6b21a8; font-size:13px;">🛵 Flota: ${rep.nombre}</strong><br>
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

  // Handle Fullscreen resize and body overflow lock
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 180);
    const t3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 350);
    const t4 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 650);

    const handleResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = '';
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen]);

  // Center user location with distinct color and high accuracy
  const handleCenterUser = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no cuenta con servicio de geolocalización GPS.');
      return;
    }

    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setIsGpsActive(true);
        setIsGpsLoading(false);

        const map = mapInstanceRef.current;
        if (!map) return;

        if (!clientMarkerRef.current) {
          const homeIcon = L.divIcon({
            html: `
              <div style="background:#16a34a; color:white; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:20px; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.4);" class="animate-bounce">
                📍
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          clientMarkerRef.current = L.marker([lat, lng], { icon: homeIcon })
            .addTo(map)
            .bindPopup('<b>📍 Tu Ubicación Actual (Punto de Entrega)</b>')
            .openPopup();
        } else {
          clientMarkerRef.current.setLatLng([lat, lng]).openPopup();
        }

        map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
      },
      (err) => {
        setIsGpsLoading(false);
        setIsGpsActive(false);
        alert('No se pudo obtener la ubicación GPS. Verifica que diste permiso de localización en tu navegador.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <section className="max-w-6xl mx-auto my-6 px-4">
      {/* Normal View Wrapper */}
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
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En Línea
            </span>
            <span className="text-slate-300">|</span>
            <span
              className={`flex items-center gap-1.5 transition ${
                !hayOnline ? 'text-red-600 font-extrabold opacity-100' : 'text-slate-400 opacity-40'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              Fuera de Ruta
            </span>
          </div>
        </div>

        {/* Map Container - Fullscreen or inline */}
        <div
          className={`transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-[999999] w-full h-[100dvh] bg-slate-900 flex flex-col m-0 p-0 overflow-hidden'
              : 'relative overflow-hidden h-[360px] sm:h-[420px] rounded-xl border border-slate-200 shadow-inner'
          }`}
        >
          {/* Top Bar for Fullscreen mode (Mobile Adaptive) */}
          {isFullscreen && (
            <div className="bg-purple-950 text-white px-3 sm:px-4 py-2.5 flex items-center justify-between z-[1000000] shadow-md border-b border-purple-800 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg sm:text-xl flex-shrink-0">🛵</span>
                <div className="min-w-0">
                  <h4 className="font-black text-xs sm:text-sm truncate">Flota en Ruta - Cusco</h4>
                  <p className="text-[10px] sm:text-[11px] text-purple-200 hidden xs:block truncate">Monitoreo activo de unidades</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCenterUser}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md ${
                    isGpsActive
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 animate-pulse'
                      : isGpsLoading
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isGpsActive ? 'text-white' : 'text-purple-700'}`} />
                  <span>{isGpsLoading ? 'Buscando...' : isGpsActive ? '📍 GPS Activo' : 'Mi Ubicación'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-md cursor-pointer transition"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Cerrar</span>
                </button>
              </div>
            </div>
          )}

          {/* Controls Floating in Normal Inline View */}
          {!isFullscreen && (
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="bg-purple-800 hover:bg-purple-900 text-white border border-purple-900 px-3 py-1.5 rounded-full text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Ampliar Mapa</span>
              </button>

              <button
                type="button"
                onClick={handleCenterUser}
                className={`px-3 py-1.5 rounded-full text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer border ${
                  isGpsActive
                    ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 animate-pulse shadow-emerald-600/40'
                    : isGpsLoading
                    ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Crosshair className={`w-3.5 h-3.5 ${isGpsActive ? 'text-white' : 'text-purple-700'}`} />
                <span>{isGpsLoading ? 'Buscando GPS...' : isGpsActive ? '📍 GPS Activo' : 'Mi Ubicación'}</span>
              </button>
            </div>
          )}

          {/* Leaflet DOM div */}
          <div ref={mapContainerRef} className="w-full h-full flex-1" />
        </div>

        <p className="text-[11px] text-slate-500 mt-2 text-center sm:text-left">
          💡 Visualiza los vehículos de reparto activos en Cusco. Haz clic en un repartidor para ver su estado y ruta. Al activar tu GPS, el botón cambiará de color a verde esmeralda y centrará tu casa.
        </p>
      </div>
    </section>
  );
};
