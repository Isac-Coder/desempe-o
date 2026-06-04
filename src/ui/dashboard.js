/**
 * Dashboard principal de la aplicación.
 * Muestra proyectos, filtros, paginación y acciones según el rol de usuario.
 */
import { state } from '../states/state.js';
import { getProjects, createProject, updateProject, deleteProject } from '../api/api.js';
import { getStatusClass, formatDate, createStyledButton, clearElement, createFragment } from '../utils/helpers.js';

export async function renderDashboard({ app, renderProjectForm, renderDetails }) {
  app.innerHTML = ''; // limpia la vista anterior antes de renderizar el dashboard

  const view = createFragment(`
    <section class="toolbar">
      <div>
        <p id="userBadge"></p>
        <p id="roleBadge"></p>
      </div>
      <div id="dashboardActions"></div>
    </section>
    <section class="filters-container">
      <div class="search-box">
        <input
          type="text"
          id="searchInput"
          placeholder="🔍 Buscar proyectos por nombre..."
          style="width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px;"
        />
      </div>
      <div class="filter-controls">
        <select id="statusFilter" style="padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--card); font-size: 14px;">
          <option value="">Todos los estados</option>
          <option value="Planeado">Planeado</option>
          <option value="En progreso">En progreso</option>
          <option value="Completado">Completado</option>
        </select>
      </div>
    </section>
    <section id="projectList"></section>
    <section id="pagination"></section>
  `); // crea el DOM básico del dashboard con filtros y lista

  const userBadge = view.querySelector('#userBadge'); // muestra nombre de usuario
  const roleBadge = view.querySelector('#roleBadge'); // muestra rol de usuario
  const dashboardActions = view.querySelector('#dashboardActions'); // contenedor para botones de acción
  const projectList = view.querySelector('#projectList'); // contenedor para lista de proyectos
  const searchInput = view.querySelector('#searchInput'); // input para búsqueda de texto
  const statusFilter = view.querySelector('#statusFilter'); // selector de estados
  const pagination = view.querySelector('#pagination'); // contenedor de paginación

  userBadge.textContent = `Usuario: ${state.currentUser.name} (${state.currentUser.email})`; // muestra datos del usuario
  roleBadge.textContent = `Rol: ${state.currentUser.role}`; // muestra rol actual
  searchInput.value = state.searchQuery; // restaura búsqueda previa
  statusFilter.value = state.statusFilter; // restaura filtro de estado previo

  if (state.currentUser.role === 'MANAGER') {
    const createButton = createStyledButton('Crear proyecto', 'btn primary', () => {
      renderProjectForm({
        app,
        project: null,
        onSaved: () => renderDashboard({ app, renderProjectForm, renderDetails }),
        onCancel: () => renderDashboard({ app, renderProjectForm, renderDetails })
      }); // abre formulario para crear proyecto
    });
    dashboardActions.appendChild(createButton); // agrega botón de creación para manager
  }

  const refreshButton = createStyledButton('Actualizar proyectos', 'btn secondary', () => {
    state.currentPage = 1; // reinicia la paginación al recargar
    loadProjects(projectList, pagination, { app, renderProjectForm, renderDetails }); // recarga proyectos
  });
  dashboardActions.appendChild(refreshButton); // agrega botón de recarga

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase(); // actualiza término de búsqueda
    state.currentPage = 1; // vuelve a la primera página tras cambiar el filtro
    loadProjects(projectList, pagination, { app, renderProjectForm, renderDetails }); // recarga la lista filtrada
  });

  statusFilter.addEventListener('change', (e) => {
    state.statusFilter = e.target.value; // actualiza filtro de estado
    state.currentPage = 1; // resetea paginación al cambiar estado
    loadProjects(projectList, pagination, { app, renderProjectForm, renderDetails });
  });

  app.appendChild(view); // agrega el dashboard al contenedor principal

  await loadProjects(projectList, pagination, { app, renderProjectForm, renderDetails }); // carga los proyectos desde API
}

