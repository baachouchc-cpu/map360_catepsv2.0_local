let currentUser = null;
let userRole = null;

const ROLE_ADMIN = 1;
const ROLE_TECNIC = 2;


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


        //console.log("Usuario panel:", currentUser);


    } catch(err) {

        console.error("Error sesión admin", err);

        window.location.href="/admin/login";

    }

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