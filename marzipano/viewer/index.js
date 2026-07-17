// index.js (Al principio del archivo)
import { renderAdminModal } from './components/adminModal.component.js';
import { initAdminModalController } from './controllers/adminModal.controller.js';

// Variables globales y elementos DOM
const viewerElement = document.getElementById('viewer'); 
const sceneNameElement = document.querySelector('#titleBar .sceneName'); 
const sceneInfo = document.getElementById('scene-info'); 
const zoomInBtn = document.getElementById('zoom-in'); 
const zoomOutBtn = document.getElementById('zoom-out'); 
const arrowLeft = document.getElementById('arrow-left'); 
const arrowRight = document.getElementById('arrow-right'); 
const fullscreenToggle = document.getElementById("fullscreenToggle"); 
const fullscreenIcons = fullscreenToggle.querySelectorAll("img"); 
const sceneListToggle = document.getElementById("sceneListToggle"); 
const sceneListElement = document.getElementById("sceneList");
const sidebar = document.getElementById('sidebar');
const viewerDiv = document.getElementById('viewer');
const toggleBtn = document.getElementById('toggle-sidebar');
//const API_BASE = "https://webservice-map360.onrender.com";
const API_BASE = "http://localhost:5000";// IP local para pruebas
//const API_BASE = "http://192.168.137.16:5000";// IP local para pruebas
//const API_WEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather";

// Elementos para interacción con contraseña
let currentInteraction = null;

// Funciones para el modal de contraseña
function openPasswordModal(interaction) {
  currentInteraction = interaction;

  const modal = document.getElementById("passwordModal");
  const input = document.getElementById("interactionPassword");
  const errorText = document.getElementById("passwordError");

  if (!modal || !input) {
    console.error("Modal o input no encontrados");
    return;
  }

  input.value = "";
  errorText.textContent = "";
  modal.classList.remove("hidden");
}

function closePasswordModal() {
  const modal = document.getElementById("passwordModal");
  if (modal) modal.classList.add("hidden");
}

// Esto se puede integrar con el flujo de carga que ya tengas establecido
document.addEventListener('DOMContentLoaded', () => {
  const botonLlave = document.getElementById('control_access');

  if (botonLlave) {
    renderAdminModal();
    initAdminModalController(botonLlave);
  }
});

