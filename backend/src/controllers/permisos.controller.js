const Permisos=require("../models/permisos.model");

// LISTAR
exports.getPermisos=async(req,res)=>{

    try{

        res.json(
            await Permisos.getAll()
        );

    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error obteniendo permisos"
        });

    }

};

// DETALLE
exports.getPermisoById=async(req,res)=>{

    try{

        const permiso=
            await Permisos.getById(req.params.id);

        if(!permiso)
            return res.status(404).json({
                error:"Permiso no encontrado"
            });

        res.json(permiso);

    }catch(error){

        res.status(500).json({
            error:"Error"
        });

    }

};

// CREAR
exports.createPermiso=async(req,res)=>{

    try{

        const permiso=
            await Permisos.create(req.body);

        res.json(permiso);

    }catch(error){

        console.error(error);

        res.status(500).json({
            error:"Error creando permiso"
        });

    }

};

// ACTUALIZAR
exports.updatePermiso=async(req,res)=>{

    try{

        await Permisos.update(
            req.params.id,
            req.body
        );

        res.json({
            message:"Permiso actualizado"
        });

    }catch(error){

        res.status(500).json({
            error:"Error actualizando permiso"
        });

    }

};

// ESCENAS PARA SELECTOR
exports.getScenes=async(req,res)=>{

    try{

        res.json(
            await Permisos.getAvailableScenes()
        );

    }catch(error){

        res.status(500).json({
            error:"Error obteniendo escenas"
        });

    }

};