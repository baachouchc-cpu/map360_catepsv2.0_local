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

  // --- Manejo de Eventos (Abrir y Cerrar) ---
  botonLlave.addEventListener('click', abrirModal);
  btnCerrar.addEventListener('click', cerrarModal);

  // Cerrar si el usuario hace clic fuera de la caja interna (en el fondo oscuro)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // --- Manejo del envío del formulario (Lógica de Negocio) ---
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorDiv.style.display = 'none';

    // Conversión de los datos del formulario a un objeto plano
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/perfil/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const res = await response.json();

      if (res.ok) {
        // Login exitoso: se limpia la interfaz y se cierra
        cerrarModal();
        // Nota: Si necesitas redirigir tras loguear, podrías añadir: window.location.reload();
      } else {
        errorDiv.innerText = res.message || "Usuario o contraseña incorrectos";
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