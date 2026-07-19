/*=============================================
=            FORMULARIO HOTSPOTS              =
=============================================*/

let isEditModeHotspot = false;

// Inicializar formulario de navegación

async function initHotspotForm(id = null){

    document
        .getElementById("hotspotForm")
        .addEventListener("submit", saveHotspot);

    if(id){

        isEditModeHotspot = true;
        await loadHotspot(id);

    }else{

        isEditModeHotspot = false;

        resetHotspotForm();

    }

}


/*=============================================
=            CARGAR DATOS                     =
=============================================*/


async function loadHotspot(id){

    const res = await fetch(`/api/navegation/${id}`);

    if(!res.ok){

        alert("Error cargando hotspot");

        return;

    }

    const data = await res.json();

    fillHotspotForm(data);

}

/*=============================================
=            RELLENAR FORM                    =
=============================================*/


function fillHotspotForm(data){
    
    document.getElementById("id_hotspots").value = data.id_hotspots;
    document.getElementById("imagen_from_id").value = data.scene_id;
    document.getElementById("scenePreviewFrom").src = data.from_scene_url;
    document.getElementById("title").value =  data.title;
    document.getElementById("yaw").value = data.yaw;
    document.getElementById("pitch").value = data.pitch;
    document.getElementById("description").value = data.description || "";
    document.getElementById("imagen_to_id").value =  data.link_scene_id;
    document.getElementById("scenePreviewTo").src = data.to_scene_url;
    //document.getElementById("icon_id").value =  data.icon_id;
    document.getElementById("rotation").value =  data.rotation || 0;

}

/*=============================================
=            GUARDAR                          =
=============================================*/

async function saveHotspot(e){

    e.preventDefault();

    const imagenFromId =  document.getElementById("imagen_from_id");
    const imagenFromError = document.getElementById("imagenfromError");
    const imagenToId =  document.getElementById("imagen_to_id");
    const imagenToError = document.getElementById("imagentoError");

    //Validar escena origen

    if (!imagenFromId.value) {

        imagenFromError.style.display =
            "block";

        return;

    }

    imagenFromError.style.display =
        "none";
    
    //Validar escena destino
    //Validar icono

    if (!imagenToId.value) {

        imagenToError.style.display =
            "block";

        return;

    }

    imagenToError.style.display =
        "none";

    const body = {

        id_hotspots: document.getElementById("id_hotspots").value || null,
        scene_id: document.getElementById("imagen_from_id").value,
        title: document.getElementById("title").value,
        yaw: document.getElementById("yaw").value,
        pitch: document.getElementById("pitch").value,
        description: document.getElementById("description").value,
        link_scene_id: document.getElementById("imagen_to_id").value,
        icon_id: 2,
        rotation: document.getElementById("rotation").value || 0

    };

    const method =
        body.id_hotspots
            ? "PUT"
            : "POST";

    const url =
        body.id_hotspots
            ? `/api/navegation/${body.id_hotspots}`
            : "/api/navegation";

    const res =
        await fetch(url,{

            method,

            headers:{


                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify(body)

        });

    if(res.ok){

        alert("Guardado correctamente");

        closehotspotModal();

        loadNavegationTable();

    }else{

        console.error(await res.text());

        alert("Error guardando hotspot");

    }

}

/*=============================================
=            LIMPIAR                          =
=============================================*/


function resetHotspotForm(){

    document
        .getElementById("hotspotForm")
        .reset();

    document
        .getElementById("id_hotspots")
        .value = "";

}