const express = require('express');
const app = express();
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const io = require("socket.io")();

/**
 * Se define entorno de desarrollo local
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * Se define puerto para entorno local
 */
process.env.PORT = process.env.PORT || 3009;

const options = {};

/**
 * Certificados para entorno local
 */
if (process.env.NODE_ENV === 'dev') {
	options.cert = fs.readFileSync('C:\\xampp\\htdocs\\repotencia\\gcrepotencia\\chat_repotencia\\config\\keys\\certificado.crt');
    options.key = fs.readFileSync('C:\\xampp\\htdocs\\repotencia\\gcrepotencia\\chat_repotencia\\config\\keys\\llave.key');
}

/**
 * Se crea el servidor
 */
const server = https.createServer(options, app);

/**
 * Se conectan los sockets con el servidor de express
 */
io.listen(server, { cors: { methods: ["GET", "POST", "OPTIONS"], origin: "*" } });

/**
 * Ruta de prueba
 */
app.get('/', (req, res) => {
	res.send('Express server on');
});

/**
 * CORS del servidor
 */
app.use(cors());

/**
 * Se exporta io => sockets
 */
module.exports = { io }

require('./sockets/sockets');

server.listen(process.env.PORT, (err) => {
	(err) ? console.log(`Error ${err}`) : null;
    console.log(`Aplicación corriendo por el puerto ${process.env.PORT}`);
});