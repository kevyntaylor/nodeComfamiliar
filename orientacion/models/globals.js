const connection = require("../config/data");
//Open conection
connection.connect();

module.exports = {
    insert_areas(area, nombre) {
        return new Promise((resolve, reject) => {
			connection.query('INSERT INTO `areas_ocupacionales`(`AREA_OCUPACIONAL`, `NOMBRE`) VALUES (?,?)', [area,nombre], function(err, rows) {
				resolve(rows);
			});
        });
    },

    insert_denominacion(area, grupo,codigo,subgrupo,denominacion) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO `grupo_denominaciones`(`AREA_OCUPACIONAL`, `GRUPO_OCUPACIONAL`, `CODIGO_SUBGRUPO`, `SUBGRUPO`, `DENOMINACION`) VALUES (?,?,?,?,?)', [area, grupo,codigo,subgrupo,denominacion], function(err, rows) {
                resolve(rows);
            });
        });
    },

    truncate_table(tabla) {
        return new Promise((resolve, reject) => {
            connection.query('TRUNCATE '+ tabla);
        });
    },

    select_denominaciones() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM grupo_denominaciones', function(err, rows) {
                resolve(rows);
            });
        });
    },

    select_areas(area) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM areas_ocupacionales WHERE AREA_OCUPACIONAL = ?',[area], function(err, rows) {
                resolve(rows);
            });
        });
    }
}
