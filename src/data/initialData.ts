import {
  Producto,
  Accesorio,
  TelefonosConfig,
  NegocioIdentidad,
  Repartidor,
  EmpresaB2B,
  ClienteVIP,
  VentaRegistro,
  Pedido,
  CRMPlantilla,
  CotizacionCRM,
  ClienteFidelidad
} from '../types/index';

export const INITIAL_PRODUCTOS: Producto[] = [
  {
    id: "gas-1",
    nombre: "Balón La Chuspa Tech 10kg Normal o Regular",
    tag: "El Moradito Rendidor",
    descripcion: "Balón sellado de 10kg con precinto de seguridad garantizado y peso exacto.",
    precio: 50,
    disponible: true,
    imagen: "/1791513590376.jpg"
  },
  {
    id: "gas-2",
    nombre: "Balón Gas Premium 10kg La Chuspa Tech",
    tag: "Máximo Rendimiento",
    descripcion: "GLP de alta pureza con válvula premium anti-fugas y máxima durabilidad.",
    precio: 55,
    disponible: true,
    imagen: "/1791513590376.jpg"
  },
  {
    id: "gas-3",
    nombre: "Balón La Chuspa Tech 45kg Industrial",
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
  whatsapp: "969773064",
  tel1: "969773064",
  tel2: "969773064",
  tel3: "969773064"
};

export const INITIAL_NEGOCIO: NegocioIdentidad = {
  nombre: "La Chuspa Tech",
  slogan: "Publicidad, Tecnología & Balones de Gas en Cusco",
  logoUrl: "/CHUSPITA-circulo.png",
  imagenPresentacion: "/1791513590376.jpg",
  whatsapp: "969773064",
  telPrincipal: "969773064",
  telSecundario: "969773064",
  telFijo: "969773064",
  direccion: "Cusco - Perú",
  enlaceChuspa: "https://www.lachuspaanuncios.com",
  igvPorcentaje: 18,
  facebookUrl: "https://facebook.com/lachuspaanuncios",
  instagramUrl: "https://instagram.com/lachuspaanuncios",
  tiktokUrl: "https://tiktok.com/@lachuspaanuncios",
  googleReviewUrl: "https://www.lachuspaanuncios.com"
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
    notas: "Cliente preferencial La Chuspa Tech."
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
    tipoBalon: "Balón La Chuspa Tech 10kg Normal",
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
    tipoBalon: "Balón La Chuspa Tech 45kg Industrial (x2)",
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
    comprobante: "B001-000450",
    documento: "23984512",
    tipoDoc: "DNI",
    direccion: "Urb. Magisterio 1ra Etapa",
    subtotal: 46.61,
    igv: 8.39,
    sunatEstado: "ACEPTADO"
  },
  {
    fecha: "Hoy, 11:15 a.m.",
    cliente: "Carmen Delgado",
    productos: "Balón La Chuspa Tech 10kg Normal",
    total: 50,
    pago: "Efectivo",
    repartidorId: "rep-2",
    repartidorNombre: "Carlos",
    comprobante: "B001-000451",
    documento: "45127890",
    tipoDoc: "DNI",
    direccion: "Av. De la Cultura 720",
    subtotal: 42.37,
    igv: 7.63,
    sunatEstado: "ACEPTADO"
  },
  {
    fecha: "Hoy, 11:45 a.m.",
    cliente: "Edwin Oblitas",
    productos: "Balón Gas Premium 10kg + Regulador",
    total: 120,
    pago: "Plin",
    repartidorId: "rep-1",
    repartidorNombre: "Edwin",
    comprobante: "B001-000452",
    documento: "23891045",
    tipoDoc: "DNI",
    direccion: "Calle Garcilaso 210",
    subtotal: 101.69,
    igv: 18.31,
    sunatEstado: "ACEPTADO"
  },
  {
    fecha: "Ayer, 04:20 p.m.",
    cliente: "Chifa Hong Kong",
    productos: "Balón La Chuspa Tech 45kg Industrial (x2)",
    total: 340,
    pago: "Crédito B2B",
    repartidorId: "rep-3",
    repartidorNombre: "Jorge",
    comprobante: "F001-000123",
    documento: "20509876543",
    tipoDoc: "RUC",
    direccion: "Calle Maruri 220",
    subtotal: 288.14,
    igv: 51.86,
    sunatEstado: "ACEPTADO"
  }
];

