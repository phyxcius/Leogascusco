import { useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { ref, onValue, set, remove, get, query, orderByChild, equalTo } from 'firebase/database';
import { fbAuth, fbDb, toEmail } from './firebase';

export type Role = 'admin' | 'repartidor' | 'cliente';

export interface AuthInfo {
  ready: boolean;
  uid: string | null;
  role: Role;
  repartidorId?: string;
  error?: string;
}

let syncReporter: ((m: string) => void) | null = null;
function reportSyncError(m: string) {
  console.error('[Firebase]', m);
  if (syncReporter) syncReporter(m);
}

/** Ids de ventas creadas en esta sesión (el repartidor solo puede crear, no leer, ventas). */
export const newVentaIds = new Set<string>();

export function stable(v: any): string {
  return JSON.stringify(v, (_k, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const out: any = {};
      Object.keys(val)
        .sort()
        .forEach((k) => {
          out[k] = val[k];
        });
      return out;
    }
    return val;
  });
}

export function clean(v: any): any {
  if (v === undefined) return null;
  return JSON.parse(JSON.stringify(v));
}

function authErrorMsg(e: any): string {
  const code = e?.code || '';
  if (code.includes('operation-not-allowed')) return 'Falta activar este método de acceso en Firebase Authentication.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-email'))
    return 'Usuario o contraseña incorrectos.';
  if (code.includes('too-many-requests')) return 'Demasiados intentos. Espera unos minutos.';
  if (code.includes('network')) return 'Sin conexión a internet.';
  return e?.message || 'Error de autenticación.';
}

export async function loginStaff(
  user: string,
  pass: string,
  expect: 'admin' | 'repartidor',
  repId?: string
): Promise<{ ok: boolean; msg?: string; repartidorId?: string }> {
  try {
    const cred = await signInWithEmailAndPassword(fbAuth, toEmail(user), pass);
    const snap = await get(ref(fbDb, `roles/${cred.user.uid}`));
    const r = snap.val();
    if (expect === 'admin' && r?.role === 'admin') return { ok: true };
    if (expect === 'repartidor' && r?.role === 'repartidor' && (!repId || r.repartidorId === repId)) {
      return { ok: true, repartidorId: r.repartidorId };
    }
    await signOut(fbAuth);
    return { ok: false, msg: 'Este usuario no tiene permiso para este panel.' };
  } catch (e: any) {
    return { ok: false, msg: authErrorMsg(e) };
  }
}

export async function logoutStaff(): Promise<void> {
  try {
    await signOut(fbAuth);
  } catch {}
}

/* ---------------------------------------------------------------------------
 * Nodo completo (catálogo, negocio, teléfonos, CRM, etc.)
 * ------------------------------------------------------------------------- */
function useWholeNode(
  key: string,
  value: any,
  setValue: (v: any) => void,
  auth: AuthInfo,
  canRead: boolean,
  canWrite: boolean
) {
  const last = useRef<string | null>(null);
  const loaded = useRef(false);
  const [tick, setTick] = useState(0);
  const setRef = useRef(setValue);
  setRef.current = setValue;

  useEffect(() => {
    last.current = null;
    loaded.current = false;
    if (!auth.ready || !auth.uid || !canRead) return;
    const unsub = onValue(
      ref(fbDb, key),
      (snap) => {
        const v = snap.val();
        loaded.current = true;
        if (v !== null && v !== undefined) {
          last.current = stable(v);
          setRef.current(v);
        }
        setTick((t) => t + 1);
      },
      (err) => reportSyncError(`No se pudo leer "${key}" (${(err as any)?.code || err?.message || err}).`)
    );
    return () => unsub();
  }, [auth.ready, auth.uid, auth.role, canRead]);

  useEffect(() => {
    if (!loaded.current || !canWrite || !auth.uid) return;
    const c = clean(value);
    const j = stable(c);
    if (j === last.current) return;
    last.current = j;
    set(ref(fbDb, key), c).catch((e) => reportSyncError(`No se pudo guardar "${key}" (${e?.code || e?.message || e}).`));
  }, [value, tick, canWrite, auth.uid]);
}

/* ---------------------------------------------------------------------------
 * Colección con un nodo por registro (pedidos, repartidores, ventas)
 * ------------------------------------------------------------------------- */
