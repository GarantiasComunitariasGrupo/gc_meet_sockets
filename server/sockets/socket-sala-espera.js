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

    socket.on('registro-representante', (data) => {
        salaEspera.addUserRoom(data, socket.id);
    });

    app.get('/get-url-firma', (req, res) => {

        if ('url_firma' in req.query && 'id_convocado_reunion' in req.query) {
            
            const user = salaEspera.getUserList(req.query.id_convocado_reunion);

            if (user) {
                io.to(user.socketId).emit('fin-firma', { url: req.query.url_firma });
            }

            res.send({
                'ok' : (user) ? true : false,
                'response' : (user) ? user : 'No se encontró usuario'
            });

        }
    });

});