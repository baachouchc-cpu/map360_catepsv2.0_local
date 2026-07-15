/*=============================================
=          SUBIR IMAGEN
=============================================*/

async function uploadSelectedImage(e) {

    const file = e.target.files[0];

    if (!file)
        return;

    try {

        const image = await uploadImage(file, imagePickerType);

        // Recargar la galería
        await loadImages();

        // Seleccionarla automáticamente
        selectImage(image);

    }
    catch(err){

        console.error(err);

        alert("No se pudo subir la imagen.");

    }

}


/*=============================================
=      SUBIR A LA API
=============================================*/

async function uploadImage(file, type){

    const formData = new FormData();

    formData.append("image", file);

    formData.append("type", type);

    const response = await fetch("/api/images/upload",{

        method:"POST",

        body:formData

    });

    if(!response.ok)
        throw new Error("Error subiendo imagen");

    return await response.json();

}