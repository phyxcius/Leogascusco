export interface Producto {
  id: string;
  nombre: string;
  tag?: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  imagen?: string;
}

export interface Accesorio {
  id: string;
  nombre: string;
  precio: number;
  disponible: boolean;
  descripcion?: string;
  imagen?: string;
}

export interface TelefonosConfig {
  whatsapp: string;
  tel1: string;
  tel2: string;
  tel3?: string;
}

export interface NegocioIdentidad {
  nombre: string;
  slogan: string;
  logoUrl: string;
  imagenPresentacion?: string; // Imagen de presentación / flyer de superposición en el index
  whatsapp: string;
  telPrincipal: string;
  telSecundario: string;
  telFijo?: string;
  direccion: string;
  enlaceChuspa: string;
  igvPorcentaje: number; // default 18
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  googleReviewUrl?: string;
}


export interface Repartidor {
  id: string;
  nombre: string;
  usuario?: string;
  password?: string;
  online: boolean;
  lat: number;
  lng: number;
  vehiculo?: string;
  etapaSecuencia?: number; // 1: En camino, 2: En puerta, 3: Entregado
  ultimaActualizacionSecuencia?: string;
}

export interface ItemPedido {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  tipoVenta?: 'minorista' | 'mayorista_b2b';
  cliente: string;
  tipoBalon: string;
  producto?: string;
  cantidad?: number;
  telefono?: string;
  montoCobro: string | number;
  metodoPago: string;
  tipoComprobante?: string;
  direccion?: string;
  repartidorId?: string;
  repartidorNombre?: string;
  gpsUrl?: string;
  lat?: number;
  lng?: number;
  estado: 'pendiente_asignacion' | 'en_proceso' | 'completado' | 'cancelado';
  etapa: number; // 0: asignado, 1: en camino, 2: en puerta, 3: entregado, 4: finalizado en base
  clienteSaliendo?: boolean;
  clienteSaliendoHora?: string;
  clienteSaliendoVisto?: boolean;
  ownerUid?: string; // uid anónimo de Firebase del cliente que creó el pedido
  timestamp: number;
  hora: string;
  fecha?: string;
  horaAsignacion?: string;
  horaActualizacion?: string;
}

export interface EmpresaB2B {
  ruc: string;
  razonSocial: string;
  precioBalon45: number;
  condicionPago: string; // 'Crédito (A cuenta 15 días)' | 'Crédito (A cuenta 30 días)' | 'Factura al Contado'
  direccion?: string;
  telefono?: string;
}

export interface ClienteVIP {
  id: string;
  nombre: string;
  documento?: string; // DNI / RUC
  telefono?: string;
  direccion: string;
  pedidosTotales: number;
  notas?: string;
}

export interface VentaRegistro {
  id?: string;
  fecha: string;
  cliente: string;
  productos: string;
  total: number;
  pago: string;
  repartidorId?: string;
  repartidorNombre?: string;
  comprobante: string;
  documento?: string;
  tipoDoc?: 'DNI' | 'RUC';
  direccion?: string;
  subtotal?: number;
  igv?: number;
  sunatEstado?: 'ACEPTADO' | 'PENDIENTE';
}

// CRM Category Types based on screenshot
export type CRMCategoria = 'MARKETING' | 'UTILIDAD' | 'AUTENTICACION' | 'SERVICIO';

export interface CRMPlantilla {
  id: string;
  categoria: CRMCategoria;
  titulo: string;
  subtipo: string;
  descripcion: string;
  icono: string;
  plantillaTexto: string;
}

export interface CotizacionCRM {
  id: string;
  codigo: string;
  cliente: string;
  tipoDoc: 'DNI' | 'RUC';
  numDoc: string;
  telefono: string;
  direccion: string;
  fechaEmision: string;
  fechaProgramada: string;
  horaProgramada?: string;
  items: {
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
  }[];
  subtotal: number;
  igv: number;
  total: number;
  estado: 'cotizado' | 'aprobado' | 'programado' | 'facturado';
  repartidorAsignado?: string;
  notas?: string;
}

export interface HistorialSello {
  fecha: string;
  detalle: string;
  sellosSumados: number;
}

export interface ClienteFidelidad {
  id: string;
  dni: string;
  nombre: string;
  telefono?: string;
  sellos: number; // 0 to 10
  totalConsumos: number;
  premiosCanjeados: number;
  ultimoConsumo: string;
  historial?: HistorialSello[];
}
