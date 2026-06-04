/**
 * Muestra el formulario para crear o editar un proyecto.
 * - Si se recibe un proyecto, carga los datos para edición.
 * - Si no, inicializa un formulario en blanco para crear.
 */
import { state } from '../states/state.js';
import { createProject, updateProject } from '../api/api.js';
import { createStyledButton, createFragment } from '../utils/helpers.js';

export async function renderProjectForm({ app, project = null, onCancel, onSaved }) {
  app.innerHTML = ''; // limpia la vista actual antes de mostrar el formulario

  const view = createFragment(`
    <section class="card">
      <h2 id="formTitle">Nuevo proyecto</h2>
      <form id="projectForm" class="form-grid">
        <label>
          Nombre
          <input type="text" id="projectName" required />
        </label>
        <label>
          Descripción
          <textarea id="projectDescription" rows="4" required></textarea>
        </label>
        <label>
          Estado
          <select id="projectStatus" required>
            <option value="Planeado">Planeado</option>
            <option value="En progreso">En progreso</option>
            <option value="Completado">Completado</option>
          </select>
        </label>
        <label>
          Responsable
          <select id="projectResponsible" required>
            <option value="manager@test.com">Manager</option>
            <option value="collaborator@test.com">Collaborator</option>
          </select>
        </label>
        <div class="form-actions">
          <button type="submit" class="btn primary">Guardar proyecto</button>
          <button type="button" id="cancelForm" class="btn secondary">Cancelar</button>
        </div>
      </form>
      <div id="projectFormMessage" class="message"></div>
    </section>
  `); // genera el HTML del formulario de proyecto

  const form = view.querySelector('#projectForm'); // referencia al formulario de proyecto
  const message = view.querySelector('#projectFormMessage'); // área donde se muestra el mensaje de estado
  const title = view.querySelector('#formTitle'); // título dinámico del formulario
  const cancelButton = view.querySelector('#cancelForm'); // botón para cancelar edición/creación

  title.textContent = project ? 'Editar proyecto' : 'Nuevo proyecto'; // ajusta el título si se edita o crea

  if (project) {
    form.querySelector('#projectName').value = project.name; // carga el nombre del proyecto existente
    form.querySelector('#projectDescription').value = project.description; // carga la descripción existente
    form.querySelector('#projectStatus').value = project.status; // carga el estado existente
    form.querySelector('#projectResponsible').value = project.responsible; // carga el responsable existente
    state.editingProjectId = project.id; // marca el proyecto que se está editando
  } else {
    state.editingProjectId = null; // no se edita ningún proyecto
    form.reset(); // limpia el formulario para creación
  }

  cancelButton.addEventListener('click', onCancel); // cancela y vuelve al dashboard sin guardar

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // evita recargar la página al enviar el formulario
    message.textContent = ''; // limpia mensajes previos

    const projectData = {
      name: form.querySelector('#projectName').value.trim(), // lee el nombre ingresado
      description: form.querySelector('#projectDescription').value.trim(), // lee la descripción ingresada
      status: form.querySelector('#projectStatus').value, // lee el estado seleccionado
      responsible: form.querySelector('#projectResponsible').value, // lee el responsable seleccionado
      createdAt: project ? project.createdAt : new Date().toISOString() // conserva fecha si edita o crea nueva fecha
    };

    if (!projectData.name || !projectData.description) {
      message.textContent = 'Complete todos los campos.'; // valida campos obligatorios
      return;
    }

    try {
      if (state.editingProjectId) {
        await updateProject(state.editingProjectId, projectData); // actualiza el proyecto existente
      } else {
        await createProject(projectData); // crea un nuevo proyecto
      }
      onSaved(); // callback para recargar lista o volver al dashboard
    } catch (error) {
      console.error('Error guardando proyecto:', error); // muestra error en consola
      message.textContent = 'Ocurrió un error al guardar el proyecto.'; // mensaje visible al usuario
    }
  });

  app.appendChild(view); // agrega el formulario al contenedor principal
}
