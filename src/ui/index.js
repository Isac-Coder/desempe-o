import { state, sessionKey, darkModeKey } from '../state/index.js';
import { authenticate, getProjects, createProject, updateProject, deleteProject } from '../api/index.js';
import { getStatusClass, formatDate, createStyledButton, clearElement } from '../utils/helpers.js';

const app = document.getElementById('app');
const logoutButton = document.getElementById('logoutButton');
const darkModeToggle = document.getElementById('darkModeToggle');
const loginTemplate = document.getElementById('loginView');
const dashboardTemplate = document.getElementById('dashboardView');
const projectFormTemplate = document.getElementById('projectFormView');
const detailsTemplate = document.getElementById('detailsView');

export function setupUI() {
  logoutButton.addEventListener('click', handleLogout);
  darkModeToggle.addEventListener('click', toggleDarkMode);
  updateDarkModeToggle();
}

export async function render() {
  app.innerHTML = '';

  if (!state.currentUser) {
    renderLogin();
    logoutButton.classList.add('hidden');
    return;
  }

  renderDashboard();
  logoutButton.classList.remove('hidden');
}

function renderLogin() {
  const view = loginTemplate.content.cloneNode(true);
  const form = view.querySelector('#loginForm');
  const message = view.querySelector('#loginMessage');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';

    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value.trim();

    if (!email || !password) {
      message.textContent = 'Ingrese correo y contraseña.';
      return;
    }

    const user = await authenticate(email, password);
    if (!user) {
      message.textContent = 'Credenciales inválidas. Intente nuevamente.';
      return;
    }

    state.currentUser = user;
    localStorage.setItem(sessionKey, JSON.stringify(user));
    await render();
  });

  app.appendChild(view);
}

async function renderDashboard() {
  const view = dashboardTemplate.content.cloneNode(true);
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
    const createButton = createStyledButton('Crear proyecto', 'btn primary', () => renderProjectForm());
    dashboardActions.appendChild(createButton);
  }

  const refreshButton = createStyledButton('Actualizar proyectos', 'btn secondary', () => {
    state.currentPage = 1;
    loadProjects(projectList, pagination);
  });
  dashboardActions.appendChild(refreshButton);

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    state.currentPage = 1;
    loadProjects(projectList, pagination);
  });

  statusFilter.addEventListener('change', (e) => {
    state.statusFilter = e.target.value;
    state.currentPage = 1;
    loadProjects(projectList, pagination);
  });

  app.appendChild(view);
  await loadProjects(projectList, pagination);
}

async function loadProjects(container, paginationContainer) {
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

    renderProjectCards(container, pageItems, paginationContainer, totalPages);
  } catch (error) {
    console.error('Error cargando proyectos:', error);
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--danger);">Error al cargar proyectos. Intente nuevamente.</p>';
  }
}

function renderProjectCards(container, projects, paginationContainer, totalPages) {
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

    actionsDiv.appendChild(createStyledButton('👁️ Detalle', 'btn secondary', () => renderDetails(project)));

    if (state.currentUser.role === 'MANAGER') {
      actionsDiv.appendChild(createStyledButton('✏️ Editar', 'btn secondary', () => renderProjectForm(project)));
      actionsDiv.appendChild(createStyledButton('🗑️ Eliminar', 'btn danger', () => handleDelete(project.id, container, paginationContainer)));
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
      statusSelect.addEventListener('change', () => handleStatusUpdate(project.id, statusSelect.value, container, paginationContainer));
      statusWrapper.appendChild(statusSelect);
      actionsDiv.appendChild(statusWrapper);
    }

    card.appendChild(actionsDiv);
    grid.appendChild(card);
  });

  container.appendChild(grid);
  renderPagination(paginationContainer, totalPages, projects.length);
}

function renderPagination(container, totalPages, totalItems) {
  clearElement(container);

  if (totalPages <= 1) return;

  const info = document.createElement('div');
  info.className = 'pagination-info';
  info.textContent = `Mostrando ${(state.currentPage - 1) * state.itemsPerPage + 1} - ${Math.min(state.currentPage * state.itemsPerPage, totalItems)} de ${totalItems} proyectos`;
  container.appendChild(info);

  const prevBtn = createStyledButton('← Anterior', 'pagination-btn', () => changePage(state.currentPage - 1, container));
  prevBtn.disabled = state.currentPage === 1;
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i += 1) {
    const pageBtn = createStyledButton(String(i), 'pagination-btn', () => changePage(i, container));
    if (i === state.currentPage) pageBtn.classList.add('active');
    container.appendChild(pageBtn);
  }

  const nextBtn = createStyledButton('Siguiente →', 'pagination-btn', () => changePage(state.currentPage + 1, container));
  nextBtn.disabled = state.currentPage === totalPages;
  container.appendChild(nextBtn);
}

function changePage(page, paginationContainer) {
  state.currentPage = page;
  const projectList = document.querySelector('#projectList');
  const pagination = paginationContainer || document.querySelector('#pagination');
  loadProjects(projectList, pagination);
}

function renderProjectForm(project = null) {
  app.innerHTML = '';
  const view = projectFormTemplate.content.cloneNode(true);
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

  cancelButton.addEventListener('click', () => render());

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
      render();
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      message.textContent = 'Ocurrió un error al guardar el proyecto.';
    }
  });

  app.appendChild(view);
}

function renderDetails(project) {
  app.innerHTML = '';
  const view = detailsTemplate.content.cloneNode(true);
  view.querySelector('#detailName').textContent = project.name;
  view.querySelector('#detailDescription').textContent = project.description;
  view.querySelector('#detailStatus').textContent = project.status;
  view.querySelector('#detailResponsible').textContent = project.responsible;
  view.querySelector('#detailCreated').textContent = new Date(project.createdAt).toLocaleString();
  view.querySelector('#backToList').addEventListener('click', () => render());
  app.appendChild(view);
}

async function handleDelete(projectId, container, paginationContainer) {
  const confirmed = confirm('¿Desea eliminar este proyecto?');
  if (!confirmed) return;

  await deleteProject(projectId);
  state.currentPage = 1;
  await loadProjects(container, paginationContainer);
}

async function handleStatusUpdate(projectId, status, container, paginationContainer) {
  await updateProject(projectId, { status });
  await loadProjects(container, paginationContainer);
}

export function toggleDarkMode() {
  const isDarkMode = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem(darkModeKey, String(isDarkMode));
  updateDarkModeToggle();
}

export function updateDarkModeToggle() {
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function handleLogout() {
  localStorage.removeItem(sessionKey);
  state.currentUser = null;
  render();
}