export const INITIAL_CRM_PLANTILLAS: CRMPlantilla[] = [
  // 1. MARKETING (cupones, lanzamientos, recordatorios)
  {
    id: "crm-mkt-1",
    categoria: "MARKETING",
    subtipo: "cupones",
    titulo: "Cupón Descuento Recarga de Gas S/ 3.00",
    descripcion: "Envía cupón promocional a clientes del mes para incentivar su recompra.",
    icono: "📢",
    plantillaTexto: "¡Hola {cliente}! 🦁 En La Chuspa Tech premiamos tu fidelidad. Presenta este mensaje y obtén S/ 3.00 de descuento en tu próximo balón de gas con delivery express gratis a tu puerta. Válido hasta fin de mes. Pídelo al 969773064 o WhatsApp."
  },
  {
    id: "crm-mkt-2",
    categoria: "MARKETING",
    subtipo: "lanzamientos",
    titulo: "Lanzamiento Balón Premium Alto Rendimiento",
    descripcion: "Notifica sobre nuevos balones con válvula ultra-sellada y mayor pureza GLP.",
    icono: "🔥",
    plantillaTexto: "¡Novedad para tu cocina, {cliente}! 🔥 Llegó el nuevo Balón La Chuspa Tech Premium de máxima llama azul y duración prolongada. Olvídate del hollín y ahorra hasta 15% más de gas. ¡Pídelo hoy y te lo llevamos en 15 minutos en Cusco!"
  },
  {
    id: "crm-mkt-3",
    categoria: "MARKETING",
    subtipo: "recordatorios",
    titulo: "Recordatorio Recurrente de Recarga (25 a 30 Días)",
    descripcion: "Aviso preventivo para que el hogar o restaurante no se quede sin gas.",
    icono: "⏰",
    plantillaTexto: "Estimado(a) {cliente}, hace aproximadamente 25 días que llevamos tu último balón de gas. 🦁 Para que nunca te falte gas en casa a la hora de cocinar, ¿deseas que te programemos una recarga preventiva hoy? Responde 'SÍ' al 969773064 y un repartidor saldrá a tu domicilio."
  },

  // 2. UTILIDAD (actualización, confirmación, recordatorios de pago)
  {
    id: "crm-ut-1",
    categoria: "UTILIDAD",
    subtipo: "actualización",
    titulo: "Actualización de Estado de Entrega en Ruta",
    descripcion: "Informar al cliente que la unidad motorizada ya partió con su balón.",
    icono: "🛵",
    plantillaTexto: "¡Hola {cliente}! Tu pedido #{pedidoId} ya fue asignado al repartidor {repartidor}. Se encuentra en camino hacia {direccion}. Puedes rastrearlo en vivo en nuestro portal web o esperar nuestro aviso en puerta."
  },
  {
    id: "crm-ut-2",
    categoria: "UTILIDAD",
    subtipo: "confirmación",
    titulo: "Confirmación de Pedido Recibido y Registrado",
    descripcion: "Confirmación inmediata de recepción de pedido para mayor tranquilidad.",
    icono: "✅",
    plantillaTexto: "¡Pedido confirmado! {cliente}, hemos registrado tu solicitud de {producto} por S/ {monto}. Forma de pago seleccionada: {pago}. Nuestro despacho en Cusco ya prepara tu balón sellado."
  },
  {
    id: "crm-ut-3",
    categoria: "UTILIDAD",
    subtipo: "recordatorios de pago",
    titulo: "Recordatorio de Pago de Crédito B2B",
    descripcion: "Aviso cordial sobre fecha de vencimiento de facturas a cuenta 15/30 días.",
    icono: "💳",
    plantillaTexto: "Estimados amigos de {empresa}, un saludo cordial de La Chuspa Tech. Les recordamos que la Factura {factura} por el monto de S/ {monto} vence el próximo {fechaVencimiento}. Agradecemos coordinar la transferencia vía BCP / Interbank o al 969773064."
  },

  // 3. AUTENTICACIÓN (OTP, verificaciones)
  {
    id: "crm-auth-1",
    categoria: "AUTENTICACION",
    subtipo: "OTP",
    titulo: "Código OTP de Seguridad para Pedido Web",
    descripcion: "Código temporal para validar el número de teléfono del cliente.",
    icono: "📱",
    plantillaTexto: "La Chuspa Tech: Tu código de verificación de seguridad es: {otp}. No compartas este código con nadie. Validez de 5 minutos."
  },
  {
    id: "crm-auth-2",
    categoria: "AUTENTICACION",
    subtipo: "verificaciones",
    titulo: "Verificación de Dirección y Ubicación GPS",
    descripcion: "Confirmación del punto exacto de entrega para el chofer.",
    icono: "📍",
    plantillaTexto: "¡Hola {cliente}! Para que nuestro chofer llegue con exactitud a {direccion}, por favor envíanos tu ubicación actual por WhatsApp tocando el ícono de clip > Ubicación en tiempo real. ¡Muchas gracias!"
  },

  // 4. SERVICIO (gratis durante 72hrs, garantía fugas)
  {
    id: "crm-serv-1",
    categoria: "SERVICIO",
    subtipo: "gratis durante 72hrs",
    titulo: "Revisión Técnica de Fugas GRATIS (72 Horas)",
    descripcion: "Inspección gratuita de válvula, manguera y seguridad tras la instalación.",
    icono: "🛡️",
    plantillaTexto: "Estimado(a) {cliente}, en La Chuspa Tech tu seguridad es primero. Recuerda que tu compra incluye REVISIÓN TÉCNICA DE FUGAS GRATIS durante las primeras 72 horas. Si notas olor a gas o llama amarilla, escríbenos de inmediato al 969773064 y un técnico acudirá sin costo alguno."
  },
  {
    id: "crm-serv-2",
    categoria: "SERVICIO",
    subtipo: "garantía",
    titulo: "Certificado de Garantía de Peso Exacto y Precinto",
    descripcion: "Garantía de calidad de La Chuspa Tech en Cusco.",
    icono: "🦁",
    plantillaTexto: "🦁 La Chuspa Tech Garantizado: Tu balón cuenta con precinto de seguridad intacto y prueba hidráulica vigente. Cualquier consulta de instalación de regulador premium, estamos a tu servicio al 969773064."
  }
];

