const { io } = require('../server');
const { ActaReuniones } = require('../classes/acta');
const axios = require('axios');

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

const actaReuniones = new ActaReuniones();

const room = 'acta-reuniones';

/**
 * 
 * @param {string} error 
 */
function hasError(error) {
    console.log(error);
}

/**
 * 
 * @param {any} socket 
 * @param {Meeting<MeetingType>} data 
 * @returns 
 */
function logout(socket, data) {
    delete userList[socket.id];
    if (!data) { return hasError('logout: Los datos de cierre de sesión no son válidos'); }
    if (!data.id_reunion) { return hasError('logout: Los datos de cierre de sesión no son válidos'); }
    const meet = actaReuniones.get(data.id_reunion);
    if (!meet.status) { return hasError(meet.message); }
    if ('id_usuario' in data) {
        const admin = meet.message.removeAdmin(socket.id, data.id_usuario);
        if (!admin.status) { return hasError(admin.message); }
    } else if ('id_convocado_reunion' in data) {
        const summoned = meet.message.removeSummoned(socket.id, data.id_convocado_reunion);
        if (!summoned.status) { return hasError(summoned.message); }
    } else { return hasError('logout-acta: Los datos de cierre de sesión no son válidos'); }
}

userList = {};

io.on('connection', (socket) => {

    socket.room = room;

    socket.join(room);

    socket.on('register-acta', /** @param {string} meetingId */(meetingId) => {
        try {
            if (!meetingId) { return hasError('register-acta: El id de la reunión no es válido'); }
            const meet = actaReuniones.add(meetingId);
            if (!meet.status) { return hasError(meet.message); }
        } catch (error) {
            hasError(`register-acta: ${error.message}`);
        }
    });

    socket.on('login-acta',/** @param {Meeting<MeetingType>} data */(data) => {
        try {
            if (!data) { return hasError('login: Los datos de inicio de sesión no son válidos'); }
            if (!data.id_reunion) { return hasError('login: Los datos de inicio de sesión no son válidos'); }
            const meet = actaReuniones.get(data.id_reunion);
            if (!meet.status) { return hasError(meet.message); }
            if ('id_usuario' in data) {
                const admin = meet.message.addAdmin(socket.id, data.id_usuario);
                if (!admin.status) { return hasError(admin.message); }
            } else if ('id_convocado_reunion' in data) {
                const summoned = meet.message.addSummoned(socket.id, data.id_convocado_reunion);
                if (!summoned.status) { return hasError(summoned.message); }
            } else { return hasError('login-acta: Los datos de inicio de sesión no son válidos'); }
            userList[socket.id] = data;
        } catch (error) {
            hasError(`login-acta: ${error.message}`);
        }
    });

    socket.on('logout-acta',/** @param {Meeting<MeetingType>} data */(data) => {
        try {
            logout(socket, data);
        } catch (error) {
            hasError(`logout-acta: ${error.message}`);
        }
    });

    socket.on('remove-acta',/** @param {Meeting<'Administrador'>} data */(data) => {
        try {
            if (!data) { return hasError('login: Los datos de inicio de sesión no son válidos'); }
            if (!data.id_reunion) { return hasError('login: Los datos de inicio de sesión no son válidos'); }
            const meet = actaReuniones.get(data.id_reunion);
            if (!meet.status) { return hasError(meet.message); }
            socket.emit('remove-acta-emit', true);
            meet.message.room(socket.id).forEach(socketId => {
                socket.to(socketId).emit('remove-acta-emit', true);
            });
            actaReuniones.remove(data.id_reunion);
        } catch (error) {
            hasError(`remove-acta: ${error.message}`);
        }
    });

    socket.on('addSign-acta',/** @param {{ id_reunion: number; sign: string; rol: string; }} data */(data) => {
        try {
            if (!data.sign || !data.id_reunion || !data.rol) { return hasError('addSign-acta: Los datos de la firma no son válidos'); }
            const meet = actaReuniones.get(data.id_reunion);
            if (!meet.status) { return hasError(meet.message); }
            const addSign = meet.message.addSign(socket.id, data.sign, data.rol)
            if (!addSign.status) { return hasError(addSign.message); }
            socket.emit('addSign-acta-emit', addSign.message);
            meet.message.room(socket.id).forEach(socketId => {
                socket.to(socketId).emit('addSign-acta-emit', addSign.message);
            });
        } catch (error) {
            hasError(`addSign-acta: ${error.message}`);
        }
    });

    socket.on('disconnect', () => {
        try {
            const data = userList[socket.id];
            if (!data) { return hasError('disconnect-acta: Usuario no existe'); }
            const meet = actaReuniones.get(data.id_reunion);
            if (!meet.status) { return hasError(meet.message); }
            logout(socket, data);
        } catch (error) {
            hasError(`disconnect-acta: ${error.message}`);
        }
    });

});

module.exports = { actaReuniones };
