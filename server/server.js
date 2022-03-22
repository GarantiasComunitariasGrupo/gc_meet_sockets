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
} else if (process.env.NODE_ENV === 'aospina') {
	options.cert = fs.readFileSync('C:\\wamp64\\bin\\apache\\apache2.4.51\\conf\\key\\certificate.crt');
	options.key = fs.readFileSync('C:\\wamp64\\bin\\apache\\apache2.4.51\\conf\\key\\private.key');
} else {
	// options.cert = fs.readFileSync('/home/garcom/certificado/certificate.crt');
	// options.key = fs.readFileSync('/home/garcom/certificado/private.key');
	options.cert = fs.readFileSync('/etc/ssl/certs/ssl-cert-snakeoil.pem');
	options.key = fs.readFileSync('/etc/ssl/private/ssl-cert-snakeoil.key');
}

/**
 * Se crea el servidor
 */
const server = https.createServer(options, app);

/**
 * Se conectan los sockets con el servidor de express
 */
io.listen(server, { cors: { methods: ["GET", "POST", "OPTIONS"], origin: "*" } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const socketReunion = require('./sockets/socket-reunion');
const socketActa = require('./sockets/socket-acta');

app.get('/getSummonedList', (req, res) => {
	try {
		if (!req.query.id_reunion) { console.log(`/getSummonedList: Debe incluir el id de la reunion`); }
		const meeting = socketReunion.reuniones.get(req.query.id_reunion);
		if (!meeting.status) { console.log('La reunión no existe') }
		res.send(JSON.stringify({ status: true, message: meeting.message.getSummonList() }));
	} catch (error) {
		res.send(JSON.stringify({ status: false, message: `/getSummonedList: ${error.message}` }));
	}
});

app.post('/registerMeet', (req, res) => {
	try {
		if (!req.body.id_reunion) { return console.log(`/registerMeet: Debe incluir el id de la reunion`); }
		const meet = socketReunion.reuniones.add(req.body.id_reunion);
		if (!meet.status) { return console.log(meet.message); }
		io.sockets.in('sala-espera').emit('register-emit', meet);
		res.send(JSON.stringify({ status: true, message: 'Reunión iniciada correctamente' }));
	} catch (error) {
		res.send(JSON.stringify({ status: false, message: `/registerMeet: ${error.message}` }));
	}
});

app.get('/getSignList', (req, res) => {
	try {
		if (!req.query.id_reunion) { console.log(`/getSignList: Debe incluir el id de la reunion`); }
		const meeting = socketActa.actaReuniones.get(req.query.id_reunion);
		if (!meeting.status) { console.log('La reunión no existe') }
		res.send(JSON.stringify({ status: true, message: meeting.message.getSignList() }));
	} catch (error) {
		res.send(JSON.stringify({ status: false, message: `/getSignList: ${error.message}` }));
	}
});

server.listen(process.env.PORT, (err) => {
	(err) ? console.log(`Error ${err}`) : null;
	console.log(`Aplicación corriendo por el puerto ${process.env.PORT}`);
});