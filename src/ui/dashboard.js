import { state } from '../states/state.js';
import { getProjects, createProject, updateProject, deleteProject } from '../api/api.js';
import { getStatusClass, formatDate, createStyledButton, clearElement, createFragment } from '../utils/helpers.js';

export async function renderDashboard({ app, renderProjectForm, renderDetails }) {
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
  `);

  const userBadge = view.querySelector('#userBadge');
  const roleBadge = view.querySelector('#roleBadge');
  const dashboardActions = view.querySelector('#dashboardActions');
  const projectList = view.querySelector('#projectList');
  const searchInput = view.querySelector('#searchInput');
  const statusFilter = view.querySelector('#statusFilter');
  const pagination = view.querySelector('#pagination');

  userBadge.textContent = `Usuario: ${state.currentUser.name} (${state.currentUser.email})`;
  roleBadge.textContent = `Rol: ${state.currentUser.role}`;
  searchInput.value = state.searchQuery;
  statusFilter.value = state.statusFilter;

  if (state.currentUser.role === 'MANAGER') {
    const createButton = createStyledButton('Crear proyecto', 'btn primary', () => {
      renderProjectForm({
        app,
        project: null,
        onSaved: () => renderDashboard({ app, renderProjectForm, renderDetails }),
        onCancel: () => renderDashboard({ app, renderProjectForm, renderDetails })
      });
    });
    dashboardActions.appendChild(createButton);
  }

  const refreshButton = createStyledButton('Actualizar proyectos', 'btn secondary', () => {
    state.currentPage = 1;
    loadProjects(projectList, pagination, { app, renderProjectForm, renderDetails });
  });
  dashboardActions.appendChild(refreshButton);

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    state.currentPage = 1;
    loadProjects(projectList, pagination, { app, renderProjectForm, renderDetails });
  });

  statusFilter.addEventListener('change', (e) => {
    state.statusFilter = e.target.value;
    state.currentPage = 1;
    loadProjects(projectList, pagination, { app, renderProjectForm, renderDetails });
  });

  app.appendChild(view);
  await loadProjects(projectList, pagination, { app, renderProjectForm, renderDetails });
}

async function loadProjects(container, paginationContainer, callbacks) {
  container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--muted);">Cargando proyectos...</p>';

  try {
    state.allProjects = await getProjects(state.currentUser.role, state.currentUser.email);
    let projects = state.allProjects;

    if (state.searchQuery) {
      projects = projects.filter((project) =>
        project.name.toLowerCase().includes(state.searchQuery) ||
        project.description.toLowerCase().includes(state.searchQuery)
      );
    }

    if (state.statusFilter) {
      projects = projects.filter((project) => project.status === state.statusFilter);
    }

    if (!projects.length) {
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--muted);">No hay proyectos disponibles.</p>';
      paginationContainer.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(projects.length / state.itemsPerPage);
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const pageItems = projects.slice(startIndex, startIndex + state.itemsPerPage);

    renderProjectCards(container, pageItems, paginationContainer, totalPages, callbacks);
  } catch (error) {
    console.error('Error cargando proyectos:', error);
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--danger);">Error al cargar proyectos. Intente nuevamente.</p>';
  }
}

function renderProjectCards(container, projects, paginationContainer, totalPages, { app, renderProjectForm, renderDetails }) {
  clearElement(container);

  const grid = document.createElement('div');
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
    `;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'project-actions';

    actionsDiv.appendChild(createStyledButton('👁️ Detalle', 'btn secondary', () => renderDetails({ app, project, onBack: () => renderDashboard({ app, renderProjectForm, renderDetails }) })));

    if (state.currentUser.role === 'MANAGER') {
      actionsDiv.appendChild(createStyledButton('✏️ Editar', 'btn secondary', () => renderProjectForm({
        app,
        project,
        onSaved: () => renderDashboard({ app, renderProjectForm, renderDetails }),
        onCancel: () => renderDashboard({ app, renderProjectForm, renderDetails })
      })));
      actionsDiv.appendChild(createStyledButton('🗑️ Eliminar', 'btn danger', () => handleDelete(project.id, container, paginationContainer, { app, renderProjectForm, renderDetails })));
    }

    if (state.currentUser.role === 'COLLABORATOR' && project.responsible === state.currentUser.email) {
      const statusWrapper = document.createElement('div');
      statusWrapper.style.display = 'flex';
      statusWrapper.style.gap = '8px';
      statusWrapper.style.alignItems = 'center';

      const label = document.createElement('label');
      label.textContent = 'Estado:';
      label.style.fontSize = '12px';
      label.style.fontWeight = '600';
      label.style.color = 'var(--muted)';
      statusWrapper.appendChild(label);

      const statusSelect = document.createElement('select');
      statusSelect.style.flex = '1';
      ['Planeado', 'En progreso', 'Completado'].forEach((status) => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (project.status === status) option.selected = true;
        statusSelect.appendChild(option);
      });
      statusSelect.addEventListener('change', () => handleStatusUpdate(project.id, statusSelect.value, container, paginationContainer, { app, renderProjectForm, renderDetails }));
      statusWrapper.appendChild(statusSelect);
      actionsDiv.appendChild(statusWrapper);
    }

    card.appendChild(actionsDiv);
    grid.appendChild(card);
  });

  container.appendChild(grid);
  renderPagination(paginationContainer, totalPages, projects.length, { app, renderProjectForm, renderDetails });
}

function renderPagination(container, totalPages, totalItems, callbacks) {
  clearElement(container);

  if (totalPages <= 1) return;

  const info = document.createElement('div');
  info.className = 'pagination-info';
  info.textContent = `Mostrando ${(state.currentPage - 1) * state.itemsPerPage + 1} - ${Math.min(state.currentPage * state.itemsPerPage, totalItems)} de ${totalItems} proyectos`;
  container.appendChild(info);

  const prevBtn = createStyledButton('← Anterior', 'pagination-btn', () => changePage(state.currentPage - 1, container, callbacks));
  prevBtn.disabled = state.currentPage === 1;
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i += 1) {
    const pageBtn = createStyledButton(String(i), 'pagination-btn', () => changePage(i, container, callbacks));
    if (i === state.currentPage) pageBtn.classList.add('active');
    container.appendChild(pageBtn);
  }

  const nextBtn = createStyledButton('Siguiente →', 'pagination-btn', () => changePage(state.currentPage + 1, container, callbacks));
  nextBtn.disabled = state.currentPage === totalPages;
  container.appendChild(nextBtn);
}

function changePage(page, paginationContainer, callbacks) {
  state.currentPage = page;
  const projectList = document.querySelector('#projectList');
  const pagination = paginationContainer || document.querySelector('#pagination');
  loadProjects(projectList, pagination, callbacks);
}

async function handleDelete(projectId, container, paginationContainer, callbacks) {
  const confirmed = confirm('¿Desea eliminar este proyecto?');
  if (!confirmed) return;

  await deleteProject(projectId);
  state.currentPage = 1;
  await loadProjects(container, paginationContainer, callbacks);
}

async function handleStatusUpdate(projectId, status, container, paginationContainer, callbacks) {
  await updateProject(projectId, { status });
  await loadProjects(container, paginationContainer, callbacks);
}