export const INITIAL_COTIZACIONES: CotizacionCRM[] = [
  {
    id: "cot-101",
    codigo: "COT-2026-001",
    cliente: "Pollería El Tablón Cusco",
    tipoDoc: "RUC",
    numDoc: "20601234567",
    telefono: "984 112 233",
    direccion: "Av. El Sol 450, Wanchaq",
    fechaEmision: "2026-11-03",
    fechaProgramada: "2026-11-05",
    horaProgramada: "09:00 a.m.",
    items: [
      { descripcion: "Balón Industrial 45kg GLP", cantidad: 4, precioUnitario: 175.0, total: 700.0 },
      { descripcion: "Regulador de Presión Industrial Alta", cantidad: 1, precioUnitario: 65.0, total: 65.0 }
    ],
    subtotal: 648.31,
    igv: 116.69,
    total: 765.0,
    estado: "programado",
    repartidorAsignado: "Jorge",
    notas: "Entrega a primera hora antes de encender hornos."
  },
  {
    id: "cot-102",
    codigo: "COT-2026-002",
    cliente: "Chifa Hong Kong Imperial",
    tipoDoc: "RUC",
    numDoc: "20509876543",
    telefono: "984 334 455",
    direccion: "Calle Maruri 220, Cusco",
    fechaEmision: "2026-11-02",
    fechaProgramada: "2026-11-06",
    horaProgramada: "10:30 a.m.",
    items: [
      { descripcion: "Balón Industrial 45kg GLP", cantidad: 3, precioUnitario: 170.0, total: 510.0 }
    ],
    subtotal: 432.20,
    igv: 77.80,
    total: 510.0,
    estado: "aprobado",
    repartidorAsignado: "Carlos",
    notas: "Crédito a 30 días según convenio B2B."
  },
  {
    id: "cot-103",
    codigo: "COT-2026-003",
    cliente: "Condominio Huancaro Residencial",
    tipoDoc: "DNI",
    numDoc: "45892110",
    telefono: "950 889 123",
    direccion: "Urb. Huancaro Mz D Lote 12",
    fechaEmision: "2026-11-03",
    fechaProgramada: "2026-11-04",
    horaProgramada: "03:00 p.m.",
    items: [
      { descripcion: "Balón La Chuspa Tech 10kg Normal", cantidad: 6, precioUnitario: 50.0, total: 300.0 },
      { descripcion: "Válvula Premium Anti-Fugas", cantidad: 2, precioUnitario: 35.0, total: 70.0 }
    ],
    subtotal: 313.56,
    igv: 56.44,
    total: 370.0,
    estado: "cotizado",
    notas: "Vecinos agrupados para compra comunitaria con descuento."
  }
];

