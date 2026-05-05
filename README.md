# Frontend — Sistema de Apuestas

Cliente web en **Angular** con **Angular Material** que consume la API REST del backend **FastAPI** (`backend-sistema-de-apuestas`). Incluye **login de demostración**, **layout con menú lateral colapsable** y **CRUD** por cada entidad expuesta en el API.

---

## Tabla de contenidos

1. [Stack tecnológico](#stack-tecnológico)
2. [Requisitos previos](#requisitos-previos)
3. [Estructura de carpetas del repositorio](#estructura-de-carpetas-del-repositorio)
4. [Cómo obtener el proyecto (clonar o copiar)](#cómo-obtener-el-proyecto-clonar-o-copiar)
5. [Instalación paso a paso](#instalación-paso-a-paso)
6. [Configuración de la URL del API](#configuración-de-la-url-del-api)
7. [Cómo ejecutar en desarrollo](#cómo-ejecutar-en-desarrollo)
8. [Cómo compilar para producción](#cómo-compilar-para-producción)
9. [Arquitectura de la aplicación Angular](#arquitectura-de-la-aplicación-angular)
10. [Rutas y navegación](#rutas-y-navegación)
11. [Componentes y convenciones](#componentes-y-convenciones)
17. [Ejemplo de flujo: lista CRUD](#ejemplo-de-flujo-lista-crud)
18. [Servicios HTTP y modelos](#servicios-http-y-modelos)
19. [Autenticación y usuario de auditoría](#autenticación-y-usuario-de-auditoría)
20. [Enlace del video demostrativo](#Enlace-del-video-demostrativo)

---

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| **Angular 20** | Framework SPA, componentes standalone, signals donde aplica |
| **TypeScript** | Lenguaje del proyecto |
| **Angular Material 20** | UI: tablas, formularios, diálogos, sidenav, toolbar, temas M3 |
| **RxJS** | Observables en llamadas HTTP |
| **Angular Router** | Rutas, lazy loading, `withViewTransitions()` |
| **HttpClient** | Cliente REST hacia FastAPI |

El código de la aplicación vive en la carpeta **`web/`**. En la raíz de este repositorio hay un `package.json` mínimo que **reenvía** los comandos a `web/` para poder ejecutar `npm start` sin entrar en `web`.

---

## Requisitos previos

- **Node.js** LTS (recomendado v20 o v22): [https://nodejs.org](https://nodejs.org)
- **npm** (viene con Node)
- Opcional: **Angular CLI** global (`npm install -g @angular/cli`) — no es obligatorio si usas `npx ng` o los scripts de `package.json`

Comprueba versiones:

```bash
node -v
npm -v
```
---

## Estructura de carpetas del repositorio

```
frontend---sistema-de-apuestas/          ← Raíz del repo (scripts npm cómodos)
├── package.json                            ← Delega start/build/test a web/
├── README.md                               ← Este archivo
└── web/                                    ← Proyecto Angular real
    ├── angular.json
    ├── package.json                        ← Dependencias y scripts ng
    ├── tsconfig.json
    ├── src/
    │   ├── index.html
    │   ├── main.ts
    │   ├── styles.scss                     ← Tema Material + estilos globales
    │   ├── environments/
    │   │   ├── environment.ts              ← Desarrollo (apiUrl)
    │   │   └── environment.prod.ts         ← Producción (reemplazo en build prod)
    │   └── app/
    │       ├── app.ts                      ← Raíz: solo <router-outlet />
    │       ├── app.html
    │       ├── app.scss
    │       ├── app.config.ts               ← HttpClient, animaciones, router + view transitions
    │       ├── app.routes.ts               ← Rutas y lazy loading
    │       ├── models/
    │       │   └── api.models.ts           ← Interfaces TypeScript alineadas al API
    │       ├── core/
    │       │   ├── audit-context.service.ts
    │       │   ├── audit-user.guard.ts
    │       │   └── services/               ← Un servicio por entidad (HTTP)
    │       ├── shared/
    │       │   └── ids.ts                  ← Utilidad para mostrar UUIDs cortos
    │       └── features/
    │           ├── login/                  ← Pantalla de acceso
    │           ├── shell/                  ← Layout: sidenav + toolbar + outlet
    │           ├── usuarios/               ← Lista + diálogo CRUD
    │           ├── apuestas/
    │           ├── billetera/
    │           ├── bingos/
    │           ├── loterias/
    │           ├── metodos-pago/
    │           ├── ruletas/
    │           ├── sorteos/
    │           └── transacciones/
    └── public/
        └── favicon.ico
```

Cada carpeta bajo **`features/<entidad>/`** sigue el mismo patrón:

- **`<entidad>-list.ts|html|scss`**: pantalla con `mat-table`, paginador, botones y apertura de diálogo.
- **`<entidad>-dialog.ts|html`**: formulario en `MatDialog` para crear/editar (sin `.scss` propio si los estilos vienen de Material y `styles.scss`).

---

## Cómo obtener el proyecto (clonar o copiar)

### Opción A — Clonar con Git

Si el proyecto está en un servidor Git:

```bash
git clone <URL-del-repositorio> frontend---sistema-de-apuestas
cd frontend---sistema-de-apuestas
```

### Opción B — Copiar carpeta (USB, zip, Drive)

1. Copia toda la carpeta **`frontend---sistema-de-apuestas`** (incluyendo **`web/`**).
2. No hace falta copiar **`web/node_modules`** si vas a ejecutar `npm install` de nuevo (recomendado).
3. Abre una terminal en **`frontend---sistema-de-apuestas`** (raíz) o directamente en **`web/`**.

---

## Instalación paso a paso

Desde la **raíz** del frontend (recomendado):

```bash
cd frontend---sistema-de-apuestas
cd web
npm install
```

O en un solo paso desde la raíz (si tu npm lo permite):

```bash
cd frontend---sistema-de-apuestas/web && npm install
```

Esto instala Angular, Material, CDK, etc. según **`web/package.json`**.

---

## Configuración de la URL del API

La base del API se define en:

- **`web/src/environments/environment.ts`** (desarrollo por defecto al hacer `ng serve`)
- **`web/src/environments/environment.prod.ts`** (sustituye al anterior en **`ng build` de producción** — ver `angular.json` → `fileReplacements`)

Ejemplo desarrollo:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://0.0.0.0:8000',
};
```

Cambia **`apiUrl`** si tu FastAPI corre en otro host o puerto (por ejemplo otro PC en la red: `http://192.168.1.10:8000`).

Los servicios en **`core/services/`** concatenan rutas como `${environment.apiUrl}/usuarios/`, etc.

---

## Cómo ejecutar en desarrollo

1. Arranca el **backend** FastAPI (puerto **8000** por defecto en ese proyecto).
2. En una terminal, desde **`web/`**:

```bash
cd web
npm start
```

O desde la **raíz** del repo frontend:

```bash
npm start
```

3. Abre el navegador en **http://localhost:4200** (puerto por defecto de `ng serve`).

Si el puerto 4200 está ocupado, Angular mostrará otro (mira la salida de la consola).

---

## Cómo compilar para producción

```bash
cd web
npm run build
```

Salida típica: **`web/dist/web/`** (nombre del proyecto en `angular.json`).

Para servir esa carpeta con un servidor estático (ejemplo):

```bash
npx --yes serve -s dist/web/browser -l 8080
```

(Ajusta la ruta si tu `angular.json` cambia el directorio de salida.)

---

## Arquitectura de la aplicación Angular

### Arranque

- **`main.ts`**: arranca la aplicación con `bootstrapApplication(App, appConfig)`.
- **`app.config.ts`**:
  - `provideHttpClient()` para llamadas REST.
  - `provideAnimationsAsync()` para animaciones de Material.
  - `provideRouter(routes, withViewTransitions())` para transiciones suaves entre rutas (navegadores compatibles).

### Raíz

- **`app.ts`**: componente raíz con **solo** `<router-outlet />` — no hay lógica de negocio aquí.

### Carga perezosa (lazy loading)

Las rutas cargan componentes con **`loadComponent`** para que cada pantalla sea un **chunk** separado y la primera carga sea más liviana.

---

## Rutas y navegación

| Ruta | Descripción |
|------|-------------|
| `/` | Redirige a `/login` |
| `/login` | Login de demostración o alta del primer usuario |
| `/app` | Layout principal (requiere usuario de auditoría en `localStorage`) |
| `/app/usuarios` | CRUD usuarios |
| `/app/billeteras` | CRUD billeteras |
| `/app/apuestas` | CRUD apuestas |
| `/app/metodos-pago` | CRUD metodos de pago |
| `/app/transacciones` | CRUD transacciones |
| `/app/sorteos` | CRUD sorteos |
| `/app/bingos` | CRUD bingos |
| `/app/loterias` | CRUD loterias |
| `/app/ruletas` | CRUD ruletas |
| `**` | Cualquier otra ruta → `/login` |

La ruta `/app` está protegida por **`auditUserGuard`**: si no hay UUID de usuario de auditoría guardado, redirige al login.

---

## Componentes y convenciones

### `features/login`

- Formulario **usuario + contraseña** (la clave no se valida contra el servidor; solo debe existir el `nombre_usuario` en `GET /usuarios/`).
- Si no hay usuarios, muestra formulario para **crear el primero** (POST).

### `features/shell/main-layout`

- **`mat-sidenav-container`** con **`autosize`**: recalcula el margen del contenido cuando el menú cambia de ancho (colapsar/expandir).
- Menú lateral con iconos, estado colapsado persistido en **`localStorage`** (`shell_sidebar_collapsed`).
- Barra superior: selector de **usuario de auditoría**, cierre de sesión.

### Listas CRUD (`*-list`)

- Tabla Material (`mat-table`), paginación, botones editar/eliminar, botón “Nuevo” abre **`MatDialog`** con el `*-dialog` correspondiente.

### Diálogos (`*-dialog`)

- Formularios reactivos o con `ngModel` según el archivo; envían al servicio **create** o **update** según el modo.

Patrón recomendado al **añadir una nueva entidad** del backend:

1. Añadir interfaces en **`models/api.models.ts`**.
2. Crear **`core/services/mi-entidad.service.ts`** (listar, get, crear, actualizar, borrar).
3. Crear carpeta **`features/mi-entidad/`** con `mi-entidad-list` + `mi-entidad-dialog`.
4. Registrar ruta hija bajo **`/app`** en **`app.routes.ts`**.
5. Añadir entrada en el array **`nav`** de **`main-layout.ts`** y el ícono en el template.

---

## Ejemplo de flujo: lista CRUD

1. El usuario navega a **`/app/usuarios`** → el router carga **`usuario-list`** (lazy).
2. **`usuario-list.ts`**: en el constructor o al iniciar llama `this.usuarioService.list()` → rellena `MatTableDataSource`.
3. **`usuario-list.html`**: `mat-table` lee `dataSource`; columnas definidas con `matColumnDef` / `*matHeaderCellDef` / `*matCellDef`.
4. Clic en **Nuevo** → `nuevo()` abre **`UsuarioDialogComponent`** con `{ mode: 'create' }`.
5. **`usuario-dialog.ts`**: lee `MAT_DIALOG_DATA`, construye el formulario; al guardar llama `usuarioService.create()` o `update()`.
6. Al cerrar el diálogo con éxito, la lista vuelve a llamar `reload()` para refrescar la tabla.

Los **estilos** de la tabla (`.page-head`, `.table-wrap`) están en **`usuario-list.scss`**; la apariencia de botones y tabla viene en gran parte de **Material** y del tema global.

---

## Servicios HTTP y modelos

- **`models/api.models.ts`**: tipos alineados con los cuerpos y respuestas del FastAPI (UUID como `string` en TypeScript).
- **`core/services/*.service.ts`**: cada uno usa `HttpClient` y `environment.apiUrl`.
  - Listados y altas usan rutas **con barra final** (`/usuarios/`, `/categorias/`, …) para coincidir con el enrutado del backend.

---

## Autenticación y usuario de auditoría

No hay JWT en esta versión: el “login” solo asocia un **usuario existente** del API y guarda su **`id_usuario`** en:

- **`AuditContextService`** → `localStorage` bajo la clave **`pos_audit_usuario_id`**.

Ese UUID se usa en los cuerpos que el backend exige para **trazabilidad** (`id_usuario_creacion`, `id_usuario_edita`, etc.).

---

## Enlace del video demostrativo

https://youtu.be/FMu4wCuKGrQ