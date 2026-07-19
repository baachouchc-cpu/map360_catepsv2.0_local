let allScenes=[];

async function initUserForm(id=null){

    await loadRoles();

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

async function loadScenes(){

    const res =
        await fetch(
            "/api/adminusers/data/scenes"
        );

    allScenes =
        await res.json();

    const container =
        document.getElementById(
            "sceneList"
        );

    container.innerHTML =

        allScenes.map(s=>`

        <label>

            <input
            type="checkbox"
            value="${s.id_scene}"
            class="scene-check"
            >

            ${s.description}

        </label>

        `).join("");

}

async function loadUserData(id){

    const res =
        await fetch(
            `/api/adminusers/${id}`
        );

    const user =
        await res.json();

    id_user.value=user.id_user;

    nombre.value=user.nombre;

    apellido.value=user.apellido;

    rol_id.value=user.rol_id;

    is_config.checked=user.is_config;


    // user.escenas.forEach(scene=>{

    //     const checkbox =
    //         document.querySelector(
    //         `.scene-check[value="${scene.id_scene}"]`
    //         );


    //     if(checkbox)
    //         checkbox.checked=true;

    // });

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

        nombre: nombre.value,
        apellido: apellido.value,
        rol_id: Number(rol_id.value),
        password: password.value,
        is_config: is_config.checked,
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

async function loadScenes(){

    const res =
        await fetch(
            "/api/adminusers/data/scenes"
        );

    allScenes =
        await res.json();

    const container =
        document.getElementById(
            "imageSceneGrid"
        );


    container.innerHTML = allScenes.map(scene=>`

        <label class="scene-card">


            <input
                type="checkbox"
                value="${scene.id_scene}"
                class="scene-check"
            >


            <img
                src="${scene.url_minio}"
                alt="${scene.description}"
            >


            <span>
                ${scene.description}
            </span>


        </label>


    `).join("");

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