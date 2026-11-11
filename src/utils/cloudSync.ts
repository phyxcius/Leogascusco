/**
 * Cloud Synchronization Service for LeoGas Cusco / La Chuspa Tech
 * Handles syncing business identity, catalog, accessories, and loyalty data
 * to the GitHub repository powering https://phyxcius.github.io/Leogascusco
 * so changes made from any phone or computer are visible to all users globally.
 */

import { NegocioIdentidad, TelefonosConfig, Producto, Accesorio, ClienteFidelidad } from '../types/index';

export interface CloudStorePayload {
  version: string;
  updatedAt: string;
  negocio: NegocioIdentidad;
  telefonos: TelefonosConfig;
  productos: Producto[];
  accesorios: Accesorio[];
  clubFidelidad: ClienteFidelidad[];
}

// Convert Unicode string to Base64 safely (handles Spanish accents, emojis)
function utf8ToBase64(str: string): string {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

// Convert Base64 back to UTF-8
function base64ToUtf8(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(window.atob(str), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Pushes the full store to the GitHub Repository via GitHub REST API.
 * Updates public/data/store.json on the target branch.
 */
export async function pushStoreToGitHub(
  payload: CloudStorePayload,
  token: string,
  repo: string,
  branch: string = 'main'
): Promise<{ ok: boolean; msg: string; commitUrl?: string }> {
  const cleanToken = token.trim();
  const cleanRepo = repo
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\/+$/, '');
  const cleanBranch = branch.trim() || 'main';

  if (!cleanToken) {
    return {
      ok: false,
      msg: 'No se encontró un Token Personal de GitHub configurado. Configúralo en la Zona del Desarrollador para publicar cambios globales.'
    };
  }

  if (!cleanRepo || !cleanRepo.includes('/')) {
    return {
      ok: false,
      msg: 'El nombre del repositorio no es válido. Debe ser usuario/repositorio (ejemplo: phyxcius/Leogascusco).'
    };
  }

  const filePath = 'public/data/store.json';
  const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`;
  const authHeader = cleanToken.startsWith('ghp_') ? `token ${cleanToken}` : `Bearer ${cleanToken}`;

  try {
    // 1. Get current file SHA if it already exists
    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(`${apiUrl}?ref=${cleanBranch}`, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/vnd.github+json'
        }
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch {
      // file might not exist yet
    }

    // 2. Format JSON with indentation
    const jsonContent = JSON.stringify(payload, null, 2);
    const contentBase64 = utf8ToBase64(jsonContent);

    // 3. Commit and push file via PUT
    const putBody: Record<string, any> = {
      message: `Actualización global de catálogo e identidad desde Panel de Control LeoGas [skip ci]`,
      content: contentBase64,
      branch: cleanBranch
    };
    if (sha) {
      putBody.sha = sha;
    }

    let putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putBody)
    });

    // If 401 and was Bearer, retry with token prefix
    if (putRes.status === 401 && !cleanToken.startsWith('ghp_')) {
      putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `token ${cleanToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(putBody)
      });
    }

    if (putRes.ok) {
      const result = await putRes.json();
      
      // Also sync data/store.json for deployments where dist root is published to GitHub Pages
      try {
        const altFilePath = 'data/store.json';
        const altApiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${altFilePath}`;
        let altSha: string | undefined = undefined;
        const altGet = await fetch(`${altApiUrl}?ref=${cleanBranch}`, {
          headers: {
            Authorization: cleanToken.startsWith('ghp_') ? `token ${cleanToken}` : `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github+json'
          }
        });
        if (altGet.ok) {
          const altData = await altGet.json();
          altSha = altData.sha;
        }
        const altPutBody: Record<string, any> = {
          message: `Sincronización de catálogo en data/store.json [skip ci]`,
          content: contentBase64,
          branch: cleanBranch
        };
        if (altSha) altPutBody.sha = altSha;
        await fetch(altApiUrl, {
          method: 'PUT',
          headers: {
            Authorization: cleanToken.startsWith('ghp_') ? `token ${cleanToken}` : `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(altPutBody)
        });
      } catch {
        // secondary path optional
      }

      return {
        ok: true,
        msg: `¡Datos sincronizados y publicados exitosamente en GitHub (${cleanRepo})! Todos los celulares y clientes verán los cambios.`,
        commitUrl: result.commit?.html_url
      };
    } else {
      const errData = await putRes.json().catch(() => ({}));
      let msg = errData.message || `Error HTTP ${putRes.status}`;
      if (putRes.status === 401) {
        msg = 'Token de GitHub no autorizado o expirado. Genera un nuevo Token en GitHub con permisos de repo.';
      } else if (putRes.status === 404) {
        msg = `Repositorio "${cleanRepo}" no encontrado o sin permisos de escritura.`;
      }
      return { ok: false, msg };
    }
  } catch (err: any) {
    return {
      ok: false,
      msg: `Error de red al conectar con GitHub: ${err.message || 'Sin conexión'}`
    };
  }
}

/**
 * Fetches the latest global store from the Cloud (GitHub Pages or raw GitHub content)
 * with timestamp cache-busting to prevent stale browser caches on mobile devices.
 */
export async function fetchStoreFromCloud(
  repo: string = 'phyxcius/Leogascusco',
  branch: string = 'main'
): Promise<CloudStorePayload | null> {
  const timestamp = Date.now();
  const cleanRepo = repo
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\/+$/, '') || 'phyxcius/Leogascusco';
  const cleanBranch = branch.trim() || 'main';

  // URLs to attempt in order of priority (live raw content first to bypass static CDN cache):
  const candidateUrls = [
    `https://raw.githubusercontent.com/${cleanRepo}/${cleanBranch}/public/data/store.json?_t=${timestamp}`,
    `https://raw.githubusercontent.com/${cleanRepo}/${cleanBranch}/data/store.json?_t=${timestamp}`,
    `https://raw.githubusercontent.com/phyxcius/Leogascusco/main/public/data/store.json?_t=${timestamp}`,
    `https://raw.githubusercontent.com/phyxcius/Leogascusco/main/data/store.json?_t=${timestamp}`,
    `https://raw.githubusercontent.com/phyxcius/Leogas/main/public/data/store.json?_t=${timestamp}`,
    `./data/store.json?_t=${timestamp}`,
    `/data/store.json?_t=${timestamp}`,
    `/Leogascusco/data/store.json?_t=${timestamp}`
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.negocio && Array.isArray(data.productos)) {
          return data as CloudStorePayload;
        }
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}
