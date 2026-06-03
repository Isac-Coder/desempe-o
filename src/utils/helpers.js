/**
 * Map de clases CSS para cada estado de proyecto.
 */
export const STATUS_CLASS_NAME = {
  'Planeado': 'planeado',
  'En progreso': 'progreso',
  'Completado': 'completado'
};

/**
 * Devuelve la clase CSS adecuada para el estado del proyecto.
 */
export function getStatusClass(status) {
  return STATUS_CLASS_NAME[status] || 'planeado';
}

/**
 * Formatea una fecha ISO para mostrarla en formato local español.
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-ES');
}

/**
 * Crea un fragmento DOM a partir de markup HTML.
 * Permite construir vistas de forma declarativa.
 */
export function createFragment(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.cloneNode(true);
}

/**
 * Crea un botón estilizado con un manejador de clic.
 */
export function createStyledButton(text, className, onClick) {
  const button = document.createElement('button');
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

/**
 * Limpia el contenido interno de un elemento DOM.
 */
export function clearElement(element) {
  element.innerHTML = '';
}
