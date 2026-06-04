/**
 * Map de clases CSS para cada estado de proyecto.
 */
export const STATUS_CLASS_NAME = {
  'Planeado': 'planeado', // clase CSS para proyecto planeado
  'En progreso': 'progreso', // clase CSS para proyecto en progreso
  'Completado': 'completado' // clase CSS para proyecto completado
};

/**
 * Devuelve la clase CSS adecuada para el estado del proyecto.
 */
export function getStatusClass(status) {
  return STATUS_CLASS_NAME[status] || 'planeado'; // retorna clase según estado o 'planeado' por defecto
}

/**
 * Formatea una fecha ISO para mostrarla en formato local español.
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-ES'); // convierte fecha ISO a formato legible
}

/**
 * Crea un fragmento DOM a partir de markup HTML.
 * Permite construir vistas de forma declarativa.
 */
export function createFragment(html) {
  const template = document.createElement('template'); // crea un template invisible
  template.innerHTML = html.trim(); // asigna el HTML al template
  return template.content.cloneNode(true); // clona el contenido para usarlo en el DOM
}

/**
 * Crea un botón estilizado con un manejador de clic.
 */
export function createStyledButton(text, className, onClick) {
  const button = document.createElement('button'); // crea un botón HTML
  button.className = className; // asigna las clases CSS indicadas
  button.textContent = text; // asigna el texto del botón
  button.addEventListener('click', onClick); // agrega el manejador de clic
  return button; // devuelve el botón creado
}

/**
 * Limpia el contenido interno de un elemento DOM.
 */
export function clearElement(element) {
  element.innerHTML = ''; // borra todo el HTML dentro del elemento
}
