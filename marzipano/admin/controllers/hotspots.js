/*=============================================
=               TABLA ESCENAS                 =
=============================================*/

async function loadNavegationTable() {

    try {

        const response = await fetch("/api/navegation");
        const routes = await response.json();

        const isTecnic = window.location.pathname.includes("tecnic");

        const table = new DataTable({

            container: "#content",

            idField: "id_hotspots",

            columns: {

                title: "Navegaciones",

                fields: [

                    { field: "id_hotspots", title: "ID" },
                    { field: "title", title: "Nombre" },
                    { field: "scene_name", title: "Desde" },
                    { field: "link_scene_name", title: "Hacia" },
                    {
                        field: "is_active",
                        title: "Estado",
                        formatter: (value, row) => `
                            <label class="switch">
                                <input
                                    type="checkbox"
                                    ${value ? "checked" : ""}
                                    onchange="toggleHotspot(${row.id_hotspots}, this.checked)"
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

            data: routes,

            actions: isTecnic
            ? [
                {
                    text: "Editar",
                    class: "edit",
                    onclick: "editRoute"
                }
            ]
            : [
                {
                    text: "Editar",
                    class: "edit",
                    onclick: "editRoute"
                }
                // ,{
                //     text: "Eliminar",
                //     class: "delete",
                //     onclick: "disableRoute"
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

function createRoute() {

    openhotspotModal();
}

function editRoute(id) {

    openhotspotModal(id);

}

async function toggleHotspot(id, active) {

    if (!active) {

        openConfirmModal({

            title: "Desactivar navegación",

            message: "La naveagación dejará de estar disponible, pero podrá habilitarse nuevamente.",

            confirmText: "Desactivar",

            confirmClass: "btn-delete",

            onConfirm: async () => {

                await fetch(`/api/navegation/${id}/status`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            is_active: false
                        })
                    });

                loadNavegationTable();

            }

        });

    } else {

        await fetch(`/api/navegation/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                is_active: true
            })
        });

        loadNavegationTable();

    }

}

async function openhotspotModal(id = null) {

    if (document.getElementById("hotspotModal"))
        return;

    const html = await fetch("/admin/components/hotspotModal.html")
        .then(r => r.text());

    document.body.insertAdjacentHTML("beforeend", html);

    document
        .getElementById("hotspotModal")
        .classList.add("show");

    await initHotspotForm(id);
}

function closehotspotModal() {

    const modal = document.getElementById("hotspotModal");

    if (!modal)
        return;

    modal.classList.remove("show");
    modal.remove();
}

function chooseSceneFrom() {

    openImagePicker(image => {

        document.getElementById("imagen_from_id").value = image.id_scene;

        document.getElementById("imagen_from_url").value = image.url_minio;

        document.getElementById("scenePreviewFrom").src = image.url_minio;

    },"imagenes_360", true);

}

function chooseSceneTo() {

    openImagePicker(image => {

        document.getElementById("imagen_to_id").value = image.id_scene;

        document.getElementById("imagen_to_url").value = image.url_minio;

        document.getElementById("scenePreviewTo").src = image.url_minio;

    },"imagenes_360", true);

}

