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


app.post('/upload',(req,res) => {
    let EDFile = req.files.file
    EDFile.mv(`./excel/CLASIFICACION_DE_OCUPACIONES.xlsx`,err => {
        if(err) return res.status(500).send({ message : err })

        return res.status(200).send({ message : 'File upload'})
    })
})


app.get('/llenar', function(req, res) {
    globalsModel.truncate_table('areas_ocupacionales');
	globalsModel.truncate_table('grupo_denominaciones');
	const excel = XLSX.readFile(
		"./excel/CLASIFICACION_DE_OCUPACIONES.xlsx"
	);
	var nombreHoja = excel.SheetNames;
	let hoja1 = XLSX.utils.sheet_to_json(excel.Sheets[nombreHoja[0]]);
	for (let item of hoja1){
		var nombre = item['NOMBRE'];
		var area = item['ÁREA OCUPACIONAL'];
		globalsModel.insert_areas(area,nombre);
	}
	let hoja2 = XLSX.utils.sheet_to_json(excel.Sheets[nombreHoja[1]]);
	for (let key of hoja2){
		var denominacion = key['DENOMINACIÓN'];
		var codigo = key['CÓDIGO SUBGRUPO'];
		var grupo = key['GRUPO OCUPACIONAL'];
		var subgrupo = key['SUBGRUPO'];
		var area = key['ÁREA OCUPACIONAL'];
		globalsModel.insert_denominacion(area, grupo,codigo,subgrupo,denominacion);
	}
	res.json({code:200, message:'successful'});
});

app.get('/extraerDenominaciones', function(req, res) {
    globalsModel.select_denominaciones().then(denotaciones => {
          res.json(denotaciones);  
    })
    .catch(err => {
        res.json({code:500, message:'Error al obtener datos'});  
    });
});

app.get('/extraerArea/:id', function(req, res) {
    globalsModel.select_areas(req.params.id).then(area => {
          res.json(area);  
    })
    .catch(err => {
        res.json({code:500, message:'Error al obtener datos'});  
    });
});

app.listen(3890, function () {
	console.log('Sistema desplegado en PORT: 3890');
});