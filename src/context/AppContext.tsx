import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Producto,
  Accesorio,
  TelefonosConfig,
  NegocioIdentidad,
  Repartidor,
  EmpresaB2B,
  ClienteVIP,
  VentaRegistro,
  Pedido,
  ItemPedido,
  CRMPlantilla,
  CotizacionCRM,
  ClienteFidelidad
} from '../types/index';
import {
  INITIAL_PRODUCTOS,
  INITIAL_ACCESORIOS,
  INITIAL_TELEFONOS,
  INITIAL_NEGOCIO,
  INITIAL_REPARTIDORES,
  INITIAL_EMPRESAS_B2B,
  INITIAL_CLIENTES_VIP,
  INITIAL_PEDIDOS,
  INITIAL_VENTAS,
  INITIAL_CRM_PLANTILLAS,
  INITIAL_COTIZACIONES,
  INITIAL_CLUB_FIDELIDAD
} from '../data/initialData';
import { playChimeSound, playSuccessChime, playAndSpeak, speakVoice } from '../utils/audio';
import { fetchStoreFromCloud, pushStoreToGitHub, CloudStorePayload } from '../utils/cloudSync';
import { ref as fbRef, update as fbUpdate } from 'firebase/database';
import { FIREBASE_ENABLED, fbDb } from '../utils/firebase';
import { useFirebaseSync, loginStaff, logoutStaff, newVentaIds } from '../utils/useFirebaseSync';

function hashStr(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export function broadcastLiveEvent(payload: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('leogas_realtime_sync');
      bc.postMessage(payload);
      bc.close();
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('leogas_live_tick', JSON.stringify({ ...payload, _t: Date.now() }));
    }
  } catch {}
}


interface AppContextType {
  activePortal: 'cliente' | 'admin' | 'repartidor';
  setActivePortal: (portal: 'cliente' | 'admin' | 'repartidor') => void;
  
