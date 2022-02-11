const { io, app } = require('../server');
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

function error(error) {
    console.log(error);
}

io.on('connection', (socket) => {

    socket.room = room;

    socket.join(room);

    socket.on('register', (meetingId) => {
        console.log(34, meetingId);
        if (!meetingId) { return error('El id de la reunión no es válido'); }
        const meet = reuniones.add(meetingId);
        console.log(37, meet);
        if (!meet.status) { return error(meet.message); }
        // socket.emit('register-emit', meet.message); // No se a quien emitirle
    });

    socket.on('login',/** @param {Meeting<MeetingType>} data */(data) => {
        console.log(43, data);
        if (!data) { return error('Los datos de inicio de sesión no son válidos'); }
        if (!data.id_reunion) { return error('Los datos de inicio de sesión no son válidos'); }
        const meet = reuniones.get(data.id_reunion);
        console.log(47, meet);
        if (!meet.status) { return error(meet.message); }
        if ('id_usuario' in data) {
            const admin = meet.message.addAdmin(socket.id, data.id_usuario);
            console.log(51, admin);
            if (!admin.status) { return error(admin.message); }
        } else if ('id_convocado_reunion' in data) {
            const summoned = meet.message.addSummoned(socket.id, data.id_convocado_reunion);
            console.log(55, summoned);
            if (!summoned.status) { return error(summoned.message); }
            socket.emit('login-emit', summoned.message);
            meet.message.room(socket.id).forEach(socketId => {
                socket.to(socketId).emit('login-emit', summoned.message);
            });
        } else { return error('Los datos de inicio de sesión no son válidos'); }
    });

});

module.exports = { reuniones };
