const { io, app } = require('../server');
const { Reunion } = require('../classes/reunion');

const reunion = new Reunion();

const room = 'reunion-gc';

io.on('connection', (socket) => {

    socket.room = room;

    socket.join(room);

    socket.on('acceso-reunion', (data) => {

        const tipoAcceso = (data.tipo_convocado === 'Convocado') ? 'listaConvocados' : 'listaAdministradores';

        reunion.agregarLista(tipoAcceso, { ...data, socketId: socket.id }, (socketId) => {
            if (socketId) {
                io.to(socketId).emit('sacar-usuario', { socket: socketId });
            }
        });
        reunion.storeUser(data);

        io.in(room).emit('estado-usuario', { usuario: data, estado: true, flag: true });
        io.in(room).emit('lista-usuarios', reunion.getLista(tipoAcceso).map((row) => row.identificacion).filter((row) => row !== data.identificacion));
        
    });

    socket.on('avanzar-programa', (data) => {
        io.in(room).emit('avance', { canAdvance: true });
    });

    socket.on('disconnect', () => desconectarUsuario(socket.id));

    const desconectarUsuario = (id_socket) => {
        const listado = reunion.getLista('listaConvocados');
        const user = listado.findIndex((row) => row.socketId == id_socket);

        if (user !== -1) {
            reunion.guardarDesconexion(listado[user]);
            io.in(room).emit('estado-usuario', { usuario: listado[user], estado: false, flag: false });
            listado.splice(user, 1);
        }
    }

});