const axios = require('axios');

class Reunion {

    summonList = {};
    adminList = {};

    addAdmin(socketId, idUsuario) {
        if (socketId in this.adminList) { return { status: false, message: 'El administrador ya inició sesión' }; }
        this.adminList[socketId] = { socketId, idUsuario };
        return { status: true, message: idUsuario }
    }

    addSummoned(socketId, idConvocado) {
        if (socketId in this.summonList) { return { status: false, message: 'El convocado ya inició sesión' }; }
        this.summonList[socketId] = { socketId, idConvocado };
        return { status: true, message: idConvocado }
    }

    getSummonList() { return Array.from(new Set(Object.values(this.summonList).map(item => item.idConvocado))); }

    adminRoom(socketId) { return Object.keys(this.adminList).filter(id => id !== socketId); }

    summonedRoom(socketId) { return Object.keys(this.summonList).filter(id => id !== socketId); }

    room(socketId) { return this.adminRoom(socketId).concat(this.summonedRoom(socketId)); }

}

class Reuniones {

    meetings = {};

    /**
     * 
     * @param {string} id 
     */
    add(id) {
        if (id in this.meetings) { return { status: false, message: 'La reunión ya está iniciada' }; }
        this.meetings[id] = new Reunion();
        return { status: true, message: id };
    }

    get(id) {
        if (!(id in this.meetings)) {
            this.add(id); // Comentar esta linea en producción
            // return { status: false, message: 'La reunión no está disponible' }; // Descomentar en producción
        }
        return { status: true, message: this.meetings[id] };
    }

    remove() {
        delete this.meetings[id];
    }

}
module.exports = { Reuniones, Reunion }
