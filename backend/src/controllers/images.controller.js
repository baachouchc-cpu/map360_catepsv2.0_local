const Images = require("../models/images.model");

// Cloudinary
const cloudinary = require("cloudinary").v2;

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_NAME,

    api_key: process.env.CLOUDINARY_KEY,

    api_secret: process.env.CLOUDINARY_SECRET

});


/*=============================================
=           LISTAR IMÁGENES
=============================================*/

exports.getImages = async (req, res) => {

    try {

        const search = req.query.search || "";

        const images = await Images.get360Images(search);

        res.json(images);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};


/*=============================================
=           SUBIR IMAGEN
=============================================*/

exports.uploadImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                message: "No se recibió ninguna imagen"

            });

        }

        const result = await cloudinary.uploader.upload(

            req.file.path,

            {

                folder: "Proyecto_local/imagenes_360"

            }

        );

        const image = await Images.create({

            nombre_img: req.file.originalname,

            url_minio: result.secure_url,

            tipo: req.file.mimetype

        });

        res.status(201).json(image);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

};