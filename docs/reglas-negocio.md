# Reglas de negocio de VendeYa

Toda regla debe validarse en el backend. Las validaciones del frontend solamente ayudan al usuario y no sustituyen las del servidor.

## Reglas

| Código | Regla | Entidad | Dónde se valida | Respuesta si no se cumple | Prueba |
|---|---|---|---|---|---|
| RN-01 | Un negocio solo puede consultar y modificar sus propios datos administrativos. | Todas | API | 404 | Intentar consultar un producto de otro negocio |
| RN-02 | El correo de cada usuario debe ser único en todo el sistema. | usuarios | API y MySQL (UNIQUE) | 409 | Registrar dos cuentas con el mismo correo |
| RN-03 | Cada negocio debe tener un slug único para identificar su catálogo público. | negocios | API y MySQL (UNIQUE) | 409 | Registrar dos negocios con el mismo slug |
| RN-04 | El precio de un producto debe ser mayor que cero y su cantidad de stock debe ser un número entero igual o mayor que cero. | productos | API y MySQL | 400 | Registrar un producto con precio negativo o stock decimal |
| RN-05 | El inventario de un producto nunca puede ser negativo. | productos | API y MySQL | 409 | Intentar vender más unidades de las disponibles |
| RN-06 | Todo pedido debe contener productos pertenecientes al negocio cuyo catálogo está siendo consultado y con cantidades válidas. | pedidos, detalles_pedido | API | 400 o 404 | Enviar un producto inexistente o de otro negocio |
| RN-07 | El pedido, sus detalles y el descuento del inventario deben confirmarse dentro de una única transacción. Si una operación falla, todos los cambios deben revertirse. | pedidos, detalles_pedido, productos | API y MySQL | 409 o 500 | Simular un error durante el checkout y comprobar que no se descuenta stock |
| RN-08 | El total del pedido se calcula en el servidor utilizando los precios vigentes de los productos al momento de confirmar la compra. | pedidos, detalles_pedido | API | 400 si los datos son inválidos; el total enviado por el cliente se ignora | Manipular el total enviado desde el navegador |
| RN-09 | Un pedido solo puede cambiar de estado mediante las transiciones permitidas. No se puede modificar un pedido que ya alcanzó un estado final. | pedidos | API | 409 | Intentar cambiar un pedido entregado a preparando |
| RN-10 | Cuando un pedido se cancela mediante una transición permitida, las unidades descontadas deben devolverse al inventario una sola vez. | pedidos, productos | API y MySQL | 409 | Cancelar un pedido y comprobar que el stock se restaura una sola vez |

## Estados

### Pedidos

Estados propuestos para VendeYa:

```text
pendiente
    |
    +------> cancelado
    |
    v
confirmado
    |
    +------> cancelado
    |
    v
preparando
    |
    +------> cancelado
    |
    v
listo
    |
    v
entregado
```

Reglas:
- Un pedido comienza en estado `pendiente`.
- El dueño puede confirmar un pedido pendiente.
- Un pedido confirmado puede pasar a preparando.
- Un pedido en preparación puede pasar a listo.
- Un pedido listo puede pasar a entregado.
- Un pedido pendiente, confirmado o en preparación puede cancelarse.
- Un pedido cancelado o entregado es un estado final.
- La cancelación debe restaurar el inventario una sola vez (RN-10).

No se permiten saltos de estado ni retrocesos.

## Cálculos

| Código | Cálculo | Ejemplo |
|---|---|---|
| RN-11 | Subtotal por producto = precio_unitario × cantidad | $5.00 × 3 = $15.00 |
| RN-12 | Total del pedido = suma de los subtotales de todos sus productos | $15.00 + $10.00 = $25.00 |

Los precios utilizados deben corresponder a los registrados en el momento de confirmar el pedido, no a cambios posteriores en el catálogo.

## Consideraciones adicionales

- Los clientes no necesitan una cuenta para consultar catálogos ni realizar pedidos.
- El acceso administrativo requiere autenticación.
- El negocio_id de las operaciones administrativas se obtiene del token JWT.
- Las consultas públicas utilizan el slug del negocio.
- El servidor nunca debe confiar en el precio, total o stock enviados por el navegador.
- Los cambios de inventario deben ser seguros ante solicitudes simultáneas.
