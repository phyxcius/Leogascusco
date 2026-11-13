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
  googleReviewUrl: "https://www.lachuspaanuncios.com",
  habilitarBoletaDni: true,
  habilitarFacturaRuc: true,
  colorTema: "morado",
  colorPrimario: "#6b21a8",
  colorSecundario: "#f59e0b"
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

export const INITIAL_PEDIDOS: Pedido[] = [];

export const INITIAL_VENTAS: VentaRegistro[] = [];

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

export const INITIAL_COTIZACIONES: CotizacionCRM[] = [];

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

