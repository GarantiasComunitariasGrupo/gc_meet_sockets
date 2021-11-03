const { io } = require('../server');
const { SalaEspera } = require('../classes/sala-espera');

/**
 * Instacia de clase
 */
const salaEspera = new SalaEspera();

/**
 * Sala de espera
 */
const room = 'sala-espera-gcg';

/**
 * Conexión de sockets
 */
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
     * Escucha socket cuando un usuario accede a la sala
     */
    socket.on('salaEspera', (data) => {

        /**
         * Emite socket de la lista de usuarios que han accedido a la sala
         */
        io.to(socket.id).emit('userList', salaEspera.getUsersRoom().map((row) => row.usuario).filter((elmt) => elmt !== data.usuario ));

        /**
         * Se guarda usuario en sala
         */
        salaEspera.addUserRoom({ ...data, id: socket.id }, (id) => {
            if (id) {
                /**
                 * Si ya el usuario habia accedido previamente, se emite socket para cerrar la pestaña anterior
                 */
                io.to(id).emit('sacarUsuario', { exit: true });
            }
        });

        /**
         * Se hace petición a laravel para guardar información del usuario conectado en base de datos
         */
        salaEspera.storeUser(data.dataConvocado);

        /**
         * Se emite socket para informar que el usuario está conectado en la sala
         */
        io.in(room).emit('userStatus', { usuario: data.usuario, state: true });
    });

    /**
     * Escucha socket cuando un usuario abandona la sala
     */
    socket.on('logout', () => disconnectUser(socket.id));

    socket.on('disconnect', () => disconnectUser(socket.id));

    /**
     * Función encargada de eliminar un usuario de la sala cuando este se desconecta y emite socket para informar que dicho usuario salió de la sala
     * 
     * @param {*} idSocket 
     */
    const disconnectUser = (idSocket) => {
        const listado = salaEspera.getUsersRoom();
        const user = listado.findIndex((row) => row.id === idSocket);

        if (user !== -1) {
            salaEspera.setDisconnect(listado[user]);
            io.in(room).emit('userStatus', { usuario: listado[user].usuario, state: false });
            listado.splice(user, 1);
        }
    }

});

