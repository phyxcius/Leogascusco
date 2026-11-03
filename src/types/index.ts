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
  imagen?: string;
}

export interface TelefonosConfig {
  whatsapp: string;
  tel1: string;
  tel2: string;
  tel3?: string;
}

export interface Repartidor {
  id: string;
  nombre: string;
  usuario?: string;
  password?: string;
  online: boolean;
  lat: number;
  lng: number;
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
  etapa: number; // 0: asignado, 1: en camino, 2: en puerta, 3: completado
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
  comprobante?: string;
}
