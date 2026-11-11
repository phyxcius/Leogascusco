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

/**
 * Formats a phone number for WhatsApp URLs (wa.me), guaranteeing the Peruvian country code 51.
 * Example: '969773064' -> '51969773064'
 *          '+51 969 773 064' -> '51969773064'
 */
export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return '51969773064';
  const clean = phone.replace(/\D/g, '');
  if (!clean) return '51969773064';
  // If 9 digits (standard Peruvian mobile number e.g. 969773064), prepend 51
  if (clean.length === 9) {
    return `51${clean}`;
  }
  // If 11 digits starting with 51 (519XXXXXXXX)
  if (clean.length === 11 && clean.startsWith('51')) {
    return clean;
  }
  // If starts with 0051
  if (clean.startsWith('0051')) {
    return clean.slice(2);
  }
  // If longer than 9 digits and ends with a 9-digit Peruvian cell
  if (clean.length > 9) {
    const last9 = clean.slice(-9);
    if (last9.startsWith('9')) {
      return `51${last9}`;
    }
  }
  return clean.startsWith('51') ? clean : `51${clean}`;
}

