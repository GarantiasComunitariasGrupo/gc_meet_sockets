const { io, app } = require('../server');
const { ReunionOld } = require('../classes/reunion-old');

const reunion = new ReunionOld();

const room = 'reunion-gc';

io.on('connection', (socket) => {

    socket.room = room;

    socket.join(room);

    /** Socket que escucha cuando un convocado accedió a la sala de reunión */
    socket.on('acceso-reunion', (data) => {

        /** Se obtiene tipo de convocado para saber en cuál array guardar */
        let tipoAcceso = (data.tipo_convocado === 'Convocado') ? 'listaConvocados' : 'listaAdministradores';

        if (data.identificacion === '1001') {
            tipoAcceso = 'listaAdministradores';
        }

        /** Se añade convocado a la sala de reunión */
        reunion.agregarLista(tipoAcceso, { ...data, socketId: socket.id }, (socketId) => {
            if (socketId) {
                /** Si un convocado tiene varias pestañas de la reunión abiertas */
                io.to(socketId).emit('sacar-usuario', { socket: socketId });
            }
        });

        /** Se guarda acceso del convocado en BD */
        reunion.storeUser(data);

        /** Se emite a todos los usuarios de la sala el estado del convocado conectado */
        io.in(room).emit('estado-usuario', { usuario: data, estado: true, flag: true });

        /** Se emite a todos los usuarios de la sala la lista de convocados conectados */
        io.in(room).emit('lista-usuarios', reunion.getLista(tipoAcceso).map((row) => row.identificacion).filter((row) => row !== data.identificacion));
    });

    /** Socket que escucha cuando se avanzó al siguiente programa en la reunión */
    socket.on('avanzar-programa', (data) => {
        io.in(room).emit('avance', { canAdvance: true });
    });

    /** Socket que escucha cuando un convocado registró una respuesta para un programa con tipo: VOTACIÓN */
    socket.on('actualizar-votacion', (data) => {

        /** Se obtiene un array con los socket.id de los administradores de la reunión */
        const admins = reunion.getIdSocketAdmin();

        if (admins) {

            reunion.getResultadosPrograma(data.id_programa, (response) => {

                let datos = {};

                if (response.ok) {

                    const valores = response.response.map((elm) => JSON.parse(elm.descripcion));

                    /** Se construye objeto para generar las estadísticas del programa en cuestión */
                    datos.total = valores.length;
                    datos.true = valores.filter((elm) => elm.votacion === 'true').length;
                    datos.false = datos.total - datos.true;
                    datos.isChild = data.isChild;
                    datos.id_programa = data.id_programa;

                    /** Se iteran los socket.id de los administradores para emitirles la siguiente información */
                    admins.forEach((row) => {
                        /** Se emiten las estadísticas del programa actual */
                        io.to(row).emit('datos-votacion', datos);
                        /** Se emite el voto registrado por un convocado específico */
                        io.to(row).emit('identificacion-voto', {
                            identificacion: data.identificacion,
                            voto: data.voto.votacion
                        });
                    });
                }
            });
        }

    });

    /** Socket que escucha cuando un convocado registró una respuesta para un programa con tipo: ENTRADA DE TEXTO */
    socket.on('actualizar-entrada-texto', (data) => {

        /** Se obtiene un array con los socket.id de los administradores de la reunión */
        const admins = reunion.getIdSocketAdmin();

        if (admins) {

            reunion.getResultadosPrograma(data.id_programa, (response) => {

                let datos = {};

                if (response.ok) {
                    const valores = response.response.map((elm) => JSON.parse(elm.descripcion));

                    /** Se construye objeto para generar las estadísticas del programa en cuestión */
                    datos.total = valores.length;
                    datos.totalConectados = reunion.listaConvocados.length;
                    datos.isChild = data.isChild;
                    datos.id_programa = data.id_programa;

                    /** Se iteran los socket.id de los administradores para emitirles la siguiente información */
                    admins.forEach((row) => {
                        /** Se emiten las estadísticas del programa actual */
                        io.to(row).emit('datos-entrada-texto', datos);
                        /** Se emite el voto registrado por un convocado específico */
                        io.to(row).emit('identificacion-entrada-texto', {
                            identificacion: data.identificacion,
                            voto: data.voto
                        });
                    });
                }

            });

        }

    });

    /** Socket que escucha cuando un convocado registró una respuesta para un programa con tipo: SELECCIÓN ÚNICA */
    socket.on('emitir-seleccion-unica', (data) => {
        /** Se obtiene un array con los socket.id de los administradores de la reunión */
        const admins = reunion.getIdSocketAdmin();
        if (admins) {
            reunion.asignacionVotosSeleccion(data.id_programa, data.isChild, (response) => {
                /** Se iteran los socket.id de los administradores para emitirles la siguiente información */
                admins.forEach((row) => {
                    /** Se emiten las estadísticas del programa actual */
                    io.to(row).emit('datos-seleccion-unica', response);
                    /** Se emite el voto registrado por un convocado específico */
                    io.to(row).emit('identificacion-seleccion-unica', {
                        identificacion: data.identificacion,
                        voto: data.voto
                    });
                });
            });
        }
    });

    /** Socket que escucha cuando un convocado registró una respuesta para un programa con tipo: SELECCIÓN MÚLTIPLE */
    socket.on('emitir-seleccion-multiple', (data) => {
        /** Se obtiene un array con los socket.id de los administradores de la reunión */
        const admins = reunion.getIdSocketAdmin();
        if (admins) {
            reunion.asignacionVotosSeleccion(data.id_programa, data.isChild, (response) => {
                /** Se iteran los socket.id de los administradores para emitirles la siguiente información */
                admins.forEach((row) => {
                    /** Se emiten las estadísticas del programa actual */
                    io.to(row).emit('datos-seleccion-multiple', response);
                    /** Se emite el voto registrado por un convocado específico */
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
            /** Emite cantidad de convocados conectados */
            admins.forEach((row) => io.to(row).emit('send-cantidad-convocados', { totalConvocados: reunion.listaConvocados.length }));
        }
    });

    /** Emite a toda la sala la acción de cerrar reunión. Se ejecuta cuando se cancela/finaliza */
    socket.on('terminar-reunion', (data) => io.in(room).emit('cerrar-reunion', data));

    /** Escucha cuando un usuario se desconecta de la sala */
    socket.on('disconnect', () => {
        reunion.desconectarUsuario(socket.id, (user) => {
            if (user) {
                /** Emite a toda la sala la desconexión de un convocado */
                io.in(room).emit('estado-usuario', { usuario: user, estado: false, flag: false });
            }
        });
    });

});