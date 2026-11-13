import { NegocioIdentidad } from '../types/index';

export interface BrandThemePreset {
  id: NonNullable<NegocioIdentidad['colorTema']>;
  nombre: string;
  descripcion: string;
  primary: string;
  secondary: string;
  shades: Record<string, string>;
  indigoShades: Record<string, string>;
  heroShades?: {
    y100: string;
    y200: string;
    y300: string;
    y400: string;
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function mixColor(hex1: string, hex2: string, weight2: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return hex1;
  const w1 = 1 - weight2;
  const r = Math.round(c1.r * w1 + c2.r * weight2);
  const g = Math.round(c1.g * w1 + c2.g * weight2);
  const b = Math.round(c1.b * w1 + c2.b * weight2);
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`;
}

export function buildPaletteFromHex(baseHex: string): Record<string, string> {
  const safeHex = hexToRgb(baseHex) ? baseHex : '#6b21a8';
  return {
    '50': mixColor(safeHex, '#ffffff', 0.92),
    '100': mixColor(safeHex, '#ffffff', 0.82),
    '200': mixColor(safeHex, '#ffffff', 0.65),
    '300': mixColor(safeHex, '#ffffff', 0.45),
    '400': mixColor(safeHex, '#ffffff', 0.25),
    '500': mixColor(safeHex, '#ffffff', 0.1),
    '600': safeHex,
    '700': mixColor(safeHex, '#000000', 0.12),
    '800': mixColor(safeHex, '#000000', 0.25),
    '900': mixColor(safeHex, '#000000', 0.42),
    '950': mixColor(safeHex, '#000000', 0.6)
  };
}

export const BRAND_THEME_PRESETS: BrandThemePreset[] = [
  {
    id: 'morado',
    nombre: 'Morado LeoGas (Original)',
    descripcion: 'Morado intenso + Dorado energético',
    primary: '#6b21a8',
    secondary: '#fde047',
    shades: buildPaletteFromHex('#7e22ce'),
    indigoShades: buildPaletteFromHex('#4f46e5')
  },
  {
    id: 'azul',
    nombre: 'Azul Corporativo (Solgas / Primax)',
    descripcion: 'Azul marino + Celeste / Dorado',
    primary: '#1d4ed8',
    secondary: '#bae6fd',
    shades: buildPaletteFromHex('#1d4ed8'),
    indigoShades: buildPaletteFromHex('#0369a1'),
    heroShades: {
      y100: '#e0f2fe',
      y200: '#bae6fd',
      y300: '#7dd3fc',
      y400: '#38bdf8'
    }
  },
  {
    id: 'rojo',
    nombre: 'Rojo Llama (LimaGas / Fuego)',
    descripcion: 'Rojo carmesí + Dorado brillante',
    primary: '#dc2626',
    secondary: '#fef08a',
    shades: buildPaletteFromHex('#dc2626'),
    indigoShades: buildPaletteFromHex('#991b1b'),
    heroShades: {
      y100: '#fee2e2',
      y200: '#fecaca',
      y300: '#fca5a5',
      y400: '#f87171'
    }
  },
  {
    id: 'verde',
    nombre: 'Verde EcoGas',
    descripcion: 'Verde esmeralda + Menta fresco',
    primary: '#059669',
    secondary: '#a7f3d0',
    shades: buildPaletteFromHex('#059669'),
    indigoShades: buildPaletteFromHex('#0f766e'),
    heroShades: {
      y100: '#d1fae5',
      y200: '#a7f3d0',
      y300: '#6ee7b7',
      y400: '#34d399'
    }
  },
  {
    id: 'naranja',
    nombre: 'Naranja Energía GLP',
    descripcion: 'Naranja cálido + Ámbar solar',
    primary: '#ea580c',
    secondary: '#fed7aa',
    shades: buildPaletteFromHex('#ea580c'),
    indigoShades: buildPaletteFromHex('#c2410c'),
    heroShades: {
      y100: '#ffedd5',
      y200: '#fed7aa',
      y300: '#fdba74',
      y400: '#fb923c'
    }
  },
  {
    id: 'oscuro',
    nombre: 'Negro Ejecutivo VIP',
    descripcion: 'Pizarra oscuro + Dorado elegante',
    primary: '#1e293b',
    secondary: '#fde68a',
    shades: buildPaletteFromHex('#334155'),
    indigoShades: buildPaletteFromHex('#0f172a')
  }
];

const ALL_SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

export function applyBrandTheme(negocio?: Partial<NegocioIdentidad>): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const tema = negocio?.colorTema || 'morado';

  if (tema === 'morado') {
    // Restore original Tailwind CSS default purple / indigo / yellow / amber tokens
    ALL_SHADE_KEYS.forEach((k) => {
      root.style.removeProperty(`--color-purple-${k}`);
      root.style.removeProperty(`--color-indigo-${k}`);
    });
    ['100', '200', '300', '400'].forEach((k) => {
      root.style.removeProperty(`--color-yellow-${k}`);
      root.style.removeProperty(`--color-amber-${k}`);
    });
    root.style.setProperty('--primary', '#6b21a8');
    root.style.setProperty('--primary-dark', '#581c87');
    root.style.setProperty('--accent', '#f59e0b');
    return;
  }

  let primaryShades: Record<string, string>;
  let indigoShades: Record<string, string>;
  let heroShades: BrandThemePreset['heroShades'] | undefined;
  let primaryHex = negocio?.colorPrimario || '#6b21a8';
  let secondaryHex = negocio?.colorSecundario || '#f59e0b';

  if (tema === 'personalizado') {
    primaryShades = buildPaletteFromHex(primaryHex);
    indigoShades = buildPaletteFromHex(mixColor(primaryHex, '#000000', 0.15));
    const secPalette = buildPaletteFromHex(secondaryHex);
    heroShades = {
      y100: secPalette['100'],
      y200: secPalette['200'],
      y300: secPalette['300'],
      y400: secPalette['400']
    };
  } else {
    const preset = BRAND_THEME_PRESETS.find((p) => p.id === tema) || BRAND_THEME_PRESETS[0];
    primaryShades = preset.shades;
    indigoShades = preset.indigoShades;
    heroShades = preset.heroShades;
    primaryHex = preset.primary;
    secondaryHex = preset.secondary;
  }

  ALL_SHADE_KEYS.forEach((k) => {
    root.style.setProperty(`--color-purple-${k}`, primaryShades[k]);
    root.style.setProperty(`--color-indigo-${k}`, indigoShades[k]);
  });

  if (heroShades) {
    root.style.setProperty('--color-yellow-100', heroShades.y100);
    root.style.setProperty('--color-yellow-200', heroShades.y200);
    root.style.setProperty('--color-yellow-300', heroShades.y300);
    root.style.setProperty('--color-yellow-400', heroShades.y400);
    root.style.setProperty('--color-amber-300', heroShades.y300);
    root.style.setProperty('--color-amber-400', heroShades.y400);
  } else {
    ['100', '200', '300', '400'].forEach((k) => {
      root.style.removeProperty(`--color-yellow-${k}`);
      root.style.removeProperty(`--color-amber-${k}`);
    });
  }

  root.style.setProperty('--primary', primaryHex);
  root.style.setProperty('--primary-dark', primaryShades['900']);
  root.style.setProperty('--accent', secondaryHex);
}
