const { io, app } = require('../server');
const { Reunion } = require('../classes/reunion');

const reunion = new Reunion();

const room = 'reunion-gc';

io.on('connection', (socket) => {

    socket.room = room;

    socket.join(room);

    socket.on('acceso-reunion', (data) => {

        let tipoAcceso = (data.tipo_convocado === 'Convocado') ? 'listaConvocados' : 'listaAdministradores';
        
        if (data.identificacion === '1001') {
            tipoAcceso = 'listaAdministradores';
        }

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

    socket.on('actualizar-votacion', (data) => {
        if (reunion.listaAdministradores.length > 0) {
            let datos = {};
            const admins = reunion.listaAdministradores.map((row) => row.socketId);
            reunion.getResultadosPrograma(data.id_programa, (response) => {
                if (response.ok) {
                    
                    const valores = response.response.map((elm) => JSON.parse(elm.descripcion));

                    datos.total = valores.length;
                    datos.true = valores.filter((elm) => elm.votacion === 'true').length;
                    datos.false = datos.total - datos.true;
                    datos.isChild = data.isChild;
                    datos.id_programa = data.id_programa;

                    admins.forEach((row) => io.to(row).emit('datos-votacion', datos));
                }
            });
        }
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