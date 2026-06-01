export const STATUS_CLASS_NAME = {
  'Planeado': 'planeado',
  'En progreso': 'progreso',
  'Completado': 'completado'
};

export function getStatusClass(status) {
  return STATUS_CLASS_NAME[status] || 'planeado';
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-ES');
}

export function createStyledButton(text, className, onClick) {
  const button = document.createElement('button');
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

export function clearElement(element) {
  element.innerHTML = '';
}
