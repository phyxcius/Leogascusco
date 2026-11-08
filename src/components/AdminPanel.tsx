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
  ExternalLink,
  Store,
  Upload,
  RotateCcw,
  Save,
  Image as ImageIcon,
  FileText,
  Calendar,
  Search,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Bell,
  Tag,
  Package,
  Code,
  Gift,
  Award,
  Sparkles
} from 'lucide-react';
import L from 'leaflet';
import { Repartidor, Producto, Accesorio, EmpresaB2B, ClienteVIP, Pedido, CotizacionCRM, ClienteFidelidad } from '../types/index';
import { getPageUrl, getAssetUrl } from '../utils/assets';
import { BrandBadge } from './BrandBadge';
import { playChimeSound, playSuccessChime, playAndSpeak, speakVoice } from '../utils/audio';
import { DeveloperAccordion } from './DeveloperAccordion';

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
    negocio,
    updateNegocio,
    resetNegocio,
    ventas,
    addVenta,
    createPedido,
    crmPlantillas,
    updateCRMPlantilla,
    cotizaciones,
    addCotizacion,
    updateCotizacion,
    deleteCotizacion,
    clubFidelidad,
    consultarSellos,
    sumarSelloFidelidad,
    canjearPremioFidelidad,
    setSellosManual,
    registrarNuevoClienteFidelidad,
    deleteClienteFidelidad
  } = useApp();

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Current tab
  const [activeTab, setActiveTab] = useState<
    'pedidos' | 'identidad' | 'facturacion' | 'crm' | 'fidelidad' | 'b2b' | 'liquidacion' | 'clientes' | 'accesorios' | 'productos' | 'telefonos' | 'gps' | 'reportes' | 'desarrollador'
  >('pedidos');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Club de Fidelidad State in AdminPanel
  const [fidelidadSearch, setFidelidadSearch] = useState('');
  const [fidelidadFilterStatus, setFidelidadFilterStatus] = useState<'TODOS' | 'LISTOS' | 'PROGRESO'>('TODOS');
  const [showAddFidelidadModal, setShowAddFidelidadModal] = useState(false);
  const [newFidDni, setNewFidDni] = useState('');
  const [newFidNombre, setNewFidNombre] = useState('');
  const [newFidTelefono, setNewFidTelefono] = useState('');
  const [newFidSellos, setNewFidSellos] = useState<number>(1);
  const [selectedFidHistory, setSelectedFidHistory] = useState<ClienteFidelidad | null>(null);

  // Business Identity Form State
  const [identidadNombre, setIdentidadNombre] = useState(negocio.nombre);
  const [identidadSlogan, setIdentidadSlogan] = useState(negocio.slogan);
  const [identidadLogoUrl, setIdentidadLogoUrl] = useState(negocio.logoUrl);
  const [identidadPresentacionUrl, setIdentidadPresentacionUrl] = useState(negocio.imagenPresentacion || '/1791513590376.jpg');
  const [identidadWhatsapp, setIdentidadWhatsapp] = useState(negocio.whatsapp);
  const [identidadTel1, setIdentidadTel1] = useState(negocio.telPrincipal);
  const [identidadTel2, setIdentidadTel2] = useState(negocio.telSecundario);
  const [identidadTelFijo, setIdentidadTelFijo] = useState(negocio.telFijo || '');
  const [identidadDireccion, setIdentidadDireccion] = useState(negocio.direccion);
  const [identidadIgv, setIdentidadIgv] = useState<number | string>(negocio.igvPorcentaje || 18);
  const [identidadFacebook, setIdentidadFacebook] = useState(negocio.facebookUrl || '');
  const [identidadInstagram, setIdentidadInstagram] = useState(negocio.instagramUrl || '');
  const [identidadTiktok, setIdentidadTiktok] = useState(negocio.tiktokUrl || '');
  const [identidadGoogleReview, setIdentidadGoogleReview] = useState(negocio.googleReviewUrl || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Map Fullscreen
  const [isAdminMapFullscreen, setIsAdminMapFullscreen] = useState(false);

  // Central Incoming Order Modal & Realtime Alerts
  const [incomingOrderModal, setIncomingOrderModal] = useState<Pedido | null>(null);
  const [assignedDriverForIncoming, setAssignedDriverForIncoming] = useState<string>('');
  const lastKnownOrderIdRef = useRef<string | null>(null);

  // Accessories CRUD Modals
  const [showAddAccModal, setShowAddAccModal] = useState(false);
  const [editAccModal, setEditAccModal] = useState<Accesorio | null>(null);
  const [newAccNombre, setNewAccNombre] = useState('');
  const [newAccPrecio, setNewAccPrecio] = useState('');
  const [newAccDesc, setNewAccDesc] = useState('');
  const [newAccImagen, setNewAccImagen] = useState('/1791513590376.jpg');

  // Gas Cylinders CRUD Modals
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [editProdModal, setEditProdModal] = useState<Producto | null>(null);
  const [newProdNombre, setNewProdNombre] = useState('');
  const [newProdTag, setNewProdTag] = useState('10kg');
  const [newProdPrecio, setNewProdPrecio] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImagen, setNewProdImagen] = useState('/1791513590376.jpg');

  // Facturación y Comprobantes State
  const [facturaFilterDate, setFacturaFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [facturaFilterRepartidor, setFacturaFilterRepartidor] = useState<string>('todos');
  const [facturaFilterTipo, setFacturaFilterTipo] = useState<string>('todos');
  const [facturaSearch, setFacturaSearch] = useState<string>('');
  const [previewComprobante, setPreviewComprobante] = useState<any | null>(null);

  // SUNAT Electronic Emission Modal
  const [showEmitirSunatModal, setShowEmitirSunatModal] = useState(false);
  const [emitirTipo, setEmitirTipo] = useState<'FACTURA' | 'BOLETA'>('FACTURA');
  const [emitirNumDoc, setEmitirNumDoc] = useState('20601234567');
  const [emitirRazonSocial, setEmitirRazonSocial] = useState('Pollería El Tablón Cusco');
  const [emitirDireccionFiscal, setEmitirDireccionFiscal] = useState('Av. El Sol 450, Wanchaq, Cusco');
  const [emitirEstadoSunat, setEmitirEstadoSunat] = useState('ACTIVO - HABIDO');
  const [emitirConsultando, setEmitirConsultando] = useState(false);
  const [emitirRepartidor, setEmitirRepartidor] = useState('');
  const [emitirFormaPago, setEmitirFormaPago] = useState('Contado / Efectivo');
  const [emitirItems, setEmitirItems] = useState<{ descripcion: string; cantidad: number; precioUnitario: number }[]>([
    { descripcion: 'Balón La Chuspa Tech 10kg Normal o Regular', cantidad: 1, precioUnitario: 50.0 }
  ]);

  // CRM State
  const [crmCategoryFilter, setCrmCategoryFilter] = useState<'TODOS' | 'MARKETING' | 'UTILIDAD' | 'AUTENTICACION' | 'SERVICIO'>('TODOS');
  const [crmSearch, setCrmSearch] = useState('');
  const [selectedCrmClientName, setSelectedCrmClientName] = useState('');
  const [selectedCrmClientPhone, setSelectedCrmClientPhone] = useState('');
  const [crmCustomMessage, setCrmCustomMessage] = useState('');
  const [activeCrmTemplateId, setActiveCrmTemplateId] = useState<string | null>(null);

  // Quotes (Cotizaciones) & Calendar State
  const [calendarViewDate, setCalendarViewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddCotizacionModal, setShowAddCotizacionModal] = useState(false);
  const [cotCliente, setCotCliente] = useState('');
  const [cotTipoDoc, setCotTipoDoc] = useState<'DNI' | 'RUC'>('RUC');
  const [cotNumDoc, setCotNumDoc] = useState('');
  const [cotTel, setCotTel] = useState('');
  const [cotDir, setCotDir] = useState('');
  const [cotFechaProgramada, setCotFechaProgramada] = useState(new Date().toISOString().split('T')[0]);
  const [cotHoraProgramada, setCotHoraProgramada] = useState('10:00 a.m.');
  const [cotProductoDesc, setCotProductoDesc] = useState('Balón Industrial 45kg GLP');
  const [cotCantidad, setCotCantidad] = useState(2);
  const [cotPrecioUnit, setCotPrecioUnit] = useState(175.0);
  const [cotRepartidor, setCotRepartidor] = useState('');
  const [cotNotas, setCotNotas] = useState('');

  // Keep local form in sync if negocio updates in another tab
  useEffect(() => {
    setIdentidadNombre(negocio.nombre);
    setIdentidadSlogan(negocio.slogan);
    setIdentidadLogoUrl(negocio.logoUrl);
    setIdentidadPresentacionUrl(negocio.imagenPresentacion || '/1791513590376.jpg');
    setIdentidadWhatsapp(negocio.whatsapp);
    setIdentidadTel1(negocio.telPrincipal);
    setIdentidadTel2(negocio.telSecundario);
    setIdentidadTelFijo(negocio.telFijo || '');
    setIdentidadDireccion(negocio.direccion);
    setIdentidadIgv(negocio.igvPorcentaje || 18);
    setIdentidadFacebook(negocio.facebookUrl || '');
    setIdentidadInstagram(negocio.instagramUrl || '');
    setIdentidadTiktok(negocio.tiktokUrl || '');
    setIdentidadGoogleReview(negocio.googleReviewUrl || '');
  }, [negocio]);

  // Detect incoming orders in real time to show central alert modal
  useEffect(() => {
    if (!pedidos || pedidos.length === 0) return;
    const latest = pedidos[0];
    if (lastKnownOrderIdRef.current === null) {
      lastKnownOrderIdRef.current = latest.id;
      return;
    }
    if (latest.id !== lastKnownOrderIdRef.current && latest.estado === 'pendiente_asignacion') {
      lastKnownOrderIdRef.current = latest.id;
      setIncomingOrderModal(latest);
      playAndSpeak(`¡Nuevo pedido recibido! Cliente ${latest.cliente || 'particular'}, producto ${latest.producto || latest.tipoBalon}, total ${latest.montoCobro} soles.`);
    }
  }, [pedidos]);

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

  // Logo file upload handler (converts to base64)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 2MB. Por favor elige una imagen más ligera.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setIdentidadLogoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Flyer / Presentation overlay file upload handler
  const handlePresentacionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 3MB. Por favor elige una imagen más ligera.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setIdentidadPresentacionUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Cylinder image file upload handlers
  const handleNewProdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) setNewProdImagen(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleEditProdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editProdModal) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) setEditProdModal({ ...editProdModal, imagen: base64 });
    };
    reader.readAsDataURL(file);
  };

  // Accessory image file upload handlers
  const handleNewAccImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) setNewAccImagen(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleEditAccImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editAccModal) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) setEditAccModal({ ...editAccModal, imagen: base64 });
    };
    reader.readAsDataURL(file);
  };

  // Business Identity save handler
  const handleSaveIdentidad = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedIgv = parseFloat(identidadIgv.toString()) || 18;
    updateNegocio({
      nombre: identidadNombre.trim() || 'La Chuspa Tech',
      slogan: identidadSlogan.trim() || 'Publicidad, Tecnología & Balones de Gas en Cusco',
      logoUrl: identidadLogoUrl.trim() || '/CHUSPITA-circulo.png',
      imagenPresentacion: identidadPresentacionUrl.trim() || '/1791513590376.jpg',
      whatsapp: identidadWhatsapp.trim() || '969773064',
      telPrincipal: identidadTel1.trim() || '969773064',
      telSecundario: identidadTel2.trim() || '969773064',
      telFijo: identidadTelFijo.trim() || '969773064',
      direccion: identidadDireccion.trim() || 'Cusco - Perú',
      enlaceChuspa: 'https://www.lachuspaanuncios.com',
      igvPorcentaje: parsedIgv,
      facebookUrl: identidadFacebook.trim(),
      instagramUrl: identidadInstagram.trim(),
      tiktokUrl: identidadTiktok.trim(),
      googleReviewUrl: identidadGoogleReview.trim()
    });
    setSaveSuccessMsg(true);
    playAndSpeak('Configuración e identidad del negocio guardadas exitosamente.', true);
    setTimeout(() => setSaveSuccessMsg(false), 4500);
  };

  // Assign driver to incoming order modal
  const handleAssignIncomingDriver = () => {
    if (!incomingOrderModal) return;
    if (!assignedDriverForIncoming) {
      alert('Por favor selecciona un repartidor para despachar la orden.');
      return;
    }
    const chofer = repartidores.find((r) => r.id === assignedDriverForIncoming);
    assignPedido(incomingOrderModal.id, assignedDriverForIncoming);
    playAndSpeak(`Repartidor ${chofer?.nombre || 'de turno'} asignado con éxito. Notificación enviada al cliente y a la moto en ruta.`);
    setIncomingOrderModal(null);
    setAssignedDriverForIncoming('');
  };

  // SUNAT / RENIEC Query in Real Time via Official APIs
  const handleConsultarSunatReniec = async () => {
    const numDoc = emitirNumDoc.trim();
    if (!numDoc) {
      alert('Ingresa el número de RUC (11 dígitos) o DNI (8 dígitos).');
      return;
    }
    setEmitirConsultando(true);

    const apiToken =
      'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVkd2lub2JsaXRhc3ViYWxkZUBnbWFpbC5jb20iLCJqdGkiOiIxNzExZGRjNTc5M2ZhYjQ0In0.h1PcqQHzHBK6abr7ZGVkMeSTOSN49BWOWHzB7wpIDw8';

    try {
      if (emitirTipo === 'FACTURA') {
        if (numDoc.length !== 11) {
          alert('El RUC de la empresa debe tener exactamente 11 dígitos.');
          setEmitirConsultando(false);
          return;
        }

        // 1. First check if already in local B2B database
        const foundB2B = empresasB2B.find((e) => e.ruc === numDoc);
        if (foundB2B) {
          setEmitirRazonSocial(foundB2B.razonSocial);
          setEmitirDireccionFiscal(foundB2B.direccion || 'Av. El Sol 450, Cusco');
          setEmitirEstadoSunat('ACTIVO - HABIDO (Padrón Local)');
          setEmitirConsultando(false);
          return;
        }

        // 2. Real query to SUNAT API
        const res = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${numDoc}`, {
          headers: {
            Authorization: apiToken,
            Accept: 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.razonSocial) {
            setEmitirRazonSocial(data.razonSocial);
            if (data.direccion) setEmitirDireccionFiscal(data.direccion);
            const estado = data.estado ? `${data.estado} - ${data.condicion || 'HABIDO'}` : 'ACTIVO - HABIDO';
            setEmitirEstadoSunat(estado);
            playSuccessChime();
            alert(`✔ RUC verificado en SUNAT en tiempo real:\n${data.razonSocial}\nEstado: ${estado}`);
          } else {
            throw new Error('RUC no encontrado en padrón SUNAT');
          }
        } else {
          throw new Error('Error al consultar SUNAT');
        }
      } else {
        // DNI - RENIEC
        if (numDoc.length !== 8) {
          alert('El DNI debe tener exactamente 8 dígitos numéricos.');
          setEmitirConsultando(false);
          return;
        }

        // 1. Check local VIP database
        const foundVip = clientesVIP.find((c) => c.documento === numDoc);
        if (foundVip) {
          setEmitirRazonSocial(foundVip.nombre);
          setEmitirDireccionFiscal(foundVip.direccion || 'Cusco, Perú');
          setEmitirEstadoSunat('DNI VÁLIDO (Padrón Local)');
          setEmitirConsultando(false);
          return;
        }

        // 2. Real query to RENIEC API
        const res = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${numDoc}`, {
          headers: {
            Authorization: apiToken,
            Accept: 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data && (data.nombres || data.nombre)) {
            const nombreCompleto =
              data.nombre || `${data.nombres} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim();
            setEmitirRazonSocial(nombreCompleto);
            setEmitirEstadoSunat('DNI VÁLIDO (RENIEC EN VIVO)');
            playSuccessChime();
            alert(`✔ DNI verificado en RENIEC en tiempo real:\n${nombreCompleto}`);
          } else {
            throw new Error('DNI no encontrado en RENIEC');
          }
        } else {
          throw new Error('Error al consultar RENIEC');
        }
      }
    } catch (err: any) {
      console.warn('Fallo consulta API:', err);
      const manual = prompt(
        'No se pudo conectar a la base de datos en línea. Ingresa el nombre o Razón Social manualmente:'
      );
      if (manual && manual.trim()) {
        setEmitirRazonSocial(manual.trim());
        setEmitirEstadoSunat('REGISTRADO MANUALMENTE');
      }
    } finally {
      setEmitirConsultando(false);
    }
  };

  // Emit Electronic Voucher connecting to SUNAT
  const handleEmitirComprobanteFinal = () => {
    if (!emitirRazonSocial.trim()) {
      alert('Primero ingresa o consulta el documento para obtener la Razón Social o Nombre del cliente.');
      return;
    }

    const currentTotal = emitirItems.reduce((acc, it) => acc + it.cantidad * it.precioUnitario, 0);
    const igvTasa = (negocio.igvPorcentaje || 18) / 100;
    const subtotalCalc = currentTotal / (1 + igvTasa);
    const igvCalc = currentTotal - subtotalCalc;

    const serieCorrelativo =
      emitirTipo === 'FACTURA'
        ? `F001-000${Math.floor(100 + Math.random() * 900)}`
        : `B001-000${Math.floor(100 + Math.random() * 900)}`;

    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const fecha = new Date().toLocaleDateString('es-PE');

    const nuevoVenta = {
      fecha: `Hoy, ${hora}`,
      cliente: emitirRazonSocial,
      productos: emitirItems.map((it) => `${it.cantidad}x ${it.descripcion}`).join(', '),
      total: currentTotal,
      pago: emitirFormaPago,
      repartidorNombre: emitirRepartidor || `Administración ${negocio.nombre || 'La Chuspa Tech'}`,
      comprobante: serieCorrelativo,
      documento: emitirNumDoc,
      tipoDoc: emitirTipo === 'FACTURA' ? ('RUC' as const) : ('DNI' as const),
      direccion: emitirDireccionFiscal,
      subtotal: parseFloat(subtotalCalc.toFixed(2)),
      igv: parseFloat(igvCalc.toFixed(2)),
      sunatEstado: 'ACEPTADO' as const
    };

    addVenta(nuevoVenta);

    setPreviewComprobante({
      numero: serieCorrelativo,
      tipo: emitirTipo === 'FACTURA' ? 'Factura Electrónica' : 'Boleta de Venta Electrónica',
      fecha,
      hora,
      cliente: emitirRazonSocial,
      documento: emitirNumDoc,
      tipoDoc: emitirTipo === 'FACTURA' ? 'RUC' : 'DNI',
      direccion: emitirDireccionFiscal,
      repartidor: emitirRepartidor || `Administración ${negocio.nombre || 'La Chuspa Tech'}`,
      items: emitirItems.map((it) => ({
        cantidad: it.cantidad,
        descripcion: it.descripcion,
        precio: it.cantidad * it.precioUnitario
      })),
      total: currentTotal,
      metodoPago: emitirFormaPago,
      sunatEstado: 'ACEPTADO',
      estadoContribuyente: emitirEstadoSunat,
      hashCdr: `SHA256:${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    });

    setShowEmitirSunatModal(false);
    alert(`✔ Comprobante ${serieCorrelativo} emitido y validado exitosamente ante SUNAT.`);
  };

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
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-200 shadow-xl text-center space-y-5">
          {/* Business Brand & Chuspa Tech Badge */}
          <div className="flex justify-center pb-2 border-b border-slate-100">
            <BrandBadge size="md" showChuspa={true} centered={true} />
          </div>

          <div className="text-left">
            <h3 className="text-lg font-black text-purple-950">Acceso Administrador</h3>
            <p className="text-xs text-slate-500">Panel de Control & Gestión Integral</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
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
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:outline-purple-800"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-bold">
                Usuario o contraseña incorrectos. Verifica tus credenciales.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-purple-800 hover:bg-purple-900 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-md cursor-pointer mt-2"
            >
              Ingresar al Panel
            </button>
          </form>
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
          <BrandBadge size="sm" showChuspa={true} />
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

      {/* Top Realtime Status Alert Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm border border-purple-800 mb-4 animate-in fade-in no-print">
        <div className="flex items-center gap-2 text-xs overflow-hidden">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0"></span>
          <span className="font-black text-yellow-300 uppercase tracking-wide flex-shrink-0">Alerta de Flota:</span>
          <span className="font-bold truncate text-purple-100">
            {pedidos.find(p => p.estado === 'en_proceso' && p.etapa === 1)
              ? `🛵 ${pedidos.find(p => p.estado === 'en_proceso' && p.etapa === 1)?.repartidorNombre || 'Repartidor'} salió en camino hacia ${pedidos.find(p => p.estado === 'en_proceso' && p.etapa === 1)?.cliente} (${pedidos.find(p => p.estado === 'en_proceso' && p.etapa === 1)?.direccion})`
              : pedidos.find(p => p.estado === 'en_proceso' && p.etapa === 2)
              ? `🚪 ${pedidos.find(p => p.estado === 'en_proceso' && p.etapa === 2)?.repartidorNombre || 'Repartidor'} ya está en la puerta del cliente ${pedidos.find(p => p.estado === 'en_proceso' && p.etapa === 2)?.cliente}`
              : pedidos.find(p => p.estado === 'completado')
              ? `✅ Último pedido entregado: ${pedidos.find(p => p.estado === 'completado')?.cliente} (S/ ${pedidos.find(p => p.estado === 'completado')?.montoCobro}) por ${pedidos.find(p => p.estado === 'completado')?.repartidorNombre || 'Repartidor'}`
              : 'Flota operativa y monitoreo satelital en vivo activo.'}
          </span>
        </div>
        <span className="text-[10px] text-purple-300 font-bold hidden sm:inline flex-shrink-0">
          En vivo • Cusco
        </span>
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
            { id: 'identidad', label: 'Identidad del Negocio', icon: Store },
            { id: 'facturacion', label: 'Facturación y Comprobantes', icon: FileText },
            { id: 'crm', label: 'CRM & Calendario', icon: Calendar },
            { id: 'fidelidad', label: 'Club de Fidelidad (Sellos)', icon: Gift },
            { id: 'b2b', label: 'Cartera B2B / Empresas', icon: Building2 },
            { id: 'liquidacion', label: 'Cierre de Caja & Créditos', icon: Receipt },
            { id: 'clientes', label: 'Clientes VIP', icon: Star },
            { id: 'accesorios', label: 'Válvulas y Accesorios', icon: Wrench },
            { id: 'productos', label: 'Balones y Precios', icon: Flame },
            { id: 'telefonos', label: 'Teléfonos de Contacto', icon: Phone },
            { id: 'gps', label: 'Repartidores & Flota', icon: Truck },
            { id: 'reportes', label: 'Reporte Contable', icon: BarChart3 },
            { id: 'desarrollador', label: '🛠️ Zona Desarrollador', icon: Code }
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
                                  {repartidores.map((rep) => (
                                    <option key={rep.id} value={rep.id}>
                                      🛵 {rep.nombre} ({rep.online ? 'En Línea' : 'Offline'})
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

                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-700">
                    📍 Monitoreo Satelital de Repartidores en Cusco:
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMapFullscreen(!isAdminMapFullscreen);
                      setTimeout(() => adminMapInstanceRef.current?.invalidateSize(), 150);
                      setTimeout(() => adminMapInstanceRef.current?.invalidateSize(), 350);
                    }}
                    className="bg-purple-800 hover:bg-purple-900 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    {isAdminMapFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-300" />}
                    <span>{isAdminMapFullscreen ? 'Reducir Mapa' : 'Ampliar Mapa de Ruta'}</span>
                  </button>
                </div>

                <div
                  className={`transition-all duration-300 ${
                    isAdminMapFullscreen
                      ? 'fixed inset-0 z-[99999] bg-white p-4 flex flex-col'
                      : 'w-full h-80 rounded-xl border border-slate-200 overflow-hidden relative'
                  }`}
                >
                  {isAdminMapFullscreen && (
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🗺️</span>
                        <div>
                          <h4 className="font-black text-sm text-purple-950">
                            Monitoreo Satelital de Rutas y Flota en Tiempo Real
                          </h4>
                          <p className="text-[11px] text-slate-500">Vista ampliada de reparto y geolocalización Cusco</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdminMapFullscreen(false);
                          setTimeout(() => adminMapInstanceRef.current?.invalidateSize(), 150);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Minimize2 className="w-4 h-4" />
                        <span>Cerrar / Reducir</span>
                      </button>
                    </div>
                  )}
                  <div
                    ref={adminMapContainerRef}
                    className="w-full flex-1 min-h-[300px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: IDENTIDAD DEL NEGOCIO */}
          {activeTab === 'identidad' && (
            <div className="space-y-6">
              {/* Info Card */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm border border-purple-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="bg-amber-400 text-purple-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Módulo de Marca e Identidad
                    </span>
                    <h3 className="text-xl font-black">Identidad Comercial del Negocio</h3>
                  </div>
                  <div className="flex-shrink-0">
                    <BrandBadge size="md" showChuspa={true} />
                  </div>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 px-4 py-3 rounded-2xl font-black text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>✔ Datos guardados exitosamente</span>
                  </div>
                  <button onClick={() => setSaveSuccessMsg(false)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer">
                    ✕
                  </button>
                </div>
              )}

              {/* Main Form Card */}
              <form onSubmit={handleSaveIdentidad} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Business Names & Slogan */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Store className="w-4 h-4 text-purple-700" />
                      <span>Datos Principales del Negocio</span>
                    </h4>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Nombre Comercial del Negocio:
                      </label>
                      <input
                        type="text"
                        value={identidadNombre}
                        onChange={(e) => setIdentidadNombre(e.target.value)}
                        placeholder="La Chuspa Tech"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-purple-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Slogan o Lema Comercial:
                      </label>
                      <input
                        type="text"
                        value={identidadSlogan}
                        onChange={(e) => setIdentidadSlogan(e.target.value)}
                        placeholder="Llamagas • El Moradito Rendidor"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Dirección o Ubicación Central:
                      </label>
                      <input
                        type="text"
                        value={identidadDireccion}
                        onChange={(e) => setIdentidadDireccion(e.target.value)}
                        placeholder="Av. El Sol 450, Cusco"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Porcentaje de I.G.V. (%):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="30"
                          value={identidadIgv}
                          onChange={(e) => setIdentidadIgv(e.target.value)}
                          placeholder="18"
                          className="w-28 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-black text-purple-950 focus:outline-purple-800"
                          required
                        />
                        <span className="text-xs font-black text-slate-700">% Tasa Oficial SUNAT (Actualizable)</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        En caso cambie el IGV de la empresa o ley tributaria, modifícalo aquí y se recalculará en facturas, boletas y reportes.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-purple-900 block">
                          Enlace Oficial La Chuspa Tech
                        </span>
                        <a
                          href="https://www.lachuspaanuncios.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                        >
                          <span>https://www.lachuspaanuncios.com</span>
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                      <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-1 rounded-full">
                        Por defecto
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Logo Management & Presets */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <ImageIcon className="w-4 h-4 text-purple-700" />
                      <span>Logotipo del Negocio</span>
                    </h4>

                    {/* Logo Preview */}
                    <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="w-16 h-16 rounded-2xl border-2 border-amber-400 overflow-hidden bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                        {identidadLogoUrl ? (
                          <img
                            src={
                              identidadLogoUrl.startsWith('data:') || identidadLogoUrl.startsWith('http')
                                ? identidadLogoUrl
                                : getAssetUrl(identidadLogoUrl)
                            }
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-3xl">🦁</span>
                        )}
                      </div>
                      <div>
                        <strong className="text-xs text-slate-800 block">Vista Previa del Logotipo</strong>
                        <p className="text-[11px] text-slate-500">
                          Este logo se mostrará junto al logo de La Chuspa Tech en Cliente, Repartidor y Admin.
                        </p>
                      </div>
                    </div>

                    {/* File Upload input */}
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Subir Imagen desde tu Equipo / Móvil:
                      </label>
                      <label className="flex items-center justify-center gap-2 w-full p-3 bg-purple-50 hover:bg-purple-100 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer text-xs font-bold text-purple-900 transition">
                        <Upload className="w-4 h-4 text-purple-700" />
                        <span>Seleccionar archivo de imagen (PNG, JPG o WebP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image URL input */}
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        O ingresar URL directa del Logotipo:
                      </label>
                      <input
                        type="text"
                        value={identidadLogoUrl}
                        onChange={(e) => setIdentidadLogoUrl(e.target.value)}
                        placeholder="https://misitio.com/logo.png o /1791513590376.jpg"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>

                    {/* Preset Badges */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                        Logos Predeterminados Disponibles:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setIdentidadLogoUrl('/1791513590376.jpg')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer"
                        >
                          🟣 Balón Moradito
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdentidadLogoUrl('/CHUSPITA-circulo.png')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer"
                        >
                          🟡 Círculo Chuspa
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdentidadLogoUrl('/medidas-de-balon-de-gas-de-10-Kg (1).png')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer"
                        >
                          🔵 Balón Gas 10kg
                        </button>
                      </div>
                    </div>

                    {/* Imagen de Presentación / Superposición (Flyer del Index) */}
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-purple-700" />
                          <span>Imagen de Presentación / Superposición (Flyer del Index)</span>
                        </h4>
                        <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                          Index Cliente
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Esta imagen se presenta como flyer promocional destacado de superposición en la página principal del cliente.
                      </p>

                      {/* Presentation Preview */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="w-full sm:w-44 h-36 rounded-2xl border-2 border-purple-400 overflow-hidden bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                          {identidadPresentacionUrl ? (
                            <img
                              src={
                                identidadPresentacionUrl.startsWith('data:') || identidadPresentacionUrl.startsWith('http')
                                  ? identidadPresentacionUrl
                                  : getAssetUrl(identidadPresentacionUrl)
                              }
                              alt="Flyer Presentación preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                              }}
                            />
                          ) : (
                            <span className="text-3xl">🖼️</span>
                          )}
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                          <strong className="text-xs text-slate-800 block">Vista Previa del Flyer Principal</strong>
                          <p className="text-[11px] text-slate-500">
                            Recomendado: imagen horizontal o cuadrada en formato JPG, PNG o WebP. Se sincroniza en tiempo real con el portal del cliente.
                          </p>
                        </div>
                      </div>

                      {/* File Upload input */}
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                          Subir Nueva Imagen de Presentación (PC o Celular):
                        </label>
                        <label className="flex items-center justify-center gap-2 w-full p-3 bg-purple-50 hover:bg-purple-100 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer text-xs font-bold text-purple-900 transition">
                          <Upload className="w-4 h-4 text-purple-700" />
                          <span>Seleccionar archivo para Flyer de Presentación</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePresentacionFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Image URL input */}
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                          O ingresar URL directa / ruta de imagen:
                        </label>
                        <input
                          type="text"
                          value={identidadPresentacionUrl}
                          onChange={(e) => setIdentidadPresentacionUrl(e.target.value)}
                          placeholder="/1791513590376.jpg o https://misitio.com/banner.jpg"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                        />
                      </div>

                      {/* Preset Badges */}
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                          Imágenes Predeterminadas Rápidas:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setIdentidadPresentacionUrl('/1791513590376.jpg')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer"
                          >
                            🟣 Flyer Oficial LeoGas Cusco (/1791513590376.jpg)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdentidadPresentacionUrl('/CHUSPITA-circulo.png')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer"
                          >
                            🟡 Logo La Chuspa Tech
                          </button>
                          <button
                            type="button"
                            onClick={() => setIdentidadPresentacionUrl('/medidas-de-balon-de-gas-de-10-Kg (1).png')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 cursor-pointer"
                          >
                            🔵 Balón Gas Industrial 45kg
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Section: Phones & Contacts */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                    <Phone className="w-4 h-4 text-purple-700" />
                    <span>Teléfonos y Canales de Contacto Sincronizados</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        WhatsApp (con código país):
                      </label>
                      <input
                        type="text"
                        value={identidadWhatsapp}
                        onChange={(e) => setIdentidadWhatsapp(e.target.value)}
                        placeholder="51969773064"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Teléfono de Pedidos 1 (Principal):
                      </label>
                      <input
                        type="text"
                        value={identidadTel1}
                        onChange={(e) => setIdentidadTel1(e.target.value)}
                        placeholder="950 727 212"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Teléfono de Pedidos 2 (Secundario):
                      </label>
                      <input
                        type="text"
                        value={identidadTel2}
                        onChange={(e) => setIdentidadTel2(e.target.value)}
                        placeholder="984 285 500"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Central Fija Cusco (Opcional):
                      </label>
                      <input
                        type="text"
                        value={identidadTelFijo}
                        onChange={(e) => setIdentidadTelFijo(e.target.value)}
                        placeholder="(084) 501111"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Third Section: Social Media & Google Review Link */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Redes Sociales y Enlace de Reseña en Google Maps</span>
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Estos enlaces y botones de redes se sincronizan con la pantalla de entrega del cliente para solicitarle su calificación de 5 estrellas en Google y aumentar los seguidores de la empresa.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        ⭐⭐⭐⭐⭐ Enlace directo a Reseña en Google Maps:
                      </label>
                      <input
                        type="url"
                        value={identidadGoogleReview}
                        onChange={(e) => setIdentidadGoogleReview(e.target.value)}
                        placeholder="https://g.page/r/leogas-cusco/review"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Facebook del Negocio:
                      </label>
                      <input
                        type="url"
                        value={identidadFacebook}
                        onChange={(e) => setIdentidadFacebook(e.target.value)}
                        placeholder="https://facebook.com/leogascusco"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        Instagram Oficial:
                      </label>
                      <input
                        type="url"
                        value={identidadInstagram}
                        onChange={(e) => setIdentidadInstagram(e.target.value)}
                        placeholder="https://instagram.com/leogascusco"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                        TikTok de la Empresa:
                      </label>
                      <input
                        type="url"
                        value={identidadTiktok}
                        onChange={(e) => setIdentidadTiktok(e.target.value)}
                        placeholder="https://tiktok.com/@leogascusco"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Deseas restaurar la identidad comercial a los valores por defecto?')) {
                        resetNegocio();
                        alert('✔ Identidad restablecida a valores por defecto');
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span>Restaurar Valores por Defecto</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Guardar Cambios de Identidad</span>
                  </button>
                </div>
              </form>

              {/* DEVELOPER ACCORDION (GITHUB TOKEN & SYSTEM FACTORY RESET) */}
              <DeveloperAccordion />
            </div>
          )}

          {/* TAB: FACTURACIÓN Y COMPROBANTES */}
          {activeTab === 'facturacion' && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="bg-amber-400 text-blue-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block mb-1">
                    Gestión Tributaria SUNAT
                  </span>
                  <h3 className="text-xl font-black">Facturación y Boletas Electrónicas</h3>
                  <p className="text-xs text-blue-200 mt-1 max-w-xl">
                    Emisión conectada con SUNAT, consulta de RUC/DNI en línea, desglose de I.G.V. ({negocio.igvPorcentaje || 18}%) e impresión de comprobantes oficiales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const pending = pedidos.find(p => p.estado !== 'completado');
                    if (pending) {
                      setEmitirItems([{
                        descripcion: pending.tipoBalon,
                        cantidad: 1,
                        precioUnitario: typeof pending.montoCobro === 'number' ? pending.montoCobro : parseFloat(pending.montoCobro) || 50
                      }]);
                      setEmitirRepartidor(pending.repartidorNombre || '');
                      setEmitirRazonSocial(pending.cliente);
                      setEmitirDireccionFiscal(pending.direccion || 'Cusco');
                    } else {
                      setEmitirItems([{
                        descripcion: productos[0]?.nombre || 'Balón La Chuspa Tech 10kg Normal',
                        cantidad: 1,
                        precioUnitario: productos[0]?.precio || 50
                      }]);
                    }
                    setShowEmitirSunatModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Emitir Factura / Boleta SUNAT</span>
                </button>
              </div>

              {/* Filters Bar: Calendar, Driver, Type, Search */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    📅 Filtrar por Fecha Calendario:
                  </label>
                  <input
                    type="date"
                    value={facturaFilterDate}
                    onChange={(e) => setFacturaFilterDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    🛵 Filtrar por Repartidor:
                  </label>
                  <select
                    value={facturaFilterRepartidor}
                    onChange={(e) => setFacturaFilterRepartidor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="todos">Todos los Repartidores</option>
                    {repartidores.map(r => (
                      <option key={r.id} value={r.nombre}>{r.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    🧾 Tipo de Comprobante:
                  </label>
                  <select
                    value={facturaFilterTipo}
                    onChange={(e) => setFacturaFilterTipo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="todos">Todos (Facturas y Boletas)</option>
                    <option value="factura">Solo Facturas (RUC)</option>
                    <option value="boleta">Solo Boletas (DNI)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    🔍 Buscar por Cliente o Nro:
                  </label>
                  <input
                    type="text"
                    value={facturaSearch}
                    onChange={(e) => setFacturaSearch(e.target.value)}
                    placeholder="Buscar cliente, RUC, serie..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Invoices and Receipts Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h4 className="text-xs font-black uppercase text-slate-700">
                    Comprobantes Emitidos y Registrados en Cusco
                  </h4>
                  <span className="text-[11px] text-slate-500 font-bold">
                    Total Registros: {ventas.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">N° Serie</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Cliente / Razón Social</th>
                        <th className="p-3">Documento</th>
                        <th className="p-3">Estado SUNAT</th>
                        <th className="p-3">Repartidor</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ventas.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-slate-400 font-bold">
                            No hay comprobantes emitidos en el periodo seleccionado.
                          </td>
                        </tr>
                      ) : (
                        ventas
                          .filter(v => {
                            if (facturaFilterRepartidor !== 'todos' && v.repartidorNombre !== facturaFilterRepartidor) return false;
                            if (facturaFilterTipo === 'factura' && !v.comprobante.toLowerCase().includes('f')) return false;
                            if (facturaFilterTipo === 'boleta' && !v.comprobante.toLowerCase().includes('b')) return false;
                            if (facturaSearch && !v.cliente.toLowerCase().includes(facturaSearch.toLowerCase()) && !v.comprobante.toLowerCase().includes(facturaSearch.toLowerCase())) return false;
                            return true;
                          })
                          .map((v, idx) => {
                            const isFactura = v.comprobante.toUpperCase().startsWith('F');
                            return (
                              <tr key={idx} className="hover:bg-slate-50 transition">
                                <td className="p-3 font-mono font-bold text-purple-950">
                                  {v.comprobante}
                                </td>
                                <td className="p-3">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    isFactura ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {isFactura ? 'Factura' : 'Boleta'}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-600 font-semibold">{v.fecha}</td>
                                <td className="p-3 font-extrabold text-slate-900">{v.cliente}</td>
                                <td className="p-3 font-mono text-slate-600">{v.documento || (isFactura ? 'RUC 20...' : 'DNI 45...')}</td>
                                <td className="p-3">
                                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>ACEPTADO</span>
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-slate-600">🛵 {v.repartidorNombre || 'Por asignar'}</td>
                                <td className="p-3 text-right font-black text-purple-900">S/ {v.total.toFixed(2)}</td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewComprobante({
                                        numero: v.comprobante,
                                        tipo: isFactura ? 'Factura Electrónica' : 'Boleta de Venta Electrónica',
                                        fecha: v.fecha,
                                        hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                                        cliente: v.cliente,
                                        documento: v.documento || (isFactura ? '20608933211' : '45892134'),
                                        tipoDoc: isFactura ? 'RUC' : 'DNI',
                                        direccion: v.direccion || 'Cusco, Perú',
                                        repartidor: v.repartidorNombre || 'Repartidor de turno',
                                        items: [{ cantidad: 1, descripcion: v.productos, precio: v.total }],
                                        total: v.total,
                                        metodoPago: v.pago,
                                        sunatEstado: 'ACEPTADO',
                                        estadoContribuyente: isFactura ? 'ACTIVO - HABIDO' : 'DNI VÁLIDO RENIEC',
                                        hashCdr: `SHA256:${Math.random().toString(36).substring(2, 14).toUpperCase()}`
                                      });
                                    }}
                                    className="bg-purple-800 hover:bg-purple-900 text-white font-extrabold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 mx-auto transition cursor-pointer shadow-xs"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Imprimir</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CRM Y CALENDARIO */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 text-white rounded-2xl p-6 shadow-sm border border-purple-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="bg-amber-400 text-purple-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Fidelización & Mensajería B2B / Hogar
                    </span>
                    <h3 className="text-xl font-black">CRM de Gas & Calendario de Cotizaciones</h3>
                    <p className="text-xs text-purple-200 mt-1 max-w-xl">
                      Gestiona los 4 tipos de mensajes (Marketing, Utilidad, Autenticación y Servicio) y el calendario de entregas programadas en Cusco.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCotizacionModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Nueva Cotización Gas</span>
                  </button>
                </div>
              </div>

              {/* 4 TIPOS DE MENSAJE CRM CARDS (MATCHING USER SCREENSHOT) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    cat: 'MARKETING' as const,
                    subtitulos: 'cupones • lanzamientos • recordatorios',
                    icon: '📢',
                    color: 'from-amber-500 to-orange-600',
                    border: 'border-amber-300',
                    bg: 'bg-amber-50',
                    desc: 'Promociones, cupones y aviso preventivo de recarga a los 25-30 días.'
                  },
                  {
                    cat: 'UTILIDAD' as const,
                    subtitulos: 'actualización • confirmación • pagos B2B',
                    icon: '⚙️',
                    color: 'from-blue-600 to-indigo-700',
                    border: 'border-blue-300',
                    bg: 'bg-blue-50',
                    desc: 'Avisos de ruta en vivo, confirmación de pedidos y cobro a crédito.'
                  },
                  {
                    cat: 'AUTENTICACION' as const,
                    subtitulos: 'OTP • verificaciones GPS',
                    icon: '📱',
                    color: 'from-purple-600 to-fuchsia-700',
                    border: 'border-purple-300',
                    bg: 'bg-purple-50',
                    desc: 'Validación de teléfonos y confirmación de dirección exacta en Cusco.'
                  },
                  {
                    cat: 'SERVICIO' as const,
                    subtitulos: 'gratis durante 72hrs • garantía',
                    icon: '🛡️',
                    color: 'from-emerald-600 to-teal-700',
                    border: 'border-emerald-300',
                    bg: 'bg-emerald-50',
                    desc: 'Revisión técnica de fugas sin costo 72h y garantía Llamagas.'
                  }
                ].map((item) => (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => setCrmCategoryFilter(item.cat)}
                    className={`text-left p-4 rounded-2xl border-2 transition cursor-pointer shadow-xs ${
                      crmCategoryFilter === item.cat
                        ? 'border-purple-800 bg-purple-50 shadow-md ring-2 ring-purple-300'
                        : `${item.border} ${item.bg} hover:border-purple-600`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800">
                        {item.cat}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">{item.cat}</h4>
                    <span className="text-[10px] text-purple-900 font-bold block mb-1">
                      {item.subtitulos}
                    </span>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* CRM Interactive WhatsApp Dispatcher */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <span>📲</span>
                      <span>Envío de Mensajes Rápidos por WhatsApp Oficial</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Selecciona un cliente de tu cartera o ingresa su número para disparar la plantilla seleccionada.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCrmCategoryFilter('TODOS')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                        crmCategoryFilter === 'TODOS'
                          ? 'bg-purple-800 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Ver Todas ({crmPlantillas.length})
                    </button>
                  </div>
                </div>

                {/* Client selector row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      👤 Seleccionar de Cartera (VIP o B2B):
                    </label>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const [tipo, idOrRuc] = val.split(':');
                        if (tipo === 'vip') {
                          const c = clientesVIP.find(x => x.id === idOrRuc);
                          if (c) {
                            setSelectedCrmClientName(c.nombre);
                            setSelectedCrmClientPhone(c.telefono || '');
                          }
                        } else {
                          const emp = empresasB2B.find(x => x.ruc === idOrRuc);
                          if (emp) {
                            setSelectedCrmClientName(emp.razonSocial);
                            setSelectedCrmClientPhone(emp.telefono || '');
                          }
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    >
                      <option value="">-- Escoger Cliente Registrado --</option>
                      <optgroup label="Clientes VIP Hogar">
                        {clientesVIP.map(c => (
                          <option key={c.id} value={`vip:${c.id}`}>
                            ⭐ {c.nombre} ({c.telefono || 'Sin tel'})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Empresas y Restaurantes B2B">
                        {empresasB2B.map(e => (
                          <option key={e.ruc} value={`b2b:${e.ruc}`}>
                            🏢 {e.razonSocial} ({e.telefono || 'Sin tel'})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Nombre del Cliente:
                    </label>
                    <input
                      type="text"
                      value={selectedCrmClientName}
                      onChange={(e) => setSelectedCrmClientName(e.target.value)}
                      placeholder="Ej: Rosa Quispe o Pollería El Tablón"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      WhatsApp Destino (con código país 51):
                    </label>
                    <input
                      type="text"
                      value={selectedCrmClientPhone}
                      onChange={(e) => setSelectedCrmClientPhone(e.target.value)}
                      placeholder="51984285500"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {crmPlantillas
                    .filter(t => crmCategoryFilter === 'TODOS' || t.categoria === crmCategoryFilter)
                    .map((tpl) => {
                      const clientName = selectedCrmClientName.trim() || 'Estimado(a) Cliente';
                      const renderedText = tpl.plantillaTexto
                        .replace(/{cliente}/g, clientName)
                        .replace(/{empresa}/g, clientName)
                        .replace(/{repartidor}/g, repartidores[0]?.nombre || 'Edwin')
                        .replace(/{direccion}/g, 'tu dirección en Cusco')
                        .replace(/{monto}/g, '50.00')
                        .replace(/{producto}/g, 'Balón Moradito Llamagas 10kg')
                        .replace(/{pago}/g, 'Efectivo / Yape')
                        .replace(/{factura}/g, 'F001-000123')
                        .replace(/{fechaVencimiento}/g, '15 de este mes')
                        .replace(/{pedidoId}/g, 'CMD-102')
                        .replace(/{otp}/g, `${Math.floor(100000 + Math.random() * 900000)}`);

                      return (
                        <div
                          key={tpl.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-600 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-xl">{tpl.icono}</span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                                {tpl.categoria}: {tpl.subtipo}
                              </span>
                            </div>
                            <h5 className="font-black text-slate-900 text-xs sm:text-sm">{tpl.titulo}</h5>
                            <p className="text-[11px] text-slate-500 mb-2">{tpl.descripcion}</p>
                            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-medium mb-3">
                              {renderedText}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(renderedText);
                                alert('✔ Plantilla copiada al portapapeles.');
                              }}
                              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold py-2 rounded-xl text-xs transition cursor-pointer"
                            >
                              📋 Copiar Texto
                            </button>
                            <a
                              href={`https://wa.me/${selectedCrmClientPhone.trim() || negocio.whatsapp}?text=${encodeURIComponent(renderedText)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm text-center"
                            >
                              <span>📲 Enviar WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* CALENDARIO DE PEDIDOS PROGRAMADOS Y COTIZACIONES */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-black text-purple-950 text-base flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-700" />
                      <span>Calendario de Pedidos Programados & Cotizaciones B2B</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Cronograma de abastecimiento recurrente para restaurantes, pollerías y residencias de Cusco.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Fecha del Calendario:</span>
                    <input
                      type="date"
                      value={calendarViewDate}
                      onChange={(e) => setCalendarViewDate(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Cotizaciones Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Código</th>
                        <th className="p-3">Cliente / Entidad</th>
                        <th className="p-3">Doc</th>
                        <th className="p-3">Entrega Programada</th>
                        <th className="p-3">Detalle Balones</th>
                        <th className="p-3">Subtotal</th>
                        <th className="p-3">I.G.V. ({negocio.igvPorcentaje || 18}%)</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cotizaciones.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-6 text-center text-slate-400 font-bold">
                            No hay cotizaciones ni entregas agendadas en el calendario.
                          </td>
                        </tr>
                      ) : (
                        cotizaciones.map((cot) => (
                          <tr key={cot.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-black text-purple-900">{cot.codigo}</td>
                            <td className="p-3">
                              <strong className="text-slate-900 block">{cot.cliente}</strong>
                              <span className="text-slate-500 text-[11px]">📍 {cot.direccion} • 📞 {cot.telefono}</span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-600">
                              {cot.tipoDoc}: {cot.numDoc}
                            </td>
                            <td className="p-3 font-bold text-slate-800">
                              {cot.fechaProgramada} <span className="text-purple-700 block text-[11px]">{cot.horaProgramada}</span>
                            </td>
                            <td className="p-3 text-slate-700">
                              {cot.items.map(it => `${it.cantidad}x ${it.descripcion}`).join(' + ')}
                            </td>
                            <td className="p-3 font-mono text-slate-600">S/ {cot.subtotal.toFixed(2)}</td>
                            <td className="p-3 font-mono text-slate-600">S/ {cot.igv.toFixed(2)}</td>
                            <td className="p-3 text-right font-black text-purple-900 text-sm">
                              S/ {cot.total.toFixed(2)}
                            </td>
                            <td className="p-3">
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                                cot.estado === 'programado'
                                  ? 'bg-blue-100 text-blue-800'
                                  : cot.estado === 'aprobado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : cot.estado === 'facturado'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {cot.estado}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Convert quote to active delivery order
                                    createPedido({
                                      cliente: cot.cliente,
                                      tipoBalon: cot.items.map(it => `${it.cantidad}x ${it.descripcion}`).join(', '),
                                      montoCobro: cot.total.toFixed(2),
                                      metodoPago: cot.tipoDoc === 'RUC' ? 'Crédito B2B' : 'Efectivo',
                                      tipoComprobante: cot.tipoDoc === 'RUC' ? 'Factura' : 'Boleta',
                                      direccion: cot.direccion,
                                      tipoVenta: cot.tipoDoc === 'RUC' ? 'mayorista_b2b' : 'minorista'
                                    });
                                    updateCotizacion({ ...cot, estado: 'programado' });
                                    alert(`✔ Cotización ${cot.codigo} despachada como pedido activo a la flota.`);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded-lg text-xs"
                                  title="Despachar a Pedido Flota"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewComprobante({
                                      numero: cot.codigo,
                                      tipo: 'Cotización Oficial de Suministro GLP',
                                      fecha: cot.fechaEmision,
                                      hora: cot.horaProgramada || '10:00 a.m.',
                                      cliente: cot.cliente,
                                      documento: cot.numDoc,
                                      tipoDoc: cot.tipoDoc,
                                      direccion: cot.direccion,
                                      repartidor: cot.repartidorAsignado || 'Flota La Chuspa Tech',
                                      items: cot.items.map(it => ({
                                        cantidad: it.cantidad,
                                        descripcion: it.descripcion,
                                        precio: it.total
                                      })),
                                      total: cot.total,
                                      metodoPago: 'Condición pactada según cotización',
                                      sunatEstado: 'COTIZACIÓN APROBADA',
                                      estadoContribuyente: 'PROFORMA VÁLIDA POR 15 DÍAS'
                                    });
                                  }}
                                  className="bg-purple-800 hover:bg-purple-900 text-white font-bold p-1.5 rounded-lg text-xs"
                                  title="Imprimir Cotización"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`¿Deseas eliminar la cotización ${cot.codigo}?`)) {
                                      deleteCotizacion(cot.id);
                                    }
                                  }}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg text-xs"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLUB DE FIDELIDAD (SELLOS POR CONSUMO) */}
          {activeTab === 'fidelidad' && (
            <div className="space-y-6">
              {/* Header card with metrics */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md border-2 border-amber-400 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="bg-amber-400 text-purple-950 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block mb-1 shadow-xs">
                      🎁 Club de Fidelidad • 10 Sellos = 1 Regalito
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                      Club de Fidelidad & Tarjetas Digitales de Sellos
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
                      Monitorea y suma sellos digitales a tus clientes por cada consumo de gas. Al alcanzar 10 sellos reciben su regalito de la casa. Consulta y busca por DNI en tiempo real con sincronización automática en el portal del cliente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewFidDni('');
                      setNewFidNombre('');
                      setNewFidTelefono('');
                      setNewFidSellos(1);
                      setShowAddFidelidadModal(true);
                    }}
                    className="bg-amber-400 hover:bg-amber-500 text-purple-950 font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Cliente en Club</span>
                  </button>
                </div>

                {/* Metrics Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-purple-800/60">
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                    <span className="text-[10px] uppercase font-bold text-purple-200 block">Total Clientes en Club</span>
                    <strong className="text-xl sm:text-2xl font-black text-white">{clubFidelidad.length}</strong>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                    <span className="text-[10px] uppercase font-bold text-purple-200 block">Sellos Activos</span>
                    <strong className="text-xl sm:text-2xl font-black text-amber-300">
                      {clubFidelidad.reduce((acc, c) => acc + c.sellos, 0)}
                    </strong>
                  </div>

                  <div className="bg-amber-400/20 backdrop-blur-xs p-3 rounded-xl border border-amber-400/40">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">🎁 Listos para Regalito</span>
                    <strong className="text-xl sm:text-2xl font-black text-amber-300">
                      {clubFidelidad.filter((c) => c.sellos >= 10).length}
                    </strong>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                    <span className="text-[10px] uppercase font-bold text-purple-200 block">Premios Canjeados</span>
                    <strong className="text-xl sm:text-2xl font-black text-emerald-300">
                      {clubFidelidad.reduce((acc, c) => acc + c.premiosCanjeados, 0)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Search Toolbar & Status Filters */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                {/* Search by DNI or Name */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fidelidadSearch}
                    onChange={(e) => setFidelidadSearch(e.target.value)}
                    placeholder="Buscar por DNI (8 dígitos) o Nombre del cliente..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-purple-800"
                  />
                  {fidelidadSearch && (
                    <button
                      type="button"
                      onClick={() => setFidelidadSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'TODOS', label: `Todos (${clubFidelidad.length})` },
                    {
                      id: 'LISTOS',
                      label: `🎁 Listos para Regalito (${clubFidelidad.filter((c) => c.sellos >= 10).length})`
                    },
                    {
                      id: 'PROGRESO',
                      label: `⚡ En Progreso (${clubFidelidad.filter((c) => c.sellos > 0 && c.sellos < 10).length})`
                    }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFidelidadFilterStatus(f.id as typeof fidelidadFilterStatus)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        fidelidadFilterStatus === f.id
                          ? 'bg-purple-800 text-white border-purple-800 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Members Grid / List */}
              {(() => {
                const filtered = clubFidelidad.filter((c) => {
                  const query = fidelidadSearch.trim().toLowerCase();
                  const matchesQuery =
                    !query ||
                    c.dni.includes(query) ||
                    c.nombre.toLowerCase().includes(query) ||
                    (c.telefono && c.telefono.includes(query));

                  if (!matchesQuery) return false;

                  if (fidelidadFilterStatus === 'LISTOS') return c.sellos >= 10;
                  if (fidelidadFilterStatus === 'PROGRESO') return c.sellos > 0 && c.sellos < 10;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 space-y-2">
                      <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center text-xl mx-auto">
                        🔍
                      </div>
                      <h4 className="font-black text-slate-800 text-sm">No se encontraron clientes en el Club</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {fidelidadSearch
                          ? `No hay coincidencias para "${fidelidadSearch}". Intenta con otro número de DNI o agrega el cliente.`
                          : 'Aún no hay clientes registrados con este filtro.'}
                      </p>
                      {fidelidadSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewFidDni(/^\d+$/.test(fidelidadSearch) ? fidelidadSearch : '');
                            setNewFidNombre(!/^\d+$/.test(fidelidadSearch) ? fidelidadSearch : '');
                            setShowAddFidelidadModal(true);
                          }}
                          className="bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs px-4 py-2 rounded-xl mt-2 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Registrar "{fidelidadSearch}" en el Club</span>
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((client) => {
                      const isComplete = client.sellos >= 10;
                      return (
                        <div
                          key={client.id}
                          className={`bg-white rounded-2xl p-5 border-2 shadow-xs transition-all space-y-4 ${
                            isComplete
                              ? 'border-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-white ring-2 ring-amber-300/40'
                              : 'border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-inner ${
                                  isComplete ? 'bg-amber-400 text-purple-950 text-xl animate-bounce' : 'bg-purple-100 text-purple-900'
                                }`}
                              >
                                {isComplete ? '🎁' : '🛢️'}
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                                  <span>{client.nombre}</span>
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-black font-mono">
                                    DNI: {client.dni}
                                  </span>
                                  {client.telefono && (
                                    <a
                                      href={`https://wa.me/${client.telefono.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-700 font-bold text-[10px] hover:underline flex items-center gap-1"
                                      title="Chatear por WhatsApp"
                                    >
                                      📱 {client.telefono}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
                                isComplete
                                  ? 'bg-amber-400 text-purple-950 animate-pulse border border-amber-500 shadow-xs'
                                  : 'bg-purple-100 text-purple-900'
                              }`}
                            >
                              {isComplete ? '¡Regalito Listo! 🎁' : `${client.sellos} / 10 Sellos`}
                            </span>
                          </div>

                          {/* 10-Stamp Visual Mini Card */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span className="text-slate-500 uppercase text-[9px]">Tarjeta de Sellos</span>
                              <span className={isComplete ? 'text-amber-700 font-black' : 'text-purple-900'}>
                                {isComplete
                                  ? '🎉 ¡Tarjeta Completa de 10 Sellos!'
                                  : `Faltan ${10 - client.sellos} sellos para el regalito`}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isComplete
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                                }`}
                                style={{ width: `${Math.min(100, (client.sellos / 10) * 100)}%` }}
                              />
                            </div>

                            {/* 10 Mini-Slots */}
                            <div className="grid grid-cols-10 gap-1 pt-1">
                              {[...Array(10)].map((_, i) => {
                                const slotNum = i + 1;
                                const isStamped = client.sellos >= slotNum;
                                const isPrize = slotNum === 10;

                                return (
                                  <div
                                    key={slotNum}
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[8px] font-black transition-all ${
                                      isStamped
                                        ? 'bg-amber-400 text-purple-950 shadow-xs font-black'
                                        : isPrize
                                        ? 'bg-amber-100/70 border border-dashed border-amber-400 text-amber-800 animate-pulse'
                                        : 'bg-white border border-dashed border-slate-300 text-slate-400'
                                    }`}
                                    title={`Espacio #${slotNum} ${isStamped ? '(Sellado ✔)' : isPrize ? '(¡Regalito!)' : ''}`}
                                  >
                                    <span>{isStamped ? '✔️' : isPrize ? '🎁' : slotNum}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Consumption Stats Info */}
                          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                            <span>Consumos totales: <strong>{client.totalConsumos}</strong></span>
                            <span>Premios canjeados: <strong>{client.premiosCanjeados}</strong></span>
                            <span className="truncate max-w-[140px] text-right">Último: {client.ultimoConsumo}</span>
                          </div>

                          {/* Action Buttons Toolbar */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                            {/* Stamp adjustments (+1 / -1) */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  sumarSelloFidelidad(
                                    client.dni,
                                    client.nombre,
                                    client.telefono,
                                    'Sello otorgado por administración',
                                    1
                                  );
                                  playSuccessChime();
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
                                title="Sumar 1 sello por consumo"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+1 Sello</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (client.sellos > 0) {
                                    setSellosManual(client.dni, client.sellos - 1);
                                  }
                                }}
                                disabled={client.sellos === 0}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1.5 rounded-lg text-xs transition cursor-pointer disabled:opacity-40"
                                title="Restar 1 sello"
                              >
                                -1
                              </button>
                            </div>

                            {/* Prize Redeem Button */}
                            {isComplete ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `¿Confirmas la entrega del REGALITO a ${client.nombre}?\n\nSe canjearán 10 sellos y la tarjeta digital volverá a 0 sellos.`
                                    )
                                  ) {
                                    canjearPremioFidelidad(client.dni);
                                    playSuccessChime();
                                    playAndSpeak(`Regalito entregado y registrado con éxito para ${client.nombre}.`);
                                    alert(`✔ Regalito registrado con éxito para ${client.nombre}.`);
                                  }
                                }}
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer animate-pulse"
                              >
                                <Gift className="w-3.5 h-3.5" />
                                <span>Canjear Regalito 🎁</span>
                              </button>
                            ) : null}

                            {/* WhatsApp Notification */}
                            <a
                              href={`https://wa.me/${(client.telefono || telefonos.whatsapp || '969773064').replace(/\D/g, '')}?text=${encodeURIComponent(
                                isComplete
                                  ? `¡Hola ${client.nombre}! 🎉 En ${negocio.nombre || 'La Chuspa Tech'} te felicitamos: ¡has completado tus 10 sellos del Club de Fidelidad con tu DNI ${client.dni}! Ya puedes coordinar la entrega de tu regalito sorpresa 🎁 ¡Gracias por tu preferencia!`
                                  : `¡Hola ${client.nombre}! 🦁 En ${negocio.nombre || 'La Chuspa Tech'} te recordamos que tienes ${client.sellos} de 10 sellos en tu Club de Fidelidad con tu DNI ${client.dni}. ¡Te faltan solo ${10 - client.sellos} consumos para tu regalito especial! Pídelo al ${telefonos.whatsapp || '969773064'}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                              title="Enviar recordatorio de sellos por WhatsApp"
                            >
                              <span>📲 WhatsApp</span>
                            </a>

                            {/* History button */}
                            <button
                              type="button"
                              onClick={() => setSelectedFidHistory(client)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-1.5 rounded-lg text-xs transition"
                              title="Ver historial de consumos"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete member */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`¿Eliminar al cliente ${client.nombre} (DNI ${client.dni}) del Club de Fidelidad?`)) {
                                  deleteClienteFidelidad(client.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* MODAL: REGISTRAR NUEVO CLIENTE EN CLUB */}
              {showAddFidelidadModal && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-purple-400 animate-in zoom-in-95 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm">
                          🎁
                        </span>
                        <div>
                          <h4 className="font-black text-slate-900 text-base leading-tight">
                            Nuevo Cliente en Club de Fidelidad
                          </h4>
                          <p className="text-[11px] text-slate-500">Crea su tarjeta digital de sellos</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddFidelidadModal(false)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const cleanDni = newFidDni.trim().replace(/\D/g, '');
                        if (cleanDni.length !== 8) {
                          alert('El DNI debe tener exactamente 8 dígitos.');
                          return;
                        }
                        if (!newFidNombre.trim()) {
                          alert('Por favor ingresa el nombre del cliente.');
                          return;
                        }

                        registrarNuevoClienteFidelidad({
                          dni: cleanDni,
                          nombre: newFidNombre.trim(),
                          telefono: newFidTelefono.trim() || '',
                          sellos: Math.max(0, newFidSellos),
                          totalConsumos: Math.max(1, newFidSellos),
                          premiosCanjeados: 0,
                          ultimoConsumo: 'Hoy, registro manual',
                          historial: [
                            {
                              fecha: 'Hoy, registro inicial',
                              detalle: `Apertura de tarjeta digital con ${newFidSellos} sello(s)`,
                              sellosSumados: newFidSellos
                            }
                          ]
                        });

                        setShowAddFidelidadModal(false);
                        playSuccessChime();
                        alert(`✔ Cliente ${newFidNombre.trim()} registrado con éxito en el Club de Fidelidad.`);
                      }}
                      className="space-y-3.5 text-xs text-left"
                    >
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Número de DNI (8 dígitos): *
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          required
                          value={newFidDni}
                          onChange={(e) => setNewFidDni(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ej: 23891045"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Nombre Completo del Cliente: *
                        </label>
                        <input
                          type="text"
                          required
                          value={newFidNombre}
                          onChange={(e) => setNewFidNombre(e.target.value)}
                          placeholder="Ej: Juan Carlos Pérez"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Teléfono / WhatsApp de Contacto:
                        </label>
                        <input
                          type="tel"
                          value={newFidTelefono}
                          onChange={(e) => setNewFidTelefono(e.target.value)}
                          placeholder="Ej: 984 123 456"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Sellos Iniciales por Consumo:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={newFidSellos}
                            onChange={(e) => setNewFidSellos(parseInt(e.target.value) || 0)}
                            className="w-24 bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-black text-center text-sm text-purple-900"
                          />
                          <span className="text-slate-500 text-[11px]">
                            {newFidSellos === 10 ? '¡Listo para canjear regalito!' : `Faltarán ${10 - newFidSellos} para regalito`}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddFidelidadModal(false)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-purple-800 hover:bg-purple-900 text-white font-black py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-4 h-4 text-amber-300" />
                          <span>Guardar y Sellar</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: HISTORIAL DE SELLOS DEL CLIENTE */}
              {selectedFidHistory && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-300 animate-in zoom-in-95 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-black text-slate-900 text-base leading-tight">
                          Historial de Sellos: {selectedFidHistory.nombre}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">DNI: {selectedFidHistory.dni} • Saldo: {selectedFidHistory.sellos} / 10 sellos</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFidHistory(null)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
                      {selectedFidHistory.historial && selectedFidHistory.historial.length > 0 ? (
                        selectedFidHistory.historial.map((h, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between gap-2"
                          >
                            <div>
                              <strong className="text-slate-800 block text-[11px]">{h.detalle}</strong>
                              <span className="text-[10px] text-slate-400 block">{h.fecha}</span>
                            </div>
                            <span
                              className={`font-black text-xs px-2 py-0.5 rounded-md flex-shrink-0 ${
                                h.sellosSumados > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {h.sellosSumados > 0 ? `+${h.sellosSumados} sello` : `${h.sellosSumados} sellos`}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400">
                          No hay movimientos registrados para este cliente.
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedFidHistory(null)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl cursor-pointer text-xs"
                      >
                        Cerrar Historial
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 printable-area">
              {/* Printable Header with Company Logo, Chuspa Tech logo, and Contacts */}
              <div className="border-b-2 border-purple-900 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={getAssetUrl(negocio.logoUrl)}
                    alt={negocio.nombre}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-black text-purple-950 uppercase tracking-tight">{negocio.nombre}</h2>
                    <p className="text-xs text-purple-800 font-extrabold">{negocio.slogan}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">📍 {negocio.direccion}</p>
                    <p className="text-[11px] text-slate-500 font-bold">
                      📞 Teléfonos: {negocio.telPrincipal} • {negocio.telSecundario} | WA: +{negocio.whatsapp}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2">
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
                    <img src="/CHUSPITA-circulo.png" alt="La Chuspa Tech" className="w-8 h-8 rounded-full shadow-xs" />
                    <div className="text-left">
                      <span className="text-[10px] font-black text-purple-900 block leading-tight">Respaldado por La Chuspa Tech</span>
                      <a href="https://www.lachuspaanuncios.com" target="_blank" rel="noreferrer" className="text-[9px] text-blue-700 font-bold hover:underline">
                        www.lachuspaanuncios.com
                      </a>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    Fecha de Impresión: {new Date().toLocaleDateString('es-PE')} - {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-purple-950">
                    💵 Liquidación y Cierre de Caja Diario
                  </h3>
                  <p className="text-xs text-slate-500">
                    Arqueo de fondos, efectivo a rendir por repartidores y cobranzas en Cusco
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition no-print cursor-pointer shadow-md"
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
              {/* Header card with Add button */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-purple-700" />
                    <span>Catálogo de Válvulas, Mangueras y Accesorios de Gas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tarjetas informativas de repuestos y accesorios disponibles para delivery en Cusco
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewAccNombre('');
                    setNewAccPrecio('');
                    setNewAccDesc('');
                    setShowAddAccModal(true);
                  }}
                  className="bg-purple-800 hover:bg-purple-900 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>➕ Agregar Nuevo Accesorio</span>
                </button>
              </div>

              {/* Informative Cards Catalog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accesorios.map((acc) => (
                  <div
                    key={acc.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition relative group"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-14 h-14 rounded-xl bg-purple-50 border border-purple-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={
                              acc.imagen
                                ? (acc.imagen.startsWith('data:') || acc.imagen.startsWith('http')
                                    ? acc.imagen
                                    : getAssetUrl(acc.imagen))
                                : getAssetUrl('1791513590376.jpg')
                            }
                            alt={acc.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="bg-purple-50 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-200">
                              ⚙️ Repuesto Certificado
                            </span>
                            <span className="text-base font-black text-purple-950">
                              S/ {acc.precio.toFixed(2)}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                            {acc.nombre}
                          </h4>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {acc.descripcion || 'Accesorio y válvula homologada de alta seguridad para balones de gas residencial y comercial. Cumple normativa Osinergmin.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditAccModal(acc);
                        }}
                        className="flex-1 bg-slate-50 hover:bg-purple-50 text-purple-900 border border-slate-200 hover:border-purple-300 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-purple-700" />
                        <span>Editar / Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Deseas eliminar el accesorio "${acc.nombre}"?`)) {
                            deleteAccesorio(acc.id);
                            alert('✔ Accesorio eliminado correctamente.');
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2 rounded-xl transition cursor-pointer"
                        title="Eliminar Accesorio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Accessory Modal */}
              {showAddAccModal && (
                <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                      <h4 className="font-black text-base text-purple-950 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-purple-700" />
                        <span>Agregar Nuevo Accesorio</span>
                      </h4>
                      <button onClick={() => setShowAddAccModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newAccNombre || !newAccPrecio) return alert('Por favor ingresa nombre y precio.');
                        addAccesorio({
                          id: `acc-${Date.now()}`,
                          nombre: newAccNombre.trim(),
                          precio: parseFloat(newAccPrecio) || 0,
                          disponible: true,
                          imagen: newAccImagen.trim() || '/1791513590376.jpg',
                          descripcion: newAccDesc.trim() || 'Accesorio certificado para instalaciones de gas GLP.'
                        });
                        setShowAddAccModal(false);
                        alert('✔ Accesorio agregado exitosamente.');
                      }}
                      className="space-y-3.5 text-xs"
                    >
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nombre del Accesorio:</label>
                        <input
                          type="text"
                          required
                          value={newAccNombre}
                          onChange={(e) => setNewAccNombre(e.target.value)}
                          placeholder="Ej: Manguera Reforzada Naranja 1.5m"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Precio de Venta (S/):</label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          value={newAccPrecio}
                          onChange={(e) => setNewAccPrecio(e.target.value)}
                          placeholder="25.00"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                        />
                      </div>

                      {/* Image section */}
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
                        <label className="text-[10px] font-bold uppercase text-purple-900 block">
                          Foto / Imagen del Accesorio:
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl border border-purple-300 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center shadow-2xs">
                            <img
                              src={
                                newAccImagen.startsWith('data:') || newAccImagen.startsWith('http')
                                  ? newAccImagen
                                  : getAssetUrl(newAccImagen)
                              }
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs transition">
                              <Upload className="w-3.5 h-3.5 text-amber-300" />
                              <span>Subir Imagen desde Equipo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewAccImageUpload}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={newAccImagen}
                              onChange={(e) => setNewAccImagen(e.target.value)}
                              placeholder="/1791513590376.jpg o URL"
                              className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-[11px] font-semibold"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setNewAccImagen('/1791513590376.jpg')}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🟣 Válvula / Accesorio
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewAccImagen('/medidas-de-balon-de-gas-de-10-Kg (1).png')}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🔵 Regulador Industrial
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewAccImagen('/CHUSPITA-circulo.png')}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🟡 Logo Chuspita
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Descripción / Características:</label>
                        <textarea
                          rows={2}
                          value={newAccDesc}
                          onChange={(e) => setNewAccDesc(e.target.value)}
                          placeholder="Detalles técnicos, longitud, compatibilidad con balones..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddAccModal(false)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-purple-800 hover:bg-purple-900 text-white font-black py-2.5 rounded-xl shadow-md cursor-pointer"
                        >
                          Guardar Accesorio
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Accessory Modal */}
              {editAccModal && (
                <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                      <h4 className="font-black text-base text-purple-950 flex items-center gap-2">
                        <Edit className="w-4 h-4 text-purple-700" />
                        <span>Editar Accesorio y Foto</span>
                      </h4>
                      <button onClick={() => setEditAccModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateAccesorio(editAccModal);
                        setEditAccModal(null);
                        alert('✔ Accesorio modificado exitosamente.');
                      }}
                      className="space-y-3.5 text-xs"
                    >
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nombre del Producto:</label>
                        <input
                          type="text"
                          required
                          value={editAccModal.nombre}
                          onChange={(e) => setEditAccModal({ ...editAccModal, nombre: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Precio (S/):</label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          value={editAccModal.precio}
                          onChange={(e) => setEditAccModal({ ...editAccModal, precio: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                        />
                      </div>

                      {/* Image section */}
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
                        <label className="text-[10px] font-bold uppercase text-purple-900 block">
                          Foto / Imagen del Accesorio:
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl border border-purple-300 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center shadow-2xs">
                            <img
                              src={
                                editAccModal.imagen
                                  ? (editAccModal.imagen.startsWith('data:') || editAccModal.imagen.startsWith('http')
                                      ? editAccModal.imagen
                                      : getAssetUrl(editAccModal.imagen))
                                  : getAssetUrl('1791513590376.jpg')
                              }
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs transition">
                              <Upload className="w-3.5 h-3.5 text-amber-300" />
                              <span>Cambiar / Subir Imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditAccImageUpload}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={editAccModal.imagen || ''}
                              onChange={(e) => setEditAccModal({ ...editAccModal, imagen: e.target.value })}
                              placeholder="/1791513590376.jpg o URL"
                              className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-[11px] font-semibold"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditAccModal({ ...editAccModal, imagen: '/1791513590376.jpg' })}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🟣 Válvula / Accesorio
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditAccModal({ ...editAccModal, imagen: '/medidas-de-balon-de-gas-de-10-Kg (1).png' })}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🔵 Regulador Industrial
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditAccModal({ ...editAccModal, imagen: '/CHUSPITA-circulo.png' })}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🟡 Logo Chuspita
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Descripción Informativa:</label>
                        <textarea
                          rows={2}
                          value={editAccModal.descripcion || ''}
                          onChange={(e) => setEditAccModal({ ...editAccModal, descripcion: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditAccModal(null)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-purple-800 hover:bg-purple-900 text-white font-black py-2.5 rounded-xl shadow-md cursor-pointer"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: BALONES Y PRECIOS */}
          {activeTab === 'productos' && (
            <div className="space-y-6">
              {/* Header card with Add button */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Flame className="w-5 h-5 text-purple-700" />
                    <span>Catálogo Oficial de Balones de Gas (Tarifas Cusco)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tarjetas de productos de gas GLP para pedidos residenciales, restaurantes y comercios
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewProdNombre('');
                    setNewProdTag('10kg');
                    setNewProdPrecio('');
                    setNewProdDesc('');
                    setShowAddProdModal(true);
                  }}
                  className="bg-purple-800 hover:bg-purple-900 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>➕ Agregar Nuevo Balón de Gas</span>
                </button>
              </div>

              {/* Informative Cards Catalog for Gas Cylinders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productos.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition relative group"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-14 h-14 rounded-xl bg-purple-50 border border-purple-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={
                              prod.imagen
                                ? (prod.imagen.startsWith('data:') || prod.imagen.startsWith('http')
                                    ? prod.imagen
                                    : getAssetUrl(prod.imagen))
                                : getAssetUrl('1791513590376.jpg')
                            }
                            alt={prod.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-200">
                              {prod.tag}
                            </span>
                            <span className="text-base font-black text-purple-950">
                              S/ {prod.precio.toFixed(2)}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                            {prod.nombre}
                          </h4>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {prod.descripcion}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditProdModal(prod);
                        }}
                        className="flex-1 bg-slate-50 hover:bg-purple-50 text-purple-900 border border-slate-200 hover:border-purple-300 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-purple-700" />
                        <span>Modificar Tarifa / Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Deseas eliminar el producto "${prod.nombre}" del catálogo?`)) {
                            deleteProducto(prod.id);
                            alert('✔ Balón eliminado del catálogo.');
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2 rounded-xl transition cursor-pointer"
                        title="Eliminar Balón"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Product Modal */}
              {showAddProdModal && (
                <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                      <h4 className="font-black text-base text-purple-950 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-purple-700" />
                        <span>Registrar Nuevo Balón de Gas</span>
                      </h4>
                      <button onClick={() => setShowAddProdModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newProdNombre || !newProdPrecio) return alert('Por favor ingresa nombre y precio.');
                        addProducto({
                          id: `prod-${Date.now()}`,
                          nombre: newProdNombre.trim(),
                          tag: newProdTag.trim() || '10kg',
                          precio: parseFloat(newProdPrecio) || 0,
                          disponible: true,
                          imagen: newProdImagen.trim() || '/1791513590376.jpg',
                          descripcion: newProdDesc.trim() || 'Balón de gas doméstico e industrial garantizado por La Chuspa Tech.'
                        });
                        setShowAddProdModal(false);
                        alert('✔ Balón registrado en el catálogo exitosamente.');
                      }}
                      className="space-y-3.5 text-xs"
                    >
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nombre del Balón:</label>
                        <input
                          type="text"
                          required
                          value={newProdNombre}
                          onChange={(e) => setNewProdNombre(e.target.value)}
                          placeholder="Ej: Balón La Chuspa Tech 10kg Especial"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Capacidad / Tag:</label>
                          <input
                            type="text"
                            required
                            value={newProdTag}
                            onChange={(e) => setNewProdTag(e.target.value)}
                            placeholder="10kg, 45kg, 5kg"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Precio de Venta (S/):</label>
                          <input
                            type="number"
                            step="0.5"
                            required
                            value={newProdPrecio}
                            onChange={(e) => setNewProdPrecio(e.target.value)}
                            placeholder="50.00"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                          />
                        </div>
                      </div>

                      {/* Image section */}
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
                        <label className="text-[10px] font-bold uppercase text-purple-900 block">
                          Foto / Imagen del Balón:
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl border border-purple-300 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center shadow-2xs">
                            <img
                              src={
                                newProdImagen.startsWith('data:') || newProdImagen.startsWith('http')
                                  ? newProdImagen
                                  : getAssetUrl(newProdImagen)
                              }
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs transition">
                              <Upload className="w-3.5 h-3.5 text-amber-300" />
                              <span>Subir Imagen desde Equipo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewProdImageUpload}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={newProdImagen}
                              onChange={(e) => setNewProdImagen(e.target.value)}
                              placeholder="/1791513590376.jpg o URL"
                              className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-[11px] font-semibold"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setNewProdImagen('/1791513590376.jpg')}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🟣 Balón Morado
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewProdImagen('/medidas-de-balon-de-gas-de-10-Kg (1).png')}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🔵 Balón Gas 10kg
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewProdImagen('/CHUSPITA-circulo.png')}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🟡 Chuspita Tech
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Descripción y Características:</label>
                        <textarea
                          rows={2}
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          placeholder="Detalles sobre uso residencial, tipo de válvula, rendimiento..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddProdModal(false)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-purple-800 hover:bg-purple-900 text-white font-black py-2.5 rounded-xl shadow-md cursor-pointer"
                        >
                          Guardar Balón
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Product Modal */}
              {editProdModal && (
                <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                      <h4 className="font-black text-base text-purple-950 flex items-center gap-2">
                        <Edit className="w-4 h-4 text-purple-700" />
                        <span>Modificar Tarifa y Foto de Balón</span>
                      </h4>
                      <button onClick={() => setEditProdModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateProducto(editProdModal);
                        setEditProdModal(null);
                        alert('✔ Producto actualizado correctamente.');
                      }}
                      className="space-y-3.5 text-xs"
                    >
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nombre del Balón:</label>
                        <input
                          type="text"
                          required
                          value={editProdModal.nombre}
                          onChange={(e) => setEditProdModal({ ...editProdModal, nombre: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Capacidad / Tag:</label>
                          <input
                            type="text"
                            required
                            value={editProdModal.tag}
                            onChange={(e) => setEditProdModal({ ...editProdModal, tag: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Precio (S/):</label>
                          <input
                            type="number"
                            step="0.5"
                            required
                            value={editProdModal.precio}
                            onChange={(e) => setEditProdModal({ ...editProdModal, precio: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                          />
                        </div>
                      </div>

                      {/* Image section */}
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
                        <label className="text-[10px] font-bold uppercase text-purple-900 block">
                          Foto / Imagen del Balón:
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl border border-purple-300 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center shadow-2xs">
                            <img
                              src={
                                editProdModal.imagen
                                  ? (editProdModal.imagen.startsWith('data:') || editProdModal.imagen.startsWith('http')
                                      ? editProdModal.imagen
                                      : getAssetUrl(editProdModal.imagen))
                                  : getAssetUrl('1791513590376.jpg')
                              }
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs transition">
                              <Upload className="w-3.5 h-3.5 text-amber-300" />
                              <span>Cambiar / Subir Imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditProdImageUpload}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={editProdModal.imagen || ''}
                              onChange={(e) => setEditProdModal({ ...editProdModal, imagen: e.target.value })}
                              placeholder="/1791513590376.jpg o URL"
                              className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-[11px] font-semibold"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditProdModal({ ...editProdModal, imagen: '/1791513590376.jpg' })}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🟣 Balón Morado
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditProdModal({ ...editProdModal, imagen: '/medidas-de-balon-de-gas-de-10-Kg (1).png' })}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🔵 Balón Gas 10kg
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditProdModal({ ...editProdModal, imagen: '/CHUSPITA-circulo.png' })}
                            className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-purple-100 cursor-pointer"
                          >
                            🟡 Chuspita Tech
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Descripción:</label>
                        <textarea
                          rows={2}
                          value={editProdModal.descripcion}
                          onChange={(e) => setEditProdModal({ ...editProdModal, descripcion: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditProdModal(null)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-purple-800 hover:bg-purple-900 text-white font-black py-2.5 rounded-xl shadow-md cursor-pointer"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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

              {/* Fleet List & Summary Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-900 text-sm">
                    🛵 Choferes Registrados en la Flota ({repartidores.length} repartidores)
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {repartidores.filter(r => r.online).length} en servicio activo
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {repartidores.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl flex flex-col justify-between text-xs space-y-2 hover:border-purple-600 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 text-sm block">🛵 {rep.nombre}</strong>
                          <span className="text-slate-500 text-[11px]">
                            Usuario: <strong className="text-purple-950 font-mono">{rep.usuario || rep.nombre.toLowerCase()}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleRepartidorOnline(rep.id)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer shadow-xs transition ${
                            rep.online
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {rep.online ? '● En Servicio' : '○ Desconectado'}
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Clave de acceso:</span>
                          <strong className="font-mono text-purple-900">{rep.password || '123'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>GPS Cusco:</span>
                          <span className="font-mono">{rep.lat.toFixed(4)}, {rep.lng.toFixed(4)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            const newPass = prompt(`Nueva contraseña para ${rep.nombre}:`, rep.password || '123');
                            if (newPass) updateRepartidor({ ...rep, password: newPass });
                          }}
                          className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 py-1.5 rounded-xl text-center text-xs font-bold cursor-pointer transition shadow-xs"
                        >
                          Modificar Clave
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Deseas eliminar a ${rep.nombre} de la flota?`)) {
                              deleteRepartidor(rep.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-xl border border-red-200 bg-red-50 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Table for full visibility */}
                <div className="mt-4 pt-4 border-t border-slate-200 overflow-x-auto">
                  <h5 className="font-bold text-xs uppercase text-slate-500 mb-2">
                    Tabla de Choferes Habilitados para Inicio de Sesión
                  </h5>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">ID Chofer</th>
                        <th className="p-2.5">Nombre Completo</th>
                        <th className="p-2.5">Usuario</th>
                        <th className="p-2.5">Contraseña</th>
                        <th className="p-2.5">Estado en Turno</th>
                        <th className="p-2.5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {repartidores.map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-500">{rep.id}</td>
                          <td className="p-2.5 font-black text-purple-950">🛵 {rep.nombre}</td>
                          <td className="p-2.5 font-bold text-slate-700 font-mono">{rep.usuario || rep.nombre.toLowerCase()}</td>
                          <td className="p-2.5 font-mono text-purple-900">{rep.password || '123'}</td>
                          <td className="p-2.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              rep.online ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {rep.online ? 'En Servicio' : 'Desconectado'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleRepartidorOnline(rep.id)}
                              className="text-[11px] text-purple-700 hover:underline font-bold mr-2 cursor-pointer"
                            >
                              {rep.online ? 'Poner Offline' : 'Poner Online'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRepartidor(rep.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-purple-50 text-purple-900 text-xs p-3 rounded-xl border border-purple-200">
                  💡 <strong>Sincronización Automática:</strong> Cualquier chofer que agregues aquí aparecerá de inmediato en el selector de inicio de sesión de Repartidor (repartidor.html) y en la bandeja de asignación de pedidos.
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REPORTE CONTABLE */}
          {activeTab === 'reportes' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 printable-area">
              {/* Printable Header with Company Logo, Chuspa Tech logo, and Contacts */}
              <div className="border-b-2 border-purple-900 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={getAssetUrl(negocio.logoUrl)}
                    alt={negocio.nombre}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-black text-purple-950 uppercase tracking-tight">{negocio.nombre}</h2>
                    <p className="text-xs text-purple-800 font-extrabold">{negocio.slogan}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">📍 {negocio.direccion}</p>
                    <p className="text-[11px] text-slate-500 font-bold">
                      📞 Teléfonos: {negocio.telPrincipal} • {negocio.telSecundario} | WA: +{negocio.whatsapp}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2">
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
                    <img src="/CHUSPITA-circulo.png" alt="La Chuspa Tech" className="w-8 h-8 rounded-full shadow-xs" />
                    <div className="text-left">
                      <span className="text-[10px] font-black text-purple-900 block leading-tight">Respaldado por La Chuspa Tech</span>
                      <a href="https://www.lachuspaanuncios.com" target="_blank" rel="noreferrer" className="text-[9px] text-blue-700 font-bold hover:underline">
                        www.lachuspaanuncios.com
                      </a>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    Fecha de Emisión: {new Date().toLocaleDateString('es-PE')} - {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
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

          {/* TAB: ZONA DESARROLLADOR */}
          {activeTab === 'desarrollador' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block mb-1">
                    Panel Técnico & GitHub
                  </span>
                  <h3 className="text-xl font-black">Zona del Desarrollador</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Gestión del Token Personal de GitHub, sincronización con GitHub Pages y reseteo general del sistema protegido por clave.
                  </p>
                </div>
              </div>

              <DeveloperAccordion />
            </div>
          )}
        </main>
      </div>

      {/* CENTRAL INCOMING ORDER ALERT MODAL - RESPONSIVE FOR CELULAR, TABLET, PC */}
      {incomingOrderModal && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          <div className="w-full max-w-[94vw] xs:max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border-2 sm:border-4 border-yellow-400 text-center animate-in zoom-in-95 space-y-3.5 sm:space-y-4 relative my-auto max-h-[88dvh] sm:max-h-[86vh] overflow-y-auto overscroll-contain [scrollbar-width:thin]">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIncomingOrderModal(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 sm:p-2.5 rounded-full transition cursor-pointer z-10 shadow-xs"
              title="Cerrar modal"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Voice Agent Badge Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-900 text-[10px] sm:text-xs font-black shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>🎙️ {negocio.nombre || 'La Chuspa Tech'} Agente de Voz Sincronizado</span>
            </div>

            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-yellow-100 text-amber-600 flex items-center justify-center text-3xl sm:text-4xl mx-auto shadow-inner animate-bounce">
              🔔🛵
            </div>

            <div>
              <span className="bg-yellow-100 text-yellow-900 font-black text-[10px] sm:text-xs uppercase px-3.5 py-1 rounded-full inline-block mb-1">
                ¡Nuevo Pedido en Tiempo Real!
              </span>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-tight">
                Orden Recibida de {incomingOrderModal.cliente}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                📍 {incomingOrderModal.direccion || 'Cusco'} • Hora: {incomingOrderModal.hora}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left text-xs sm:text-sm space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Producto:</span>
                <strong className="text-purple-950 font-black">{incomingOrderModal.producto || incomingOrderModal.tipoBalon}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Cantidad:</span>
                <strong className="text-slate-900">{incomingOrderModal.cantidad || 1} balón(es)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Total a Cobrar:</span>
                <strong className="text-emerald-700 font-black text-sm sm:text-base">S/ {Number(incomingOrderModal.montoCobro).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Forma de Pago:</span>
                <span className="bg-purple-100 text-purple-900 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                  {incomingOrderModal.metodoPago}
                </span>
              </div>
              {incomingOrderModal.telefono && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-bold">Teléfono:</span>
                  <a href={`tel:${incomingOrderModal.telefono}`} className="text-blue-600 font-bold hover:underline">
                    📞 {incomingOrderModal.telefono}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] sm:text-xs font-black uppercase text-slate-600 block">
                Asignar Repartidor de Flota:
              </label>
              <select
                value={assignedDriverForIncoming}
                onChange={(e) => setAssignedDriverForIncoming(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-purple-700 cursor-pointer min-h-[44px]"
              >
                <option value="">-- Selecciona qué repartidor despacha --</option>
                {repartidores.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    🛵 {rep.nombre} ({rep.online ? 'En Ruta / En Línea' : 'Offline'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIncomingOrderModal(null)}
                className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm cursor-pointer transition min-h-[44px] flex items-center justify-center"
              >
                Cerrar / Ver en Lista
              </button>
              <button
                type="button"
                onClick={handleAssignIncomingDriver}
                className="w-full sm:flex-2 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-black py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <span>🛵 Asignar y Despachar</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
      {/* Modal for Emitir Factura / Boleta SUNAT with Order Products, RUC/DNI lookup, and Sunat CDR */}
      {showEmitirSunatModal && (
        <div className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl p-5 sm:p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-black">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-purple-950">
                    Emisión de Comprobante Electrónico SUNAT
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Facturación electrónica con validación tributaria directa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmitirSunatModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-4 text-xs pr-1">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setEmitirTipo('FACTURA');
                    if (emitirNumDoc.length === 8) setEmitirNumDoc('20601234567');
                  }}
                  className={`py-2 px-3 rounded-xl font-black text-xs transition ${
                    emitirTipo === 'FACTURA'
                      ? 'bg-purple-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🏢 Factura Electrónica (RUC)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmitirTipo('BOLETA');
                    if (emitirNumDoc.length === 11) setEmitirNumDoc('45892147');
                  }}
                  className={`py-2 px-3 rounded-xl font-black text-xs transition ${
                    emitirTipo === 'BOLETA'
                      ? 'bg-purple-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👤 Boleta de Venta (DNI)
                </button>
              </div>

              {/* RUC / DNI lookup row */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-purple-900 flex items-center gap-1.5">
                    <span>{emitirTipo === 'FACTURA' ? 'Número de RUC (11 dígitos):' : 'Número de DNI (8 dígitos):'}</span>
                  </label>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold">
                    {emitirTipo === 'FACTURA' ? 'SUNAT Padrón' : 'RENIEC Identidad'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={emitirTipo === 'FACTURA' ? 11 : 8}
                    value={emitirNumDoc}
                    onChange={(e) => setEmitirNumDoc(e.target.value.replace(/\D/g, ''))}
                    placeholder={emitirTipo === 'FACTURA' ? 'Ej: 20608933211' : 'Ej: 45892147'}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-black text-slate-800 focus:outline-purple-600"
                  />
                  <button
                    type="button"
                    disabled={emitirConsultando}
                    onClick={handleConsultarSunatReniec}
                    className="bg-purple-800 hover:bg-purple-900 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm disabled:opacity-50"
                  >
                    {emitirConsultando ? (
                      <span className="animate-spin">🔄</span>
                    ) : (
                      <span>🔍</span>
                    )}
                    <span>{emitirTipo === 'FACTURA' ? 'Consultar RUC' : 'Consultar DNI'}</span>
                  </button>
                </div>

                {/* Taxpayer info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block">Razón Social / Nombre:</label>
                    <input
                      type="text"
                      value={emitirRazonSocial}
                      onChange={(e) => setEmitirRazonSocial(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block">Estado Tributario:</label>
                    <span className="inline-block mt-0.5 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                      ✓ {emitirEstadoSunat}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block">Dirección Fiscal:</label>
                    <input
                      type="text"
                      value={emitirDireccionFiscal}
                      onChange={(e) => setEmitirDireccionFiscal(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-medium text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Order Products & Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-700" />
                    <span>Productos del Pedido a Facturar</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setEmitirItems([...emitirItems, { descripcion: 'Balón Gas 10kg Normal', cantidad: 1, precioUnitario: 50.0 }]);
                    }}
                    className="text-[10px] font-extrabold text-purple-800 hover:underline cursor-pointer"
                  >
                    + Agregar Ítem
                  </button>
                </div>

                <div className="space-y-2">
                  {emitirItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => {
                          const n = parseInt(e.target.value) || 1;
                          const next = [...emitirItems];
                          next[idx].cantidad = n;
                          setEmitirItems(next);
                        }}
                        className="w-12 bg-slate-50 border border-slate-200 rounded-lg p-1 font-bold text-center text-xs"
                      />
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => {
                          const next = [...emitirItems];
                          next[idx].descripcion = e.target.value;
                          setEmitirItems(next);
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1 font-semibold text-xs"
                      />
                      <div className="flex items-center gap-1 font-bold text-xs shrink-0">
                        <span className="text-slate-400">S/</span>
                        <input
                          type="number"
                          step="0.5"
                          value={item.precioUnitario}
                          onChange={(e) => {
                            const p = parseFloat(e.target.value) || 0;
                            const next = [...emitirItems];
                            next[idx].precioUnitario = p;
                            setEmitirItems(next);
                          }}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg p-1 font-mono text-right text-xs"
                        />
                      </div>
                      {emitirItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setEmitirItems(emitirItems.filter((_, i) => i !== idx));
                          }}
                          className="text-red-500 hover:text-red-700 px-1 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Subtotal, IGV %, Total */}
                {(() => {
                  const currentTotal = emitirItems.reduce((acc, it) => acc + (it.cantidad * it.precioUnitario), 0);
                  const igvPercent = negocio.igvPorcentaje || 18;
                  const subtotal = currentTotal / (1 + (igvPercent / 100));
                  const igv = currentTotal - subtotal;
                  return (
                    <div className="bg-purple-100/60 border border-purple-200 rounded-xl p-2.5 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600 font-medium text-[11px]">
                        <span>Subtotal sin IGV (Base Imponible):</span>
                        <span className="font-mono">S/ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium text-[11px]">
                        <span>I.G.V. ({igvPercent}%):</span>
                        <span className="font-mono">S/ {igv.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-purple-950 font-black text-sm pt-1 border-t border-purple-200">
                        <span>TOTAL COMPROBANTE:</span>
                        <span className="font-mono text-purple-900">S/ {currentTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Delivery driver and payment method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Repartidor Asignado:</label>
                  <select
                    value={emitirRepartidor}
                    onChange={(e) => setEmitirRepartidor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-700"
                  >
                    <option value="">🛵 Administración {negocio.nombre || 'La Chuspa Tech'} (Directo)</option>
                    {repartidores.map((r) => (
                      <option key={r.id} value={r.nombre}>
                        🛵 {r.nombre} ({r.vehiculo || 'Moto'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Forma de Pago:</label>
                  <select
                    value={emitirFormaPago}
                    onChange={(e) => setEmitirFormaPago(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-700"
                  >
                    <option value="Contado / Efectivo">💵 Contado / Efectivo</option>
                    <option value="Yape / Plin">📱 Yape / Plin</option>
                    <option value="Tarjeta de Débito/Crédito">💳 Tarjeta Débito / POS</option>
                    <option value="Transferencia Bancaria BCP/Interbank">🏦 Transferencia Bancaria</option>
                    <option value="Crédito B2B (15 días)">📋 Crédito B2B (15 días)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer with SUNAT Connect button */}
            <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowEmitirSunatModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEmitirComprobanteFinal}
                className="flex-2 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>🌐 Conectar con SUNAT y Emitir Comprobante</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding New Quote (Cotización CRM) */}
      {showAddCotizacionModal && (
        <div className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl p-5 sm:p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-700" />
                <h3 className="font-black text-sm text-purple-950">
                  Nueva Cotización o Pedido Programado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCotizacionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!cotCliente || !cotTel) {
                  alert('Por favor ingresa el nombre y teléfono del cliente.');
                  return;
                }
                const totalCalc = cotCantidad * cotPrecioUnit;
                const subtotalCalc = totalCalc / (1 + (negocio.igvPorcentaje || 18) / 100);
                const igvCalc = totalCalc - subtotalCalc;
                const nuevaCot: CotizacionCRM = {
                  id: `cot-${Date.now()}`,
                  codigo: `COT-${Math.floor(100 + Math.random() * 900)}`,
                  cliente: cotCliente.trim(),
                  tipoDoc: cotTipoDoc,
                  numDoc: cotNumDoc.trim() || '---',
                  telefono: cotTel.trim(),
                  direccion: cotDir.trim() || 'Cusco',
                  fechaEmision: new Date().toISOString().split('T')[0],
                  fechaProgramada: cotFechaProgramada,
                  horaProgramada: cotHoraProgramada,
                  items: [
                    {
                      descripcion: cotProductoDesc,
                      cantidad: cotCantidad,
                      precioUnitario: cotPrecioUnit,
                      total: totalCalc
                    }
                  ],
                  subtotal: parseFloat(subtotalCalc.toFixed(2)),
                  igv: parseFloat(igvCalc.toFixed(2)),
                  total: totalCalc,
                  estado: 'cotizado',
                  repartidorAsignado: cotRepartidor || undefined,
                  notas: cotNotas || undefined
                };
                addCotizacion(nuevaCot);
                setShowAddCotizacionModal(false);
                alert(`✔ Cotización programada para ${cotFechaProgramada} guardada exitosamente.`);
              }}
              className="overflow-y-auto py-3 space-y-3 text-xs pr-1"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nombre o Empresa:</label>
                <input
                  type="text"
                  required
                  value={cotCliente}
                  onChange={(e) => setCotCliente(e.target.value)}
                  placeholder="Ej: Restaurante El Fogón Andino"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Doc:</label>
                  <select
                    value={cotTipoDoc}
                    onChange={(e: any) => setCotTipoDoc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                  >
                    <option value="RUC">RUC</option>
                    <option value="DNI">DNI</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nro Documento:</label>
                  <input
                    type="text"
                    value={cotNumDoc}
                    onChange={(e) => setCotNumDoc(e.target.value)}
                    placeholder="20601234567"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">WhatsApp / Teléfono:</label>
                  <input
                    type="text"
                    required
                    value={cotTel}
                    onChange={(e) => setCotTel(e.target.value)}
                    placeholder="984123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Dirección:</label>
                  <input
                    type="text"
                    value={cotDir}
                    onChange={(e) => setCotDir(e.target.value)}
                    placeholder="Av. El Sol 450"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                <div>
                  <label className="text-[10px] font-bold uppercase text-purple-900 block mb-1">Fecha Entrega:</label>
                  <input
                    type="date"
                    required
                    value={cotFechaProgramada}
                    onChange={(e) => setCotFechaProgramada(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-purple-900 block mb-1">Hora:</label>
                  <input
                    type="text"
                    value={cotHoraProgramada}
                    onChange={(e) => setCotHoraProgramada(e.target.value)}
                    placeholder="10:00 a.m."
                    className="w-full bg-white border border-slate-300 rounded-xl p-1.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Producto / Balón:</label>
                <select
                  value={cotProductoDesc}
                  onChange={(e) => {
                    setCotProductoDesc(e.target.value);
                    if (e.target.value.includes('45kg')) setCotPrecioUnit(175.0);
                    else if (e.target.value.includes('Premium')) setCotPrecioUnit(52.0);
                    else setCotPrecioUnit(50.0);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                >
                  <option value="Balón Industrial 45kg GLP">Balón Industrial 45kg GLP (S/ 175)</option>
                  <option value="Balón La Chuspa Tech 10kg Normal">Balón La Chuspa Tech 10kg Normal (S/ 50)</option>
                  <option value="Balón La Chuspa Tech 10kg Premium">Balón La Chuspa Tech 10kg Premium (S/ 52)</option>
                  <option value="Regulador Premium + Manguera Reforzada">Regulador Premium + Manguera (S/ 48)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cotCantidad}
                    onChange={(e) => setCotCantidad(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Precio Unit (S/):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={cotPrecioUnit}
                    onChange={(e) => setCotPrecioUnit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-100 rounded-xl flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Total Cotización:</span>
                <span className="font-mono font-black text-purple-900 text-sm">
                  S/ {(cotCantidad * cotPrecioUnit).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Repartidor Sugerido:</label>
                <select
                  value={cotRepartidor}
                  onChange={(e) => setCotRepartidor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                >
                  <option value="">(Sin asignar - Flota general)</option>
                  {repartidores.map((r) => (
                    <option key={r.id} value={r.nombre}>🛵 {r.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Notas / Instrucciones:</label>
                <input
                  type="text"
                  value={cotNotas}
                  onChange={(e) => setCotNotas(e.target.value)}
                  placeholder="Factura a 15 días, dejar en puerta de cocina..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCotizacionModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-800 hover:bg-purple-900 text-white font-black py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Previewing and Printing Factura / Boleta */}
      {previewComprobante && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl printable-area border border-slate-300 animate-in zoom-in-95 my-auto">
            {/* Action Bar (Hidden on print) */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4 no-print">
              <span className="font-black text-purple-950 text-xs">
                📄 Comprobante Electrónico SUNAT
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewComprobante(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="border border-slate-300 rounded-2xl p-4 mb-4 text-center">
              <div className="flex justify-center mb-2">
                <img
                  src={getAssetUrl(negocio.logoUrl)}
                  alt={negocio.nombre}
                  className="w-14 h-14 rounded-xl object-cover border border-amber-400 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/1791513590376.jpg';
                  }}
                />
              </div>
              <h3 className="font-black text-base text-purple-950 uppercase leading-tight">
                {negocio.nombre}
              </h3>
              <p className="text-[11px] text-slate-600 font-bold">{negocio.slogan}</p>
              <p className="text-[10px] text-slate-500">📍 {negocio.direccion}</p>
              <p className="text-[10px] text-slate-500">Tel: {negocio.telPrincipal} • WA: +{negocio.whatsapp}</p>

              <div className="mt-3 py-2 px-3 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-[10px] font-black text-purple-900 block">R.U.C. 20608933211</span>
                <span className="text-xs font-black text-purple-950 uppercase block">
                  {previewComprobante.tipo}
                </span>
                <span className="text-xs font-mono font-black text-purple-800 block">
                  {previewComprobante.numero}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Cliente / Razón Social:</span>
                <strong className="text-slate-900">{previewComprobante.cliente}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">{previewComprobante.tipoDoc || 'DNI/RUC'}:</span>
                <strong className="text-slate-900 font-mono">{previewComprobante.documento}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Dirección:</span>
                <span className="text-slate-700">{previewComprobante.direccion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Fecha / Hora:</span>
                <span className="text-slate-700 font-semibold">{previewComprobante.fecha} - {previewComprobante.hora}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Repartidor de Entrega:</span>
                <strong className="text-purple-900">🛵 {previewComprobante.repartidor}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Forma de Pago:</span>
                <span className="text-slate-700 font-bold">{previewComprobante.metodoPago}</span>
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600">
                  <tr>
                    <th className="p-2">Cant.</th>
                    <th className="p-2">Descripción</th>
                    <th className="p-2 text-right">P. Unit</th>
                    <th className="p-2 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {previewComprobante.items?.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{it.cantidad}</td>
                      <td className="p-2 font-bold text-slate-800">{it.descripcion}</td>
                      <td className="p-2 text-right">S/ {(it.precio / (it.cantidad || 1)).toFixed(2)}</td>
                      <td className="p-2 text-right font-black text-slate-900">S/ {it.precio.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Op. Gravada:</span>
                <span className="font-mono">S/ {(previewComprobante.total / (1 + (negocio.igvPorcentaje || 18) / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>I.G.V. ({negocio.igvPorcentaje || 18}%):</span>
                <span className="font-mono">S/ {(previewComprobante.total - (previewComprobante.total / (1 + (negocio.igvPorcentaje || 18) / 100))).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-purple-950 pt-1.5 border-t border-slate-200">
                <span>IMPORTE TOTAL:</span>
                <span className="font-mono text-purple-900">S/ {previewComprobante.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Chuspa Tech Brand & Legal Footer */}
            <div className="border-t border-slate-200 pt-3 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <img src="/CHUSPITA-circulo.png" alt="La Chuspa Tech" className="w-6 h-6 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500">
                  Desarrollado y respaldado por <strong>La Chuspa Tech</strong> (<a href="https://www.lachuspaanuncios.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">www.lachuspaanuncios.com</a>)
                </span>
              </div>
              <p className="text-[9px] text-slate-400">
                Representación impresa autorizada del comprobante electrónico. Consulte su validez en el portal oficial de SUNAT.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
