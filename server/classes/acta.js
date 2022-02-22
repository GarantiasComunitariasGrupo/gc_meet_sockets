class Acta {

    /**
     * @typedef {Object} Summoned
     * @property {string} socketId
     * @property {string} idConvocado
     * @property {{ rol: string; path: string; } | undefined} sign
     * @property {boolean} on
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
            return { status: false, message: `addAdmin-acta: ${error.message}` }
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
            this.summonList[socketId] = { socketId, idConvocado, sign: undefined, on: true };
            return { status: true, message: idConvocado };
        } catch (error) {
            return { status: false, message: `addSummoned-acta: ${error.message}` }
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
            return { status: false, message: `removeAdmin-acta: ${error.message}` }
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
            const summoned = this.summonList[socketId];
            if (!summoned) { return { status: false, message: 'removeSummoned-acta: Convocado no encontrado' }; }
            summoned.on = false;
            if (!summoned.sign) { delete this.summonList[socketId]; } // Solo lo elimina si no tiene firma
            return { status: true, message: idConvocado };
        } catch (error) {
            return { status: false, message: `removeSummoned-acta: ${error.message}` }
        }
    }

    addSign(socketId, path, rol) {
        try {
            const summoned = this.summonList[socketId];
            if (!summoned) { return { status: false, message: 'addSign-acta: Convocado no encontrado' }; }
            summoned.sign = { rol, path };
            return { status: true, message: summoned.sign };
        } catch (error) {
            return { status: false, message: `addSign-acta: ${error.message}` }
        }
    }

    /**
     * 
     * @returns {{ rol: string; path: string; }[]}
     */
    getSignList() { return Object.values(this.summonList).map(summon => summon.sign).filter(sign => sign); }

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
    summonedRoom(socketId) { return Object.keys(this.summonList).filter(id => id !== socketId && this.summonList[id].on); }

    /**
     * 
     * @param {string} socketId 
     * @returns {string[]}
     */
    room(socketId) { return this.adminRoom(socketId).concat(this.summonedRoom(socketId)); }

}

class ActaReuniones {

    meetings = {};

    /**
     * 
     * @param {string} id 
     */
    add(id) {
        if (id in this.meetings) { return { status: true, message: id }; }
        this.meetings[id] = new Acta(id);
        return { status: true, message: id };
    }

    /**
     * 
     * @param {string} id 
     */
    get(id) {
        if (!(id in this.meetings)) { this.add(id); }
        return { status: true, message: this.meetings[id] };
    }

    /**
     * 
     * @param {string} id 
     */
    remove(id) {
        delete this.meetings[id];
    }

}

module.exports = { ActaReuniones, Acta }
