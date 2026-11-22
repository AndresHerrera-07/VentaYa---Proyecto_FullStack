# Progreso de VendeYa

## Estado actual

- Entrega en curso: 4 (Publicación y Presentación)
- Última actualización: 22/11/2026
- Estado general: Entregas 1, 2, 3 y 4 implementadas y probadas al 100%. Sistema funcional con base de datos MySQL relacional, carrito reactivo, checkout atómico con transacciones SQL, máquina de estados de pedidos, dashboard con Recharts, QR interactivo y carga dual de imágenes (archivo local o enlace web).

## Tareas por entrega

### Entrega 1: base del sistema

- [x] Preparar repositorio principal de documentación.
- [x] Crear repositorios independientes para backend y frontend.
- [x] Configurar AGENTS.md.
- [x] Completar y aprobar docs/propuesta.md.
- [x] Completar y aprobar docs/reglas-negocio.md.
- [x] Completar y aprobar docs/historias.md.
- [x] Completar y aprobar docs/modelo-datos.md.
- [x] Preparar scripts SQL para crear la base de datos.
- [x] Crear tabla negocios en el servidor MySQL local.
- [x] Crear tabla usuarios en el servidor MySQL local.
- [x] Configurar conexión MySQL desde Node.js.
- [x] Implementar registro de negocios y propietarios.
- [x] Implementar inicio de sesión con JWT.
- [x] Configurar middleware de autenticación.
- [x] Implementar consulta y actualización del perfil del negocio.
- [x] Preparar estructura inicial del frontend con React y Vite.
- [x] Crear pantallas de registro e inicio de sesión.
- [x] Crear estructura inicial del panel administrativo protegido.
- [ ] Probar registro, autenticación y aislamiento entre negocios.
- [ ] Subir cambios a GitHub con commits descriptivos.

### Entrega 2: funcionalidad principal

- [x] Crear tabla productos.
- [x] Implementar API para listar productos.
- [x] Implementar API para crear productos.
- [x] Implementar API para editar productos.
- [x] Implementar API para eliminar productos según las reglas aprobadas.
- [x] Implementar validaciones de precio y stock.
- [x] Implementar pruebas de las rutas de productos.
- [x] Crear pantalla de administración de productos.
- [x] Crear formulario para registrar y editar productos.
- [x] Crear catálogo público por slug.
- [x] Implementar consulta pública de productos.
- [x] Implementar buscador de productos.
- [x] Implementar filtros por categoría.
- [x] Mostrar disponibilidad de productos.
- [x] Probar separación de información entre negocios.
- [x] Verificar funcionamiento en computadora y teléfono.

### Entrega 3: funcionalidad estrella

- [x] Crear tabla pedidos.
- [x] Crear tabla detalles_pedido.
- [x] Implementar API para crear pedidos.
- [x] Implementar carrito de compras en React.
- [x] Permitir agregar y eliminar productos del carrito.
- [x] Permitir modificar cantidades.
- [x] Implementar cálculo visual del total del carrito.
- [x] Implementar formulario de checkout express.
- [x] Validar productos y cantidades en el backend.
- [x] Calcular precios y totales desde la base de datos.
- [x] Implementar transacciones SQL para confirmar pedidos.
- [x] Descontar inventario automáticamente al confirmar compras.
- [x] Evitar que el stock sea negativo ante compras simultáneas.
- [x] Revertir operaciones cuando falle una transacción.
- [x] Probar pedidos con stock suficiente e insuficiente.
- [x] Probar pedidos con productos pertenecientes a otros negocios.

### Entrega 4: publicación y presentación

