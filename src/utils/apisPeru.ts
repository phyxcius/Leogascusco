// Utility service for Peruvian Identity (RENIEC / DNI) and Tax Administration (SUNAT / RUC)
// Primary provider: APIsPerú Official CORS-enabled API (https://dniruc.apisperu.com/api/v1/)
// Secondary fallback: apiperu.dev

export interface ResDni {
  success: boolean;
  dni: string;
  nombreCompleto: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  direccion?: string;
  codVerifica?: string | number;
  error?: string;
  fuente?: string;
  tokenWarning?: string;
}

export interface ResRuc {
  success: boolean;
  ruc: string;
  razonSocial: string;
  estado?: string;
  condicion?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  ubigeo?: string;
  error?: string;
  fuente?: string;
  tokenWarning?: string;
}

export interface FacturacionApisPeruConfig {
  tokenEmpresa: string;
  entorno: 'beta' | 'produccion';
  rucEmisor: string;
  razonSocialEmisor: string;
}

// Verified working APIsPerú Consultas DNI/RUC Token (CORS enabled via dniruc.apisperu.com)
export const DEFAULT_DNIRUC_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVkd2lub2JsaXRhc3ViYWxkZUBnbWFpbC5jb20iLCJqdGkiOiIxNzExZGRjNTc5M2ZhYjQ0In0.h1PcqQHzHBK6abr7ZGVkMeSTOSN49BWOWHzB7wpIDw8';

const KEY_DNIRUC_TOKEN = 'leogas_apisperu_dniruc_token';
const KEY_FACTURACION_CONFIG = 'leogas_apisperu_facturacion_config';

export const getStoredApisPeruToken = (): string => {
  try {
    const stored = localStorage.getItem(KEY_DNIRUC_TOKEN);
    if (stored && stored.trim().length > 20) return stored.trim();
    return DEFAULT_DNIRUC_TOKEN;
  } catch {
    return DEFAULT_DNIRUC_TOKEN;
  }
};

export const setStoredApisPeruToken = (token: string): void => {
  try {
    const clean = token.trim();
    if (!clean) {
      localStorage.removeItem(KEY_DNIRUC_TOKEN);
    } else {
      localStorage.setItem(KEY_DNIRUC_TOKEN, clean);
    }
  } catch {}
};

export const resetStoredApisPeruToken = (): string => {
  try {
    localStorage.setItem(KEY_DNIRUC_TOKEN, DEFAULT_DNIRUC_TOKEN);
  } catch {}
  return DEFAULT_DNIRUC_TOKEN;
};

export const getStoredFacturacionConfig = (): FacturacionApisPeruConfig => {
  try {
    const raw = localStorage.getItem(KEY_FACTURACION_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        tokenEmpresa: parsed.tokenEmpresa || '',
        entorno: parsed.entorno === 'produccion' ? 'produccion' : 'beta',
        rucEmisor: parsed.rucEmisor || '10424235496',
        razonSocialEmisor: parsed.razonSocialEmisor || 'LA CHUSPA ANUNCIOS'
      };
    }
    // Check if the user previously pasted a Token de empresa into the old key
    const legacy = localStorage.getItem('leogas_apisperu_token');
    if (legacy && legacy !== DEFAULT_DNIRUC_TOKEN && legacy.length > 20) {
      return {
        tokenEmpresa: legacy,
        entorno: 'beta',
        rucEmisor: '10424235496',
        razonSocialEmisor: 'LA CHUSPA ANUNCIOS'
      };
    }
  } catch {}
  return {
    tokenEmpresa: '',
    entorno: 'beta',
    rucEmisor: '10424235496',
    razonSocialEmisor: 'LA CHUSPA ANUNCIOS'
  };
};

export const setStoredFacturacionConfig = (cfg: FacturacionApisPeruConfig): void => {
  try {
    localStorage.setItem(KEY_FACTURACION_CONFIG, JSON.stringify(cfg));
  } catch {}
};

