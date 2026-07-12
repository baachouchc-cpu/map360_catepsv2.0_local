const db = require("../services/db");

const Images = {

    /*=============================================
    =           LISTAR IMÁGENES
    =============================================*/

    async get360Images(search = "") {

        let query = `
            SELECT
                id_imagen,
                nombre_img,
                url_minio,
                tipo
            FROM imagenes
            WHERE tipo = 'imagenes_360'
        `;

        const values = [];

        if (search) {

            query += `
                WHERE LOWER(nombre_img)
                LIKE LOWER($1)
            `;

            values.push(`%${search}%`);
        }

        query += `
            ORDER BY nombre_img;
        `;

        const { rows } = await db.query(query, values);

        return rows;

    },

    async getIcons() {

        const query = `
            SELECT
                id_imagen,
                nombre_img,
                url_minio,
                tipo
            FROM imagenes
            WHERE tipo = 'Iconos'
            ORDER BY nombre_img;
        `;

        const { rows } = await db.query(query);

        return rows;
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

    }

};

module.exports = Images;