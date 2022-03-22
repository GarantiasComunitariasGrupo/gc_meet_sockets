class SalaEspera
{
    /**
     * Array para añadir usuarios
     */
    listaSalaEspera = [];

    /**
     * Función encargada de añadir un usuario a la sala cuando se le envíe un SMS
     * @param {} data 
     * @param {*} socketId 
     */
    addUserRoom = (data, socketId) => {
        
        /**Se busca el usuario en la lista */
        const user = this.getUserList(data.idConvocadoReunion);

        if (!user) {
            /** Si no existe, se añade al array */
            this.listaSalaEspera.push({ socketId, id_convocado_reunion: data.idConvocadoReunion });
        } else {
            /** Si existe, se modifica el id del socket */
            user.socketId = socketId;
        }

    }

    /**
     * Función encargada de consultar un usuario en la lista de usuarios
     * @param {*} idConvocadoReunion 
     * @returns  array
     */
    getUserList = (idConvocadoReunion) => {
        return this.listaSalaEspera.find((row) => row.id_convocado_reunion == idConvocadoReunion);
    }

    /**
     * Función encargada de consultar todos los usuarios que están en la sala de espera
     * @returns array
     */
    getListaUsuarios = () => this.listaSalaEspera;

    /**
     * Función encargada de sacar un usuario de la sala
     * 
     * @param {} tipo 
     * @param {*} valor 
     */
    sacarUsuarioSala = (tipo, valor) => {
        this.listaSalaEspera = this.listaSalaEspera.filter((row) => row[tipo] != valor);
    }

}

module.exports = { SalaEspera }