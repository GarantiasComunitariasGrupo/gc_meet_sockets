const { io, app } = require('../server');
const { Reunion } = require('../classes/reunion');

const reunion = new Reunion();

const room = 'reunion-gc';

io.on('connection', (socket) => {

    socket.room = room;

    socket.join(room);

    socket.on('acceso-reunion', (data) => {

        // console.log('tipoAccesoNode', data.tipo_convocado);
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

        console.log(data);
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
    
                    admins.forEach((row) => {
                        io.to(row).emit('datos-votacion', datos);
                        io.to(row).emit('identificacion-voto', {
                            identificacion: data.identificacion,
                            voto: data.voto.votacion
                        });
                    });
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
                    datos.isChild = data.isChild;
                    datos.id_programa = data.id_programa;

                    admins.forEach((row) => {
                        io.to(row).emit('datos-entrada-texto', datos);
                        io.to(row).emit('identificacion-entrada-texto', {
                            identificacion: data.identificacion,
                            voto: data.voto
                        });
                    });
                }

            });

        }

    });

    socket.on('emitir-seleccion-unica', (data) => {
        const admins = reunion.getIdSocketAdmin();
        if (admins) {
            reunion.asignacionVotosSeleccion(data.id_programa, data.isChild, (response) => {
                admins.forEach((row) => {
                    io.to(row).emit('datos-seleccion-unica', response);
                    io.to(row).emit('identificacion-seleccion-unica', {
                        identificacion: data.identificacion,
                        voto: data.voto
                    });
                });
            });
        }
    });

    socket.on('emitir-seleccion-multiple', (data) => {
        const admins = reunion.getIdSocketAdmin();
        if (admins) {
            reunion.asignacionVotosSeleccion(data.id_programa, data.isChild, (response) => {
                admins.forEach((row) => {
                    io.to(row).emit('datos-seleccion-multiple', response);
                    io.to(row).emit('identificacion-seleccion-multiple', {
                        identificacion: data.identificacion,
                        voto: data.voto
                    });
                });
            });
        }
    });

    socket.on('get-cantidad-convocados', () => {
        const admins = reunion.getIdSocketAdmin();
        if (admins) {
            admins.forEach((row) => io.to(row).emit('send-cantidad-convocados', { totalConvocados: reunion.listaConvocados.length }));
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