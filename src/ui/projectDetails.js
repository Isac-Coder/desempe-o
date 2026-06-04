import { createFragment } from '../utils/helpers.js';

/**
 * Muestra la pantalla de detalle de un proyecto.
 * Recibe el proyecto seleccionado y un callback para regresar al dashboard.
 */
export function renderDetails({ app, project, onBack }) {
  app.innerHTML = ''; // limpia el contenido actual antes de mostrar los detalles

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
  `); // genera el DOM para los detalles del proyecto

  view.querySelector('#detailName').textContent = project.name; // coloca el nombre del proyecto
  view.querySelector('#detailDescription').textContent = project.description; // coloca la descripción
  view.querySelector('#detailStatus').textContent = project.status; // coloca el estado actual
  view.querySelector('#detailResponsible').textContent = project.responsible; // coloca el responsable
  view.querySelector('#detailCreated').textContent = new Date(project.createdAt).toLocaleString(); // formatea la fecha de creación
  view.querySelector('#backToList').addEventListener('click', onBack); // vuelve al dashboard cuando se hace clic

  app.appendChild(view); // agrega la vista de detalles al contenedor principal
}