// Configuración de eventos para el modal de contraseña
document.addEventListener("DOMContentLoaded", () => {
  const btnCancel = document.getElementById("passwordCancel");
  const btnSubmit = document.getElementById("passwordSubmit");
  const input = document.getElementById("interactionPassword");
  const errorText = document.getElementById("passwordError");

  if (!btnCancel || !btnSubmit) {
    console.error("Botones del modal no encontrados");
    return;
  }

  btnCancel.onclick = closePasswordModal;

  btnSubmit.onclick = async () => {
    if (!currentInteraction) return;

    const password = input.value;

    try {
      const res = await fetch(
        `/api/interactions/${currentInteraction.id_interactions}/pass_word`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      if (!res.ok) {
        errorText.textContent = "❌ Contraseña incorrecta";
        return;
      }

      closePasswordModal();

      if (currentInteraction.link) {
        window.open(currentInteraction.link, "_blank");
      }
    } catch (err) {
      errorText.textContent = "❌ Error del servidor";
    }
  };
});

// =================== SIMULADOR DE ESTADO DEL PARQUE ===================
function getFakeParkData() {

  const TOTAL_CUPOS = 150;

  const now = new Date();

  //Fecha completa
  const date = now.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const hour = now.getHours();
  const day = now.getDay(); // 0 = domingo, 6 = sábado

  //Estado según día y hora
  let state = "Cerrado";

  const esFinDeSemana = (day === 0 || day === 6);
  const enHorario = (hour >= 8 && hour < 22);

  if (!esFinDeSemana && enHorario) {
    state = "Abierto";
  }

  //Espacios libres simulados
  let libres = Math.floor(Math.random() * TOTAL_CUPOS);

  // Nivel de ocupación
  let crowd;
  if (libres < 40) {
    crowd = "Baja";
  } else if (libres >= 40 && libres <= 80) {
    crowd = "Media";
  } else {
    crowd = "Alta";
  }

  //Si está cerrado
  if (state === "Cerrado") {
    libres = TOTAL_CUPOS;
    crowd = "Cerrado";
  }

  // 🕒 Hora
  const time = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return {
    state,        // Abierto / Cerrado
    crowd,        // Alta / Media / Baja / Cerrado
    libres,       // Cupos disponibles
    date,         // Fecha completa
    updatedAt: time
  };
}


//console.log(getFakeParkData());

// Obtener el parámetro 'id' de la URL
const urlParams = new URLSearchParams(window.location.search);
const sceneIdFromUrl = urlParams.get('id'); // esto devuelve "10" si la URL es ?id=10
//console.log('sceneIdFromUrl:', sceneIdFromUrl);
 
// Inicializar Marzipano 
viewerElement.style.width = window.innerWidth + 'px';
viewerElement.style.height = window.innerHeight + 'px';
const viewer = new Marzipano.Viewer(viewerElement);

// Autorotación Pantalla
const autorotate = Marzipano.autorotate({
  yawSpeed: 0.03,          // velocidad de rotación horizontal
  targetPitch: 0,          // mantiene la vista centrada verticalmente
  targetFov: Math.PI / 2   // campo de visión (FOV)
});

// Habilitar o no según configuración (puedes dejarlo fijo en true)
const autorotateEnabled = false;

// Si quieres un botón de toggle, asegúrate de tener uno en el HTML con id="autorotateToggle"

const autorotateToggleElement = document.getElementById('autorotateToggle');

if (autorotateEnabled) {
  viewer.startMovement(autorotate);
  viewer.setIdleMovement(3000, autorotate); // empieza después de 3 segundos de inactividad
  if (autorotateToggleElement) autorotateToggleElement.classList.add('enabled');
}

if (autorotateToggleElement) {
  autorotateToggleElement.addEventListener('click', () => {
    if (autorotateToggleElement.classList.contains('enabled')) {
      viewer.stopMovement();
      viewer.setIdleMovement(Infinity);
      autorotateToggleElement.classList.remove('enabled');
    } else {
      viewer.startMovement(autorotate);
      viewer.setIdleMovement(3000, autorotate);
      autorotateToggleElement.classList.add('enabled');
    }
  });
}

// Gestión de Escenas y Hostpots
// Variables globales
let allScenes = [];
let cachedScenes = new Map(); // Cache de escenas ya creadas
let currentScene = null;
let currentView = null;
let currentIndex = 0;
let allRoutes = [];
let navigationMode = false;
let currentRouteSteps = [];
let currentStepIndex = 0;
let nextHotspotId = null; // hotspot a seguir
let sidebarOpen = true;
let activeRoute = [];
let randomModeActive = false; // estado del modo aleatorio

async function loadScenes() {
  sceneInfo.innerHTML = '<p>⏳ Cargando datos de las escenas...</p>';

  try {
    const response = await fetch(`${API_BASE}/api/scenes`);
    allScenes = await response.json();
    allScenes = allScenes.filter(s => s.is_active);
    

    if (!allScenes.length) {
      sceneInfo.innerHTML = '<p>No hay escenas disponibles.</p>';
      return;
    }

    // Escena inicial por defecto
    let initialSceneId = allScenes[0].id_scene;

    if (sceneIdFromUrl !== null) {
      // Convertir todo a string para evitar problemas
      const sceneIdStr = String(sceneIdFromUrl);
      const sceneExists = allScenes.find(s => String(s.id_scene) === sceneIdStr);
      if (sceneExists) initialSceneId = sceneExists.id_scene;
      //console.log(`🔹 Escena inicial desde URL: id_scene=${initialSceneId}`);
    }

    // Buscar la escena
    const initialScene = allScenes.find(s => s.id_scene == initialSceneId);
    //console.log('initialScene encontrada:', initialScene);
    if (initialScene) {
      currentIndex = allScenes.indexOf(initialScene);
      await loadScene(initialScene);
      //console.log(`✅ Escena inicial cargada: ${initialScene.scene_description}`);
    } else {
      console.warn(`⚠️ Escena con id_scene=${initialSceneId} no encontrada. Cargando la primera.`);
      currentIndex = 0;
      await loadScene(allScenes[0]);
    }
    
    // Limpiar la URL para que quede como la original sin parámetros
    if (sceneIdFromUrl !== null) {
      history.replaceState(null, '', window.location.pathname);
      console.log('🔹 URL limpiada:', window.location.href);
    }

    // Renderizar lista de escenas, autocompletado y rutas
    renderSceneList();
    fillDestinationList();
    await loadRoutes();

  } catch (err) {
    console.error('Error cargando escenas:', err);
    sceneInfo.innerHTML = '<p>Error cargando escenas</p>';
  }
}

// Render sidebar + título
function renderSidebar(scene) {
  const hotspots = scene.hotspots || []; // fallback seguro
  sceneInfo.innerHTML = `
    <span class="label_title">${scene.scene_description}</span>
    <p><br></p>
    <p><span class="label">Tipo:</span> ${scene.name_kind}</p>
    <p><span class="label">Piso:</span> ${scene.name_floor}</p>
    <p><span class="label">Torre:</span> ${scene.name_tower}</p>
    <p><span class="label">Orientación:</span> ${scene.name_orientation}</p>
    <span class="label"><h4>Hotspots:</h4></span>
    <p><span class="label">Información:</span></p><br>
    <ul class="hotspot-list">${hotspots.filter(h => h.icon_id === 1).map(h => `<li>${h.title}</li>`).join('')}</ul>
    <br><p><span class="label">Navegación:</span></p><br>
    <ul class="hotspot-list">${hotspots.filter(h => h.icon_id === 2).map(h => `<li>${h.title}</li>`).join('')}</ul>
    <!--<p><span class="label">Descripción:</span></p>-->
    <!--<ul>${hotspots.map(h => `<li>${h.description}</li>`).join('')}</ul>-->
  `;
  sceneNameElement.textContent = scene.scene_description;
}

// Load scene con reintentos
async function loadScene(scene, retryCount = 0) {
  try {
    // Render sidebar solo si NO estamos en navegación
    if (!navigationMode) renderSidebar(scene);

    // Si la escena no está cacheada, la creamos
    if (!cachedScenes.has(scene.id_scene)) {
      const source = Marzipano.ImageUrlSource.fromString(scene.imagen_url);
      const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
      const limiter = Marzipano.RectilinearView.limit.traditional(1024, 120 * Math.PI / 180);
      const view = new Marzipano.RectilinearView(null, limiter);
      const createdScene = viewer.createScene({
        source,
        geometry,
        view,
        pinFirstLevel: true
      });

      const hotspotMap = {}; // <-- mapa id_hotspots → elemento DOM

      (scene.hotspots || []).forEach(h => {
        const wrapper = document.createElement("div");
        wrapper.className = "hotspot-info";
        wrapper.setAttribute("data-hotspot-id", h.id_hotspots);

        const icon = document.createElement('img');
        icon.src = h.icon_url && h.icon_url.trim() !== "" 
          ? h.icon_url 
          : "https://cdn-icons-png.flaticon.com/512/684/684908.png";
        icon.classList.add('hotspot-icon');
        wrapper.appendChild(icon);

        const titleBox = document.createElement("div");
        titleBox.className = "hotspot-info-title";
        titleBox.textContent = h.title;
        titleBox.style.display = "none";
        wrapper.appendChild(titleBox);

        if (h.icon_id === 1) {
          // Hotspot de información
          const descBox = document.createElement("div");
          descBox.className = "hotspot-info-desc";
          descBox.innerHTML = `<div class="hotspot-info-header"><span>ℹ️ ${h.title}</span><button class="hotspot-info-close">✖</button></div><p>${h.description}</p>`;
          descBox.style.display = "none";
          wrapper.appendChild(descBox);

          let expanded = false;
          wrapper.addEventListener("mouseenter", () => { titleBox.style.display = "block"; });
          wrapper.addEventListener("mouseleave", () => { if (!expanded) titleBox.style.display = "none"; });

          wrapper.addEventListener("click", () => {
            expanded = !expanded;
            descBox.style.display = expanded ? "block" : "none";
            titleBox.style.display = expanded ? "none" : "block";
          });

          descBox.querySelector(".hotspot-info-close").addEventListener("click", (e) => {
            e.stopPropagation();
            descBox.style.display = "none";
            expanded = false;
          });
        }

        // Hotspot de navegación
        if (h.icon_id === 2) {
          wrapper.addEventListener("mouseenter", () => { titleBox.style.display = "block"; });
          wrapper.addEventListener("mouseleave", () => { titleBox.style.display = "none"; });
          wrapper.addEventListener("click", () => {
            if (navigationMode && nextHotspotId && h.id_hotspots === nextHotspotId) {
              goToStep(currentStepIndex + 1);
            } else if (!navigationMode && h.link_scene_id) {
              const nextScene = allScenes.find(s => s.id_scene === h.link_scene_id);
              if (nextScene) {
                currentIndex = allScenes.indexOf(nextScene);
                switchScene(nextScene);
                renderSidebar(nextScene);
                updateActiveSceneMarker();
              }
            }
          });

          // Aplicar rotación si existe
          const transformProps = ['-ms-transform','-webkit-transform','transform'];
          transformProps.forEach(prop => { icon.style[prop] = `rotate(${h.rotation}rad)`; });
        }

        hotspotMap[h.id_hotspots] = wrapper;
        createdScene.hotspotContainer().createHotspot(wrapper, { yaw: h.yaw, pitch: h.pitch });
      });

      //Interacciones
      const interactionsMap = {}; // <-- mapa id_interactions → elemento DOM

      (scene.interactions || []).forEach(r => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("hotspot-wrapper");

        const titleBox = document.createElement("div");
        titleBox.className = "hotspot-info-title";
        titleBox.textContent = r.title;
        titleBox.style.display = "none";
        wrapper.appendChild(titleBox);

        // Interacción 1 información  
        if (r.type === 1) {
          
          const descBox = document.createElement("div");
          descBox.classList.add("textInfo");
          //console.log(r.icon_id);
        // hotspotconst icon = document.createElement('img');
          if (r.icon_id == 1) {
            const hotspot = document.createElement("div");
            hotspot.classList.add("hotspot");
            hotspot.innerHTML = `<div class="out"></div><div class="in"></div>`;
            descBox.appendChild(hotspot);
          } else {
            const hotspot = document.createElement("div");
            const icon = document.createElement('img');
            icon.src = r.icon_url && r.icon_url.trim() !== "" 
              ? r.icon_url 
              : "https://cdn-icons-png.flaticon.com/512/684/684908.png";
            icon.classList.add('hotspot-icon2');
            hotspot.appendChild(icon);
            descBox.appendChild(hotspot);
          }
          // tooltip
          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-content");
          tooltip.innerHTML = `<div class="hotspot-info-header"><span>ℹ️ ${r.title}</span></div><p>${r.description}</p>`;
          descBox.appendChild(tooltip);

          wrapper.appendChild(descBox);

          let clickTimer = null;
          const CLICK_DELAY = 250; // ms

          // CLICK PROTEGIDO → comprobar contraseña y abrir link
          wrapper.addEventListener("click", () => {
            clickTimer = setTimeout(() => {

              if (r.link) {
                window.open(r.link, "_blank");
              }
            }, CLICK_DELAY);
          });
        }
        
        // Interacción 2 pantalla
        if (r.type === 2) {
          const width = r.width_px || 320;    // ancho por defecto
          const height = r.height_px || 180;  // alto por defecto
    
          const descBox = document.createElement("div");
          descBox.classList.add("iframespot-content");
          descBox.style.width = width + "px";
          descBox.style.height = height + "px";

          // Mensaje inicial
           const message = document.createElement("div");
           message.classList.add("message");
           message.textContent = "Presione para ver el contenido!";
           message.style.display = "none"; // Oculta el mensaje inicialmente
           descBox.appendChild(message);
           
          
          // Crear iframe pero no agregarlo todavía
          const iframe = document.createElement("iframe");
          iframe.src = r.link;
          iframe.width = width
          iframe.height = height;
          iframe.style.border = "0";
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.display = "block";

          // Inicialmente oculto
          //iframe.style.display = "none";
          descBox.appendChild(iframe);

          wrapper.appendChild(descBox);

          // 🔘 Botón flotante
          const toggleBtnscreen = document.createElement("button");
          toggleBtnscreen.classList.add("iframe-toggle-btn");
          toggleBtnscreen.textContent = "—"; // icono minimizar

          descBox.appendChild(toggleBtnscreen);

          let minimized = false;

          toggleBtnscreen.addEventListener("click", (e) => {
            e.stopPropagation();

            minimized = !minimized;

            if (minimized) {
              descBox.classList.add("minimized");
              toggleBtnscreen.textContent = "⬜"; // restaurar
            } else {
              descBox.classList.remove("minimized");
              toggleBtnscreen.textContent = "—"; // minimizar
            }
          });

          let expanded = false;

          // wrapper.addEventListener("click", () => {
          //   expanded = !expanded;
          //   if (expanded) {
          //     message.style.display = "none"; // Oculta el mensaje
          //     iframe.style.display = "block";  // Muestra el iframe
          //     titleBox.style.display = "none";
          //   } else {
          //     message.style.display = "block"; // Vuelve a mostrar el mensaje
          //     iframe.style.display = "none";    // Oculta el iframe
          //     titleBox.style.display = "block";
          //   }
          // });
        }

        // Interacción 3 APIs
        if (r.type === 3) {

          //const API_KEY_WEATHER='6d416edfec1ce5ad425a02f84f2e5086';
          const API_WEATHER_BASE = r.link; // URL base para la API del clima (debe venir en el campo 'link' de la interacción)
          const API_KEY_WEATHER = r.api_key; // Clave de API para el servicio del clima (debe venir en el campo 'api_key' de la interacción)
          
          // Función para obtener datos del clima usando la API
          async function fetchAPI() {
            const separator = API_WEATHER_BASE.includes("?") ? "&" : "?";
            const url = `${API_WEATHER_BASE}${separator}${API_KEY_WEATHER}`;
            //const response = await fetch(`${API_WEATHER_BASE}?q=Seville&appid=${API_KEY_WEATHER}&units=metric&lang=es`);
            const response = await fetch(url);
            const weatherData = await response.json();
            return weatherData;
          }
          
          // Función para formatear la fecha y hora actual en español
          function fechaFormateada() {
            const fecha = new Date();

            const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

            const diaSemana = dias[fecha.getDay()];
            const dia = fecha.getDate();
            const mes = meses[fecha.getMonth()];
            const año = fecha.getFullYear();

            const horas = String(fecha.getHours()).padStart(2, "0");
            const minutos = String(fecha.getMinutes()).padStart(2, "0");

            return `${diaSemana}, ${dia} ${mes} ${año} ${horas}:${minutos}`;
          }
          
          // Función para obtener un valor de un objeto anidado usando una ruta tipo "main.temp" o "weather[0].description"
          function getValueFromPath(obj, path) {

            return path
              .replace(/\[(\d+)\]/g, ".$1") // convierte [0] → .0
              .split(".")
              .reduce((acc, part) => acc?.[part], obj);

          }

          // Función para reemplazar placeholders en la plantilla con valores de los datos de la API  
          function mapTemplate(template, data) {
            return template.replace(/{(.*?)}/g, (_, path) => {
              const value = getValueFromPath(data, path.trim());
              return value ?? "N/A";
            });
          }

          // function getValueFromPath(obj, path) {
          //   return path.split(".").reduce((acc, part) => acc?.[part], obj);
          // }

          // Función para construir el texto del tooltip a partir de la descripción y los datos de la API
          function buildApiText(template, data, showDate) {

            let result = mapTemplate(template, data);

            // convertir ; en saltos de línea HTML
            result = result.split(";").join("<br>");

            if (showDate) {
              result = `Actualizado: ${fechaFormateada()}<br>` + result;
            }

            return result;
          }

          // Obtener datos del clima y mostrar tooltip
          fetchAPI().then(apiData => {
            
            // Puedes usar los datos del clima aquí
            const apiInfo = buildApiText(
              r.description,      // 👈 lo que viene de BD
              apiData,            // 👈 respuesta API
              r.update_api        // 👈 mostrar fecha solo si es true
            );
            
            const descBox = document.createElement("div");
            descBox.classList.add("textInfo");
            
            const hotspot = document.createElement("div");
            const icon = document.createElement('img');
            icon.src = r.icon_url && r.icon_url.trim() !== "" 
              ? r.icon_url 
              : "https://cdn-icons-png.flaticon.com/512/684/684908.png";
            icon.classList.add('hotspot-icon2');
            hotspot.appendChild(icon);
            descBox.appendChild(hotspot);

            // tooltip
            const tooltip = document.createElement("div");
            tooltip.classList.add("tooltip-content");
            tooltip.innerHTML = `<div class="hotspot-info-header"><span>${r.title}</span></div><p>${apiInfo}</p>`;
            descBox.appendChild(tooltip);

            wrapper.appendChild(descBox);
          });
        }

        // Interacción 4 foto
        if (r.type === 4) {
          
          const descBox = document.createElement("div");
          descBox.classList.add("reveal");

          const icon = document.createElement('img');
          icon.src = r.icon_url && r.icon_url.trim() !== "" 
            ? r.icon_url 
            : "https://cdn-icons-png.flaticon.com/512/684/684908.png";
          //icon.classList.add('hotspot-icon');
          descBox.appendChild(icon);

          // tooltip
          const tooltip = document.createElement("div");
          tooltip.classList.add("reveal-content");
          tooltip.innerHTML = `<p>${r.title || ""}</p><img src="${r.link || ""}" alt="Imagen" style="width:100%;">`;
          descBox.appendChild(tooltip);

          wrapper.appendChild(descBox);

          let clickTimer = null;
          const CLICK_DELAY = 250; // ms

          // CLICK SIMPLE → abrir imagen/link
          wrapper.addEventListener("click", () => {
            clickTimer = setTimeout(() => {
              if (r.link) {
                window.open(r.link, "_blank");
              }
            }, CLICK_DELAY);
          });
        }

        // Interacción 5 - Estado dinámico del parqueadero
        if (r.type === 5) {

          const descBox = document.createElement("div");
          descBox.classList.add("textInfo");

          const hotspot = document.createElement("div");
          const icon = document.createElement('img');
          icon.src = r.icon_url && r.icon_url.trim() !== ""
            ? r.icon_url
            : "https://cdn-icons-png.flaticon.com/512/854/854878.png";
          icon.classList.add('hotspot-icon2');
          hotspot.appendChild(icon);
          descBox.appendChild(hotspot);

          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-content");
          descBox.appendChild(tooltip);

          wrapper.appendChild(descBox);

          //Actualiza la información simulada
          function updateParkInfo() {
            const data = getFakeParkData();
            tooltip.innerHTML = `
              <div class="hotspot-info-header">
                <span>🌳 ${r.title || "Estado del Parqueadero"}</span>
              </div>
              <p><b>Estado:</b> ${data.state}</p>
              <p><b>Afluencia:</b> ${data.crowd}</p>
              <p><b>Plazas Libres:</b> ${data.libres} / 150</p>
              <p style="font-size:11px;color:#aaa">
                Última actualización: ${data.date}</p>
              <p>${data.updatedAt}</p>
            `;
          }

          // Primera carga
          updateParkInfo();

          // Refrescar cada 10 segundos
          const intervalId = setInterval(updateParkInfo, 3000);

          // Limpieza (por seguridad al cambiar de escena)
          wrapper.addEventListener("remove", () => clearInterval(intervalId));
        }

        // Interacción 6 - Hotspot personalizado con password  
        if (r.type === 6) {
          
          const descBox = document.createElement("div");
          descBox.classList.add("textInfo");
          
          if (r.icon_id == 1) {
            const hotspot = document.createElement("div");
            hotspot.classList.add("hotspot");
            hotspot.innerHTML = `<div class="out"></div><div class="in"></div>`;
            descBox.appendChild(hotspot);
          } else {
            const hotspot = document.createElement("div");
            const icon = document.createElement('img');
            icon.src = r.icon_url && r.icon_url.trim() !== "" 
              ? r.icon_url 
              : "https://cdn-icons-png.flaticon.com/512/684/684908.png";
            icon.classList.add('hotspot-icon2');
            hotspot.appendChild(icon);
            descBox.appendChild(hotspot);
          }
          // tooltip
          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-content");
          tooltip.innerHTML = `<div class="hotspot-info-header"><span>ℹ️ ${r.title}</span></div><p>${r.description}</p>`;
          descBox.appendChild(tooltip);

          wrapper.appendChild(descBox);

          let clickTimer = null;
          const CLICK_DELAY = 250; // ms

          // CLICK PROTEGIDO → comprobar contraseña y abrir link
          wrapper.addEventListener("click", () => {
            clickTimer = setTimeout(() => {
              openPasswordModal(r);
            }, CLICK_DELAY);
          });
        }


        interactionsMap[r.id_interactions] = wrapper;
        function buildPerspective(p,e) {
          const radius = Number(r.radius);
          const extraTransforms = `rotateX(${r.rotation}deg)`;
          return { perspective: { radius, extraTransforms } };
        }
        const pos = { yaw: r.yaw, pitch: r.pitch };
        const opts = buildPerspective(r.radius, r.rotation);
        
        // Llamada segura
        if (opts) {
          createdScene.hotspotContainer().createHotspot(wrapper, pos, opts);
        } else {
          createdScene.hotspotContainer().createHotspot(wrapper, pos);
        }

        // guardar referencia por si luego la necesitas
        interactionsMap[r.id_interactions] = wrapper; //685
        let clickTimer = null;
        const CLICK_DELAY = 250; // ms

        // DOBLE CLICK → ir a admin/login
        wrapper.addEventListener("dblclick", () => {
          // cancelar el click simple
          clearTimeout(clickTimer);
          clickTimer = null;

          const url = `/admin/login?id_interaction=${r.id_interactions}`;
          window.open(url, "_blank");
        });

      });

      

      cachedScenes.set(scene.id_scene, { scene: createdScene, view, hotspots: scene.hotspots, hotspotMap, interactions: scene.interactions, interactionsMap } ,);
    }
    // Cambiar escena y actualizar el índice actual
    const cached = cachedScenes.get(scene.id_scene);
    if (cached) {
      cached.scene.switchTo();
      currentScene = scene; // ← guarda el objeto de datos actual (no el objeto Marzipano)
      currentView = cached.view;
      currentIndex = allScenes.findIndex(s => s.id_scene === scene.id_scene);
      //console.log("Escena activa:", scene.scene_description, "Index:", currentIndex);
    }

    // Actualizar barra superior SIEMPRE
    const titleEl = document.querySelector('#titleBar .sceneName');
    if (titleEl) {
      titleEl.textContent = scene.scene_description || "Escena sin nombre";
    }

    // Resaltar hotspot activo si estamos en navegación
    if (navigationMode && nextHotspotId) highlightActiveHotspot(scene);

    updateActiveSceneMarker();

  } catch (err) {
    if (retryCount < 5) {
      console.warn(`SwitchScene falló, reintentando en 50ms... (${retryCount + 1})`);
      setTimeout(() => loadScene(scene, retryCount + 1), 50);
    } else {
      console.error("No se pudo cargar la escena después de 5 intentos", err);
      sceneInfo.innerHTML = "<p>Error cargando escena</p>";
    }
  }
}