async function fetchDniFromApisPeru(dni: string, token: string): Promise<{ ok: boolean; status: number; data?: any; msg?: string }> {
  const res = await fetch(
    `https://dniruc.apisperu.com/api/v1/dni/${dni}?token=${encodeURIComponent(token)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' }
    }
  );
  const data = await res.json().catch(() => null);
  if (res.ok && data && data.success !== false && (data.nombres || data.nombreCompleto)) {
    return { ok: true, status: res.status, data };
  }
  return {
    ok: false,
    status: res.status,
    data,
    msg: data?.message || `HTTP ${res.status}`
  };
}

async function fetchRucFromApisPeru(ruc: string, token: string): Promise<{ ok: boolean; status: number; data?: any; msg?: string }> {
  const res = await fetch(
    `https://dniruc.apisperu.com/api/v1/ruc/${ruc}?token=${encodeURIComponent(token)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' }
    }
  );
  const data = await res.json().catch(() => null);
  if (res.ok && data && data.success !== false && (data.razonSocial || data.nombre)) {
    return { ok: true, status: res.status, data };
  }
  return {
    ok: false,
    status: res.status,
    data,
    msg: data?.message || `HTTP ${res.status}`
  };
}

/**
 * Consulta oficial de DNI ante RENIEC vía APIsPerú (dniruc.apisperu.com)
 * Compatible 100% desde el navegador (CORS habilitado) y en GitHub Pages.
 */
export async function consultarDni(
  rawDni: string,
  customToken?: string,
  strictCustomToken = false
): Promise<ResDni> {
  const dni = rawDni.trim().replace(/\D/g, '');
  if (dni.length !== 8) {
    return {
      success: false,
      dni,
      nombreCompleto: '',
      error: 'El DNI debe tener exactamente 8 dígitos numéricos.'
    };
  }

  const token = (customToken !== undefined ? customToken : getStoredApisPeruToken()).trim() || DEFAULT_DNIRUC_TOKEN;
  let tokenWarning: string | undefined;

  // 1. Primary: dniruc.apisperu.com (Official CORS-enabled APIsPerú endpoint)
  try {
    const attempt = await fetchDniFromApisPeru(dni, token);
    if (attempt.ok && attempt.data) {
      const data = attempt.data;
      const full = `${data.nombres || ''} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim();
      return {
        success: true,
        dni,
        nombreCompleto: full,
        nombres: data.nombres || '',
        apellidoPaterno: data.apellidoPaterno || '',
        apellidoMaterno: data.apellidoMaterno || '',
        codVerifica: data.codVerifica,
        fuente: 'APIsPerú Oficial (RENIEC en Vivo)'
      };
    }

    // If token returned 401/invalid (e.g., user pasted a Facturación Token de empresa instead of Consultas DNI/RUC token)
    if (attempt.status === 401 || attempt.msg?.toLowerCase().includes('token')) {
      if (strictCustomToken) {
        return {
          success: false,
          dni,
          nombreCompleto: '',
          error:
            'El token ingresado no corresponde al servicio "API Consultas DNI/RUC" de APIsPerú (nota: el "Token de empresa" de Facturación Electrónica es un token diferente que solo sirve para emitir XML/CDR).'
        };
      }
      // Try automatic fallback to verified DEFAULT_DNIRUC_TOKEN so clients aren't blocked
      if (token !== DEFAULT_DNIRUC_TOKEN) {
        tokenWarning = 'Token personalizado inválido para Consultas DNI/RUC; usando token base de respaldo.';
        const fallbackAttempt = await fetchDniFromApisPeru(dni, DEFAULT_DNIRUC_TOKEN);
        if (fallbackAttempt.ok && fallbackAttempt.data) {
          const data = fallbackAttempt.data;
          const full = `${data.nombres || ''} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim();
          return {
            success: true,
            dni,
            nombreCompleto: full,
            nombres: data.nombres || '',
            apellidoPaterno: data.apellidoPaterno || '',
            apellidoMaterno: data.apellidoMaterno || '',
            codVerifica: data.codVerifica,
            fuente: 'APIsPerú Oficial (RENIEC Respaldo)',
            tokenWarning
          };
        }
      }
    }
  } catch {
    // Continue to apiperu.dev fallback
  }

  // 2. Fallback: apiperu.dev (also CORS-enabled) if user configured an apiperu.dev token
  if (token) {
    try {
      const res = await fetch(`https://apiperu.dev/api/dni/${dni}`, {
        method: 'GET',
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data && (data.nombre_completo || data.nombres)) {
          const full =
            data.nombre_completo?.trim() ||
            `${data.nombres || ''} ${data.apellido_paterno || ''} ${data.apellido_materno || ''}`.trim();
          return {
            success: true,
            dni,
            nombreCompleto: full,
            nombres: data.nombres || '',
            apellidoPaterno: data.apellido_paterno || '',
            apellidoMaterno: data.apellido_materno || '',
            direccion: data.direccion || '',
            fuente: 'ApiPeru.dev (RENIEC)',
            tokenWarning
          };
        }
      }
    } catch {
      // Fallback exhausted
    }
  }

  return {
    success: false,
    dni,
    nombreCompleto: '',
    error: 'No se encontró el DNI o no se pudo conectar con RENIEC en línea.'
  };
}