/**
 * Carga la lista de proyectos desde la API y aplica filtros locales.
 */
async function loadProjects(container, paginationContainer, callbacks) {
  container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--muted);">Cargando proyectos...</p>'; // muestra mensaje de carga

  try {
    state.allProjects = await getProjects(state.currentUser.role, state.currentUser.email); // obtiene proyectos desde la API
    let projects = state.allProjects; // usa la lista completa como base

    if (state.searchQuery) {
      projects = projects.filter((project) =>
        project.name.toLowerCase().includes(state.searchQuery) ||
        project.description.toLowerCase().includes(state.searchQuery)
      ); // filtra por nombre o descripción
    }

    if (state.statusFilter) {
      projects = projects.filter((project) => project.status === state.statusFilter); // filtra por estado seleccionado
    }

    if (!projects.length) {
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--muted);">No hay proyectos disponibles.</p>'; // muestra mensaje cuando no hay proyectos
      paginationContainer.innerHTML = ''; // limpia paginación si no hay resultados
      return;
    }

    const totalPages = Math.ceil(projects.length / state.itemsPerPage); // calcula cantidad de páginas
    const startIndex = (state.currentPage - 1) * state.itemsPerPage; // índice de inicio para la página actual
    const pageItems = projects.slice(startIndex, startIndex + state.itemsPerPage); // proyectos de la página actual

    renderProjectCards(container, pageItems, paginationContainer, totalPages, callbacks); // renderiza tarjetas de proyectos
  } catch (error) {
    console.error('Error cargando proyectos:', error); // registra error en consola
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--danger);">Error al cargar proyectos. Intente nuevamente.</p>'; // muestra mensaje de error al usuario
  }
}

/**
 * Renderiza las tarjetas de proyecto y las acciones disponibles.
 */