// Fullscreen
function updateFullscreenIcons() {
  if (document.fullscreenElement) {
    fullscreenIcons[0].style.display = "none"; 
    fullscreenIcons[1].style.display = "inline"; 
  } else {
    fullscreenIcons[0].style.display = "inline";
    fullscreenIcons[1].style.display = "none";
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

fullscreenToggle.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", updateFullscreenIcons);
updateFullscreenIcons();

// Zoom
zoomInBtn.addEventListener('click', () => {
  if (currentView) currentView.setFov(Math.max(currentView.fov() - 0.1, 0.001));
});
zoomOutBtn.addEventListener('click', () => {
  if (currentView) currentView.setFov(Math.min(currentView.fov() + 0.1, 4.0));
});

// Modo Aleatorio
document.getElementById("aletorio").addEventListener("click", () => {
  randomModeActive = !randomModeActive; // alternar modo ON/OFF

  const btn = document.getElementById("aletorio");
  const tooltip = btn.nextElementSibling; // tooltip span
  
  if (randomModeActive) {
    btn.classList.add("enabled");
    btn.title = "Desactivar aleatorio activado";
    tooltip.textContent = "Desactivar aleatorio activado";
    tooltip.classList.add("active");   
    //btn.style.backgroundColor = "#4CAF50";
    //btn.textContent = "⟳ Modo Aleatorio (ON)";
    //console.log("Modo Aleatorio ACTIVADO");

    // Iniciar cambio aleatorio
    startRandomSceneRotation();

  } else {
    btn.classList.remove("enabled");
    btn.title = "Activar modo aleatorio";
    tooltip.textContent = "Activar modo aleatorio";
    tooltip.classList.remove("active");
    //btn.style.backgroundColor = "";
    //btn.textContent = "⟳ Modo Aleatorio (OFF)";
    //console.log("Modo Aleatorio DESACTIVADO");

    // Detener temporizador
    clearTimeout(window.autoSceneTimer);
  }
});

function startRandomSceneRotation() {
  clearTimeout(window.autoSceneTimer);

  // evitar cambios si estás navegando
  if (navigationMode || !randomModeActive) return;

  window.autoSceneTimer = setTimeout(() => {
    if (!navigationMode && randomModeActive && allScenes.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * allScenes.length);
      } while (randomIndex === currentIndex);

      const randomScene = allScenes[randomIndex];
      //console.log("🎲 Cambio aleatorio a escena:", randomScene.scene_description);

      const cached = cachedScenes.get(randomScene.id_scene);
      if (cached) {
        currentScene = randomScene; // objeto de datos
        currentView = cached.view;
        currentIndex = randomIndex;
        viewer.switchScene(cached.scene, cached.view, { transitionDuration: 1000 });
        sceneNameElement.textContent = randomScene.scene_description;
        updateActiveSceneMarker();
        renderSidebar(randomScene);
      } else {
        loadScene(randomScene);
      }
    }

    // reinicia el ciclo mientras siga activo
    if (randomModeActive) startRandomSceneRotation();

  }, 10000); // cambia cada 10s (ajústalo)
}

