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

let app;
let logoutButton;
let darkModeToggle;
let root;

/**
 * Crea la estructura estática de la aplicación.
 * - Crea el contenedor raíz si no existe.
 * - Construye el header y los botones de tema y logout.
 * - Deja listo el elemento <main> para renderizar la vista activa.
 */
export function setupUI() {
  root = document.getElementById('app-root') || createAppShell();
  root.innerHTML = '';

  const header = document.createElement('header');
  const title = document.createElement('h1');
  title.textContent = 'Gestión de Proyectos Internos';

  const headerActions = document.createElement('div');
  headerActions.style.display = 'flex';
  headerActions.style.gap = '16px';
  headerActions.style.alignItems = 'center';

  darkModeToggle = document.createElement('button');
  darkModeToggle.id = 'darkModeToggle';
  darkModeToggle.className = 'btn secondary';
  darkModeToggle.title = 'Cambiar tema';
  darkModeToggle.addEventListener('click', toggleDarkMode);

  logoutButton = document.createElement('button');
  logoutButton.id = 'logoutButton';
  logoutButton.className = 'btn secondary hidden';
  logoutButton.textContent = 'Cerrar sesión';
  logoutButton.addEventListener('click', handleLogout);

  headerActions.append(darkModeToggle, logoutButton);
  header.append(title, headerActions);

  root.appendChild(header);

  app = document.createElement('main');
  app.id = 'app';
  root.appendChild(app);

  updateDarkModeToggle();
}

/**
 * Renderiza la vista activa según el usuario actual.
 * - Si no hay usuario autenticado, muestra el login.
 * - Si hay usuario, muestra el dashboard con proyectos.
 */
export async function render() {
  app.innerHTML = '';

  if (!state.currentUser) {
    renderLogin({ app, onLoginSuccess: handleLoginSuccess });
    logoutButton.classList.add('hidden');
    return;
  }

  await renderDashboard({ app, renderProjectForm, renderDetails });
  logoutButton.classList.remove('hidden');
}

/**
 * Crea el shell principal de la app si no existe.
 * El shell contiene el root para renderizar la SPA.
 */
function createAppShell() {
  const container = document.createElement('div');
  container.id = 'app-root';
  container.className = 'app-shell';
  document.body.appendChild(container);
  return container;
}

/**
 * Maneja el login exitoso:
 * - guarda el usuario en el estado global.
 * - persiste la sesión en localStorage.
 * - renderiza la interfaz de usuario actualizada.
 */
function handleLoginSuccess(user) {
  state.currentUser = user;
  localStorage.setItem(sessionKey, JSON.stringify(user));
  render();
}

/**
 * Alterna el modo oscuro y guarda la preferencia en localStorage.
 */
export function toggleDarkMode() {
  const isDarkMode = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem(darkModeKey, String(isDarkMode));
  updateDarkModeToggle();
}

/**
 * Actualiza el texto del botón de alternancia de tema
 * para indicar el estado actual (luna/sol).
 */
export function updateDarkModeToggle() {
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

/**
 * Cierra sesión del usuario actual y vuelve a mostrar la vista de login.
 */
function handleLogout() {
  localStorage.removeItem(sessionKey);
  state.currentUser = null;
  render();
}
