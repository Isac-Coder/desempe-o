import { state, sessionKey, darkModeKey } from './state/index.js';
import { setupUI, render } from './ui/index.js';

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
