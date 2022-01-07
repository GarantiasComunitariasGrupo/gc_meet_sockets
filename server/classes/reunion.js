const axios = require('axios');

class Reunion
{
    /** Array para almacenar convocados de la reunión */
    listaConvocados = [];
    /** Array para almcenar administradores de la reunión */
    listaAdministradores = [];
    /** Endpoint backend laravel */
    urlAPI = 'http://192.168.2.85:8800/api';

    /**
     * Función encargada de añadir un concovado/administrador a su respectivo array
     * 
     * @param tipo => listaConvocados|listaAdministradores
     * @param data => info del usuario
     */
    agregarLista = (tipo, data, callback) => {
        if (this[tipo]) {
            const user = this[tipo].find((row) => row.id_convocado_reunion == data.id_convocado_reunion);
            if (!user) {
                this[tipo].push(data);
            } else {
                callback(user.socketId);
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

    buscarUsuario = (tipo, campo, value) => {
        if (this[tipo]) {
            const user = this[tipo].find((row) => row[campo] == value);
            return (user) ? user : false;
        }
    }

    guardarDesconexion = (usuario) => {
        axios.post(`${this.urlAPI}/acceso-reunion/actualizar-acceso-reunion`, usuario)
        .then((response) => {
            if (response.status === 200) {
                console.log(response.data);
            }
        }).catch((error) => console.log('error', error));
    }

    getResultadosPrograma = (id_programa, callback) => {
        axios.get(`${this.urlAPI}/acceso-reunion/get-resultados-votacion/${id_programa}`)
        .then((response) => {
            if (response.status === 200) {
                callback(response.data);
            }
        }).catch((error) => console.log('error', error))
    }

    getIdSocketAdmin = () => {
        if (this.listaAdministradores.length > 0) {
            return this.listaAdministradores.map((row) => row.socketId);
        }
    }

    desconectarUsuario = (id_socket, callback) => {

        const listado = this.listaConvocados;
        const user = listado.findIndex((row) => row.socketId == id_socket);

        if (user !== -1) {
            this.guardarDesconexion(listado[user]);
            callback(listado[user]);
            listado.splice(user, 1);
        }

    }

    getOpcionesSeleccion  = (id_padre, callback) => {
        axios.get(`${this.urlAPI}/acceso-reunion/get-opciones-seleccion/${id_padre}`)
        .then((response) => {
            if (response.status === 200) {
                callback(response.data);
            }
        }).catch((error) => console.log('error', error));
    }

    asignacionVotosSeleccion = (id_programa, isChild, callback) => {

        this.getOpcionesSeleccion(id_programa, (response) => {

            if (response.ok) {

                const programas = response.response.map((row) => ({ id: row.id_programa, txt: row.titulo }));

                this.getResultadosPrograma(id_programa, (resultados) => {

                    let datos = {};
                    const valoresResultado = resultados.response.map((row) => JSON.parse(row.descripcion));

                    programas.forEach((row) => {
                        
                        let contador = 0;

                        valoresResultado.forEach((elm) => {
                            const valor = elm.seleccion.filter((col) => +col === +row.id);
                            (valor.length > 0) ? contador++ : null;
                        });

                        row.cantidad = contador;

                    });

                    datos.resultados = programas;
                    datos.isChild = isChild;
                    datos.id_programa = id_programa;

                    callback(datos);
                });

            }
        });

    }

}

module.exports = { Reunion }