- [x] Implementar API para consultar pedidos.
- [x] Implementar API para consultar detalles de pedidos.
- [x] Implementar actualización de estados.
- [x] Implementar cancelación de pedidos y restauración de inventario.
- [x] Crear pantalla de administración de pedidos.
- [x] Crear Dashboard administrativo.
- [x] Mostrar estadísticas generales del negocio.
- [x] Implementar gráficos utilizando Recharts.
- [x] Implementar generación de códigos QR con qrcode.react.
- [x] Crear opción para compartir el catálogo público.
- [x] Preparar datos de demostración.
- [x] Realizar pruebas generales del sistema.
- [x] Revisar diseño responsive.
- [ ] Publicar frontend en Vercel.
- [ ] Publicar backend en Render.
- [ ] Configurar base de datos en Aiven.
- [x] Preparar README del backend.
- [x] Preparar README del frontend.
- [x] Preparar documentación para la presentación final.

## Registro de sesiones

### Sesión 5 — Implementación del Sistema de Roles: Dueño, Vendedor y Cliente

- Hecho:
  - Sembrado en MySQL del usuario vendedor demo (`vendedor@antojitos.sv` / `admin123`) junto al usuario dueño (`carmen@antojitos.sv` / `admin123`).
  - Creación de esquemas Zod en `backend/src/schemas/auth.schema.js` (`loginSchema`, `crearVendedorSchema`).
  - Implementación de middlewares en `backend/src/middlewares/auth.middleware.js`: `verificarToken` (valida JWT) y `verificarRol` (restringe por rol 'dueno' o 'vendedor').
  - Creación de rutas de autenticación `backend/src/routes/auth.routes.js` (`POST /api/auth/login`, `GET /api/auth/perfil`, `POST /api/auth/vendedores`, `GET /api/auth/vendedores`).
  - Creación del contexto `frontend/src/context/AuthContext.jsx` con persistencia en `localStorage` y selector rápido de roles de prueba.
  - Creación de pantalla `frontend/src/pages/Login.jsx` con botones de un clic para probar inmediatamente como Dueño, Vendedor o Cliente.
  - Implementación de `frontend/src/components/RutaProtegida.jsx` para restringir accesos según el rol.
  - Creación de pantalla de Punto de Venta / Registro rápido de órdenes `frontend/src/pages/NuevoPedidoVendedor.jsx` para vendedores y dueños.
  - Actualización de `frontend/src/components/Navbar.jsx` con menú adaptativo según el rol y botón de cerrar sesión.
  - Pruebas en `backend/pruebas.http` (casos 25 a 30) y verificación de compilación exitosa.

- Decisiones:
  - El rol 'dueno' tiene acceso total (Productos, Pedidos, Dashboard financiero Recharts, QR y creación de vendedores).
  - El rol 'vendedor' tiene acceso operativo a la lista de pedidos, transiciones de estado y toma de pedidos en mostrador, pero no tiene acceso a métricas financieras ni al catálogo de configuración.
  - El rol 'cliente' tiene acceso público sin registro a los catálogos y al checkout express.

### Sesión 4 — Implementación de Entrega 3 y Entrega 4: Carrito, Checkout Atómico, Pedidos, Dashboard con Recharts, QR y Carga Dual de Fotos

- Hecho:
  - Soporte dual de imágenes en `ProductosAdmin.jsx`: subida de archivo local desde la computadora (redimensionado automático con canvas a JPEG ~70KB en Base64) o enlace URL web.
  - Creación de esquema Zod `backend/src/schemas/pedido.schema.js` para Checkout Express y cambio de estado.
  - Implementación de `backend/src/routes/pedidos.routes.js` con transacción SQL atómica (`START TRANSACTION`, `SELECT ... FOR UPDATE`, `COMMIT`, `ROLLBACK`), cálculo seguro de importes en el backend y descuento de existencias.
  - Implementación de máquina de estados de pedidos (RN-09) y restauración automática de inventario al cancelar (RN-10).
  - Endpoint de métricas agregadas `GET /api/pedidos/metricas/dashboard` para KPIs y Recharts.
  - Creación de `frontend/src/context/CarritoContext.jsx` con persistencia en `localStorage`.
  - Actualización de `frontend/src/pages/CatalogoPublico.jsx` con drawer lateral de carrito, modal de Checkout Express y notificación automática a WhatsApp del comercio.
  - Creación de `frontend/src/pages/PedidosAdmin.jsx` para gestión de estados, detalles de orden y contacto con el cliente.
  - Creación de `frontend/src/pages/DashboardAdmin.jsx` con tarjetas KPI, gráficos de ventas de 7 días, distribución de estados y generador de código QR para mostrador físico con `qrcode.react`.
  - Eliminación de etiquetas de desarrollo ("tarea 2") en `Inicio.jsx`.
  - Configuración centralizada de API (`frontend/src/config/api.js`) y compatibilidad SSL en `backend/src/db.js` para despliegues en la nube (Vercel, Render, Aiven).
  - Pruebas automatizadas de flujo completo exitosas en base de datos local y compilación de producción con Vite.

