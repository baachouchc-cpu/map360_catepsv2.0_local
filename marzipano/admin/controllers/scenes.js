/*=============================================
=               TABLA ESCENAS                 =
=============================================*/

async function loadScenesTable() {

    try {

        const response = await fetch("/api/scenes");
        const scenes = await response.json();

        const isTecnic = window.location.pathname.includes("tecnic");

        const table = new DataTable({

            container: "#content",

            idField: "id_scene",

            columns: {

                title: "Escenas",

                fields: [

                    { field: "id_scene", title: "ID" },
                    { field: "scene_description", title: "Nombre" },
                    {
                        field: "is_active",
                        title: "Estado",
                        formatter: (value, row) => `
                            <label class="switch">
                                <input
                                    type="checkbox"
                                    ${value ? "checked" : ""}
                                    onchange="toggleScene(${row.id_scene}, this.checked)"
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

            data: scenes,

            actions: isTecnic
            ? [
                {
                    text: "Editar",
                    class: "edit",
                    onclick: "editScene"
                }
            ]
            : [
                {
                    text: "Editar",
                    class: "edit",
                    onclick: "editScene"
                }
                // ,{
                //     text: "Eliminar",
                //     class: "delete",
                //     onclick: "disableScene",
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

function editScene(id) {

    openSceneModal(id);

}

async function disableScene(id) {

     openConfirmModal({

        title: "Desactivar escena",

        message: "La escena dejará de estar disponible, pero podrá habilitarse nuevamente.",

        confirmText: "Desactivar",

        confirmClass: "btn-delete",

        onConfirm: async () => {

            try {

                const res = await fetch(`/api/scenes/${id}/disable`, {
                    method: "PUT"
                });

                if (!res.ok)
                    throw new Error("Error desactivando escena");

                loadScenesTable();

            } catch (err) {

                console.error(err);

            }

        }

    });

}

async function openSceneModal(id = null) {

    if (document.getElementById("sceneModal"))
        return;

    const html = await fetch("/admin/components/sceneModal.html")
        .then(r => r.text());

    document.body.insertAdjacentHTML("beforeend", html);

    document
        .getElementById("sceneModal")
        .classList.add("show");

    await initSceneForm(id);
}

function closeSceneModal() {

    const modal = document.getElementById("sceneModal");

    if (!modal)
        return;

    modal.classList.remove("show");
    modal.remove();
}

function chooseSceneImage() {

    openImagePicker(image => {

        document.getElementById("imagen_id").value = image.id_imagen;

        document.getElementById("imagen_url").value = image.url_minio;

        document.getElementById("scenePreview").src = image.url_minio;

    },"imagenes_360");

}

async function toggleScene(id, active) {

    if (!active) {

        openConfirmModal({

            title: "Desactivar escena",

            message: "La escena dejará de estar disponible.",
            
            confirmText: "Desactivar",

            confirmClass: "btn-delete",

            onConfirm: async () => {

                await fetch(`/api/scenes/${id}/status`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        is_active: false
                    })
                });

                loadScenesTable();

            }

        });

    } else {

        await fetch(`/api/scenes/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                is_active: true
            })
        });

        loadScenesTable();

    }

}