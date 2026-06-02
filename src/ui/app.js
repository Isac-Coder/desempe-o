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

function createAppShell() {
  const container = document.createElement('div');
  container.id = 'app-root';
  container.className = 'app-shell';
  document.body.appendChild(container);
  return container;
}

function handleLoginSuccess(user) {
  state.currentUser = user;
  localStorage.setItem(sessionKey, JSON.stringify(user));
  render();
}

export function toggleDarkMode() {
  const isDarkMode = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem(darkModeKey, String(isDarkMode));
  updateDarkModeToggle();
}

export function updateDarkModeToggle() {
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function handleLogout() {
  localStorage.removeItem(sessionKey);
  state.currentUser = null;
  render();
}
