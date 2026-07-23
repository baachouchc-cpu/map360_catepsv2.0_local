let currentUser = null;
let userRole = null;

const ROLE_ADMIN = 1;
const ROLE_TECNIC = 2;

function getCurrentUser(){

    return currentUser;

}


async function loadAdminSession() {

    try {

        const res = await fetch("/api/auth/me", {
            credentials: "include"
        });

        const data = await res.json();

        if (!data.authenticated) {

            window.location.href = "/admin/login";
            return;

        }

        currentUser = data.user;
        userRole = currentUser.role;

         localStorage.setItem(
            "user_info",
            JSON.stringify(data.user)
        );


        localStorage.setItem(
            "escenas_permitidas",
            JSON.stringify(data.escenas)
        );

        renderAdminUser();
        initAdminButtons();


        //console.log("Usuario panel:", currentUser);


    } catch(err) {

        console.error("Error sesión admin", err);

        window.location.href="/admin/login";

    }

}

// ======================================
// MOSTRAR USUARIO
// ======================================

function renderAdminUser(){

    const info =
        document.getElementById("adminUserInfo");


    if(!info || !currentUser)
        return;


    let rol = "Usuario";


    if(userRole === ROLE_ADMIN)
        rol = "Administrador";


    if(userRole === ROLE_TECNIC)
        rol = "Técnico";


    info.innerHTML = `
        👤 
        ${currentUser.nombreCompleto || currentUser.username}
        |
        ${rol}
    `;

}

// ======================================
// BOTONES GLOBALES
// ======================================

function initAdminButtons(){

    const btnLogout =
        document.getElementById(
            "btnLogout"
        );

    btnLogout?.addEventListener(
        "click",
        async()=>{

            await fetch(
                "/api/auth/logout",
                {
                    method:"POST"
                }
            );

            localStorage.removeItem(
                "user_info"
            );

            localStorage.removeItem(
                "escenas_permitidas"
            );

            localStorage.removeItem(
                "modo_configuracion"
            );

            window.location.href="/";

        }
    );


}

// Helpers globales

function isAdmin(){

    return userRole === ROLE_ADMIN;

}


function isTecnic(){

    return userRole === ROLE_TECNIC;

}


function canEdit(){

    return isAdmin() || isTecnic();

}


function canDelete(){

    return isAdmin();

}