// ------------------- Menú de escenas -------------------
function showSceneList() {
  sceneListElement.classList.add('enabled');
  sceneListToggle.classList.add('enabled');
}
function hideSceneList() {
  sceneListElement.classList.remove('enabled');
  sceneListToggle.classList.remove('enabled');
}
function toggleSceneList() {
  sceneListElement.classList.toggle('enabled');
  sceneListToggle.classList.toggle('enabled');
}
sceneListToggle.addEventListener("click", toggleSceneList);

function renderSceneList() {
  if (!allScenes.length) return;
  sceneListElement.innerHTML = "";

  // Agrupar por torre y piso
  const grouped = {};
  allScenes.forEach(scene => {
    // Mapear floor_id: 6 → 0, 7 → -1, 8 → -2
    let mappedFloorId = scene.floor_id;
    if (mappedFloorId === 6) mappedFloorId = 0;
    else if (mappedFloorId === 7) mappedFloorId = -1;
    else if (mappedFloorId === 8) mappedFloorId = -2;
    
    if (!grouped[scene.name_tower]) grouped[scene.name_tower] = {};
    if (!grouped[scene.name_tower][mappedFloorId]) {
      grouped[scene.name_tower][mappedFloorId] = {
        name_floor: scene.name_floor,id_floor: mappedFloorId,
        scenes: []
      };
    }
    grouped[scene.name_tower][mappedFloorId].scenes.push(scene);
  });

  // Recorrer torres
  Object.entries(grouped).forEach(([tower, floors]) => {
    const towerLi = document.createElement("li");
    towerLi.textContent = tower;
    towerLi.classList.add("tower-item");

    const floorUl = document.createElement("ul");
    floorUl.style.display = "none";

    towerLi.addEventListener("click", () => {
      floorUl.style.display = floorUl.style.display === "none" ? "block" : "none";
    });

    // Ordenar pisos por mappedFloorId
    const sortedFloors = Object.entries(floors).sort(
      ([idA], [idB]) => Number(idA) - Number(idB)
    );

    sortedFloors.forEach(([mappedFloorId, floorData]) => {
      const floorLi = document.createElement("li");
      floorLi.textContent = `Piso ${floorData.name_floor}`;
      floorLi.classList.add("floor-item");

      const sceneUl = document.createElement("ul");
      sceneUl.style.display = "none";

      floorLi.addEventListener("click", (e) => {
        e.stopPropagation();
        sceneUl.style.display = sceneUl.style.display === "none" ? "block" : "none";
      });

      // Ordenar escenas si lo deseas (por id_scene o por descripción)
      const sortedScenes = floorData.scenes.sort((a, b) => a.id_scene - b.id_scene);

      sortedScenes.forEach(scene => {
        const sceneLi = document.createElement("li");
        sceneLi.textContent = scene.scene_description;
        sceneLi.classList.add("scene-item");

        // 👇 Agregamos el atributo con el id_scene
        sceneLi.setAttribute("data-scene-id", scene.id_scene);

        sceneLi.addEventListener("click", (e) => {
          e.stopPropagation();
          currentIndex = allScenes.indexOf(scene);
          loadScene(scene);
          hideSceneList();
          updateActiveSceneMarker();
        });

        sceneUl.appendChild(sceneLi);
      });

      floorLi.appendChild(sceneUl);
      floorUl.appendChild(floorLi);
    });

    towerLi.appendChild(floorUl);
    sceneListElement.appendChild(towerLi);
  });

  updateActiveSceneMarker();
}

