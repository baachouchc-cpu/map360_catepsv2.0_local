/*=============================================
=            FORMULARIO INTERACCIONES         =
=============================================*/

let isEditModeInteraction = false;

async function initInteractionForm(id = null) {

    await Promise.all([
        loadScenesSelect(),
        loadTypesSelect(),
        //loadIconsSelect()
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

    select.innerHTML = `
        <option value="" selected disabled>Cargando escenas...</option>
    `;

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

    select.innerHTML = `
        <option value="" selected disabled>Seleccione un tipo</option>
    `;

    types.forEach(type=>{

        const option = document.createElement("option");

        option.value = type.id_type;
        option.textContent = type.name;

        select.appendChild(option);

    });

}

// async function loadIconsSelect(){

//     const res = await fetch("/api/interactions/icons");
//     const icons = await res.json();

//     const select = document.getElementById("icon_id");

//     select.innerHTML = "";

//     icons.forEach(icon=>{

//         const option = document.createElement("option");

//         option.value = icon.id_icon;
//         option.textContent = icon.name_icon;

//         select.appendChild(option);

//     });

// }

/*=============================================
=            RELLENAR FORM                    =
=============================================*/

function fillInteractionForm(data){

    console.log(data);
    document.getElementById("id_interactions").value = data.id_interactions;
    document.getElementById("scene_id").value = data.scene_id;
    document.getElementById("title").value = data.title;
    document.getElementById("yaw").value = data.yaw;
    document.getElementById("pitch").value = data.pitch;
    document.getElementById("description").value = data.description || "";
    document.getElementById("link").value = data.link || "";
    document.getElementById("scenePreview").src = data.icon_url_minio || "";
    document.getElementById("scenePreviewFoto").src = data.url_minio_interaccion || "";
    document.getElementById("scenePreviewImagen").src = data.url_minio_interaccion || "";
    document.getElementById("rotation").value = data.rotation;
    document.getElementById("radius").value = data.radius || "";
    document.getElementById("type_id").value = data.type_id;
    document.getElementById("width_px").value = data.width_px || "";
    document.getElementById("height_px").value = data.height_px || "";
    document.getElementById("password").value = data.pass_word || "";
    document.getElementById("api_key").value = data.api_key || "";
    document.getElementById("update_api").checked = data.update_api || false;
    document.getElementById("imagen_icon_id").value = data.imagen_icon_id;
    document.getElementById("imagen_id").value  = data.imagen_id;
    //document.getElementById("imagen_foto_id").value = data.imagen_id;

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
        icon_id: 1,
        rotation: document.getElementById("rotation").value,
        type_id: document.getElementById("type_id").value,
        imagen_icon_id: document.getElementById("imagen_icon_id").value || null

    };

    switch (body.type_id) {

        case "1": // Informativo         
            body.link = document.getElementById("link").value; 

            break;

        case "2": // Pantalla

            body.link = document.getElementById("link").value;
            body.radius = document.getElementById("radius").value;
            body.width_px = document.getElementById("width_px").value || null;
            body.height_px = document.getElementById("height_px").value || null;

            break;

        case "3": // API

            body.link = document.getElementById("link").value;
            body.api_key = document.getElementById("api_key").value || null;
            body.update_api = document.getElementById("update_api").checked;

            break;

        case "4": // Foto

            body.imagen_id = document.getElementById("imagen_id").value || null;

            break;
        
        case "5": // Dinamico (IoT)

            body.link = document.getElementById("link").value;

        break;

        case "6": // Password

            body.pass_word = document.getElementById("password").value || null;
            const usarImagen = document.getElementById("link_imagen").checked;

            const link = document.getElementById("link").value;
            const imagenId = document.getElementById("imagen_id").value;

            if (usarImagen) {
                // Usa imagen
                body.link = null;
                body.imagen_id = imagenId;
            } else {
                // Usa enlace
                body.link = link;
                body.imagen_id = null;
            }

            break;
    }

    switch (body.type_id) {

        case "1": // Informativo
            body.imagen_id = null;
            body.radius = null;
            body.width_px = null;
            body.height_px = null;
            body.api_key = null;
            body.update_api = false;
            body.pass_word = null;
            break;

        case "2": // Pantalla
            body.imagen_id = null;
            body.api_key = null;
            body.update_api = false;
            body.pass_word = null;
            break;

        case "3": // API
            body.imagen_id = null;
            body.radius = null;
            body.width_px = null;
            body.height_px = null;
            body.pass_word = null;
            break;

        case "4": // Foto
            body.link = null;
            body.radius = null;
            body.width_px = null;
            body.height_px = null;
            body.api_key = null;
            body.update_api = false;
            body.pass_word = null;
            break;

        case "5": // IoT
            body.imagen_id = null;
            body.radius = null;
            body.width_px = null;
            body.height_px = null;
            body.api_key = null;
            body.update_api = false;
            body.pass_word = null;
            break;

        case "6": // Password
            body.radius = null;
            body.width_px = null;
            body.height_px = null;
            body.api_key = null;
            body.update_api = false;
            break;
    }

    console.log("filling interaction form with data:", body);

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

    document.getElementById("group_link_image").style.display =
        type=="6" ? "block":"none";

    document.getElementById("group_screen").style.display =
        type=="2" ? "block":"none";

    document.getElementById("group_api").style.display =
        type=="3" ? "block":"none";  

    document.getElementById("group_foto").style.display =
        type=="4" ? "block":"none";

    document.getElementById("group_link").style.display =
        type=="4" ? "none":"block";

    const link = document.getElementById("link");
    const hint = document.getElementById("linkHint");
    const usarImagen = document.getElementById("link_imagen").checked;

    link.required = (
        type == "2" ||
        type == "3" ||
        (type == "6" && !usarImagen)
    );

    if (type == "1") {
        hint.textContent =
            "Si quieres redirigir a una URL externa, introdúcela aquí.";
    }
    else if (type == "2") {
        hint.textContent =
            "La URL debe ser un enlace embebido (iframe).";
    }
    else if (type == "3") {
        hint.textContent =
            "La URL no debe incluir la API KEY.";
    }
    else if (type == "6") {
        hint.textContent =
            "Introduce la URL protegida por contraseña.";
    }
    else {
        hint.textContent = "";
    }

    const description = document.getElementById("description");
    const hintdescription = document.getElementById("descriptionHint");

    description.required = type == "3";

    if (type == "3") {
        hintdescription.textContent =
            "Puedes usar etiquetas para mostrar datos de la API. Ejemplo: Clima: {weather[0].description}, Temperatura: {main.temp}°C";
    }
    else {
        hintdescription.textContent = "";
    }

    const chkImage = document.getElementById("link_imagen");
    const imageContainer = document.getElementById("image_interaction");
    const linkInput = document.getElementById("link");

    // Solo aplica para tipo Password
    if (type == "6") {

        const usarImagen = linkInput.value.trim() === "";

        chkImage.checked = usarImagen;

        imageContainer.style.display = usarImagen ? "block" : "none";

        document.getElementById("group_link").style.display =
            usarImagen ? "none" : "block";

    }
    else {

        chkImage.checked = false;
        imageContainer.style.display = "none";

    }

}

function toggleApiKey(inputId, eye){

    const input = document.getElementById(inputId);
    //const eye = document.querySelector(".toggle-eye");

    const show = input.type === "password";

    input.type = show ? "text" : "password";
    eye.textContent = show ? "🙈" : "👀";

}

function toggleImageLink(){

    const usarImagen = document.getElementById("link_imagen").checked;

    document.getElementById("image_interaction").style.display = usarImagen ? "none" : "block";
    document.getElementById("group_link").style.display = usarImagen ? "block" : "none";
    document.getElementById("link").required = !usarImagen;

}