let permisoScenes=[];

async function initPermisoForm(id=null){
    
    await loadPermisoScenes();

    if(id){ await loadPermisoData(id); }

    document
    .getElementById("permisoForm")
    .addEventListener(
    "submit",
    savePermiso
    );

}

async function loadPermisoScenes(){

const res =
await fetch(
`/api/permisos/scenes`
);

permisoScenes =
await res.json();

renderPermisoScenes(
permisoScenes
);
updatePermissionCounter();

}

function renderPermisoScenes(scenes){

    const container =
        document.getElementById(
            "permisoPermissionsGrid"
        );

    container.innerHTML="";

    if(!scenes.length){

        container.innerHTML="<p>No hay escenas.</p>";

        return;

    }

    /*=========================================
    =              AGRUPAR DATOS             =
    =========================================*/

    const towers={};

    scenes.forEach(scene=>{

        if(!towers[scene.tower_id]){

            towers[scene.tower_id]={

                id:scene.tower_id,

                name:scene.name_tower,

                color:towerColor(scene.name_tower),

                floors:{}

            };

        }

        if(!towers[scene.tower_id].floors[scene.floor_id]){

            towers[scene.tower_id].floors[scene.floor_id]={

                id:scene.floor_id,

                name:scene.name_floor,

                scenes:[]

            };

        }

        towers[scene.tower_id]
        .floors[scene.floor_id]
        .scenes
        .push(scene);

    });

    /*=========================================
    =            RENDER TORRES               =
    =========================================*/

    Object.values(towers).forEach((tower,index)=>{

        const totalTower =
            Object.values(tower.floors)
            .reduce(
                (acc,floor)=>
                    acc+floor.scenes.length,
                0
            );

        let html=`

        <details

            class="permission-tower"

            ${index===0?"open":""}

        >

            <summary

                class="permission-tower-title"

                style="--tower-color:${tower.color};"

            >

                <div class="permission-tower-name">

                    ${tower.name}

                </div>

                <div
                    class="permission-tower-count"
                    data-tower="${tower.id}"
                >

                    0 / ${totalTower}

                </div>

            </summary>

            <div class="permission-tower-content">

        `;

        /*=========================================
        =               PISOS                   =
        =========================================*/

        Object.values(tower.floors).forEach(floor=>{

            html+=`

                <div class="permission-floor">

                    <div class="permission-floor-title">

                        <span>

                            📁 ${floor.name}

                        </span>

                        <span>

                            ${floor.scenes.length} escena${floor.scenes.length!==1?"s":""}

                        </span>

                    </div>

                    <div class="permission-grid">

                        ${floor.scenes.map(scene=>`

                            <label class="permission-card">

                                <input

                                    type="checkbox"

                                    class="permiso-scene"

                                    value="${scene.id_scene}"

                                    data-tower="${tower.id}"

                                    onchange="togglePermissionCard(this)"

                                >

                                <img

                                    src="${scene.url_minio}"

                                    alt="${scene.description}"

                                >

                                <div class="permission-card-info">

                                    <div class="permission-card-title">

                                        ${scene.description}

                                    </div>

                                </div>

                            </label>

                        `).join("")}

                    </div>

                </div>

            `;

        });

        html+=`

            </div>

        </details>

        `;

        container.insertAdjacentHTML(

            "beforeend",

            html

        );

    });

    /*=========================================
    =      SOLO UNA TORRE ABIERTA            =
    =========================================*/

    document
    .querySelectorAll(".permission-tower")
    .forEach(detail=>{

        detail.addEventListener("toggle",()=>{

            if(!detail.open)
                return;

            document
            .querySelectorAll(".permission-tower")
            .forEach(other=>{

                if(other!==detail)
                    other.open=false;

            });

        });

    });

}

async function loadPermisoData(id){

const res =
await fetch(
`/api/permisos/${id}`
);

const permiso =await res.json();

document.getElementById("id_permiso").value = permiso.id_permiso;
document.getElementById("nombre_permiso").value = permiso.nombre_permiso;
document.getElementById("custom").checked = permiso.custom;

permiso.escenas.forEach(scene=>{

    const check =
    document.querySelector(
    `.permiso-scene[value="${scene.id_scene}"]`
    );

    if(check)
    check.checked=true;
    check.parentElement.classList.add("selected");
    });

    updatePermissionCounter();

}

async function savePermiso(e){

e.preventDefault();

const escenas =
[
...document.querySelectorAll(
".permiso-scene:checked"
)
]
.map(x=>Number(x.value));

const data={

nombre_permiso:document.getElementById("nombre_permiso").value,
custom:document.getElementById("custom").checked,

escenas

};
console.log(data);

const id =
id_permiso.value;
await fetch(

id
?
`/api/permisos/${id}`
:
"/api/permisos",

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

closePermisoModal();

loadPermisosTable();

}

function updatePermissionCounter(){

    const total =
        document.querySelectorAll(".permiso-scene").length;

    const checked =
        document.querySelectorAll(".permiso-scene:checked").length;

    document.getElementById("permisoCounter").textContent =
        `${checked} / ${total} seleccionadas`;

}

function towerColor(name){

    if(name.includes("AZUL"))
        return "#3B82F6";

    if(name.includes("ROJO"))
        return "#EF4444";

    if(name.includes("VERDE"))
        return "#22C55E";

    if(name.includes("AMARILLO"))
        return "#FACC15";

    return "#777";

}

function togglePermissionCard(input){

    input.parentElement.classList.toggle(
        "selected",
        input.checked
    );

    updatePermissionCounter();

}