// ------------------- 📍 Marcar escena actual -------------------
function updateActiveSceneMarker() {
  const allItems = document.querySelectorAll(".scene-item");
  // Limpia el marcador de todos
  allItems.forEach(li => {
    li.textContent = li.textContent.replace("📍", "").trim();
  });

  if (allScenes.length) {
    const currentSceneObj = allScenes[currentIndex];
    // Buscar por id_scene en lugar de textContent
    const activeLi = document.querySelector(`.scene-item[data-scene-id="${currentSceneObj.id_scene}"]`);
    if (activeLi) {
      activeLi.textContent = "📍 " + activeLi.textContent;
    }
  }
}

// =================== 🔎 Autocompletado de destinos ===================
function fillDestinationList() {
  const datalist = document.getElementById("scene-list");
  datalist.innerHTML = ""; // limpiar antes de rellenar
  allScenes.forEach(scene => {
    const option = document.createElement("option");
    option.value = scene.scene_description;
    datalist.appendChild(option);
  });
}

// =================== RUTAS DINÁMICAS MULTI-SALTO ===================

async function loadRoutes() {
  try {
    const response = await fetch(`${API_BASE}/api/routes`);
    allRoutes = await response.json();
  } catch (err) {
    console.error("Error cargando rutas:", err);
  }
}

