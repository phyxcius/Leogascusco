import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ExternalLink,
  Calendar,
  Printer,
  DollarSign,
  Wallet,
  Clock,
  UserCheck,
  Building2,
  ShieldCheck,
  X
} from 'lucide-react';
import L from 'leaflet';
import { BrandBadge } from './BrandBadge';
import { playChimeSound, playSuccessChime } from '../utils/audio';
import { getAssetUrl } from '../utils/assets';
import { Pedido, VentaRegistro } from '../types/index';

export const RepartidorPanel: React.FC = () => {
  const {
    currentRepartidor,
    repartidorLogin,
    repartidorLogout,
    pedidos,
    advancePedidoEtapa,
    setRepartidorCoords,
    repartidores,
    ventas,
    negocio
  } = useApp();

  const [selectedRepId, setSelectedRepId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Tabs: 'solicitudes' | 'ruta' | 'movimientos'
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'ruta' | 'movimientos'>('solicitudes');
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);

  // Driver notification tracking: client coming out
  const [dismissedClienteSaliendo, setDismissedClienteSaliendo] = useState<string | null>(null);

  // Movements calendar filter state
  const [movFechaFiltro, setMovFechaFiltro] = useState<string>(new Date().toISOString().split('T')[0]);
  const [movRangoFiltro, setMovRangoFiltro] = useState<'hoy' | 'mes' | 'todos'>('hoy');
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);

  // Map references
  const repMapContainerRef = useRef<HTMLDivElement>(null);
  const repMapInstanceRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  // Filter assigned orders
  const myAssignedOrders = useMemo(() => {
    if (!currentRepartidor) return [];
    return pedidos.filter((p) => p.repartidorId === currentRepartidor.id && p.estado !== 'completado');
  }, [pedidos, currentRepartidor]);

  const unassignedOrders = useMemo(() => {
    return pedidos.filter((p) => p.estado === 'pendiente_asignacion');
  }, [pedidos]);

  const activeOrder = useMemo(() => {
    if (selectedPedidoId) {
      const found = pedidos.find((p) => p.id === selectedPedidoId && p.estado !== 'completado');
      if (found) return found;
    }
    return myAssignedOrders[0] || null;
  }, [pedidos, selectedPedidoId, myAssignedOrders]);

  // Auto-switch to 'ruta' when an order is active and driver is logged in
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

  // Audio trigger when client clicks "Salir a Recibir"
  useEffect(() => {
    if (!activeOrder) return;
    if (activeOrder.clienteSaliendo && dismissedClienteSaliendo !== activeOrder.id) {
      playChimeSound();
    }
  }, [activeOrder?.clienteSaliendo, activeOrder?.id, dismissedClienteSaliendo]);

  // Leaflet Map with Google Maps streets tiles
  useEffect(() => {
    if (!currentRepartidor || activeTab !== 'ruta') return;
    if (!repMapContainerRef.current) return;

    // Clean previous instance if container changed
    if (repMapInstanceRef.current) {
      try {
        repMapInstanceRef.current.remove();
      } catch (err) {
        // ignore
      }
      repMapInstanceRef.current = null;
      driverMarkerRef.current = null;
      routeLineRef.current = null;
    }

    if ((repMapContainerRef.current as any)._leaflet_id) {
      (repMapContainerRef.current as any)._leaflet_id = null;
    }

    const driverLat = currentRepartidor.lat || -13.525;
    const driverLng = currentRepartidor.lng || -71.975;
    const destLat = activeOrder?.lat || -13.535;
    const destLng = activeOrder?.lng || -71.972;

    const map = L.map(repMapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([driverLat, driverLng], 14);

    // High quality Google Maps Street Tiles with OpenStreetMap fallback
    const googleTiles = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20
    });

    googleTiles.on('tileerror', () => {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    });
    googleTiles.addTo(map);

    // Add Depot Marker (Point A)
    const depotIcon = L.divIcon({
      html: `
        <div style="background:#581c87; color:white; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900; border:2.5px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.4);">
          A
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    L.marker([-13.525, -71.975], { icon: depotIcon })
      .addTo(map)
      .bindPopup('<b>🏢 Depósito LeoGas Cusco</b><br>Av. El Sol 450 (Punto A)');

    // Add Driver Marker
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

    driverMarkerRef.current = L.marker([driverLat, driverLng], { icon: driverIcon })
      .addTo(map)
      .bindPopup(`<b>🛵 Mi Posición: ${currentRepartidor.nombre}</b>`);

    // Add Destination Marker (Point B) & Polyline if order active
    if (activeOrder) {
      const destIcon = L.divIcon({
        html: `
          <div style="background:#16a34a; color:white; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.4);" class="animate-bounce">
            B
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      L.marker([destLat, destLng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Destino B: ${activeOrder.cliente}</b><br>${activeOrder.direccion || 'Cusco'}`);

      // Polyline route
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

    repMapInstanceRef.current = map;

    // Multiple invalidateSize calls to guarantee tile rendering on mobile devices
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (repMapInstanceRef.current) {
        try {
          repMapInstanceRef.current.remove();
        } catch (e) {}
        repMapInstanceRef.current = null;
      }
      driverMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, [currentRepartidor?.id, activeTab, activeOrder?.id]);

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

  // Center map on driver's vehicle
  const handleCenterOnVehicle = () => {
    if (!repMapInstanceRef.current || !currentRepartidor) return;
    repMapInstanceRef.current.flyTo([currentRepartidor.lat, currentRepartidor.lng], 16, {
      animate: true,
      duration: 1.0
    });
  };

  // Advance step sequence
  const handleAdvanceStep = () => {
    if (!activeOrder) return;
    advancePedidoEtapa(activeOrder.id);
    if (activeOrder.etapa === 0) {
      // Salió en camino
      playChimeSound();
    } else if (activeOrder.etapa === 1) {
      // Llegó a la puerta
      playChimeSound();
    } else if (activeOrder.etapa === 2) {
      // Entregado
      playSuccessChime();
    } else if (activeOrder.etapa >= 3) {
      // Finalizado en base
      playSuccessChime();
      alert('✔ Pedido finalizado y registrado en caja. Has vuelto a estar libre en base.');
    }
  };

  // Filter movements for this driver
  const misMovimientos = useMemo(() => {
    if (!currentRepartidor) return [];
    return ventas.filter((v) => {
      const matchRep = v.repartidorId === currentRepartidor.id || v.repartidorNombre === currentRepartidor.nombre;
      if (!matchRep) return false;

      if (movRangoFiltro === 'hoy') {
        const hoyIso = new Date().toISOString().split('T')[0];
        return v.fecha.includes(hoyIso) || v.fecha.toLowerCase().includes('hoy');
      } else if (movRangoFiltro === 'mes') {
        const mesActual = new Date().toISOString().substring(0, 7);
        return v.fecha.includes(mesActual) || v.fecha.toLowerCase().includes('hoy');
      }
      return true; // todos
    });
  }, [ventas, currentRepartidor, movRangoFiltro]);

  // Movement KPI totals
  const totalRecaudado = misMovimientos.reduce((acc, v) => acc + v.total, 0);
  const totalEfectivo = misMovimientos
    .filter((v) => v.pago.toLowerCase().includes('efectivo') || v.pago.toLowerCase().includes('contado'))
    .reduce((acc, v) => acc + v.total, 0);
  const totalDigital = totalRecaudado - totalEfectivo;
  const totalBalones = misMovimientos.length;

  // IF DRIVER NOT LOGGED IN -> RENDER AUTH SCREEN WITH LISTBOX
  if (!currentRepartidor) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
          <div className="flex justify-center pb-2 border-b border-slate-100">
            <BrandBadge size="md" showChuspa={true} centered={true} />
          </div>

          <div className="text-left">
            <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-700" />
              <span>Portal de Repartidor</span>
            </h3>
            <p className="text-xs text-slate-500">Selecciona tu nombre y entra con tu clave personal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                Selecciona tu Nombre de Repartidor:
              </label>
              <select
                required
                value={selectedRepId}
                onChange={(e) => {
                  setSelectedRepId(e.target.value);
                  setLoginError(false);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-purple-600 cursor-pointer"
              >
                <option value="">-- Elige tu Nombre de Chofer --</option>
                {repartidores.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    🛵 {rep.nombre} ({rep.online ? 'En línea' : 'Desconectado'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                Contraseña Personal:
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => {
                  setLoginPass(e.target.value);
                  setLoginError(false);
                }}
                placeholder="Ingresa tu contraseña"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-purple-600"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                ❌ Clave incorrecta para el repartidor seleccionado.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ingresar a Mi Turno</span>
              <Navigation className="w-4 h-4 text-amber-300" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <a
              href="https://www.lachuspaanuncios.com"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-bold text-slate-400 hover:text-purple-700 transition"
            >
              Tecnología & GPS soportado por La Chuspa Tech
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Top Header */}
      <header className="bg-purple-950 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-800 border border-purple-600 flex items-center justify-center text-lg">
            🛵
          </div>
          <div>
            <h4 className="font-black text-sm leading-tight text-yellow-300">
              {currentRepartidor.nombre}
            </h4>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>En Servicio • GPS Cusco Activo</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={repartidorLogout}
          className="text-slate-300 hover:text-white bg-purple-900 hover:bg-purple-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </header>

      {/* DRIVER ALERT POPUP: CLIENT IS COMING OUT */}
      {activeOrder?.clienteSaliendo && dismissedClienteSaliendo !== activeOrder.id && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border-2 border-emerald-400 text-center animate-in zoom-in-95 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner animate-bounce">
              🚶🚪
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block">
              ¡Aviso en Tiempo Real!
            </span>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              ¡El Cliente ya está Saliendo a la Puerta!
            </h3>
            <p className="text-xs text-slate-600">
              <strong>{activeOrder.cliente}</strong> presionó <em>"Salir a Recibir ✔️"</em>. Por favor ten listo el balón de gas y su vuelto correspondiente.
            </p>
            <button
              type="button"
              onClick={() => {
                setDismissedClienteSaliendo(activeOrder.id);
                playSuccessChime();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              👍 ¡Entendido, esperando en puerta!
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEW TABS */}
      <main className="flex-1 flex flex-col">
        {/* TAB 1: SOLICITUDES ASIGNADAS & PENDIENTES */}
        {activeTab === 'solicitudes' && (
          <div className="p-4 space-y-4">
            <div className="bg-purple-900 text-white p-4 rounded-2xl shadow-sm border border-purple-800">
              <span className="text-[10px] font-black uppercase text-amber-300 block mb-0.5">
                Panel Operativo
              </span>
              <h3 className="text-base font-black">Mis Entregas Asignadas</h3>
              <p className="text-xs text-purple-200 mt-0.5">
                Tienes <strong>{myAssignedOrders.length}</strong> orden(es) activas asignadas para entrega.
              </p>
            </div>

            {myAssignedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2 shadow-xs">
                <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🛵
                </div>
                <h4 className="font-black text-slate-800 text-sm">No tienes pedidos pendientes</h4>
                <p className="text-xs text-slate-400">
                  Espera que la administración de LeoGas te asigne un pedido o revisa las solicitudes en espera.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAssignedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setSelectedPedidoId(ord.id);
                      setActiveTab('ruta');
                    }}
                    className={`bg-white rounded-2xl p-4 border-2 transition cursor-pointer shadow-xs hover:border-purple-600 ${
                      activeOrder?.id === ord.id ? 'border-purple-700 ring-2 ring-purple-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-700" />
                        <span>{ord.cliente}</span>
                      </span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        S/ {ord.montoCobro}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium mb-2">
                      📦 {ord.tipoBalon}
                    </p>
                    <p className="text-[11px] text-slate-500 mb-3 truncate">
                      📍 {ord.direccion || 'Cusco'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full">
                        {ord.etapa === 0 && '⚪ Asignado'}
                        {ord.etapa === 1 && '🛵 En Camino'}
                        {ord.etapa === 2 && '🚪 En la Puerta'}
                        {ord.etapa === 3 && '📦 Entregado'}
                      </span>
                      <button
                        type="button"
                        className="bg-purple-800 text-white font-black px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-xs"
                      >
                        <span>Abrir Ruta</span>
                        <Navigation className="w-3 h-3 text-amber-300" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unassigned incoming orders queue */}
            {unassignedOrders.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <span className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Solicitudes en Espera de Asignación ({unassignedOrders.length})</span>
                </span>
                <p className="text-[11px] text-amber-800">
                  La administración asignará estas órdenes en breve según proximidad GPS.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: IN-DRIVER MAP & ROUTE VIEW */}
        {activeTab === 'ruta' && (
          <div className="flex-1 flex flex-col relative h-[calc(100vh-130px)] overflow-hidden">
            {activeOrder ? (
              <>
                {/* TOP HALF: Guaranteed Leaflet Map with Google Maps Tiles */}
                <div className="relative w-full flex-1 min-h-[300px] bg-slate-100 overflow-hidden">
                  <div
                    ref={repMapContainerRef}
                    className="w-full h-full absolute inset-0 z-0"
                    style={{ minHeight: '300px' }}
                  />

                  {/* Floating Top Controls (ETA + GPS buttons) */}
                  <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
                    <div className="bg-purple-950/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-lg border border-purple-700 pointer-events-auto flex items-center gap-2 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>⏱️ 10 - 15 min (2.4 km)</span>
                    </div>

                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button
                        type="button"
                        onClick={handleCenterOnVehicle}
                        className="bg-white hover:bg-slate-100 text-slate-800 p-2 rounded-full shadow-lg border border-slate-200 cursor-pointer"
                        title="Centrar en mi moto"
                      >
                        <Crosshair className="w-4 h-4 text-purple-800" />
                      </button>

                      <a
                        href={
                          activeOrder.gpsUrl ||
                          `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
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

                {/* BOTTOM HALF: Floating Delivery Card */}
                <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-4 space-y-3 z-20 flex-shrink-0 animate-in slide-in-from-bottom duration-200">
                  {/* Customer row with Price Tag */}
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

                  {/* Customer Real-Time Status Notification Badge */}
                  {activeOrder.clienteSaliendo ? (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-900 font-black animate-pulse">
                      <span className="text-base">🚶</span>
                      <span>¡El cliente indicó que ya está saliendo a la puerta!</span>
                    </div>
                  ) : activeOrder.etapa === 2 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center gap-2 text-[11px] text-amber-800 font-semibold">
                      <span className="text-sm">⏳</span>
                      <span>Alerta enviada. Esperando que el cliente presione "Salir a Recibir"...</span>
                    </div>
                  ) : null}

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
                      <span>Llamar</span>
                    </a>

                    <a
                      href={`https://wa.me/${negocio.whatsapp || '51950727212'}?text=${encodeURIComponent(
                        `Hola ${activeOrder.cliente}, soy ${currentRepartidor.nombre} de LeoGas Cusco. Voy en camino con tu balón de gas.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Step Progress Pill */}
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 text-[10px] font-black uppercase text-white h-7">
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 1 ? 'bg-purple-700' : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      1. EN CAMINO
                    </div>
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 2 ? 'bg-amber-600' : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      2. EN PUERTA
                    </div>
                    <div
                      className={`flex-1 flex items-center justify-center ${
                        activeOrder.etapa >= 3 ? 'bg-emerald-600' : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      3. ENTREGADO
                    </div>
                  </div>

                  {/* SEQUENTIAL ACTION BUTTONS PER USER SPECIFICATION */}
                  <div>
                    {activeOrder.etapa === 0 && (
                      <button
                        type="button"
                        onClick={handleAdvanceStep}
                        className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                      >
                        <Navigation className="w-4 h-4 text-amber-300" />
                        <span>🛵 Salir en Camino (Iniciar Ruta)</span>
                      </button>
                    )}

                    {activeOrder.etapa === 1 && (
                      <button
                        type="button"
                        onClick={handleAdvanceStep}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-white" />
                        <span>🚪 Ya estoy en tu Puerta (Avisar Cliente)</span>
                      </button>
                    )}

                    {activeOrder.etapa === 2 && (
                      <button
                        type="button"
                        onClick={handleAdvanceStep}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-white" />
                        <span>📦 Entregado (Confirmar Entrega del Balón)</span>
                      </button>
                    )}

                    {activeOrder.etapa >= 3 && (
                      <button
                        type="button"
                        onClick={handleAdvanceStep}
                        className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-yellow-300" />
                        <span>🏢 Finalizado (Llegué a la Base)</span>
                      </button>
                    )}
                  </div>
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

        {/* TAB 3: MIS MOVIMIENTOS POR CALENDARIO (DÍA/MES/AÑO) E IMPRESIÓN */}
        {activeTab === 'movimientos' && (
          <div className="p-4 space-y-4">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="bg-amber-400 text-purple-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block mb-1">
                    Control de Reparto & Caja
                  </span>
                  <h3 className="text-base font-black">Mis Movimientos y Liquidación</h3>
                  <p className="text-xs text-purple-200 mt-0.5">
                    Chofer: <strong>{currentRepartidor.nombre}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrintReportModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* Calendar Filter Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>Filtro de Calendario:</span>
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setMovRangoFiltro('hoy')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      movRangoFiltro === 'hoy'
                        ? 'bg-purple-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovRangoFiltro('mes')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      movRangoFiltro === 'mes'
                        ? 'bg-purple-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovRangoFiltro('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      movRangoFiltro === 'todos'
                        ? 'bg-purple-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Histórico
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Seleccionar Día Específico:
                </label>
                <input
                  type="date"
                  value={movFechaFiltro}
                  onChange={(e) => {
                    setMovFechaFiltro(e.target.value);
                    setMovRangoFiltro('hoy');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Balones Entregados</span>
                <span className="text-xl font-black text-purple-950 mt-1 block">
                  🛵 {totalBalones} balones
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Recaudado</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">
                  S/ {totalRecaudado.toFixed(2)}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Efectivo en Mano</span>
                <span className="text-sm font-black text-slate-900 mt-1 block">
                  💵 S/ {totalEfectivo.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-400">A entregar a caja</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Yape / Plin / Tarjeta</span>
                <span className="text-sm font-black text-purple-900 mt-1 block">
                  📱 S/ {totalDigital.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-400">Cobro digital directo</span>
              </div>
            </div>

            {/* Movement Details Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h4 className="font-black text-xs text-slate-800">
                Detalle de Balones Entregados ({misMovimientos.length})
              </h4>

              {misMovimientos.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center font-semibold">
                  No hay movimientos registrados para el filtro seleccionado.
                </p>
              ) : (
                <div className="space-y-2">
                  {misMovimientos.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900">{m.cliente}</span>
                        <span className="text-emerald-700 font-mono font-black">S/ {m.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>📦 {m.productos}</span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-bold text-slate-700">
                          {m.pago}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                        <span>🗓️ {m.fecha}</span>
                        <span className="font-mono">{m.comprobante}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* PRINTABLE MOVEMENTS REPORT MODAL */}
      {showPrintReportModal && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl printable-area border border-slate-300 animate-in zoom-in-95 my-auto text-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 no-print">
              <span className="font-black text-purple-950 text-xs">
                📄 Reporte de Liquidación de Turno
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintReportModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="border border-slate-300 rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-1.5">
                <img
                  src={getAssetUrl(negocio.logoUrl)}
                  alt={negocio.nombre}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                  }}
                />
              </div>
              <h3 className="font-black text-sm text-purple-950 uppercase">
                {negocio.nombre}
              </h3>
              <p className="text-[10px] text-slate-500">{negocio.direccion} • Tel: {negocio.telPrincipal}</p>
              <div className="mt-2 py-1 px-2 bg-purple-50 rounded-lg border border-purple-200">
                <span className="font-black text-purple-900 block text-xs uppercase">
                  LIQUIDACIÓN DE REPARTIDOR EN RUTA
                </span>
                <span className="text-[10px] text-slate-600 block">
                  Repartidor: <strong>{currentRepartidor.nombre}</strong> • Fecha: {new Date().toLocaleDateString('es-PE')}
                </span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600">
                  <tr>
                    <th className="p-2">Cliente</th>
                    <th className="p-2">Balón</th>
                    <th className="p-2">Pago</th>
                    <th className="p-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {misMovimientos.map((m, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{m.cliente}</td>
                      <td className="p-2">{m.productos}</td>
                      <td className="p-2">{m.pago}</td>
                      <td className="p-2 text-right font-black">S/ {m.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Total Balones Entregados:</span>
                <strong>{totalBalones} unidades</strong>
              </div>
              <div className="flex justify-between text-slate-800">
                <span>Efectivo a Entregar en Caja:</span>
                <strong className="font-mono text-slate-900">S/ {totalEfectivo.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cobrado en Yape / Plin / POS:</span>
                <span className="font-mono">S/ {totalDigital.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-purple-950 pt-1.5 border-t border-slate-200">
                <span>TOTAL RECAUDADO:</span>
                <span className="font-mono text-purple-900">S/ {totalRecaudado.toFixed(2)}</span>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[10px]">
              <div className="border-t border-slate-400 pt-1">
                <strong>Firma del Repartidor</strong>
                <p className="text-slate-400">{currentRepartidor.nombre}</p>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <strong>Firma de Caja / Administración</strong>
                <p className="text-slate-400">LeoGas Cusco</p>
              </div>
            </div>

            {/* Endorsement */}
            <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-2">
              Sistema de Reparto respaldado por <strong>La Chuspa Tech</strong> (www.lachuspaanuncios.com)
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM IN-DRIVER NAVIGATION BAR (3 TABS) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex z-50 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('solicitudes')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer ${
            activeTab === 'solicitudes' ? 'text-purple-900 bg-purple-50 font-black' : 'text-slate-500'
          }`}
        >
          <span className="text-base">📋</span>
          <span>Solicitudes ({myAssignedOrders.length})</span>
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

        <button
          type="button"
          onClick={() => setActiveTab('movimientos')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition cursor-pointer ${
            activeTab === 'movimientos' ? 'text-purple-900 bg-purple-50 font-black' : 'text-slate-500'
          }`}
        >
          <span className="text-base">📊</span>
          <span>Mis Movimientos</span>
        </button>
      </nav>
    </div>
  );
};
