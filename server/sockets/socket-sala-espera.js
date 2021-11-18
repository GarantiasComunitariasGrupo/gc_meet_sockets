const { io, app } = require('../server');
const { SalaEspera } = require('../classes/sala-espera');

const salaEspera = new SalaEspera();
const room = 'sala-espera-gcg';

io.on('connection', (socket) => {

    /**
     * Se crea sala
     */
    socket.room = room;

    /**
     * Se conecta a la sala
     */
    socket.join(room);

    /**
     * Escucha socket cuando se envía SMS para proceso de firma
     */
    socket.on('registro-representante', (data) => {
        /** Se añade usuario a la sala */
        salaEspera.addUserRoom(data, socket.id);
    });

    socket.on('disconnect', () => salaEspera.sacarUsuarioSala('socketId', socket.id));

    /**
     * Recibe url_firma para emitirla al frontend
     */
    app.get('/get-url-firma', (req, res) => {

        /** Valida parámetros requeridos */
        if ('url_firma' in req.query && 'id_convocado_reunion' in req.query) {
            
            /** Busca al usuario en la sala */
            const user = salaEspera.getUserList(req.query.id_convocado_reunion);

            if (user) {
                /** Emite socket al respectivo usuario y le envía la url de la firma */
                io.to(user.socketId).emit('fin-firma', { url: req.query.url_firma });
            }

            /** Respuesta para laravel */
            res.send({
                'ok' : (user) ? true : false,
                'response' : (user) ? user : 'No se encontró usuario'
            });

            salaEspera.sacarUsuarioSala('id_convocado_reunion', req.query.id_convocado_reunion);
            
            socket.disconnect();
        }
    });

});