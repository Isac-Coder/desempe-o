# Simulacro de Prueba de Desempeño

Aplicación SPA para la gestión de proyectos internos con autenticación basada en roles y backend simulado.

## Descripción

Esta aplicación permite administrar proyectos desde una única interfaz:
- Login de usuario con sesión persistente en `localStorage`
- Roles diferenciados: `MANAGER` y `COLLABORATOR`
- CRUD de proyectos: crear, editar, eliminar y ver detalles
- Filtros de búsqueda y estado, paginación local
- Modo claro/oscuro con preferencia guardada

## Tecnologías

- `Vite` como bundler y servidor de desarrollo
- JavaScript moderno con módulos ES
- `json-server` para backend RESTful simulado
- `concurrently` para ejecutar frontend y backend en paralelo
- CSS simple para diseño responsive

## Instalación

Clona el repositorio e instala dependencias:

```bash
npm install
```

## Ejecución

Ejecuta el backend y la app juntos:

```bash
npm run start
```

También puedes ejecutarlos por separado:

```bash
npm run json-server
npm run dev
```

Abre el navegador en:

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

## Funcionalidades

- Autenticación de usuario con validación en `json-server`
- Roles y permisos:
  - `MANAGER`: puede ver, crear, editar y eliminar proyectos
  - `COLLABORATOR`: puede ver proyectos asignados y modificar solo el estado de sus proyectos
- Búsqueda en tiempo real por nombre o descripción
- Filtro por estado del proyecto
- Paginación local de resultados
- Detalle de proyecto en pantalla dedicada
- Modo claro/oscuro que se persiste para el usuario

## Arquitectura del proyecto

```text
Simulacro-P-Desempeño/
├── README.md
├── package.json
├── db.json
├── index.html
├── src/
│   ├── main.js
│   ├── styles.css
│   ├── api/
│   │   └── api.js
│   ├── states/
│   │   └── state.js
│   ├── ui/
│   │   ├── app.js
│   │   ├── dashboard.js
│   │   ├── login.js
│   │   ├── projectDetails.js
│   │   └── projectForm.js
│   └── utils/
│       └── helpers.js
└── node_modules/
```

- `src/main.js`: inicializa el estado y arranca la aplicación.
- `src/states/state.js`: define el estado global compartido y las claves de `localStorage`.
- `src/api/api.js`: funciones para consultar y modificar datos en el backend simulado.
- `src/ui/app.js`: controla la UI principal, el header, el login y el dashboard.
- `src/ui/dashboard.js`: renderiza el listado de proyectos, filtros y acciones por rol.
- `src/ui/login.js`: muestra el formulario de inicio de sesión y maneja la validación.
- `src/ui/projectForm.js`: formulario para crear o editar proyectos.
- `src/ui/projectDetails.js`: muestra la vista de detalle de un proyecto.
- `src/utils/helpers.js`: utilidades para manejar HTML dinámico y estilos.

## Backend simulado

El backend se ejecuta en `http://localhost:3000` y usa `db.json` como fuente de datos.
Contiene usuarios y proyectos que se consultan desde `src/api/api.js`.

## Notas adicionales

- El login persiste en `localStorage` para mantener sesión entre recargas.
- Si cambias `db.json`, reinicia `json-server` para aplicar los cambios.
- El código está dividido en módulos claros para facilitar mantenimiento.
