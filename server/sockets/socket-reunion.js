const { io } = require('../server');
const { Reuniones } = require('../classes/reunion');

// @ts-check

/** @typedef {'Administrador' | 'Convocado'} MeetingType */

/** 
 * @template T
 * @typedef {Object} Meeting
 * @property {T extends 'Convocado' ? number : never} id_convocado_reunion
 * @property {T extends 'Convocado' ? string : never} identificacion
 * @property {T extends 'Convocado' ? number[] : never} convocatoria
 * @property {T extends 'Administrador' ? string : never} id_usuario
 * @property {?number} id_reunion
 * @property {number} expiration
 */

const reuniones = new Reuniones();

const room = 'reuniones';

function hasError(error) {
    console.log(error);
}

function logout(socket, data) {
    delete userList[socket.id];
    if (!data) { return hasError('Los datos de cierre de sesión no son válidos'); }
    if (!data.id_reunion) { return hasError('Los datos de cierre de sesión no son válidos'); }
    const meet = reuniones.get(data.id_reunion);
    if (!meet.status) { return hasError(meet.message); }
    if ('id_usuario' in data) {
        const admin = meet.message.removeAdmin(socket.id, data.id_usuario);
        if (!admin.status) { return hasError(admin.message); }
    } else if ('id_convocado_reunion' in data) {
        const summoned = meet.message.removeSummoned(socket.id, data.id_convocado_reunion);
        if (!summoned.status) { return hasError(summoned.message); }
        socket.emit('logout-emit', summoned.message);
        meet.message.room().forEach(socketId => {
            socket.to(socketId).emit('logout-emit', summoned.message);
        });
    } else { return hasError('Los datos de cierre de sesión no son válidos'); }
}

userList = {};

io.on('connection', (socket) => {

    socket.room = room;

    socket.join(room);

    socket.on('register', (meetingId) => {
        try {
            if (!meetingId) { return hasError('El id de la reunión no es válido'); }
            const meet = reuniones.add(meetingId);
            if (!meet.status) { return hasError(meet.message); }
            socket.emit('register-emit', meet.message);
        } catch (error) {
            hasError(`register: ${error.message}`);
        }
    });

    socket.on('login',/** @param {Meeting<MeetingType>} data */(data) => {
        try {
            if (!data) { return hasError('Los datos de inicio de sesión no son válidos'); }
            if (!data.id_reunion) { return hasError('Los datos de inicio de sesión no son válidos'); }
            const meet = reuniones.get(data.id_reunion);
            if (!meet.status) { return hasError(meet.message); }
            if ('id_usuario' in data) {
                const admin = meet.message.addAdmin(socket.id, data.id_usuario);
                if (!admin.status) { return hasError(admin.message); }
            } else if ('id_convocado_reunion' in data) {
                const summoned = meet.message.addSummoned(socket.id, data.id_convocado_reunion);
                if (!summoned.status) { return hasError(summoned.message); }
                socket.emit('login-emit', summoned.message);
                meet.message.room().forEach(socketId => {
                    socket.to(socketId).emit('login-emit', summoned.message);
                });
            } else { return hasError('Los datos de inicio de sesión no son válidos'); }
            userList[socket.id] = data;
        } catch (error) {
            hasError(`login: ${error.message}`);
        }
    });

    socket.on('logout',/** @param {Meeting<MeetingType>} data */(data) => {
        try {
            logout(socket, data);
        } catch (error) {
            hasError(`logout: ${error.message}`);
        }
    });

    socket.on('disconnect',/** @param {Meeting<MeetingType>} data */() => {
        try {
            const data = userList[socket.id];
            if (!data) { return hasError('disconnect: Usuario no existe'); }
            const meet = reuniones.get(data.id_reunion);
            if (!meet.status) { return hasError(meet.message); }
            logout(socket, data);
        } catch (error) {
            hasError(`disconnect: ${error.message}`);
        }
    });

});

module.exports = { reuniones };
