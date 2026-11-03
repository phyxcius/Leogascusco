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

## Ventanas y Archivos Independientes

La aplicación está configurada como una arquitectura multi-página (MPA) con sincronización en tiempo real vía `localStorage` y `StorageEvent`:

1. **`index.html` (Ventana Cliente)**:
   - Acceso para clientes para pedir gas GLP, ver el catálogo, calcular vuelto y seguir su pedido en tiempo real.
2. **`repartidor.html` (Ventana Repartidor)**:
   - Portal móvil para choferes y repartidores en ruta con GPS, cambio de estados ("En camino", "En puerta", "Entregado") y navegación.
3. **`admin.html` (Ventana Administrador)**:
   - Panel de control de 9 módulos para administración, asignación de pedidos, flota, B2B, inventario, liquidación y balance contable.

En la barra de navegación de cada ventana se incluye el menú **"Ventanas ↗"** para abrir cualquiera de los portales en una pestaña o ventana independiente (ideal para operar en múltiples pantallas o desde el teléfono del repartidor).

## Solución para GitHub Pages (Pantalla en Blanco / Error 404)

- **Rutas Relativas (`base: './'`)**: En `vite.config.ts` se estableció `base: './'`, lo cual garantiza que los archivos CSS y JS carguen correctamente sin importar el nombre del repositorio en GitHub (`phyxcius.github.io/Leogas/`).
- **Archivo `404.html` de Respaldo**: Se incluye un `404.html` que redirige de inmediato a `index.html`, `admin.html` o `repartidor.html` según la URL solicitada, evitando pantallas de error de GitHub.
- **Construcción para GitHub Pages**:
  ```bash
  npm run build
  ```
  La carpeta generada `dist/` contiene:
  - `dist/index.html`
  - `dist/admin.html`
  - `dist/repartidor.html`
  - `dist/404.html`
  - `dist/assets/...` (con rutas relativas `./assets/...`)

## Pila Tecnológica
- React 19 + TypeScript
- Vite 6 (Multi-Page MPA + base relativa)
- Tailwind CSS v4
- Leaflet Maps
- Lucide React
- Web Audio API (Chimes de estado y notificación)

