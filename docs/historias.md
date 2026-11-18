# Historias de usuario de VendeYa

Cada funcionalidad se desarrolla como una historia de usuario. Cada historia debe cumplir sus criterios de aceptación antes de considerarse terminada.

## Entrega 1: base del sistema

### HU-01 Registrar mi negocio

**Como** emprendedor, **quiero** registrar mi negocio y crear mi cuenta de propietario, **para** comenzar a utilizar VendeYa.

Criterios de aceptación:
- Puedo registrar mi negocio proporcionando nombre, slug, nombre del propietario, correo y contraseña.
- Si los datos son válidos, se crea el negocio y su usuario propietario.
- Si el correo ya está registrado, recibo un mensaje indicando que ya existe una cuenta.
- Si el slug ya está ocupado, recibo un mensaje indicando que no está disponible.
- La contraseña se almacena utilizando bcryptjs y nunca en texto plano.
- Al finalizar el registro puedo acceder al sistema.

Reglas involucradas: RN-02, RN-03.

### HU-02 Iniciar sesión

**Como** dueño de un negocio, **quiero** iniciar sesión, **para** administrar mi catálogo, inventario y pedidos.

Criterios de aceptación:
- Puedo iniciar sesión utilizando correo y contraseña.
- Si las credenciales son correctas, recibo acceso al panel administrativo.
- Si las credenciales son incorrectas, recibo un mensaje de error.
- La sesión se mantiene al recargar la página mientras el token siga siendo válido.
- Sin autenticación no puedo acceder a las páginas administrativas.

Reglas involucradas: RN-01.

### HU-03 Configurar el perfil de mi negocio

**Como** dueño de un negocio, **quiero** configurar la información de mi negocio, **para** mostrar información correcta a mis clientes.

Criterios de aceptación:
- Puedo consultar la información actual de mi negocio.
- Puedo modificar el nombre, teléfono, dirección y logo.
- Puedo consultar el slug utilizado para acceder a mi catálogo público.
- No puedo consultar ni modificar el perfil de otro negocio.
- Los cambios se reflejan en la información pública del negocio.

Reglas involucradas: RN-01, RN-03.

## Entrega 2: funcionalidad principal

### HU-04 Administrar mis productos

**Como** dueño de un negocio, **quiero** crear, consultar, editar y eliminar productos, **para** mantener actualizado mi catálogo.

Criterios de aceptación:
- Puedo crear productos indicando nombre, descripción, precio, stock, imagen y categoría.
- No puedo registrar precios iguales o menores que cero.
- No puedo registrar cantidades de stock negativas o decimales.
- Puedo consultar la lista de productos de mi negocio.
- Puedo editar la información de mis productos.
- Puedo eliminar productos según las restricciones definidas para los productos asociados a pedidos.
- Otro negocio no puede consultar ni modificar mis productos.

Reglas involucradas: RN-01, RN-04, RN-05.

### HU-05 Consultar mi catálogo público

**Como** cliente, **quiero** consultar el catálogo público de un negocio, **para** conocer los productos que ofrece.

Criterios de aceptación:
- Puedo acceder al catálogo utilizando el slug único del negocio.
- Puedo consultar el nombre y la información pública del negocio.
- Puedo visualizar sus productos disponibles.
- Puedo consultar el precio, descripción, imagen y categoría de cada producto.
- No necesito crear una cuenta ni iniciar sesión.
- No puedo acceder a información administrativa o privada del negocio.

Reglas involucradas: RN-03, RN-06.

### HU-06 Buscar y filtrar productos

**Como** cliente, **quiero** buscar productos y filtrarlos por categoría, **para** encontrar fácilmente lo que necesito.

Criterios de aceptación:
- Puedo buscar productos por su nombre.
- Puedo filtrar productos por categoría.
- Puedo combinar la búsqueda y los filtros.
- Puedo identificar los productos que no tienen existencias disponibles.
- Si no existen resultados, se muestra un mensaje informativo.

Reglas involucradas: RN-04, RN-05.

## Entrega 3: funcionalidad estrella

### HU-07 Administrar mi carrito de compras

**Como** cliente, **quiero** agregar y modificar productos en un carrito, **para** preparar mi pedido antes de confirmarlo.

Criterios de aceptación:
- Puedo agregar productos al carrito.
- Puedo aumentar o disminuir las cantidades.
- Puedo eliminar productos del carrito.
- Puedo consultar el subtotal de cada producto y el total estimado.
- No puedo agregar cantidades inválidas.
- El carrito corresponde a un único negocio.
- Si un producto deja de tener existencias suficientes, se informa al cliente antes de confirmar el pedido.

Reglas involucradas: RN-04, RN-05, RN-06.

### HU-08 Realizar un pedido mediante checkout express

**Como** cliente, **quiero** confirmar mi pedido proporcionando mis datos básicos, **para** comprar productos sin crear una cuenta.

Criterios de aceptación:
- Puedo proporcionar mi nombre y teléfono.
- Puedo revisar los productos y cantidades antes de confirmar.
- El servidor verifica que los productos pertenezcan al negocio correspondiente.
- El servidor verifica las existencias disponibles antes de registrar el pedido.
- El total se calcula utilizando los precios vigentes almacenados en la base de datos.
- Si hay existencias suficientes, se registra el pedido y sus detalles.
- El inventario se descuenta automáticamente al confirmar el pedido.
- Si ocurre un error durante la operación, no se registra parcialmente el pedido ni se descuenta parcialmente el inventario.
- Si no hay existencias suficientes, recibo un mensaje indicando que no se pudo confirmar el pedido.
- No necesito crear una cuenta para realizar la compra.

Reglas involucradas: RN-05, RN-06, RN-07, RN-08.

## Entrega 4: publicación y presentación

### HU-09 Gestionar los pedidos recibidos

**Como** dueño de un negocio, **quiero** consultar y actualizar el estado de los pedidos, **para** organizar las ventas de mi negocio.

Criterios de aceptación:
- Puedo consultar la lista de pedidos de mi negocio.
- Puedo consultar los detalles de cada pedido.
- Puedo identificar el nombre y teléfono del cliente.
- Puedo consultar los productos, cantidades y total del pedido.
- Puedo cambiar el estado del pedido respetando las transiciones permitidas.
- Puedo cancelar pedidos cuando su estado lo permita.
- Al cancelar un pedido, el inventario se restaura una sola vez.
- No puedo consultar ni modificar pedidos de otro negocio.

Reglas involucradas: RN-01, RN-09, RN-10.

### HU-10 Consultar el Dashboard y compartir mi catálogo

**Como** dueño de un negocio, **quiero** consultar un resumen de mi actividad y compartir mi catálogo, **para** conocer el rendimiento de mi negocio y facilitar el acceso a mis clientes.

Criterios de aceptación:
- Puedo visualizar un resumen de los pedidos recibidos.
- Puedo consultar métricas de ventas y pedidos.
- Puedo visualizar gráficos estadísticos utilizando Recharts.
- Las estadísticas corresponden únicamente a mi negocio.
- Puedo consultar el enlace público de mi catálogo.
- Puedo generar un código QR que dirija al catálogo público.
- Puedo escanear el código QR con otro dispositivo y acceder al catálogo.

Reglas involucradas: RN-01, RN-03, RN-08.

## Consideraciones generales

- Las validaciones importantes deben ejecutarse en el backend.
- Las validaciones del frontend son únicamente una ayuda para el usuario.
- Cada historia debe tener sus pruebas correspondientes en backend/pruebas.http cuando involucre rutas de la API.
- No se deben implementar funcionalidades que estén fuera del alcance aprobado del proyecto.
