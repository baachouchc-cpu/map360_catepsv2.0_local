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

    /*==========================
    =       AGRUPAR DATOS      =
    ==========================*/

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

    /*==========================
    =      RENDER TORRES       =
    ==========================*/

    Object.values(towers).forEach((tower,index)=>{

        const totalTower =
            Object.values(tower.floors)
            .reduce(
                (sum,f)=>sum+f.scenes.length,
                0
            );

        const towerHTML=`

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

                    <span
                        class="permission-tower-counter"
                        data-counter="${tower.id}"
                    >

                        0 / ${totalTower}

                    </span>

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

                            ${floor.scenes.map(scene=>`

                                <label class="permission-card">

                                    <input

                                        type="checkbox"

                                        class="permiso-scene"

                                        data-tower="${tower.id}"

                                        value="${scene.id_scene}"

                                        onchange="togglePermissionCard(this)"

                                    >

                                    <img

                                        src="${scene.url_minio}"

                                    >

                                    <div class="permission-card-title">

                                        ${scene.description}

                                    </div>

                                </label>

                            `).join("")}

                        </div>

                    </div>

                `).join("")}

            </div>

        </section>

        `;

        container.insertAdjacentHTML(

            "beforeend",

            towerHTML

        );

    });

    /*==========================
    =      ACORDEÓN           =
    ==========================*/

    document
    .querySelectorAll(".permission-tower-header")
    .forEach(header=>{

        header.onclick=()=>{

            const tower=
                header.parentElement;

            document
            .querySelectorAll(".permission-tower")
            .forEach(item=>{

                if(item!==tower)

                    item.classList.remove("open");

            });

            tower.classList.toggle("open");

        };

    });

    updatePermissionCounter();

    updateTowerCounters();

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
    const card =
        check.closest(".permission-card");

    if(card){

        card.classList.add("selected");

    }
    });

    updatePermissionCounter();
    updateTowerCounters();

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
        document.querySelectorAll(
            ".permiso-scene"
        ).length;

    const checked =
        document.querySelectorAll(
            ".permiso-scene:checked"
        ).length;

    document.getElementById(
        "permisoCounter"
    ).textContent=

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

    const card =
        input.closest(".permission-card");

    card.classList.toggle(
        "selected",
        input.checked
    );

    updatePermissionCounter();

    updateTowerCounters();

}

function updateTowerCounters(){

    document
    .querySelectorAll(".permission-tower")
    .forEach(tower=>{

        const checks =
            tower.querySelectorAll(
                ".permiso-scene"
            );

        const selected =
            tower.querySelectorAll(
                ".permiso-scene:checked"
            );

        const counter =
            tower.querySelector(
                ".permission-tower-counter"
            );

        const total =
            checks.length;

        const checked =
            selected.length;

        if(checked===total && total>0){

            counter.innerHTML=`
                <span class="permission-ok">
                    ✔
                </span>
                ${checked} / ${total}
            `;

        }
        else{

            counter.textContent=
                `${checked} / ${total}`;

        }

    });

}