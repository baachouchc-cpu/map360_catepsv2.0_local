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

        const {id}=req.params;

        const user=
            await Users.getUserAdminById(id);

        if(!user){

            return res.status(404).json({

                message:"Usuario no encontrado"

            });

        }

        res.json(user);

    }
    catch(error){

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
// PERMISOS
// ======================================

const getPermisos = async(req,res)=>{

    try{

        res.json(
            await Users.getPermisos()
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
// CREATE + UPDATE (UPSERT)
// ======================================

const upsertUser = async (req, res) => {

    try{

        const {

            id_user,
            nombre,
            apellido,
            rol_id,
            password,
            overrides = []

        } = req.body;

        if(
            !nombre ||
            !apellido ||
            !rol_id
        ){

            return res.status(400).json({

                message:
                "Nombre, apellido y rol son obligatorios."

            });

        }

        // contraseña obligatoria solo al crear
        if(!id_user && !password){

            return res.status(400).json({

                message:
                "La contraseña es obligatoria."

            });

        }

        const {

            overrides: _,

            ...userData

        } = req.body;

        const user =
            await Users.upsertUser(userData);

        await Users.saveUserOverrides(

            user.id_user,
            overrides

        );

        res.json({

            message:
            "Usuario guardado correctamente",

            user

        });

    }
    catch(error){

        console.error(error);

        res.status(500).json({

            message:
            "Error guardando usuario"

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

// ======================================
// EXPORT
// ======================================

module.exports={
    getUsers,
    getUserById,
    getRoles,
    getPermisos,
    getScenes,
    upsertUser,
    updateUserStatus
};