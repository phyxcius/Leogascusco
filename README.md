# LeoGas Cusco - Aplicación Web React & Vite

Sistema integral de venta y distribución de balones de gas GLP a domicilio y para empresas B2B en Cusco, con seguimiento satelital de flota por GPS y panel administrativo.

## Características Portadas

1. **Portal del Cliente**:
   - Catálogo de balones de gas (10kg Regular, 10kg Premium, 45kg Industrial) y accesorios (válvulas, mangueras, reguladores).
   - Mapa interactivo de Cusco (Leaflet) con marcadores animados de repartidores en tiempo real, leyenda en línea/fuera de ruta y centrado en ubicación del cliente.
   - Carrito de compras con selector de método de pago (Efectivo con cálculo automático de vuelto y billetes rápidos, Yape, Plin, Tarjeta).
   - Validación y consulta de DNI (RENIEC) y RUC (SUNAT) para Boletas y Facturas.
   - Enlace directo con WhatsApp y registro de pedidos en el sistema.
   - Barra superior fija de seguimiento en vivo con etapas (1: En camino, 2: En puerta, 3: Entregado) y alertas sonoras Web Audio.
   - Modal de comprobante térmico oficial (Boleta / Factura Electrónica) con opciones para imprimir y compartir.
   - Portal corporativo B2B para pollerías, chifas, restaurantes y hoteles con precios mayoristas y condiciones de crédito.

2. **Panel del Repartidor**:
   - Acceso con credenciales para conductores de la flota (Edwin, Carlos, Jorge).
   - Vista móvil con pestañas tipo inDriver:
     - **Mis Solicitudes**: Lista de pedidos asignados con dirección y detalles de cobro.
     - **Mapa en Ruta**: Itinerario origen (Calle Garcilaso) -> destino, botón de navegación GPS directa (Google Maps / Waze) y botón de secuencia para avanzar etapas (En camino -> En puerta -> Completado).

3. **Panel Administrador**:
   - Acceso seguro para administración.
   - **Pedidos y Flota**: Registro de pedidos telefónicos, asignación rápida a choferes, monitoreo de etapas y mapa satelital.
   - **Cartera B2B / Empresas**: Gestión de clientes corporativos con tarifa de 45kg y términos de pago (15 días, 30 días, contado).
   - **Cierre de Caja & Créditos**: Liquidación diaria por repartidor (efectivo físico, digital Yape/Plin, créditos) e impresión de planilla.
   - **Clientes VIP**: Gestión de clientes frecuentes y notas de entrega.
   - **Válvulas y Balones**: Administración de catálogo y precios.
   - **Teléfonos**: Configuración de números de contacto y WhatsApp.
   - **Repartidores**: Gestión de choferes, estado en línea y contraseñas.
   - **Reporte Contable**: Filtros temporales, métricas, búsqueda y exportación a CSV.

## Pila Tecnológica
- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Leaflet Maps
- Lucide React
