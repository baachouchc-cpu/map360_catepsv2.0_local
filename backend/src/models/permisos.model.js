const pool = require("../services/db");

const Permisos = {

    // ======================================
    // LISTAR PERMISOS
    // ======================================

    getAll: async () => {

        const query = `

            SELECT
                p.id_permiso,
                p.nombre_permiso,
                p.custom,
                p.parent,

                COUNT(px.scene_id) AS total_escenas

            FROM permisos_escenas p

            LEFT JOIN permiso_x_escena px
                ON px.permisox_id = p.id_permiso

            GROUP BY p.id_permiso

            ORDER BY p.nombre_permiso;

        `;

        const {rows} = await pool.query(query);

        return rows;

    },

    // ======================================
    // OBTENER PERMISO POR ID
    // CON ESCENAS
    // ======================================
    getById: async(id)=>{

        const permiso = await pool.query(`

            SELECT *
            FROM permisos_escenas
            WHERE id_permiso=$1

        `,[id]);

        if(!permiso.rows.length)
            return null;

        const escenas = await pool.query(`

            SELECT

                s.id_scene,
                s.description,
                s.imagen_id,
                s.is_active,
                s.is_public,

                img.nombre_img,
                img.url_minio

            FROM permiso_x_escena px

            INNER JOIN scenes s
                ON s.id_scene = px.scene_id

            LEFT JOIN imagenes img
                ON img.id_imagen=s.imagen_id

            WHERE px.permisox_id=$1

            ORDER BY s.description

        `,[id]);

        return {

            ...permiso.rows[0],

            escenas: escenas.rows

        };

    },

    // ======================================
    // CREAR PERMISO
    // ======================================
    create: async(data)=>{

        const {
            nombre_permiso,
            custom=false,
            parent=null,
            escenas=[]
        }=data;

        const client = await pool.connect();

        try{

            await client.query("BEGIN");

            const permiso = await client.query(`

                INSERT INTO permisos_escenas
                (
                    nombre_permiso,
                    custom,
                    parent
                )

                VALUES($1,$2,$3)

                RETURNING *

            `,[

                nombre_permiso,
                custom,
                parent

            ]);

            const id = permiso.rows[0].id_permiso;

            for(const scene of escenas){

                await client.query(`

                    INSERT INTO permiso_x_escena
                    (
                        permisox_id,
                        scene_id
                    )

                    VALUES($1,$2)

                `,[id,scene]);

            }

            await client.query("COMMIT");

            return permiso.rows[0];

        }catch(error){

            await client.query("ROLLBACK");

            throw error;

        }finally{

            client.release();

        }

    },

    // ======================================
    // ACTUALIZAR PERMISO
    // ======================================

    update: async(id,data)=>{

        const {
            nombre_permiso,
            escenas=[]
        }=data;

        const client = await pool.connect();

        try{

            await client.query("BEGIN");

            await client.query(`

                UPDATE permisos_escenas

                SET nombre_permiso=$1

                WHERE id_permiso=$2

            `,[nombre_permiso,id]);

            // borrar relaciones actuales

            await client.query(`

                DELETE FROM permiso_x_escena

                WHERE permisox_id=$1

            `,[id]);

            // insertar nuevas

            for(const scene of escenas){

                await client.query(`

                    INSERT INTO permiso_x_escena

                    VALUES($1,$2)

                `,[id,scene]);

            }

            await client.query("COMMIT");

            return true;

        }catch(error){

            await client.query("ROLLBACK");

            throw error;

        }finally{

            client.release();

        }

    },

    // ======================================
    // ESCENAS DISPONIBLES
    // PARA ASIGNAR
    // ======================================

    getAvailableScenes: async()=>{

        const {rows}=await pool.query(`

            SELECT

                s.id_scene,
                s.description,
                s.is_public,

                img.url_minio,

                -- 🔹 Floor
                s.floor_id,
                f.name_floor,

                -- 🔹 Tower
                s.tower_id,
                t.name_tower

            FROM scenes s

            LEFT JOIN imagenes img ON img.id_imagen=s.imagen_id
            LEFT JOIN floor f ON s.floor_id = f.id_floor
            LEFT JOIN tower t ON s.tower_id = t.id_tower

            WHERE s.is_public = false

            ORDER BY s.description

        `);

        return rows;

    }

};

module.exports=Permisos;