export const INITIAL_CLUB_FIDELIDAD: ClienteFidelidad[] = [
  {
    id: "fid-1",
    dni: "23891045",
    nombre: "Edwin Oblitas Ubalde",
    telefono: "969773064",
    sellos: 9, // 9 de 10 sellos, ¡a 1 del regalito!
    totalConsumos: 19,
    premiosCanjeados: 1,
    ultimoConsumo: "Hoy, 11:45 a.m.",
    historial: [
      { fecha: "Hoy, 11:45 a.m.", detalle: "Balón Gas Premium 10kg", sellosSumados: 1 },
      { fecha: "Ayer, 04:30 p.m.", detalle: "Balón La Chuspa Tech 10kg", sellosSumados: 1 }
    ]
  },
  {
    id: "fid-2",
    dni: "45127890",
    nombre: "Carmen Luz Delgado",
    telefono: "950 123 987",
    sellos: 7, // 7 de 10
    totalConsumos: 7,
    premiosCanjeados: 0,
    ultimoConsumo: "Hoy, 11:15 a.m.",
    historial: [
      { fecha: "Hoy, 11:15 a.m.", detalle: "Balón La Chuspa Tech 10kg Normal", sellosSumados: 1 }
    ]
  },
  {
    id: "fid-3",
    dni: "23984512",
    nombre: "Rosa Quispe Huamán",
    telefono: "984 765 432",
    sellos: 10, // ¡Completó 10 sellos! Listo para canjear regalito
    totalConsumos: 20,
    premiosCanjeados: 1,
    ultimoConsumo: "Hoy, 09:30 a.m.",
    historial: [
      { fecha: "Hoy, 09:30 a.m.", detalle: "Balón Gas Premium 10kg", sellosSumados: 1 }
    ]
  },
  {
    id: "fid-4",
    dni: "41982345",
    nombre: "Juan Carlos Mendoza",
    telefono: "984 112 233",
    sellos: 3,
    totalConsumos: 3,
    premiosCanjeados: 0,
    ultimoConsumo: "Ayer, 02:15 p.m.",
    historial: [
      { fecha: "Ayer, 02:15 p.m.", detalle: "Balón La Chuspa Tech 10kg", sellosSumados: 1 }
    ]
  }
];