// =================== GRAFO Y DIJKSTRA ===================
function buildGraph() {
  const graph = {};

  allRoutes.forEach(r => {
    const from = String(r.from_scene_id);
    const to = String(r.to_scene_id);
    const hotspot_id = r.hotspot_id; // ID del hotspot que conecta from → to

    if (!from || !to) {
      console.warn("Ruta ignorada por falta de IDs:", r);
      return;
    }

    if (!graph[from]) graph[from] = [];
    graph[from].push({
      to,
      weight: Number(r.weight || 1),
      reason: r.penalty_reason || "sin descripción",
      hotspot_id: hotspot_id || null
    });
  });

  //console.log("✅ Grafo construido correctamente:", graph);
  return graph;
}

function findShortestPath(startId, endId) {
  const graph = buildGraph();
  const distances = {};
  const previous = {};
  const unvisited = new Set(allScenes.map(s => String(s.id_scene)));

  allScenes.forEach(s => {
    distances[String(s.id_scene)] = Infinity;
    previous[String(s.id_scene)] = null;
  });
  const startStr = String(startId);
  const endStr = String(endId);
  distances[startStr] = 0;

  while (unvisited.size > 0) {
    let current = null;
    let minDist = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    }

    if (current === null || distances[current] === Infinity) break;
    unvisited.delete(current);

    const neighbors = graph[current] || [];
    neighbors.forEach(edge => {
      const alt = distances[current] + edge.weight;
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
        previous[edge.to] = { id: current, reason: edge.reason, hotspot_id: edge.hotspot_id};
      }
    });
  }

  // Reconstrucción de ruta
  const path = [];
  let u = endStr;
  while (previous[u]) {
    path.unshift({ from: previous[u].id, to: u, hotspot_id: previous[u].hotspot_id,reason: previous[u].reason });
    u = previous[u].id;
  }
  return path;
}

// =================== MOSTRAR INSTRUCCIONES ===================
function showRouteInstructions(path) {
  if (!path.length) {
    sceneInfo.innerHTML = `<p style="color:red">⚠️ No se encontró ruta.</p>`;
    document.getElementById("btn-clear-ruta").style.display = "block";
    return;
  }
  startNavigation(path); // 👈 ahora arranca modo navegación
}