interface KeyedSource {
  name: string;
  kind: 'collection' | 'single';
  id?: string;
  q: () => any;
  retry?: boolean;
}

interface KeyedOpts<T extends { id?: string }> {
  path: string;
  items: T[];
  setItems: (v: T[]) => void;
  auth: AuthInfo;
  sources: KeyedSource[];
  sourcesKey: string;
  seedLocal: boolean;
  waitLoad: boolean;
  canWrite: (item: T, known: boolean) => boolean;
  canDelete: boolean;
  prepare?: (item: T) => any;
  sortFn?: (a: T, b: T) => number;
}

function useKeyed<T extends { id?: string }>(o: KeyedOpts<T>) {
  const oRef = useRef(o);
  oRef.current = o;
  const lastById = useRef<Record<string, string>>({});
  const sourceData = useRef<Record<string, Record<string, T>>>({});
  const firstSeen = useRef<Set<string>>(new Set());
  const loaded = useRef(false);
  const [tick, setTick] = useState(0);
  const [retryTick, setRetryTick] = useState(0);
  const retries = useRef(0);

  useEffect(() => {
    const cfg = oRef.current;
    lastById.current = {};
    sourceData.current = {};
    firstSeen.current = new Set();
    loaded.current = !cfg.waitLoad;
    if (!cfg.auth.ready || !cfg.auth.uid) return;
    if (cfg.sources.length === 0) {
      loaded.current = true;
      setTick((t) => t + 1);
      return;
    }

    const unsubs: Array<() => void> = [];
    let timer: any = null;

    const evaluate = (fromError: boolean) => {
      const c = oRef.current;
      const merged: Record<string, T> = Object.assign({}, ...Object.values(sourceData.current));
      const next: Record<string, string> = {};
      Object.keys(merged).forEach((id) => {
        next[id] = stable(merged[id]);
      });
      const allSeen = firstSeen.current.size === c.sources.length;
      if (fromError) {
        if (allSeen) loaded.current = true;
        setTick((t) => t + 1);
        return;
      }
      let arr = Object.values(merged) as T[];
      if (c.sortFn) arr = arr.sort(c.sortFn);
      if (allSeen && !loaded.current) {
        loaded.current = true;
        if (arr.length === 0 && c.seedLocal) {
          // Base vacía y este es el administrador: se suben los datos locales (migración inicial).
          lastById.current = {};
          setTick((t) => t + 1);
          return;
        }
      }
      lastById.current = next;
      c.setItems(arr);
      setTick((t) => t + 1);
    };

    cfg.sources.forEach((src) => {
      const unsub = onValue(
        src.q(),
        (snap) => {
          const v = snap.val();
          let map: Record<string, T> = {};
          if (src.kind === 'single') {
            if (v && src.id) map[src.id] = v;
          } else if (v) {
            map = v;
          }
          sourceData.current[src.name] = map;
          firstSeen.current.add(src.name);
          retries.current = 0;
          evaluate(false);
        },
        (err) => {
          sourceData.current[src.name] = {};
          firstSeen.current.add(src.name);
          evaluate(true);
          if (src.retry && retries.current < 6) {
            retries.current += 1;
            timer = setTimeout(() => setRetryTick((t) => t + 1), 1500);
          } else if (!src.retry) {
            reportSyncError(`No se pudo leer "${oRef.current.path}" (${(err as any)?.code || err?.message || err}).`);
          }
        }
      );
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
      if (timer) clearTimeout(timer);
    };
  }, [o.auth.ready, o.auth.uid, o.auth.role, o.auth.repartidorId, o.sourcesKey, o.seedLocal, retryTick]);

  useEffect(() => {
    const c = oRef.current;
    if (!c.auth.ready || !c.auth.uid || !loaded.current) return;
    for (const item of c.items) {
      const id = item && item.id;
      if (!id) continue;
      const data = clean(c.prepare ? c.prepare(item) : item);
      const j = stable(data);
      if (lastById.current[id] === j) continue;
      const known = id in lastById.current;
      if (!c.canWrite(item, known)) continue;
      lastById.current[id] = j;
      set(ref(fbDb, `${c.path}/${id}`), data).catch((e) =>
        reportSyncError(`No se pudo guardar en "${c.path}" (${e?.code || e?.message || e}).`)
      );
    }
    if (c.canDelete) {
      const ids = new Set(c.items.map((i) => i && i.id));
      Object.keys(lastById.current).forEach((id) => {
        if (!ids.has(id)) {
          delete lastById.current[id];
          remove(ref(fbDb, `${c.path}/${id}`)).catch((e) =>
            reportSyncError(`No se pudo borrar en "${c.path}" (${e?.code || e?.message || e}).`)
          );
        }
      });
    }
  }, [o.items, tick, o.auth.uid, o.auth.role, o.auth.repartidorId]);
}

/* ---------------------------------------------------------------------------
 * Hook principal
 * ------------------------------------------------------------------------- */
export interface SyncArgs {
  productos: any[]; setProductos: (v: any) => void;
  accesorios: any[]; setAccesorios: (v: any) => void;
  telefonos: any; setTelefonos: (v: any) => void;
  negocio: any; setNegocio: (v: any) => void;
  empresasB2B: any[]; setEmpresasB2B: (v: any) => void;
  clientesVIP: any[]; setClientesVIP: (v: any) => void;
  crmPlantillas: any[]; setCrmPlantillas: (v: any) => void;
  cotizaciones: any[]; setCotizaciones: (v: any) => void;
  clubFidelidad: any[]; setClubFidelidad: (v: any) => void;
  repartidores: any[]; setRepartidores: (v: any) => void;
  pedidos: any[]; setPedidos: (v: any) => void;
  ventas: any[]; setVentas: (v: any) => void;
  activeCustomerOrderId: string | null;
}

export function useFirebaseSync(a: SyncArgs): { auth: AuthInfo; connected: boolean; syncError: string } {
  const [syncError, setSyncError] = useState('');
  useEffect(() => {
    syncReporter = (m: string) => setSyncError(m);
    return () => {
      syncReporter = null;
    };
  }, []);
  const [auth, setAuth] = useState<AuthInfo>({ ready: false, uid: null, role: 'cliente' });
  const [connected, setConnected] = useState(true);
  const [seedAllowed, setSeedAllowed] = useState<boolean | null>(null);

  // 1) Autenticación: anónima para clientes, correo/contraseña para admin y repartidores
  useEffect(() => {
    const unsub = onAuthStateChanged(fbAuth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(fbAuth);
        } catch (e: any) {
          setAuth({
            ready: true,
            uid: null,
            role: 'cliente',
            error:
              e?.code && e.code.includes('operation-not-allowed')
                ? 'Activa el acceso "Anónimo" en Firebase → Authentication.'
                : e?.code && e.code.includes('unauthorized-domain')
                ? 'Este dominio no está autorizado en Firebase → Authentication → Configuración.'
                : `No se pudo conectar con la nube: ${e?.message || e}`
          });
        }
        return;
      }
      if (user.isAnonymous) {
        setAuth({ ready: true, uid: user.uid, role: 'cliente' });
        return;
      }
      try {
        const snap = await get(ref(fbDb, `roles/${user.uid}`));
        const r = snap.val();
        if (r?.role === 'admin') {
          setAuth({ ready: true, uid: user.uid, role: 'admin' });
        } else if (r?.role === 'repartidor' && r.repartidorId) {
          setAuth({ ready: true, uid: user.uid, role: 'repartidor', repartidorId: r.repartidorId });
        } else {
          await signOut(fbAuth);
        }
      } catch {
        await signOut(fbAuth);
      }
    });
    return () => unsub();
  }, []);

  // 2) Estado de conexión
  useEffect(() => {
    const unsub = onValue(ref(fbDb, '.info/connected'), (s) => setConnected(s.val() === true));
    return () => unsub();
  }, []);

  // 3) Migración inicial: solo la primera vez, el admin sube los datos locales
  useEffect(() => {
    setSeedAllowed(null);
    if (auth.role !== 'admin' || !auth.uid) return;
    let timer: any = null;
    let cancelled = false;
    get(ref(fbDb, 'meta/seeded'))
      .then((snap) => {
        if (cancelled) return;
        const allowed = !snap.exists();
        setSeedAllowed(allowed);
        if (allowed) {
          timer = setTimeout(() => {
            set(ref(fbDb, 'meta/seeded'), true).catch(() => {});
          }, 8000);
        }
      })
      .catch(() => !cancelled && setSeedAllowed(false));
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [auth.role, auth.uid]);

  const isAdmin = auth.role === 'admin';
  const isRep = auth.role === 'repartidor';
  const adminAuth: AuthInfo = isAdmin && seedAllowed === null ? { ...auth, ready: false } : auth;
  const seed = isAdmin && seedAllowed === true;

  // 4) Nodos completos
  useWholeNode('productos', a.productos, a.setProductos, auth, true, isAdmin);
  useWholeNode('accesorios', a.accesorios, a.setAccesorios, auth, true, isAdmin);
  useWholeNode('telefonos', a.telefonos, a.setTelefonos, auth, true, isAdmin);
  useWholeNode('negocio', a.negocio, a.setNegocio, auth, true, isAdmin);
  useWholeNode('empresasB2B', a.empresasB2B, a.setEmpresasB2B, auth, isAdmin, isAdmin);
  useWholeNode('clientesVIP', a.clientesVIP, a.setClientesVIP, auth, isAdmin, isAdmin);
  useWholeNode('crmPlantillas', a.crmPlantillas, a.setCrmPlantillas, auth, isAdmin, isAdmin);
  useWholeNode('cotizaciones', a.cotizaciones, a.setCotizaciones, auth, isAdmin, isAdmin);
  useWholeNode('clubFidelidad', a.clubFidelidad, a.setClubFidelidad, auth, isAdmin, isAdmin);

  // 5) Pedidos
  const ownId = !isAdmin ? a.activeCustomerOrderId : null;
  const pedidoSources: KeyedSource[] = [];
  if (isAdmin) {
    pedidoSources.push({ name: 'all', kind: 'collection', q: () => ref(fbDb, 'pedidos') });
  } else if (isRep && auth.repartidorId) {
    pedidoSources.push({
      name: 'mine',
      kind: 'collection',
      q: () => query(ref(fbDb, 'pedidos'), orderByChild('repartidorId'), equalTo(auth.repartidorId as string))
    });
  }
  if (ownId) {
    pedidoSources.push({
      name: 'own',
      kind: 'single',
      id: ownId,
      q: () => ref(fbDb, `pedidos/${ownId}`),
      retry: true
    });
  }
  useKeyed<any>({
    path: 'pedidos',
    items: a.pedidos,
    setItems: a.setPedidos,
    auth: adminAuth,
    sources: pedidoSources,
    sourcesKey: `${auth.role}|${auth.repartidorId || ''}|${ownId || ''}`,
    seedLocal: seed,
    waitLoad: isAdmin,
    canWrite: (p, known) => {
      if (isAdmin) return true;
      if (isRep) return known ? p.repartidorId === auth.repartidorId : p.ownerUid === auth.uid;
      return !known && p.ownerUid === auth.uid;
    },
    canDelete: isAdmin,
    sortFn: (x, y) => (y.timestamp || 0) - (x.timestamp || 0)
  });

  // 6) Repartidores (un nodo por repartidor; sin contraseñas)
  useKeyed<any>({
    path: 'repartidores',
    items: a.repartidores,
    setItems: a.setRepartidores,
    auth: adminAuth,
    sources: [{ name: 'all', kind: 'collection', q: () => ref(fbDb, 'repartidores') }],
    sourcesKey: 'all',
    seedLocal: seed,
    waitLoad: isAdmin,
    canWrite: (r) => isAdmin || (isRep && r.id === auth.repartidorId),
    canDelete: isAdmin,
    prepare: (r) => {
      const { password, ...rest } = r;
      return rest;
    },
    sortFn: (x, y) => String(x.id).localeCompare(String(y.id))
  });

  // 7) Ventas (solo el admin las lee; el repartidor únicamente crea la venta al finalizar)
  useKeyed<any>({
    path: 'ventas',
    items: a.ventas,
    setItems: a.setVentas,
    auth: adminAuth,
    sources: isAdmin ? [{ name: 'all', kind: 'collection', q: () => ref(fbDb, 'ventas') }] : [],
    sourcesKey: auth.role,
    seedLocal: seed,
    waitLoad: isAdmin,
    canWrite: (v, known) => isAdmin || (isRep && !known && newVentaIds.has(v.id)),
    canDelete: isAdmin
  });

  return { auth, connected, syncError };
}
