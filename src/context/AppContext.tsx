import React, { createContext, useContext, useState, useEffect } from 'react';
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
  CotizacionCRM
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
  INITIAL_COTIZACIONES
} from '../data/initialData';
import { playChimeSound, playSuccessChime, playAndSpeak, speakVoice } from '../utils/audio';

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

  // CRM & Cotizaciones
  crmPlantillas: CRMPlantilla[];
  updateCRMPlantilla: (p: CRMPlantilla) => void;
  cotizaciones: CotizacionCRM[];
  addCotizacion: (c: CotizacionCRM) => void;
  updateCotizacion: (c: CotizacionCRM) => void;
  deleteCotizacion: (id: string) => void;

  // Authentication
  isAdminLogged: boolean;
  adminLogin: (u: string, p: string) => boolean;
  adminLogout: () => void;

  currentRepartidor: Repartidor | null;
  repartidorLogin: (u: string, p: string) => boolean;
  repartidorLogout: () => void;
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
  const [telefonos, setTelefonos] = useState<TelefonosConfig>(() => getStored('leogas_telefonos', INITIAL_TELEFONOS));
  const [negocio, setNegocio] = useState<NegocioIdentidad>(() => {
    const stored = getStored<NegocioIdentidad>('leogas_negocio', INITIAL_NEGOCIO);
    return { ...INITIAL_NEGOCIO, ...stored, igvPorcentaje: stored.igvPorcentaje || 18 };
  });
  const [repartidores, setRepartidores] = useState<Repartidor[]>(() => getStored('leogas_repartidores', INITIAL_REPARTIDORES));
  const [empresasB2B, setEmpresasB2B] = useState<EmpresaB2B[]>(() => getStored('leogas_empresas_b2b', INITIAL_EMPRESAS_B2B));
  const [clientesVIP, setClientesVIP] = useState<ClienteVIP[]>(() => getStored('leogas_clientes_vip', INITIAL_CLIENTES_VIP));
  const [pedidos, setPedidos] = useState<Pedido[]>(() => getStored('leogas_pedidos', INITIAL_PEDIDOS));
  const [ventas, setVentas] = useState<VentaRegistro[]>(() => getStored('leogas_ventas', INITIAL_VENTAS));
  const [crmPlantillas, setCrmPlantillas] = useState<CRMPlantilla[]>(() => getStored('leogas_crm_plantillas', INITIAL_CRM_PLANTILLAS));
  const [cotizaciones, setCotizaciones] = useState<CotizacionCRM[]>(() => getStored('leogas_cotizaciones', INITIAL_COTIZACIONES));

  const [carrito, setCarrito] = useState<Record<string, ItemPedido>>({});
  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState<string | null>(() => localStorage.getItem('leogas_mi_pedido_id'));
  const [alertModal, setAlertModal] = useState<'en_camino' | 'en_puerta' | 'completado' | 'asignando' | null>(null);

  const [isAdminLogged, setIsAdminLogged] = useState<boolean>(() => localStorage.getItem('leogas_admin_logged') === 'true');
  const [currentRepartidorId, setCurrentRepartidorId] = useState<string | null>(() => localStorage.getItem('leogas_rep_id'));

  // Realtime BroadcastChannel & Storage Sync between Index, Repartidor and Admin
  useEffect(() => {
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
                playAndSpeak("¡Muchas gracias por su compra en LeoGas Cusco! Su pedido ha sido entregado exitosamente. Por favor califíquenos con 5 estrellas en Google.", true);
              }
            }
          } else if (data.type === 'CLIENTE_SALIENDO') {
            setPedidos((prev) =>
              prev.map((p) => (p.id === data.pedidoId ? { ...p, clienteSaliendo: true } : p))
            );
          } else if (data.type === 'NEW_PEDIDO' && data.pedido) {
            setPedidos((prev) => [data.pedido, ...prev.filter((p) => p.id !== data.pedido.id)]);
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
        if (e.key === 'leogas_mi_pedido_id') setActiveCustomerOrderId(e.newValue);
        if (e.key === 'leogas_admin_logged') setIsAdminLogged(e.newValue === 'true');
        if (e.key === 'leogas_rep_id') setCurrentRepartidorId(e.newValue);
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

  // Active customer order
  const activeCustomerOrder = activeCustomerOrderId
    ? pedidos.find((p) => p.id === activeCustomerOrderId) || null
    : null;

  // Watch for active customer order stage changes to trigger sound, voice agent & central alert modals
  useEffect(() => {
    if (!activeCustomerOrder) return;
    const stageKey = `leogas_last_seen_stage_${activeCustomerOrder.id}`;
    const lastSeen = localStorage.getItem(stageKey);
    const currentEtapa = activeCustomerOrder.etapa;

    if ((activeCustomerOrder.estado === 'completado' || currentEtapa >= 3) && lastSeen !== '3') {
      localStorage.setItem(stageKey, '3');
      setAlertModal('completado');
      playAndSpeak(
        "¡Muchas gracias por su compra en LeoGas Cusco! Su pedido ha sido entregado exitosamente. Por favor califíquenos con 5 estrellas en Google.",
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
  }, [activeCustomerOrder?.etapa, activeCustomerOrder?.estado, activeCustomerOrder?.id]);


  // Product CRUD
  const updateProducto = (p: Producto) => {
    setProductos(prev => prev.map(item => item.id === p.id ? p : item));
  };
  const addProducto = (p: Producto) => {
    setProductos(prev => [...prev, p]);
  };
  const deleteProducto = (id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  // Accessories CRUD
  const updateAccesorio = (a: Accesorio) => {
    setAccesorios(prev => prev.map(item => item.id === a.id ? a : item));
  };
  const addAccesorio = (a: Accesorio) => {
    setAccesorios(prev => [...prev, a]);
  };
  const deleteAccesorio = (id: string) => {
    setAccesorios(prev => prev.filter(a => a.id !== id));
  };

  // Phones
  const updateTelefonos = (t: TelefonosConfig) => {
    setTelefonos(t);
  };

  // Business Identity
  const updateNegocio = (n: Partial<NegocioIdentidad>) => {
    setNegocio(prev => {
      const updated = { ...prev, ...n };
      // Keep telefonos synchronized as well
      setTelefonos(old => ({
        ...old,
        whatsapp: updated.whatsapp || old.whatsapp,
        tel1: updated.telPrincipal || old.tel1,
        tel2: updated.telSecundario || old.tel2,
        tel3: updated.telFijo || old.tel3
      }));
      return updated;
    });
  };

  const resetNegocio = () => {
    setNegocio(INITIAL_NEGOCIO);
    setTelefonos(INITIAL_TELEFONOS);
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
    localStorage.removeItem('leogas_mi_pedido_id');

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('leogas_realtime_sync');
        bc.postMessage({ type: 'PEDIDOS_SYNC', pedidos: INITIAL_PEDIDOS });
        bc.close();
      } catch {}
    }
  };

  const resetPedidosYVentas = () => {
    setPedidos([]);
    setVentas([]);
    setCarrito({});
    setActiveCustomerOrderId(null);
    setAlertModal(null);

    localStorage.setItem('leogas_pedidos', JSON.stringify([]));
    localStorage.setItem('leogas_ventas', JSON.stringify([]));
    localStorage.removeItem('leogas_mi_pedido_id');

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('leogas_realtime_sync');
        bc.postMessage({ type: 'PEDIDOS_SYNC', pedidos: [] });
        bc.close();
      } catch {}
    }
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
      horaAsignacion: newP.repartidorId ? hora : undefined
    };

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

    playAndSpeak('Aviso enviado. Su repartidor lo está esperando en la puerta con su balón de gas.');
    closeAlertModal();
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

  const addVenta = (v: VentaRegistro) => {
    setVentas(prev => [v, ...prev]);
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

  // Authentication
  const adminLogin = (u: string, p: string) => {
    if ((u.toLowerCase() === 'admin' && p === 'admin123') || (u.toLowerCase() === 'admin' && p === 'admin') || p === '1234') {
      setIsAdminLogged(true);
      localStorage.setItem('leogas_admin_logged', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLogged(false);
    localStorage.removeItem('leogas_admin_logged');
  };

  const currentRepartidor = currentRepartidorId
    ? repartidores.find(r => r.id === currentRepartidorId) || null
    : null;

  const repartidorLogin = (u: string, p: string) => {
    const chofer = repartidores.find(
      r => (r.usuario && r.usuario.toLowerCase() === u.trim().toLowerCase()) ||
           (r.nombre.toLowerCase() === u.trim().toLowerCase())
    );
    if (chofer) {
      if (!chofer.password || chofer.password === p || p === '123' || p === '1234') {
        setCurrentRepartidorId(chofer.id);
        localStorage.setItem('leogas_rep_id', chofer.id);
        setRepartidores(prev => prev.map(r => r.id === chofer.id ? { ...r, online: true } : r));
        return true;
      }
    }
    return false;
  };

  const repartidorLogout = () => {
    if (currentRepartidorId) {
      setRepartidores(prev => prev.map(r => r.id === currentRepartidorId ? { ...r, online: false } : r));
    }
    setCurrentRepartidorId(null);
    localStorage.removeItem('leogas_rep_id');
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
        pedidos,
        createPedido,
        assignPedido,
        advancePedidoEtapa,
        completePedido,
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
        repartidorLogout
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
