# Simulacro de Prueba de Desempeño

Aplicación SPA para la gestión de proyectos internos con autenticación, roles y persistencia de sesión.

## Resumen

Esta aplicación ofrece un flujo completo de gestión de proyectos con:
- Inicio de sesión de usuario
- Roles diferenciados (`MANAGER` / `COLLABORATOR`)
- Listado, creación, edición y eliminación de proyectos
- Búsqueda, filtro por estado y paginación
- Tema claro/oscuro
- Persistencia de sesión en `localStorage`

## Tecnologías usadas

- Vite
- JavaScript moderno (ES Modules)
- `json-server` para el backend simulado
- `concurrently` para ejecutar el frontend y el backend juntos
- CSS personalizado para el diseño responsive

## Instalación

```bash
npm install
```

## Ejecución

Inicia el backend simulado y la aplicación Vite en paralelo:

```bash
npm run start
```

Si prefieres ejecutar los servicios por separado:

```bash
npm run json-server
npm run dev
```

Después abre la aplicación en el navegador:

```text
http://localhost:5173
```

## Credenciales de prueba

- Manager
  - email: `manager@empresa.com`
  - password: `manager123`

- Collaborator
  - email: `collaborator@empresa.com`
  - password: `collab123`

## Características principales

- Autenticación con validación de usuario
- Roles y permisos diferenciados:
  - `MANAGER`: puede ver, crear, editar y eliminar proyectos
  - `COLLABORATOR`: puede ver proyectos asignados y editar solo algunos datos según permisos
- CRUD completo de proyectos usando `json-server`
- Estado global y persistencia de sesión en `localStorage`
- Vista tipo dashboard con búsqueda, filtrado y paginación
- Modo claro/oscuro con toggle en la interfaz
- Uso de plantillas HTML en `index.html` para vistas dinámicas

## Flujo de la aplicación

1. El usuario ingresa sus credenciales en el formulario de login.
2. El sistema valida el usuario contra `db.json`.
3. Si el login es exitoso, se guarda la sesión en `localStorage`.
4. Se muestra el dashboard con listado de proyectos.
5. El usuario puede usar búsqueda, filtros y paginación.
6. El manager puede abrir el formulario de proyecto para crear o editar.
7. El usuario puede cerrar sesión con el botón de logout.

## Estructura del proyecto

```text
Simulacro-P-Desempeño/
├── README.md
├── package.json
├── package-lock.json
├── db.json
├── index.html
├── Prueba-desempeño-Simulacro.pdf
├── src/
│   ├── main.js
│   ├── styles.css
│   ├── api/
│   │   └── index.js
│   ├── state/
│   │   └── index.js
│   ├── ui/
│   │   └── index.js
│   └── utils/
│       └── helpers.js
└── node_modules/
```

- `package.json`: scripts y dependencias del proyecto.
- `db.json`: datos de usuarios y proyectos usados por `json-server`.
- `index.html`: estructura base, plantillas y contenedor de la SPA.
- `src/main.js`: punto de entrada que inicializa la app.
- `src/styles.css`: estilos principales de interfaz.
- `src/api/index.js`: funciones de comunicación con el backend.
- `src/state/index.js`: estado global, configuración y claves de `localStorage`.
- `src/ui/index.js`: renderiza vistas, maneja eventos y controla la navegación interna.
- `src/utils/helpers.js`: funciones utilitarias compartidas.

## Notas

- El backend funciona en `http://localhost:3000`.
- La aplicación se sirve en `http://localhost:5173`.
- Si agregas nuevas rutas o archivos, actualiza también la estructura del README.
