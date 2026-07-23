let allScenes=[];

async function initUserForm(id=null){

    await loadRoles();
    await loadPermisos();
    await loadScenes();

    if(id){

        await loadUserData(id);

    }

    document
    .getElementById("userForm")
    .addEventListener(
        "submit",
        saveUser
    );

}

async function loadRoles(){

    const res =
        await fetch(
            "/api/adminusers/data/roles"
        );

    const roles =
        await res.json();

    const select =
        document.getElementById(
            "rol_id"
        );

    select.innerHTML =
        roles.map(r=>`

        <option value="${r.id_rol}">
            ${r.name_rol}
        </option>

        `).join("");

}

async function loadPermisos(){

    const res =
        await fetch(
            "/api/adminusers/data/permiso"
        );

    const roles =
        await res.json();

    const select =
        document.getElementById(
            "permisos_id"
        );

    select.innerHTML =
        roles.map(r=>`

        <option value="${r.id_permiso}">
            ${r.nombre_permiso}
        </option>

        `).join("");

}

async function loadUserData(id){

    const res =
        await fetch(
            `/api/adminusers/${id}`
        );

    const user =
        await res.json();

    document.getElementById("id_user").value=user.id_user;
    document.getElementById("nombre").value=user.nombre;
    document.getElementById("apellido").value=user.apellido;
    document.getElementById("rol_id").value=user.rol_id;
    document.getElementById("permisos_id").value = user.permisos_id;

    user.escenas.forEach(scene=>{

        const checkbox =
            document.querySelector(
            `.scene-check[value="${scene.id_scene}"]`
            );


        if(checkbox)
            checkbox.checked=true;

    });

}

async function saveUser(e){

    e.preventDefault();

    const scenes =
    [...document.querySelectorAll(
        ".scene-check:checked"
    )]
    .map(x=>Number(x.value));

    const data={

        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        rol_id: document.getElementById("rol_id").value,
        password: document.getElementById("password").value,    
        scenes

    };

    const id =
        id_user.value;

    await fetch(

        id
        ?
        `/api/adminusers/${id}`
        :
        "/api/adminusers",

        {

            method:
            id
            ?
            "PUT"
            :
            "POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(data)

        }

    );

    closeUserModal();

    loadUsersTable();

}

async function loadScenes() {

    const container = document.getElementById("imageSceneGrid");

    container.innerHTML = "Cargando imágenes...";

    try {

        const res = await fetch("/api/adminusers/data/scenes");

        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);

        const allScenes = await res.json();
        
        renderScene(allScenes);

    }
    catch (err) {

        console.error(err);

        container.innerHTML = "Error cargando imágenes.";

    }

}


function renderScene(images) {

    const container = document.getElementById("imageSceneGrid");

    if (!images.length) {

        container.innerHTML = "<p>No hay escenas.</p>";
        return;

    }

    container.innerHTML = images.map(img => `

        <div class="image-card">

            <input
                type="checkbox"
                value="${img.id_scene}"
                class="scene-check"
            >

            <img
                src="${img.url_minio}"
                alt="${img.nombre_img}"
            >

            <span>${img.description}</span>

        </div>

    `).join("");

}