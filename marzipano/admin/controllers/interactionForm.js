/*=============================================
=            FORMULARIO INTERACCIONES         =
=============================================*/

let isEditModeInteraction = false;

async function initInteractionForm(id = null) {

    await Promise.all([
        loadScenesSelect(),
        loadTypesSelect(),
        loadIconsSelect()
    ]);

    document
        .getElementById("interactionForm")
        .addEventListener("submit", saveInteraction);

    document
        .getElementById("type_id")
        .addEventListener("change", toggleFieldsByType);

    if (id) {
        isEditModeInteraction = true;
        await loadInteraction(id);
    } else {
        isEditModeInteraction = false;
        resetInteractionForm();
        toggleFieldsByType();
    }

}

/*=============================================
=            CARGAR DATOS                     =
=============================================*/

async function loadInteraction(id){

    const res = await fetch(`/api/interactions/${id}`);

    if(!res.ok){
        alert("Error cargando interacción");
        return;
    }

    const data = await res.json();

    fillInteractionForm(data);

}

async function loadScenesSelect(){

    const res = await fetch("/api/scenes/names");
    const scenes = await res.json();

    const select = document.getElementById("scene_id");

    select.innerHTML = "";

    scenes.forEach(scene=>{

        const option = document.createElement("option");

        option.value = scene.id_scene;
        option.textContent = scene.name;

        select.appendChild(option);

    });

}

async function loadTypesSelect(){

    const res = await fetch("/api/interactions/types");
    const types = await res.json();

    const select = document.getElementById("type_id");

    select.innerHTML = "";

    types.forEach(type=>{

        const option = document.createElement("option");

        option.value = type.id_type;
        option.textContent = type.name;

        select.appendChild(option);

    });

}

async function loadIconsSelect(){

    const res = await fetch("/api/interactions/icons");
    const icons = await res.json();

    const select = document.getElementById("icon_id");

    select.innerHTML = "";

    icons.forEach(icon=>{

        const option = document.createElement("option");

        option.value = icon.id_icon;
        option.textContent = icon.name_icon;

        select.appendChild(option);

    });

}

/*=============================================
=            RELLENAR FORM                    =
=============================================*/

function fillInteractionForm(data){

    document.getElementById("id_interactions").value = data.id_interactions;
    document.getElementById("scene_id").value = data.scene_id;
    document.getElementById("title").value = data.title;
    document.getElementById("yaw").value = data.yaw;
    document.getElementById("pitch").value = data.pitch;
    document.getElementById("description").value = data.description || "";
    document.getElementById("link").value = data.link || "";
    document.getElementById("icon_id").value = data.icon_id || "";
    document.getElementById("rotation").value = data.rotation;
    document.getElementById("radius").value = data.radius || "";
    document.getElementById("type_id").value = data.type_id;
    document.getElementById("width_px").value = data.width_px || "";
    document.getElementById("height_px").value = data.height_px || "";
    document.getElementById("password").value = "";
    document.getElementById("api_key").value = data.api_key || "";
    document.getElementById("update_api").checked = data.update_api || false;

    toggleFieldsByType();

}

/*=============================================
=            GUARDAR                          =
=============================================*/

async function saveInteraction(e){

    e.preventDefault();

    const body = {

        id_interactions: document.getElementById("id_interactions").value || null,
        scene_id: document.getElementById("scene_id").value,
        title: document.getElementById("title").value,
        yaw: document.getElementById("yaw").value,
        pitch: document.getElementById("pitch").value,
        description: document.getElementById("description").value,
        link: document.getElementById("link").value,
        icon_id: document.getElementById("icon_id").value,
        rotation: document.getElementById("rotation").value,
        radius: document.getElementById("radius").value,
        type_id: document.getElementById("type_id").value,
        width_px: document.getElementById("width_px").value,
        height_px: document.getElementById("height_px").value,
        pass_word: document.getElementById("password").value || null,
        api_key: document.getElementById("api_key").value,
        update_api: document.getElementById("update_api").checked

    };

    const method = body.id_interactions ? "PUT" : "POST";

    const url = body.id_interactions
        ? `/api/interactions/${body.id_interactions}`
        : "/api/interactions";

    const res = await fetch(url,{

        method,
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(body)

    });

    if(res.ok){

        alert("Guardado correctamente");

        closeInteractionModal();

        loadInteractionsTable();

    }else{

        alert("Error guardando datos");

    }

}

/*=============================================
=            LIMPIAR                          =
=============================================*/

function resetInteractionForm(){

    document.getElementById("interactionForm").reset();

    document.getElementById("id_interactions").value="";

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