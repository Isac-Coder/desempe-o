import { createFragment } from '../utils/helpers.js';

/**
 * Muestra la pantalla de detalle de un proyecto.
 * Recibe el proyecto seleccionado y un callback para regresar al dashboard.
 */
export function renderDetails({ app, project, onBack }) {
  app.innerHTML = '';

  const view = createFragment(`
    <section class="card">
      <h2>Detalle del proyecto</h2>
      <div class="details-grid">
        <p><strong>Nombre:</strong> <span id="detailName"></span></p>
        <p><strong>Descripción:</strong> <span id="detailDescription"></span></p>
        <p><strong>Estado:</strong> <span id="detailStatus"></span></p>
        <p><strong>Responsable:</strong> <span id="detailResponsible"></span></p>
        <p><strong>Creado:</strong> <span id="detailCreated"></span></p>
      </div>
      <div class="form-actions">
        <button id="backToList" class="btn secondary">Volver a proyectos</button>
      </div>
    </section>
  `);

  view.querySelector('#detailName').textContent = project.name;
  view.querySelector('#detailDescription').textContent = project.description;
  view.querySelector('#detailStatus').textContent = project.status;
  view.querySelector('#detailResponsible').textContent = project.responsible;
  view.querySelector('#detailCreated').textContent = new Date(project.createdAt).toLocaleString();
  view.querySelector('#backToList').addEventListener('click', onBack);

  app.appendChild(view);
}
