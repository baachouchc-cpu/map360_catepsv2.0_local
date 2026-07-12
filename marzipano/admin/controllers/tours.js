/*=============================================
=               TABLA ESCENAS                 =
=============================================*/

async function loadNavegationTable() {

    try {

        const response = await fetch("/api/routes");
        const routes = await response.json();

        const isTecnic = window.location.pathname.includes("tecnic");

        const table = new DataTable({

            container: "#content",

            columns: {

                title: "Rutas",

                fields: [

                    { field: "id_routes", title: "ID" },
                    { field: "hotspot_title", title: "Nombre" },
                    { field: "from_scene_desc", title: "Desde" },
                    { field: "to_scene_desc", title: "Hacia" },
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
                },
                {
                    text: "Desactivar",
                    class: "delete",
                    onclick: "disableRoute"
                }
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

    openTourModal();
}

function editRoute(id) {

    console.log("Editar ruta", id);

}

async function disableRoute(id) {

     openConfirmModal({

        title: "Desactivar ruta",

        message: "La ruta dejará de estar disponible, pero podrá habilitarse nuevamente.",

        confirmText: "Desactivar",

        confirmClass: "btn-delete",

        onConfirm: async () => {

            try {

                const res = await fetch(`/api/routes/${id}/disable`, {
                    method: "PUT"
                });

                if (!res.ok)
                    throw new Error("Error desactivando ruta");

                loadNavegationTable();

            } catch (err) {

                console.error(err);

            }

        }

    });

}

async function openTourModal(id = null) {

    if (document.getElementById("tourModal"))
        return;

    const html = await fetch("/admin/components/tourModal.html")
        .then(r => r.text());

    document.body.insertAdjacentHTML("beforeend", html);

    document
        .getElementById("tourModal")
        .classList.add("show");

    await initTourForm(id);
}

function closeTourModal() {

    const modal = document.getElementById("tourModal");

    if (!modal)
        return;

    modal.classList.remove("show");

    modal.remove();
}