var XLSX = require("xlsx");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const globalsModel = require("./models/globals");
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use('/static', express.static('public'));


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.post('/upload', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let EDFile = req.files.file
    EDFile.mv(`./excel/DOC_GIASS.xlsx`, err => {
        if (err) {
            res.json({
                code: 500,
                message: 'errors'
            });
        } else {
			llenarDB();
            res.json({
                code: 200,
                message: 'successful'
            });
        }
    })
});


function llenarDB() {
	globalsModel.truncate_table('giass');
	globalsModel.truncate_table('activos');
	globalsModel.truncate_table('resultado');
	const excel = XLSX.readFile(
		"./excel/DOC_GIASS.xlsx"
	);
	var nombreHoja = excel.SheetNames;
	
	let hoja1 = XLSX.utils.sheet_to_json(excel.Sheets[nombreHoja[0]]);
	
	for (let item of hoja1){
		var tipo_documento = item['Tipo Documento'];
		var documento = item['Documento'];
		var primer_apellido = item['Primer Apellido'];
		var segundo_apellido = item['Segundo Apellido'];
		var primer_nombre = item['Primer Nombre'];
		var segundo_nombre = item['Segundo Nombre'];
		var caja = item['Caja de Compensación'];
		var fecha_afiliacion = item['Fecha Afiliación'];
		var fecha_retiro = item['Fecha Retiro'];
		var tipo_doc_empleador = item['Tipo Doc. Empleador'];
		var doc_empleador = item['Documento Empleador'];
		globalsModel.insert_giass(tipo_documento, documento, primer_apellido, segundo_apellido, primer_nombre, segundo_nombre, caja, fecha_afiliacion, fecha_retiro, tipo_doc_empleador, doc_empleador);
	}
}

app.get('/descartarActivo', function(req, res) {
    globalsModel.select_giass().then(giass => {
		for(let item of giass){
			globalsModel.delete_masive_active(item["documento"]);
		}
        res.json({code:200, message:'Funcion entregada por favor esperar'}); 
    })
    .catch(err => {
        res.json({code:500, message:'Error al obtener datos'});  
    });
});

app.get('/descartarFilter', function(req, res) {
	send = req.query.fechasg;
    globalsModel.delete_masive_date(send);
    globalsModel.internal_process(send);
	res.json({code:200, message:'Funcion entregada por favor esperar'});
});


app.get('/extraerData', function(req, res) {
    globalsModel.select_giass_filter().then(giass => {
        res.json(giass);  
    })
    .catch(err => {
        res.json({code:500, message:'Error al obtener datos'});  
    });
});


app.get('/extraerActive', function(req, res) {
    globalsModel.select_giass_active().then(giass => {
        res.json(giass);  
    })
    .catch(err => {
        res.json({code:500, message:'Error al obtener datos'});  
    });
});


app.listen(3000, function () {
	console.log('Sistema desplegado en PORT: 3000');
});