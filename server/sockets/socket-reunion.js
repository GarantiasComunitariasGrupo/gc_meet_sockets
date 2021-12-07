const { io, app } = require('../server');
const { Reunion } = require('../classes/reunion');

const reunion = new Reunion();

const room = 'reunion-gc';

io.on('connection', (socket) => {

    socket.room = room;

    socket.join(room);

    socket.on('acceso-reunion', (data) => {

        const tipoAcceso = (data.tipo_convocado === 'Convocado') ? 'listaConvocados' : 'listaAdministradores';

        reunion.agregarLista(tipoAcceso, { ...data, socketId: socket.id });
        reunion.storeUser(data);

        io.in(room).emit('estadoUsuario', { usuario: data });
        io.in(room).emit('listaUsuarios', reunion.getLista(tipoAcceso).map((row) => row.identificacion).filter((row) => row !== data.identificacion));
        
    });

    socket.on('disconnect', () => reunion.sacarUsuario(socket.id));

});