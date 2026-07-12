document.addEventListener("DOMContentLoaded", loadSidebar);

function loadSidebar() {

    const isTecnic = window.location.pathname.includes("tecnic");

    if(isTecnic){

        document.getElementById("sidebar").innerHTML = `
            <div class="logo">
                <h2>MAP360</h2>
            </div>
            <nav class="sidebar-menu">
                
                <li class="menu">
                    <button class="menu-item btn btn-secondary" data-page="scenes" onclick="loadScenesPage()">
                        🏞 Escenas
                    </button>
                </li>

                <li class="menu">
                    <button class="menu-item btn btn-secondary" data-page="navegation" onclick="loadNavegationPage()">
                        🗺️ Navegación
                    </button>

                </li>

                <li class="menu">
                    <button class="menu-item btn btn-secondary" data-page="interactions" onclick="loadInteractionsPage()">
                        🎯 Interacciones
                    </button>

                </li>
            </nav>

            <div class="sidebar-footer">

                <button class="btn btn-danger btn-block" onclick="logout()">
                    Cerrar sesión
                </button>

            </div>

        `;

        return;
    }

    document.getElementById("sidebar").innerHTML = `

        <div class="logo">
            <h2>MAP360</h2>
        </div>
        <nav class="sidebar-menu">
            <li class="menu">

                <button class="menu-item btn btn-secondary" data-page="dashboard" onclick="loadDashboardPage()">
                    📊 Dashboard
                </button>
            </li>

            <li class="menu">
                <button class="menu-item btn btn-secondary" data-page="scenes" onclick="loadScenesPage()">
                    🏞 Escenas
                </button>
            </li>

            <li class="menu">
                <button class="menu-item btn btn-secondary" data-page="navegation" onclick="loadNavegationPage()">
                    🗺️ Navegación
                </button>

            </li>

            <li class="menu">
                <button class="menu-item btn btn-secondary" data-page="interactions" onclick="loadInteractionsPage()">
                    🎯 Interacciones
                </button>

            </li>
        </nav>

        <div class="sidebar-footer">

            <button class="btn btn-danger btn-block" onclick="logout()">
                Cerrar sesión
            </button>

        </div>

    `;

}

async function logout() {

    try {

        await fetch("/api/auth/logout", {
            method: "POST"
        });

    } catch (e) {

        console.error(e);

    }

    window.location.href = "/admin/login";

}