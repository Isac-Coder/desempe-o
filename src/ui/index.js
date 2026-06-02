import { state, sessionKey, darkModeKey } from '../state/index.js';
import { authenticate, getProjects, createProject, updateProject, deleteProject } from '../api/index.js';
import { getStatusClass, formatDate, createStyledButton, clearElement } from '../utils/helpers.js';

let app;
let logoutButton;
let darkModeToggle;
let root;

export function setupUI() {
  root = document.getElementById('app-root') || createAppShell();
  root.innerHTML = '';

  const header = document.createElement('header');
  const title = document.createElement('h1');
  title.textContent = 'Gestión de Proyectos Internos';

  const headerActions = document.createElement('div');
  headerActions.style.display = 'flex';
  headerActions.style.gap = '16px';
  headerActions.style.alignItems = 'center';

  darkModeToggle = document.createElement('button');
  darkModeToggle.id = 'darkModeToggle';
  darkModeToggle.className = 'btn secondary';
  darkModeToggle.title = 'Cambiar tema';
  darkModeToggle.addEventListener('click', toggleDarkMode);

  logoutButton = document.createElement('button');
  logoutButton.id = 'logoutButton';
  logoutButton.className = 'btn secondary hidden';
  logoutButton.textContent = 'Cerrar sesión';
  logoutButton.addEventListener('click', handleLogout);

  headerActions.append(darkModeToggle, logoutButton);
  header.append(title, headerActions);

  root.appendChild(header);

  app = document.createElement('main');
  app.id = 'app';
  root.appendChild(app);

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

function createAppShell() {
  const container = document.createElement('div');
  container.id = 'app-root';
  container.className = 'app-shell';
  document.body.appendChild(container);
  return container;
}

function createFragment(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

function renderLogin() {
  const view = createFragment(`
    <section class="card centered">
      <h2>Ingreso de usuario</h2>
      <form id="loginForm" class="form-grid">
        <label>
          Correo electrónico
          <input type="email" id="email" required placeholder="manager@empresa.com" />
        </label>
        <label>
          Contraseña
          <input type="password" id="password" required placeholder="********" />
        </label>
        <button type="submit" class="btn primary">Ingresar</button>
      </form>
      <div id="loginMessage" class="message"></div>
    </section>
  `);

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
