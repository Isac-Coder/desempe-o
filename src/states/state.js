/**
 * Configuración principal del entorno local.
 */
export const API_URL = 'http://localhost:3000'; // URL base del servidor JSON
export const sessionKey = 'simulacroSession'; // clave de localStorage para sesión
export const darkModeKey = 'darkMode'; // clave de localStorage para tema oscuro

/**
 * Estado global compartido por la aplicación.
 * - currentUser: usuario autenticado en sesión.
 * - editingProjectId: id del proyecto en edición.
 * - searchQuery/statusFilter/currentPage/itemsPerPage: filtros y paginación.
 * - allProjects: lista completa de proyectos cargada desde el backend.
 */
export const state = {
  currentUser: null, // almacena el usuario autenticado
  editingProjectId: null, // id del proyecto que se está editando
  searchQuery: '', // término de búsqueda actual
  statusFilter: '', // filtro de estado seleccionado
  currentPage: 1, // página actual en la paginación
  itemsPerPage: 6, // cantidad de proyectos por página
  allProjects: [] // lista de proyectos cargada desde la API
};
