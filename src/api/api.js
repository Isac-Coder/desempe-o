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
    const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`); // consulta a la API usando email y contraseña
    const users = await response.json(); // convierte la respuesta JSON en un arreglo de usuarios
    return users.length ? users[0] : null; // devuelve el primer usuario si existe, de lo contrario null
  } catch (error) {
    console.error('Error autenticando usuario:', error); // muestra error en consola si falla la petición
    return null; // retorna null para indicar fallo en la autenticación
  }
}

/**
 * Recupera proyectos según el rol del usuario.
 * - MANAGER: obtiene todos los proyectos.
 * - COLLABORATOR: obtiene los proyectos donde es responsable.
 */
export async function getProjects(role, email) {
  const url = role === 'MANAGER'
    ? `${API_URL}/projects?_sort=id&_order=desc` // URL para manager: todos los proyectos ordenados por id descendente
    : `${API_URL}/projects?responsible=${encodeURIComponent(email)}&_sort=id&_order=desc`; // URL para colaborador: proyectos propios ordenados

  const response = await fetch(url); // petición GET a la API
  return response.json(); // devuelve el JSON con la lista de proyectos
}

/**
 * Crea un nuevo proyecto en el backend.
 */
export async function createProject(projectData) {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST', // utiliza POST para crear un recurso
    headers: { 'Content-Type': 'application/json' }, // informa que el cuerpo es JSON
    body: JSON.stringify(projectData) // serializa los datos del proyecto
  });
  return response.json(); // devuelve el proyecto recién creado
}

/**
 * Actualiza campos de un proyecto existente.
 */
export async function updateProject(projectId, projectData) {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PATCH', // utiliza PATCH para actualizar campos específicos
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData) // envía los datos actualizados
  });
  return response.json(); // devuelve el proyecto actualizado
}

/**
 * Elimina un proyecto por su ID.
 */
export async function deleteProject(projectId) {
  return fetch(`${API_URL}/projects/${projectId}`, {
    method: 'DELETE' // elimina el recurso indicado por el ID
  });
}
