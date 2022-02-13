const axios = require('axios');

class Reunion {

    /**
     * @typedef {Object} UniqueSummoned
     * @property {string[]} socketList
     */

    /**
     * @typedef {Object} Summoned
     * @property {string} socketId
     * @property {string} idConvocado
     */

    /**
     * @typedef {Object} Admin
     * @property {string} socketId
     * @property {string} idUsuario
     */

    /**
     * @template T
     * @typedef {Object} Response
     * @property {boolean} status
     * @property {message} T
     */

    /** @type {Record<string, UniqueSummoned>} */
    uniqueSummonList = {};

    /** @type {Record<string, Summoned>} */
    summonList = {};

    /** @type {Record<string, Admin>} */
    adminList = {};

    /**
     * 
     * @param {number} meeting 
     */
    constructor(meeting) {
        this.meeting = meeting;
    }

    /**
     * 
     * @param {string} socketId 
     * @param {string} idUsuario 
     * @returns {Response<string>}
     */
    addAdmin(socketId, idUsuario) {
        try {
            this.adminList[socketId] = { socketId, idUsuario };
            return { status: true, message: idUsuario };
        } catch (error) {
            return { status: false, message: `addAdmin: ${error.message}` }
        }
    }

    /**
     * 
     * @param {string} socketId 
     * @param {string} idConvocado 
     * @returns {Response<string>}
     */
    addSummoned(socketId, idConvocado) {
        try {
            this.summonList[socketId] = { socketId, idConvocado };
            const uniqueSummoned = this.addUniqueSummoned(socketId, idConvocado);
            if (!uniqueSummoned.status) { return uniqueSummoned; }
            return { status: true, message: idConvocado };
        } catch (error) {
            return { status: false, message: `addSummoned: ${error.message}` }
        }
    }

    /**
     * 
     * @param {string} socketId 
     * @param {string} idConvocado 
     * @returns {Response<string>}
     */
    addUniqueSummoned(socketId, idConvocado) {
        try {
            let summoned = this.uniqueSummonList[idConvocado];
            !summoned && (summoned = { socketList: [] });
            summoned.socketList.push(socketId);
            return { status: true, message: idConvocado };
        } catch (error) {
            return { status: false, message: `addUniqueSummoned: ${error.message}` }
        }
    }

    /**
     * 
     * @param {string} socketId 
     * @param {string} idUsuario 
     * @returns {Response<string>}
     */
    removeAdmin(socketId, idUsuario) {
        try {
            delete this.adminList[socketId];
            return { status: true, message: idUsuario };
        } catch (error) {
            return { status: false, message: `removeAdmin: ${error.message}` }
        }
    }

    /**
     * 
     * @param {string} socketId 
     * @param {string} idConvocado 
     * @returns {Response<string>}
     */
    removeSummoned(socketId, idConvocado) {
        try {
            delete this.summonList[socketId];
            const uniqueSummoned = this.removeUniqueSummoned(socketId, idConvocado);
            if (!uniqueSummoned.status) { return uniqueSummoned; }
            return { status: true, message: idConvocado };
        } catch (error) {
            return { status: false, message: `removeSummoned: ${error.message}` }
        }
    }

    /**
     * 
     * @param {string} socketId 
     * @param {string} idConvocado 
     * @returns {Response<string>}
     */
    removeUniqueSummoned(socketId, idConvocado) {
        try {
            let summoned = this.uniqueSummonList[idConvocado];
            const socketIndex = summoned ? summoned.socketList.indexOf(socketId) : -1;
            socketIndex !== -1 && summoned.socketList.splice(socketIndex, 1);
            summoned && !summoned.socketList.length && (delete this.uniqueSummonList[idConvocado]);
            return { status: true, message: idConvocado };
        } catch (error) {
            return { status: false, message: `removeSummoned: ${error.message}` }
        }
    }

    /**
     * 
     * @returns {string[]}
     */
    getSummonList() { return Array.from(new Set(Object.values(this.summonList).map(item => item.idConvocado))); }

    /**
     * 
     * @param {string} socketId 
     * @returns {string[]}
     */
    adminRoom(socketId) { return Object.keys(this.adminList).filter(id => id !== socketId); }

    /**
     * 
     * @param {string} socketId 
     * @returns {string[]}
     */
    summonedRoom(socketId) { return Object.keys(this.summonList).filter(id => id !== socketId); }

    /**
     * 
     * @param {string} socketId 
     * @returns {string[]}
     */
    room(socketId) { return this.adminRoom(socketId).concat(this.summonedRoom(socketId)); }

}

class Reuniones {

    meetings = {};

    /**
     * 
     * @param {string} id 
     */
    add(id) {
        if (id in this.meetings) { return { status: true, message: id }; }
        this.meetings[id] = new Reunion(id);
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