  // Catalogs
  productos: Producto[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  updateProducto: (p: Producto) => void;
  addProducto: (p: Producto) => void;
  deleteProducto: (id: string) => void;

  accesorios: Accesorio[];
  updateAccesorio: (a: Accesorio) => void;
  addAccesorio: (a: Accesorio) => void;
  deleteAccesorio: (id: string) => void;

  telefonos: TelefonosConfig;
  updateTelefonos: (t: TelefonosConfig) => void;

  // Business Identity
  negocio: NegocioIdentidad;
  updateNegocio: (n: Partial<NegocioIdentidad>) => void;
  resetNegocio: () => void;
  resetDesarrollador: () => void;
  resetPedidosYVentas: () => void;

  // Fleet
  repartidores: Repartidor[];
  addRepartidor: (r: Repartidor) => void;
  updateRepartidor: (r: Repartidor) => void;
  deleteRepartidor: (id: string) => void;
  toggleRepartidorOnline: (id: string) => void;
  setRepartidorCoords: (id: string, lat: number, lng: number) => void;

  // B2B & VIP
  empresasB2B: EmpresaB2B[];
  addEmpresaB2B: (e: EmpresaB2B) => void;
  deleteEmpresaB2B: (ruc: string) => void;

  clientesVIP: ClienteVIP[];
  addClienteVIP: (c: ClienteVIP) => void;
  updateClienteVIP: (c: ClienteVIP) => void;
  deleteClienteVIP: (id: string) => void;

  // Orders & Sales
  pedidos: Pedido[];
  createPedido: (pedido: Omit<Pedido, 'id' | 'timestamp' | 'hora' | 'estado' | 'etapa'>) => string;
  assignPedido: (pedidoId: string, repartidorId: string) => void;
  advancePedidoEtapa: (pedidoId: string) => void;
  completePedido: (pedidoId: string) => void;
  deletePedido: (pedidoId: string) => void;

  ventas: VentaRegistro[];
  addVenta: (v: VentaRegistro) => void;

  // Cart
  carrito: Record<string, ItemPedido>;
  addToCart: (item: { id: string; nombre: string; precio: number }) => void;
  updateCartQty: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Customer Tracking
  activeCustomerOrderId: string | null;
  activeCustomerOrder: Pedido | null;
  setActiveCustomerOrderId: (id: string | null) => void;

  // Alert Modals
  alertModal: 'en_camino' | 'en_puerta' | 'completado' | 'asignando' | null;
  openAlertModal: (type?: 'en_camino' | 'en_puerta' | 'completado' | 'asignando') => void;
  closeAlertModal: () => void;
  notificarClienteSaliendo: (pedidoId: string) => void;
  acknowledgeClienteSaliendo: (pedidoId: string) => void;

  // CRM & Cotizaciones
  crmPlantillas: CRMPlantilla[];
  updateCRMPlantilla: (p: CRMPlantilla) => void;
  cotizaciones: CotizacionCRM[];
  addCotizacion: (c: CotizacionCRM) => void;
  updateCotizacion: (c: CotizacionCRM) => void;
  deleteCotizacion: (id: string) => void;

  // Club de Fidelidad (Sellos por Consumo)
  clubFidelidad: ClienteFidelidad[];
  consultarSellos: (dni: string) => ClienteFidelidad | null;
  sumarSelloFidelidad: (
    dni: string,
    nombre?: string,
    telefono?: string,
    detalle?: string,
    cantidad?: number
  ) => { cliente: ClienteFidelidad; premioDesbloqueado: boolean };
  canjearPremioFidelidad: (dni: string) => boolean;
  setSellosManual: (dni: string, sellos: number) => void;
  registrarNuevoClienteFidelidad: (cliente: Omit<ClienteFidelidad, 'id'>) => void;
  deleteClienteFidelidad: (id: string) => void;

  // Authentication
  isAdminLogged: boolean;
  adminLogin: (u: string, p: string) => Promise<boolean>;
  authError: string;
  adminLogout: () => void;

  currentRepartidor: Repartidor | null;
  repartidorLogin: (u: string, p: string, repId?: string) => Promise<boolean>;
  repartidorLogout: () => void;

  // Cloud Sync (Cross-Device Global Sync)
  isSyncingCloud: boolean;
  cloudSyncStatus: { ok: boolean; msg: string; time?: string } | null;
  publicarCambiosEnLaNube: () => Promise<{ ok: boolean; msg: string }>;
  cargarDatosDeLaNube: (force?: boolean) => Promise<boolean>;

  // Estado de la conexión con Firebase
  cloudStatus: { ready: boolean; connected: boolean; role: string; error?: string };

  // Notificación de actualización en tiempo real para clientes (5 segundos)
  dbUpdateToast: string | null;
  dismissDbUpdateToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function detectInitialPortal(): 'cliente' | 'admin' | 'repartidor' {
  if (typeof window === 'undefined') return 'cliente';
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.includes('admin') || search.includes('portal=admin') || hash.includes('admin')) {
    return 'admin';
  }
  if (path.includes('repartidor') || search.includes('portal=repartidor') || hash.includes('repartidor')) {
    return 'repartidor';
  }
  return 'cliente';
}

export const AppProvider: React.FC<{ children: React.ReactNode; initialPortal?: 'cliente' | 'admin' | 'repartidor' }> = ({
  children,
  initialPortal
}) => {
  const [activePortal, setActivePortal] = useState<'cliente' | 'admin' | 'repartidor'>(
    initialPortal || detectInitialPortal()
  );

  const [productos, setProductos] = useState<Producto[]>(() => getStored('leogas_productos', INITIAL_PRODUCTOS));
  const [accesorios, setAccesorios] = useState<Accesorio[]>(() => getStored('leogas_accesorios', INITIAL_ACCESORIOS));
  const [telefonos, setTelefonos] = useState<TelefonosConfig>(() => {
    const stored = getStored<TelefonosConfig>('leogas_telefonos', INITIAL_TELEFONOS);
    if (!stored || stored.tel1 === '950 727 212' || stored.whatsapp === '51969773064') {
      return INITIAL_TELEFONOS;
    }
    return stored;
  });
  const [negocio, setNegocio] = useState<NegocioIdentidad>(() => {
    const stored = getStored<NegocioIdentidad>('leogas_negocio', INITIAL_NEGOCIO);
    if (!stored || stored.nombre === 'LeoGas Cusco' || !stored.nombre) {
      return INITIAL_NEGOCIO;
    }
    return { ...INITIAL_NEGOCIO, ...stored, igvPorcentaje: stored.igvPorcentaje || 18 };
  });
  const [repartidores, setRepartidores] = useState<Repartidor[]>(() => getStored('leogas_repartidores', INITIAL_REPARTIDORES));
  const [empresasB2B, setEmpresasB2B] = useState<EmpresaB2B[]>(() => getStored('leogas_empresas_b2b', INITIAL_EMPRESAS_B2B));
  const [clientesVIP, setClientesVIP] = useState<ClienteVIP[]>(() => getStored('leogas_clientes_vip', INITIAL_CLIENTES_VIP));
  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    const stored = getStored<Pedido[]>('leogas_pedidos', INITIAL_PEDIDOS);
    return (stored || []).filter(
      (p) =>
        p &&
        p.id &&
        !p.id.startsWith('cmd-179259') &&
        !p.id.startsWith('cmd-179260') &&
        p.cliente !== 'Milla' &&
        p.cliente !== 'Mimi'
    );
  });
  const [ventas, setVentas] = useState<VentaRegistro[]>(() => {
    const stored = getStored<VentaRegistro[]>('leogas_ventas', INITIAL_VENTAS);
    return (stored || [])
      .filter(
        (v) =>
          v &&
          v.cliente !== 'Milla' &&
          v.cliente !== 'Mimi' &&
          v.cliente !== 'Rosa Quispe Huamán' &&
          v.cliente !== 'Carmen Luz Delgado'
      )
      .map((v) => (v.id ? v : { ...v, id: `vta-old-${hashStr(JSON.stringify(v))}` }));
  });
  const [crmPlantillas, setCrmPlantillas] = useState<CRMPlantilla[]>(() => getStored('leogas_crm_plantillas', INITIAL_CRM_PLANTILLAS));
  const [cotizaciones, setCotizaciones] = useState<CotizacionCRM[]>(() => getStored('leogas_cotizaciones', INITIAL_COTIZACIONES));
  const [clubFidelidad, setClubFidelidad] = useState<ClienteFidelidad[]>(() => getStored('leogas_club_fidelidad', INITIAL_CLUB_FIDELIDAD));

  const [carrito, setCarrito] = useState<Record<string, ItemPedido>>({});
  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState<string | null>(() => localStorage.getItem('leogas_mi_pedido_id'));
  const [alertModal, setAlertModal] = useState<'en_camino' | 'en_puerta' | 'completado' | 'asignando' | null>(null);

  const [authError, setAuthError] = useState('');

  // Sincronización en la nube (Firebase Realtime Database + Authentication)
  const { auth, connected, syncError } = useFirebaseSync({
    productos, setProductos,
    accesorios, setAccesorios,
    telefonos, setTelefonos,
    negocio,
    setNegocio: (v: any) => setNegocio({ ...INITIAL_NEGOCIO, ...v, igvPorcentaje: (v && v.igvPorcentaje) || 18 }),
    empresasB2B, setEmpresasB2B,
    clientesVIP, setClientesVIP,
    crmPlantillas, setCrmPlantillas,
    cotizaciones, setCotizaciones,
    clubFidelidad, setClubFidelidad,
    repartidores, setRepartidores,
    pedidos, setPedidos,
    ventas, setVentas,
    activeCustomerOrderId
  });
  const isAdminLogged = auth.role === 'admin';
  const currentRepartidorId: string | null = auth.role === 'repartidor' ? auth.repartidorId || null : null;

  // Notificación de actualización en tiempo real para clientes (5 segundos)
  const [dbUpdateToast, setDbUpdateToast] = useState<string | null>(null);
  const dbToastTimeoutRef = useRef<any>(null);
  const isInitialSyncDone = useRef(false);

  const showDatabaseUpdateToast = (customMsg?: string) => {
    if (activePortal !== 'cliente') return;
    if (dbToastTimeoutRef.current) clearTimeout(dbToastTimeoutRef.current);
    setDbUpdateToast(
      customMsg || '🛡️ Por su seguridad, se está actualizando nuestra base de datos con los últimos precios y disponibilidad.'
    );
    dbToastTimeoutRef.current = setTimeout(() => {
      setDbUpdateToast(null);
    }, 5000);
  };

  const dismissDbUpdateToast = () => {
    if (dbToastTimeoutRef.current) clearTimeout(dbToastTimeoutRef.current);
    setDbUpdateToast(null);
  };

  // Esperar 2.5s después de cargar para no mostrar alerta en la carga inicial de la página
  useEffect(() => {
    const t = setTimeout(() => {
      isInitialSyncDone.current = true;
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  // Escuchar evento de actualización de base de datos desde Firebase o cambios remotos
  useEffect(() => {
    const handleDbUpdated = () => {
      if (isInitialSyncDone.current && activePortal === 'cliente') {
        showDatabaseUpdateToast();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('leogas_db_updated', handleDbUpdated);
      return () => window.removeEventListener('leogas_db_updated', handleDbUpdated);
    }
  }, [activePortal]);

  // Realtime BroadcastChannel & Storage Sync between Index, Repartidor and Admin
  useEffect(() => {
    // Con Firebase activo, la sincronización entre dispositivos la hace la nube (no localStorage).
    if (FIREBASE_ENABLED) return;
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('leogas_realtime_sync');
        bc.onmessage = (e) => {
          const data = e.data;
          if (!data || !data.type) return;

          if (data.type === 'ETAPA_CHANGED' || data.type === 'PEDIDOS_SYNC') {
            if (data.pedidos) {
              setPedidos(data.pedidos);
            }
            // Only trigger voice/alert popup on the customer portal
            if (activePortal === 'cliente') {
              const myOrderId = localStorage.getItem('leogas_mi_pedido_id');
              if (myOrderId && myOrderId === data.pedidoId) {
                if (data.nextEtapa === 1) {
                  setAlertModal('en_camino');
                  playAndSpeak("¡Atención! Su balón de gas está en camino. Su repartidor va hacia su domicilio.");
                } else if (data.nextEtapa === 2) {
                  setAlertModal('en_puerta');
                  playAndSpeak("¡Atención! Su repartidor ya está en su puerta. Por favor presione salir a recibir.");
                } else if (data.nextEtapa >= 3) {
                  setAlertModal('completado');
                  playAndSpeak(`¡Muchas gracias por su compra en ${negocio.nombre || 'La Chuspa Tech'}! Su pedido ha sido entregado exitosamente. Por favor califíquenos con 5 estrellas en Google.`, true);
                }
              }
            }
          } else if (data.type === 'CLIENTE_SALIENDO') {
            setPedidos((prev) =>
              prev.map((p) => (p.id === data.pedidoId ? { ...p, clienteSaliendo: true } : p))
            );
          } else if (data.type === 'CLIENTE_SALIENDO_ACKNOWLEDGED') {
            setPedidos((prev) =>
              prev.map((p) => (p.id === data.pedidoId ? { ...p, clienteSaliendo: false, clienteSaliendoVisto: true } : p))
            );
          } else if (data.type === 'NEW_PEDIDO' && data.pedido) {
            setPedidos((prev) => [data.pedido, ...prev.filter((p) => p.id !== data.pedido.id)]);
          } else if (data.type === 'CLUB_FIDELIDAD_UPDATE' && data.clubFidelidad) {
            setClubFidelidad(data.clubFidelidad);
          } else if (data.type === 'NEGOCIO_SYNC' && data.negocio) {
            setNegocio(data.negocio);
            if (data.negocio.whatsapp || data.negocio.telPrincipal) {
              setTelefonos((prev) => ({
                ...prev,
                whatsapp: data.negocio.whatsapp || prev.whatsapp,
                tel1: data.negocio.telPrincipal || prev.tel1,
                tel2: data.negocio.telSecundario || prev.tel2,
                tel3: data.negocio.telFijo || prev.tel3
              }));
            }
          } else if (data.type === 'PRODUCTOS_SYNC' && data.productos) {
            setProductos(data.productos);
          } else if (data.type === 'ACCESORIOS_SYNC' && data.accesorios) {
            setAccesorios(data.accesorios);
          } else if (data.type === 'TELEFONOS_SYNC' && data.telefonos) {
            setTelefonos(data.telefonos);
          } else if (data.type === 'REPARTIDORES_SYNC' && data.repartidores) {
            setRepartidores(data.repartidores);
          } else if (data.type === 'FULL_RESET_SYNC') {
            if (data.productos) setProductos(data.productos);
            if (data.accesorios) setAccesorios(data.accesorios);
            if (data.telefonos) setTelefonos(data.telefonos);
            if (data.negocio) setNegocio(data.negocio);
            if (data.repartidores) setRepartidores(data.repartidores);
            if (data.empresasB2B) setEmpresasB2B(data.empresasB2B);
            if (data.clientesVIP) setClientesVIP(data.clientesVIP);
            if (data.pedidos) setPedidos(data.pedidos);
            if (data.ventas) setVentas(data.ventas);
            if (data.crmPlantillas) setCrmPlantillas(data.crmPlantillas);
            if (data.cotizaciones) setCotizaciones(data.cotizaciones);
            if (data.clubFidelidad) setClubFidelidad(data.clubFidelidad);
            setCarrito({});
            setActiveCustomerOrderId(null);
            setAlertModal(null);
          }
        };
      } catch {}
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === 'leogas_pedidos') setPedidos(JSON.parse(e.newValue));
        if (e.key === 'leogas_repartidores') setRepartidores(JSON.parse(e.newValue));
        if (e.key === 'leogas_productos') setProductos(JSON.parse(e.newValue));
        if (e.key === 'leogas_accesorios') setAccesorios(JSON.parse(e.newValue));
        if (e.key === 'leogas_telefonos') setTelefonos(JSON.parse(e.newValue));
        if (e.key === 'leogas_negocio') setNegocio(JSON.parse(e.newValue));
        if (e.key === 'leogas_empresas_b2b') setEmpresasB2B(JSON.parse(e.newValue));
        if (e.key === 'leogas_clientes_vip') setClientesVIP(JSON.parse(e.newValue));
        if (e.key === 'leogas_ventas') setVentas(JSON.parse(e.newValue));
        if (e.key === 'leogas_crm_plantillas') setCrmPlantillas(JSON.parse(e.newValue));
        if (e.key === 'leogas_cotizaciones') setCotizaciones(JSON.parse(e.newValue));
        if (e.key === 'leogas_club_fidelidad') setClubFidelidad(JSON.parse(e.newValue));
        if (e.key === 'leogas_mi_pedido_id') setActiveCustomerOrderId(e.newValue);
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Fast Polling (250ms) to guarantee zero latency between independent tabs
    const pollInterval = setInterval(() => {
      try {
        const storedPedidos = localStorage.getItem('leogas_pedidos');
        if (storedPedidos) {
          const parsed = JSON.parse(storedPedidos);
          setPedidos((prev) => {
            if (JSON.stringify(prev) !== storedPedidos) return parsed;
            return prev;
          });
        }
        const storedReps = localStorage.getItem('leogas_repartidores');
        if (storedReps) {
          const parsed = JSON.parse(storedReps);
          setRepartidores((prev) => {
            if (JSON.stringify(prev) !== storedReps) return parsed;
            return prev;
          });
        }
        const storedNegocio = localStorage.getItem('leogas_negocio');
        if (storedNegocio) {
          const parsed = JSON.parse(storedNegocio);
          setNegocio((prev) => {
            if (JSON.stringify(prev) !== storedNegocio) return parsed;
            return prev;
          });
        }
        const storedProds = localStorage.getItem('leogas_productos');
        if (storedProds) {
          const parsed = JSON.parse(storedProds);
          setProductos((prev) => {
            if (JSON.stringify(prev) !== storedProds) return parsed;
            return prev;
          });
        }
        const storedAccs = localStorage.getItem('leogas_accesorios');
        if (storedAccs) {
          const parsed = JSON.parse(storedAccs);
          setAccesorios((prev) => {
            if (JSON.stringify(prev) !== storedAccs) return parsed;
            return prev;
          });
        }
        const storedTels = localStorage.getItem('leogas_telefonos');
        if (storedTels) {
          const parsed = JSON.parse(storedTels);
          setTelefonos((prev) => {
            if (JSON.stringify(prev) !== storedTels) return parsed;
            return prev;
          });
        }
        const storedClub = localStorage.getItem('leogas_club_fidelidad');
        if (storedClub) {
          const parsed = JSON.parse(storedClub);
          setClubFidelidad((prev) => {
            if (JSON.stringify(prev) !== storedClub) return parsed;
            return prev;
          });
        }
        const storedOrder = localStorage.getItem('leogas_mi_pedido_id');
        if (storedOrder) {
          setActiveCustomerOrderId((prev) => (prev !== storedOrder ? storedOrder : prev));
        }
      } catch (err) {
        // ignore
      }
    }, 250);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem('leogas_productos', JSON.stringify(productos)); }, [productos]);
  useEffect(() => { localStorage.setItem('leogas_accesorios', JSON.stringify(accesorios)); }, [accesorios]);
  useEffect(() => { localStorage.setItem('leogas_telefonos', JSON.stringify(telefonos)); }, [telefonos]);
  useEffect(() => { localStorage.setItem('leogas_negocio', JSON.stringify(negocio)); }, [negocio]);
  useEffect(() => { localStorage.setItem('leogas_repartidores', JSON.stringify(repartidores)); }, [repartidores]);
  useEffect(() => { localStorage.setItem('leogas_empresas_b2b', JSON.stringify(empresasB2B)); }, [empresasB2B]);
  useEffect(() => { localStorage.setItem('leogas_clientes_vip', JSON.stringify(clientesVIP)); }, [clientesVIP]);
  useEffect(() => { localStorage.setItem('leogas_pedidos', JSON.stringify(pedidos)); }, [pedidos]);
  useEffect(() => { localStorage.setItem('leogas_ventas', JSON.stringify(ventas)); }, [ventas]);
  useEffect(() => { localStorage.setItem('leogas_crm_plantillas', JSON.stringify(crmPlantillas)); }, [crmPlantillas]);
  useEffect(() => { localStorage.setItem('leogas_cotizaciones', JSON.stringify(cotizaciones)); }, [cotizaciones]);
  useEffect(() => { localStorage.setItem('leogas_club_fidelidad', JSON.stringify(clubFidelidad)); }, [clubFidelidad]);

  // Active customer order
  const activeCustomerOrder = activeCustomerOrderId
    ? pedidos.find((p) => p.id === activeCustomerOrderId) || null
    : null;

  // Watch for active customer order stage changes to trigger sound, voice agent & central alert modals
  useEffect(() => {
    if (activePortal !== 'cliente') return;
    if (!activeCustomerOrder) return;
    const stageKey = `leogas_last_seen_stage_${activeCustomerOrder.id}`;
    const lastSeen = localStorage.getItem(stageKey);
    const currentEtapa = activeCustomerOrder.etapa;

    if ((activeCustomerOrder.estado === 'completado' || currentEtapa >= 3) && lastSeen !== '3') {
      localStorage.setItem(stageKey, '3');
      setAlertModal('completado');
      playAndSpeak(
        `¡Muchas gracias por su compra en ${negocio.nombre || 'La Chuspa Tech'}! Su pedido ha sido entregado exitosamente. Por favor califíquenos con 5 estrellas en Google.`,
        true
      );
    } else if (currentEtapa === 1 && lastSeen !== '1') {
      localStorage.setItem(stageKey, '1');
      setAlertModal('en_camino');
      playAndSpeak("¡Atención! Su balón de gas está en camino. Su repartidor va hacia su domicilio.");
    } else if (currentEtapa === 2 && lastSeen !== '2') {
      localStorage.setItem(stageKey, '2');
      setAlertModal('en_puerta');
      playAndSpeak("¡Atención! Su repartidor ya está en su puerta. Por favor presione salir a recibir.");
    }
  }, [activeCustomerOrder, negocio.nombre]);

  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{ ok: boolean; msg: string; time?: string } | null>(null);

  // Cloud Auto-Fetch: check if cloud has updated store.json (for Android, iPhone, PC)
  const cargarDatosDeLaNube = async (force: boolean = false): Promise<boolean> => {
    try {
      const repo = localStorage.getItem('leogas_github_repo') || 'phyxcius/Leogascusco';
      const branch = localStorage.getItem('leogas_github_branch') || 'main';
      const cloudData = await fetchStoreFromCloud(repo, branch);
      if (cloudData && cloudData.negocio && Array.isArray(cloudData.productos)) {
        const localModified = Number(localStorage.getItem('leogas_last_modified') || 0);
        const cloudTime = cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : 0;

        // If not forced and local device has newer edits that haven't been pushed or were just saved, don't overwrite!
        if (!force && localModified > 0 && cloudTime > 0 && cloudTime <= localModified) {
          return false;
        }

        if (cloudData.negocio) {
          setNegocio(cloudData.negocio);
          localStorage.setItem('leogas_negocio', JSON.stringify(cloudData.negocio));
        }
        if (cloudData.telefonos) {
          setTelefonos(cloudData.telefonos);
          localStorage.setItem('leogas_telefonos', JSON.stringify(cloudData.telefonos));
        }
        if (Array.isArray(cloudData.productos) && cloudData.productos.length > 0) {
          setProductos(cloudData.productos);
          localStorage.setItem('leogas_productos', JSON.stringify(cloudData.productos));
        }
        if (Array.isArray(cloudData.accesorios) && cloudData.accesorios.length > 0) {
          setAccesorios(cloudData.accesorios);
          localStorage.setItem('leogas_accesorios', JSON.stringify(cloudData.accesorios));
        }
        if (Array.isArray(cloudData.clubFidelidad) && cloudData.clubFidelidad.length > 0) {
          setClubFidelidad(cloudData.clubFidelidad);
          localStorage.setItem('leogas_club_fidelidad', JSON.stringify(cloudData.clubFidelidad));
        }
        localStorage.setItem('leogas_last_modified', (cloudTime || Date.now()).toString());
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  useEffect(() => {
    if (FIREBASE_ENABLED) return; // el catálogo ahora viaja por Firebase
    cargarDatosDeLaNube(false);
    // Periodically sync every 25 seconds for viewers on mobile/desktop
    const cloudInterval = setInterval(() => {
      cargarDatosDeLaNube(false);
    }, 25000);
    return () => clearInterval(cloudInterval);
  }, []);

  // Publish to GitHub Cloud (Cross-Device Global Sync)
  const publicarCambiosEnLaNube = async (): Promise<{ ok: boolean; msg: string }> => {
    setIsSyncingCloud(true);
    setCloudSyncStatus(null);
    try {
      const token = localStorage.getItem('leogas_github_token') || '';
      const repo = localStorage.getItem('leogas_github_repo') || 'phyxcius/Leogascusco';
      const branch = localStorage.getItem('leogas_github_branch') || 'main';

      const nowIso = new Date().toISOString();
      const payload: CloudStorePayload = {
        version: '2.1.0',
        updatedAt: nowIso,
        negocio,
        telefonos,
        productos,
        accesorios,
        clubFidelidad
      };

      const res = await pushStoreToGitHub(payload, token, repo, branch);
      setCloudSyncStatus({
        ok: res.ok,
        msg: res.msg,
        time: new Date().toLocaleTimeString('es-PE')
      });
      if (res.ok) {
        localStorage.setItem('leogas_last_modified', new Date(nowIso).getTime().toString());
        playSuccessChime();
        playAndSpeak('Catálogo e identidad publicados globalmente en la nube de GitHub con éxito.');
      } else {
        playChimeSound();
      }
      return res;
    } catch (err: any) {
      const errorMsg = `Error al publicar en la nube: ${err.message || 'Sin conexión'}`;
      setCloudSyncStatus({
        ok: false,
        msg: errorMsg,
        time: new Date().toLocaleTimeString('es-PE')
      });
      playChimeSound();
      return { ok: false, msg: errorMsg };
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Helper to broadcast changes across all open tabs and windows
  const broadcastSync = (type: string, payload: Record<string, any>) => {
    broadcastLiveEvent({ type, ...payload });
  };

  // Product CRUD
  const updateProducto = (p: Producto) => {
    setProductos(prev => {
      const updated = prev.map(item => item.id === p.id ? p : item);
      localStorage.setItem('leogas_productos', JSON.stringify(updated));
      localStorage.setItem('leogas_last_modified', Date.now().toString());
      broadcastSync('PRODUCTOS_SYNC', { productos: updated });
      return updated;
    });
  };
  const addProducto = (p: Producto) => {
    setProductos(prev => {
      const updated = [...prev, p];
      localStorage.setItem('leogas_productos', JSON.stringify(updated));
      localStorage.setItem('leogas_last_modified', Date.now().toString());
      broadcastSync('PRODUCTOS_SYNC', { productos: updated });
      return updated;
    });
  };
  const deleteProducto = (id: string) => {
    setProductos(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('leogas_productos', JSON.stringify(updated));
      localStorage.setItem('leogas_last_modified', Date.now().toString());
      broadcastSync('PRODUCTOS_SYNC', { productos: updated });
      return updated;
    });
  };

  // Accessories CRUD
  const updateAccesorio = (a: Accesorio) => {
    setAccesorios(prev => {
      const updated = prev.map(item => item.id === a.id ? a : item);
      localStorage.setItem('leogas_accesorios', JSON.stringify(updated));
      localStorage.setItem('leogas_last_modified', Date.now().toString());
      broadcastSync('ACCESORIOS_SYNC', { accesorios: updated });
      return updated;
    });
  };
  const addAccesorio = (a: Accesorio) => {
    setAccesorios(prev => {
      const updated = [...prev, a];
      localStorage.setItem('leogas_accesorios', JSON.stringify(updated));
      localStorage.setItem('leogas_last_modified', Date.now().toString());
      broadcastSync('ACCESORIOS_SYNC', { accesorios: updated });
      return updated;
    });
  };
  const deleteAccesorio = (id: string) => {
    setAccesorios(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('leogas_accesorios', JSON.stringify(updated));
      localStorage.setItem('leogas_last_modified', Date.now().toString());
      broadcastSync('ACCESORIOS_SYNC', { accesorios: updated });
      return updated;
    });
  };

  // Phones
  const updateTelefonos = (t: TelefonosConfig) => {
    setTelefonos(t);
    localStorage.setItem('leogas_telefonos', JSON.stringify(t));
    localStorage.setItem('leogas_last_modified', Date.now().toString());
    broadcastSync('TELEFONOS_SYNC', { telefonos: t });
  };

  // Business Identity
  const updateNegocio = (n: Partial<NegocioIdentidad>) => {
    setNegocio(prev => {
      const updated = { ...prev, ...n };
      const updatedTels: TelefonosConfig = {
        ...telefonos,
        whatsapp: updated.whatsapp || telefonos.whatsapp,
        tel1: updated.telPrincipal || telefonos.tel1,
        tel2: updated.telSecundario || telefonos.tel2,
        tel3: updated.telFijo || telefonos.tel3
      };
      setTelefonos(updatedTels);

      localStorage.setItem('leogas_negocio', JSON.stringify(updated));
      localStorage.setItem('leogas_telefonos', JSON.stringify(updatedTels));
      localStorage.setItem('leogas_last_modified', Date.now().toString());

      broadcastSync('NEGOCIO_SYNC', { negocio: updated });
      broadcastSync('TELEFONOS_SYNC', { telefonos: updatedTels });
      return updated;
    });
  };

  const resetNegocio = () => {
    setNegocio(INITIAL_NEGOCIO);
    setTelefonos(INITIAL_TELEFONOS);
    localStorage.setItem('leogas_negocio', JSON.stringify(INITIAL_NEGOCIO));
    localStorage.setItem('leogas_telefonos', JSON.stringify(INITIAL_TELEFONOS));
    localStorage.setItem('leogas_last_modified', Date.now().toString());
    broadcastSync('NEGOCIO_SYNC', { negocio: INITIAL_NEGOCIO });
    broadcastSync('TELEFONOS_SYNC', { telefonos: INITIAL_TELEFONOS });
  };

  const resetDesarrollador = () => {
    setProductos(INITIAL_PRODUCTOS);
    setAccesorios(INITIAL_ACCESORIOS);
    setTelefonos(INITIAL_TELEFONOS);
    setNegocio(INITIAL_NEGOCIO);
    setRepartidores(INITIAL_REPARTIDORES);
    setEmpresasB2B(INITIAL_EMPRESAS_B2B);
    setClientesVIP(INITIAL_CLIENTES_VIP);
    setPedidos(INITIAL_PEDIDOS);
    setVentas(INITIAL_VENTAS);
    setCrmPlantillas(INITIAL_CRM_PLANTILLAS);
    setCotizaciones(INITIAL_COTIZACIONES);
    setClubFidelidad(INITIAL_CLUB_FIDELIDAD);
    setCarrito({});
    setActiveCustomerOrderId(null);
    setAlertModal(null);

    localStorage.setItem('leogas_productos', JSON.stringify(INITIAL_PRODUCTOS));
    localStorage.setItem('leogas_accesorios', JSON.stringify(INITIAL_ACCESORIOS));
    localStorage.setItem('leogas_telefonos', JSON.stringify(INITIAL_TELEFONOS));
    localStorage.setItem('leogas_negocio', JSON.stringify(INITIAL_NEGOCIO));
    localStorage.setItem('leogas_repartidores', JSON.stringify(INITIAL_REPARTIDORES));
    localStorage.setItem('leogas_empresas_b2b', JSON.stringify(INITIAL_EMPRESAS_B2B));
    localStorage.setItem('leogas_clientes_vip', JSON.stringify(INITIAL_CLIENTES_VIP));
    localStorage.setItem('leogas_pedidos', JSON.stringify(INITIAL_PEDIDOS));
    localStorage.setItem('leogas_ventas', JSON.stringify(INITIAL_VENTAS));
    localStorage.setItem('leogas_crm_plantillas', JSON.stringify(INITIAL_CRM_PLANTILLAS));
    localStorage.setItem('leogas_cotizaciones', JSON.stringify(INITIAL_COTIZACIONES));
    localStorage.setItem('leogas_club_fidelidad', JSON.stringify(INITIAL_CLUB_FIDELIDAD));
    localStorage.setItem('leogas_last_modified', Date.now().toString());
    localStorage.removeItem('leogas_mi_pedido_id');

    broadcastSync('FULL_RESET_SYNC', {
      productos: INITIAL_PRODUCTOS,
      accesorios: INITIAL_ACCESORIOS,
      telefonos: INITIAL_TELEFONOS,
      negocio: INITIAL_NEGOCIO,
      repartidores: INITIAL_REPARTIDORES,
      empresasB2B: INITIAL_EMPRESAS_B2B,
      clientesVIP: INITIAL_CLIENTES_VIP,
      pedidos: INITIAL_PEDIDOS,
      ventas: INITIAL_VENTAS,
      crmPlantillas: INITIAL_CRM_PLANTILLAS,
      cotizaciones: INITIAL_COTIZACIONES,
      clubFidelidad: INITIAL_CLUB_FIDELIDAD
    });
  };

  const resetPedidosYVentas = () => {
    setPedidos([]);
    setVentas([]);
    setCotizaciones([]);
    setCarrito({});
    setActiveCustomerOrderId(null);
    setAlertModal(null);

    localStorage.setItem('leogas_pedidos', JSON.stringify([]));
    localStorage.setItem('leogas_ventas', JSON.stringify([]));
    localStorage.setItem('leogas_cotizaciones', JSON.stringify([]));
    localStorage.removeItem('leogas_mi_pedido_id');
    localStorage.removeItem('leogas_cliente_saliendo_notif');

    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('leogas_last_seen_stage_')) {
          localStorage.removeItem(k);
        }
      });
    } catch {}

    broadcastLiveEvent({
      type: 'PEDIDOS_SYNC',
      pedidos: [],
      ventas: [],
      cotizaciones: []
    });
  };

  // Fleet
  const addRepartidor = (r: Repartidor) => {
    setRepartidores(prev => [...prev, r]);
  };
  const updateRepartidor = (r: Repartidor) => {
    setRepartidores(prev => prev.map(item => item.id === r.id ? r : item));
  };
  const deleteRepartidor = (id: string) => {
    setRepartidores(prev => prev.filter(r => r.id !== id));
  };
  const toggleRepartidorOnline = (id: string) => {
    setRepartidores(prev => prev.map(r => r.id === id ? { ...r, online: !r.online } : r));
  };
  const setRepartidorCoords = (id: string, lat: number, lng: number) => {
    setRepartidores(prev => prev.map(r => r.id === id ? { ...r, lat, lng } : r));
  };

  // B2B & VIP
  const addEmpresaB2B = (e: EmpresaB2B) => {
    setEmpresasB2B(prev => {
      const filtered = prev.filter(item => item.ruc !== e.ruc);
      return [...filtered, e];
    });
  };
  const deleteEmpresaB2B = (ruc: string) => {
    setEmpresasB2B(prev => prev.filter(e => e.ruc !== ruc));
  };

  const addClienteVIP = (c: ClienteVIP) => {
    setClientesVIP(prev => [...prev, c]);
  };
  const updateClienteVIP = (c: ClienteVIP) => {
    setClientesVIP(prev => prev.map(item => item.id === c.id ? c : item));
  };
  const deleteClienteVIP = (id: string) => {
    setClientesVIP(prev => prev.filter(c => c.id !== id));
  };

  // CRM & Cotizaciones CRUD
  const updateCRMPlantilla = (p: CRMPlantilla) => {
    setCrmPlantillas(prev => prev.map(item => item.id === p.id ? p : item));
  };

  const addCotizacion = (c: CotizacionCRM) => {
    setCotizaciones(prev => [c, ...prev]);
  };

  const updateCotizacion = (c: CotizacionCRM) => {
    setCotizaciones(prev => prev.map(item => item.id === c.id ? c : item));
  };

  const deleteCotizacion = (id: string) => {
    setCotizaciones(prev => prev.filter(item => item.id !== id));
  };

  // Orders
  const createPedido = (newP: Omit<Pedido, 'id' | 'timestamp' | 'hora' | 'estado' | 'etapa'>) => {
    const id = `cmd-${Date.now()}`;
    const now = new Date();
    const hora = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const fullPedido: Pedido = {
      ...newP,
      id,
      timestamp: Date.now(),
      hora,
      fecha: now.toLocaleDateString('es-PE'),
      estado: newP.repartidorId ? 'en_proceso' : 'pendiente_asignacion',
      etapa: 0,
      horaAsignacion: newP.repartidorId ? hora : undefined,
      ownerUid: auth.uid || undefined
    };
    if (!auth.uid) {
      console.warn('[Firebase] Sin sesión en la nube: el pedido se guardó solo en este dispositivo.');
    }

    setPedidos((prev) => {
      const updated = [fullPedido, ...prev];
      try {
        localStorage.setItem('leogas_pedidos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Track active order for customer
    setActiveCustomerOrderId(id);
    localStorage.setItem('leogas_mi_pedido_id', id);
    localStorage.setItem(`leogas_last_seen_stage_${id}`, '0');
    setAlertModal('asignando');

    broadcastLiveEvent({
      type: 'NEW_PEDIDO',
      pedido: fullPedido
    });

    playAndSpeak('Su pedido de balón de gas ha sido registrado con éxito. Estamos asignando a su repartidor.');
    return id;
  };

  const assignPedido = (pedidoId: string, repartidorId: string) => {
    const rep = repartidores.find((r) => r.id === repartidorId);
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    setPedidos((prev) => {
      const updated = prev.map((p) => {
        if (p.id === pedidoId) {
          return {
            ...p,
            repartidorId,
            repartidorNombre: rep?.nombre || '',
            estado: 'en_proceso' as const,
            etapa: 1,
            horaAsignacion: hora,
            horaActualizacion: hora
          };
        }
        return p;
      });

      try {
        localStorage.setItem('leogas_pedidos', JSON.stringify(updated));
      } catch {}

      broadcastLiveEvent({
        type: 'ETAPA_CHANGED',
        pedidoId,
        nextEtapa: 1,
        pedidos: updated
      });

      return updated;
    });

    if (rep) {
      setRepartidores((prev) =>
        prev.map((r) =>
          r.id === repartidorId ? { ...r, etapaSecuencia: 1, ultimaActualizacionSecuencia: hora } : r
        )
      );
    }
    playAndSpeak(`Pedido asignado al repartidor ${rep?.nombre || ''}.`);
  };

  const notificarClienteSaliendo = (pedidoId: string) => {
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    let clienteName = 'El cliente';
    setPedidos((prev) => {
      const updated = prev.map((p) => {
        if (p.id === pedidoId) {
          clienteName = p.cliente;
          return {
            ...p,
            clienteSaliendo: true,
            clienteSaliendoHora: hora
          };
        }
        return p;
      });

      try {
        localStorage.setItem('leogas_pedidos', JSON.stringify(updated));
        localStorage.setItem('leogas_cliente_saliendo_notif', JSON.stringify({ pedidoId, timestamp: Date.now() }));
      } catch {}

      broadcastLiveEvent({
        type: 'CLIENTE_SALIENDO',
        pedidoId,
        clienteNombre: clienteName,
        pedidos: updated
      });

      return updated;
    });

    if (auth.uid) {
      fbUpdate(fbRef(fbDb, `pedidos/${pedidoId}`), { clienteSaliendo: true, clienteSaliendoHora: hora }).catch((e) =>
        console.error('[Firebase] No se pudo avisar al repartidor:', e?.message || e)
      );
    }
    playAndSpeak('Aviso enviado. Su repartidor lo está esperando en la puerta con su balón de gas.');
    closeAlertModal();
  };

  const acknowledgeClienteSaliendo = (pedidoId: string) => {
    setPedidos((prev) => {
      const updated = prev.map((p) =>
        p.id === pedidoId ? { ...p, clienteSaliendo: false, clienteSaliendoVisto: true } : p
      );

      try {
        localStorage.setItem('leogas_pedidos', JSON.stringify(updated));
      } catch {}

      broadcastLiveEvent({
        type: 'CLIENTE_SALIENDO_ACKNOWLEDGED',
        pedidoId,
        pedidos: updated
      });

      return updated;
    });
  };

  const advancePedidoEtapa = (pedidoId: string) => {
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    let calculatedNextEtapa = 1;
    let targetCliente = '';

    setPedidos((prev) => {
      const updated = prev.map((p) => {
        if (p.id === pedidoId) {
          targetCliente = p.cliente;
          const nextEtapa = (p.etapa || 0) + 1;
          calculatedNextEtapa = nextEtapa;
          if (nextEtapa === 1) {
            return {
              ...p,
              etapa: 1,
              horaActualizacion: hora
            };
          } else if (nextEtapa === 2) {
            return {
              ...p,
              etapa: 2,
              horaActualizacion: hora
            };
          } else if (nextEtapa === 3) {
            return {
              ...p,
              etapa: 3,
              horaActualizacion: hora
            };
          } else {
            const totalNum = typeof p.montoCobro === 'number' ? p.montoCobro : parseFloat(p.montoCobro) || 0;
            addVenta({
              id: `vta-${p.id}`,
              fecha: new Date().toISOString().split('T')[0],
              cliente: p.cliente,
              productos: p.tipoBalon,
              total: totalNum,
              pago: p.metodoPago,
              repartidorId: p.repartidorId,
              repartidorNombre: p.repartidorNombre,
              comprobante: p.tipoComprobante || 'B001-000455'
            });
            return {
              ...p,
              etapa: 4,
              estado: 'completado' as const,
              horaActualizacion: hora
            };
          }
        }
        return p;
      });

      try {
        localStorage.setItem('leogas_pedidos', JSON.stringify(updated));
      } catch {}

      broadcastLiveEvent({
        type: 'ETAPA_CHANGED',
        pedidoId,
        nextEtapa: calculatedNextEtapa,
        pedidos: updated
      });

      return updated;
    });

    if (calculatedNextEtapa === 1) {
      playAndSpeak(`Iniciando ruta hacia el domicilio de ${targetCliente || 'el cliente'}.`);
    } else if (calculatedNextEtapa === 2) {
      playAndSpeak('Ha llegado a su destino. Proceda a avisar al cliente.');
    } else if (calculatedNextEtapa === 3) {
      playAndSpeak('Balón de gas entregado con éxito. Muchas gracias por su servicio.');
    } else if (calculatedNextEtapa >= 4) {
      playAndSpeak('Pedido finalizado y registrado en caja. Ha vuelto a estar libre en base.');
    }
  };


  const completePedido = (pedidoId: string) => {
    advancePedidoEtapa(pedidoId);
  };

  const deletePedido = (pedidoId: string) => {
    setPedidos((prev) => {
      const updated = prev.filter((p) => p.id !== pedidoId);
      try {
        localStorage.setItem('leogas_pedidos', JSON.stringify(updated));
      } catch {}
      broadcastSync('PEDIDOS_SYNC', { pedidos: updated });
      return updated;
    });
    if (activeCustomerOrderId === pedidoId) {
      setActiveCustomerOrderId(null);
      localStorage.removeItem('leogas_mi_pedido_id');
    }
  };

  const addVenta = (v: VentaRegistro) => {
    const venta: VentaRegistro = v.id ? v : { ...v, id: `vta-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    newVentaIds.add(venta.id as string);
    setVentas(prev => (prev.some(x => x.id === venta.id) ? prev : [venta, ...prev]));
  };

  // Cart operations
  const addToCart = (item: { id: string; nombre: string; precio: number }) => {
    setCarrito(prev => {
      const existing = prev[item.id];
      if (existing) {
        return {
          ...prev,
          [item.id]: { ...existing, cantidad: existing.cantidad + 1 }
        };
      }
      return {
        ...prev,
        [item.id]: { id: item.id, nombre: item.nombre, precio: item.precio, cantidad: 1 }
      };
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCarrito(prev => {
      const existing = prev[id];
      if (!existing) return prev;
      const newQty = existing.cantidad + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: { ...existing, cantidad: newQty }
      };
    });
  };

  const clearCart = () => setCarrito({});

  const cartTotal = Object.values(carrito).reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const cartCount = Object.values(carrito).reduce((acc, item) => acc + item.cantidad, 0);

  // Authentication (Firebase Auth: correo/contraseña; los roles viven en /roles/{uid})
  const adminLogin = async (u: string, p: string): Promise<boolean> => {
    setAuthError('');
    const res = await loginStaff(u, p, 'admin');
    if (!res.ok) setAuthError(res.msg || 'No se pudo iniciar sesión.');
    return res.ok;
  };

  const adminLogout = () => {
    logoutStaff();
  };

  const currentRepartidor = currentRepartidorId
    ? repartidores.find(r => r.id === currentRepartidorId) || null
    : null;

  const repartidorLogin = async (u: string, p: string, repId?: string): Promise<boolean> => {
    setAuthError('');
    const res = await loginStaff(u, p, 'repartidor', repId);
    if (!res.ok) {
      setAuthError(res.msg || 'No se pudo iniciar sesión.');
      return false;
    }
    if (res.repartidorId) {
      setRepartidores(prev => prev.map(r => r.id === res.repartidorId ? { ...r, online: true } : r));
    }
    return true;
  };

  const repartidorLogout = async () => {
    if (currentRepartidorId) {
      setRepartidores(prev => prev.map(r => r.id === currentRepartidorId ? { ...r, online: false } : r));
      try {
        await fbUpdate(fbRef(fbDb, `repartidores/${currentRepartidorId}`), { online: false });
      } catch {}
    }
    await logoutStaff();
  };

  // Club de Fidelidad (Sellos)
  const consultarSellos = (dni: string): ClienteFidelidad | null => {
    const clean = dni.trim().replace(/\D/g, '');
    if (!clean) return null;
    return clubFidelidad.find((c) => c.dni.replace(/\D/g, '') === clean) || null;
  };

  const sumarSelloFidelidad = (
    dni: string,
    nombre?: string,
    telefono?: string,
    detalle?: string,
    cantidad: number = 1
  ): { cliente: ClienteFidelidad; premioDesbloqueado: boolean } => {
    const cleanDni = dni.trim().replace(/\D/g, '');
    const nowStr = new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    let updatedCliente: ClienteFidelidad;
    let premioDesbloqueado = false;

    setClubFidelidad((prev) => {
      const idx = prev.findIndex((c) => c.dni.replace(/\D/g, '') === cleanDni);
      if (idx >= 0) {
        const cur = prev[idx];
        const newSellos = cur.sellos + cantidad;
        premioDesbloqueado = newSellos >= 10;
        updatedCliente = {
          ...cur,
          nombre: nombre || cur.nombre,
          telefono: telefono || cur.telefono,
          sellos: newSellos,
          totalConsumos: cur.totalConsumos + cantidad,
          ultimoConsumo: nowStr,
          historial: [
            {
              fecha: nowStr,
              detalle: detalle || 'Consumo de Balón de Gas',
              sellosSumados: cantidad
            },
            ...(cur.historial || [])
          ]
        };
        const nextList = [...prev];
        nextList[idx] = updatedCliente;
        try {
          localStorage.setItem('leogas_club_fidelidad', JSON.stringify(nextList));
        } catch {}
        broadcastLiveEvent({ type: 'CLUB_FIDELIDAD_UPDATE', clubFidelidad: nextList });
        return nextList;
      } else {
        const newSellos = cantidad;
        premioDesbloqueado = newSellos >= 10;
        updatedCliente = {
          id: `fid-${Date.now()}`,
          dni: cleanDni,
          nombre: nombre || `Cliente ${cleanDni}`,
          telefono: telefono || '',
          sellos: newSellos,
          totalConsumos: cantidad,
          premiosCanjeados: 0,
          ultimoConsumo: nowStr,
          historial: [
            {
              fecha: nowStr,
              detalle: detalle || 'Primer consumo de Balón de Gas',
              sellosSumados: cantidad
            }
          ]
        };
        const nextList = [updatedCliente, ...prev];
        try {
          localStorage.setItem('leogas_club_fidelidad', JSON.stringify(nextList));
        } catch {}
        broadcastLiveEvent({ type: 'CLUB_FIDELIDAD_UPDATE', clubFidelidad: nextList });
        return nextList;
      }
    });

    return { cliente: updatedCliente!, premioDesbloqueado };
  };

  const canjearPremioFidelidad = (dni: string): boolean => {
    const cleanDni = dni.trim().replace(/\D/g, '');
    const nowStr = new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    let success = false;

    setClubFidelidad((prev) => {
      const idx = prev.findIndex((c) => c.dni.replace(/\D/g, '') === cleanDni);
      if (idx < 0) return prev;
      const cur = prev[idx];
      if (cur.sellos < 10) return prev;

      success = true;
      const updated: ClienteFidelidad = {
        ...cur,
        sellos: Math.max(0, cur.sellos - 10),
        premiosCanjeados: cur.premiosCanjeados + 1,
        historial: [
          {
            fecha: nowStr,
            detalle: '🎁 Canje de Regalito Club de Fidelidad (10 sellos)',
            sellosSumados: -10
          },
          ...(cur.historial || [])
        ]
      };
      const nextList = [...prev];
      nextList[idx] = updated;
      try {
        localStorage.setItem('leogas_club_fidelidad', JSON.stringify(nextList));
      } catch {}
      broadcastLiveEvent({ type: 'CLUB_FIDELIDAD_UPDATE', clubFidelidad: nextList });
      return nextList;
    });

    return success;
  };

  const setSellosManual = (dni: string, sellos: number) => {
    const cleanDni = dni.trim().replace(/\D/g, '');
    setClubFidelidad((prev) => {
      const nextList = prev.map((c) =>
        c.dni.replace(/\D/g, '') === cleanDni
          ? { ...c, sellos: Math.max(0, sellos) }
          : c
      );
      try {
        localStorage.setItem('leogas_club_fidelidad', JSON.stringify(nextList));
      } catch {}
      broadcastLiveEvent({ type: 'CLUB_FIDELIDAD_UPDATE', clubFidelidad: nextList });
      return nextList;
    });
  };

  const registrarNuevoClienteFidelidad = (cliente: Omit<ClienteFidelidad, 'id'>) => {
    const nuevo: ClienteFidelidad = {
      ...cliente,
      id: `fid-${Date.now()}`,
      dni: cliente.dni.trim().replace(/\D/g, '')
    };
    setClubFidelidad((prev) => {
      const nextList = [nuevo, ...prev.filter((c) => c.dni !== nuevo.dni)];
      try {
        localStorage.setItem('leogas_club_fidelidad', JSON.stringify(nextList));
      } catch {}
      broadcastLiveEvent({ type: 'CLUB_FIDELIDAD_UPDATE', clubFidelidad: nextList });
      return nextList;
    });
  };

  const deleteClienteFidelidad = (id: string) => {
    setClubFidelidad((prev) => {
      const nextList = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem('leogas_club_fidelidad', JSON.stringify(nextList));
      } catch {}
      broadcastLiveEvent({ type: 'CLUB_FIDELIDAD_UPDATE', clubFidelidad: nextList });
      return nextList;
    });
  };

  const openAlertModal = (type?: 'en_camino' | 'en_puerta' | 'completado' | 'asignando') => {
    if (type) {
      setAlertModal(type);
      return;
    }
    if (!activeCustomerOrder) {
      setAlertModal('asignando');
      return;
    }
    if (activeCustomerOrder.estado === 'completado' || activeCustomerOrder.etapa >= 3) {
      setAlertModal('completado');
    } else if (activeCustomerOrder.etapa === 2) {
      setAlertModal('en_puerta');
    } else if (activeCustomerOrder.etapa === 1) {
      setAlertModal('en_camino');
    } else {
      setAlertModal('asignando');
    }
  };

  const closeAlertModal = () => setAlertModal(null);

  return (
    <AppContext.Provider
      value={{
        activePortal,
        setActivePortal,
        productos,
        setProductos,
        updateProducto,
        addProducto,
        deleteProducto,
        accesorios,
        updateAccesorio,
        addAccesorio,
        deleteAccesorio,
        telefonos,
        updateTelefonos,
        negocio,
        updateNegocio,
        resetNegocio,
        resetDesarrollador,
        resetPedidosYVentas,
        repartidores,
        addRepartidor,
        updateRepartidor,
        deleteRepartidor,
        toggleRepartidorOnline,
        setRepartidorCoords,
        empresasB2B,
        addEmpresaB2B,
        deleteEmpresaB2B,
        clientesVIP,
        addClienteVIP,
        updateClienteVIP,
        deleteClienteVIP,
        clubFidelidad,
        consultarSellos,
        sumarSelloFidelidad,
        canjearPremioFidelidad,
        setSellosManual,
        registrarNuevoClienteFidelidad,
        deleteClienteFidelidad,
        pedidos,
        createPedido,
        assignPedido,
        advancePedidoEtapa,
        completePedido,
        deletePedido,
        ventas,
        addVenta,
        carrito,
        addToCart,
        updateCartQty,
        clearCart,
        cartTotal,
        cartCount,
        activeCustomerOrderId,
        activeCustomerOrder,
        setActiveCustomerOrderId,
        alertModal,
        openAlertModal,
        closeAlertModal,
        notificarClienteSaliendo,
        acknowledgeClienteSaliendo,
        crmPlantillas,
        updateCRMPlantilla,
        cotizaciones,
        addCotizacion,
        updateCotizacion,
        deleteCotizacion,
        isAdminLogged,
        adminLogin,
        adminLogout,
        currentRepartidor,
        repartidorLogin,
        repartidorLogout,
        isSyncingCloud,
        cloudSyncStatus,
        publicarCambiosEnLaNube,
        cargarDatosDeLaNube,
        authError,
        dbUpdateToast,
        dismissDbUpdateToast,
        cloudStatus: { ready: auth.ready, connected, role: auth.role, error: auth.error || syncError || undefined }
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
