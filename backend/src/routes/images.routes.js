const express = require("express");

const router = express.Router();

const multer = require("multer");

const upload = multer({

    dest: "uploads/"

});

const controller = require("../controllers/images.controller");


/*=============================================
=               GET
=============================================*/

router.get(

    "/",

    controller.getImages

);


/*=============================================
=               POST
=============================================*/

router.post(

    "/upload",

    upload.single("image"),

    controller.uploadImage

);

module.exports = router;