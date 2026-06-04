/**
 * Construye y mantiene la interfaz principal de la aplicación.
 * Este módulo coordina el header, el login, el dashboard y el modo oscuro.
 */
import { state, sessionKey, darkModeKey } from '../states/state.js';
import { authenticate } from '../api/api.js';
import { createStyledButton, createFragment } from '../utils/helpers.js';
import { renderLogin } from './login.js';
import { renderDashboard } from './dashboard.js';
import { renderProjectForm } from './projectForm.js';
import { renderDetails } from './projectDetails.js';

let app; // contenedor principal donde se renderiza la vista actual
let logoutButton; // botón para cerrar sesión
let darkModeToggle; // botón para cambiar el tema de la aplicación
let root; // elemento raíz de la aplicación

/**
 * Crea la estructura estática de la aplicación.
 * - Crea el contenedor raíz si no existe.
 * - Construye el header y los botones de tema y logout.
 * - Deja listo el elemento <main> para renderizar la vista activa.
 */
export function setupUI() {
  root = document.getElementById('app-root') || createAppShell(); // obtiene o crea el contenedor raíz
  root.innerHTML = ''; // limpia cualquier contenido previo del root

  const header = document.createElement('header'); // crea el encabezado superior
  const title = document.createElement('h1');
  title.textContent = 'Gestión de Proyectos Internos'; // título de la app

  const headerActions = document.createElement('div'); // contenedor para botones
  headerActions.style.display = 'flex';
  headerActions.style.gap = '16px';
  headerActions.style.alignItems = 'center';

  darkModeToggle = document.createElement('button'); // botón para alternar tema
  darkModeToggle.id = 'darkModeToggle';
  darkModeToggle.className = 'btn secondary';
  darkModeToggle.title = 'Cambiar tema';
  darkModeToggle.addEventListener('click', toggleDarkMode); // agrega el listener de tema

  logoutButton = document.createElement('button'); // botón para cerrar sesión
  logoutButton.id = 'logoutButton';
  logoutButton.className = 'btn secondary hidden';
  logoutButton.textContent = 'Cerrar sesión';
  logoutButton.addEventListener('click', handleLogout); // agrega el listener de logout

  headerActions.append(darkModeToggle, logoutButton); // agrega botones al header
  header.append(title, headerActions); // agrega título y acciones al header

  root.appendChild(header); // añade el header al root

  app = document.createElement('main'); // crea el contenedor principal de contenido
  app.id = 'app';
  root.appendChild(app); // añade el contenedor principal al root

  updateDarkModeToggle(); // sincroniza el botón de tema con el estado actual
}

/**
 * Renderiza la vista activa según el usuario actual.
 * - Si no hay usuario autenticado, muestra el login.
 * - Si hay usuario, muestra el dashboard con proyectos.
 */
export async function render() {
  app.innerHTML = ''; // limpia el contenido actual antes de renderizar otra vista

  if (!state.currentUser) {
    renderLogin({ app, onLoginSuccess: handleLoginSuccess }); // renderiza login si no hay usuario
    logoutButton.classList.add('hidden'); // oculta el botón de logout
    return;
  }

  await renderDashboard({ app, renderProjectForm, renderDetails }); // muestra el dashboard si hay usuario
  logoutButton.classList.remove('hidden'); // muestra el botón de logout
}

/**
 * Crea el shell principal de la app si no existe.
 * El shell contiene el root para renderizar la SPA.
 */
function createAppShell() {
  const container = document.createElement('div'); // crea un contenedor raíz si no existía
  container.id = 'app-root';
  container.className = 'app-shell';
  document.body.appendChild(container); // lo agrega al body
  return container; // retorna el elemento creado
}

/**
 * Maneja el login exitoso:
 * - guarda el usuario en el estado global.
 * - persiste la sesión en localStorage.
 * - renderiza la interfaz de usuario actualizada.
 */
function handleLoginSuccess(user) {
  state.currentUser = user; // guarda el usuario autenticado en el estado global
  localStorage.setItem(sessionKey, JSON.stringify(user)); // persiste la sesión en el navegador
  render(); // renderiza la vista principal después del login
}

/**
 * Alterna el modo oscuro y guarda la preferencia en localStorage.
 */
export function toggleDarkMode() {
  const isDarkMode = document.documentElement.classList.toggle('dark-mode'); // cambia la clase de tema
  localStorage.setItem(darkModeKey, String(isDarkMode)); // guarda la preferencia en localStorage
  updateDarkModeToggle(); // actualiza el texto del botón de tema
}

/**
 * Actualiza el texto del botón de alternancia de tema
 * para indicar el estado actual (luna/sol).
 */
export function updateDarkModeToggle() {
  const isDarkMode = document.documentElement.classList.contains('dark-mode'); // comprueba si está activo el modo oscuro
  darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙'; // muestra icono según tema
}

/**
 * Cierra sesión del usuario actual y vuelve a mostrar la vista de login.
 */
function handleLogout() {
  localStorage.removeItem(sessionKey); // borra la sesión guardada
  state.currentUser = null; // limpia el usuario en el estado global
  render(); // vuelve a renderizar la vista de login
}
