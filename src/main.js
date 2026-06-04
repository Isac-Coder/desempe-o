/**
 * Inicializa la aplicación web.
 * - Restaura la sesión de usuario desde localStorage.
 * - Aplica el tema oscuro si estaba activado.
 * - Inicializa los valores de búsqueda y paginación.
 * - Configura la UI y renderiza la vista inicial.
 */
import { state, sessionKey, darkModeKey } from './states/state.js'; // importa estado y claves de configuración
import { setupUI, render } from './ui/app.js'; // importa funciones de UI principales

function init() {
  const storedSession = localStorage.getItem(sessionKey); // lee la sesión guardada en localStorage
  if (storedSession) {
    state.currentUser = JSON.parse(storedSession); // restaura el usuario autenticado
  }

  const isDarkMode = localStorage.getItem(darkModeKey) === 'true'; // lee la preferencia de tema
  if (isDarkMode) {
    document.documentElement.classList.add('dark-mode'); // aplica modo oscuro si estaba activado
  }

  state.searchQuery = ''; // inicializa búsqueda vacía
  state.statusFilter = ''; // inicializa filtro de estado vacío
  state.currentPage = 1; // inicia en la primera página

  setupUI(); // configura la interfaz general
  render(); // renderiza la vista inicial según el estado
}

init(); // ejecuta la inicialización
