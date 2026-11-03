import { Producto, Accesorio, TelefonosConfig, Repartidor, EmpresaB2B, ClienteVIP, VentaRegistro, Pedido } from '../types/index';

export const INITIAL_PRODUCTOS: Producto[] = [
  {
    id: "gas-1",
    nombre: "Balón LeoGas 10kg Normal o Regular",
    tag: "El Moradito Rendidor",
    descripcion: "Balón sellado Llamagas de 10kg con precinto de seguridad garantizado y peso exacto.",
    precio: 50,
    disponible: true,
    imagen: "/1791513590376.jpg"
  },
  {
    id: "gas-2",
    nombre: "Balón Gas Premium 10kg",
    tag: "Máximo Rendimiento",
    descripcion: "GLP de alta pureza con válvula premium anti-fugas y máxima durabilidad.",
    precio: 55,
    disponible: true,
    imagen: "/1791513590376.jpg"
  },
  {
    id: "gas-3",
    nombre: "Balón LeoGas 45kg Industrial",
    tag: "Comercial / B2B",
    descripcion: "Balón industrial de 45kg ideal para pollerías, chifas, restaurantes, panaderías y hoteles.",
    precio: 175,
    disponible: true,
    imagen: "/medidas-de-balon-de-gas-de-10-Kg (1).png"
  }
];

export const INITIAL_ACCESORIOS: Accesorio[] = [
  {
    id: "acc-1",
    nombre: "Válvula Premium Anti-Fugas",
    precio: 35,
    disponible: true,
    imagen: "/1791513590376.jpg"
  },
  {
    id: "acc-2",
    nombre: "Manguera Reforzada Flexible 1.5m",
    precio: 20,
    disponible: true,
    imagen: "/1791513590376.jpg"
  },
  {
    id: "acc-3",
    nombre: "Abrazaderas de Seguridad (Par)",
    precio: 8,
    disponible: true,
    imagen: "/1791513590376.jpg"
  },
  {
    id: "acc-4",
    nombre: "Regulador de Presión Industrial",
    precio: 65,
    disponible: true,
    imagen: "/medidas-de-balon-de-gas-de-10-Kg (1).png"
  }
];

export const INITIAL_TELEFONOS: TelefonosConfig = {
  whatsapp: "51969773064",
  tel1: "950 727 212",
  tel2: "984 285 500",
  tel3: "(084) 501111"
};

export const INITIAL_REPARTIDORES: Repartidor[] = [
  {
    id: "rep-1",
    nombre: "Edwin",
    usuario: "edwin",
    password: "123",
    online: true,
    lat: -13.5380361,
    lng: -71.9802942,
    etapaSecuencia: 3,
    ultimaActualizacionSecuencia: "10:34 a.m."
  },
  {
    id: "rep-2",
    nombre: "Carlos",
    usuario: "carlos",
    password: "123",
    online: true,
    lat: -13.5380827,
    lng: -71.9803549,
    etapaSecuencia: 1,
    ultimaActualizacionSecuencia: "11:15 a.m."
  },
  {
    id: "rep-3",
    nombre: "Jorge",
    usuario: "jorge",
    password: "123",
    online: true,
    lat: -13.5248,
    lng: -71.9725,
    etapaSecuencia: 2,
    ultimaActualizacionSecuencia: "11:40 a.m."
  }
];

export const INITIAL_EMPRESAS_B2B: EmpresaB2B[] = [
  {
    ruc: "20601234567",
    razonSocial: "Pollería El Tablón Cusco",
    precioBalon45: 175.00,
    condicionPago: "Crédito (A cuenta 15 días)",
    direccion: "Av. El Sol 450, Wanchaq, Cusco",
    telefono: "984 112 233"
  },
  {
    ruc: "20509876543",
    razonSocial: "Chifa Hong Kong Imperial",
    precioBalon45: 170.00,
    condicionPago: "Crédito (A cuenta 30 días)",
    direccion: "Calle Maruri 220, Centro Histórico",
    telefono: "984 334 455"
  },
  {
    ruc: "20401122334",
    razonSocial: "Hotel & Restaurante Los Portales",
    precioBalon45: 175.00,
    condicionPago: "Factura al Contado",
    direccion: "Plazoleta Santo Domingo 112",
    telefono: "984 556 677"
  }
];