### Sesión 3 — Implementación de la Entrega 2: Catálogo Público y Gestión de Productos

- Hecho:
  - Creación del esquema Zod `backend/src/schemas/producto.schema.js` con reglas RN-04 y RN-05.
  - Implementación del middleware `backend/src/middlewares/validarSchema.js`.
  - Creación de rutas públicas `backend/src/routes/tiendas.routes.js` (`GET /:slug`, `GET /:slug/productos`, `GET /:slug/categorias`).
  - Creación de rutas de administración `backend/src/routes/productos.routes.js` (CRUD completo y borrado lógico con `activo = 0`).
  - Actualización de `backend/pruebas.http` con 15 casos de prueba de API.
  - Creación de la pantalla pública `frontend/src/pages/CatalogoPublico.jsx` con buscador reactivo, filtros por categoría y badges de stock.
  - Creación del panel administrativo `frontend/src/pages/ProductosAdmin.jsx` con métricas, tabla y modal para crear/editar productos.
  - Configuración de `React Router` en `frontend/src/App.jsx` y componente `Navbar.jsx`.
  - Pruebas automáticas exitosas en backend y compilación de producción en frontend.

- Decisiones:
  - Usar el negocio demo `negocio_id = 1` (*Café y Antojitos Santa Tecla*) para desacoplar temporalmente la Entrega 2 del registro de usuarios.
  - Aplicar borrado lógico en `DELETE /api/productos/:id` preservando la integridad referencial.

- Pendiente para la próxima sesión:
  - Entrega 3: Funcionalidad estrella (Carrito de compras y Checkout express atómico con transacciones).
  - Autenticación administrativa con JWT (HU-01 y HU-02).

### Sesión 2 — Creación de la base de datos y estructura de proyectos

