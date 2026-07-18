const db = require("../services/db");

const Images = {

    /*=============================================
    =           LISTAR IMÁGENES
    =============================================*/

    async getImages(type = "imagenes_360", search = "") {

        let query = `
            SELECT
                id_imagen,
                nombre_img,
                url_minio,
                tipo
            FROM imagenes
            WHERE tipo = $1
        `;

        const values = [type];

        if (search) {

            query += `
                AND LOWER(nombre_img)
                LIKE LOWER($2)
            `;

            values.push(`%${search}%`);

        }

        query += `
            ORDER BY nombre_img;
        `;

        const { rows } = await db.query(query, values);

        return rows;

    },

    /*=============================================
    =      IMÁGENES DE ESCENAS ACTIVAS
    =============================================*/

    async getActiveSceneImages(search = "") {

        let query = `

            SELECT DISTINCT

                i.id_imagen,
                i.nombre_img,
                i.url_minio,
                i.tipo,
                s.id_scene

            FROM imagenes i

            INNER JOIN scenes s
                ON s.imagen_id = i.id_imagen

            WHERE 
                s.is_active = TRUE

            AND 
                i.tipo = 'imagenes_360'

        `;


        const values = [];


        if(search){

            query += `
                AND LOWER(i.nombre_img)
                LIKE LOWER($1)
            `;

            values.push(`%${search}%`);

        }


        query += `
            ORDER BY i.nombre_img;
        `;


        const { rows } = await db.query(query, values);

        return rows;

    },

    /*=============================================
    =           OBTENER POR ID
    =============================================*/

    async getById(id) {

        const query = `
            SELECT
                id_imagen,
                nombre_img,
                url_minio,
                tipo
            FROM imagenes
            WHERE id_imagen = $1
        `;

        const { rows } = await db.query(query, [id]);

        return rows[0];

    },

    /*=============================================
    =           GUARDAR IMAGEN
    =============================================*/

    async create(data) {

        const query = `
            INSERT INTO imagenes
            (
                nombre_img,
                url_minio,
                tipo
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            RETURNING *;
        `;

        const values = [
            data.nombre_img,
            data.url_minio,
            data.tipo
        ];

        const { rows } = await db.query(query, values);

        return rows[0];

    },

    /*=============================================
    =           ELIMINAR IMAGEN
    =============================================*/

    async remove(id) {

        const query = `
            DELETE FROM imagenes
            WHERE id_imagen = $1
        `;

        await db.query(query, [id]);

    }

};

module.exports = Images;