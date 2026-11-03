/**
 * Helper to resolve asset and page URLs safely across localhost, subpaths, and GitHub Pages.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  // Remote URLs or data URLs require no transformation
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // Strip leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env?.BASE_URL || './';
  
  if (base.endsWith('/')) {
    return `${base}${cleanPath}`;
  }
  return `${base}/${cleanPath}`;
}

export function getPageUrl(page: string): string {
  const base = import.meta.env?.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPage = page.startsWith('/') ? page.slice(1) : page;
  return `${cleanBase}${cleanPage}`;
}