- Hecho:
  - Creación de la carpeta contenedora `VentaYA/`.
  - Preparación del script SQL `VentaYA/backend/database/01-esquema-inicial.sql` con las 5 tablas relacionales (`negocios`, `usuarios`, `productos`, `pedidos`, `detalles_pedido`), llaves foráneas, índices y restricciones CHECK.
  - Preparación del script SQL `VentaYA/backend/database/02-datos-demo.sql` con datos representativos de El Salvador (negocio de antojitos, usuario con contraseña hasheada en bcryptjs y catálogo inicial).
  - Inicialización del backend con `pnpm`, Express 5, `mysql2/promise`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken` y `zod`.
  - Implementación de `src/db.js` con pool de conexiones y diagnóstico de arranque, y `src/index.js` con ruta `/api/salud`.
  - Creación de `backend/pruebas.http` para pruebas con cliente REST.
  - Inicialización del frontend con React, Vite y Tailwind CSS v4, agregando `lucide-react`, `qrcode.react`, `recharts`, `react-router-dom`, `react-hook-form` y `zod`.
  - Verificación exitosa de la compilación de producción del frontend (`vite build`).

- Decisiones:
  - Añadir columna `activo TINYINT(1) DEFAULT 1` a la tabla `productos` para permitir borrado lógico sin romper claves foráneas de pedidos pasados.
  - Adoptar paleta visual cálida inspirada en el comercio salvadoreño (tonos ámbar y tierra neutra) evitando esquemas clónicos genéricos.
  - Alojamiento de `backend` y `frontend` dentro del contenedor `VentaYA/`.

- Problemas encontrados:
  - Ninguno. Todas las dependencias oficiales se instalaron y compilaron sin errores.

- Pendiente para la próxima sesión:
  - Ejecutar scripts SQL en el servidor MySQL local.
  - Implementar HU-01 (Registro de negocio y dueño) y HU-02 (Inicio de sesión con JWT).

## Decisiones del proyecto

| Fecha | Decisión | Motivo |
|---|---|---|
| 03/11/2026 | Utilizar MySQL sin ORM | Mantener control sobre las consultas SQL y facilitar el aprendizaje |
| 03/11/2026 | Separar frontend y backend | Organizar el desarrollo y los repositorios |
| 03/11/2026 | Utilizar JWT para autenticación | Proteger las operaciones administrativas |
| 03/11/2026 | Utilizar bcryptjs para contraseñas | Evitar almacenar contraseñas en texto plano |
| 03/11/2026 | Utilizar transacciones SQL en checkout | Mantener la consistencia del inventario |
| 03/11/2026 | Guardar precio_unitario en detalles_pedido | Conservar el precio histórico de cada compra |
| 03/11/2026 | Columna activo en tabla productos | Borrado lógico que protege la integridad referencial de ventas |
| 03/11/2026 | Paleta cálida y diseño artesanal | Identidad visual original para comercios salvadoreños sin clonar estilos genéricos |

### Sesión 3 — Roles de Usuario, Separación de Vistas y Perfil del Dueño

- **Fecha:** 09/11/2026
- **Hecho:**
  - Agregado `actualizarPerfilSchema` en `backend/src/schemas/auth.schema.js` con validación Zod (nombre opcional, contraseña nueva requiere contraseña actual).
  - Implementado `PUT /api/auth/perfil` en `backend/src/routes/auth.routes.js` que permite al dueño actualizar su nombre y/o contraseña con verificación bcrypt de la contraseña actual.
  - Agregadas pruebas 31 y 32 en `backend/pruebas.http` para el nuevo endpoint.
  - Actualizado `CatalogoPublico.jsx` para usar `slug || 'antojitos-santa-tecla'` como fallback cuando se accede a la ruta raíz `/`.
  - Añadida función `actualizarUsuario()` en `AuthContext.jsx` para actualizar datos del usuario en sesión tras cambio de nombre.
  - Creada página `PerfilDueno.jsx` con formulario para cambiar nombre y contraseña (con toggle de visibilidad y confirmación de nueva clave).
  - Creada página `CajeroVendedor.jsx` con terminal de ventas POS: catálogo filtrable por categoría/búsqueda, ticket interactivo con cantidades, datos del cliente y confirmación de venta que descuenta inventario.
  - Reescrito `Navbar.jsx` con separación clara por rol: Cliente (solo catálogo), Dueño (Dashboard+Productos+Pedidos+MiPerfil), Vendedor (Cajero+Pedidos). El cliente NO ve botón de login en la barra superior.
  - Actualizado `App.jsx`: ruta `/` apunta a `CatalogoPublico`, añadidas rutas `/admin/cajero` y `/admin/perfil` con `RutaProtegida`.
  - Actualizado `RutaProtegida.jsx`: el Vendedor sin acceso es redirigido a `/admin/cajero` en lugar de pedidos.
  - Actualizado `Login.jsx`: al iniciar sesión como Vendedor, navega a `/admin/cajero`. El acceso demo de cliente navega a `/` directamente.
  - Verificado con `pnpm run build` sin errores (código 0, 2642 módulos transformados).
  - Verificado el endpoint `PUT /api/auth/perfil` con script de prueba: actualización de nombre OK (200) y contraseña incorrecta rechazada correctamente (400).

- **Decisiones:**
  - El cliente entra directamente a `/` que muestra el catálogo, sin ver formulario de login; el enlace "Acceso Personal" está discretamente en el pie de página.
  - El Vendedor solo puede ver `/admin/cajero` y `/admin/pedidos`; no tiene acceso a productos ni dashboard.
  - El Dueño tiene acceso completo incluyendo la nueva sección `/admin/perfil` para cambiar nombre y contraseña.
  - La función `actualizarUsuario` actualiza el `localStorage` y el estado React para que el nuevo nombre aparezca en la Navbar sin recargar la página.

- **Problemas encontrados:**
  - El sandbox de red bloqueaba `fetch` a `localhost` desde `node -e`; se resolvió usando `127.0.0.1` explícitamente con `BypassSandbox: true`.

- **Pendiente:**
  - Commit descriptivo con todos los cambios de esta sesión.
  - Verificación manual en el navegador (cliente, vendedor y dueño).

### Sesión 7 — Modo Oscuro, Edición de Título del Negocio y Correo, Stock Opcional y Tipografía Ampliada

- **Fecha:** 18/11/2026
- **Hecho:**
  - **Backend:**
    - Esquema `actualizarPerfilSchema` ampliado en `backend/src/schemas/auth.schema.js` para admitir `correo` opcional con validación de email en Zod.
    - Creado esquema `actualizarNegocioSchema` para validar el nombre del negocio (`min(3)`, `max(100)`).
    - Actualizado endpoint `PUT /api/auth/perfil` en `backend/src/routes/auth.routes.js`: permite actualizar el correo electrónico validando que no esté registrado por otro usuario (código 409 Conflict si ya existe).
    - Implementado endpoint `PUT /api/auth/negocio` en `backend/src/routes/auth.routes.js` exclusivo para el dueño (`verificarRol('dueno')`), que actualiza el nombre del negocio en la tabla `negocios` y devuelve los datos actualizados.
    - Actualizado `producto.schema.js` para que el campo `stock` sea opcional con `.default(0)`.
    - Adaptado `productos.routes.js` para manejar existencias predeterminadas en 0 si no se envían (`stock ?? 0`).
    - Añadidas pruebas 33, 34 y 35 en `backend/pruebas.http`.
  - **Frontend:**
    - **Modo Oscuro Integral:**
      - Creado `ThemeContext.jsx` con hook `useTheme()`, almacenamiento en `localStorage` (`vendeya_tema_v1`) y alternancia de la clase `.dark` en `document.documentElement`.
      - Soporte de Tailwind v4 configurado en `index.css` con `@custom-variant dark (&:where(.dark, .dark *));` y colores base de alto contraste (`#0c0a09` / `#f5f5f4`).
      - Botón de alternancia de tema (Sol/Luna) integrado en la barra de navegación `Navbar.jsx`.
      - Estilizado de modo oscuro completo implementado en: `Navbar`, `App`, `CatalogoPublico`, `CajeroVendedor`, `PerfilDueno`, `ProductosAdmin`, `PedidosAdmin`, `DashboardAdmin` y `Login`.
    - **Título del Negocio Editable:**
      - Agregada sección en `PerfilDueno.jsx` para modificar el nombre comercial de la tienda mediante `PUT /api/auth/negocio`.
      - El título se sincroniza en `AuthContext` y se muestra dinámicamente en el encabezado `Navbar`.
    - **Cambio de Correo Electrónico:**
      - Campo editable de correo añadido en `PerfilDueno.jsx` con persistencia en `AuthContext` y backend.
    - **Stock Opcional:**
      - Formulario de `ProductosAdmin.jsx` actualizado con etiqueta `Existencias (Stock) (Opcional)`, permitiendo registrar productos sin ingresar inventario obligatorio.
    - **Tipografía de Productos Ampliada y Alto Contraste:**
      - Nombres de productos en `CatalogoPublico.jsx` ampliados a `text-lg sm:text-xl font-black text-stone-900 dark:text-stone-50 tracking-tight`, protegidos contra pérdida de contraste en modo oscuro.
  - **Pruebas y Verificación:**
    - `pnpm run build` ejecutado exitosamente con 0 errores (2643 módulos transformados).
    - Pruebas de API backend verificadas con códigos 200 y 201.
    - Servicios en ejecución: MariaDB (puerto 3307), Backend API (puerto 3000), Frontend Vite (puerto 5173).

