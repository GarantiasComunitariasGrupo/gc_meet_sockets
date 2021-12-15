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

        const admins = reunion.getIdSocketAdmin();

        if (admins) {

            reunion.getResultadosPrograma(data.id_programa, (response) => {

                let datos = {};
    
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

    socket.on('actualizar-entrada-texto', (data) => {

        const admins = reunion.getIdSocketAdmin();

        if (admins) {

            reunion.getResultadosPrograma(data.id_programa, (response) => {

                let datos = {};

                if (response.ok) {

                    const valores = response.response.map((elm) => JSON.parse(elm.descripcion));
                    
                    datos.total = valores.length;
                    datos.totalConectados = reunion.listaConvocados.length;

                    admins.forEach((row) => io.to(row).emit('datos-entrada-texto', datos));
                }

            });

        }

    });

    socket.on('disconnect', () => {
        reunion.desconectarUsuario(socket.id, (user) => {
            if (user) {
                io.in(room).emit('estado-usuario', { usuario: user, estado: false, flag: false });
            }
        });
    });

});