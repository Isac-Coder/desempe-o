/**
 * Configuración principal del entorno local.
 */
export const API_URL = 'http://localhost:3000';
export const sessionKey = 'simulacroSession';
export const darkModeKey = 'darkMode';

/**
 * Estado global compartido por la aplicación.
 * - currentUser: usuario autenticado en sesión.
 * - editingProjectId: id del proyecto en edición.
 * - searchQuery/statusFilter/currentPage/itemsPerPage: filtros y paginación.
 * - allProjects: lista completa de proyectos cargada desde el backend.
 */
export const state = {
  currentUser: null,
  editingProjectId: null,
  searchQuery: '',
  statusFilter: '',
  currentPage: 1,
  itemsPerPage: 6,
  allProjects: []
};