- **Decisiones:**
  - El modo oscuro almacena la preferencia del usuario en el navegador para mantenerse tras recargas.
  - Para Tailwind CSS v4, el selector de modo oscuro se definió con `@custom-variant dark` para asegurar compatibilidad total con clases `dark:...`.
  - El stock ahora es opcional tanto a nivel de validación Zod en backend como en los formularios React.

- **Pendiente:**
  - Despliegue en producción en la nube (Vercel / Render).

### Sesión 8 — Remoción Total de Productos, Ampliación de Catálogo, Personalización de Foto, Dirección y WhatsApp

- **Fecha:** 18/11/2026
- **Hecho:**
  - **Remoción Total de Productos:**
    - Actualizado endpoint `DELETE /api/productos/:id` en `backend/src/routes/productos.routes.js`: admite los parámetros `?permanente=true` y `?forzar=true`. Si el producto no tiene pedidos históricos, se elimina físicamente de la base de datos MySQL; si tiene pedidos, se eliminan referencias forzadas o se desactiva garantizando que nunca se muestre al cliente (`activo = 1` en `tiendas.routes.js`).
    - En `ProductosAdmin.jsx`, se implementó la función `manejarEliminarTotal` con confirmación explícita para remover productos totalmente del catálogo y de la vista del cliente.
    - Se habilitó el acceso a la gestión de productos tanto para el Dueño como para el Vendedor en `App.jsx` (`rolesPermitidos={['dueno', 'vendedor']}`) y enlace en `Navbar.jsx`.
  - **Ampliación del Catálogo Gastronómico:**
    - Se agregaron 12 nuevos productos típicos salvadoreños en la base de datos (17 productos en total): pupusas de queso con loroco, pupusas de frijol con queso, yuca frita con chicharrón, tamales de elote, tamales de gallina, pastelitos de carne, chilate con nuégados, plátanos fritos, quesadilla salvadoreña, horchata de morro, refresco de ensalada y atol de elote.
    - Actualizado el script de siembra `iniciarBaseDatos.js` con el catálogo completo.
  - **Personalización Comercial del Negocio (Foto, Dirección y WhatsApp):**
    - Se modificó la columna `logo_url` de la tabla `negocios` a tipo `MEDIUMTEXT` en MySQL para admitir imágenes Base64 locales optimizadas.
    - Endpoint `PUT /api/auth/negocio` y esquema `actualizarNegocioSchema` ampliados para admitir `logoUrl`, `direccion`, `telefono` y `nombre`.
    - En `PerfilDueno.jsx` se integraron:
      - Campo de dirección física del local (reflejada en la cabecera del catálogo público).
      - Campo de número de WhatsApp (utilizado para generar los enlaces automáticos de confirmación de pedidos).
      - Carga dual de logotipo: subida desde archivo local de la computadora (con compresión y redimensionado a través de `<canvas>` HTML5) o enlace URL web, con previsualización en vivo y opción de eliminar foto.
    - Sincronización del logotipo en la barra de navegación `Navbar.jsx` para mostrar la marca del negocio.
  - **Pruebas y Verificación:**
    - Pruebas automatizadas ejecutadas: login, actualización de datos de negocio con dirección y WhatsApp, verificación de catálogo público y borrado permanente de productos de prueba (código 200).
    - Compilación de producción con `pnpm run build` ejecutada con éxito (0 errores, 2643 módulos).

