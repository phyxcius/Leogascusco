import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  MapPin,
  Compass,
  CheckCircle2,
  LogOut,
  Navigation,
  Clock,
  Check,
  ExternalLink
} from 'lucide-react';
import L from 'leaflet';
import { BrandBadge } from './BrandBadge';

export const RepartidorPanel: React.FC = () => {
  const {
    currentRepartidor,
    repartidorLogin,
    repartidorLogout,
    pedidos,
    advancePedidoEtapa,
    setRepartidorCoords,
    repartidores
  } = useApp();

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'solicitudes' | 'ruta'>('solicitudes');
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);

  const repMapContainerRef = useRef<HTMLDivElement>(null);
  const repMapInstanceRef = useRef<L.Map | null>(null);

  // If driver has active orders, automatically select the first one
  const myAssignedOrders = currentRepartidor
    ? pedidos.filter((p) => p.repartidorId === currentRepartidor.id && p.estado !== 'completado')
    : [];

  const unassignedOrders = pedidos.filter((p) => p.estado === 'pendiente_asignacion');

  const activeOrder = selectedPedidoId
    ? pedidos.find((p) => p.id === selectedPedidoId)
    : myAssignedOrders[0] || null;

  // Driver GPS watch
  useEffect(() => {
    if (!currentRepartidor) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setRepartidorCoords(currentRepartidor.id, pos.coords.latitude, pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [currentRepartidor?.id, setRepartidorCoords]);

  // Map initialization for 'ruta' view
  useEffect(() => {
    if (!currentRepartidor || activeTab !== 'ruta') return;
    if (!repMapContainerRef.current) return;
    if (repMapInstanceRef.current) {
      repMapInstanceRef.current.invalidateSize();
      return;
    }

    const driverLat = currentRepartidor.lat || -13.525;
    const driverLng = currentRepartidor.lng || -71.975;

    const map = L.map(repMapContainerRef.current, { zoomControl: false }).setView(
      [driverLat, driverLng],
      14
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Driver Marker
    const driverIcon = L.divIcon({
      html: `
        <div style="background:#7e22ce; color:white; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:20px; border:3px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
          🛵
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    L.marker([driverLat, driverLng], { icon: driverIcon })
      .addTo(map)
      .bindPopup(`<b>🛵 Mi Posición: ${currentRepartidor.nombre}</b>`)
      .openPopup();

    // Destination Marker if order has coordinates
    if (activeOrder && activeOrder.lat && activeOrder.lng) {
      const destIcon = L.divIcon({
        html: `
          <div style="background:#16a34a; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">
            🏠
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      L.marker([activeOrder.lat, activeOrder.lng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Destino: ${activeOrder.cliente}</b><br>${activeOrder.direccion}`);

      map.fitBounds([
        [driverLat, driverLng],
        [activeOrder.lat, activeOrder.lng]
      ]);
    }

    repMapInstanceRef.current = map;

    return () => {
      if (repMapInstanceRef.current) {
        repMapInstanceRef.current.remove();
        repMapInstanceRef.current = null;
      }
    };
  }, [currentRepartidor, activeTab, activeOrder]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = repartidorLogin(loginUser, loginPass);
    if (!ok) setLoginError(true);
  };

  const handleAdvanceStep = () => {
    if (!activeOrder) return;
    advancePedidoEtapa(activeOrder.id);
  };

  // If driver not logged in, render login screen
  if (!currentRepartidor) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-200 shadow-xl text-center space-y-5">
          {/* Business Brand & Chuspa Tech Badge */}
          <div className="flex justify-center pb-2 border-b border-slate-100">
            <BrandBadge size="md" showChuspa={true} centered={true} />
          </div>

          <div className="text-left">
            <h3 className="text-lg font-black text-purple-950">Acceso de Repartidor</h3>
            <p className="text-xs text-slate-500">Ingresa con tus credenciales de chofer en ruta</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Usuario de Chofer / Repartidor:
              </label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="edwin, carlos o jorge"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:outline-purple-800"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Contraseña:
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:outline-purple-800"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                Usuario o contraseña incorrectos.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-md cursor-pointer mt-2"
            >
              Iniciar Turno en Flota
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4 min-h-[85vh] flex flex-col justify-between">
      {/* Top Floating Driver Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
            🛵
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">{currentRepartidor.nombre}</h3>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              GPS ACTIVO EN RUTA (Cusco)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={repartidorLogout}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Main Panel Views */}
      <div className="flex-1 mb-16">
        {/* VIEW 1: SOLICITUDES */}
        {activeTab === 'solicitudes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-slate-900 text-sm">
                📋 Mis Entregas Asignadas ({myAssignedOrders.length})
              </h4>
            </div>

            {myAssignedOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h5 className="font-bold text-sm text-slate-800">¡Al día con las entregas!</h5>
                <p className="text-xs text-slate-400 mt-1">
                  No tienes pedidos pendientes en cola. Esperando nuevas solicitudes...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAssignedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:border-purple-600 transition"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                          {ord.tipoVenta === 'mayorista_b2b' ? 'B2B Mayorista' : 'Hogar / Minorista'}
                        </span>
                        <h4 className="font-black text-slate-900 text-base mt-1">{ord.cliente}</h4>
                      </div>
                      <span className="text-xl font-black text-emerald-700">
                        S/ {ord.montoCobro}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <strong>Producto:</strong> {ord.tipoBalon}
                      </div>
                      <div>
                        <strong>Pago:</strong> {ord.metodoPago}
                      </div>
                      <div>
                        <strong>Dirección:</strong> 📍 {ord.direccion || 'Cusco'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPedidoId(ord.id);
                          setActiveTab('ruta');
                        }}
                        className="flex-1 bg-purple-800 hover:bg-purple-900 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Ver Mapa y Navegar Ruta</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unassigned orders waiting */}
            {unassignedOrders.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-black text-amber-800 uppercase block mb-2">
                  🔔 Solicitudes Libres Disponibles ({unassignedOrders.length})
                </span>
                <div className="space-y-2">
                  {unassignedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-yellow-50 border border-yellow-300 p-3 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <strong className="text-slate-900 block">{ord.cliente}</strong>
                        <span className="text-slate-600 text-[11px]">{ord.tipoBalon}</span>
                      </div>
                      <span className="font-black text-purple-900">S/ {ord.montoCobro}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: MAPA EN RUTA */}
        {activeTab === 'ruta' && (
          <div className="space-y-4">
            {activeOrder ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="bg-yellow-100 text-yellow-900 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    RUTA DE REPARTO EN CURSO
                  </span>
                  <span className="text-2xl font-black text-emerald-700">
                    S/ {activeOrder.montoCobro}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-purple-950">{activeOrder.cliente}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{activeOrder.tipoBalon}</p>
                </div>

                {/* Itinerary points */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-purple-700 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      A
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Partida (Base LeoGas)
                      </span>
                      <strong className="text-slate-800">Calle Garcilaso 210, Cusco</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      B
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Destino del Cliente
                      </span>
                      <strong className="text-slate-800">{activeOrder.direccion || 'Cusco'}</strong>
                    </div>
                  </div>
                </div>

                {/* Direct External GPS Navigation button (Waze / Google Maps) */}
                <a
                  href={
                    activeOrder.gpsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${activeOrder.direccion || 'Cusco'}, Cusco, Peru`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm text-center"
                >
                  <Compass className="w-4 h-4" />
                  <span>🧭 Abrir Navegación en Google Maps / Waze</span>
                </a>

                {/* Step sequence bar */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Etapa Actual del Pedido:
                  </span>
                  <div className="flex h-7 rounded-xl overflow-hidden bg-slate-200 gap-0.5 text-[10px] font-black text-white">
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 1 ? 'bg-red-500 opacity-100' : 'bg-slate-300 opacity-40'
                      }`}
                    >
                      1. EN CAMINO
                    </div>
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 2 ? 'bg-amber-500 opacity-100' : 'bg-slate-300 opacity-40'
                      }`}
                    >
                      2. EN PUERTA
                    </div>
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 3 ? 'bg-emerald-600 opacity-100' : 'bg-slate-300 opacity-40'
                      }`}
                    >
                      3. COMPLETADO
                    </div>
                  </div>
                </div>

                {/* Big Action button to advance step */}
                <button
                  type="button"
                  onClick={handleAdvanceStep}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  {activeOrder.etapa === 0 && (
                    <>
                      <Navigation className="w-5 h-5" />
                      <span>Iniciar Reparto (Salir a Ruta)</span>
                    </>
                  )}
                  {activeOrder.etapa === 1 && (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>Llegué a la Puerta (Avisar Cliente)</span>
                    </>
                  )}
                  {activeOrder.etapa === 2 && (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Cobrar y Finalizar Entrega ✔️</span>
                    </>
                  )}
                  {activeOrder.etapa >= 3 && (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>¡Entrega Concluida!</span>
                    </>
                  )}
                </button>

                {/* Leaflet map container */}
                <div
                  ref={repMapContainerRef}
                  className="w-full h-56 rounded-2xl border border-slate-200 overflow-hidden"
                />
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">Selecciona un pedido desde "Mis Solicitudes" para ver la ruta.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom inDriver Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('solicitudes')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer ${
            activeTab === 'solicitudes' ? 'text-purple-900 bg-purple-50' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">📋</span>
          <span>Mis Solicitudes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ruta')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer ${
            activeTab === 'ruta' ? 'text-purple-900 bg-purple-50' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">🗺️</span>
          <span>Mapa en Ruta</span>
        </button>
      </nav>
    </div>
  );
};
