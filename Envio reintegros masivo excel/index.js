var XLSX = require("xlsx");
const formidable = require('formidable');
const fileUpload = require('express-fileupload');
var express = require('express');
var cors = require('cors');
var app = express();
app.use(fileUpload());
app.use('/static', express.static('public'));
const config = {
    host: '172.16.0.48',
    user: 'redsis9999',
    password: 'nuevo',
    "translate binary": "true",
    trace: 'true',
}
const pool = require('node-jt400').pool(config);
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.post('/upload', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let EDFile = req.files.file
    EDFile.mv(`./excel/xxx.xlsx`, err => {
        if (err) {
            res.json({
                code: 500,
                message: 'errors'
            });
        } else {
            recorrer();
            res.json({
                code: 200,
                message: 'successful'
            });
        }
    })
});

function recorrer() {
    const excel = XLSX.readFile("./excel/xxx.xlsx");
    var nombreHoja = excel.SheetNames;
    let hoja = XLSX.utils.sheet_to_json(excel.Sheets[nombreHoja[0]]);
    console.log(hoja);
    let fechaactual;
    let date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    if (month < 10) {
        fechaactual = `${year}-0${month}-${day}`;
    } else {
        fechaactual = `${year}-0${month}-${day}`;
    }
    let hora = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    let errors = '';
    let success = '';
    for (let item of hoja) {
        var nombre = item['NOMBRE'];
        var area = item['ÁREA OCUPACIONAL'];
        var user = 'NODEJS';
        var num = 2;
        var convenio;
        if (item['convenio'] == null || item['convenio'] == undefined) {
            convenio = null;
        } else {
            convenio = item['convenio'];
        }
        pool.query(`CALL FOSFEC.MATRREININSERTAR(
    ${item['programa']},
    ${item['empresa']},
     ${convenio},
    ${item['capacitacion']},
    ${item['matricula']},
    '${item['descripcion']}',
    ${item['valor']},
    '${item['fecha']}',
    '${user}',
    ?,
    ?
  )`).then(result => {
            console.log('result:');
            console.log(result);
            errors += 'la matricula: ' + item['matricula'] + ' fue procesada como reintegro.<br>';
        }).catch(error => {
            console.log('error');
            console.log(error);
            errors += 'la matricula: ' + item['matricula'] + ' no se pudo procesar como reintegro.<br>';
        });
    }
    return '<h2>Aprobadas: </h2><br>' + success + '<br><h2>Rechazadas: ' + errors;
}
app.listen(3000, function() {
    console.log('Sistema desplegado en PORT: 3000');
});