import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  Building2,
  Receipt,
  Star,
  Wrench,
  Flame,
  Phone,
  Truck,
  BarChart3,
  LogOut,
  Plus,
  Trash2,
  Printer,
  Download,
  CheckCircle,
  Menu,
  X,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import L from 'leaflet';
import { Repartidor, Producto, Accesorio, EmpresaB2B, ClienteVIP } from '../types/index';
import { getPageUrl } from '../utils/assets';

export const AdminPanel: React.FC = () => {
  const {
    isAdminLogged,
    adminLogin,
    adminLogout,
    pedidos,
    assignPedido,
    repartidores,
    addRepartidor,
    updateRepartidor,
    deleteRepartidor,
    toggleRepartidorOnline,
    empresasB2B,
    addEmpresaB2B,
    deleteEmpresaB2B,
    clientesVIP,
    addClienteVIP,
    deleteClienteVIP,
    productos,
    addProducto,
    updateProducto,
    deleteProducto,
    accesorios,
    addAccesorio,
    updateAccesorio,
    deleteAccesorio,
    telefonos,
    updateTelefonos,
    ventas,
    createPedido
  } = useApp();

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Current tab
  const [activeTab, setActiveTab] = useState<
    'pedidos' | 'b2b' | 'liquidacion' | 'clientes' | 'accesorios' | 'productos' | 'telefonos' | 'gps' | 'reportes'
  >('pedidos');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Phone order modal
  const [showPhoneOrderModal, setShowPhoneOrderModal] = useState(false);
  const [phoneCliente, setPhoneCliente] = useState('');
  const [phoneDireccion, setPhoneDireccion] = useState('');
  const [phoneProductoId, setPhoneProductoId] = useState(productos[0]?.id || '');
  const [phoneCantidad, setPhoneCantidad] = useState(1);
  const [phonePago, setPhonePago] = useState('Efectivo');
  const [phoneRepartidorId, setPhoneRepartidorId] = useState('');

  // B2B form
  const [newB2bRuc, setNewB2bRuc] = useState('');
  const [newB2bRazon, setNewB2bRazon] = useState('');
  const [newB2bPrecio, setNewB2bPrecio] = useState(175.0);
  const [newB2bCondicion, setNewB2bCondicion] = useState('Crédito (A cuenta 15 días)');

  // VIP form
  const [newVipNombre, setNewVipNombre] = useState('');
  const [newVipDoc, setNewVipDoc] = useState('');
  const [newVipTel, setNewVipTel] = useState('');
  const [newVipDir, setNewVipDir] = useState('');

  // New Product form
  const [newProdNombre, setNewProdNombre] = useState('');
  const [newProdPrecio, setNewProdPrecio] = useState('');
  const [newProdTag, setNewProdTag] = useState('');

  // New Driver form
  const [newRepNombre, setNewRepNombre] = useState('');
  const [newRepUser, setNewRepUser] = useState('');
  const [newRepPass, setNewRepPass] = useState('123');

  // Report filter
  const [reportFilter, setReportFilter] = useState<'hoy' | '7dias' | 'mes' | 'todos'>('hoy');
  const [reportSearch, setReportSearch] = useState('');

  // Leaflet map reference for Pedidos tab
  const adminMapContainerRef = useRef<HTMLDivElement>(null);
  const adminMapInstanceRef = useRef<L.Map | null>(null);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(loginUser, loginPass);
    if (!success) setLoginError(true);
  };

  // Initialize admin map in 'pedidos' tab
  useEffect(() => {
    if (!isAdminLogged || activeTab !== 'pedidos') return;
    if (!adminMapContainerRef.current) return;
    if (adminMapInstanceRef.current) {
      adminMapInstanceRef.current.invalidateSize();
      return;
    }

    const map = L.map(adminMapContainerRef.current, { zoomControl: false }).setView([-13.525, -71.975], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    repartidores.forEach((rep) => {
      const customIcon = L.divIcon({
        html: `
          <div style="background:#7e22ce; color:white; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; font-size:18px; border:2.5px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3);">
            🛵
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });
      L.marker([rep.lat, rep.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${rep.nombre}</b><br>Estado: ${rep.online ? 'En línea' : 'Desconectado'}`);
    });

    adminMapInstanceRef.current = map;

    return () => {
      if (adminMapInstanceRef.current) {
        adminMapInstanceRef.current.remove();
        adminMapInstanceRef.current = null;
      }
    };
  }, [isAdminLogged, activeTab, repartidores]);

  // If not logged in, render Admin Login screen
  if (!isAdminLogged) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-200 shadow-xl text-center">
          <div className="text-4xl mb-2">🦁</div>
          <h3 className="text-xl font-black text-purple-950 mb-1">Acceso Administrador</h3>
          <p className="text-xs text-slate-500 mb-6">LeoGas Cusco • Panel de Gestión Integral</p>

          <form onSubmit={handleLoginSubmit} className="space-y-3 text-left">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:outline-purple-800"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="admin123"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:outline-purple-800"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-bold">
                Usuario o contraseña incorrectos. (Prueba admin / admin123)
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-purple-800 hover:bg-purple-900 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-md cursor-pointer mt-2"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="mt-5 text-[11px] text-slate-400">
            Credenciales de prueba: <strong>admin</strong> / <strong>admin123</strong>
          </div>
        </div>
      </div>
    );
  }

  // Handle phone order creation
  const handleCreatePhoneOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = productos.find((p) => p.id === phoneProductoId);
    if (!prod) return;

    const total = prod.precio * phoneCantidad;
    createPedido({
      cliente: phoneCliente.trim() || 'Cliente Telefónico',
      direccion: phoneDireccion.trim() || 'Cusco (Por llamada)',
      tipoBalon: `${phoneCantidad}x ${prod.nombre}`,
      montoCobro: total.toFixed(2),
      metodoPago: phonePago,
      tipoComprobante: 'Boleta de Venta',
      repartidorId: phoneRepartidorId || undefined
    });

    setShowPhoneOrderModal(false);
    setPhoneCliente('');
    setPhoneDireccion('');
    alert('✔ Pedido registrado en el sistema exitosamente');
  };

  // Liquidation calculation
  const totalEfectivo = ventas
    .filter((v) => v.pago.toLowerCase().includes('efectivo'))
    .reduce((a, b) => a + b.total, 0);

  const totalDigital = ventas
    .filter((v) => v.pago.toLowerCase().includes('yape') || v.pago.toLowerCase().includes('plin'))
    .reduce((a, b) => a + b.total, 0);

  const totalCredito = ventas
    .filter((v) => v.pago.toLowerCase().includes('crédito') || v.pago.toLowerCase().includes('credito'))
    .reduce((a, b) => a + b.total, 0);

  const totalGlobal = ventas.reduce((a, b) => a + b.total, 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Fecha', 'Cliente', 'Productos', 'Total (S/)', 'Método Pago', 'Repartidor', 'Comprobante'];
    const rows = ventas.map((v) => [
      v.fecha,
      `"${v.cliente}"`,
      `"${v.productos}"`,
      v.total.toFixed(2),
      `"${v.pago}"`,
      `"${v.repartidorNombre || ''}"`,
      `"${v.comprobante || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_leogas_cusco_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Header of Admin Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-purple-900 flex items-center gap-2">
              <span>🦁</span>
              <span>Panel de Control LeoGas Cusco</span>
            </h2>
            <p className="text-xs text-slate-500">
              Gestión de pedidos, flota, clientes B2B y balance contable
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <a
            href={getPageUrl('index.html')}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            title="Abrir ventana de cliente en nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
            <span>Ventana Cliente ↗</span>
          </a>

          <a
            href={getPageUrl('repartidor.html')}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            title="Abrir ventana de repartidor en nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
            <span>Ventana Repartidor ↗</span>
          </a>

          <button
            type="button"
            onClick={adminLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Menu */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex-shrink-0 h-fit space-y-1 no-print`}
        >
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Módulos del Sistema
          </div>

          {[
            { id: 'pedidos', label: 'Pedidos y Flota', icon: Boxes },
            { id: 'b2b', label: 'Cartera B2B / Empresas', icon: Building2 },
            { id: 'liquidacion', label: 'Cierre de Caja & Créditos', icon: Receipt },
            { id: 'clientes', label: 'Clientes VIP', icon: Star },
            { id: 'accesorios', label: 'Válvulas y Accesorios', icon: Wrench },
            { id: 'productos', label: 'Balones y Precios', icon: Flame },
            { id: 'telefonos', label: 'Teléfonos de Contacto', icon: Phone },
            { id: 'gps', label: 'Repartidores & Flota', icon: Truck },
            { id: 'reportes', label: 'Reporte Contable', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold text-left transition cursor-pointer ${
                  isSel
                    ? 'bg-purple-100 text-purple-900 border border-purple-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSel ? 'text-purple-800' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: PEDIDOS Y FLOTA */}
          {activeTab === 'pedidos' && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setShowPhoneOrderModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer no-print"
              >
                <PhoneCall className="w-4 h-4" />
                <span>📞 Registrar Nuevo Pedido (Hogar, Llamada o Mayorista B2B)</span>
              </button>

              {/* Incoming Orders Box */}
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-black text-amber-900 text-sm sm:text-base flex items-center gap-2">
                    <span>🔔</span>
                    <span>Órdenes Entrantes (Web, Teléfono y Portal B2B)</span>
                  </h3>
                  <span className="bg-amber-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full">
                    {pedidos.filter((p) => p.estado === 'pendiente_asignacion').length} pendientes
                  </span>
                </div>

                <div className="space-y-3">
                  {pedidos.filter((p) => p.estado !== 'completado').length === 0 ? (
                    <p className="text-xs text-amber-700 font-semibold py-4 text-center">
                      No hay pedidos pendientes en este momento.
                    </p>
                  ) : (
                    pedidos
                      .filter((p) => p.estado !== 'completado')
                      .map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-white border border-yellow-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">
                                {ord.cliente}
                              </span>
                              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {ord.hora}
                              </span>
                            </div>
                            <p className="text-xs text-purple-950 font-extrabold mt-0.5">
                              {ord.tipoBalon} • Total: S/ {ord.montoCobro} ({ord.metodoPago})
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              📍 {ord.direccion || 'Cusco'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {ord.repartidorId ? (
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-bold">
                                  ASIGNADO A:
                                </span>
                                <span className="font-extrabold text-xs text-emerald-700">
                                  🛵 {ord.repartidorNombre} (Etapa {ord.etapa}/3)
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) assignPedido(ord.id, e.target.value);
                                  }}
                                  defaultValue=""
                                  className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold cursor-pointer"
                                >
                                  <option value="" disabled>
                                    Asignar Repartidor...
                                  </option>
                                  {repartidores
                                    .filter((r) => r.online)
                                    .map((rep) => (
                                      <option key={rep.id} value={rep.id}>
                                        🛵 {rep.nombre}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Fleet Sequence and GPS Map */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-black text-purple-900 text-base mb-3">
                  🛵 Secuencia de Flota y Entregas en Ruta
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {repartidores.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-xs text-slate-900">{rep.nombre}</strong>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rep.online
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {rep.online ? 'En Ruta' : 'Offline'}
                        </span>
                      </div>

                      {/* 3 Step sequence bar */}
                      <div className="flex h-5 rounded-md overflow-hidden bg-slate-200 gap-0.5 my-1.5 text-[9px] font-black text-white">
                        <div
                          className={`flex-1 flex items-center justify-center ${
                            rep.etapaSecuencia && rep.etapaSecuencia >= 1
                              ? 'bg-red-500 opacity-100'
                              : 'bg-slate-300 opacity-40'
                          }`}
                        >
                          1. CAMINO
                        </div>
                        <div
                          className={`flex-1 flex items-center justify-center ${
                            rep.etapaSecuencia && rep.etapaSecuencia >= 2
                              ? 'bg-amber-500 opacity-100'
                              : 'bg-slate-300 opacity-40'
                          }`}
                        >
                          2. PUERTA
                        </div>
                        <div
                          className={`flex-1 flex items-center justify-center ${
                            rep.etapaSecuencia && rep.etapaSecuencia >= 3
                              ? 'bg-emerald-600 opacity-100'
                              : 'bg-slate-300 opacity-40'
                          }`}
                        >
                          3. HECHO
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Últ. actualización: {rep.ultimaActualizacionSecuencia || 'Reciente'}
                      </span>
                    </div>
                  ))}
                </div>

                <h4 className="font-bold text-xs text-slate-700 mb-2">
                  📍 Monitoreo Satelital de Repartidores en Cusco:
                </h4>
                <div
                  ref={adminMapContainerRef}
                  className="w-full h-80 rounded-xl border border-slate-200 overflow-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CARTERA B2B */}
          {activeTab === 'b2b' && (
            <div className="space-y-6">
              {/* Add B2B Form */}
              <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5 shadow-xs">
                <h3 className="font-black text-amber-900 text-base mb-1">
                  🏢 Registro y Tarifario Especial de Empresas B2B
                </h3>
                <p className="text-xs text-amber-800 mb-4">
                  Configura restaurantes, pollerías y hoteles con precio pactado por balón de 45kg y condición de crédito.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      RUC (11 dígitos):
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={newB2bRuc}
                      onChange={(e) => setNewB2bRuc(e.target.value)}
                      placeholder="20601234567"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Razón Social:
                    </label>
                    <input
                      type="text"
                      value={newB2bRazon}
                      onChange={(e) => setNewB2bRazon(e.target.value)}
                      placeholder="Pollería El Tablón"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Precio Balón 45kg (S/):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={newB2bPrecio}
                      onChange={(e) => setNewB2bPrecio(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Condición de Pago:
                    </label>
                    <select
                      value={newB2bCondicion}
                      onChange={(e) => setNewB2bCondicion(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold cursor-pointer"
                    >
                      <option value="Crédito (A cuenta 15 días)">Crédito (15 días)</option>
                      <option value="Crédito (A cuenta 30 días)">Crédito (30 días)</option>
                      <option value="Factura al Contado">Factura al Contado</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newB2bRuc || newB2bRuc.length !== 11) {
                      alert('Ingresa un RUC de 11 dígitos.');
                      return;
                    }
                    addEmpresaB2B({
                      ruc: newB2bRuc.trim(),
                      razonSocial: newB2bRazon.trim() || 'Empresa B2B',
                      precioBalon45: newB2bPrecio,
                      condicionPago: newB2bCondicion
                    });
                    setNewB2bRuc('');
                    setNewB2bRazon('');
                    alert('✔ Empresa guardada en cartera B2B');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar Empresa en Cartera B2B</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-x-auto">
                <h4 className="font-black text-slate-900 text-sm mb-3">
                  Empresas y Restaurantes Registrados ({empresasB2B.length})
                </h4>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">RUC</th>
                      <th className="p-2.5">Razón Social</th>
                      <th className="p-2.5">Tarifa Balón 45kg</th>
                      <th className="p-2.5">Condición</th>
                      <th className="p-2.5">Dirección</th>
                      <th className="p-2.5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empresasB2B.map((emp) => (
                      <tr key={emp.ruc} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">{emp.ruc}</td>
                        <td className="p-2.5 font-black text-purple-950">{emp.razonSocial}</td>
                        <td className="p-2.5 font-extrabold text-emerald-700">
                          S/ {emp.precioBalon45.toFixed(2)}
                        </td>
                        <td className="p-2.5">{emp.condicionPago}</td>
                        <td className="p-2.5 text-slate-500">{emp.direccion || 'Cusco'}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => deleteEmpresaB2B(emp.ruc)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CIERRE DE CAJA / LIQUIDACION */}
          {activeTab === 'liquidacion' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6 printable-area">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-purple-950">
                    💵 Cierre de Caja, Créditos y Liquidación del Día
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control de dinero físico a rendir por repartidores y cuentas por cobrar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition no-print cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Liquidación</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    Efectivo a Rendir
                  </span>
                  <span className="text-xl font-black text-emerald-900 mt-1 block">
                    S/ {totalEfectivo.toFixed(2)}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">
                    Digital (Yape / Plin)
                  </span>
                  <span className="text-xl font-black text-blue-900 mt-1 block">
                    S/ {totalDigital.toFixed(2)}
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">
                    Créditos Mayoristas
                  </span>
                  <span className="text-xl font-black text-amber-900 mt-1 block">
                    S/ {totalCredito.toFixed(2)}
                  </span>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-purple-700 block">
                    Recaudación Total
                  </span>
                  <span className="text-xl font-black text-purple-950 mt-1 block">
                    S/ {totalGlobal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Breakdown by driver */}
              <div>
                <h4 className="font-extrabold text-xs uppercase text-slate-500 mb-2">
                  Rendición Detallada por Repartidor
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {repartidores.map((rep) => {
                    const ventasRep = ventas.filter((v) => v.repartidorId === rep.id);
                    const efec = ventasRep
                      .filter((v) => v.pago.toLowerCase().includes('efectivo'))
                      .reduce((a, b) => a + b.total, 0);
                    const dig = ventasRep
                      .filter((v) => v.pago.toLowerCase().includes('yape') || v.pago.toLowerCase().includes('plin'))
                      .reduce((a, b) => a + b.total, 0);

                    return (
                      <div
                        key={rep.id}
                        className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1.5"
                      >
                        <div className="flex justify-between items-center font-black text-purple-900 text-sm border-b border-slate-200 pb-1">
                          <span>🛵 {rep.nombre}</span>
                          <span>{ventasRep.length} entregas</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Efectivo en Mano:</span>
                          <strong className="text-emerald-700">S/ {efec.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Yape / Plin:</span>
                          <strong>S/ {dig.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between font-black text-purple-950 pt-1 border-t border-slate-200">
                          <span>Total Rendido:</span>
                          <span>S/ {(efec + dig).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLIENTES VIP */}
          {activeTab === 'clientes' && (
            <div className="space-y-6">
              {/* Add VIP */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-black text-purple-950 text-base mb-1">
                  ⭐ Registro de Cliente Preferencial VIP
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <input
                    type="text"
                    value={newVipNombre}
                    onChange={(e) => setNewVipNombre(e.target.value)}
                    placeholder="Nombre completo"
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={newVipDoc}
                    onChange={(e) => setNewVipDoc(e.target.value)}
                    placeholder="DNI / RUC"
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={newVipTel}
                    onChange={(e) => setNewVipTel(e.target.value)}
                    placeholder="Teléfono"
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={newVipDir}
                    onChange={(e) => setNewVipDir(e.target.value)}
                    placeholder="Dirección en Cusco"
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newVipNombre) return alert('Ingresa el nombre del cliente.');
                    addClienteVIP({
                      id: `vip-${Date.now()}`,
                      nombre: newVipNombre.trim(),
                      documento: newVipDoc.trim(),
                      telefono: newVipTel.trim(),
                      direccion: newVipDir.trim(),
                      pedidosTotales: 1
                    });
                    setNewVipNombre('');
                    setNewVipDoc('');
                    setNewVipTel('');
                    setNewVipDir('');
                    alert('✔ Cliente VIP registrado');
                  }}
                  className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar a Cartera VIP</span>
                </button>
              </div>

              {/* VIP Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Cliente</th>
                      <th className="p-2.5">Doc (DNI/RUC)</th>
                      <th className="p-2.5">Teléfono</th>
                      <th className="p-2.5">Dirección Frecuente</th>
                      <th className="p-2.5 text-center">Pedidos</th>
                      <th className="p-2.5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientesVIP.map((vip) => (
                      <tr key={vip.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-black text-purple-950 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{vip.nombre}</span>
                        </td>
                        <td className="p-2.5">{vip.documento || '---'}</td>
                        <td className="p-2.5 font-bold text-slate-700">{vip.telefono || '---'}</td>
                        <td className="p-2.5 text-slate-500">{vip.direccion}</td>
                        <td className="p-2.5 text-center font-extrabold text-purple-900">
                          {vip.pedidosTotales}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => deleteClienteVIP(vip.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ACCESORIOS */}
          {activeTab === 'accesorios' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-3">
                  🔧 Catálogo de Válvulas y Mangueras
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {accesorios.map((acc) => (
                    <div
                      key={acc.id}
                      className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <strong className="text-slate-900 text-xs block">{acc.nombre}</strong>
                        <span className="text-purple-800 font-black">S/ {acc.precio.toFixed(2)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nuevo = prompt(`Nuevo precio para ${acc.nombre}:`, acc.precio.toString());
                          if (nuevo && !isNaN(parseFloat(nuevo))) {
                            updateAccesorio({ ...acc, precio: parseFloat(nuevo) });
                          }
                        }}
                        className="bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Editar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BALONES Y PRECIOS */}
          {activeTab === 'productos' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-3">
                  📝 Catálogo Oficial de Balones Llamagas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productos.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between text-xs space-y-2"
                    >
                      <div>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1">
                          {prod.tag}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">{prod.nombre}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{prod.descripcion}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-base font-black text-purple-900">
                          S/ {prod.precio.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nuevo = prompt(`Nuevo precio para ${prod.nombre}:`, prod.precio.toString());
                            if (nuevo && !isNaN(parseFloat(nuevo))) {
                              updateProducto({ ...prod, precio: parseFloat(nuevo) });
                            }
                          }}
                          className="bg-purple-800 hover:bg-purple-900 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Modificar Tarifa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TELEFONOS */}
          {activeTab === 'telefonos' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs max-w-lg space-y-4">
              <h3 className="font-black text-slate-900 text-base">
                📞 Configuración de Líneas de Atención
              </h3>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Número de WhatsApp para Pedidos (con código de país 51):
                </label>
                <input
                  type="text"
                  value={telefonos.whatsapp}
                  onChange={(e) => updateTelefonos({ ...telefonos, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Teléfono Directo 1:
                </label>
                <input
                  type="text"
                  value={telefonos.tel1}
                  onChange={(e) => updateTelefonos({ ...telefonos, tel1: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Teléfono Directo 2:
                </label>
                <input
                  type="text"
                  value={telefonos.tel2}
                  onChange={(e) => updateTelefonos({ ...telefonos, tel2: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Central Fija Cusco (Opcional):
                </label>
                <input
                  type="text"
                  value={telefonos.tel3 || ''}
                  onChange={(e) => updateTelefonos({ ...telefonos, tel3: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs"
                />
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl">
                ✔ Los cambios se aplican automáticamente en la web y botones de llamada.
              </div>
            </div>
          )}

          {/* TAB 8: REPARTIDORES & GPS */}
          {activeTab === 'gps' && (
            <div className="space-y-6">
              {/* Add driver */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-black text-slate-900 text-base mb-1">
                  🛵 Añadir Repartidor a la Flota
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={newRepNombre}
                    onChange={(e) => setNewRepNombre(e.target.value)}
                    placeholder="Nombre completo (ej: Juan Pérez)"
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={newRepUser}
                    onChange={(e) => setNewRepUser(e.target.value)}
                    placeholder="Usuario de acceso (ej: juan)"
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                  <input
                    type="password"
                    value={newRepPass}
                    onChange={(e) => setNewRepPass(e.target.value)}
                    placeholder="Contraseña"
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newRepNombre) return alert('Ingresa el nombre.');
                    addRepartidor({
                      id: `rep-${Date.now()}`,
                      nombre: newRepNombre.trim(),
                      usuario: newRepUser.trim() || newRepNombre.toLowerCase().split(' ')[0],
                      password: newRepPass.trim() || '123',
                      online: true,
                      lat: -13.525,
                      lng: -71.975,
                      etapaSecuencia: 1
                    });
                    setNewRepNombre('');
                    setNewRepUser('');
                    alert('✔ Repartidor añadido con éxito');
                  }}
                  className="bg-purple-800 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Repartidor</span>
                </button>
              </div>

              {/* Fleet List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {repartidores.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between text-xs space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 text-sm block">🛵 {rep.nombre}</strong>
                          <span className="text-slate-500 text-[11px]">
                            Usuario: {rep.usuario || rep.nombre.toLowerCase()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleRepartidorOnline(rep.id)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer ${
                            rep.online
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {rep.online ? 'En Servicio' : 'Desconectado'}
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        GPS: {rep.lat.toFixed(4)}, {rep.lng.toFixed(4)}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            const newPass = prompt(`Nueva contraseña para ${rep.nombre}:`, rep.password);
                            if (newPass) updateRepartidor({ ...rep, password: newPass });
                          }}
                          className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 py-1 rounded text-center text-xs font-bold cursor-pointer"
                        >
                          Clave
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRepartidor(rep.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REPORTE CONTABLE */}
          {activeTab === 'reportes' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6 printable-area">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-purple-950">
                    📊 Libro Contable y Reporte de Ventas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registro de balones despachados y comprobantes emitidos en Cusco
                  </p>
                </div>

                <div className="flex gap-2 no-print">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Reporte</span>
                  </button>
                </div>
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap items-center gap-2 no-print">
                {(['hoy', '7dias', 'mes', 'todos'] as const).map((fil) => (
                  <button
                    key={fil}
                    type="button"
                    onClick={() => setReportFilter(fil)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      reportFilter === fil
                        ? 'bg-purple-800 text-white border-purple-800 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fil === 'hoy'
                      ? 'Hoy'
                      : fil === '7dias'
                      ? 'Últimos 7 Días'
                      : fil === 'mes'
                      ? 'Este Mes'
                      : 'Todos'}
                  </button>
                ))}

                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Buscar por cliente o comprobante..."
                  className="ml-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              {/* Sales Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5">Cliente</th>
                      <th className="p-2.5">Productos</th>
                      <th className="p-2.5">Método de Pago</th>
                      <th className="p-2.5">Repartidor</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ventas
                      .filter(
                        (v) =>
                          !reportSearch ||
                          v.cliente.toLowerCase().includes(reportSearch.toLowerCase()) ||
                          v.productos.toLowerCase().includes(reportSearch.toLowerCase())
                      )
                      .map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-500">{v.fecha}</td>
                          <td className="p-2.5 font-black text-purple-950">{v.cliente}</td>
                          <td className="p-2.5 text-slate-700">{v.productos}</td>
                          <td className="p-2.5">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {v.pago}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {v.repartidorNombre || '---'}
                          </td>
                          <td className="p-2.5 text-right font-black text-purple-900 text-sm">
                            S/ {v.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Phone order modal */}
      {showPhoneOrderModal && (
        <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-purple-950 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>Registrar Pedido Telefónico</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPhoneOrderModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePhoneOrder} className="space-y-3">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Nombre del Cliente:</label>
                <input
                  type="text"
                  value={phoneCliente}
                  onChange={(e) => setPhoneCliente(e.target.value)}
                  placeholder="Ej: Rosa Quispe"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Dirección de Entrega:</label>
                <input
                  type="text"
                  value={phoneDireccion}
                  onChange={(e) => setPhoneDireccion(e.target.value)}
                  placeholder="Ej: Calle Garcilaso 210, Cusco"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Producto:</label>
                  <select
                    value={phoneProductoId}
                    onChange={(e) => setPhoneProductoId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (S/ {p.precio})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Cantidad:</label>
                  <input
                    type="number"
                    min={1}
                    value={phoneCantidad}
                    onChange={(e) => setPhoneCantidad(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Método de Pago:</label>
                  <select
                    value={phonePago}
                    onChange={(e) => setPhonePago(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Crédito B2B">Crédito B2B</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Asignar Repartidor:</label>
                  <select
                    value={phoneRepartidorId}
                    onChange={(e) => setPhoneRepartidorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold cursor-pointer"
                  >
                    <option value="">Por asignar</option>
                    {repartidores.map((r) => (
                      <option key={r.id} value={r.id}>
                        🛵 {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition shadow-md cursor-pointer mt-4"
              >
                Registrar y Notificar Flota
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