export const INITIAL_CLIENTES_VIP: ClienteVIP[] = [
  {
    id: "vip-1",
    nombre: "Rosa Quispe Huamán",
    documento: "23984512",
    telefono: "984 765 432",
    direccion: "Urb. Magisterio 1ra Etapa, Calle Los Pinos 140",
    pedidosTotales: 14,
    notas: "Balón Moradito Llamagas. Paga con Yape."
  },
  {
    id: "vip-2",
    nombre: "Carmen Luz Delgado",
    documento: "45127890",
    telefono: "950 123 987",
    direccion: "Av. De la Cultura 720, San Sebastián",
    pedidosTotales: 9,
    notas: "Prefiere entrega por las mañanas."
  },
  {
    id: "vip-3",
    nombre: "Edwin Oblitas Ubalde",
    documento: "23891045",
    telefono: "984 285 500",
    direccion: "Calle Garcilaso 210, Cusco",
    pedidosTotales: 22,
    notas: "Cliente preferencial LeoGas Cusco."
  }
];

export const INITIAL_PEDIDOS: Pedido[] = [
  {
    id: "cmd-1792598426294",
    repartidorId: "rep-1",
    repartidorNombre: "Edwin",
    tipoBalon: "Balón Gas Premium 10kg",
    montoCobro: "55.00",
    metodoPago: "Yape",
    tipoComprobante: "Boleta",
    cliente: "Rosa Quispe",
    direccion: "Urb. Magisterio 1ra Etapa",
    gpsUrl: "https://www.google.com/maps?q=-13.5248,-71.9725",
    lat: -13.5248,
    lng: -71.9725,
    etapa: 3,
    estado: "completado",
    hora: "11:00 a.m.",
    timestamp: Date.now() - 3600000 * 2,
    horaAsignacion: "11:00:26",
    horaActualizacion: "11:04:35 a.m."
  },
  {
    id: "cmd-1792599166780",
    repartidorId: "rep-2",
    repartidorNombre: "Carlos",
    tipoBalon: "Balón LeoGas 10kg Normal",
    montoCobro: "50.00",
    metodoPago: "Efectivo",
    tipoComprobante: "Boleta",
    cliente: "Carmen Delgado",
    direccion: "Av. De la Cultura 720",
    gpsUrl: "https://www.google.com/maps?q=-13.5380849,-71.9803639",
    lat: -13.5380849,
    lng: -71.9803639,
    etapa: 2,
    estado: "en_proceso",
    hora: "11:12 a.m.",
    timestamp: Date.now() - 1800000,
    horaAsignacion: "11:12:46",
    horaActualizacion: "11:36:00 a.m."
  },
  {
    id: "cmd-1792600533663",
    repartidorId: "rep-3",
    repartidorNombre: "Jorge",
    tipoBalon: "Balón LeoGas 45kg Industrial (x2)",
    montoCobro: "350.00",
    metodoPago: "Crédito B2B (15 días)",
    tipoComprobante: "Factura",
    cliente: "Pollería El Tablón",
    direccion: "Av. El Sol 450",
    gpsUrl: "https://www.google.com/maps?q=-13.5180,-71.9760",
    lat: -13.5180,
    lng: -71.9760,
    etapa: 1,
    estado: "en_proceso",
    hora: "11:35 a.m.",
    timestamp: Date.now() - 900000,
    horaAsignacion: "11:35:33",
    horaActualizacion: "11:42:38 a.m."
  }
];

export const INITIAL_VENTAS: VentaRegistro[] = [
  {
    fecha: "Hoy, 10:30 a.m.",
    cliente: "Rosa Quispe",
    productos: "Balón Gas Premium 10kg",
    total: 55,
    pago: "Yape",
    repartidorId: "rep-1",
    repartidorNombre: "Edwin",
    comprobante: "B001-000450"
  },
  {
    fecha: "Hoy, 11:15 a.m.",
    cliente: "Carmen Delgado",
    productos: "Balón LeoGas 10kg Normal",
    total: 50,
    pago: "Efectivo",
    repartidorId: "rep-2",
    repartidorNombre: "Carlos",
    comprobante: "B001-000451"
  },
  {
    fecha: "Hoy, 11:45 a.m.",
    cliente: "Edwin Oblitas",
    productos: "Balón Gas Premium 10kg + Regulador",
    total: 120,
    pago: "Plin",
    repartidorId: "rep-1",
    repartidorNombre: "Edwin",
    comprobante: "B001-000452"
  },
  {
    fecha: "Ayer, 04:20 p.m.",
    cliente: "Chifa Hong Kong",
    productos: "Balón LeoGas 45kg Industrial (x2)",
    total: 340,
    pago: "Crédito B2B",
    repartidorId: "rep-3",
    repartidorNombre: "Jorge",
    comprobante: "F001-000123"
  }
];
