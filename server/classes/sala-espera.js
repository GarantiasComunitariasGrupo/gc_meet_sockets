class SalaEspera
{
    listaSalaEspera = [];

    addUserRoom = (data, socketId) => {
        
        const user = this.listaSalaEspera.find((row) => row.id_convocado_reunion == data.idConvocadoReunion);

        if (!user) {
            this.listaSalaEspera.push({ socketId, id_convocado_reunion: data.idConvocadoReunion });
        } else {
            user.socketId = socketId;
        }

    }

    getUserList = (idConvocadoReunion) => {
        return this.listaSalaEspera.find((row) => row.id_convocado_reunion == idConvocadoReunion);
    }

    getListaUsuarios = () => this.listaSalaEspera;

}

module.exports = { SalaEspera }