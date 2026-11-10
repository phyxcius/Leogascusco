# Configuración de Firebase (LeoGas Cusco)

## 1. Authentication
Firebase → Authentication → Método de acceso: activar **Correo/contraseña** y **Anónimo**.
Configuración → Dominios autorizados: agregar `phyxcius.github.io`.

## 2. Crear usuarios (Authentication → Users → Agregar usuario)
El login convierte el usuario escrito en un correo `usuario@leogas.pe`:

| Quién | Correo a crear | Contraseña |
|---|---|---|
| Administrador | admin@leogas.pe | (la que tú elijas) |
| Edwin | edwin@leogas.pe | (la que elijas) |
| Carlos | carlos@leogas.pe | (la que elijas) |
| Jorge | jorge@leogas.pe | (la que elijas) |

Copia el **UID** de cada usuario (columna "UID de usuario").

## 3. Roles (Realtime Database → Datos)
Crea manualmente este árbol (reemplaza los UID):

```
roles
 ├─ UID_DEL_ADMIN
 │    └─ role: "admin"
 ├─ UID_DE_EDWIN
 │    ├─ role: "repartidor"
 │    └─ repartidorId: "rep-1"
 ├─ UID_DE_CARLOS
 │    ├─ role: "repartidor"
 │    └─ repartidorId: "rep-2"
 └─ UID_DE_JORGE
      ├─ role: "repartidor"
      └─ repartidorId: "rep-3"
```

## 4. Reglas
Realtime Database → Reglas: pega el contenido de `database.rules.json` y **Publicar**.

## 5. Primer ingreso
Entra a `/admin.html` con admin@leogas.pe (o solo `admin`). La primera vez, el panel sube a la nube
los datos que ya tenía en ese dispositivo (catálogo, repartidores, etc.). Hazlo desde el dispositivo
que tiene los datos buenos.

## Notas
- Agregar un repartidor nuevo desde el panel crea su ficha, pero su acceso hay que crearlo en
  Authentication y en `roles` (pasos 2 y 3). La contraseña del formulario ya no se usa.
- El Club de Fidelidad que el cliente sella desde su celular sigue guardándose solo en ese celular;
  el admin lo ve en la nube solo lo que él registre desde el panel.
- Ya no se usa el token de GitHub para pedidos ni catálogo.
