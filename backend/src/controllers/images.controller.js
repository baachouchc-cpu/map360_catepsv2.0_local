const Images = require("../models/images.model");
const cloudinary = require("../services/cloudinary");
const minio = require("../services/minio");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
=             SUBIR IMAGEN MINIO
=============================================*/

exports.uploadImageMinio = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                message: "No se recibió ninguna imagen."
            });

        }

        const path = require("path");
        const fs = require("fs/promises");
        const crypto = require("crypto");

        const type = req.body.type || "imagenes_360";

        const folders = {

            imagenes_360: "imagenes_360",
            iconos: "iconos",
            logos: "logos",
            documentos: "documentos"

        };

        const folder = folders[type] || "uploads";

        const extension = path.extname(req.file.originalname);

        const originalName = path.basename(
            req.file.originalname,
            extension
        );

        const objectName =
            `${folder}/${crypto.randomUUID()}${extension}`;


        await minio.fPutObject(

            process.env.MINIO_BUCKET,

            objectName,

            req.file.path

        );


        const image = await Images.create({

            nombre_img: originalName,

            url_minio:
                `${process.env.MINIO_PUBLIC_URL}/${objectName}`,

            tipo: type

        });


        // borrar archivo temporal de uploads
        await fs.unlink(req.file.path);


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
=             OBTENER IMAGEN ESCENAS ACTIVAS
=============================================*/

exports.getActiveSceneImages = async (req, res) => {

    try{

        const search = req.query.search || "";

        const images =
            await Images.getActiveSceneImages(search);


        res.json(images);


    }catch(error){

        console.error(
            "GET active scene images error:",
            error
        );


        res.status(500).json({
            error:"Error obteniendo imágenes de escenas activas"
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