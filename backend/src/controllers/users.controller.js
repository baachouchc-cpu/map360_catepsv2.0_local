// src/controllers/users.controller.js
const db = require("../services/db");

const Users = require("../models/users.model");
// ======================================
// LISTAR USUARIOS
// ======================================

const getUsers = async(req,res)=>{

    try{

        const users =
            await Users.getAllUsers();
        res.json(users);

    }catch(error){

        console.error(
            "GET users error:",
            error
        );

        res.status(500).json({
            message:"Error obteniendo usuarios"
        });

    }

};

// ======================================
// USUARIO POR ID
// ======================================

const getUserById = async(req,res)=>{

    try{

        const {
            id
        }=req.params;

        const user =
            await Users.getUserAdminById(id);

        if(!user){

            return res.status(404).json({
                message:"Usuario no encontrado"
            });

        }

        const escenas =
            await Users.getEscenasPorPermiso(
                user.permisos_id
            );

        res.json({

            ...user,

            escenas

        });

    }catch(error){

        console.error(error);

        res.status(500).json({
            message:"Error obteniendo usuario"
        });

    }

};

// ======================================
// ROLES
// ======================================

const getRoles = async(req,res)=>{

    try{

        res.json(
            await Users.getRoles()
        );

    }catch(error){

        res.status(500).json({
            message:"Error obteniendo roles"
        });

    }

};

// ======================================
// ESCENAS
// ======================================

const getScenes = async(req,res)=>{

    try{


        res.json(
            await Users.getScenes()
        );

    }catch(error){

        res.status(500).json({
            message:"Error obteniendo escenas"
        });


    }

};

// ======================================
// CREAR USUARIO
// ======================================

const createUser = async(req,res)=>{

    try{

        let data = req.body;

        let permisos_id = null;

        /*
            Solo usuarios normales
            necesitan permisos
        */

        if(
            data.rol_id == 3 &&
            data.scenes &&
            data.scenes.length
        ){

            permisos_id =
                await Users.findPermissionByScenes(
                    data.scenes
                );



            if(!permisos_id){


                permisos_id =
                    await Users.createPermission(
                        "Permiso automático",
                        data.scenes
                    );
            }

        }

        const user =
            await Users.createUser({

                ...data,

                permisos_id

            });

        res.json(user);

    }catch(error){

        console.error(error);

        res.status(500).json({
            message:"Error creando usuario"
        });

    }

};

// ======================================
// ACTUALIZAR USUARIO
// ======================================

const updateUser = async(req,res)=>{

    try{

        const {
            id
        }=req.params;

        let data=req.body;

        let permisos_id=null;

        if(
            data.rol_id == 3 &&
            data.scenes &&
            data.scenes.length
        ){

            permisos_id =
                await Users.findPermissionByScenes(
                    data.scenes
                );

            if(!permisos_id){

                permisos_id =
                    await Users.createPermission(
                        "Permiso automático",
                        data.scenes
                    );
            }

        }

        const user =
            await Users.updateUser(
                id,
                {
                    ...data,
                    permisos_id
                }
            );

        res.json(user);

    }catch(error){

        console.error(error);

        res.status(500).json({
            message:"Error actualizando usuario"
        });

    }

};

// ======================================
// CAMBIAR ESTADO USUARIO
// ======================================

const updateUserStatus = async(req,res)=>{

    try{
        const {
            id
        } = req.params;

        const {
            is_active
        } = req.body;

        if(typeof is_active !== "boolean"){

            return res.status(400).json({

                message:
                "El campo is_active es obligatorio."

            });

        }

        const user = 
            await Users.updateUserStatus(
                id,
                is_active
            );

        if(!user){

            return res.status(404).json({

                message:
                "Usuario no encontrado."

            });

        }

        res.json(user);

    }
    catch(error){

        console.error(
            "UPDATE user status error:",
            error
        );

        res.status(500).json({

            message:
            "Error actualizando estado del usuario."

        });

    }

};

const updateUserConfig = async(req,res)=>{

    try{
        const {
            id
        } = req.params;

        const {
            is_config
        } = req.body;

        if(typeof is_config !== "boolean"){

            return res.status(400).json({

                message:
                "El campo is_config es obligatorio."

            });

        }

        const user = 
            await Users.updateUserConfig(
                id,
                is_config
            );

        if(!user){

            return res.status(404).json({

                message:
                "Usuario no encontrado."

            });

        }

        res.json(user);

    }
    catch(error){

        console.error(
            "UPDATE user config error:",
            error
        );

        res.status(500).json({

            message:
            "Error actualizando config del usuario."

        });

    }

};

// ======================================
// EXPORT
// ======================================

module.exports={
    getUsers,
    getUserById,
    getRoles,
    getScenes,
    createUser,
    updateUser,
    updateUserStatus,
    updateUserConfig
};