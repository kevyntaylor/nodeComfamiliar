const connection = require("../config/data");
//Open conection
connection.connect();

module.exports = {
    insert_giass(tipo_documento, documento, primer_apellido, segundo_apellido, primer_nombre, segundo_nombre, caja, fecha_afiliacion, fecha_retiro, tipo_doc_empleador, doc_empleador) {
        if(segundo_nombre==''){
            segundo_nombre=null;
        }
        if(fecha_retiro==''){
            fecha_retiro=null;
        }
        return new Promise((resolve, reject) => {
			connection.query('INSERT INTO `giass`(`tipo_documento`, `documento`, `primer_apellido`, `segundo_apellido`, `primer_nombre`, `segundo_nombre`, `caja`, `fecha_afiliacion`, `fecha_retiro`, `tipo_doc_empleador`, `doc_empleador`) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [tipo_documento, documento, primer_apellido, segundo_apellido, primer_nombre, segundo_nombre, caja, fecha_afiliacion, fecha_retiro, tipo_doc_empleador, doc_empleador], function(err, rows) {
				resolve(rows);
			});
        });
    },

    truncate_table(tabla) {
        return new Promise((resolve, reject) => {
            connection.query('TRUNCATE '+ tabla);
        });
    },

    delete_masive_active(doc) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO activos(documento) VALUES ('+ doc +')');
            connection.query('DELETE FROM giass WHERE documento = '+ doc);
        });
    },

    delete_masive_date(fecha) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM giass WHERE fecha_retiro < ' + "'" + fecha + "'");
        });
    },


    delete_masive_other(doc,id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM giass WHERE documento = '+ doc + ' and Id = '  + id);
        });
    },

    select_giass() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM giass WHERE fecha_retiro IS NULL', function(err, rows) {
                resolve(rows);
            });
        });
    },


    internal_process(fechacorte) {
        return new Promise((resolve, reject) => {
            connection.query("DELETE FROM giass WHERE caja = 'CCF07'");
            connection.query(`INSERT INTO resultado (documento,dias) SELECT documento, IF(fecha_afiliacion < '${fechacorte}',DATEDIFF(fecha_retiro, '${fechacorte}'),DATEDIFF(fecha_retiro,fecha_afiliacion)) as dias FROM giass`, function(err, rows) {
                resolve(rows);
            });
        });
    },

    select_giass_filter() {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT documento, ANY_VALUE(SUM(dias)) as dias FROM resultado group by documento`, function(err, rows) {
                resolve(rows);
            });
        });
    },


    select_giass_active() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM activos', function(err, rows) {
                resolve(rows);
            });
        });
    },
}