/**
 * Consulta oficial de RUC ante SUNAT vía APIsPerú (dniruc.apisperu.com)
 * Compatible 100% desde el navegador (CORS habilitado) y en GitHub Pages.
 */
export async function consultarRuc(
  rawRuc: string,
  customToken?: string,
  strictCustomToken = false
): Promise<ResRuc> {
  const ruc = rawRuc.trim().replace(/\D/g, '');
  if (ruc.length !== 11) {
    return {
      success: false,
      ruc,
      razonSocial: '',
      error: 'El RUC debe tener exactamente 11 dígitos numéricos.'
    };
  }

  const token = (customToken !== undefined ? customToken : getStoredApisPeruToken()).trim() || DEFAULT_DNIRUC_TOKEN;
  let tokenWarning: string | undefined;

  // 1. Primary: dniruc.apisperu.com (Official CORS-enabled APIsPerú endpoint)
  try {
    const attempt = await fetchRucFromApisPeru(ruc, token);
    if (attempt.ok && attempt.data) {
      const data = attempt.data;
      const razonSocial = (data.razonSocial || data.nombre || '').trim();
      return {
        success: true,
        ruc,
        razonSocial,
        estado: data.estado || 'ACTIVO',
        condicion: data.condicion || 'HABIDO',
        direccion: data.direccion || '',
        distrito: data.distrito || '',
        provincia: data.provincia || '',
        departamento: data.departamento || '',
        ubigeo: data.ubigeo || '',
        fuente: 'APIsPerú Oficial (SUNAT en Vivo)'
      };
    }

    if (attempt.status === 401 || attempt.msg?.toLowerCase().includes('token')) {
      if (strictCustomToken) {
        return {
          success: false,
          ruc,
          razonSocial: '',
          error:
            'El token ingresado no corresponde al servicio "API Consultas DNI/RUC" de APIsPerú (el "Token de empresa" de Facturación Electrónica pertenece al entorno de emisión, no al padrón DNI/RUC).'
        };
      }
      if (token !== DEFAULT_DNIRUC_TOKEN) {
        tokenWarning = 'Token personalizado inválido para Consultas DNI/RUC; usando token base de respaldo.';
        const fallbackAttempt = await fetchRucFromApisPeru(ruc, DEFAULT_DNIRUC_TOKEN);
        if (fallbackAttempt.ok && fallbackAttempt.data) {
          const data = fallbackAttempt.data;
          const razonSocial = (data.razonSocial || data.nombre || '').trim();
          return {
            success: true,
            ruc,
            razonSocial,
            estado: data.estado || 'ACTIVO',
            condicion: data.condicion || 'HABIDO',
            direccion: data.direccion || '',
            distrito: data.distrito || '',
            provincia: data.provincia || '',
            departamento: data.departamento || '',
            ubigeo: data.ubigeo || '',
            fuente: 'APIsPerú Oficial (SUNAT Respaldo)',
            tokenWarning
          };
        }
      }
    }
  } catch {
    // Continue to apiperu.dev fallback
  }

  // 2. Fallback: apiperu.dev (CORS-enabled)
  if (token) {
    try {
      const res = await fetch(`https://apiperu.dev/api/ruc/${ruc}`, {
        method: 'GET',
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data && (data.nombre_o_razon_social || data.razon_social)) {
          const razonSocial = (data.nombre_o_razon_social || data.razon_social || '').trim();
          return {
            success: true,
            ruc,
            razonSocial,
            estado: data.estado || 'ACTIVO',
            condicion: data.condicion || 'HABIDO',
            direccion: data.direccion_completa || data.direccion || '',
            distrito: data.distrito || '',
            provincia: data.provincia || '',
            departamento: data.departamento || '',
            ubigeo: data.ubigeo || '',
            fuente: 'ApiPeru.dev (SUNAT)',
            tokenWarning
          };
        }
      }
    } catch {
      // Fallback exhausted
    }
  }

  return {
    success: false,
    ruc,
    razonSocial: '',
    error: 'No se encontró el RUC o no se pudo conectar con SUNAT en línea.'
  };
}
