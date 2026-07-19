// src/models/users.model.js
const db = require("../services/db");

const getUserByName = async (name) => {
  const query = `
    SELECT 
      id_user, 
      name_user, 
      pass_user, 
      rol_id, 
      permisos_id,
      is_config,
      -- Concatenamos nombre y apellido con un espacio intermedio. 
      -- COALESCE evita que devuelva NULL si alguno de los campos está vacío en la BD.
      TRIM(CONCAT(COALESCE(nombre, ''), ' ', COALESCE(apellido, ''))) AS nombre_completo
    FROM public.users 
    WHERE name_user = $1
  `;

  const { rows } = await db.query(query, [name]);
  return rows[0];
};

const getUserAdminById = async (id)=>{

    const query = `

        SELECT

            u.id_user,
            u.name_user,
            u.nombre,
            u.apellido,
            u.rol_id,
            u.permisos_id,
            u.is_config,
            u.is_active,
            u.updated_at,

            r.name_rol,

            p.nombre_permiso

        FROM users u

        LEFT JOIN rols r
            ON r.id_rol = u.rol_id

        LEFT JOIN permisos_escenas p
            ON p.id_permiso = u.permisos_id

        WHERE u.id_user = $1
    `;

    const {rows}= await db.query(query,[id]);


    return rows[0];

};

// Obtener todos los usuarios para panel admin
const getAllUsers = async () => {

    const query = `

        SELECT

            u.id_user,
            u.name_user,
            u.nombre,
            u.apellido,
            u.rol_id,
            u.permisos_id,
            u.is_config,
            u.is_active,
            u.updated_at,

            r.name_rol,

            p.nombre_permiso

        FROM users u

        LEFT JOIN rols r
            ON r.id_rol = u.rol_id

        LEFT JOIN permisos_escenas p
            ON p.id_permiso = u.permisos_id

        ORDER BY u.id_user ASC;

    `;

    const { rows } = await db.query(query);

    return rows;

};

const getRoles = async()=>{


    const {rows}= await db.query(`

        SELECT
            id_rol,
            name_rol

        FROM rols

        ORDER BY id_rol

    `);

    return rows;

};

const getPermisos = async()=>{


    const {rows}= await db.query(`

        SELECT

            id_permiso,
            nombre_permiso

        FROM permisos_escenas

        ORDER BY nombre_permiso

    `);

    return rows;

};

/**
 * Obtiene todas las escenas permitidas para un ID de permiso específico
 * @param {number} permisosId - El id_permiso del usuario
 */
const getEscenasPorPermiso = async (permisosId) => {
  if (!permisosId) return []; // Si el usuario no tiene permisos asignados

  const query = `
    SELECT s.id_scene, s.description -- o los campos que tenga tu tabla 'scenes'
    FROM public.permiso_x_escena pxe
    INNER JOIN public.scenes s ON pxe.scene_id = s.id_scene
    WHERE pxe.permisox_id = $1
    ORDER BY s.id_scene
  `;

  const { rows } = await db.query(query, [permisosId]);
  return rows; // Esto te devolverá un array limpio de objetos escena: [{id_scene: 1}, {id_scene: 2}]
};

// ======================================
// ESCENAS DISPONIBLES
// ======================================

const getScenes=async()=>{

    const {rows}=await db.query(`

        SELECT

            s.id_scene,
            s.description,
            s.is_active,
            s.is_public,

            i.url_minio,
            i.nombre_img

        FROM scenes s

        LEFT JOIN imagenes i
            ON i.id_imagen = s.imagen_id

        WHERE s.is_active = true
        AND s.is_public = false

        ORDER BY s.id_scene;

    `);

    return rows;

};

// ======================================
// CREAR PERMISO ESCENAS
// ======================================

