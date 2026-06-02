import { state } from '../states/state.js';
import { authenticate } from '../api/api.js';
import { createFragment } from '../utils/helpers.js';

export function renderLogin({ app, onLoginSuccess }) {
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
    onLoginSuccess(user);
  });

  app.appendChild(view);
}
