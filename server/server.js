const express = require('express');
const app = express();
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const io = require("socket.io")();

/**
 * Se define entorno de desarrollo local
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Se define puerto para entorno local
 */
process.env.PORT = process.env.PORT || 3009;

const options = {};

/**
 * Certificados para entorno local
 */
if (process.env.NODE_ENV === 'development') {
	options.cert = fs.readFileSync('C:\\wamp64\\bin\\apache\\apache2.4.41\\conf\\key\\certificate.crt');
	options.key = fs.readFileSync('C:\\wamp64\\bin\\apache\\apache2.4.41\\conf\\key\\private.key');
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
module.exports = { io, app }

require('./sockets/socket-sala-espera');
require('./sockets/socket-reunion');

server.listen(process.env.PORT, (err) => {
	(err) ? console.log(`Error ${err}`) : null;
	console.log(`Aplicación corriendo por el puerto ${process.env.PORT}`);
});