/*=============================================
=               TABLA INTERACCIONES           =
=============================================*/

async function loadInteractionsTable() {

    try {

        const response = await fetch("/api/interactions");
        const interactions = await response.json();

        const isTecnic = window.location.pathname.includes("tecnic");

        const table = new DataTable({

            container: "#content",

            idField: "id_interactions",

            columns: {

                title: "Interacciones",

                fields: [

                    { field: "id_interactions", title: "ID" },
                    { field: "title", title: "Nombre" },
                    { field: "scene_name", title: "Escena" },
                    {
                        field: "is_active",
                        title: "Estado",
                        formatter: (value, row) => `
                            <label class="switch">
                                <input
                                    type="checkbox"
                                    ${value ? "checked" : ""}
                                    onchange="toggleInteraction(${row.id_interactions}, this.checked)"
                                >
                                <span class="slider"></span>
                            </label>
                        `
                    },
                    {
                        field: "updated_at",
                        title: "Actualización",
                        formatter: (value) =>
                            new Date(value).toLocaleString("es-ES", {
                                dateStyle: "short",
                                timeStyle: "short"
                            })
                    }

                ]

            },

            data: interactions,

            actions: isTecnic
            ? [
                {
                    text: "Editar",
                    class: "edit",
                    onclick: "editInteraction"
                }
            ]
            : [
                {
                    text: "Editar",
                    class: "edit",
                    onclick: "editInteraction"
                }
                // ,{
                //     text: "Eliminar",
                //     class: "delete",
                //     onclick: "deleteInteraction"
                // }
            ]
        });

    }
    catch (err) {

        console.error(err);

    }

}

/*=============================================
=               ACCIONES                      =
=============================================*/

function createInteraction() {

    openInteractionModal();
}

function editInteraction(id) {
    
    openInteractionModal(id);
    
}

/*=============================================
=            ELIMINAR INTERACCIÓN            =
=============================================*/

/*=============================================
=         DESACTIVAR INTERACCIÓN             =
=============================================*/

async function toggleInteraction(id, active) {

    if (!active) {

        openConfirmModal({

            title: "Desactivar interacción",

            message: "La interacción dejará de estar disponible.",

            confirmText: "Desactivar",

            confirmClass: "btn-delete",

            onConfirm: async () => {

                await fetch(`/api/interactions/${id}/disable`, {
                    method: "PUT"
                });

                loadInteractionsTable();

            }

        });

    } else {

        await fetch(`/api/interactions/${id}/enable`, {
            method: "PUT"
        });

        loadInteractionsTable();

    }

}

async function deleteInteraction(id) {

    openConfirmModal({

        title: "Eliminar interacción",

        message: "Esta acción eliminará definitivamente la interacción. ¿Desea continuar?",

        confirmText: "Eliminar",

        confirmClass: "btn-delete",

        onConfirm: async () => {

            await fetch(`/api/interactions/${id}`, {
                method: "DELETE"
            });

            loadInteractionsTable();

        }

    });

}

async function openInteractionModal(id = null) {

    if (document.getElementById("interactionModal"))
        return;

    const html = await fetch("/admin/components/interactionModal.html")
        .then(r => r.text());

    document.body.insertAdjacentHTML("beforeend", html);

    // Mostrar modal
    document.getElementById("interactionModal").classList.add("show");

    await initInteractionForm(id);
}

function closeInteractionModal() {

    const modal = document.getElementById("interactionModal");

    if (!modal) return;

    modal.classList.remove("show");

    modal.remove();
}

function chooseInteractionIcon() {

    openImagePicker(image => {

        document.getElementById("imagen_icon_id").value = image.id_imagen;

        document.getElementById("imagen_icon_url").value = image.url_minio;

        document.getElementById("scenePreview").src = image.url_minio;

    },"Iconos");

}

function chooseInteractionImagen() {

    openImagePicker(image => {

        document.getElementById("imagen_id").value = image.id_imagen;

        document.getElementById("imagen_url").value = image.url_minio;

        document.getElementById("scenePreviewImagen").src = image.url_minio;

    },"interaccion");

}

function chooseInteractionFoto() {

    openImagePicker(image => {

        document.getElementById("imagen_id").value = image.id_imagen;

        document.getElementById("imagen_foto_url").value = image.url_minio;

        document.getElementById("scenePreviewFoto").src = image.url_minio;

    },"interaccion");

}