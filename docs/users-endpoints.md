# Usuarios y roles

## Roles

- `ADMIN`: administra usuarios, gastos y utilidades.
- `EMPLOYEE`: puede operar clientes, vehiculos, presupuestos y ordenes, pero no
  administrar gastos, utilidades ni usuarios.

## Crear usuario

Requiere una sesion autenticada con rol `ADMIN`.

```http
POST /users
Content-Type: application/json
Cookie: rian_session=...
```

```json
{
  "name": "Empleado del taller",
  "email": "empleado@taller.com",
  "password": "password-seguro",
  "role": "EMPLOYEE"
}
```

`role` es opcional y por defecto es `EMPLOYEE`. La contraseña debe tener al
menos 8 caracteres.

La respuesta no incluye la contraseña:

```json
{
  "user": {
    "id": "uuid",
    "name": "Empleado del taller",
    "email": "empleado@taller.com",
    "role": "EMPLOYEE",
    "active": true,
    "createdAt": "2026-10-24T18:00:00.000Z"
  }
}
```
