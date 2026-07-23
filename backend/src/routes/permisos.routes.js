const express=require("express");

const router=express.Router();

const controller=
require("../controllers/permisos.controller");

const authMiddleware=
require("../middlewares/authMiddleware");

router.get(
"/",
authMiddleware,
controller.getPermisos
);

router.get(
"/scenes",
authMiddleware,
controller.getScenes
);

router.get(
"/:id",
authMiddleware,
controller.getPermisoById
);

router.post(
"/",
authMiddleware,
controller.createPermiso
);

router.put(
"/:id",
authMiddleware,
controller.updatePermiso
);

module.exports=router;