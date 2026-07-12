const Images = require("../models/images.model");
const cloudinary = require("../services/cloudinary");

/*=============================================
=             LISTAR IMÁGENES
=============================================*/

exports.getImages = async (req, res) => {

    try {

        const search = req.query.search || "";
        const type = req.query.type || "imagenes_360";

        const images = await Images.getImages(type, search);

        res.json(images);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};


/*=============================================
=             SUBIR IMAGEN
=============================================*/

exports.uploadImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                message: "No se recibió ninguna imagen."
            });

        }

        const type = req.body.type || "imagenes_360";

        const folders = {

            imagenes_360: "Proyecto_local/imagenes_360",
            iconos: "Proyecto_local/Iconos",
            logos: "Proyecto_local/logos",
            documentos: "Proyecto_local/documentos"

        };

        const folder = folders[type] || "Proyecto_local/uploads";

        const result = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder,
                resource_type: "image"
            }
        );

        const image = await Images.create({

            nombre_img: req.file.originalname,
            url_minio: result.secure_url,
            tipo: type

        });

        res.status(201).json(image);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};


/*=============================================
=             OBTENER IMAGEN
=============================================*/

exports.getImageById = async (req, res) => {

    try {

        const image = await Images.getById(req.params.id);

        if (!image) {

            return res.status(404).json({
                message: "Imagen no encontrada."
            });

        }

        res.json(image);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};


/*=============================================
=             ELIMINAR IMAGEN
=============================================*/

exports.deleteImage = async (req, res) => {

    try {

        await Images.remove(req.params.id);

        res.json({
            message: "Imagen eliminada correctamente."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};