const createPermission=async(nombrePermiso, escenas)=>{

    const client=await db.connect();

    try{

        await client.query("BEGIN");

        const permiso=await db.query(`

            INSERT INTO permisos_escenas
            (
                nombre_permiso
            )

            VALUES($1)

            RETURNING id_permiso

        `,
        [
            nombrePermiso
        ]);

        const permisoId=
            permiso.rows[0].id_permiso;

        for(const sceneId of escenas){

            await client.query(`

                INSERT INTO permiso_x_escena
                (
                    permisox_id,
                    scene_id
                )

                VALUES($1,$2)

            `,
            [
                permisoId,
                sceneId
            ]);

        }

        await client.query("COMMIT");

        return permisoId;

    }catch(error){

        await client.query("ROLLBACK");

        throw error;

    }finally{

        client.release();

    }

};

// ======================================
// CREAR USUARIO
// ======================================

const createUser=async(data)=>{

    const {

        password,
        nombre,
        apellido,
        rol_id,
        permisos_id

    }=data;

    const query=`

        INSERT INTO users
        (

            pass_user,
            nombre,
            apellido,
            rol_id,
            permisos_id

        )

       VALUES

        (

            crypt($1,gen_salt('bf',10)),
            $2,
            $3,
            $4,
            $5

        )

        RETURNING *

    `;

    const {rows}=await db.query(
        query,
        [
            password,
            nombre,
            apellido,
            rol_id,
            permisos_id
        ]
    );

    return rows[0];

};

// ======================================
// ACTUALIZAR USUARIO
// ======================================

const updateUser=async(id,data)=>{

    const {

        nombre,
        apellido,
        rol_id,
        permisos_id,
        //is_active,
        is_config

    }=data;

    const {rows}=await db.query(`

        UPDATE users

        SET

            nombre=$1,
            apellido=$2,
            rol_id=$3,
            permisos_id=$4,
            -- is_active=$5,
            is_config=$5


        WHERE id_user=$6


        RETURNING *

    `,
    [
        nombre,
        apellido,
        rol_id,
        permisos_id,
        //is_active,
        is_config,
        id
    ]);

    return rows[0];

};


const getUserById = async (id) =>{

    const query = `

        SELECT

            u.*,

            CONCAT(
                u.nombre,
                ' ',
                u.apellido
            ) AS nombre_completo

        FROM users u

        WHERE u.id_user = $1

    `;

    const { rows } =
        await db.query(query,[id]);

    return rows[0];
}

// ======================================
// BUSCAR PERMISO POR CONJUNTO DE ESCENAS
// ======================================

const findPermissionByScenes = async (sceneIds) => {

    if (!sceneIds || sceneIds.length === 0) {
        return null;
    }

    const query = `

        SELECT 

            pxe.permisox_id

        FROM permiso_x_escena pxe


        WHERE pxe.scene_id = ANY($1::int[])


        GROUP BY pxe.permisox_id


        HAVING COUNT(pxe.scene_id) = $2

        AND COUNT(*) = (

            SELECT COUNT(*)

            FROM permiso_x_escena pxe2

            WHERE pxe2.permisox_id = pxe.permisox_id

        )

        LIMIT 1;

    `;

    const {rows} = await db.query(
        query,
        [
            sceneIds,
            sceneIds.length
        ]
    );

    return rows.length
        ? rows[0].permisox_id
        : null;

};

const updateUserStatus = async(id,status)=>{

    const {rows}=await db.query(

        `
        UPDATE users

        SET

            is_active=$1

        WHERE id_user=$2

        RETURNING *

        `,

        [
            status,
            id
        ]

    );

    return rows[0];

};

const updateUserConfig = async(id,config)=>{

    const {rows}=await db.query(

        `
        UPDATE users

        SET

            is_config=$1

        WHERE id_user=$2

        RETURNING *

        `,

        [
            config,
            id
        ]

    );

    return rows[0];

};

module.exports={
    getUserByName,
    getUserAdminById,
    getAllUsers,
    getRoles,
    getPermisos,
    getEscenasPorPermiso,
    getScenes,
    createPermission,
    createUser,
    getUserById,
    updateUser,
    findPermissionByScenes,
    updateUserStatus,
    updateUserConfig
};
// const db = require("../services/db");

// const getUserByName = async (name) => {
//   const { rows } = await db.query(
//     "SELECT * FROM users WHERE name_user = $1",
//     [name]
//   );
//   return rows[0];
// };

// module.exports = {
//   getUserByName
// };
