class Reunion
{

    listaConvocados = [];
    listaAdministradores = [];

    agregarLista = (tipo, data) => {
        if (this[tipo]) {
            const user = this[tipo].find((row) => row.id_convocado_reunion == data.id_convocado_reunion);
            if (!user) {
                this[tipo].push(data);
            } else {
                user.socketId = data.socketId;
            }
        }
    }

    getLista = (tipo) => this[tipo];

}

module.exports = { Reunion }