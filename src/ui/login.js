/**
 * Muestra la pantalla de login para que el usuario pueda autenticarse.
 * Valida campos y muestra mensajes de error en la misma vista.
 */
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
  `); // crea el fragmento HTML para el formulario de login

  const form = view.querySelector('#loginForm'); // obtiene referencia al formulario
  const message = view.querySelector('#loginMessage'); // obtiene el contenedor de mensajes

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // evita recargar la página al enviar el formulario
    message.textContent = ''; // limpia cualquier mensaje previo

    const email = form.querySelector('#email').value.trim(); // lee el email del formulario
    const password = form.querySelector('#password').value.trim(); // lee la contraseña del formulario

    if (!email || !password) {
      message.textContent = 'Ingrese correo y contraseña.'; // informa si falta algún campo
      return;
    }

    const user = await authenticate(email, password); // llama a la API para autenticar
    if (!user) {
      message.textContent = 'Credenciales inválidas. Intente nuevamente.'; // muestra error cuando no existe el usuario
      return;
    }

    state.currentUser = user; // guarda el usuario autenticado en el estado global
    onLoginSuccess(user); // notifica al componente principal que el login fue exitoso
  });

  app.appendChild(view); // añade la vista de login al contenedor principal
}
