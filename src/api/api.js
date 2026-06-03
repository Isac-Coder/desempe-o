/**
 * URL base del servidor JSON para la API local.
 */
import { API_URL } from '../states/state.js';

/**
 * Autentica las credenciales del usuario en el servidor.
 * Devuelve el usuario existente o null si no coincide.
 */
export async function authenticate(email, password) {
  try {
    const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    const users = await response.json();
    return users.length ? users[0] : null;
  } catch (error) {
    console.error('Error autenticando usuario:', error);
    return null;
  }
}

/**
 * Recupera proyectos según el rol del usuario.
 * - MANAGER: obtiene todos los proyectos.
 * - COLLABORATOR: obtiene los proyectos donde es responsable.
 */
export async function getProjects(role, email) {
  const url = role === 'MANAGER'
    ? `${API_URL}/projects?_sort=id&_order=desc`
    : `${API_URL}/projects?responsible=${encodeURIComponent(email)}&_sort=id&_order=desc`;

  const response = await fetch(url);
  return response.json();
}

/**
 * Crea un nuevo proyecto en el backend.
 */
export async function createProject(projectData) {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  return response.json();
}

/**
 * Actualiza campos de un proyecto existente.
 */
export async function updateProject(projectId, projectData) {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  return response.json();
}

/**
 * Elimina un proyecto por su ID.
 */
export async function deleteProject(projectId) {
  return fetch(`${API_URL}/projects/${projectId}`, {
    method: 'DELETE'
  });
}
