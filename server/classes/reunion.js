const axios = require('axios');

class Reunion
{
    listaConvocados = [];
    listaAdministradores = [];
    urlAPI = 'http://192.168.2.85:8800/api';

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

    sacarUsuario = (socket_id) => {
        this.listaConvocados = this.listaConvocados.filter((row) => row.socketId != socket_id);
        this.listaAdministradores = this.listaAdministradores.filter((row) => row.socketId != socket_id);
    }

    getLista = (tipo) => this[tipo];

    storeUser = (data) => {
        axios.post(`${this.urlAPI}/acceso-reunion/guardar-acceso-reunion`, data)
        .then((response) => {
            if (response.status === 200) {
                console.log(response.data);
            }
        }).catch((error) => console.log('error', error));
    }

}

module.exports = { Reunion }