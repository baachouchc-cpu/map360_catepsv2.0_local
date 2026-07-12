/*=============================================
=            FORMULARIO INTERACCIONES         =
=============================================*/

let isEditModeScene = false;

async function initSceneForm(id = null) {

    await Promise.all([
        loadTowersSelect(),
        loadKindsSelect(),
        loadFloorsSelect(),
        loadOrientationsSelect()
    ]);

    document
        .getElementById("sceneForm")
        .addEventListener("submit", saveScene);

    // document
    //     .getElementById("type_id")
    //     .addEventListener("change", toggleFieldsByType);

    if (id) {
        isEditModeScene = true;
        await loadScene(id);
    } else {
        isEditModeScene = false;
        resetSceneForm();
        //toggleFieldsByType();
    }

}

/*=============================================
=            CARGAR DATOS                     =
=============================================*/

async function loadScene(id){

    const res = await fetch(`/api/scenes/${id}`);

    if(!res.ok){
        alert("Error cargando escena");
        return;
    }

    const data = await res.json();

    fillSceneForm(data);

}

async function loadTowersSelect(){

    const res = await fetch("/api/scenes/towers");
    const towers = await res.json();

    const select = document.getElementById("tower_id");

    select.innerHTML = "";

    towers.forEach(tower=>{

        const option = document.createElement("option");

        option.value = tower.id_tower;
        option.textContent = tower.name_tower;

        select.appendChild(option);

    });

}

async function loadKindsSelect(){

    const res = await fetch("/api/scenes/kinds");
    const kinds = await res.json();

    const select = document.getElementById("kind_id");

    select.innerHTML = "";

    kinds.forEach(kind=>{

        const option = document.createElement("option");

        option.value = kind.id_kind;
        option.textContent = kind.name_kind;

        select.appendChild(option);

    });

}

async function loadFloorsSelect(){

    const res = await fetch("/api/scenes/floors");
    const floors = await res.json();

    const select = document.getElementById("floor_id");

    select.innerHTML = "";

    floors.forEach(floor=>{

        const option = document.createElement("option");

        option.value = floor.id_floor;
        option.textContent = floor.name_floor;

        select.appendChild(option);

    });

}

async function loadOrientationsSelect(){

    const res = await fetch("/api/scenes/orientations");
    const orientations = await res.json();

    const select = document.getElementById("orientation_id");

    select.innerHTML = "";

    orientations.forEach(orientation=>{

        const option = document.createElement("option");

        option.value = orientation.id_orientation;
        option.textContent = orientation.name_orientation;

        select.appendChild(option);

    });

}

/*=============================================
=            RELLENAR FORM                    =
=============================================*/

function fillSceneForm(data){

    document.getElementById("id_scene").value = data.id_scene;
    document.getElementById("description").value = data.description || "";
    document.getElementById("tower_id").value = data.tower_id;
    document.getElementById("kind_id").value = data.kind_id;
    document.getElementById("floor_id").value = data.floor_id;
    document.getElementById("orientation_id").value = data.orientation_id;
    document.getElementById("imagen_url").value = data.imagen_url || "";
}

/*=============================================
=            GUARDAR                          =
=============================================*/

async function saveScene(e){
    
    e.preventDefault();

    const body = {

        id_scene: document.getElementById("id_scene").value || null,
        imagen_url: document.getElementById("imagen_url").value,
        kind_id: document.getElementById("kind_id").value,
        floor_id: document.getElementById("floor_id").value,
        tower_id: document.getElementById("tower_id").value,
        orientation_id: document.getElementById("orientation_id").value,
        description: document.getElementById("description").value,
        imagen_id: document.getElementById("imagen_id").value || null,

    };
    
    const method = body.id_scene ? "PUT" : "POST";

    const url = body.id_scene
        ? `/api/scenes/${body.id_scene}`
        : "/api/scenes";

    const res = await fetch(url,{

        method,
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(body)

    });

    if(res.ok){

        alert("Guardado correctamente");

        closeSceneModal();

        loadScenesTable();

    }else{
        console.error(await res.text());
        alert("Error guardando datos");

    }

}

/*=============================================
=            LIMPIAR                          =
=============================================*/

function resetSceneForm(){

    document.getElementById("sceneForm").reset();

    document.getElementById("id_scene").value="";

}

/*=============================================
=            CAMPOS DINÁMICOS                 =
=============================================*/

function toggleFieldsByType(){

    const type = document.getElementById("type_id").value;
    const isEdit = document.getElementById("id_interactions").value;

    document.getElementById("group_password").style.display =
        type=="6" ? "block":"none";

    document.getElementById("password").required =
        type=="6" && !isEdit;

    document.getElementById("group_screen").style.display =
        type=="2" ? "block":"none";

    document.getElementById("group_api").style.display =
        type=="3" ? "block":"none";

}

function toggleApiKey(){

    const input = document.getElementById("api_key");

    input.type =
        input.type==="password"
        ? "text"
        : "password";

}