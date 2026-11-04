import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  MapPin,
  Compass,
  CheckCircle2,
  LogOut,
  Navigation,
  Check,
  Phone,
  MessageCircle,
  Crosshair,
  ExternalLink
} from 'lucide-react';
import L from 'leaflet';
import { BrandBadge } from './BrandBadge';
import { playChimeSound, playSuccessChime } from '../utils/audio';

export const RepartidorPanel: React.FC = () => {
  const {
    currentRepartidor,
    repartidorLogin,
    repartidorLogout,
    pedidos,
    advancePedidoEtapa,
    setRepartidorCoords,
    repartidores,
    negocio
  } = useApp();

  const [selectedRepId, setSelectedRepId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'solicitudes' | 'ruta'>('solicitudes');
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);

  const repMapContainerRef = useRef<HTMLDivElement>(null);
  const repMapInstanceRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  // If driver has active orders, filter them
  const myAssignedOrders = currentRepartidor
    ? pedidos.filter((p) => p.repartidorId === currentRepartidor.id && p.estado !== 'completado')
    : [];

  const unassignedOrders = pedidos.filter((p) => p.estado === 'pendiente_asignacion');

  const activeOrder = selectedPedidoId
    ? pedidos.find((p) => p.id === selectedPedidoId)
    : myAssignedOrders[0] || null;

  // Auto-switch to 'ruta' when an order is active and driver selects it
  useEffect(() => {
    if (myAssignedOrders.length > 0 && !selectedPedidoId) {
      setSelectedPedidoId(myAssignedOrders[0].id);
    }
  }, [myAssignedOrders, selectedPedidoId]);

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

  // inDriver Map initialization for 'ruta' view
  useEffect(() => {
    if (!currentRepartidor || activeTab !== 'ruta') return;
    if (!repMapContainerRef.current) return;

    const driverLat = currentRepartidor.lat || -13.525;
    const driverLng = currentRepartidor.lng || -71.975;
    const destLat = activeOrder?.lat || -13.538;
    const destLng = activeOrder?.lng || -71.980;

    if (!repMapInstanceRef.current) {
      const map = L.map(repMapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([driverLat, driverLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Add depot marker (Point A)
      const depotIcon = L.divIcon({
        html: `
          <div style="background:#581c87; color:white; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.4);">
            A
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      L.marker([-13.525, -71.975], { icon: depotIcon })
        .addTo(map)
        .bindPopup('<b>🏢 Depósito LeoGas Cusco</b><br>Punto de partida oficial');

      repMapInstanceRef.current = map;
    }

    const map = repMapInstanceRef.current;

    // Update Driver Marker
    const driverIcon = L.divIcon({
      html: `
        <div class="relative">
          <div class="absolute -inset-2 bg-purple-500 rounded-full animate-ping opacity-75"></div>
          <div style="background:#7e22ce; color:white; border-radius:50%; width:44px; height:44px; display:flex; align-items:center; justify-content:center; font-size:22px; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.4);">
            🛵
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker([driverLat, driverLng], { icon: driverIcon })
        .addTo(map)
        .bindPopup(`<b>🛵 Mi Posición: ${currentRepartidor.nombre}</b>`);
    } else {
      driverMarkerRef.current.setLatLng([driverLat, driverLng]);
    }

    // Destination Marker & Route Polyline
    if (activeOrder) {
      const destIcon = L.divIcon({
        html: `
          <div style="background:#16a34a; color:white; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:20px; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.4);" class="animate-bounce">
            📍
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      L.marker([destLat, destLng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Destino: ${activeOrder.cliente}</b><br>${activeOrder.direccion || 'Cusco'}`);

      // Draw route line
      if (routeLineRef.current) {
        routeLineRef.current.remove();
      }
      routeLineRef.current = L.polyline(
        [
          [-13.525, -71.975],
          [driverLat, driverLng],
          [destLat, destLng]
        ],
        { color: '#7e22ce', weight: 5, opacity: 0.85, dashArray: '8, 8' }
      ).addTo(map);

      map.fitBounds([
        [driverLat, driverLng],
        [destLat, destLng]
      ], { padding: [50, 50] });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map reference or cleanup
    };
  }, [currentRepartidor, activeTab, activeOrder]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepId) {
      setLoginError(true);
      return;
    }
    const chofer = repartidores.find((r) => r.id === selectedRepId);
    if (!chofer) {
      setLoginError(true);
      return;
    }
    const ok = repartidorLogin(chofer.usuario || chofer.nombre, loginPass);
    if (!ok) {
      setLoginError(true);
    } else {
      setLoginError(false);
      playSuccessChime();
    }
  };

  const handleAdvanceStep = () => {
    if (!activeOrder) return;
    advancePedidoEtapa(activeOrder.id);
    if (activeOrder.etapa === 1) {
      playChimeSound();
    } else if (activeOrder.etapa === 2) {
      playSuccessChime();
    }
  };

  // Center map on driver's vehicle
  const handleCenterOnVehicle = () => {
    if (!repMapInstanceRef.current || !currentRepartidor) return;
    repMapInstanceRef.current.flyTo([currentRepartidor.lat, currentRepartidor.lng], 16, {
      animate: true,
      duration: 1.2
    });
  };

  // IF DRIVER NOT LOGGED IN -> RENDER AUTH SCREEN WITH LISTBOX
  if (!currentRepartidor) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
          {/* Business Brand & Chuspa Tech Badge */}
          <div className="flex justify-center pb-2 border-b border-slate-100">
            <BrandBadge size="md" showChuspa={true} centered={true} />
          </div>

          <div className="text-left">
            <h3 className="text-lg font-black text-purple-950">Acceso de Repartidor</h3>
            <p className="text-xs text-slate-500">
              Selecciona tu nombre en la lista para iniciar tu turno en Cusco
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {/* Listbox of Drivers */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-600 block mb-1.5">
                🛵 Seleccionar Chofer / Repartidor:
              </label>
              <select
                value={selectedRepId}
                onChange={(e) => {
                  setSelectedRepId(e.target.value);
                  setLoginError(false);
                }}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-purple-800 cursor-pointer"
                required
              >
                <option value="">-- Elige tu Nombre de Chofer --</option>
                {repartidores.map((r) => (
                  <option key={r.id} value={r.id}>
                    🛵 {r.nombre} ({r.usuario || r.nombre.toLowerCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-600 block mb-1.5">
                Contraseña Asignada:
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => {
                  setLoginPass(e.target.value);
                  setLoginError(false);
                }}
                placeholder="Ingresa tu clave de acceso"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-purple-800"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                Contraseña incorrecta para el chofer seleccionado.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-xs transition shadow-md cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Iniciar Turno en Flota</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center pt-2">
            ¿No apareces en la lista? Pide a administración que te agregue en el panel de control.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-100 pb-16">
      {/* Top inDriver Header */}
      <header className="bg-purple-950 text-white px-4 py-3 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-800 text-white flex items-center justify-center text-lg shadow-xs">
            🛵
          </div>
          <div>
            <h3 className="font-black text-sm text-white">{currentRepartidor.nombre}</h3>
            <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              En Servicio • GPS Cusco
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={repartidorLogout}
          className="bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition border border-purple-800"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* VIEW 1: SOLICITUDES & BANDEJA */}
        {activeTab === 'solicitudes' && (
          <div className="p-4 space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-slate-900 text-sm">
                📋 Mis Entregas Asignadas ({myAssignedOrders.length})
              </h4>
            </div>

            {myAssignedOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 shadow-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-90" />
                <h5 className="font-black text-base text-slate-800">¡Al día con las entregas!</h5>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  No tienes pedidos pendientes en cola. Cuando administración o un cliente te asigne un pedido, aparecerá aquí.
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
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-700 block">
                          S/ {ord.montoCobro}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          {ord.metodoPago}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div><strong>Producto:</strong> {ord.tipoBalon}</div>
                      <div><strong>Dirección:</strong> 📍 {ord.direccion || 'Cusco'}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPedidoId(ord.id);
                        setActiveTab('ruta');
                      }}
                      className="w-full bg-purple-800 hover:bg-purple-900 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                    >
                      <Navigation className="w-4 h-4 text-amber-300" />
                      <span>Ver Ruta inDriver y Navegar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Unassigned orders waiting */}
            {unassignedOrders.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-black text-amber-800 uppercase block mb-2">
                  🔔 Solicitudes Entrantes en Espera ({unassignedOrders.length})
                </span>
                <div className="space-y-2">
                  {unassignedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-yellow-50 border border-yellow-300 p-3 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <strong className="text-slate-900 block">{ord.cliente}</strong>
                        <span className="text-slate-600 text-[11px]">{ord.tipoBalon} • {ord.direccion}</span>
                      </div>
                      <span className="font-black text-purple-900">S/ {ord.montoCobro}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: inDriver Delivery Interface with Live Map & Sliding Bottom Card */}
        {activeTab === 'ruta' && (
          <div className="flex-1 flex flex-col relative h-[calc(100vh-120px)] overflow-hidden">
            {activeOrder ? (
              <>
                {/* TOP HALF: inDriver Live Leaflet Map */}
                <div className="relative flex-1 w-full bg-slate-800">
                  <div ref={repMapContainerRef} className="w-full h-full" />

                  {/* Top Floating ETA Pill (like inDriver) */}
                  <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
                    <div className="bg-purple-950/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-lg border border-purple-700 pointer-events-auto flex items-center gap-2 text-xs font-extrabold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>⏱️ 10 - 15 min (2.4 km)</span>
                    </div>

                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button
                        type="button"
                        onClick={handleCenterOnVehicle}
                        className="bg-white hover:bg-slate-100 text-slate-800 p-2 rounded-full shadow-lg border border-slate-200 cursor-pointer"
                        title="Centrar mi moto"
                      >
                        <Crosshair className="w-4 h-4 text-purple-800" />
                      </button>

                      <a
                        href={
                          activeOrder.gpsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${activeOrder.direccion || 'Cusco'}, Cusco, Peru`
                          )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-black flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* BOTTOM HALF: inDriver Floating Delivery Card */}
                <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-4 space-y-3 z-20 flex-shrink-0 animate-in slide-in-from-bottom duration-300">
                  {/* Customer row with Price tag */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md flex-shrink-0">
                        {activeOrder.cliente ? activeOrder.cliente.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm leading-tight">
                          {activeOrder.cliente}
                        </h4>
                        <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                          {activeOrder.tipoBalon}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-700 leading-none block">
                        S/ {activeOrder.montoCobro}
                      </span>
                      <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
                        {activeOrder.metodoPago}
                      </span>
                    </div>
                  </div>

                  {/* Point A -> Point B Itinerary */}
                  <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                        A
                      </span>
                      <div className="truncate">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Partida</span>
                        <strong className="text-slate-800 truncate block">Depósito LeoGas (Av. El Sol 450)</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 border-t border-slate-200 pt-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                        B
                      </span>
                      <div className="truncate">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Entrega</span>
                        <strong className="text-slate-800 truncate block">{activeOrder.direccion || 'Cusco'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Customer Quick Call & Chat Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${negocio.whatsapp || '950727212'}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Phone className="w-3.5 h-3.5 text-purple-700" />
                      <span>Llamar Cliente</span>
                    </a>
                    <a
                      href={`https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(
                        `Hola ${activeOrder.cliente}, soy tu repartidor de LeoGas Cusco con tu pedido de gas.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Step Sequence Indicator */}
                  <div className="flex h-6 rounded-xl overflow-hidden bg-slate-200 gap-0.5 text-[9px] font-black text-white">
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 1 ? 'bg-red-500' : 'bg-slate-300 opacity-40'
                      }`}
                    >
                      1. EN CAMINO
                    </div>
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 2 ? 'bg-amber-500' : 'bg-slate-300 opacity-40'
                      }`}
                    >
                      2. EN PUERTA
                    </div>
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 3 ? 'bg-emerald-600' : 'bg-slate-300 opacity-40'
                      }`}
                    >
                      3. COMPLETADO
                    </div>
                  </div>

                  {/* Big inDriver Action Button */}
                  <button
                    type="button"
                    onClick={handleAdvanceStep}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    {activeOrder.etapa === 0 && (
                      <>
                        <Navigation className="w-4 h-4 text-amber-300" />
                        <span>Iniciar Reparto (Salir a Ruta)</span>
                      </>
                    )}
                    {activeOrder.etapa === 1 && (
                      <>
                        <MapPin className="w-4 h-4 text-white" />
                        <span>🚪 Llegué a la Puerta (Avisar Cliente)</span>
                      </>
                    )}
                    {activeOrder.etapa === 2 && (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>💵 Cobrar S/ {activeOrder.montoCobro} y Finalizar ✔️</span>
                      </>
                    )}
                    {activeOrder.etapa >= 3 && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>¡Entrega Concluida con Éxito!</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 my-auto">
                <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h5 className="font-bold text-sm text-slate-800">No hay ruta seleccionada</h5>
                <p className="text-xs text-slate-400 mt-1">
                  Ve a la pestaña "Mis Solicitudes" y selecciona un pedido para abrir la navegación inDriver.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom inDriver Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex z-50 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('solicitudes')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer ${
            activeTab === 'solicitudes' ? 'text-purple-900 bg-purple-50 font-black' : 'text-slate-500'
          }`}
        >
          <span className="text-base">📋</span>
          <span>Mis Solicitudes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ruta')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer ${
            activeTab === 'ruta' ? 'text-purple-900 bg-purple-50 font-black' : 'text-slate-500'
          }`}
        >
          <span className="text-base">🗺️</span>
          <span>Navegar en Ruta</span>
        </button>
      </nav>
    </div>
  );
};
