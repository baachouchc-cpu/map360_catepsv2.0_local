// src/components/adminModal.component.js

/**
 * Crea e inyecta la estructura HTML del modal en el documento.
 * Las reglas visuales se manejan por completo desde el archivo .css
 */
const renderAdminModal = () => {
  // Evitamos duplicar el componente si ya existe en el DOM
  if (document.getElementById('modalLoginAdmin')) return;

  const modal = document.createElement('div');
  modal.id = 'modalLoginAdmin';

  modal.innerHTML = `
    <div class="modal-admin-content">
      <button id="btnCerrarModal" type="button">&times;</button>

      <h3>🔑 Acceso Privado</h3>
      
      <form id="formLoginExpress">
        <div>
          <label>Usuario</label>
          <input type="text" name="username" placeholder="Introduce usuario" required>
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" name="password" placeholder="••••••••" required>
        </div>
        
        <button type="submit">Iniciar Sesión</button>
        <div id="loginErrorMsg"></div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
};

export { renderAdminModal };