let allScenes = [];
let permissionScenes = [];
let userOverrides = [];
let sceneStates = [];
let hasExistingPasswordUser = false;

async function initUserForm(id = null){

    currentUser = id;

    await Promise.all([

        loadRoles(),
        loadPermisos(),
        loadScenes()

    ]);

    if(id){

        await loadUserData(id);

    }else{

        buildSceneState();
        updatePermissionCounters();

    }

    document
        .getElementById("permisos_id")
        .addEventListener(
            "change",
            permissionChanged
        );

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

    const res = await fetch(
        "/api/adminusers/data/permisos"
    );

    const permisos = await res.json();

    const select =
        document.getElementById("permisos_id");

    select.innerHTML =
        permisos.map(p=>`

            <option value="${p.id_permiso}">
                ${p.nombre_permiso}
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
    hasExistingPasswordUser = Boolean(user.pass_user);
    document.getElementById("password").value = "";

    permissionScenes = user.permissionScenes || [];

    userOverrides = user.userOverrides || [];

    document.getElementById(
        "permissionName"
    ).textContent =
        user.nombre_permiso;

    buildSceneState();
    updatePermissionCounters();

}

/*=============================================
=           GUARDAR USUARIO                   =
=============================================*/

async function saveUser(e){

    e.preventDefault();

    const overrides = sceneStates
        .filter(scene => scene.override !== null)
        .map(scene => ({

            scene_id: scene.id_scene,

            is_allow: scene.override

        }));

    const data = {

        id_user: document.getElementById("id_user").value,
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        rol_id: Number(document.getElementById("rol_id").value),
        permisos_id: Number(document.getElementById("permisos_id").value),

        overrides

    };

    const passwordValue = document.getElementById("password").value.trim();

            if (passwordValue) {

                data.password = passwordValue;

            }

    const id =
        document.getElementById("id_user").value;

    const response =
        await fetch(

            id
                ? `/api/adminusers/${id}`
                : "/api/adminusers",

            {

                method:
                    id
                        ? "PUT"
                        : "POST",

                headers:{
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(data)

            }

        );

    if(!response.ok){

        const error =
            await response.json();

        alert(
            error.message ||
            "Error guardando usuario."
        );

        return;

    }

    closeUserModal();

    loadUsersTable();

}

async function loadScenes(){

    try{

        const res =
            await fetch(
                "/api/adminusers/data/scenes"
            );

        allScenes =
            await res.json();

    }
    catch(error){

        console.error(error);

    }

}

async function permissionChanged(){

    const permiso =
        document.getElementById(
            "permisos_id"
        ).value;

    if(!permiso)
        return;

    const res =
        await fetch(
            `/api/permisos/${permiso}`
        );

    const data =
        await res.json();

    permissionScenes =
        data.escenas;

    userOverrides = [];

    document.getElementById(
        "permissionName"
    ).textContent =
        data.nombre_permiso;

    buildSceneState();
    updatePermissionCounters();

}

/*=============================================
=      CONSTRUIR ESTADO DE LAS ESCENAS        =
=============================================*/

function buildSceneState(){

    sceneStates = allScenes.map(scene=>{

        const inherited =
            permissionScenes.some(
                p=>p.id_scene===scene.id_scene
            );

        const override =
            userOverrides.find(
                o=>o.scene_id===scene.id_scene
            );

        return{

            ...scene,

            inherited,

            override:
                override
                ? override.is_allow
                : null

        };

    });

    renderScene();

}

function getSceneStatus(scene){

    if(scene.override===true)
        return "allow";

    if(scene.override===false)
        return "deny";

    if(scene.inherited)
        return "inherit";

    return "none";

}

function getSceneBadge(status){

    switch(status){

        case "inherit":

            return "🟢 Heredado";

        case "allow":

            return "🔵 Permitido";

        case "deny":

            return "🔴 Denegado";

        default:

            return "⚪ Sin acceso";

    }

}

function renderScene(){

    renderUserScenes(sceneStates);

}

function printSceneStates(){

    console.table(

        sceneStates.map(s=>({

            id:s.id_scene,

            escena:s.description,

            inherited:s.inherited,

            override:s.override,

            estado:getSceneStatus(s)

        }))

    );

}

function renderUserScenes(scenes){

    const container =
        document.getElementById(
            "imageUserSceneGrid"
        );

    container.innerHTML = "";

    if(!scenes.length){

        container.innerHTML =
            "<p>No hay escenas.</p>";

        return;

    }

    const towers = {};

    scenes.forEach(scene=>{

        if(!towers[scene.id_tower]){

            towers[scene.id_tower]={

                id:scene.id_tower,
                name:scene.name_tower,
                color:towerColor(scene.name_tower),
                floors:{}

            };

        }

        if(!towers[scene.id_tower].floors[scene.id_floor]){

            towers[scene.id_tower].floors[scene.id_floor]={

                id:scene.id_floor,
                name:scene.name_floor,
                scenes:[]

            };

        }

        towers[scene.id_tower]
            .floors[scene.id_floor]
            .scenes
            .push(scene);

    });

    Object.values(towers).forEach((tower,index)=>{

        const counters = {

            inherit:0,
            allow:0,
            deny:0,
            none:0

        };

        Object
            .values(tower.floors)
            .flatMap(f=>f.scenes)
            .forEach(scene=>{

                counters[
                    getSceneStatus(scene)
                ]++;

            });

        const totalTower =
            Object.values(tower.floors)
            .reduce(
                (sum,f)=>sum+f.scenes.length,
                0
            );

        container.insertAdjacentHTML(

            "beforeend",

            `
            <section
                class="permission-tower ${index===0?"open":""}"

                data-tower="${tower.id}"
            >

                <div
                    class="permission-tower-header"
                    style="--tower-color:${tower.color}"
                >

                    <div class="permission-tower-left">

                        <span class="permission-dot"></span>

                        <span class="permission-title">

                            ${tower.name}

                        </span>

                    </div>

                    <div class="permission-tower-right">

                        <div class="permission-tower-counter">

                            🟢 ${counters.inherit}

                            🔵 ${counters.allow}

                            🔴 ${counters.deny}

                            ⚪ ${counters.none}

                        </div>

                        <span class="permission-arrow">

                            ▼

                        </span>

                    </div>

                </div>

                <div class="permission-tower-body">

                    ${Object.values(tower.floors).map(floor=>`

                        <div class="permission-floor">

                            <div class="permission-floor-title">

                                <div>

                                    📂 ${floor.name}

                                </div>

                                <div>

                                    ${floor.scenes.length}

                                </div>

                            </div>

                            <div class="permission-grid">

                                ${floor.scenes.map(renderUserCard).join("")}

                            </div>

                        </div>

                    `).join("")}

                </div>

            </section>

            `

        );

    });

    document
        .querySelectorAll(".permission-tower-header")
        .forEach(header=>{

            header.onclick=()=>{

                const tower =
                    header.parentElement;

                document
                    .querySelectorAll(".permission-tower")
                    .forEach(item=>{

                        if(item!==tower){

                            item.classList.remove("open");

                        }

                    });

                tower.classList.toggle("open");

            };

        });

    updateSceneCards();

}

function renderUserCard(scene){

    const status =
        getSceneStatus(scene);

    return `

    <div

        class="permission-card user-scene-card ${status}"

        data-scene="${scene.id_scene}"

        onclick="toggleSceneOverride(${scene.id_scene})"

    >

        <img
            src="${scene.url_minio}"
        >

        <div class="permission-card-title">

            ${scene.description}

        </div>

        <div class="scene-state">

            <span

                id="sceneState${scene.id_scene}"

                class="scene-state-label"

            >

                ${getSceneBadge(status)}

            </span>

        </div>

    </div>

    `;

}

function setSceneOverride(sceneId,isAllow){

    const scene =
        sceneStates.find(
            s=>s.id_scene===sceneId
        );

    if(!scene)
        return;

    scene.override=isAllow;

    updateSceneCard(scene);

}

function clearSceneOverride(sceneId){

    const scene =
        sceneStates.find(
            s=>s.id_scene===sceneId
        );

    if(!scene)
        return;

    scene.override=null;

    updateSceneCard(scene);

}

function updateSceneCards(){

    sceneStates.forEach(scene=>{

        updateSceneCard(scene);

    });

}

function updateSceneCard(scene){

    const card =
        document.querySelector(

            `.user-scene-card[data-scene="${scene.id_scene}"]`

        );

    if(!card)
        return;

    const status =
        getSceneStatus(scene);

    card.classList.remove(

        "inherit",
        "allow",
        "deny",
        "none"

    );

    card.classList.add(status);

    card.querySelector(".scene-state-label")
        .innerHTML =
        getSceneBadge(status);

    updatePermissionCounters();

}

function toggleSceneOverride(sceneId){

    const scene =
        sceneStates.find(
            s => s.id_scene === sceneId
        );

    if(!scene) return;

    if(scene.inherited){

        // Heredada -> Denegada -> Heredada

        scene.override =
            scene.override === false
                ? null
                : false;

    }else{

        // Sin acceso -> Permitida -> Sin acceso

        scene.override =
            scene.override === true
                ? null
                : true;

    }

    updateSceneCard(scene);

    updatePermissionCounters();

    updateTowerCounter(scene.id_tower);

}

function updatePermissionCounters(){

    const counters={

        inherit:0,
        allow:0,
        deny:0,
        none:0

    };

    sceneStates.forEach(scene=>{

        counters[
            getSceneStatus(scene)
        ]++;

    });

    document.getElementById(
        "permissionName"
    ).textContent =

        `Permiso base: ${
            document.getElementById("permisos_id")
            .selectedOptions[0].text
        } · ` +

        `🟢 ${counters.inherit} ` +

        `🔵 ${counters.allow} ` +

        `🔴 ${counters.deny} ` +

        `⚪ ${counters.none}`;

}

function updateTowerCounter(towerId){

    const towerElement = document.querySelector(
        `.permission-tower[data-tower="${towerId}"]`
    );

    if(!towerElement)
        return;

    const counters = {

        inherit:0,
        allow:0,
        deny:0,
        none:0

    };

    sceneStates
        .filter(scene => scene.id_tower == towerId)
        .forEach(scene => {

            counters[getSceneStatus(scene)]++;

        });

    towerElement.querySelector(".permission-tower-counter").innerHTML =

        `🟢 ${counters.inherit}
         🔵 ${counters.allow}
         🔴 ${counters.deny}
         ⚪ ${counters.none}`;
}