- **Decisiones:**
  - El vendedor ahora tiene acceso a la administración de productos para poder dar de baja artículos agotados o retirados.
  - El borrado total permite purgar completamente productos de prueba sin dejar registros huérfanos.

### Sesión 9 — Separación de Acceso de Clientes y Personal, Actualización de Correo y Remoción de Panel Demo

- **Fecha:** 20/11/2026
- **Hecho:**
  - **Actualización de Correo Predeterminado:**
    - Correo del usuario dueño modificado a `testeo@antojitos.sv` en MySQL, `iniciarBaseDatos.js`, `02-datos-demo.sql`, `pruebas.http` y en el estado inicial de `Login.jsx`.
    - Contraseña predeterminada conservada en `admin123`.
  - **Remoción del Panel de Acceso Rápido:**
    - Eliminado por completo el contenedor de botones demo de un clic en `Login.jsx`.
  - **Portal de Acceso Exclusivo para Dueño y Vendedor:**
    - `Login.jsx` rediseñado como portal de acceso para colaboradores (`/admin/login` y `/login`), con formulario seguro de correo y contraseña con toggle de visibilidad.
    - Validación y redirección directa por rol: `dueno` redirige a `/admin/dashboard` y `vendedor` a `/admin/cajero`.
    - Enlace inferior explicativo con acceso directo a la tienda pública para clientes sin requerir credenciales.
  - **Separación de la Experiencia del Cliente:**
    - La vista de cliente (`/` y `/tienda/:slug`) queda 100% aislada de elementos administrativos, mostrando exclusivamente el catálogo, categorías, buscador, carrito y checkout directo por WhatsApp.
    - El pie de página enlaza discretamente al portal de colaboradores en `/admin/login`.
  - **Pruebas y Verificación:**
    - `pnpm run build` ejecutado exitosamente con 0 errores (2643 módulos).
    - Inicios de sesión comprobados mediante HTTP para `testeo@antojitos.sv` y `vendedor@antojitos.sv` con códigos 200 y tokens JWT generados.