// =================== EVENTOS DE BOTONES ===================
document.getElementById("btn-ruta").addEventListener("click", async() => {
  // Leer y normalizar el texto ingresado
  let destDesc = document.getElementById("destination").value.trim();

  destDesc = destDesc.trim();                     // quitar espacios inicio/fin
  destDesc = destDesc.replace(/\s+/g, " ");       // convertir múltiples espacios en 1
  destDesc = destDesc.toLowerCase();              // ignorar mayúsculas/minúsculas

  if (!destDesc) return alert("⚠️ Escribe un destino.");

  try {
    const res = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(destDesc)}`);
    const data = await res.json();
    //console.log(destDesc,res, data);

    if (data.exact) {
      // ✅ Coincidencia exacta: seguir con tu lógica
      const startId = allScenes[currentIndex].id_scene;
      const endId = data.exact.id_scene;
      const path = findShortestPath(startId, endId);
      //console.log("Ruta calculada:", startId, "→", endId, path);
      showRouteInstructions(path);

      // Mostrar botones de navegación
      document.getElementById("btn-forward").style.display = "inline-block";
      document.getElementById("btn-backward").style.display = "inline-block";
      document.getElementById("btn-clear-ruta").style.display = "inline-block";
    } else if (data.similar.length > 0) {
      // ⚙️ Mostrar opciones al usuario
      showSuggestions(data.similar);
    } else {
      alert("❌ No se encontraron coincidencias.");
    }
  } catch (err) {
    console.error("Error al buscar:", err);
    alert("Error conectando con el servidor.");
  }
});

// Mostrar sugerencias si no hay coincidencia exacta
function showSuggestions(similarScenes) {
  const container = document.getElementById("suggestions");
  container.innerHTML = ""; // limpia anteriores
  similarScenes.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s.scene_description;
    btn.className = "suggestion-btn";
    btn.addEventListener("click", () => {
      const startId = allScenes[currentIndex].id_scene;
      const endId = s.id_scene;
      const path = findShortestPath(startId, endId);
      showRouteInstructions(path);
      container.innerHTML = "";
      // Mostrar botones de navegación
      document.getElementById("btn-forward").style.display = "inline-block";
      document.getElementById("btn-backward").style.display = "inline-block";
      document.getElementById("btn-clear-ruta").style.display = "inline-block";
    });
    container.appendChild(btn);
  });
}


document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('destination');
    const clearButton = document.getElementById('clear-destination-btn');

    // Función 1: Muestra/Oculta la 'X' basada en si el campo tiene texto
    const toggleClearButton = () => {
        if (inputField.value.length > 0) {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
    };

    // Escucha el evento 'input' (cuando el texto cambia)
    inputField.addEventListener('input', toggleClearButton);

    // Opcional: Asegura que la 'X' se muestre si el campo ya tiene valor al cargar
    toggleClearButton(); 

    // Función 2: Borra el contenido cuando se hace clic en la 'X'
    clearButton.addEventListener('click', () => {
        inputField.value = ''; // Borra el contenido
        clearButton.style.display = 'none'; // Oculta la 'X'
        inputField.focus(); // Devuelve el foco al input
        
        // Dispara el evento 'input' manualmente para que otros scripts reaccionen
        const event = new Event('input', { bubbles: true });
        inputField.dispatchEvent(event);
    });
});

document.getElementById("btn-clear-ruta").addEventListener("click", () => {
  renderSidebar(allScenes[currentIndex]);
  document.getElementById("btn-clear-ruta").style.display = "none";
  document.getElementById("destination").value = "";
  exitNavigation();
  // Ocultar botones de navegación
  document.getElementById("btn-forward").style.display = "none";
  document.getElementById("btn-backward").style.display = "none";
});

// Navegación paso a paso
document.getElementById("btn-forward").addEventListener("click", () => {
    const nextIndex = currentStepIndex + 1;
    goToStep(nextIndex); // reutiliza tu función existente
});

document.getElementById("btn-backward").addEventListener("click", () => {
    if (currentStepIndex > 0) {  // Control: solo si no es la primera escena
        const prevIndex = currentStepIndex - 1;
        goToStep(prevIndex); // reutiliza tu función existente
    } else {
        //console.log("Estás en la primera escena"); // o alert, o simplemente no hacer nada
    }
});

toggleBtn.addEventListener('click', () => {
  const isMobile = window.innerWidth <= 768; // detectar móvil
  sidebar.classList.toggle('closed');
  sidebarOpen = !sidebarOpen;

  // Cambiar icono e información
  toggleBtn.textContent = sidebarOpen ? '◀' : '▶'; 
  toggleBtn.title = sidebarOpen ? 'Cerrar barra lateral' : 'Abrir barra lateral';
  // Ajustar posición del visor (solo por seguridad si no aplica CSS)
  if (!isMobile) {
    // En escritorio: ajusta el viewer normalmente
    viewerDiv.style.left = sidebarOpen ? '280px' : '0';
  } else {
    // En móvil: animación tipo "deslizar"
    sidebar.style.transform = sidebarOpen ? 'translateX(0)' : 'translateX(-100%)';
    viewerDiv.style.left = '0'; // viewer siempre ocupa toda la pantalla
    toggleBtn.style.left = sidebarOpen ? '280px' : '10px'; // mover botón acorde
  }
});

function startNavigation(routeSteps) {
  if (!routeSteps.length) return;
  navigationMode = true;
  viewer.stopMovement();  //Detener cualquier movimiento previo
  viewer.setIdleMovement(Infinity);     // desactiva autorotación por inactividad
  if (autorotateToggleElement) autorotateToggleElement.classList.remove('enabled');

  currentRouteSteps = routeSteps;
  currentStepIndex = 0;
  nextHotspotId = routeSteps[0]?.hotspot_id || null;
  nextScene =routeSteps[0]?.from || null;

    // 🚫 Deshabilitar input y botón de indicaciones
  const destinationInput = document.getElementById("destination");
  const btnRuta = document.getElementById("btn-ruta");
  const clearButton = document.getElementById('clear-destination-btn');
  destinationInput.disabled = true;
  btnRuta.disabled = true;
  clearButton.style.display = 'none';

  renderNavigationSidebar();
  goToStep(0);
}

function renderNavigationSidebar() {
  sceneInfo.innerHTML = `
    <h3>🚶 Navegación</h3><br>
    <ul id="stepsList">
      ${currentRouteSteps.map((step, i) => `
        <li ${i === currentStepIndex ? 'class="active-step"' : ''}>
          ${allScenes.find(s => String(s.id_scene) === step.from)?.scene_description} 
          → ${allScenes.find(s => String(s.id_scene) === step.to)?.scene_description}
          <p><small><span style="color:blue">(${step.reason || "continuar"})</span></small></p><br>
        </li>
      `).join("")}
    </ul>
  `;
}

function goToStep(stepIndex) {

  if (stepIndex >= currentRouteSteps.length) {
    const lastStep = currentRouteSteps[currentRouteSteps.length - 1];
    const finalScene = allScenes.find(s => String(s.id_scene) === lastStep.to);
    //console.log("Mostrando escena final de la ruta:", finalScene.scene_description);
    if (finalScene) {
      currentIndex = allScenes.indexOf(finalScene);
      switchScene(finalScene);
      highlightActiveHotspot(finalScene); // opcional, si quieres mostrar el último hotspot resaltado
      updateStepHighlight();
    }

    // 👇 Mensaje solo después de cargar la escena final
    setTimeout(() => {
      alert(`🏁 ¡Llegaste al destino! ${finalScene.scene_description}`);
      exitNavigation();
    }, 500); // pequeño retraso para permitir renderizar la escena antes del alert
    return;
  }

  currentStepIndex = stepIndex;
  const step = currentRouteSteps[stepIndex];
  nextHotspotId = step.hotspot_id;

  // Cambiar a la escena del paso
  const nextScene = allScenes.find(s => String(s.id_scene) === step.to);
  const fromScene = allScenes.find(s => String(s.id_scene) === step.from);
  if (!nextScene) return;

  currentIndex = allScenes.indexOf(nextScene);
  switchScene(fromScene); // Esto llama a highlightActiveHotspot automáticamente
  highlightActiveHotspot(fromScene);
  updateStepHighlight();  // Actualiza la negrita y el icono en el sidebar
}

function updateStepHighlight() {
  const stepsList = document.getElementById("stepsList");
  if (!stepsList) return;

  const steps = stepsList.querySelectorAll("li");
  steps.forEach((li, i) => {
    // Limpiar cualquier contenido previo
    li.classList.remove("active-step");

    if (i === currentStepIndex) {
      // Resaltar el paso activo
      li.classList.add("active-step");

    }
  });
}

function exitNavigation() {
   // 🧹 1. Quitar el resaltado del hotspot activo (el color azul del siguiente paso)
  document.querySelectorAll(".hotspot-info .hotspot-icon").forEach(icon => {
    icon.style.background = "";
    icon.style.borderRadius = "";
    icon.style.transition = "";
    icon.style.cursor = "pointer"; // 🔑 Resetear cursor
  });
  
  // 🧹 2. Resetear variables de navegación
  navigationMode = false;
  viewer.startMovement(autorotate);
  viewer.setIdleMovement(3000, autorotate); // vuelve a activarse tras 3s de inactividad
  if (autorotateToggleElement) autorotateToggleElement.classList.add('enabled');
  currentRouteSteps = [];
  currentStepIndex = 0;
  nextHotspotId = null;
    
    // 🔓 Habilitar input y botón de indicaciones
  const destinationInput = document.getElementById("destination");
  const btnRuta = document.getElementById("btn-ruta");
  const clearButton = document.getElementById('clear-destination-btn');
  const btnnext=document.getElementById("btn-forward");
  const btnprev=document.getElementById("btn-backward");
  const btnclear=document.getElementById("btn-clear-ruta");
  btnnext.style.display="none";
  btnprev.style.display="none";
  btnclear.style.display="none";
  destinationInput.disabled = false;
  destinationInput.value = "";
  btnRuta.disabled = false;
  clearButton.style.display = 'block';

  // 🧭 4. Forzar sincronización con la escena visible
  const activeScene = viewer.scene(); 
  if (activeScene) {
    const sceneEntry = [...cachedScenes.entries()].find(([id, data]) => data.scene === activeScene);
    if (sceneEntry) {
      const [sceneId, data] = sceneEntry;
      currentScene = data.scene;
      currentView = data.view;
      currentIndex = allScenes.findIndex(s => s.id_scene == sceneId);
    }
  }

  // 🖼️ 5. Recargar la escena actual para limpiar overlays o estilos previos
  if (currentScene && allScenes[currentIndex]) {
    loadScene(allScenes[currentIndex]);
  } else {
    console.warn("⚠️ No se pudo determinar la escena actual, usando la primera");
    currentIndex = 0;
    loadScene(allScenes[0]);
  }

  // 📜 6. Render normal del sidebar
  renderSidebar(allScenes[currentIndex]);

  //renderSidebar(allScenes[currentIndex]); // vuelve a sidebar normal
}

// =================== 🔄 SWITCH SCENE (solo cambia imagen sin recargar sidebar) ===================
function switchScene(scene) {
  try {
    if (!cachedScenes.has(scene.id_scene)) {
      return loadScene(scene);
    }

    const cached = cachedScenes.get(scene.id_scene);
    currentScene = cached.scene;
    currentView = cached.view;
    currentScene.switchTo();

  } catch (err) {
    console.error("Error en switchScene:", err);
  }
}

// =================== ✨ RESALTAR HOTSPOT SIGUIENTE ===================

function highlightActiveHotspot(scene) {
  const hotspotEls = document.querySelectorAll(".hotspot-info");
  const step = currentRouteSteps[currentStepIndex];
  const activeHotspotId = step?.hotspot_id;

  hotspotEls.forEach(el => {
    const titleBox = el.querySelector(".hotspot-info-title");
    const icon = el.querySelector(".hotspot-icon");
    const h = scene.hotspots?.find(h => h.title === titleBox?.textContent);

    // Resetear estilos y cursor
    icon?.style.removeProperty("background");
    icon?.style.removeProperty("border-radius");
    icon?.style.removeProperty("transition");
    icon.style.cursor = "pointer"; // por defecto
    el.onclick = null; // Limpiar clicks previos

    if (!h || h.icon_id !== 2) return; // solo hotspots de navegación

    if (h.id_hotspots === activeHotspotId) {
      // Hotspot activo: azul y clicable
      icon.style.transition = "background 0.3s";
      icon.style.background = "rgba(0,128,255,0.6)";
      icon.style.borderRadius = "50%";
      icon.style.cursor = "pointer";

          // 🔹 Centrar vista hacia el hotspot
      if (navigationMode && currentView) {
        currentView.setYaw(h.yaw, true);   // true = animación suave
        currentView.setPitch(h.pitch, true);
      }

      el.onclick = (e) => {
        e.stopPropagation(); // prevenir listeners globales

        if (navigationMode) {
          // Avanzar en la ruta
          goToStep(currentStepIndex + 1);
        } else if (h.link_scene_id) {
          // Cambiar a otra escena
          const nextScene = allScenes.find(s => s.id_scene === h.link_scene_id);
          if (nextScene) {
            currentIndex = allScenes.indexOf(nextScene);
            switchScene(nextScene);
            renderSidebar(nextScene);
            updateActiveSceneMarker();
          }
        }
      };

    } else {
      // Hotspot que no pertenece a la ruta: bloquear click y mostrar X
      el.onclick = (e) => e.stopPropagation(); // no hace nada
      icon.style.cursor = "not-allowed"; // cursor tipo X
    }
  });
}

// Init
loadScenes();