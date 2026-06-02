import { state } from '../states/state.js';
import { createProject, updateProject } from '../api/api.js';
import { createStyledButton, createFragment } from '../utils/helpers.js';

export async function renderProjectForm({ app, project = null, onCancel, onSaved }) {
  app.innerHTML = '';

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
            <option value="manager@empresa.com">Manager</option>
            <option value="collaborator@empresa.com">Collaborator</option>
          </select>
        </label>
        <div class="form-actions">
          <button type="submit" class="btn primary">Guardar proyecto</button>
          <button type="button" id="cancelForm" class="btn secondary">Cancelar</button>
        </div>
      </form>
      <div id="projectFormMessage" class="message"></div>
    </section>
  `);

  const form = view.querySelector('#projectForm');
  const message = view.querySelector('#projectFormMessage');
  const title = view.querySelector('#formTitle');
  const cancelButton = view.querySelector('#cancelForm');

  title.textContent = project ? 'Editar proyecto' : 'Nuevo proyecto';
  if (project) {
    form.querySelector('#projectName').value = project.name;
    form.querySelector('#projectDescription').value = project.description;
    form.querySelector('#projectStatus').value = project.status;
    form.querySelector('#projectResponsible').value = project.responsible;
    state.editingProjectId = project.id;
  } else {
    state.editingProjectId = null;
    form.reset();
  }

  cancelButton.addEventListener('click', onCancel);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';

    const projectData = {
      name: form.querySelector('#projectName').value.trim(),
      description: form.querySelector('#projectDescription').value.trim(),
      status: form.querySelector('#projectStatus').value,
      responsible: form.querySelector('#projectResponsible').value,
      createdAt: project ? project.createdAt : new Date().toISOString()
    };

    if (!projectData.name || !projectData.description) {
      message.textContent = 'Complete todos los campos.';
      return;
    }

    try {
      if (state.editingProjectId) {
        await updateProject(state.editingProjectId, projectData);
      } else {
        await createProject(projectData);
      }
      onSaved();
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      message.textContent = 'Ocurrió un error al guardar el proyecto.';
    }
  });

  app.appendChild(view);
}