function renderProjectCards(container, projects, paginationContainer, totalPages, { app, renderProjectForm, renderDetails }) {
  clearElement(container); // limpia el contenedor de proyectos

  const grid = document.createElement('div'); // contenedor en cuadrícula para las tarjetas
  grid.className = 'projects-grid';

  projects.forEach((project) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${project.name}</h3>
      <p class="project-description">${project.description}</p>
      <div class="project-meta">
        <span class="status-badge ${getStatusClass(project.status)}">${project.status}</span>
        <span>${formatDate(project.createdAt)}</span>
      </div>
      <p><strong style="color: var(--muted); font-size: 12px;">Responsable:</strong> <span style="font-size: 13px;">${project.responsible}</span></p>
    `; // crea la estructura HTML de la tarjeta de proyecto

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'project-actions'; // contenedor para botones de acción

    actionsDiv.appendChild(createStyledButton('👁️ Detalle', 'btn secondary', () => renderDetails({ app, project, onBack: () => renderDashboard({ app, renderProjectForm, renderDetails }) }))); // botón para ver detalles

    if (state.currentUser.role === 'MANAGER') {
      actionsDiv.appendChild(createStyledButton('✏️ Editar', 'btn secondary', () => renderProjectForm({
        app,
        project,
        onSaved: () => renderDashboard({ app, renderProjectForm, renderDetails }),
        onCancel: () => renderDashboard({ app, renderProjectForm, renderDetails })
      }))); // botón para editar proyecto
      actionsDiv.appendChild(createStyledButton('🗑️ Eliminar', 'btn danger', () => handleDelete(project.id, container, paginationContainer, { app, renderProjectForm, renderDetails }))); // botón para eliminar proyecto
    }

    if (state.currentUser.role === 'COLLABORATOR' && project.responsible === state.currentUser.email) {
      const statusWrapper = document.createElement('div');
      statusWrapper.style.display = 'flex';
      statusWrapper.style.gap = '8px';
      statusWrapper.style.alignItems = 'center';

      const label = document.createElement('label');
      label.textContent = 'Estado:'; // etiqueta para selector de estado
      label.style.fontSize = '12px';
      label.style.fontWeight = '600';
      label.style.color = 'var(--muted)';
      statusWrapper.appendChild(label);

      const statusSelect = document.createElement('select'); // select para cambiar estado manualmente
      statusSelect.style.flex = '1';
      ['Planeado', 'En progreso', 'Completado'].forEach((status) => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (project.status === status) option.selected = true; // marca el estado actual
        statusSelect.appendChild(option);
      });
      statusSelect.addEventListener('change', () => handleStatusUpdate(project.id, statusSelect.value, container, paginationContainer, { app, renderProjectForm, renderDetails })); // actualiza el estado del proyecto
      statusWrapper.appendChild(statusSelect);
      actionsDiv.appendChild(statusWrapper); // añade selector de estado a las acciones
    }

    card.appendChild(actionsDiv); // añade los botones de acción a la tarjeta
    grid.appendChild(card); // añade la tarjeta al grid
  });

  container.appendChild(grid); // inserta el grid completo en el DOM
  renderPagination(paginationContainer, totalPages, projects.length, { app, renderProjectForm, renderDetails }); // renderiza la paginación
}

/**
 * Renderiza los controles de paginación y navegación.
 */
function renderPagination(container, totalPages, totalItems, callbacks) {
  clearElement(container); // limpia el contenedor de paginación

  if (totalPages <= 1) return; // no muestra paginación si solo hay una página

  const info = document.createElement('div');
  info.className = 'pagination-info';
  info.textContent = `Mostrando ${(state.currentPage - 1) * state.itemsPerPage + 1} - ${Math.min(state.currentPage * state.itemsPerPage, totalItems)} de ${totalItems} proyectos`; // texto con rango de ítems
  container.appendChild(info);

  const prevBtn = createStyledButton('← Anterior', 'pagination-btn', () => changePage(state.currentPage - 1, container, callbacks)); // botón anterior
  prevBtn.disabled = state.currentPage === 1; // deshabilita si ya está en la primera página
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i += 1) {
    const pageBtn = createStyledButton(String(i), 'pagination-btn', () => changePage(i, container, callbacks)); // botón para cada número de página
    if (i === state.currentPage) pageBtn.classList.add('active'); // destaca la página actual
    container.appendChild(pageBtn);
  }

  const nextBtn = createStyledButton('Siguiente →', 'pagination-btn', () => changePage(state.currentPage + 1, container, callbacks)); // botón siguiente
  nextBtn.disabled = state.currentPage === totalPages; // deshabilita si está en la última página
  container.appendChild(nextBtn);
}

/**
 * Cambia la página actual y vuelve a cargar los proyectos con la nueva página.
 */
function changePage(page, paginationContainer, callbacks) {
  state.currentPage = page; // actualiza la página en el estado
  const projectList = document.querySelector('#projectList'); // referencia a la lista de proyectos en DOM
  const pagination = paginationContainer || document.querySelector('#pagination'); // usa el contenedor de paginación actual
  loadProjects(projectList, pagination, callbacks); // recarga la lista con la nueva página
}

/**
 * Elimina un proyecto y actualiza la lista tras la acción.
 */
async function handleDelete(projectId, container, paginationContainer, callbacks) {
  const confirmed = confirm('¿Desea eliminar este proyecto?'); // pregunta de confirmación al usuario
  if (!confirmed) return; // si el usuario cancela, no hace nada

  await deleteProject(projectId); // elimina el proyecto en el backend
  state.currentPage = 1; // vuelve a la primera página tras eliminar
  await loadProjects(container, paginationContainer, callbacks); // recarga la lista actualizada
}

/**
 * Cambia el estado de un proyecto y recarga la lista.
 */
async function handleStatusUpdate(projectId, status, container, paginationContainer, callbacks) {
  await updateProject(projectId, { status }); // actualiza solo el campo de estado
  await loadProjects(container, paginationContainer, callbacks); // recarga la lista con el cambio de estado
}
