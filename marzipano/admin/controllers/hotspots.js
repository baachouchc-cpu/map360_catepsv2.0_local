/*=============================================
=               TABLA ESCENAS                 =
=============================================*/

async function loadNavegationTable() {

    try {

        const response = await fetch("/api/navegation");
        const routes = await response.json();

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
                        field:"is_active",
                        title:"Estado",
                        formatter:(value,row)=>`

                        ${
                            isAdmin()
                            ?
                            `
                            <label class="switch">
                                <input
                                type="checkbox"
                                ${value ? "checked":""}
                                onchange="toggleHotspot(${row.id_hotspots},this.checked,this)"
                                >
                                <span class="slider"></span>
                            </label>
                            `
                            :
                            `
                            <span>
                                ${value ? "Activo":"Inactivo"}
                            </span>
                            `
                        }

                        `
                        },
                    {
                        field:"is_public",
                        title:"Público",
                        formatter:(value,row)=>`

                        ${
                            isAdmin()
                            ?
                            `
                            <label class="switch">
                                <input
                                type="checkbox"
                                ${value ? "checked":""}
                                onchange="toggleHotspotPublic(${row.id_hotspots},this.checked,this)"
                                >
                                <span class="slider"></span>
                            </label>
                            `
                            :
                            `
                            <span>
                                ${value ? "Activo":"Inactivo"}
                            </span>
                            `
                        }

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

            actions: [

                {
                    text: "Editar",
                    class: "edit",
                    onclick: "editRoute"
                },

                ...(isAdmin()
                ?
                [
                    {
                        text: "Eliminar",
                        class: "delete",
                        onclick: "deleteRoute"
                    }
                ]
                :
                [])

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

function deleteRoute(id) {

    console.log("deleteRoute");

}

async function toggleHotspot(id, active, checkbox) {

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

            },

            onCancel: () => {

                checkbox.checked = true;

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

async function toggleHotspotPublic(id, active, checkbox) {

    if (!active) {

        openConfirmModal({

            title: "Despublicar navegación",

            message: "La naveagación dejará de estar pública, pero podrá ser publicada nuevamente.",

            confirmText: "Despublicar",

            confirmClass: "btn-delete",

            onConfirm: async () => {

                await fetch(`/api/navegation/${id}/public`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            is_public: false
                        })
                    });

                loadNavegationTable();

            },

            onCancel: () => {

                checkbox.checked = true;

            }

        });

    } else {

        await fetch(`/api/navegation/${id}/public`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                is_public: true
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

