/*=============================================
=            FORMULARIO INTERACCIONES         =
=============================================*/

let isEditModeInteraction = false;
let hasExistingPassword = false;

async function initInteractionForm(id = null) {

    await Promise.all([
        loadScenesSelect(),
        loadTypesSelect(),
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

/*=============================================
=            RELLENAR FORM                    =
=============================================*/

function fillInteractionForm(data){
    console.log("get",data);
    document.getElementById("id_interactions").value = data.id_interactions;
    document.getElementById("scene_id").value = data.scene_id;
    document.getElementById("scenePreviewScene").src = data.from_scene_url;
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
    hasExistingPassword = Boolean(data.pass_word);
    document.getElementById("password").value = "";
    document.getElementById("api_key").value = data.api_key || "";
    document.getElementById("update_api").checked = data.update_api || false;
    document.getElementById("imagen_icon_id").value = data.imagen_icon_id;
    if(data.type_id === 6){
        document.getElementById("imagen_id").value  = data.imagen_id || "";}
    if(data.type_id === 4){
        document.getElementById("imagen_foto_id").value  = data.imagen_id || "";}

    toggleFieldsByType();

    if (data.pass_word) {
        document.getElementById("passwordHint").textContent =
        "Dejar en blanco para mantener la contraseña actual";
    }

}

/*=============================================
=            GUARDAR                          =
=============================================*/

async function saveInteraction(e){

    e.preventDefault();

    const imagenIconId = document.getElementById("imagen_icon_id");
    const iconError = document.getElementById("iconError");
    const imagenId =  document.getElementById("imagen_id");
    const imagenError = document.getElementById("imagenError");
    const fotoId =  document.getElementById("imagen_foto_id");
    const fotoError = document.getElementById("fotoError");
    const type = document.getElementById("type_id").value;
    const usarImagen = document.getElementById("link_imagen").checked;
    
    //Validar icono

    if (!imagenIconId.value) {

        iconError.style.display =
            "block";

        return;

    }

    iconError.style.display =
        "none";

    //Validar imagen

    const imagenEsObligatoria = (type === "6" && usarImagen);
    const imagenSeleccionada = imagenId.value || fotoId.value;


    if (imagenEsObligatoria && !imagenSeleccionada) {

        imagenError.style.display =
            "block";

        return;

    }

    imagenError.style.display =
        "none";

    //Validar foto

    const fotoEsObligatoria = (type === "4");


    if (fotoEsObligatoria && !imagenSeleccionada) {

        fotoError.style.display =
            "block";

        return;

    }

    fotoError.style.display =
        "none";

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

            body.imagen_id = document.getElementById("imagen_foto_id").value || document.getElementById("imagen_id").value;

            break;
        
        case "5": // Dinamico (IoT)

            body.link = document.getElementById("link").value;

        break;

        case "6": // Password

            const passwordValue = document.getElementById("password").value.trim();

            if (passwordValue) {

                body.pass_word = passwordValue;

            }
            
            const usarImagen = document.getElementById("link_imagen").checked;

            const link = document.getElementById("link").value;
            const imagenId = document.getElementById("imagen_id").value;
            const fotoId = document.getElementById("imagen_foto_id").value;

            if (usarImagen) {
                // Usa imagen
                body.link = null;
                body.imagen_id = imagenId || fotoId;
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
    console.log("post",body);

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

function toggleFieldsByType() {

    const type =
        document.getElementById("type_id").value;

    const isEdit =
        Boolean(
            document.getElementById("id_interactions").value
        );


    /*
    =========================================
    ELEMENTOS DEL FORMULARIO
    =========================================
    */

    const password = document.getElementById("password");
    const link = document.getElementById("link");
    const hint = document.getElementById("linkHint");
    const chkImage = document.getElementById("link_imagen");
    const imageContainer = document.getElementById("image_interaction");
    const description = document.getElementById("description");
    const hintDescription = document.getElementById("descriptionHint");
    const imagenId = document.getElementById("imagen_id");
    const labelImagen = document.getElementById("lbl_imagen");
    const labellink = document.getElementById("lbl_link");
    const apiKey = document.getElementById("api_key");
    const radius = document.getElementById("radius");
    const width_px = document.getElementById("width_px");
    const height_px = document.getElementById("height_px");

    /*
    =========================================
    VISIBILIDAD DE GRUPOS
    =========================================
    */

    document.getElementById("group_password").style.display =
        type === "6" ? "block" : "none";

    document.getElementById("group_link_image").style.display =
        type === "6" ? "block" : "none";

    document.getElementById("group_screen").style.display =
        type === "2" ? "block" : "none";
    
    // radius.required =
    //     type === "2";
    
    width_px.required =
        type === "2";
    
    height_px.required =
        type === "2";

    document.getElementById("group_api").style.display =
        type === "3" ? "block" : "none";
    
    apiKey.required =
        type === "3";

    document.getElementById("group_foto").style.display =
        type === "4" ? "block" : "none";


    /*
    =========================================
    CONTRASEÑA
    =========================================
    */

    password.required =
        type === "6" && !hasExistingPassword;


    /*
    =========================================
    TIPO 6
    PASSWORD: IMAGEN O ENLACE
    =========================================
    */

    if (type === "6") {

        /*
        Al editar una interacción existente,
        determinamos el modo según los datos
        guardados en la base de datos.
        */

        if (isEdit) {

            const hasImage =
                imagenId.value !== "";

            const hasLink =
                link.value.trim() !== "";


            /*
            Si tiene imagen y no tiene link:
            modo imagen
            */

            if (hasImage && !hasLink) {

                chkImage.checked = true;

            }


            /*
            Si tiene link y no tiene imagen:
            modo enlace
            */

            else if (hasLink && !hasImage) {

                chkImage.checked = false;

            }

        }


        /*
        Estado actual del toggle
        */

        const usarImagen =
            chkImage.checked;


        /*
        Mostrar/ocultar imagen
        */

        imageContainer.style.display =
            usarImagen ? "block" : "none";


        /*
        Mostrar/ocultar enlace
        */

        document.getElementById("group_link").style.display =
            usarImagen ? "none" : "block";

        // Cambiar etiqueta de link
        labelImagen.innerHTML =
        usarImagen
            ? 'Usar imagen <span class="required">*</span>'
            : 'Usar Imagen';

        labellink.innerHTML =
        usarImagen
            ? 'Link'
            : 'Link <span class="required">*</span>';



        /*
        El enlace solamente es obligatorio
        cuando NO se utiliza imagen
        */

        link.required =
            !usarImagen;

    }


    /*
    =========================================
    RESTO DE TIPOS
    =========================================
    */

    else {

        /*
        El selector de imagen solo aplica
        al tipo 6
        */

        imageContainer.style.display =
            "none";

        chkImage.checked =
            false;


        /*
        Tipo 4 no utiliza link
        */

        document.getElementById("group_link").style.display =
            type === "4"
                ? "none"
                : "block";


        /*
        Solo estos tipos necesitan link
        */

        link.required =
            type === "2" ||
            type === "3";

    }


    /*
    =========================================
    TEXTO DE AYUDA DEL LINK
    =========================================
    */

    if (type === "1") {

        hint.textContent =
            "Si quieres redirigir a una URL externa, introdúcela aquí.";

    }

    else if (type === "2") {

        hint.textContent =
            "La URL debe ser un enlace embebido (iframe).";
        
        labellink.innerHTML =
            'Link <span class="required">*</span>';

    }

    else if (type === "3") {

        hint.textContent =
            "La URL no debe incluir la API KEY.";

        labellink.innerHTML =
            'Link <span class="required">*</span>';

    }

    else if (type === "6") {

        hint.textContent =
            "Introduce la URL protegida por contraseña.";

    }

    else {

        hint.textContent =
            "";

    }


    /*
    =========================================
    DESCRIPCIÓN
    =========================================
    */

    description.required =
        type === "3";


    if (type === "3") {

        hintDescription.textContent =
            "Puedes usar etiquetas para mostrar datos de la API. Ejemplo: Clima: {weather[0].description}, Temperatura: {main.temp}°C";

    }

    else {

        hintDescription.textContent =
            "";

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
    const labelImagen = document.getElementById("lbl_imagen");
    const labellink = document.getElementById("lbl_link");


    document.getElementById("image_interaction").style.display = usarImagen ? "block" : "none";
    document.getElementById("group_link").style.display = usarImagen ? "none" : "block";
    document.getElementById("link").required = !usarImagen;

    labelImagen.innerHTML =
    usarImagen
        ? 'Usar imagen <span class="required">*</span>'
        : 'Usar Imagen';

    labellink.innerHTML =
    usarImagen
        ? 'Link'
        : 'Link <span class="required">*</span>';

}