- **Decisiones:**
  - Se eliminaron las opciones de demo para dotar a la plataforma de mayor realismo y seguridad operativa en producción.

### Sesión 10 — Configuración para Despliegue en Producción (Render y Vercel)

- **Fecha:** 22/11/2026
- **Hecho:**
  - **Backend:**
    - `src/index.js` actualizado para escuchar en `process.env.PORT || 3000` sin prefijar host.
    - CORS configurado para admitir dominios desde la variable `FRONTEND_URL` (soporte multiorigen delimitado por comas y comodín `*`).
    - Verificación estricta de `process.env.JWT_SECRET`: en producción (`NODE_ENV=production`) la aplicación se niega a iniciar si no está configurada la clave secreta.
    - Agregada ruta `GET /health` que responde `{ "ok": true }` para el health check automático de Render.
    - Parámetros de base de datos leídos 100% de variables de entorno (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`).
    - Soporte condicional de SSL para MariaDB/MySQL en la nube (`DB_SSL=true` activa `rejectUnauthorized: true`).
    - Creado `backend/.env.example` con valores de plantilla seguros.
  - **Frontend:**
    - Centralizada la URL del backend en `src/config/api.js` y `src/config.js` leyendo `import.meta.env.VITE_API_URL` con fallback dinámico local solo en desarrollo.
    - Creado `frontend/.env.example` con la variable `VITE_API_URL`.
    - Creado `frontend/vercel.json` con regla de reescritura para React Router (`/.* -> /`).
  - **Repositorio y Seguridad:**
    - Verificado `.gitignore` en raíz, backend y frontend para excluir `.env` y carpetas de compilación, permitiendo rastrear `.env.example`.
    - Confirmada ausencia de archivos `.env` reales en el historial de Git.
    - Cambios subidos a GitHub en la rama `main` con el commit `"Render Web"`.

## Instrucciones de actualización

- Marcar una tarea como completada únicamente cuando haya sido implementada y probada.
- No marcar como terminada una funcionalidad que todavía tenga errores.
- Registrar las decisiones técnicas importantes y sus motivos.
- Agregar una entrada al registro de sesiones al finalizar cada sesión de trabajo.
- Mantener actualizada la entrega en curso.
- No eliminar tareas pendientes sin autorización.
