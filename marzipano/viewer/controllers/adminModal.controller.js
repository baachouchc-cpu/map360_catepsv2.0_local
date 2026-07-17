// src/controllers/adminModal.controller.js

/**
 * Inicializa los listeners y la lógica interactiva del modal de administración.
 * @param {HTMLElement} botonLlave - El botón (llave) que abre el modal.
 */
const initAdminModalController = (botonLlave) => {
  const modal = document.getElementById('modalLoginAdmin');
  const form = document.getElementById('formLoginExpress');
  const errorDiv = document.getElementById('loginErrorMsg');
  const btnCerrar = document.getElementById('btnCerrarModal');

  if (!modal || !form) return;

  // --- Funciones de control de estado ---
  const abrirModal = () => {
    modal.style.display = 'flex';
  };

  const cerrarModal = () => {
    modal.style.display = 'none';
    errorDiv.style.display = 'none';
    form.reset();
  };

  // --- FUNCIÓN PARA ALTERNAR ENTRE LLAVE Y PERFIL LOGUEADO ---
  const actualizarInterfazUsuario = () => {
    const userLogueado = JSON.parse(localStorage.getItem('user_info'));
    // Buscamos el botón de la llave por su ID original para asegurarnos de tomarlo directamente
    const botonAccesoReal = document.getElementById('control_access') || botonLlave;
    const contenedorPadre = botonLlave.parentElement; // El contenedor .admin-access-wrapper

    if (userLogueado) {
      // 1. Forzamos la desaparición completa de la llave original
      botonAccesoReal.style.setProperty('display', 'none', 'important');

      // // Ocultamos la llave original
      // botonLlave.style.display = 'none';

      // Eliminamos bloques viejos para evitar duplicados al re-renderizar
      const viejoBloque = document.getElementById('user-logged-block');
      if (viejoBloque) viejoBloque.remove();

      // Creamos el bloque con el nombre completo y botón de salida
      const bloqueUsuario = document.createElement('div');
      bloqueUsuario.id = 'user-logged-block';
      bloqueUsuario.style.cssText = `
        display: inline-flex !important;
        align-items: center !important;
        gap: 12px !important;
        color: #ffffff !important;
        font-family: sans-serif !important;
        font-size: 14px !important;
      `;

      bloqueUsuario.innerHTML = `
        <span style="font-weight: bold; color: #f1c40f;">👤 ${userLogueado.nombreCompleto || userLogueado.username}</span>
        <button id="btn-logout-express" title="Cerrar Sesión" style="
          background: #e74c3c !important;
          color: white !important;
          border: none !important;
          padding: 6px 12px !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 12px !important;
          font-weight: bold !important;
          pointer-events: auto !important;
        ">Salir</button>
      `;

      contenedorPadre.appendChild(bloqueUsuario);

      // Evento para cerrar sesión
      document.getElementById('btn-logout-express').addEventListener('click', async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          console.error("Error en la petición de logout:", e);
        }
        localStorage.removeItem('escenas_permitidas');
        localStorage.removeItem('user_info');
        alert("Sesión cerrada correctamente");
        window.location.reload();
      });

    } else {
      // Si no hay sesión, se muestra la llave y se borra el bloque de usuario
      botonAccesoReal.style.setProperty('display', 'inline-flex', 'important');
      const viejoBloque = document.getElementById('user-logged-block');
      if (viejoBloque) viejoBloque.remove();
    }
  };

  // Comprobación automática al cargar la web
  actualizarInterfazUsuario();

  // --- Manejo de Eventos (Abrir y Cerrar) ---
  botonLlave.addEventListener('click', abrirModal);
  btnCerrar.addEventListener('click', cerrarModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // --- Manejo del envío del formulario ---
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const formData = new FormData(this);
    
    // Mapeamos 'login_name' de tu HTML al parámetro 'name' que espera el Backend
    // const data = {
    //   name: formData.get('login_name'),
    //   password: formData.get('password')
    // };
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const res = await response.json();

      if (response.ok && res.escenas) {
        // 1. Guardamos los datos y permisos en LocalStorage
        localStorage.setItem('escenas_permitidas', JSON.stringify(res.escenas));
        localStorage.setItem('user_info', JSON.stringify(res.user));

        // 2. Ventana emergente indicando éxito
        alert("¡Sesión iniciada con éxito!");

        // 3. Limpieza y cierre del modal
        cerrarModal();

        // 4. Actualizamos la interfaz
        actualizarInterfazUsuario();

        // 5. Recargamos para aplicar los permisos al visor 360
        window.location.reload();

      } else {
        // Tu controlador del backend responde con { error: "..." } si falla
        errorDiv.innerText = res.error || "Usuario o contraseña incorrectos";
        errorDiv.style.display = 'block';
      }
    } catch (err) {
      console.error("Error en login express:", err);
      errorDiv.innerText = "Error de conexión con el servidor";
      errorDiv.style.display = 'block';
    }
  });
};

export { initAdminModalController };