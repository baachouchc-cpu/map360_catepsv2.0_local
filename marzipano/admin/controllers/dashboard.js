document.addEventListener("DOMContentLoaded", () => {

    const isTecnic = window.location.pathname.includes("tecnic");

    if (isTecnic) {

        document.getElementById("pageTitle").textContent = "";
        document.getElementById("content").innerHTML = "";

        return;
    }

    loadDashboardPage();

});

/*=============================================
=            DASHBOARD                        =
=============================================*/

async function loadDashboardPage() {
    
    setActiveMenu("dashboard");

    document.getElementById("pageTitle").textContent = "Dashboard";

    const btn = document.getElementById("btnCreate");

    if (btn)
        btn.style.display = "none";

    document.getElementById("content").innerHTML = `

        <div class="cards">

            <div class="card">

                <h3>Escenas</h3>

                <h1 id="sceneCount">0</h1>

            </div>

            <div class="card">

                <h3>Interacciones</h3>

                <h1 id="interactionCount">0</h1>

            </div>

            <div class="card">

                <h3>Puntos de Navegación</h3>

                <h1 id="routeCount">0</h1>

            </div>

        </div>

    `;

    await loadCounters();

}

/*=============================================
=            CONTADORES                       =
=============================================*/

async function loadCounters() {

    try {

        const [sceneRes, interactionRes, routeRes] = await Promise.all([
            fetch("/api/scenes"),
            fetch("/api/interactions"),
            fetch("/api/navegation")
        ]);

        const scenes = await sceneRes.json();
        const routes = await routeRes.json();
        const interactions = await interactionRes.json();

        document.getElementById("sceneCount").textContent = scenes.length;
        document.getElementById("routeCount").textContent = routes.length;
        document.getElementById("interactionCount").textContent = interactions.length;
        

    }
    catch (err) {

        console.error(err);

    }

}

/*=============================================
=            ESCENAS                          =
=============================================*/

function loadScenesPage() {

    setActiveMenu("scenes");

    document.getElementById("pageTitle").textContent = "Escenas";

    setCreateButton(
        "+ Crear escena",
        () => openSceneModal()
    );

    loadScenesTable();

}

/*=============================================
=            Navegación                   =
=============================================*/

function loadNavegationPage() {

    setActiveMenu("navegation");

    document.getElementById("pageTitle").textContent = "Navegación";

    setCreateButton(
        "+ Crear navegación",
        () => openhotspotModal()
    );

    loadNavegationTable();

}

/*=============================================
=            INTERACCIONES                    =
=============================================*/

function loadInteractionsPage() {

    setActiveMenu("interactions");

    document.getElementById("pageTitle").textContent = "Interacciones";

    setCreateButton(
        "+ Crear interacción",
        () => openInteractionModal()
    );

    loadInteractionsTable();

}

/*=============================================
=            INTERACCIONES                    =
=============================================*/

function loadUsersPage() {

    setActiveMenu("users");

    document.getElementById("pageTitle").textContent = "Usuarios"; 

    setCreateButton(
        "+ Crear usuario",
        () => openUserModal()
    );
    
    loadUsersTable();

}

/*=============================================
=            MENUS                            =
=============================================*/

function setActiveMenu(page) {

    document.querySelectorAll(".menu-item").forEach(btn => {
        btn.classList.remove("active");
    });

    const active = document.querySelector(`.menu-item[data-page="${page}"]`);

    if (active) {
        active.classList.add("active");
    }

}