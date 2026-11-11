import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  update,
  remove,
  onValue,
  get,
  Database
} from 'firebase/database';
import { Pedido, Repartidor, NegocioIdentidad } from '../types/index';

export const DEFAULT_FIREBASE_RTDB_URL = 'https://leogas-cusco-default-rtdb.firebaseio.com';

// Retrieve or fallback configured URL
export const getFirebaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('leogas_firebase_rtdb_url');
    if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  }
  return DEFAULT_FIREBASE_RTDB_URL;
};

// Initialize Firebase App singleton
let rtdbInstance: Database | null = null;

export const getFirebaseDb = (): Database => {
  if (rtdbInstance) return rtdbInstance;
  const dbUrl = getFirebaseUrl();
  const app = getApps().length === 0
    ? initializeApp({
        databaseURL: dbUrl,
        projectId: 'leogas-cusco'
      })
    : getApp();

  rtdbInstance = getDatabase(app, dbUrl);
  return rtdbInstance;
};

export interface FirebaseConnectionStatus {
  connected: boolean;
  status: 'checking' | 'connected' | 'permission_denied' | 'error';
  message: string;
  url: string;
  lastChecked?: string;
}

// Test Firebase Realtime Database connectivity
export const testFirebaseConnection = async (): Promise<FirebaseConnectionStatus> => {
  const url = getFirebaseUrl();
  try {
    const db = getFirebaseDb();
    const testRef = ref(db, '.info/connected');
    
    // Also try a light read on pedidos or ping node
    const pingRef = ref(db, 'system_ping');
    try {
      await get(pingRef);
      return {
        connected: true,
        status: 'connected',
        message: '¡Conexión establecida con éxito con Firebase Realtime Database!',
        url,
        lastChecked: new Date().toLocaleTimeString('es-PE')
      };
    } catch (readErr: any) {
      if (readErr.message && readErr.message.includes('Permission denied')) {
        return {
          connected: false,
          status: 'permission_denied',
          message: 'Permiso denegado por las reglas de Firebase. Configura las reglas en Firebase Console a: { ".read": true, ".write": true }',
          url,
          lastChecked: new Date().toLocaleTimeString('es-PE')
        };
      }
      return {
        connected: false,
        status: 'error',
        message: readErr.message || 'Error de conexión con Firebase',
        url,
        lastChecked: new Date().toLocaleTimeString('es-PE')
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      status: 'error',
      message: err.message || 'No se pudo inicializar Firebase',
      url,
      lastChecked: new Date().toLocaleTimeString('es-PE')
    };
  }
};

/**
 * =========================================================
 * REALTIME DATABASE ORDERS SYNCHRONIZATION (INDEX <-> ADMIN <-> REPARTIDOR)
 * =========================================================
 */

// Save or overwrite a complete order in Firebase
export const savePedidoToFirebase = async (pedido: Pedido): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const pedidoRef = ref(db, `pedidos/${pedido.id}`);
    await set(pedidoRef, pedido);
    return true;
  } catch (err: any) {
    console.warn('Firebase savePedidoToFirebase error:', err.message);
    return false;
  }
};

// Partially update an order in Firebase (e.g. stage, driver assignment, client coming out)
export const updatePedidoInFirebase = async (
  pedidoId: string,
  updates: Partial<Pedido>
): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const pedidoRef = ref(db, `pedidos/${pedidoId}`);
    await update(pedidoRef, updates);
    return true;
  } catch (err: any) {
    console.warn('Firebase updatePedidoInFirebase error:', err.message);
    return false;
  }
};

// Remove an order from Firebase
export const deletePedidoFromFirebase = async (pedidoId: string): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const pedidoRef = ref(db, `pedidos/${pedidoId}`);
    await remove(pedidoRef);
    return true;
  } catch (err: any) {
    console.warn('Firebase deletePedidoFromFirebase error:', err.message);
    return false;
  }
};

// Reset all orders in Firebase to empty
export const resetPedidosInFirebase = async (): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const pedidosRef = ref(db, 'pedidos');
    await set(pedidosRef, null);
    return true;
  } catch (err: any) {
    console.warn('Firebase resetPedidosInFirebase error:', err.message);
    return false;
  }
};

// Real-time listener for orders across Index, Admin, and Repartidor
export const subscribeToFirebasePedidos = (
  onPedidosUpdate: (pedidos: Pedido[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  try {
    const db = getFirebaseDb();
    const pedidosRef = ref(db, 'pedidos');

    const unsubscribe = onValue(
      pedidosRef,
      (snapshot) => {
        const val = snapshot.val();
        if (!val) {
          onPedidosUpdate([]);
          return;
        }

        let pedidosList: Pedido[] = [];
        if (Array.isArray(val)) {
          pedidosList = val.filter(Boolean);
        } else if (typeof val === 'object') {
          pedidosList = Object.keys(val).map((key) => ({
            ...val[key],
            id: val[key].id || key
          }));
        }

        // Sort descending by timestamp / creation
        pedidosList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        onPedidosUpdate(pedidosList);
      },
      (error) => {
        console.warn('Firebase RTDB subscribe error:', error.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Firebase subscribeToFirebasePedidos init error:', err.message);
    return () => {};
  }
};

/**
 * =========================================================
 * REALTIME DRIVER GPS COORDINATES SYNCHRONIZATION
 * =========================================================
 */
export const updateRepartidorCoordsInFirebase = async (
  repartidorId: string,
  lat: number,
  lng: number
): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const coordsRef = ref(db, `repartidores_coords/${repartidorId}`);
    await set(coordsRef, {
      repartidorId,
      lat,
      lng,
      updatedAt: Date.now()
    });
    return true;
  } catch (err: any) {
    console.warn('Firebase updateRepartidorCoords error:', err.message);
    return false;
  }
};

export const subscribeToRepartidoresCoords = (
  onCoordsUpdate: (coordsMap: Record<string, { lat: number; lng: number }>) => void
): (() => void) => {
  try {
    const db = getFirebaseDb();
    const coordsRef = ref(db, 'repartidores_coords');

    const unsubscribe = onValue(
      coordsRef,
      (snapshot) => {
        const val = snapshot.val();
        if (!val || typeof val !== 'object') {
          onCoordsUpdate({});
          return;
        }
        const map: Record<string, { lat: number; lng: number }> = {};
        Object.keys(val).forEach((k) => {
          if (val[k] && typeof val[k].lat === 'number' && typeof val[k].lng === 'number') {
            map[k] = { lat: val[k].lat, lng: val[k].lng };
          }
        });
        onCoordsUpdate(map);
      },
      () => {}
    );

    return unsubscribe;
  } catch {
    return () => {};
  }
};

/**
 * =========================================================
 * REALTIME BUSINESS IDENTITY & CATALOG BACKUP IN FIREBASE
 * =========================================================
 */
export const syncNegocioToFirebase = async (negocio: NegocioIdentidad): Promise<boolean> => {
  try {
    const db = getFirebaseDb();
    const negocioRef = ref(db, 'negocio');
    await set(negocioRef, negocio);
    return true;
  } catch (err: any) {
    console.warn('Firebase syncNegocio error:', err.message);
    return false;
  }
};
