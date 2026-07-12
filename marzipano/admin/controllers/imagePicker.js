/*=============================================
=              IMAGE PICKER
=============================================*/

let imagePickerCallback = null;
let imagePickerType = "imagenes_360";


/*=============================================
=              ABRIR MODAL
=============================================*/

async function openImagePicker(onSelect, type = "imagenes_360") {

    imagePickerCallback = onSelect;
    imagePickerType = type;

    if (!document.getElementById("imagePickerModal")) {

        const html = await fetch("/admin/components/imagePicker.html")
            .then(r => r.text());

        document.body.insertAdjacentHTML("beforeend", html);
    }

    document
        .getElementById("imagePickerModal")
        .classList.add("show");

    await loadImages();

}


/*=============================================
=              CERRAR MODAL
=============================================*/

function closeImagePicker() {

    const modal = document.getElementById("imagePickerModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.remove();

}


/*=============================================
=              CARGAR IMÁGENES
=============================================*/

async function loadImages(search = "") {

    const container = document.getElementById("imagePickerGrid");

    container.innerHTML = "Cargando imágenes...";

    try {

        let url = `/api/images?type=${encodeURIComponent(imagePickerType)}`;

        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        const res = await fetch(url);

        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);

        const images = await res.json();

        renderImages(images);

    }
    catch (err) {

        console.error(err);

        container.innerHTML = "Error cargando imágenes.";

    }

}


/*=============================================
=              RENDER GRID
=============================================*/

function renderImages(images) {

    const container = document.getElementById("imagePickerGrid");

    if (!images.length) {

        container.innerHTML = "<p>No hay imágenes.</p>";
        return;

    }

    container.innerHTML = images.map(img => `

        <div class="image-card"
             onclick='selectImage(${JSON.stringify(img)})'>

            <img
                src="${img.url_minio}"
                alt="${img.nombre_img}"
            >

            <span>${img.nombre_img}</span>

        </div>

    `).join("");

}


/*=============================================
=              SELECCIONAR
=============================================*/

function selectImage(image) {

    if (imagePickerCallback)
        imagePickerCallback(image);

    closeImagePicker();

}


/*=============================================
=              BUSCADOR
=============================================*/

function searchImages(text) {

    loadImages(text);

}