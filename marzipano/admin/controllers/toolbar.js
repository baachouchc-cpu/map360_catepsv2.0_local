/*=============================================
=           BOTÓN CREAR GLOBAL               =
=============================================*/

const btnCreate = document.getElementById("btnCreate");

/**
 * Configura el botón Crear
 * @param {string} text Texto del botón
 * @param {Function} callback Función al hacer click
 */
function setCreateButton(text, callback) {

    if (!btnCreate)
        return;

    btnCreate.style.display = "inline-flex";
    btnCreate.textContent = text;
    btnCreate.onclick = callback;

}

/**
 * Oculta el botón
 */
function hideCreateButton() {

    if (!btnCreate)
        return;

    btnCreate.style.display = "none";
    btnCreate.onclick = null;

}