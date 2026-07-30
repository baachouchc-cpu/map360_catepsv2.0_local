const express = require("express");
const multer = require("multer");

const router = express.Router();
const controller = require("../controllers/images.controller");

const upload = require("../middlewares/upload.middleware");

/*=============================================
=               GET
=============================================*/

// Listar imágenes
router.get(
    "/",
    controller.getImages
);

// Obtener imágenes de escenas activas
router.get(
    "/scenes-active",
    controller.getActiveSceneImages
);

// Obtener una imagen por ID
router.get(
    "/:id",
    controller.getImageById
);

/*=============================================
=               POST
=============================================*/

// Subir una imagen
// Cloudinary (actual)
router.post(
    "/upload",
    upload.single("image"),
    controller.uploadImage
);

// MinIO (nuevo)
router.post(
    "/upload-minio",
    upload.single("image"),
    controller.uploadImageMinio
);

/*=============================================
=               DELETE
=============================================*/

// Eliminar registro de la BD
router.delete(
    "/:id",
    controller.deleteImage
);


module.exports = router;