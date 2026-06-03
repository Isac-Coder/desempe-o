/**
 * Inicializa la aplicación web.
 * - Restaura la sesión de usuario desde localStorage.
 * - Aplica el tema oscuro si estaba activado.
 * - Inicializa los valores de búsqueda y paginación.
 * - Configura la UI y renderiza la vista inicial.
 */
import { state, sessionKey, darkModeKey } from './states/state.js';
import { setupUI, render } from './ui/app.js';

function init() {
  const storedSession = localStorage.getItem(sessionKey);
  if (storedSession) {
    state.currentUser = JSON.parse(storedSession);
  }

  const isDarkMode = localStorage.getItem(darkModeKey) === 'true';
  if (isDarkMode) {
    document.documentElement.classList.add('dark-mode');
  }

  state.searchQuery = '';
  state.statusFilter = '';
  state.currentPage = 1;

  setupUI();
  render();
}

init();
