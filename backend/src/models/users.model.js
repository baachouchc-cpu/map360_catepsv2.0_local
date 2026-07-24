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
      -- Concatenamos nombre y apellido con un espacio intermedio. 
      -- COALESCE evita que devuelva NULL si alguno de los campos está vacío en la BD.
      TRIM(CONCAT(COALESCE(nombre, ''), ' ', COALESCE(apellido, ''))) AS nombre_completo
    FROM public.users 
    WHERE name_user = $1
  `;

  const { rows } = await db.query(query, [name]);
  return rows[0];
};

const getUserAdminById = async(id)=>{

    const query = `

        SELECT

            u.id_user,
            u.name_user,
            u.nombre,
            u.apellido,
            u.rol_id,
            u.permisos_id,
            u.pass_user,
            u.is_active,
            u.updated_at,

            r.name_rol,

            p.nombre_permiso

        FROM users u

        LEFT JOIN rols r
            ON r.id_rol=u.rol_id

        LEFT JOIN permisos_escenas p
            ON p.id_permiso=u.permisos_id

        WHERE u.id_user=$1

    `;

    const {rows}=await db.query(query,[id]);

    if(!rows.length)
        return null;

    const user=rows[0];

    const permissionScenes=
        await getPermissionScenes(
            user.permisos_id
        );

    const userOverrides=
        await getUserSceneOverrides(
            user.id_user
        );

    return{

        ...user,

        permissionScenes,

        userOverrides

    };

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
const getPermissionScenes = async (permisosId) => {
  if (!permisosId) return []; // Si el usuario no tiene permisos asignados

  const query = `
    SELECT

        s.id_scene,
        s.description,
        s.is_public,
        s.is_active,

        i.url_minio,

        f.id_floor,
        f.name_floor,

        t.id_tower,
        t.name_tower

    FROM permiso_x_escena px

    INNER JOIN scenes s ON s.id_scene = px.scene_id

    LEFT JOIN imagenes i ON i.id_imagen = s.imagen_id

    LEFT JOIN floor f ON f.id_floor = s.floor_id

    LEFT JOIN tower t ON t.id_tower = s.tower_id

    WHERE px.permisox_id = $1

    ORDER BY
        t.name_tower,
        f.name_floor,
        s.description;
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

            f.id_floor,
            f.name_floor,

            t.id_tower,
            t.name_tower

        FROM scenes s

        LEFT JOIN imagenes i ON i.id_imagen=s.imagen_id

        LEFT JOIN floor f ON f.id_floor=s.floor_id

        LEFT JOIN tower t ON t.id_tower=s.tower_id

        WHERE s.is_active = true
        AND s.is_public = false

        ORDER BY

            t.name_tower,
            f.name_floor,
            s.description;

    `);

    return rows;

};

// ======================================
// CREAR / ACTUALIZAR USUARIO
// ======================================

const upsertUser = async (data) => {

    const {

        id_user,
        nombre,
        apellido,
        rol_id,
        permisos_id,
        password

    } = data;

    if(id_user){

        const hasPassword = Object.prototype.hasOwnProperty.call( data, "password" );

        const query = `

            INSERT INTO users
            (
                id_user,
                nombre,
                apellido,
                rol_id,
                permisos_id,
                pass_user
            )
            VALUES
            ($1, $2, $3, $4, $5,
                CASE
                    WHEN $6::text IS NULL
                         OR $6::text = ''
                    THEN (
                            SELECT pass_user
                            FROM users
                            WHERE id_user = $1
                        )
                    ELSE crypt($6,gen_salt('bf',10))
                END
            )

            ON CONFLICT(id_user)

            DO UPDATE SET

                nombre      = EXCLUDED.nombre,
                apellido    = EXCLUDED.apellido,
                rol_id      = EXCLUDED.rol_id,
                permisos_id = EXCLUDED.permisos_id,
                pass_user =
                    CASE
                        WHEN $7 = true
                        THEN EXCLUDED.pass_user
                        ELSE users.pass_user
                    END

            RETURNING *;

        `;

        const values = [

            id_user,
            nombre,
            apellido,
            rol_id,
            permisos_id || null,
            password || null,
            hasPassword

        ];

        const { rows } =await db.query(query,values);

        return rows[0];

    }

    const query = `

        INSERT INTO users
        (
            nombre,
            apellido,
            rol_id,
            permisos_id,
            pass_user
        )
        VALUES ($1, $2, $3, $4,
            CASE
                WHEN $5::text IS NULL
                        OR $5::text = ''
                THEN NULL
                ELSE crypt($5,gen_salt('bf',10))
            END
        )

        RETURNING *;

    `;

    const values = [

        nombre,
        apellido,
        rol_id,
        permisos_id || null,
        password || null

    ];

    const { rows } =await db.query(query,values);

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

const getUserSceneOverrides = async(userId)=>{

    const {rows}=await db.query(`

        SELECT

            ux.scene_id,

            ux.is_allow,

            s.description,

            s.is_active,
            s.is_public,

            i.url_minio,

            f.id_floor,
            f.name_floor,

            t.id_tower,
            t.name_tower

        FROM user_x_scene ux

        INNER JOIN scenes s
            ON s.id_scene=ux.scene_id

        LEFT JOIN imagenes i
            ON i.id_imagen=s.imagen_id

        LEFT JOIN floor f
            ON f.id_floor=s.floor_id

        LEFT JOIN tower t
            ON t.id_tower=s.tower_id

        WHERE ux.user_id=$1

        ORDER BY

            t.name_tower,
            f.name_floor,
            s.description

    `,[userId]);

    return rows;

};

const saveUserOverrides = async (
    userId,
    overrides
)=>{

    const client=await db.connect();

    try{

        await client.query("BEGIN");

        await client.query(

            `
            DELETE
            FROM user_x_scene
            WHERE user_id=$1
            `,
            [userId]
        );

        const overridesUnicos = [
            ...new Map(
                overrides.map(x => [x.scene_id, x])
            ).values()
        ];

        for(const item of overridesUnicos){

            await client.query(

                `
                INSERT INTO user_x_scene
                (
                    user_id,
                    scene_id,
                    is_allow
                )
                VALUES($1,$2,$3)
                `,
                [
                    userId,
                    item.scene_id,
                    item.is_allow
                ]
            );

        }

        await client.query("COMMIT");

    }catch(error){

        await client.query("ROLLBACK");

        throw error;

    }finally{

        client.release();

    }

};

module.exports={
    getUserByName,
    getUserAdminById,
    getAllUsers,
    getRoles,
    getPermisos,
    getPermissionScenes,
    getScenes,
    upsertUser,
    getUserById,
    updateUserStatus,
    getUserSceneOverrides,
    saveUserOverrides
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
