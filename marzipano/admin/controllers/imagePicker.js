/*=============================================
=              IMAGE PICKER                  =
=============================================*/

let imagePickerCallback = null;

/*=============================================
=              ABRIR MODAL                   =
=============================================*/

async function openImagePicker(onSelect) {

    imagePickerCallback = onSelect;

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
=             CERRAR MODAL                   =
=============================================*/

function closeImagePicker() {

    const modal = document.getElementById("imagePickerModal");

    if (!modal)
        return;

    modal.classList.remove("show");
    modal.remove();
}


/*=============================================
=             CARGAR IMÁGENES                =
=============================================*/

async function loadImages() {

    const container = document.getElementById("imagePickerGrid");

    container.innerHTML = "Cargando imágenes...";

    try {

        const res = await fetch("/api/images");

        const images = await res.json();

        renderImages(images);

    } catch (err) {

        console.error(err);

        container.innerHTML = "Error cargando imágenes.";

    }

}


/*=============================================
=              RENDER GRID                   =
=============================================*/

function renderImages(images) {

    const container = document.getElementById("imagePickerGrid");

    if (!images.length) {

        container.innerHTML = "<p>No hay imágenes.</p>";

        return;

    }

    container.innerHTML = images.map(img => `

        <div
            class="image-card"
            onclick='selectImage(${JSON.stringify(img)})'
        >

            <img
                src="${img.url_minio}"
                alt="${img.nombre_img}"
            >

            <span>${img.nombre_img}</span>

        </div>

    `).join("");

}


/*=============================================
=              SELECCIONAR                   =
=============================================*/

function selectImage(image) {

    if (imagePickerCallback)
        imagePickerCallback(image);

    closeImagePicker();

}


/*=============================================
=               SUBIR IMAGEN                 =
=============================================*/

async function uploadImage(input) {

    if (!input.files.length)
        return;

    const formData = new FormData();

    formData.append("image", input.files[0]);

    try {

        const res = await fetch("/api/images/upload", {

            method: "POST",

            body: formData

        });

        if (!res.ok)
            throw new Error("Error subiendo imagen");

        const image = await res.json();

        if (imagePickerCallback)
            imagePickerCallback(image);

        closeImagePicker();

    } catch (err) {

        console.error(err);

        alert("No se pudo subir la imagen.");

    }

}


/*=============================================
=               BUSCADOR                     =
=============================================*/

async function searchImages(text) {

    const res = await fetch(
        `/api/images?search=${encodeURIComponent(text)}`
    );

    const images = await res.json();

    renderImages(images);

}