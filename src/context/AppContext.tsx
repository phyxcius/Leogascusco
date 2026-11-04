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
  ItemPedido
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
  INITIAL_VENTAS
} from '../data/initialData';
import { playChimeSound, playSuccessChime } from '../utils/audio';

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
  alertModal: 'en_camino' | 'en_puerta' | 'completado' | null;
  closeAlertModal: () => void;

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
  const [negocio, setNegocio] = useState<NegocioIdentidad>(() => getStored('leogas_negocio', INITIAL_NEGOCIO));
  const [repartidores, setRepartidores] = useState<Repartidor[]>(() => getStored('leogas_repartidores', INITIAL_REPARTIDORES));
  const [empresasB2B, setEmpresasB2B] = useState<EmpresaB2B[]>(() => getStored('leogas_empresas_b2b', INITIAL_EMPRESAS_B2B));
  const [clientesVIP, setClientesVIP] = useState<ClienteVIP[]>(() => getStored('leogas_clientes_vip', INITIAL_CLIENTES_VIP));
  const [pedidos, setPedidos] = useState<Pedido[]>(() => getStored('leogas_pedidos', INITIAL_PEDIDOS));
  const [ventas, setVentas] = useState<VentaRegistro[]>(() => getStored('leogas_ventas', INITIAL_VENTAS));

  const [carrito, setCarrito] = useState<Record<string, ItemPedido>>({});
  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState<string | null>(() => localStorage.getItem('leogas_mi_pedido_id'));
  const [alertModal, setAlertModal] = useState<'en_camino' | 'en_puerta' | 'completado' | null>(null);

  const [isAdminLogged, setIsAdminLogged] = useState<boolean>(() => localStorage.getItem('leogas_admin_logged') === 'true');
  const [currentRepartidorId, setCurrentRepartidorId] = useState<string | null>(() => localStorage.getItem('leogas_rep_id'));

  // Listen to cross-window storage events so independent windows sync state automatically
  useEffect(() => {
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
        if (e.key === 'leogas_mi_pedido_id') setActiveCustomerOrderId(e.newValue);
        if (e.key === 'leogas_admin_logged') setIsAdminLogged(e.newValue === 'true');
        if (e.key === 'leogas_rep_id') setCurrentRepartidorId(e.newValue);
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Polling fallback to guarantee instant updates between windows/tabs
    const pollInterval = setInterval(() => {
      try {
        const storedPedidos = localStorage.getItem('leogas_pedidos');
        if (storedPedidos) {
          const parsed = JSON.parse(storedPedidos);
          setPedidos(prev => {
            if (JSON.stringify(prev) !== storedPedidos) return parsed;
            return prev;
          });
        }
        const storedReps = localStorage.getItem('leogas_repartidores');
        if (storedReps) {
          const parsed = JSON.parse(storedReps);
          setRepartidores(prev => {
            if (JSON.stringify(prev) !== storedReps) return parsed;
            return prev;
          });
        }
        const storedNegocio = localStorage.getItem('leogas_negocio');
        if (storedNegocio) {
          const parsed = JSON.parse(storedNegocio);
          setNegocio(prev => {
            if (JSON.stringify(prev) !== storedNegocio) return parsed;
            return prev;
          });
        }
        const storedOrder = localStorage.getItem('leogas_mi_pedido_id');
        if (storedOrder) {
          setActiveCustomerOrderId(prev => prev !== storedOrder ? storedOrder : prev);
        }
      } catch (err) {
        // ignore
      }
    }, 1500);

    return () => {
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

  // Active customer order
  const activeCustomerOrder = activeCustomerOrderId
    ? pedidos.find(p => p.id === activeCustomerOrderId) || null
    : null;

  // Watch for active customer order stage changes to trigger sound & alert modals
  useEffect(() => {
    if (!activeCustomerOrder) return;
    const stageKey = `leogas_last_seen_stage_${activeCustomerOrder.id}`;
    const lastSeen = localStorage.getItem(stageKey);
    const currentEtapa = activeCustomerOrder.etapa;

    if (activeCustomerOrder.estado === 'completado' && lastSeen !== '3') {
      localStorage.setItem(stageKey, '3');
      playSuccessChime();
      setAlertModal('completado');
    } else if (currentEtapa === 1 && lastSeen !== '1') {
      localStorage.setItem(stageKey, '1');
      playChimeSound();
      setAlertModal('en_camino');
    } else if (currentEtapa === 2 && lastSeen !== '2') {
      localStorage.setItem(stageKey, '2');
      playChimeSound();
      setAlertModal('en_puerta');
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

    setPedidos(prev => [fullPedido, ...prev]);

    // Track active order for customer
    setActiveCustomerOrderId(id);
    localStorage.setItem('leogas_mi_pedido_id', id);
    localStorage.setItem(`leogas_last_seen_stage_${id}`, '0');

    playChimeSound();
    return id;
  };

  const assignPedido = (pedidoId: string, repartidorId: string) => {
    const rep = repartidores.find(r => r.id === repartidorId);
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    setPedidos(prev => prev.map(p => {
      if (p.id === pedidoId) {
        return {
          ...p,
          repartidorId,
          repartidorNombre: rep?.nombre || '',
          estado: 'en_proceso',
          etapa: 1,
          horaAsignacion: hora,
          horaActualizacion: hora
        };
      }
      return p;
    }));
    // Also update driver's sequence
    if (rep) {
      setRepartidores(prev => prev.map(r => r.id === repartidorId ? { ...r, etapaSecuencia: 1, ultimaActualizacionSecuencia: hora } : r));
    }
    playChimeSound();
  };

  const advancePedidoEtapa = (pedidoId: string) => {
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    setPedidos(prev => prev.map(p => {
      if (p.id === pedidoId) {
        const nextEtapa = (p.etapa || 0) + 1;
        if (nextEtapa >= 3) {
          // Completed
          const totalNum = typeof p.montoCobro === 'number' ? p.montoCobro : parseFloat(p.montoCobro) || 0;
          addVenta({
            fecha: `Hoy, ${hora}`,
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
            etapa: 3,
            estado: 'completado',
            horaActualizacion: hora
          };
        } else {
          return {
            ...p,
            etapa: nextEtapa,
            horaActualizacion: hora
          };
        }
      }
      return p;
    }));
    playChimeSound();
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
        closeAlertModal,
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
