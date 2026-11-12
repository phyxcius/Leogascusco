// Utility service for Peruvian Identity (RENIEC / DNI) and Tax Administration (SUNAT / RUC)
// Supports apis.net.pe (v1 direct public + v2 authenticated) and apiperu.dev with automatic fallback.

export interface ResDni {
  success: boolean;
  dni: string;
  nombreCompleto: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  direccion?: string;
  error?: string;
  fuente?: string;
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
}

export const getStoredApisPeruToken = (): string => {
  try {
    return (
      localStorage.getItem('leogas_apisperu_token') ||
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImVkd2lub2JsaXRhc3ViYWxkZUBnbWFpbC5jb20iLCJqdGkiOiIxNzExZGRjNTc5M2ZhYjQ0In0.h1PcqQHzHBK6abr7ZGVkMeSTOSN49BWOWHzB7wpIDw8'
    );
  } catch {
    return '';
  }
};

export const setStoredApisPeruToken = (token: string): void => {
  try {
    localStorage.setItem('leogas_apisperu_token', token.trim());
  } catch {}
};

/**
 * Consulta oficial de DNI ante RENIEC vía APIsPerú / APIS.net.pe
 * Utiliza estrategia resiliente multi-endpoint (v1 público -> v2 autenticado -> apiperu.dev)
 */
export async function consultarDni(rawDni: string, customToken?: string): Promise<ResDni> {
  const dni = rawDni.trim().replace(/\D/g, '');
  if (dni.length !== 8) {
    return {
      success: false,
      dni,
      nombreCompleto: '',
      error: 'El DNI debe tener exactamente 8 dígitos numéricos.'
    };
  }

  const token = customToken?.trim() || getStoredApisPeruToken();

  // 1. Try apis.net.pe v1 (Direct public endpoint, highly reliable, no 401 token blockage)
  try {
    const res = await fetch(`https://api.apis.net.pe/v1/dni?numero=${dni}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.nombre || data.nombres)) {
        const full =
          data.nombre?.trim() ||
          `${data.nombres || ''} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim();
        return {
          success: true,
          dni,
          nombreCompleto: full,
          nombres: data.nombres || '',
          apellidoPaterno: data.apellidoPaterno || '',
          apellidoMaterno: data.apellidoMaterno || '',
          direccion: data.direccion || '',
          fuente: 'APIS.net.pe v1 (RENIEC Padrón Oficial)'
        };
      }
    }
  } catch (err) {
    // Continue to next fallback
  }

  // 2. Try apis.net.pe v2 (Bearer Token endpoint)
  if (token) {
    try {
      const res = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
        method: 'GET',
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.nombres || data.nombreCompleto)) {
          const full =
            data.nombreCompleto?.trim() ||
            `${data.nombres || ''} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim();
          return {
            success: true,
            dni,
            nombreCompleto: full,
            nombres: data.nombres || '',
            apellidoPaterno: data.apellidoPaterno || '',
            apellidoMaterno: data.apellidoMaterno || '',
            direccion: data.direccion || '',
            fuente: 'APIS.net.pe v2 (RENIEC)'
          };
        }
      }
    } catch (err) {
      // Continue to next fallback
    }
  }

  // 3. Try apiperu.dev endpoint as fallback
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
            fuente: 'APIsPerú Dev (RENIEC)'
          };
        }
      }
    } catch (err) {
      // Fallback exhausted
    }
  }

  return {
    success: false,
    dni,
    nombreCompleto: '',
    error: 'No se pudo validar el DNI en los padrones en línea de RENIEC.'
  };
}

/**
 * Consulta oficial de RUC ante SUNAT vía APIsPerú / APIS.net.pe
 * Utiliza estrategia resiliente multi-endpoint (v1 público -> v2 autenticado -> apiperu.dev)
 */
export async function consultarRuc(rawRuc: string, customToken?: string): Promise<ResRuc> {
  const ruc = rawRuc.trim().replace(/\D/g, '');
  if (ruc.length !== 11) {
    return {
      success: false,
      ruc,
      razonSocial: '',
      error: 'El RUC debe tener exactamente 11 dígitos numéricos.'
    };
  }

  const token = customToken?.trim() || getStoredApisPeruToken();

  // 1. Try apis.net.pe v1 (Direct public endpoint, highly reliable, no 401 token blockage)
  try {
    const res = await fetch(`https://api.apis.net.pe/v1/ruc?numero=${ruc}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.nombre || data.razonSocial)) {
        const razonSocial = (data.nombre || data.razonSocial || '').trim();
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
          fuente: 'APIS.net.pe v1 (SUNAT Padrón Oficial)'
        };
      }
    }
  } catch (err) {
    // Continue to next fallback
  }

  // 2. Try apis.net.pe v2 (Bearer Token endpoint)
  if (token) {
    try {
      const res = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${ruc}`, {
        method: 'GET',
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.razonSocial || data.nombre)) {
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
            fuente: 'APIS.net.pe v2 (SUNAT)'
          };
        }
      }
    } catch (err) {
      // Continue to next fallback
    }
  }

  // 3. Try apiperu.dev endpoint as fallback
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
            fuente: 'APIsPerú Dev (SUNAT)'
          };
        }
      }
    } catch (err) {
      // Fallback exhausted
    }
  }

  return {
    success: false,
    ruc,
    razonSocial: '',
    error: 'No se pudo validar el RUC en el padrón en línea de SUNAT.'
  };
}
