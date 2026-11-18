# Propuesta del proyecto: VendeYa

## 1. Descripción del problema

Muchos emprendedores y pequeños negocios locales en El Salvador utilizan redes sociales y aplicaciones de mensajería para mostrar sus productos y recibir pedidos. Sin embargo, administrar los productos, controlar las existencias y organizar los pedidos mediante estos medios puede resultar desordenado y consumir tiempo.

Además, algunos emprendedores no cuentan con conocimientos técnicos o recursos suficientes para desarrollar su propia tienda en línea.

VendeYa busca ofrecer una plataforma web sencilla y accesible que permita centralizar estas actividades mediante un catálogo público y un panel de administración individual para cada negocio.

## 2. Cliente objetivo

Emprendedores y pequeños negocios locales en El Salvador que necesitan mostrar sus productos, administrar su inventario y recibir pedidos por Internet sin tener que desarrollar o mantener su propia página web.

## 3. Roles del sistema

### Dueño del negocio
- Registrar su negocio y crear una cuenta.
- Iniciar sesión de forma segura.
- Configurar la información de su negocio.
- Administrar sus productos y existencias.
- Consultar y gestionar los pedidos recibidos.
- Visualizar estadísticas generales de su negocio.
- Compartir su catálogo mediante un enlace o código QR.

### Cliente
- Consultar el catálogo público de un negocio.
- Buscar productos y filtrarlos por categoría.
- Agregar productos al carrito.
- Modificar las cantidades del carrito.
- Realizar pedidos sin necesidad de crear una cuenta.

## 4. Funcionalidades obligatorias

1. Registro de negocios y autenticación de propietarios mediante JWT y bcryptjs.
2. Administración del perfil del negocio.
3. Gestión de productos mediante operaciones de creación, consulta, edición y eliminación.
4. Control de inventario y disponibilidad de productos.
5. Catálogo público independiente para cada negocio mediante un slug único.
6. Buscador de productos y filtros por categoría.
7. Carrito de compras interactivo.
8. Checkout express para confirmar pedidos sin registro de clientes.
9. Actualización automática del inventario al confirmar un pedido.
10. Panel de administración para consultar y gestionar pedidos.
11. Dashboard con estadísticas y gráficos.
12. Generación de códigos QR para compartir el catálogo público.

## 5. Funcionalidad estrella

### Checkout express con actualización de inventario

El cliente podrá seleccionar productos, agregarlos al carrito y confirmar un pedido proporcionando sus datos básicos.

Al confirmar el pedido, el sistema verificará la disponibilidad de los productos y sus precios en el servidor. Si existe suficiente inventario, registrará el pedido, sus detalles y descontará las existencias correspondientes en la base de datos.

La operación deberá ejecutarse mediante una transacción para evitar inconsistencias en el inventario.

Si algún producto no tiene existencias suficientes, el pedido no deberá confirmarse y se informará al cliente.

## 6. Mejoras opcionales

Las siguientes mejoras no forman parte de las entregas obligatorias y requieren aprobación antes de desarrollarse:

- Variantes de productos, como tallas, colores y modelos.
- Notificaciones en tiempo real sobre nuevos pedidos.
- Historial avanzado de ventas y reportes.
- Personalización adicional del diseño de cada catálogo.

## 7. Fuera del alcance

- Integración de pasarelas de pago con tarjetas de crédito o débito reales.
- Desarrollo de aplicaciones móviles nativas.
- Sistema de rastreo de envíos.
- Envío automatizado de correos electrónicos.
- Integraciones externas de logística o transporte.

## 8. Plan de entregas

### Entrega 1: Base del sistema
- Preparación de repositorios y estructura del proyecto.
- Diseño y creación de la base de datos.
- Registro de negocios y usuarios.
- Inicio de sesión y autenticación JWT.
- Configuración inicial del perfil del negocio.
- Estructura inicial del frontend y panel protegido.

### Entrega 2: Funcionalidad principal
- Administración de productos.
- Gestión del inventario.
- Catálogo público por negocio.
- Buscador y filtros por categoría.
- Pruebas de aislamiento entre negocios.

### Entrega 3: Funcionalidad estrella
- Carrito de compras.
- Checkout express.
- Registro de pedidos y detalles.
- Descuento automático del inventario mediante transacciones.
- Validación de disponibilidad y cantidades.

### Entrega 4: Publicación y presentación
- Gestión de estados de pedidos.
- Dashboard con estadísticas y gráficos.
- Generación de códigos QR.
- Integración y pruebas generales.
- Preparación de datos de demostración.
- Publicación del sistema y documentación final.
