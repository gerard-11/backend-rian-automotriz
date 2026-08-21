# Endpoints quick-entry para frontend

Esta guia documenta los endpoints rapidos que permiten crear un cliente,
vehiculo y documento de trabajo en una sola llamada. Sirve para conectar el
frontend sin pasar primero por las pantallas de alta de cliente/vehiculo.

Base URL local por defecto:

```txt
http://localhost:3000
```

Types fuente del backend:

```txt
src/modules/budgets/budgets.schemas.ts
src/modules/work-orders/work-orders.schemas.ts
```

Los payloads quick ya tienen su type inferido desde Zod:

```ts
CreateQuickBudgetInput
CreateQuickWorkOrderInput
```

Esos son los types correctos del backend. Si el frontend esta en otro repo, hay
que copiarlos, exponerlos desde un paquete compartido o generar un cliente; no
conviene mantener un segundo archivo manual duplicado.


## Autenticacion

Los endpoints quick estan protegidos con sesion. Antes de usarlos, el frontend
debe hacer login y conservar la cookie HTTP-only `rian_session`.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

Respuesta exitosa:

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

En llamadas desde navegador, usar `credentials: "include"` para enviar y
recibir la cookie:

```ts
await fetch(`${API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});
```

## Campos compartidos

### customer

| Campo | Tipo | Requerido | Notas |
| --- | --- | --- | --- |
| `name` | `string` | Si | No puede venir vacio. |
| `phone` | `string` | No | String vacio se guarda como `undefined`. |
| `email` | `string` | No | Debe ser email valido si se envia. String vacio se ignora. |
| `notes` | `string` | No | Notas del cliente. |

### vehicle

| Campo | Tipo | Requerido | Notas |
| --- | --- | --- | --- |
| `plate` | `string` | No | Placa. |
| `make` | `string` | No | Marca. |
| `model` | `string` | No | Modelo. |
| `year` | `number` | No | Entero entre `1900` y `2100`. Tambien acepta string numerico. |
| `color` | `string` | No | Color. |
| `notes` | `string` | No | Notas del vehiculo. |

En presupuestos quick, el vehiculo debe traer al menos uno de estos campos:
`plate`, `make` o `model`.

### items

Debe enviarse al menos un item.

| Campo | Tipo | Requerido | Notas |
| --- | --- | --- | --- |
| `type` | enum | Depende | Valores: `SERVICE`, `LABOR`, `PART`, `TIRE`, `OTHER`. En presupuestos tiene default `SERVICE`; en ordenes de trabajo es requerido. |
| `description` | `string` | Si | No puede venir vacio. |
| `saleAmount` | `number` | Si | Numero entre `0` y `9999999.99`. Tambien acepta string numerico. |
| `costAmount` | `number` | No | Numero entre `0` y `9999999.99`. En presupuestos tiene default `0`; en ordenes de trabajo puede omitirse. |
| `notes` | `string` | No | Notas del item. |

Los totales (`totalSaleAmount`, `totalCostAmount`, utilidad estimada/bruta) los
calcula el backend a partir de `items`.

## Crear presupuesto rapido

Crea un cliente nuevo, un vehiculo nuevo asociado a ese cliente y un presupuesto
en estado `PENDING`.

```http
POST /budgets/quick-entry
Content-Type: application/json
Cookie: rian_session=...
```

### Payload

```json
{
  "customer": {
    "name": "Juan Perez",
    "phone": "5551234567",
    "email": "juan@example.com",
    "notes": "Cliente nuevo"
  },
  "vehicle": {
    "plate": "ABC-123",
    "make": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "color": "Blanco",
    "notes": "Golpe frontal"
  },
  "diagnosis": "Requiere cambio de balatas y rectificado",
  "notes": "Cotizacion solicitada por WhatsApp",
  "validUntil": "2026-08-28",
  "items": [
    {
      "type": "PART",
      "description": "Balatas delanteras",
      "saleAmount": 1200,
      "costAmount": 800,
      "notes": "Incluye refaccion"
    },
    {
      "type": "LABOR",
      "description": "Mano de obra",
      "saleAmount": 500,
      "costAmount": 0
    }
  ]
}
```

Campos especificos:

| Campo | Tipo | Requerido | Notas |
| --- | --- | --- | --- |
| `diagnosis` | `string` | Si | No puede venir vacio. |
| `notes` | `string` | No | Notas generales del presupuesto. |
| `validUntil` | `string/date` | No | Si se omite, backend asigna 15 dias desde la creacion. |

### Respuesta `201`

```json
{
  "budget": {
    "id": "uuid",
    "folio": 12,
    "customerId": "uuid",
    "vehicleId": "uuid",
    "status": "PENDING",
    "diagnosis": "Requiere cambio de balatas y rectificado",
    "notes": "Cotizacion solicitada por WhatsApp",
    "totalSaleAmount": "1700",
    "totalCostAmount": "800",
    "estimatedProfitAmount": "900",
    "validUntil": "2026-08-28T00:00:00.000Z",
    "acceptedAt": null,
    "rejectedAt": null,
    "convertedAt": null,
    "createdAt": "2026-08-13T18:00:00.000Z",
    "updatedAt": "2026-08-13T18:00:00.000Z",
    "customer": {
      "id": "uuid",
      "name": "Juan Perez",
      "phone": "5551234567",
      "email": "juan@example.com"
    },
    "vehicle": {
      "id": "uuid",
      "plate": "ABC-123",
      "make": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "color": "Blanco"
    },
    "items": [
      {
        "id": "uuid",
        "type": "PART",
        "description": "Balatas delanteras",
        "saleAmount": "1200",
        "costAmount": "800",
        "notes": "Incluye refaccion",
        "createdAt": "2026-08-13T18:00:00.000Z",
        "updatedAt": "2026-08-13T18:00:00.000Z"
      }
    ]
  }
}
```

### Ejemplo frontend

```ts
export async function createQuickBudget(payload: unknown) {
  const response = await fetch(`${API_URL}/budgets/quick-entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await response.json();
  }

  return response.json() as Promise<{ budget: QuickBudgetResponse }>;
}
```

## Crear orden de trabajo rapida

Crea un cliente nuevo, un vehiculo nuevo asociado a ese cliente y una orden de
trabajo. Si no se envia `status`, backend usa `ACTIVE`.

```http
POST /work-orders/quick-entry
Content-Type: application/json
Cookie: rian_session=...
```

### Payload

```json
{
  "customer": {
    "name": "Maria Lopez",
    "phone": "5559876543",
    "email": "maria@example.com"
  },
  "vehicle": {
    "plate": "XYZ-987",
    "make": "Nissan",
    "model": "Sentra",
    "year": 2018,
    "color": "Gris"
  },
  "diagnosis": "Servicio preventivo",
  "notes": "Cliente espera en sala",
  "status": "ACTIVE",
  "advanceAmount": 300,
  "items": [
    {
      "type": "SERVICE",
      "description": "Cambio de aceite",
      "saleAmount": 950,
      "costAmount": 520
    }
  ]
}
```

Campos especificos:

| Campo | Tipo | Requerido | Notas |
| --- | --- | --- | --- |
| `diagnosis` | `string` | No | String vacio se ignora. |
| `notes` | `string` | No | Notas generales de la orden. |
| `status` | enum | No | Valores: `ACTIVE`, `COMPLETED`, `CANCELLED`. Si se omite, backend usa `ACTIVE`. |
| `advanceAmount` | `number` | No | Anticipo. Si se omite, backend usa `0`. |

### Respuesta `201`

```json
{
  "workOrder": {
    "id": "uuid",
    "folio": 24,
    "customerId": "uuid",
    "vehicleId": "uuid",
    "budgetId": null,
    "status": "ACTIVE",
    "diagnosis": "Servicio preventivo",
    "notes": "Cliente espera en sala",
    "advanceAmount": "300",
    "totalSaleAmount": "950",
    "totalCostAmount": "520",
    "grossProfitAmount": "430",
    "completedAt": null,
    "cancelledAt": null,
    "createdAt": "2026-08-13T18:00:00.000Z",
    "updatedAt": "2026-08-13T18:00:00.000Z",
    "customer": {
      "id": "uuid",
      "name": "Maria Lopez",
      "phone": "5559876543",
      "email": "maria@example.com"
    },
    "vehicle": {
      "id": "uuid",
      "plate": "XYZ-987",
      "make": "Nissan",
      "model": "Sentra",
      "year": 2018,
      "color": "Gris"
    },
    "budget": null,
    "items": [
      {
        "id": "uuid",
        "type": "SERVICE",
        "description": "Cambio de aceite",
        "saleAmount": "950",
        "costAmount": "520",
        "notes": null,
        "createdAt": "2026-08-13T18:00:00.000Z",
        "updatedAt": "2026-08-13T18:00:00.000Z"
      }
    ]
  }
}
```

### Ejemplo frontend

```ts
export async function createQuickWorkOrder(payload: unknown) {
  const response = await fetch(`${API_URL}/work-orders/quick-entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await response.json();
  }

  return response.json() as Promise<{ workOrder: QuickWorkOrderResponse }>;
}
```

## Errores

### No autenticado `401`

```json
{
  "message": "Authentication required"
}
```

### Validacion `400`

```json
{
  "message": "Validation error",
  "issues": [
    {
      "code": "too_small",
      "path": ["items"],
      "message": "At least one item is required"
    }
  ]
}
```

Casos comunes:

| Caso | Resultado |
| --- | --- |
| Falta `customer.name` | `400 Validation error` |
| `customer.email` no es email valido | `400 Validation error` |
| `items` viene vacio | `400 Validation error` |
| `saleAmount` o `costAmount` negativo | `400 Validation error` |
| `vehicle.year` menor a `1900` o mayor a `2100` | `400 Validation error` |
| Presupuesto quick sin `vehicle.plate`, `vehicle.make` y `vehicle.model` | `400 Validation error` |
| Presupuesto quick sin `diagnosis` | `400 Validation error` |
| Orden quick sin `item.type` | `400 Validation error` |

## Notas de integracion

- Los quick-entry siempre crean cliente y vehiculo nuevos; no buscan ni
  reutilizan registros existentes.
- El frontend debe enviar `Content-Type: application/json`.
- Si frontend y backend estan en dominios/puertos distintos, usar
  `credentials: "include"` en `fetch` o `withCredentials: true` en Axios.
- En desarrollo, el CORS por defecto permite `http://localhost:5173`.
- Los montos pueden enviarse como numero o string numerico, pero conviene
  normalizarlos a numero en el frontend antes de enviar.
- Las fechas se devuelven como ISO string. En ordenes de trabajo, `completedAt` se asigna al usar status `COMPLETED` y `cancelledAt` al usar `CANCELLED`.
- Los montos de Prisma Decimal normalmente llegan serializados como string en
  JSON; tratarlos como string decimal o convertirlos explicitamente en el
  frontend.

